import axiosClient from "@/lib/axiosClient";

// 1. Lấy tất cả thương hiệu
export const getAllBrands = async () => {
    try {
        const data = await axiosClient.get("/brands");
        return data;
    } catch (error) {
        console.error("Lỗi gọi API thương hiệu:", error);
        return []; // Trả về mảng rỗng để tránh lỗi .map() ở UI
    }
};

// 2. Lấy chi tiết một thương hiệu theo ID (Dùng cho trang Edit)
export const getBrandById = async (id) => {
    try {
        const data = await axiosClient.get(`/brands/${id}`);
        return data;
    } catch (error) {
        console.error(`Lỗi khi lấy thương hiệu ${id}:`, error);
        throw error;
    }
};

// 3. Thêm mới thương hiệu
export const createBrand = async (brandData) => {
    try {
        const data = await axiosClient.post("/brands", brandData);
        return data;
    } catch (error) {
        console.error("Lỗi khi tạo thương hiệu:", error);
        throw error;
    }
};

// 4. Cập nhật thương hiệu
export const updateBrand = async (id, brandData) => {
    try {
        const data = await axiosClient.put(`/brands/${id}`, brandData);
        return data;
    } catch (error) {
        console.error("Lỗi khi cập nhật thương hiệu:", error);
        throw error;
    }
};

// 5. Xóa thương hiệu
export const deleteBrand = async (id) => {
    try {
        const data = await axiosClient.delete(`/brands/${id}`);
        return data;
    } catch (error) {
        console.error("Lỗi khi xóa thương hiệu:", error);
        throw error;
    }
};