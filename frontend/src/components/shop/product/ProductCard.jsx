import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product }) {
  // Lấy URL cơ sở từ biến môi trường
  const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://127.0.0.1:8000/storage/";

  // Kiểm tra nếu product.image đã có http hoặc cần nối thêm domain Backend
  const displayImage = product.image?.startsWith("http")
    ? product.image
    : `${imageBaseUrl}${product.image}`;

  // 1. Sửa lại điều kiện Sale linh hoạt: Chỉ cần có sale_price > 0 và nhỏ hơn giá gốc
  const isSale = Number(product?.sale_price) > 0 && Number(product?.sale_price) < Number(product?.price);

  // 2. Tính phần trăm giảm giá (%)
  const discountPercent = isSale
    ? Math.round(((Number(product.price) - Number(product.sale_price)) / Number(product.price)) * 100)
    : 0;

  return (
    <Link 
      href={`/products/${product.slug}`} 
      className="bg-white p-4 rounded shadow block hover:shadow-lg transition-shadow relative group"
    >
      <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
        <Image
          src={displayImage}
          alt={product.product_name}
          fill
          className="object-cover group-hover:scale-105 transition duration-300"
          unoptimized 
        />
        
        {/* Nhãn hiển thị % Giảm giá ở góc ảnh */}
        {isSale && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">
            -{discountPercent}%
          </span>
        )}
      </div>

      <h4 className="font-semibold text-gray-800 line-clamp-1">{product.product_name}</h4>
      
      <div className="mt-2">
        {isSale ? (
          <div className="flex items-baseline gap-2">
            {/* Giá Sale (Giá mới) */}
            <p className="text-red-600 font-bold text-base">
              {Number(product.sale_price).toLocaleString('vi-VN')} VNĐ
            </p>
            {/* Giá Gốc (Bị gạch ngang) */}
            <p className="text-gray-400 text-xs line-through">
              {Number(product.price).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
        ) : (
          /* Giá gốc bình thường khi không Sale */
          <p className="text-red-600 font-bold text-base">
            {Number(product.price).toLocaleString('vi-VN')} VNĐ
          </p>
        )}
      </div>
    </Link>
  );
}