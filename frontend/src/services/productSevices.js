import axiosClient from "@/lib/axiosClient";

// 1. Lấy tất cả sản phẩm
export async function getAllProducts() {
    try {
        const data = await axiosClient.get("/products");
        console.log("Dữ liệu từ API:", data);      
        return data; 
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
        return []; 
    }
}

// 2. Lọc theo danh mục
export function filterByCategory(products = [], category) {
    if (!category || category === "All") return products;
    return products.filter(product => 
        product.category?.category_name === category || product.cat_id == category
    );
}

// 3. Tìm kiếm sản phẩm
export function searchProducts(products = [], searchTerm) {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase().trim();
    
    return products.filter(product => 
        (product.product_name || product.name)?.toLowerCase().includes(term) 
    );
}

// 4. Sắp xếp theo giá
export function sortByPrice(products = [], order = "asc") {
    const productsCopy = [...products];

    return productsCopy.sort((a, b) => {
        const priceA = Number(a.sale_price) > 0 ? Number(a.sale_price) : Number(a.price);
        const priceB = Number(b.sale_price) > 0 ? Number(b.sale_price) : Number(b.price);

        if (order === "asc") return priceA - priceB;
        if (order === "desc") return priceB - priceA;
        return 0;
    });
}

// 5. Phân trang Client-side
export const getProductsByPage = (allProducts = [], page = 1, perPage = 12) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return allProducts.slice(start, end);
};

export const getTotalPages = (allProducts = [], perPage = 12) => {
    if (!allProducts.length) return 1;
    return Math.ceil(allProducts.length / perPage);
};

// 6. Lấy chi tiết sản phẩm theo Slug
export async function getProductBySlug(slug) {
    try {
        const safeSlug = encodeURIComponent(slug);
        const data = await axiosClient.get(`/products/slug/${safeSlug}`); 
        return data;
    } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
        return null;
    }
}

// 7. Lấy sản phẩm MỚI
export async function getNewProducts(limit = 8) {
    try {
        return await axiosClient.get(`/newProducts/${limit}`);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm mới:", error);
        return [];
    }
}

// 8. Lấy sản phẩm HOT
export async function getHotProducts(limit = 8) {
    try {
        return await axiosClient.get(`/hotProducts/${limit}`);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm hot:", error);
        return [];
    }
}

// 9. Lấy sản phẩm SALE
export async function getSaleProducts(limit = 8) {
    try {
        return await axiosClient.get(`/saleProducts/${limit}`);
    } catch (error) {
        console.error("Lỗi lấy sản phẩm sale:", error);
        return [];
    }
}

// 10. Lấy sản phẩm theo danh mục
export async function getProductsByCategory(slug) {
    try {
        const data = await axiosClient.get(`/categories/${slug}/products`);
        console.log(`Sản phẩm của danh mục ${slug}:`, data);
        return data; 
    } catch (error) {
        console.error("Lỗi lấy sản phẩm theo danh mục:", error);
        return null;
    }
}