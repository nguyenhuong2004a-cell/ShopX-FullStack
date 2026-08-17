"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    router.push("/login");
                    return;
                }

                const res = await axios.get("http://127.0.0.1:8000/api/orders", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrders(res.data || []);
            } catch (error) {
                console.error("Lỗi khi lấy đơn hàng:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [router]);

    // Chuyển đổi trạng thái (hỗ trợ cả số 1,2,3 và chuỗi 'pending','delivered'...)
    const getStatusText = (status) => {
        if (status == 1 || status?.toString().toLowerCase() === "pending") return "Chờ xử lý";
        if (status == 2 || status?.toString().toLowerCase() === "processing") return "Đang đóng gói";
        if (status == 3 || status?.toString().toLowerCase() === "shipped") return "Đang giao hàng";
        if (status == 4 || status?.toString().toLowerCase() === "delivered") return "Thành công";
        if (status == 0 || status?.toString().toLowerCase() === "cancelled") return "Đã hủy";
        return "Chờ xử lý";
    };

    const getStatusStyle = (status) => {
        const text = getStatusText(status);
        switch (text) {
            case "Thành công": return "bg-green-100 text-green-700 border-green-200";
            case "Chờ xử lý": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Đang đóng gói": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Đang giao hàng": return "bg-purple-100 text-purple-700 border-purple-200";
            case "Đã hủy": return "bg-red-100 text-red-700 border-red-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f4f6] py-12 text-black">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">Lịch sử đơn hàng</h2>
                    <span className="bg-white px-4 py-1 rounded-full shadow-sm text-sm font-medium text-gray-500 border">
                        {orders.length} Đơn hàng
                    </span>
                </div>

                <div className="space-y-6">
                    {orders.length > 0 ? orders.map((order) => {
                        const items = order.items || order.order_details || [];
                        const totalMoney = Number(order.total_amount || order.total || 0);

                        return (
                            <div 
                                key={order.id} 
                                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300"
                            >
                                <div className="p-5 border-b border-gray-50 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100 font-bold">
                                            🛍️
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mã đơn hàng</span>
                                            <h3 className="font-bold text-lg text-gray-900">#ORD-{order.id}</h3>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        <span className="text-sm text-gray-400 mt-2">
                                            📅 {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 bg-white">
                                    <div className="space-y-3">
                                        {items.length > 0 ? (
                                            <>
                                                {items.slice(0, 2).map((item) => (
                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-gray-700 font-medium">
                                                            {item.product?.product_name || item.product?.name || "Sản phẩm"} <span className="text-gray-400">x{item.qty || item.quantity || 1}</span>
                                                        </span>
                                                        <span className="font-semibold">{(Number(item.price || 0) * (item.qty || 1)).toLocaleString()}đ</span>
                                                    </div>
                                                ))}
                                                {items.length > 2 && (
                                                    <p className="text-xs text-indigo-500 font-medium italic">...và {items.length - 2} sản phẩm khác</p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">Nhấn xem chi tiết để xem thêm thông tin</p>
                                        )}
                                    </div>
                                </div>

                                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Tổng thanh toán</p>
                                        <p className="text-xl font-black text-red-600">
                                            {totalMoney.toLocaleString()}đ
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => router.push(`/orders/${order.id}`)}
                                        className="bg-white border-2 border-indigo-600 text-indigo-600 px-5 py-2 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-dashed border-gray-300">
                            <div className="text-6xl mb-6">🛒</div>
                            <h3 className="text-xl font-bold text-gray-800">Chưa có đơn hàng nào!</h3>
                            <button 
                                onClick={() => router.push("/")}
                                className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
                            >
                                Mua sắm ngay
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}