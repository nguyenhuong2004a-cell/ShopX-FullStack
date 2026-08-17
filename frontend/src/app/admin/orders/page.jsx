"use client";
import { useEffect, useState } from "react";
import { getAllOrders } from "@/services/orderService";
import Link from "next/link";

export default function OrderListPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await getAllOrders();
                
                if (Array.isArray(res)) {
                    setOrders(res);
                } else if (res && Array.isArray(res.data)) {
                    setOrders(res.data);
                } else if (res && Array.isArray(res.orders)) {
                    setOrders(res.orders);
                } else {
                    setOrders([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách đơn hàng:", error);
                setOrders([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            processing: "bg-blue-100 text-blue-800 border-blue-200",
            shipped: "bg-purple-100 text-purple-800 border-purple-200",
            delivered: "bg-green-100 text-green-800 border-green-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
        };
        return colors[status] || "bg-gray-100 text-gray-800";
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: "Chờ xử lý",
            processing: "Đang đóng gói",
            shipped: "Đang giao hàng",
            delivered: "Thành công",
            cancelled: "Đã hủy"
        };
        return statusMap[status] || status;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black border-l-4 border-blue-600 pl-3">
                    Quản lý đơn hàng
                </h1>
                <span className="text-gray-500 text-sm">
                    Tổng cộng: {Array.isArray(orders) ? orders.length : 0} đơn hàng
                </span>
            </div>

            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <table className="w-full">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                        <tr>
                            <th className="p-4 text-left">Mã đơn</th>
                            <th className="p-4 text-left">Khách hàng</th>
                            <th className="p-4 text-left">Tổng tiền</th>
                            <th className="p-4 text-left">Trạng thái</th>
                            <th className="p-4 text-left">Ngày đặt</th>
                            <th className="p-4 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="text-black divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-gray-500">
                                    Đang tải danh sách đơn hàng...
                                </td>
                            </tr>
                        ) : Array.isArray(orders) && orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.id} className="hover:bg-blue-50/50 transition">
                                    <td className="p-4 font-bold text-blue-700">#ORD-{order.id}</td>
                                    <td className="p-4">
                                        {/* Ưu tiên đọc tên customer_name từ DB */}
                                        <div className="font-medium">
                                            {order.customer_name || order.user?.name || "Khách hàng ẩn danh"}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {order.user?.email || order.customer_email || "N/A"}
                                        </div>
                                    </td>
                                    {/* Đọc giá trị tổng tiền từ total_amount */}
                                    <td className="p-4 text-red-600 font-bold text-lg">
                                        {Number(order.total_amount || order.total || order.total_price || 0).toLocaleString("vi-VN")}đ
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {order.created_at ? new Date(order.created_at).toLocaleDateString("vi-VN") : "N/A"}
                                    </td>
                                    <td className="p-4 text-center">
                                        <Link 
                                            href={`/admin/orders/${order.id}`} 
                                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 hover:shadow-md transition shadow-sm"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="p-10 text-center text-gray-400">
                                    Chưa có đơn hàng nào để hiển thị.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}