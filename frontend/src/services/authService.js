import axiosClient from "@/lib/axiosClient";

// 1. Hàm Đăng Ký
export async function register(data) {
  try {
    // Đổi endpoint từ /register thành auth/local/register cho đúng Route Laravel
    const response = await axiosClient.post("auth/local/register", data); 
    return response; 
  } catch (err) {
    console.error("Register Error:", err.response?.data || err); 
    throw err;
  }
}

// 2. Hàm Đăng Nhập
export async function login(data) {
  try {
    // 🛑 SỬA TẠI ĐÂY: Đổi /login thành auth/local để khớp đúng với Route Laravel
    const response = await axiosClient.post("auth/local", data); 
    return response; 
  } catch (err) {
    console.error("Login Error:", err.response?.data || err); 
    throw err;
  }
}

// 3. Hàm Đăng Xuất
export async function logout() {
  try {
    const response = await axiosClient.post("auth/logout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    return response;
  } catch (err) {
    console.error("Logout Error:", err);
    throw err;
  }
}