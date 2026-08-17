"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";

export default function OrderDetailPage() {
    const params = useParams();
    const id = params.id;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!id) return;

        const fetchOrderDetail = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`http://127.0.0.1:8000/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setOrder(res.data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetail();
    }, [id]);

    const getStatusText = (status) => {
        if (status == 1 || status?.toString().toLowerCase() === "pending") return "Chờ xử lý";
        if (status == 2 || status?.toString().toLowerCase() === "processing") return "Đang đóng gói";
        if (status == 3 || status?.toString().toLowerCase() === "shipped") return "Đang giao hàng";
        if (status == 4 || status?.toString().toLowerCase() === "delivered") return "Thành công";
        if (status == 0 || status?.toString().toLowerCase() === "cancelled") return "Đã hủy";
        return "Chờ xử lý";
    };

    const getStatusStyle = (status) => {
        const text = getStatusText(status);
        switch (text) {
            case 'Thành công': return 'bg-green-100 text-green-600';
            case 'Chờ xử lý': return 'bg-amber-100 text-amber-600';
            case 'Đã hủy': return 'bg-red-100 text-red-600';
            default: return 'bg-blue-100 text-blue-600';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-white text-black">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-600"></div>
            <span className="ml-3 font-medium">Đang tải dữ liệu...</span>
        </div>
    );

    if (!order) return (
        <div className="text-center py-20 bg-white text-black">
            <p className="text-xl font-bold">Không tìm thấy đơn hàng #{id}</p>
            <button onClick={() => router.push('/orders')} className="mt-4 text-indigo-600 underline">Quay lại danh sách</button>
        </div>
    );

    const orderItems = order.items || order.order_details || [];
    const totalMoney = Number(order.total_amount || order.total || 0);

    return (
        <div className="min-h-screen bg-[#f8fafc] py-10 text-black font-sans">
            <div className="container mx-auto px-4 max-w-3xl">
                <button 
                    onClick={() => router.push('/orders')}
                    className="group mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-all"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 
                    Quay lại lịch sử
                </button>
                
                <div className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">Chi tiết đơn hàng #{id}</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Ngày đặt: {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '---'}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`px-4 py-1 rounded-full font-black text-xs uppercase ${getStatusStyle(order.status)}`}>
                            {getStatusText(order.status)}
                        </span>
                    </div>
                </div>

                <div className="space-y-4">
                    {orderItems.length > 0 ? (
                        orderItems.map((item) => (
                            <div key={item.id} className="bg-white p-5 rounded-2xl border border-gray-100 flex gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img 
                                        src={item.product?.image ? (item.product.image.startsWith("http") ? item.product.image : `http://127.0.0.1:8000/storage/${item.product.image}`) : "https://placehold.co/200x200/e2e8f0/64748b?text=No+Image"} 
                                        alt="Sản phẩm"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = "https://placehold.co/200x200/e2e8f0/64748b?text=Lỗi+Ảnh"; }}
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-lg text-gray-800 leading-tight">
                                        {item.product?.product_name || item.product?.name || "Sản phẩm"}
                                    </h3>
                                    <div className="mt-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Số lượng</p>
                                            <p className="font-bold text-gray-900">x{item.qty || item.quantity || 1}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Giá đơn vị</p>
                                            <p className="font-bold text-indigo-600">{Number(item.price || 0).toLocaleString()} đ</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-3xl border border-dashed border-gray-300 text-center">
                            <p className="text-gray-400 font-medium italic">
                                Đơn hàng này hiện chưa có danh sách sản phẩm.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-10 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-50 text-gray-600">
                        <span className="font-medium">Khách hàng:</span>
                        <span className="font-bold text-gray-900">{order.customer_name || order.user?.name || "Khách hàng"}</span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-gray-400 text-sm font-medium">Tổng thanh toán</p>
                            <p className="text-xs text-gray-400 italic">(Đã bao gồm VAT)</p>
                        </div>
                        <div className="text-right">
                            <span className="text-4xl font-black text-red-600">
                                {totalMoney.toLocaleString()} 
                                <span className="text-lg ml-1 font-bold text-red-600">đ</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}