"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProductDetail({ product }) {
    const router = useRouter();
    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://127.0.0.1:8000/storage/";

    if (!product) return <div className="text-center p-10 text-gray-500">Đang tải sản phẩm...</div>;

    // 1. Xử lý ảnh chính
    const mainImage = product.image?.startsWith("http")
        ? product.image
        : `${imageBaseUrl}${product.image}`;

    // 2. Xử lý mảng gallery nhiều ảnh
    let gallery = [];
    if (Array.isArray(product.images)) {
        gallery = product.images;
    } else if (typeof product.images === "string") {
        try {
            gallery = JSON.parse(product.images);
        } catch (e) {
            gallery = [];
        }
    }

    const allImages = [
        mainImage,
        ...gallery.map((img) => (img.startsWith("http") ? img : `${imageBaseUrl}${img}`))
    ];

    // State chọn ảnh & số lượng & size
    const [selectedImage, setSelectedImage] = useState(mainImage);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState("M");

    // Tính % giảm giá
    const isOnSale = product.sale_price > 0 && product.sale_price < product.price;
    const discountPercent = isOnSale
        ? Math.round(((product.price - product.sale_price) / product.price) * 100)
        : 0;

    // 3. Logic giữ nguyên từ code gốc của bạn (Có tính thêm số lượng khách chọn)
    const handleAddToCart = (redirect = true) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existingItemIndex = cart.findIndex((item) => item.id === product.id);

        if (existingItemIndex > -1) {
            cart[existingItemIndex].qty += quantity;
        } else {
            cart.push({
                id: product.id,
                product_name: product.product_name,
                price: product.price,
                sale_price: product.sale_price,
                image: product.image, // Chỉ lưu path gốc
                qty: quantity,
                size: selectedSize,
            });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        if (redirect) {
            alert("Thêm vào giỏ hàng thành công!");
            window.location.href = "/cart";
        }
    };

    const handleBuyNow = () => {
        handleAddToCart(false);
        window.location.href = "/checkout";
    };

    return (
        <div className="bg-gray-100 min-h-screen py-8 text-gray-800">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* ================= KHỐI 1: KHUNG ẢNH & THÔNG TIN MUA HÀNG ================= */}
                <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-12 gap-8 mb-6">
                    
                    {/* CỘT TRÁI: Gallery Ảnh (5 Cột) */}
                    <div className="md:col-span-5">
                        <div className="relative w-full h-[400px] border border-gray-200 rounded-lg overflow-hidden mb-4 bg-gray-50">
                            <Image
                                src={selectedImage}
                                alt={product.product_name}
                                fill
                                className="object-cover"
                                unoptimized
                                priority
                            />
                            {isOnSale && (
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded">
                                    GIẢM {discountPercent}%
                                </span>
                            )}
                        </div>

                        {/* List ảnh nhỏ (Thumbnails) */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`relative w-16 h-16 border-2 rounded-md overflow-hidden flex-shrink-0 transition ${
                                        selectedImage === img
                                            ? "border-red-500 scale-95"
                                            : "border-gray-200 opacity-70 hover:opacity-100"
                                    }`}
                                >
                                    <Image src={img} alt="thumb" fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CỘT PHẢI: Tên, Giá, Size, Số lượng & Nút bấm (7 Cột) */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                                {product.product_name}
                            </h1>

                            <div className="flex items-center gap-4 text-sm mb-4">
                                <span className="text-amber-500 font-bold">4.9 ★★★★★</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">{product.views || 0} Lượt xem</span>
                                <span className="text-gray-300">|</span>
                                <span className="text-gray-500">Kho còn: {product.qty || 0}</span>
                            </div>

                            {/* Block Giá */}
                            <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 mb-6">
                                {product.sale_price > 0 ? (
                                    <>
                                        <span className="text-3xl font-bold text-red-600">
                                            {Number(product.sale_price).toLocaleString()}đ
                                        </span>
                                        <span className="text-sm text-gray-400 line-through">
                                            {Number(product.price).toLocaleString()}đ
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-3xl font-bold text-red-600">
                                        {Number(product.price).toLocaleString()}đ
                                    </span>
                                )}
                            </div>

                            {/* Tùy chọn Kích thước */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Kích thước (Size):
                                </label>
                                <div className="flex gap-3">
                                    {["S", "M", "L", "XL"].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 border text-sm font-medium rounded-md transition ${
                                                selectedSize === size
                                                    ? "border-red-600 text-red-600 bg-red-50"
                                                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Tùy chọn Số lượng */}
                            <div className="flex items-center gap-4 mb-6">
                                <label className="text-sm font-semibold text-gray-700">Số lượng:</label>
                                <div className="flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="px-4 py-1 font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nút thao tác */}
                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => handleAddToCart(true)}
                                className="flex-1 bg-red-50 text-red-600 border border-red-500 py-3.5 rounded-lg font-bold hover:bg-red-100 transition shadow-sm uppercase"
                            >
                                Thêm Vào Giỏ Hàng
                            </button>
                            <button
                                onClick={handleBuyNow}
                                className="flex-1 bg-red-600 text-white py-3.5 rounded-lg font-bold hover:bg-red-700 transition shadow-md uppercase"
                            >
                                Mua Ngay
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= KHỐI 2: CHI TIẾT SẢN PHẨM ================= */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-md mb-4 border-l-4 border-red-600">
                        CHI TIẾT SẢN PHẨM
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-700 px-3">
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Danh Mục:</span>
                            <span className="font-medium text-gray-800">
                                {product.category?.category_name || "Thời trang"}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Thương hiệu:</span>
                            <span className="font-medium text-gray-800">
                                {product.brand?.brand_name || "Chưa cập nhật"}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Chất liệu:</span>
                            <span className="font-medium text-gray-800">
                                {product.material || "Cotton cao cấp"}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Xuất xứ:</span>
                            <span className="font-medium text-gray-800">
                                {product.origin || "Việt Nam"}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Phong cách:</span>
                            <span className="font-medium text-gray-800">
                                {product.style || "Hiện đại / Hàn Quốc"}
                            </span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-400 w-36 flex-shrink-0">Gửi từ:</span>
                            <span className="font-medium text-gray-800">Ninh Bình</span>
                        </div>
                    </div>
                </div>
                {/* ================= KHỐI 2.5: HƯỚNG DẪN CHỌN SIZE (SHOPEE) ================= */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-md mb-4 border-l-4 border-red-600">
                        HƯỚNG DẪN CHỌN SIZE
                    </h2>
                    <p className="text-xs text-gray-500 mb-3 px-3">Bảng quy đổi kích thước tham khảo (Cân nặng & Chiều cao):</p>
                    
                    <div className="overflow-x-auto px-3">
                        <table className="w-full text-sm text-center border-collapse border border-gray-200">
                            <thead>
                                <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                                    <th className="py-2.5 px-4 border-r border-gray-200">Size (Quốc Tế)</th>
                                    <th className="py-2.5 px-4 border-r border-gray-200">Cân nặng mẫu (kg)</th>
                                    <th className="py-2.5 px-4">Chiều cao mẫu (cm)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-gray-600">
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="py-2.5 px-4 font-bold text-gray-800 border-r border-gray-200">S</td>
                                    <td className="py-2.5 px-4 border-r border-gray-200">40 - 48 kg</td>
                                    <td className="py-2.5 px-4">150 - 160 cm</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="py-2.5 px-4 font-bold text-gray-800 border-r border-gray-200">M</td>
                                    <td className="py-2.5 px-4 border-r border-gray-200">48 - 55 kg</td>
                                    <td className="py-2.5 px-4">160 - 165 cm</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="py-2.5 px-4 font-bold text-gray-800 border-r border-gray-200">L</td>
                                    <td className="py-2.5 px-4 border-r border-gray-200">55 - 65 kg</td>
                                    <td className="py-2.5 px-4">165 - 170 cm</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition">
                                    <td className="py-2.5 px-4 font-bold text-gray-800 border-r border-gray-200">XL</td>
                                    <td className="py-2.5 px-4 border-r border-gray-200">65 - 78 kg</td>
                                    <td className="py-2.5 px-4">170 - 178 cm</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 px-3 italic">* Số đo thực tế có thể chênh lệch 1-2 cm tùy chất liệu vải.</p>
                </div>

                {/* ================= KHỐI 3: MÔ TẢ SẢN PHẨM ================= */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-md mb-4 border-l-4 border-red-600">
                        MÔ TẢ SẢN PHẨM
                    </h2>
                    <div className="text-sm text-gray-700 leading-relaxed px-3 whitespace-pre-line">
                        {product.description || "Chưa có bài viết mô tả cho sản phẩm này."}
                    </div>
                </div>

            </div>
        </div>
    );
}