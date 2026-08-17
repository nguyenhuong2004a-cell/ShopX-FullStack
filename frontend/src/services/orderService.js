import axiosClient from "@/lib/axiosClient";

// 1. Lấy tất cả đơn hàng (Dành cho Admin)
export const getAllOrders = async () => {
    try {
        const data = await axiosClient.get("/admin/orders");
        return data;
    } catch (error) {
        console.error("Lỗi lấy danh sách đơn hàng:", error);
        return []; // Trả về mảng rỗng để không bị sập trang Admin
    }
};

// 2. Lấy chi tiết một đơn hàng theo ID
export const getOrderDetail = async (id) => {
    try {
        const data = await axiosClient.get(`/admin/orders/${id}`);
        return data;
    } catch (error) {
        console.error(`Lỗi lấy chi tiết đơn hàng #${id}:`, error);
        return null;
    }
};

// 3. Cập nhật trạng thái đơn hàng (Duyệt/Hủy/Giao hàng)
export const updateOrderStatus = async (id, status) => {
    try {
        const data = await axiosClient.put(`/admin/orders/${id}/status`, { status });
        return data;
    } catch (error) {
        console.error(`Lỗi cập nhật trạng thái đơn hàng #${id}:`, error);
        throw error; // Quăng lỗi ra để trang Admin bắt và hiện thông báo chữ đỏ/toast
    }
};

// Bổ sung vào src/services/orderService.js
export const getNotificationOrders = async () => {
    try {
        const data = await axiosClient.get("/admin/orders/notifications");
        return data;
    } catch (error) {
        console.error("Lỗi lấy thông báo đơn hàng:", error);
        return { unread_count: 0, orders: [] };
    }
};