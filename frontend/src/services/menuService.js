import axiosClient from "@/lib/axiosClient";

// 1. Lấy danh sách menu (Dành cho Admin / Frontend)
export const getMenus = async () => {
    try {
        const data = await axiosClient.get("/admin/menus");
        return data;
    } catch (error) {
        console.error("Lỗi lấy danh sách menu:", error);
        return []; // Trả về mảng rỗng để không bị văng lỗi UI
    }
};

// 2. Tạo menu mới
export const createMenu = async (data) => {
    try {
        const response = await axiosClient.post("/admin/menus", data);
        return response;
    } catch (error) {
        console.error("Lỗi tạo menu:", error);
        throw error; // Quăng lỗi ra để UI hiển thị thông báo
    }
};

// 3. Cập nhật menu
export const updateMenu = async (id, data) => {
    try {
        const response = await axiosClient.put(`/admin/menus/${id}`, data);
        return response;
    } catch (error) {
        console.error(`Lỗi cập nhật menu #${id}:`, error);
        throw error;
    }
};

// 4. Xóa menu
export const deleteMenu = async (id) => {
    try {
        const response = await axiosClient.delete(`/admin/menus/${id}`);
        return response;
    } catch (error) {
        console.error(`Lỗi xóa menu #${id}:`, error);
        throw error;
    }
};