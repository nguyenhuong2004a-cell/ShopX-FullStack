"use client";

import { useEffect, useState } from "react";
import AdminTable from "@/components/admin/table/AdminTable";
import { getAllProducts, getProductsByPage, getTotalPages } from "@/services/productSevices";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function AdminProducts() {
    const router = useRouter();
    const [allProducts, setAllProducts] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const perPage = 10; 

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000/storage/";

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const res = await getAllProducts();
                const data = Array.isArray(res) ? res : (res.data || []);
                setAllProducts(data);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách sản phẩm:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleEdit = (product) => {
        router.push(`/admin/products/${product.id}`); 
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
            const token = Cookies.get("admin_token");
            try {
                const res = await fetch(`http://localhost:8000/api/products/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    }
                });

                if (res.ok) {
                    alert("Xóa thành công!");
                    setAllProducts(allProducts.filter(p => p.id !== id));
                } else {
                    alert("Không thể xóa sản phẩm này!");
                }
            } catch (error) {
                console.error("Lỗi xóa:", error);
            }
        }
    };

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = allProducts.filter((p) =>
        p.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const currentItems = getProductsByPage(filteredProducts, currentPage, perPage);
    const totalPages = getTotalPages(filteredProducts, perPage);

    // Danh sách cột hiển thị trên bảng Admin (đã bổ sung Tồn kho)
    const columns = [
        { key: "id", label: "ID" },
        { key: "image", label: "Hình ảnh" },
        { key: "product_name", label: "Tên sản phẩm" },
        { key: "price_display", label: "Giá bán" },
        { key: "category", label: "Danh mục" },
        { key: "stock_display", label: "Tồn kho" },
    ];

    const formattedData = currentItems.map((item) => {
        // Xử lý link ảnh
        const imgUrl = item.image 
            ? (item.image.startsWith("http") ? item.image : `${imageBaseUrl}${item.image}`) 
            : "/no-image.png";

        return {
            id: item.id,
            image: (
                <img 
                    src={imgUrl} 
                    alt={item.product_name}
                    className="w-12 h-12 object-cover rounded-md border"
                />
            ),
            product_name: item.product_name || "Chưa có tên", 
            price_display: (
                <div>
                    {item.sale_price > 0 ? (
                        <>
                            <div className="text-red-600 font-bold">{new Intl.NumberFormat('vi-VN').format(item.sale_price)} đ</div>
                            <div className="text-gray-400 line-through text-xs">{new Intl.NumberFormat('vi-VN').format(item.price)} đ</div>
                        </>
                    ) : (
                        <div className="text-black">{new Intl.NumberFormat('vi-VN').format(item.price)} đ</div>
                    )}
                </div>
            ),
            category: item.category?.category_name || item.category_name || `ID: ${item.cat_id}`,
            
            // Hiển thị trạng thái Tồn kho
            stock_display: (
                <div>
                    {item.qty > 0 ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Còn {item.qty}
                        </span>
                    ) : (
                        <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Hết hàng
                        </span>
                    )}
                </div>
            ),
        };
    });

    if (loading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu admin...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Trang quản lý sản phẩm</h1>
            
            {/* Thanh công cụ: Thêm nút & Ô tìm kiếm */}
            <div className="flex justify-between items-center mb-6">
                <Link 
                    href="/admin/products/create" 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-medium shadow-sm"
                >
                    + Thêm sản phẩm mới
                </Link>

                <input
                    type="text"
                    placeholder="Tìm tên sản phẩm..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset về trang 1 khi gõ tìm kiếm
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-sm text-black w-64"
                />
            </div>
            
            <AdminTable 
                columns={columns} 
                data={formattedData} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />

            {/* Điều hướng phân trang */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        ←
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => (
                        <button
                            key={index + 1}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 border rounded shadow-sm transition ${
                                currentPage === index + 1 
                                ? "bg-blue-600 text-white border-blue-600" 
                                : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border rounded shadow-sm disabled:opacity-50 hover:bg-gray-50 transition"
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}