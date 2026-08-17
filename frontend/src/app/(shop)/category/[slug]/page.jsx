"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getProductsByCategory } from "@/services/productSevices"; // Kiểm tra đúng tên file Sevices/Services của bạn

export default function CategoryPage() {
    const { slug } = useParams(); 
    const [products, setProducts] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://127.0.0.1:8000/storage/";

    useEffect(() => {
        async function fetchProducts() {
            if (!slug) return;
            setLoading(true);
            try {
                // CHÚ Ý: Code gọi API phải nằm TRONG hàm fetchProducts này
                const res = await getProductsByCategory(slug);
                
                console.log("Dữ liệu nhận được tại Page:", res); 

                if (res && res.data) {
                    setProducts(res.data); 
                    setCategoryName(res.category?.category_name || "Danh mục");
                } else {
                    setProducts([]);
                }
            } catch (error) {
                console.error("Lỗi lấy sản phẩm:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        }
        
        fetchProducts();
    }, [slug]);

    if (loading) return <div className="text-center py-20 text-white bg-[#1a1a1a] min-h-screen">Đang tải sản phẩm...</div>;

    return (
        <div className="container mx-auto px-4 py-10 min-h-screen bg-[#1a1a1a]">
            <h1 className="text-2xl font-bold text-white mb-8 border-l-4 border-red-500 pl-4 uppercase">
                {categoryName}
            </h1>

            {products && products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {products.map((item) => {
                        const itemImage = item.image?.startsWith("http") 
                            ? item.image 
                            : `${imageBaseUrl}${item.image}`;
                         
                        return (
                            <div key={item.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                                <img 
                                    src={itemImage}
                                    alt={item.product_name}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-gray-800 font-bold text-sm line-clamp-2 h-10">{item.product_name}</h3>
                                    <p className="text-red-500 font-bold mt-2">
                                        {Number(item.sale_price || item.price).toLocaleString()}đ
                                    </p>
                                    <button 
                                        onClick={() => window.location.href = `/products/${item.slug}`}
                                        className="w-full mt-3 bg-black text-white py-2 rounded text-xs hover:bg-gray-800"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20">
                    <p className="text-gray-400 mb-4">Danh mục này hiện chưa có sản phẩm.</p>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-500 hover:text-white transition-all"
                    >
                        Quay lại trang chủ
                    </button>
                </div>
            )}
        </div>
    );
}