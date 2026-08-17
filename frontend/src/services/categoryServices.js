import axiosClient from "@/lib/axiosClient";

// 1. Lấy tất cả danh mục
export const getAllCategories = async () => {
    try {
        const data = await axiosClient.get("/categories");
        return data; 
    } catch (error) {
        console.error("Lỗi gọi API danh mục:", error);
        return []; // Trả về mảng rỗng để không bị văng lỗi .map ở UI
    }
};

// 2. Hàm lấy danh mục (dành cho các trang cần log dữ liệu)
export async function getCategories() {
    try {
        const data = await axiosClient.get("/categories");
        console.log("Dữ liệu từ API Categories:", data);
        return data; 
    } catch (error) {
        console.error("Lỗi API:", error);
        return [];
    }
}

// 3. Lấy danh mục con theo parentId
export const getSubCategories = async (parentId) => {
    try {
        const data = await axiosClient.get(`/categories/${parentId}/subcategories`);
        return data;
    } catch (error) {
        console.error("Lỗi khi lấy danh mục con:", error);
        throw error;
    }
};

// 4. Chỉ lấy danh mục con (lọc các danh mục có parent_id khác null và khác 0)
export const getOnlySubCategories = async () => {
    try {
        const allData = await axiosClient.get("/categories");
        
        if (Array.isArray(allData)) {
            return allData.filter(cat => cat.parent_id !== null && cat.parent_id !== 0);
        }
        return [];
    } catch (error) {
        console.error("Lỗi lọc danh mục con:", error);
        return [];
    }
};

// 5. Chỉ lấy danh mục cha (parent_id là 0 hoặc null)
export const getParentCategories = async () => {
    try {
        const res = await getAllCategories();
        const data = Array.isArray(res) ? res : (res?.data || []);
        
        return data.filter(cat => cat.parent_id === 0 || cat.parent_id === null);
    } catch (error) {
        console.error("Lỗi khi lọc danh mục cha:", error);
        return [];
    }
};