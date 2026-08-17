"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Link from "next/link";
import { getNotificationOrders } from "@/services/orderService";

export default function AdminHeader() {
  const [userName, setUserName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // State cho thông báo đơn hàng
  const [notifications, setNotifications] = useState({ unread_count: 0, orders: [] });
  const [isOpenNotify, setIsOpenNotify] = useState(false);

  useEffect(() => {
    const token = Cookies.get("admin_token");
    const savedName = localStorage.getItem("userName");

    if (token) {
      setIsLoggedIn(true);
      setUserName(savedName || "Admin");

      fetchNotifications();

      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationOrders();
      if (res) {
        setNotifications({
          unread_count: res.unread_count || 0,
          orders: Array.isArray(res.orders) ? res.orders : []
        });
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    }
  };

  const handleLogout = () => {
    Cookies.remove("admin_token");
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/admin/login";
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between flex-shrink-0">
      <h1 id="page-title" className="text-lg font-semibold text-gray-800">
        Dashboard
      </h1>
      
      <div className="flex items-center gap-6">
        {isLoggedIn ? (
          <div className="flex items-center gap-5">
            
            {/* ================= 🔔 NÚT CHUÔNG THÔNG BÁO ================= */}
            <div className="relative">
              <button 
                onClick={() => setIsOpenNotify(!isOpenNotify)}
                className="relative p-2 text-gray-500 hover:text-blue-600 transition focus:outline-none rounded-full hover:bg-gray-100"
                title="Thông báo đơn hàng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {notifications.unread_count > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {notifications.unread_count}
                  </span>
                )}
              </button>

              {isOpenNotify && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="px-4 py-2.5 border-b bg-gray-50 flex justify-between items-center">
                    <span className="font-semibold text-xs text-gray-700 uppercase tracking-wider">Thông báo đơn hàng</span>
                    {notifications.unread_count > 0 && (
                      <span className="text-[11px] bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                        {notifications.unread_count} đơn mới
                      </span>
                    )}
                  </div>

                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                    {notifications.orders && notifications.orders.length > 0 ? (
                      notifications.orders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/admin/orders/${order.id}`}
                          onClick={() => setIsOpenNotify(false)}
                          className="block px-4 py-3 hover:bg-blue-50/50 transition"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-800">Đơn hàng #{order.id}</span>
                            {/* Đọc đúng giá tiền từ total_amount */}
                            <span className="text-xs font-semibold text-green-600">
                              {Number(order.total_amount || order.total || order.total_price || 0).toLocaleString("vi-VN")}đ
                            </span>
                          </div>
                          {/* Đọc đúng tên khách hàng */}
                          <p className="text-xs text-gray-500 truncate">
                            Khách hàng: {order.customer_name || order.user?.name || "Khách ẩn danh"}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-gray-400">
                        Không có đơn hàng mới nào
                      </div>
                    )}
                  </div>

                  <Link
                    href="/admin/orders"
                    onClick={() => setIsOpenNotify(false)}
                    className="block text-center text-xs text-blue-600 font-medium py-2.5 bg-gray-50 hover:bg-gray-100 border-t"
                  >
                    Xem tất cả đơn hàng &rarr;
                  </Link>
                </div>
              )}
            </div>

            <span className="text-sm italic text-blue-600 font-medium">
              Chào, <span className="capitalize">{userName}</span>
            </span>

            <button 
              onClick={handleLogout}
              className="text-[11px] border border-red-300 text-red-500 px-3 py-1 rounded hover:bg-red-50 transition font-medium"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <a href="/admin/login" className="text-sm text-gray-600 hover:underline">
            Đăng nhập
          </a>
        )}
      </div>
    </header>
  );
}