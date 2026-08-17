"use client";
import { use, useEffect, useState } from "react";
import { getOrderDetail, updateOrderStatus } from "@/services/orderService";
import { useRouter } from "next/navigation";

export default function OrderDetailPage({ params: paramsPromise }) {
    const params = use(paramsPromise);
    const orderId = params.id;
    const [order, setOrder] = useState(null);
    const router = useRouter();

    useEffect(() => {
        getOrderDetail(orderId).then(res => {
            console.log("Dữ liệu Admin nhận được:", res.data);
            setOrder(res.data);
        });
    }, [orderId]);

    const handleStatusChange = async (newStatus) => {
        if (confirm(`Xác nhận chuyển đơn hàng sang: ${newStatus}?`)) {
            try {
                await updateOrderStatus(orderId, newStatus);
                alert("Cập nhật thành công!");
                // Cập nhật state tại chỗ để không phải reload trang
                setOrder({...order, status: newStatus});
            } catch (error) {
                alert("Lỗi cập nhật trạng thái!");
            }
        }
    };

    if (!order) return (
        <div className="flex justify-center items-center min-h-screen text-black">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600 mr-3"></div>
            Đang tải dữ liệu đơn hàng...
        </div>
    );

    // Kiểm tra các trường hợp tên mảng từ Laravel (items hoặc order_details)
    const orderItems = order.items || order.order_details || [];

    return (
        <div className="p-8 text-black bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng #ORD-{order.id}</h2>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-sm text-gray-600">Trạng thái:</span>
                        <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="border border-gray-300 p-2 rounded-md font-bold bg-white text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pending">Chờ xử lý</option>
                            <option value="processing">Đang chuẩn bị</option>
                            <option value="shipped">Đã giao ĐVVC</option>
                            <option value="delivered">Thành công</option>
                            <option value="cancelled">Hủy đơn</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <p className="text-sm"><strong>Khách hàng:</strong> <span className="text-blue-600 font-medium">{order.user?.name || "N/A"}</span></p>
                    <p className="text-sm"><strong>Ngày đặt:</strong> {new Date(order.created_at).toLocaleString('vi-VN')}</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full mb-6">
                        <thead>
                            <tr className="bg-gray-100 text-gray-700 uppercase text-xs tracking-wider">
                                <th className="p-3 text-left">Sản phẩm</th>
                                <th className="p-3 text-center">SL</th>
                                <th className="p-3 text-right">Đơn giá</th>
                                <th className="p-3 text-right">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-medium text-gray-800">
                                        {/* Sửa lại theo database image_66d23f.jpg */}
                                        {item.product?.product_name || "Sản phẩm không tên"}
                                    </td>
                                    <td className="p-3 text-center">
                                        {/* Sửa theo database image_66cf3b.jpg: cột là 'qty' */}
                                        {item.qty || 1}
                                    </td>
                                    <td className="p-3 text-right">
                                        {Number(item.price || 0).toLocaleString()}đ
                                    </td>
                                    <td className="p-3 text-right font-bold text-gray-900">
                                        {/* Sửa theo database image_66cf3b.jpg: cột là 'total' */}
                                        {Number(item.total || 0).toLocaleString()}đ
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <button 
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                    >
                        ← Quay lại danh sách
                    </button>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase font-bold tracking-tighter">Tổng thanh toán</p>
                        <div className="text-3xl font-black text-red-600">
                            {Number(order.total || 0).toLocaleString()}đ
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}