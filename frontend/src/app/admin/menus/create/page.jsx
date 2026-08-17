"use client";
import { useState } from "react";
import { createMenu } from "@/services/menuService";
import { useRouter } from "next/navigation";

export default function CreateMenuPage() {
    const [formData, setFormData] = useState({ name: "", link: "", position: 0 });
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await createMenu(formData);
        router.push("/admin/menus");
    };

    return (
        <div className="p-10 bg-white min-h-screen text-black">
            <h1 className="text-3xl font-bold mb-8">Thêm menu mới</h1>
            <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
                <div>
                    <label className="block text-sm font-bold mb-2">Tên hiển thị</label>
                    <input 
                        type="text" required
                        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">Đường dẫn (Link)</label>
                    <input 
                        type="text" required
                        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, link: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold mb-2">Vị trí</label>
                    <input 
                        type="number"
                        className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:border-blue-500"
                        onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                </div>
                <div className="flex gap-4">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
                        Lưu menu
                    </button>
                    <button type="button" onClick={() => router.back()} className="bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition">
                        Hủy bỏ
                    </button>
                </div>
            </form>
        </div>
    );
}