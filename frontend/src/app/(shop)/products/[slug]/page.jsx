"use client";
import ProductDetail from "@/components/shop/product/ProductDetail";
import { getProductBySlug } from "@/services/productSevices";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
    const params = useParams();
    const slug = params?.slug;
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        async function fetchProduct() {
            try {
                setLoading(true);
                setError(false);
                const res = await getProductBySlug(slug);
                console.log("Dữ liệu chi tiết sản phẩm nhận từ API:", res); 

                if (res) {
                    // 🟢 BÓC TÁCH AN TOÀN 2 LẦN: Ưu tiên lấy res.data.data hoặc res.data
                    const realProduct = res.data?.data || res.data || res;

                    // Kiểm tra nếu thực sự có ID hoặc product_name/name
                    if (realProduct && (realProduct.id || realProduct.product_name || realProduct.name)) {
                        setProduct(realProduct);
                    } else {
                        setError(true);
                    }
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Lỗi fetch chi tiết sản phẩm:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="p-10 text-center text-gray-500">
                <p>Đang tải thông tin sản phẩm...</p>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="p-10 text-center">
                <p className="text-red-500 font-bold text-lg">Không tìm thấy sản phẩm này!</p>
                <a href="/products" className="text-blue-500 underline mt-2 inline-block text-sm">
                    &larr; Quay lại danh sách sản phẩm
                </a>
            </div>
        );
    }

    return <ProductDetail product={product} />;
}