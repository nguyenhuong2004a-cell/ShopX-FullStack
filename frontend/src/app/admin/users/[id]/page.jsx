"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import OrderDetails from "./OrderDetails";

export default function UserDetailPage() {
  const params = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusVietnamese = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang chuẩn bị',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao',
      'cancelled': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${params.id}`);
        if (!response.ok) return;
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchUserDetail();
  }, [params.id]);

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (!data) return <div className="p-6 text-center">Không tìm thấy người dùng.</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Chi tiết người dùng: {data.name}</h1>
      
      {/* Box thông tin cá nhân - Giữ nguyên style viền xanh trái của bạn */}
      <div className="bg-white p-8 shadow-sm rounded-xl mb-8 border-l-[6px] border-blue-500 shadow-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
          <p className="text-lg text-slate-700"><strong>Email:</strong> {data.email}</p>
          <p className="text-lg text-slate-700"><strong>Số điện thoại:</strong> {data.phone || "0786195648"}</p>
          <p className="text-lg text-slate-700"><strong>Địa chỉ:</strong> {data.address || "2c3"}</p>
          <p className="text-lg text-slate-700"><strong>Ngày tham gia:</strong> {new Date(data.created_at).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">Lịch sử đơn hàng</h2>
      <div className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#2d3748] text-white text-center">
              <th className="px-4 py-4 text-sm font-semibold uppercase">Mã ĐH</th>
              <th className="px-4 py-4 text-sm font-semibold uppercase">Ngày đặt</th>
              <th className="px-4 py-4 text-sm font-semibold uppercase">Tổng tiền</th>
              <th className="px-4 py-4 text-sm font-semibold uppercase">Trạng thái</th>
              <th className="px-4 py-4 text-sm font-semibold uppercase">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.orders?.map((order) => (
              <tr key={order.id} className="text-center hover:bg-gray-50 transition-colors">
                <td className="px-4 py-5 text-blue-600 font-semibold text-lg cursor-pointer">#{order.id}</td>
                <td className="px-4 py-5 text-slate-600 text-lg">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 py-5 text-red-600 font-bold text-lg">
                  {Number(order.total_amount || order.total || 0).toLocaleString('vi-VN')}đ
                </td>
                <td className="px-4 py-5">
                  <span className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-bold">
                    {getStatusVietnamese(order.status)}
                  </span>
                </td>
                <td className="px-4 py-5">
                  <button 
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2 px-4 rounded-lg font-semibold transition shadow-sm"
                  >
                    {selectedOrder?.id === order.id ? "Đóng chi tiết" : "Chi tiết sản phẩm"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hiển thị phần chi tiết sản phẩm đã tách */}
      <OrderDetails order={selectedOrder} />
    </div>
  );
}