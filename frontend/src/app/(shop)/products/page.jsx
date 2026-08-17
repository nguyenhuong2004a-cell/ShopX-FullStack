"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductList from "@/components/shop/product/ProductList";
import { getAllProducts, getProductsByPage, getTotalPages } from "@/services/productSevices";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState([]); 
  const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sau khi lọc
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 8;

  // 1. Lấy tham số tìm kiếm từ URL
  const query = searchParams.get("search")?.toLowerCase() || "";
  const brandId = searchParams.get("brand") || "";

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getAllProducts();
        
        // 🟢 BÓC TÁCH MẢNG AN TOÀN: Hỗ trợ mọi kiểu dữ liệu Laravel trả về
        if (Array.isArray(res)) {
          setAllProducts(res);
        } else if (res && Array.isArray(res.data)) {
          setAllProducts(res.data);
        } else if (res && Array.isArray(res.products)) {
          setAllProducts(res.products);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error("Lỗi lấy danh sách sản phẩm:", err);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 2. Logic lọc sản phẩm: Chạy mỗi khi allProducts hoặc tham số URL thay đổi
  useEffect(() => {
    let result = Array.isArray(allProducts) ? [...allProducts] : [];

    // Lọc theo tên sản phẩm (Hỗ trợ cả key product_name và name)
    if (query) {
      result = result.filter((p) => {
        const productName = p.product_name || p.name || "";
        return productName.toLowerCase().includes(query);
      });
    }

    // Lọc theo Brand ID
    if (brandId) {
      result = result.filter((p) => {
        const pBrandId = p.brand_id || p.brand?.id;
        return String(pBrandId) === String(brandId);
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset về trang 1 mỗi khi lọc
  }, [allProducts, query, brandId]);

  // 3. Tính toán phân trang dựa trên danh sách ĐÃ LỌC
  const currentItems = getProductsByPage(filteredProducts, currentPage, perPage);
  const totalPages = getTotalPages(filteredProducts, perPage);

  if (loading) return <div className="text-center p-10 text-white">Đang tải...</div>;

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          {query || brandId ? `Kết quả lọc (${filteredProducts.length})` : "Tất cả sản phẩm"}
        </h1>
      </div>
      
      {filteredProducts.length > 0 ? (
        <ProductList products={currentItems} />
      ) : (
        <div className="text-center text-gray-400 py-20">Không tìm thấy sản phẩm nào phù hợp.</div>
      )}

      {/* Thanh điều hướng phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10 pb-10">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-30 hover:bg-gray-700 transition"
          >
            Trước
          </button>

          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`w-10 h-10 rounded transition ${
                  currentPage === index + 1 
                  ? "bg-red-600 text-white font-bold" 
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-30 hover:bg-gray-700 transition"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}

// 4. Bọc trong Suspense để tránh lỗi "useSearchParams() should be wrapped in a suspense boundary"
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center p-10 text-white">Đang tải trang...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
}