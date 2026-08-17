"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { getParentCategories } from "@/services/categoryServices"; 

export default function CreateCategoryPage() {
    const router = useRouter();
    const [parentCategories, setParentCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [category, setCategory] = useState({
        category_name: "",
        slug: "",
        parent_id: "0", 
        description: "",
        status: 1
    });

    // 2. Sử dụng hàm service để load dữ liệu
    useEffect(() => {
        const loadParents = async () => {
            const parents = await getParentCategories();
            setParentCategories(parents);
        };
        loadParents();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === "category_name") {
            const generatedSlug = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/([^0-9a-z-\s])/g, "")
                .replace(/(\s+)/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");
            
            setCategory({ ...category, category_name: value, slug: generatedSlug });
        } else {
            setCategory({ ...category, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = Cookies.get("admin_token");

        // Đảm bảo dữ liệu đúng format Laravel yêu cầu
        const dataToSend = {
            category_name: category.category_name,
            slug: category.slug,
            parent_id: Number(category.parent_id),
            description: category.description,
            status: Number(category.status),
        };

        try {
            const response = await fetch("http://localhost:8000/api/categories", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(dataToSend),
            });

            if (response.ok) {
                alert("Thêm danh mục thành công!");
                router.push("/admin/categories");
            } else {
                const result = await response.json();
                alert("Lỗi: " + (result.message || "Không thể thêm danh mục"));
            }
        } catch (error) {
            alert("Lỗi kết nối: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = "block text-sm font-bold mb-2 text-gray-700";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black mb-4";

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-extrabold mb-8 border-b pb-4 text-gray-800 text-center">
                    Thêm danh mục mới
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelStyle}>Tên danh mục *</label>
                            <input 
                                type="text" name="category_name"
                                value={category.category_name} onChange={handleChange}
                                placeholder="Ví dụ: Áo Nam" className={inputStyle} required 
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Slug (Tự động)</label>
                            <input 
                                type="text" name="slug" value={category.slug} readOnly 
                                className={`${inputStyle} bg-gray-100 cursor-not-allowed`} 
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelStyle}>Danh mục cha</label>
                        <select 
                            name="parent_id" value={category.parent_id}
                            onChange={handleChange} className={inputStyle}
                        >
                            <option value="0">-- Là danh mục gốc --</option>
                            {parentCategories.map((parent) => (
                                <option key={parent.id} value={parent.id}>
                                    {parent.category_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className={labelStyle}>Mô tả danh mục</label>
                        <textarea 
                            name="description" rows="3" 
                            value={category.description} onChange={handleChange} className={inputStyle}
                            placeholder="Mô tả ngắn gọn về danh mục này..."
                        ></textarea>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition">
                            Hủy
                        </button>
                        <button type="submit" disabled={loading} className={`flex-1 py-3 rounded-lg font-bold text-white transition ${loading ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {loading ? "Đang lưu..." : "Lưu danh mục"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}