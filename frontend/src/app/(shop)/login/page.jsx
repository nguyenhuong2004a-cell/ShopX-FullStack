"use client";

import { useState } from "react";
import { login } from "@/services/authService"; 
import { useRouter } from "next/navigation";

export default function LoginForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Khởi tạo state khớp với các ô nhập liệu
    const [form, setForm] = useState({
        name: "",     
        email: "",    
        password: ""  
    });

    const inputClass = "border px-4 py-2 rounded-lg w-full focus:outline-blue-400 mb-4 text-black bg-white";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const loginData = { 
                email: form.email, 
                password: form.password 
            };
            
            // Gọi API đăng nhập
            const result = await login(loginData); 

            // Kiểm tra token trả về từ Laravel (thường là access_token)
            if (result.access_token || result.token) {
                
                // 1. Lưu Token để dùng cho các request sau
                localStorage.setItem("token", result.access_token || result.token);

                // 2. PHÂN TÍCH DỮ LIỆU NGƯỜI DÙNG TỪ API
                // Tùy vào backend của bạn trả về object user nằm ở đâu
                const userData = result.user || result.data || result;

                // 3. LƯU TẤT CẢ THÔNG TIN CẦN THIẾT VÀO LOCALSTORAGE
                // Lưu Tên: ưu tiên từ API, nếu không có thì lấy từ ô input 'Họ tên'
                localStorage.setItem("userName", userData.name || form.name || "Thành viên");
                
                // Lưu Email: lấy từ API hoặc từ ô input email
                localStorage.setItem("userEmail", userData.email || form.email);
                
                // Lưu Số điện thoại: lấy trường 'phone' từ Database trả về
                localStorage.setItem("userPhone", userData.phone || ""); 

                alert("Đăng nhập thành công!");
                
                // 4. Reload lại trang chủ để cập nhật Header và trạng thái mới
                window.location.href = "/"; 
            } else {
                alert("Đăng nhập thất bại: Server không trả về Token");
            }
        } catch (error) {
            console.error("Login Error:", error);
            const msg = error.response?.data?.message || "Email hoặc mật khẩu không chính xác!";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                
                <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
                    Đăng nhập hệ thống
                </h2>

                {/* Ô Họ tên - Dùng để lấy tên nếu API của bạn không trả về tên */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên (tùy chọn)</label>
                <input
                    type="text"
                    name="name"
                    placeholder="Nhập họ tên của bạn"
                    className={inputClass}
                    value={form.name}
                    onChange={handleChange}
                />

                {/* Ô Email */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    placeholder="example@gmail.com"
                    className={inputClass}
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                {/* Ô Mật khẩu */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className={inputClass}
                    value={form.password}
                    onChange={handleChange}
                    required
                />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-150 disabled:bg-gray-400 mt-2 shadow-lg"
                >
                    {loading ? "Đang xử lý..." : "Đăng nhập ngay"}
                </button>

                <div className="flex justify-between items-center mt-6 text-sm">
                    <p className="text-gray-600">
                        Chưa có tài khoản? <a href="/register" className="text-indigo-600 font-semibold hover:underline">Đăng ký</a>
                    </p>
                    <a href="/" className="text-gray-400 hover:text-gray-600">Quay lại trang chủ</a>
                </div>
            </form>
        </div>
    );
}