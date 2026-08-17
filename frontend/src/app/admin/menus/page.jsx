"use client";
import { useEffect, useState } from "react";
import { getMenus, deleteMenu } from "@/services/menuService";
import Link from "next/link";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

export default function MenuListPage() {
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const res = await getMenus();
        setMenus(res.data.data);
    };

    const handleDelete = async (id) => {
        if (confirm("Bạn có chắc chắn muốn xóa menu này?")) {
            await deleteMenu(id);
            loadData();
        }
    };

    return (
        <div className="p-10 bg-white min-h-screen text-black">
            <h1 className="text-3xl font-bold mb-8">Quản lý menu</h1>

            <Link 
                href="/admin/menus/create"
                className="inline-flex items-center gap-2 bg-[#2563eb] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 mb-10 transition shadow-sm"
            >
                <FaPlus size={14} /> Thêm menu mới
            </Link>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-900 border-b border-gray-100 uppercase text-sm tracking-wider font-bold">
                            <th className="pb-4 w-16">ID</th>
                            <th className="pb-4">Tên menu</th>
                            <th className="pb-4 text-gray-500">Link</th>
                            <th className="pb-4">Vị trí</th>
                            <th className="pb-4 text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-[#2d3748]">
                        {menus?.map((m) => (
                            <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                <td className="py-4">{m.id}</td>
                                <td className="py-4 font-medium">{m.name}</td>
                                <td className="py-4 text-gray-400 text-sm">{m.link}</td>
                                <td className="py-4">{m.position}</td>
                                <td className="py-4 text-right">
                                    <div className="flex justify-end gap-4">
                                        <Link href={`/admin/menus/${m.id}`} className="text-blue-400 hover:text-blue-600">
                                            <FaEdit size={18} />
                                        </Link>
                                        <button onClick={() => handleDelete(m.id)} className="text-red-400 hover:text-red-600">
                                            <FaTrash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}