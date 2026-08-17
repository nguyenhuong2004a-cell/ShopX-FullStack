"use client";

export default function OrderDetails({ order }) {
  if (!order) return null;

  // Lấy danh sách item từ bất kỳ tên biến nào có thể có
  const items = order.order_details || order.details || order.items || [];

  return (
    <div className="mt-8 bg-blue-50 p-6 rounded-lg border-2 border-blue-200 animate-in fade-in duration-300">
      <h3 className="text-lg font-bold mb-4 text-blue-800">
        Sản phẩm trong đơn hàng #{order.id}
      </h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="bg-[#2d3748] text-white text-left">
              <th className="px-4 py-3 text-sm font-semibold uppercase">Sản phẩm</th>
              <th className="px-4 py-3 text-sm font-semibold uppercase text-center">Số lượng</th>
              <th className="px-4 py-3 text-sm font-semibold uppercase text-right">Đơn giá</th>
              <th className="px-4 py-3 text-sm font-semibold uppercase text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => {
              // Xử lý linh hoạt tên cột từ API (quantity/qty và price/unit_price)
              const quantity = Number(item.quantity || item.qty || 0);
              const price = Number(item.price || item.unit_price || 0);
              const total = quantity * price;

              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {item.product?.name || item.product_name || `Sản phẩm #${item.product_id}`}
                  </td>
                  <td className="px-4 py-4 text-sm text-center text-gray-600">
                    {quantity}
                  </td>
                  <td className="px-4 py-4 text-sm text-right text-gray-600">
                    {price.toLocaleString('vi-VN')}đ
                  </td>
                  <td className="px-4 py-4 text-sm text-right font-bold text-gray-900">
                    {total.toLocaleString('vi-VN')}đ
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}