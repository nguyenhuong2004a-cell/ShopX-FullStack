"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBrandById, updateBrand } from "@/services/brandServices";
import Cookies from "js-cookie";

export default function EditBrandPage() {
    const router = useRouter();
    const params = useParams(); // Lấy id từ URL /admin/brands/123
    const brandId = params.id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [brand, setBrand] = useState({
        name: "",
        slug: "",
        description: "",
        status: 1
    });

    // 1. Fetch dữ liệu cũ của Brand khi vào trang
    useEffect(() => {
        const fetchBrandDetail = async () => {
            try {
                const res = await getBrandById(brandId);
                // Đảm bảo dữ liệu mapping đúng với state (Laravel thường trả về trong res.data hoặc res)
                const data = res.data || res;
                setBrand({
                    name: data.name || "",
                    slug: data.slug || "",
                    description: data.description || "",
                    status: data.status ?? 1
                });
            } catch (error) {
                console.error("Lỗi khi tải chi tiết thương hiệu:", error);
                alert("Không thể tải thông tin thương hiệu!");
            } finally {
                setFetching(false);
            }
        };

        if (brandId) fetchBrandDetail();
    }, [brandId]);

    // 2. Xử lý thay đổi Input & Tự động tạo Slug
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") {
            const generatedSlug = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/([^0-9a-z-\s])/g, "")
                .replace(/(\s+)/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");
            
            setBrand({ ...brand, name: value, slug: generatedSlug });
        } else {
            setBrand({ ...brand, [name]: value });
        }
    };

    // 3. Xử lý Submit Form (Cập nhật)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gọi hàm update từ service đã viết
            await updateBrand(brandId, {
                ...brand,
                status: Number(brand.status)
            });

            alert("Cập nhật thương hiệu thành công!");
            router.push("/admin/brands");
            router.refresh(); // Làm mới dữ liệu trang danh sách
        } catch (error) {
            alert("Lỗi cập nhật: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center italic">Đang tải dữ liệu thương hiệu...</div>;

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-black mb-4 focus:ring-2 focus:ring-blue-500 transition-all";

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-2xl font-extrabold text-gray-800">Chỉnh sửa thương hiệu</h1>
                    <span className="text-sm text-gray-500 italic">ID: #{brandId}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Tên thương hiệu *</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={brand.name} 
                                onChange={handleChange} 
                                className={inputStyle} 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 text-gray-700">Slug (Tự động)</label>
                            <input 
                                type="text" 
                                name="slug" 
                                value={brand.slug} 
                                readOnly 
                                className={`${inputStyle} bg-gray-100 cursor-not-allowed`} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">Trạng thái</label>
                        <select 
                            name="status" 
                            value={brand.status} 
                            onChange={handleChange} 
                            className={inputStyle}
                        >
                            <option value={1}>Hiển thị</option>
                            <option value={0}>Ẩn</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-2 text-gray-700">Mô tả</label>
                        <textarea 
                            name="description" 
                            rows="4" 
                            value={brand.description} 
                            onChange={handleChange} 
                            className={inputStyle}
                            placeholder="Nhập mô tả thương hiệu..."
                        ></textarea>
                    </div>
                    
                    <div className="flex gap-4 pt-6 border-t mt-4">
                        <button 
                            type="button" 
                            onClick={() => router.push("/admin/brands")} 
                            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-bold hover:bg-gray-300 transition"
                        >
                            Quay lại
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading} 
                            className={`flex-1 py-3 text-white rounded-lg font-bold transition ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {loading ? "Đang lưu..." : "Cập nhật thương hiệu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}