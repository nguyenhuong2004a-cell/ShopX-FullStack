import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// 🟢 Response Interceptor: Xử lý dữ liệu TRẢ VỀ từ Backend
axiosClient.interceptors.response.use(
  (response) => {
    // Tự động trả về response.data để ở các file service không cần gõ .data nữa
    return response.data;
  },
  (error) => {
    // Bắt và xử lý các lỗi chung (VD: hết hạn token, lỗi server 500)
    if (error.response && error.response.status === 401) {
      // Nếu dính lỗi 401 (Chưa đăng nhập / Token hết hạn) -> Xóa token và về trang login
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;