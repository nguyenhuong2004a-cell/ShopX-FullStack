"use client";

import { useState } from "react";
import { register } from "@/services/authService"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterForm() {
    const route = useRouter();
    const [loading, setLoading] = useState(false);
    
    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        birthday: "",
        gender: "0", 
        image: null  
    });

    // 💡 Tối ưu CSS: Đặt chữ màu đen rõ ràng (text-gray-900), placeholder màu xám vừa phải (placeholder-gray-400)
    const inputClass = "border border-gray-300 px-4 py-2.5 rounded-lg w-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white transition";

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm({
            ...form,
            [name]: files && files.length > 0 ? files[0] : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                if (value !== null && value !== "") {
                    formData.append(key, value);
                }
            });

            const result = await register(formData); 
            console.log("Kết quả từ server:", result);

            alert("Đăng ký thành công!");
            route.push("/login");
            
        } catch (error) {
            if (error.response && error.response.data.errors) {
                const messages = Object.values(error.response.data.errors).flat().join("\n");
                alert("Lỗi nhập liệu:\n" + messages);
            } else {
                alert("Đã có lỗi xảy ra hoặc không thể kết nối đến máy chủ!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100">
                
                <h2 className="text-3xl font-extrabold text-center text-indigo-600 mb-6">
                    Đăng ký thành viên
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Họ và tên */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Họ và tên</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Nguyễn Văn A"
                            className={inputClass}
                            value={form.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    
                    {/* Username - Tự động sinh nếu bỏ trống */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên tài khoản (Username)</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="Tên đăng nhập (VD: nguyenvana)"
                            className={inputClass}
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="off"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="example@gmail.com"
                            className={inputClass}
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Mật khẩu */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            className={inputClass}
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Số điện thoại */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            placeholder="0912345678"
                            className={inputClass}
                            value={form.phone}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Địa chỉ */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ</label>
                        <input
                            type="text"
                            name="address"
                            placeholder="Số nhà, Tên đường..."
                            className={inputClass}
                            value={form.address}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Ngày sinh */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày sinh</label>
                        <input
                            type="date"
                            name="birthday"
                            className={`${inputClass} text-gray-800`}
                            value={form.birthday}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Giới tính */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Giới tính</label>
                        <div className="flex items-center gap-6 px-4 py-2.5 border border-gray-300 rounded-lg bg-white h-[46px]">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="0"
                                    checked={form.gender === "0"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                Nam
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-gray-800 font-medium">
                                <input
                                    type="radio"
                                    name="gender"
                                    value="1"
                                    checked={form.gender === "1"}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                />
                                Nữ
                            </label>
                        </div>
                    </div>
                </div>

                {/* Input File ảnh */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh đại diện</label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-gray-200 rounded-lg p-1"
                    />
                </div>

                {/* Nút bấm */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 active:bg-indigo-800 transition duration-150 shadow-md hover:shadow-lg disabled:bg-gray-400 cursor-pointer"
                >
                    {loading ? "Đang xử lý..." : "Đăng ký ngay"}
                </button>

                {/* Link đăng nhập */}
                <p className="text-center text-sm text-gray-600 mt-4">
                    Đã có tài khoản?{" "}
                    <Link href="/login" className="text-indigo-600 font-semibold hover:underline">
                        Đăng nhập ngay
                    </Link>
                </p>
            </form>
        </div>
    );
}