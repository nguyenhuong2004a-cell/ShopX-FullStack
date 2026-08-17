"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function CreateBrandPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [brand, setBrand] = useState({
        name: "",
        slug: "",
        description: "",
        status: 1
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "name") {
            const slug = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/([^0-9a-z-\s])/g, "").replace(/(\s+)/g, "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
            setBrand({ ...brand, name: value, slug: slug });
        } else {
            setBrand({ ...brand, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = Cookies.get("admin_token");

        try {
            const response = await fetch("http://localhost:8000/api/brands", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ ...brand, status: Number(brand.status) }),
            });

            if (response.ok) {
                alert("Thêm thương hiệu thành công!");
                router.push("/admin/brands");
            }
        } catch (error) {
            alert("Lỗi kết nối: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md outline-none text-black mb-4 focus:ring-2 focus:ring-blue-500";

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-extrabold mb-8 border-b pb-4 text-center text-gray-800">Thêm thương hiệu mới</h1>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2">Tên thương hiệu *</label>
                            <input type="text" name="name" value={brand.name} onChange={handleChange} className={inputStyle} required />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2">Slug</label>
                            <input type="text" name="slug" value={brand.slug} readOnly className={`${inputStyle} bg-gray-100`} />
                        </div>
                    </div>
                    <label className="block text-sm font-bold mb-2">Mô tả</label>
                    <textarea name="description" rows="3" value={brand.description} onChange={handleChange} className={inputStyle}></textarea>
                    
                    <div className="flex gap-4 pt-4 border-t">
                        <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-gray-200 rounded-lg font-bold">Hủy</button>
                        <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold">
                            {loading ? "Đang lưu..." : "Lưu thương hiệu"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}