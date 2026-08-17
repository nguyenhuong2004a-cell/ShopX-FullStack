"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function ProfilePage() {
    const [user, setUser] = useState({ name: "", email: "", phone: "", address: "" });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Lấy thông tin user từ API
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get("http://127.0.0.1:8000/api/user", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
            } catch (err) {
                console.error("Lỗi lấy thông tin user");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            await axios.put("http://127.0.0.1:8000/api/user/update", user, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Cập nhật thông tin thành công!");
        } catch (err) {
            alert("Có lỗi xảy ra khi cập nhật.");
        }
    };

    if (loading) return <div className="text-center py-10">Đang tải...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10 text-black">
            <h2 className="text-2xl font-bold mb-6 border-b pb-2">Sửa thông tin tài khoản</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium">Họ và tên</label>
                    <input 
                        type="text" value={user.name} 
                        onChange={(e) => setUser({...user, name: e.target.value})}
                        className="w-full border p-2 rounded-lg mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Số điện thoại</label>
                    <input 
                        type="text" value={user.phone || ""} 
                        onChange={(e) => setUser({...user, phone: e.target.value})}
                        className="w-full border p-2 rounded-lg mt-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Địa chỉ</label>
                    <textarea 
                        value={user.address || ""} 
                        onChange={(e) => setUser({...user, address: e.target.value})}
                        className="w-full border p-2 rounded-lg mt-1"
                    />
                </div>
                <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-bold">
                    Lưu thay đổi
                </button>
            </form>
        </div>
    );
}