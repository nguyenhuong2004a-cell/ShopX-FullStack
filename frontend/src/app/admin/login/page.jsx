"use client";

import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function AdminLoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const inputClass = "w-full border border-gray-300 px-4 py-2.5 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 bg-gray-50 text-sm text-black transition-all";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gửi kèm flag is_admin_login để Laravel kiểm tra quyền
      const loginData = { 
        email: form.email, 
        password: form.password,
        is_admin_login: true 
      };
      const result = await login(loginData);

      console.log("Dữ liệu từ API trả về:", result);

      const token = result.access_token || result.token;
      const user = result.data || result.user || result;
      const role = user?.role || result.role;

      // 🛑 KIỂM TRA BẮT BUỘC ROLE PHẢI LÀ ADMIN
      if (role !== "admin") {
        alert("Tài khoản này là Khách hàng thông thường, không có quyền truy cập trang Admin!");
        setLoading(false);
        return;
      }

      if (token) {
        // 1. Lưu token và role vào Cookie cho Middleware đọc
        Cookies.set("admin_token", token, { expires: 7 }); 
        Cookies.set("user_role", "admin", { expires: 7 });

        // 2. Lưu vào localStorage
        localStorage.setItem("token", token);
        
        // 3. Xử lý tên hiển thị
        const finalName = user?.name || form.email.split('@')[0] || "Admin";
        localStorage.setItem("userName", finalName);

        // 4. Chuyển hướng vào Admin Dashboard
        alert("Đăng nhập Admin thành công!");
        window.location.href = "/admin"; 
      } else {
        alert("Đăng nhập thất bại: API không trả về token hợp lệ.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      const errorMsg = error.response?.data?.message || "Email/Mật khẩu sai hoặc bạn không có quyền Admin!";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex justify-center items-center p-6 text-black">
      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 w-full max-w-[500px]">
        <div className="mb-8 text-left">
          <h2 className="text-3xl font-medium text-gray-800 mb-2">Đăng nhập</h2>
          <p className="text-gray-500 text-sm">Trang quản trị · Chỉ dành cho admin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">Email</label>
            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              className={inputClass}
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 text-left">Mật khẩu</label>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white py-3 rounded font-medium hover:bg-black transition-all disabled:bg-gray-400 mt-4 text-sm"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}