"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]); // 🆕 Mảng lưu danh sách ID sản phẩm ĐƯỢC CHỌN
    const [isMounted, setIsMounted] = useState(false);
    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://127.0.0.1:8000/storage/";

    // Load dữ liệu khi trang tải xong
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);
        // Mặc định tích chọn tất cả sản phẩm khi vừa mở giỏ hàng
        setSelectedIds(savedCart.map((item) => item.id));
        setIsMounted(true);
    }, []);

    // 1. Toggle chọn/bỏ chọn 1 sản phẩm
    const handleToggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    // 2. Toggle Chọn tất cả / Bỏ chọn tất cả
    const handleSelectAll = () => {
        if (selectedIds.length === cart.length) {
            setSelectedIds([]); // Bỏ chọn tất cả
        } else {
            setSelectedIds(cart.map((item) => item.id)); // Chọn tất cả
        }
    };

    // 3. Cập nhật số lượng
    const updateQty = (id, newQty) => {
        if (newQty < 1) return;
        const newCart = cart.map((item) => (item.id === id ? { ...item, qty: newQty } : item));
        setCart(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    // 4. Xóa 1 sản phẩm
    const removeItem = (id) => {
        const newCart = cart.filter((item) => item.id !== id);
        setCart(newCart);
        setSelectedIds(selectedIds.filter((itemId) => itemId !== id));
        localStorage.setItem("cart", JSON.stringify(newCart));
    };

    // 5. Xóa tất cả giỏ hàng
    const clearCart = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng không?")) {
            setCart([]);
            setSelectedIds([]);
            localStorage.removeItem("cart");
        }
    };

    // 🆕 6. TÍNH TỔNG TIỀN CHỈ CHO NHỮNG MÓN ĐƯỢC CHỌN
    const total = cart.reduce((acc, item) => {
        if (selectedIds.includes(item.id)) {
            const price = item.sale_price > 0 ? item.sale_price : item.price;
            return acc + price * item.qty;
        }
        return acc;
    }, 0);

    // 7. Chuyển hướng sang trang Thanh toán
    const handleGoToCheckout = () => {
        if (selectedIds.length === 0) {
            alert("Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán!");
            return;
        }
        
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập để thanh toán!");
            router.push("/login");
            return;
        }

        // Lưu danh sách sản phẩm được chọn vào localStorage để trang Checkout lấy
        const checkoutItems = cart.filter((item) => selectedIds.includes(item.id));
        localStorage.setItem("checkout_items", JSON.stringify(checkoutItems));

        router.push("/checkout");
    };

    if (!isMounted) {
        return <div className="min-h-screen bg-gray-100 py-12"></div>;
    }

    const isAllSelected = cart.length > 0 && selectedIds.length === cart.length;

    return (
        <div className="min-h-screen bg-gray-100 py-12 text-black">
            <div className="container mx-auto px-4 max-w-5xl">
                
                {/* Header giỏ hàng + Chọn tất cả */}
                <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                        {cart.length > 0 && (
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                            />
                        )}
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            🛒 Giỏ hàng 
                            <span className="text-sm font-normal text-gray-400">({cart.length} sản phẩm)</span>
                        </h1>
                    </div>
                    
                    {cart.length > 0 && (
                        <button 
                            onClick={clearCart}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                        >
                            <span>🗑️ Xóa tất cả</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Danh sách sản phẩm trong giỏ */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.length > 0 ? (
                            cart.map((item) => {
                                const itemImage = item.image?.startsWith("http") 
                                    ? item.image 
                                    : `${imageBaseUrl}${item.image}`;
                                
                                const isSelected = selectedIds.includes(item.id);

                                return (
                                    <div 
                                        key={item.id} 
                                        className={`bg-white p-4 rounded-xl flex items-center gap-4 shadow-sm border-2 transition-all ${
                                            isSelected ? "border-indigo-500" : "border-transparent"
                                        }`}
                                    >
                                        {/* Checkbox từng món */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleToggleSelect(item.id)}
                                            className="w-5 h-5 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                                        />

                                        <img src={itemImage} className="w-20 h-20 object-cover rounded-md border" alt={item.product_name} />
                                        
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800">{item.product_name}</h3>
                                            <p className="text-red-500 font-semibold">
                                                {(item.sale_price || item.price).toLocaleString()}đ
                                            </p>
                                        </div>

                                        {/* Tăng giảm số lượng */}
                                        <div className="flex items-center border rounded-lg bg-gray-50">
                                            <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-3 py-1 hover:bg-gray-200 font-bold text-gray-600">-</button>
                                            <span className="px-3 font-medium">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-3 py-1 hover:bg-gray-200 font-bold text-gray-600">+</button>
                                        </div>

                                        {/* Xóa món */}
                                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                                            🗑️
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white p-10 rounded-xl text-center shadow-sm">
                                <p className="text-gray-500">Giỏ hàng trống</p>
                                <button 
                                    onClick={() => router.push("/")}
                                    className="mt-4 text-indigo-600 font-semibold hover:underline"
                                >
                                    Tiếp tục mua sắm
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Khối Tóm tắt & Thanh toán */}
                    <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-4">
                        <h2 className="text-lg font-bold mb-4 border-b pb-2">Tóm tắt đơn hàng</h2>
                        
                        <div className="flex justify-between mb-2 text-sm text-gray-600">
                            <span>Đã chọn:</span>
                            <span className="font-semibold text-gray-800">{selectedIds.length} / {cart.length} sản phẩm</span>
                        </div>

                        <div className="flex justify-between text-xl font-bold text-red-600 border-t pt-4">
                            <span>Tổng cộng:</span>
                            <span>{total.toLocaleString()}đ</span>
                        </div>
                        
                        <button 
                            onClick={handleGoToCheckout}
                            disabled={selectedIds.length === 0}
                            className={`w-full py-4 rounded-xl mt-6 font-bold uppercase tracking-widest transition-all shadow-lg ${
                                selectedIds.length > 0 
                                ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 cursor-pointer" 
                                : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
                            }`}
                        >
                            Thanh toán ({selectedIds.length})
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}