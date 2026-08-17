"use client";
import { useEffect, useState } from "react";
import AdminTable from "@/components/admin/table/AdminTable";
import { getAllBrands } from "@/services/brandServices";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function AdminBrands() {
    const router = useRouter();
    const [allBrands, setAllBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Tên thương hiệu" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Mô tả" },
    ];

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getAllBrands();
            const data = Array.isArray(res) ? res : (res.data || []);
            setAllBrands(data);
        } catch (err) {
            console.error("Lỗi fetch thương hiệu:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleEdit = (brand) => {
        router.push(`/admin/brands/${brand.id}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa thương hiệu này?")) {
            const token = Cookies.get("admin_token");
            try {
                const res = await fetch(`http://localhost:8000/api/brands/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    alert("Xóa thành công!");
                    setAllBrands(allBrands.filter(item => item.id !== id));
                }
            } catch (error) { console.error("Lỗi xóa:", error); }
        }
    };

    const formattedData = allBrands.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug || "N/A",
        description: item.description || "Chưa có mô tả",
    }));

    if (loading) return <div className="p-10 text-center italic">Đang tải thương hiệu...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý thương hiệu</h1>
            <div className="mb-6">
                <Link href="/admin/brands/create" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2 shadow-md">
                    <span className="text-xl">+</span> Thêm thương hiệu mới
                </Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <AdminTable columns={columns} data={formattedData} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
        </div>
    );
}