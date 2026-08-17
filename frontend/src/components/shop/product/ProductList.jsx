// src/components/shop/product/ProductList.jsx
import ProductCard from "./ProductCard"; 

export default function ProductList({ products }) {
  // Kiểm tra an toàn: Nếu products chưa có dữ liệu, hiển thị thông báo tạm thời
  if (!products || products.length === 0) {
    return <div className="text-white text-center p-10">Đang tải danh sách sản phẩm...</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}