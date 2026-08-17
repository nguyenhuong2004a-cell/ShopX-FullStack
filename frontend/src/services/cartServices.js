// 1. Hàm thêm sản phẩm vào giỏ
export function addCart(cart = [], product) {
    if (!Array.isArray(cart)) cart = [];

    // Đảm bảo so sánh cùng kiểu dữ liệu (ép cả 2 về Number)
    const isExisting = cart.find(item => Number(item.id) === Number(product.id));
    
    if (isExisting) {
        return cart.map(item =>
            Number(item.id) === Number(product.id) 
                ? { 
                    ...item, 
                    // Đồng bộ cả qty và quantity để tránh lỗi undefined số lượng
                    qty: (Number(item.qty || item.quantity) || 0) + 1,
                    quantity: (Number(item.qty || item.quantity) || 0) + 1 
                  } 
                : item
        );
    }
    
    // Nếu chưa có, thêm mới và mặc định số lượng là 1
    const initialQty = Number(product.qty || product.quantity) || 1;
    return [
        ...cart,
        { ...product, qty: initialQty, quantity: initialQty }
    ];
}

// 2. Hàm cập nhật số lượng
export function updateQuantity(cart = [], productId, newQty) {
    if (!Array.isArray(cart)) return [];
    const validQty = Number(newQty) < 1 ? 1 : Number(newQty);

    return cart.map(item =>
        Number(item.id) === Number(productId)
            ? { ...item, qty: validQty, quantity: validQty }
            : item
    );
}

// 3. Hàm xóa sản phẩm khỏi giỏ
export function removeItem(cart = [], productId) {
    if (!Array.isArray(cart)) return [];
    return cart.filter(item => Number(item.id) !== Number(productId));
}

// 4. Hàm tính tổng thành tiền (Tự động ưu tiên sale_price nếu có)
export function getTotalPrice(cart = []) {
    if (!Array.isArray(cart)) return 0;

    return cart.reduce((sum, item) => {
        // Tự động lấy giá sale_price nếu sản phẩm đang giảm giá
        const actualPrice = (Number(item.sale_price) > 0) 
            ? Number(item.sale_price) 
            : Number(item.price || 0);

        const qty = Number(item.qty || item.quantity) || 0;
        return sum + (actualPrice * qty);
    }, 0);
}

// 5. Hàm tính tổng số lượng
export function getCount(cart = []) {
    if (!Array.isArray(cart)) return 0;
    return cart.reduce((total, item) => total + (Number(item.qty || item.quantity) || 0), 0);
}