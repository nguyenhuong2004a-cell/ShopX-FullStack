"use client";
import { useEffect, useState } from "react";
import AdminTable from "@/components/admin/table/AdminTable";
import { getAllCategories } from "@/services/categoryServices";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function AdminCategories() {
    const router = useRouter();
    const [allCategories, setAllCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Chỉ giữ lại các cột cần thiết: ID, Tên, Slug
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Tên danh mục" },
        { key: "slug", label: "Mô tả" },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllCategories();
            const data = Array.isArray(res) ? res : (res.data || []);
            setAllCategories(data);
        } catch (err) {
            console.error("Lỗi fetch danh mục:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleEdit = (category) => {
        router.push(`/admin/categories/${category.id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
            const token = Cookies.get("admin_token");
            try {
                const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json",
                    }
                });

                if (res.ok) {
                    alert("Xóa danh mục thành công!");
                    setAllCategories(allCategories.filter(item => item.id !== id));
                } else {
                    const err = await res.json();
                    alert("Lỗi: " + (err.message || "Không thể xóa"));
                }
            } catch (error) {
                console.error("Lỗi kết nối xóa:", error);
            }
        }
    };

    // 2. Format dữ liệu đơn giản, không còn chữ "Gốc" hay "ID Cha"
    const formattedData = allCategories.map((item) => ({
        id: item.id,
        name: item.category_name,
        slug: item.slug || "N/A",
    }));

    if (loading) return <div className="p-10 text-center text-gray-500 italic">Đang tải danh sách danh mục...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý danh mục</h1>

            <div className="mb-6">
                <Link 
                    href="/admin/categories/create" 
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 shadow-md"
                >
                    <span className="text-xl">+</span> Thêm danh mục mới
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <AdminTable 
                    columns={columns} 
                    data={formattedData} 
                    onEdit={handleEdit} 
                    onDelete={handleDelete} 
                />
            </div>
        </div>
    );
}