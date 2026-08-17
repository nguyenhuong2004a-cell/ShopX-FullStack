"use client";

import { useState, useEffect } from "react";
import { DollarSign, Clipboard, Package, Users, Loader2 } from "lucide-react";
import axiosClient from "@/lib/axiosClient";

export default function AdminPage() {
  const [filter, setFilter] = useState("month"); // 'day' | 'week' | 'month' | 'all'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    products: 0,
    customers: 0,
  });

  // Gọi API thông qua axiosClient đồng bộ mỗi khi đổi filter
  useEffect(() => {
    async function fetchDashboardStats() {
      setLoading(true);
      try {
        // Đã dùng axiosClient, endpoint khớp với Route Laravel /admin/dashboard/stats
        const res = await axiosClient.get(`/admin/dashboard/stats?period=${filter}`);
        
        // Vì axiosClient interceptor đã tự trả về data:
        const responseData = res.data || res;
        
        if (responseData && (responseData.status === "success" || responseData.revenue !== undefined)) {
          const statsData = responseData.data || responseData;
          setStats({
            revenue: Number(statsData.revenue || 0),
            orders: Number(statsData.orders || 0),
            products: Number(statsData.products || 0),
            customers: Number(statsData.customers || 0),
          });
        }
      } catch (error) {
        console.error("Lỗi khi kết nối API dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, [filter]);

  return (
    <div id="page-dashboard" className="page active p-6 bg-gray-50 min-h-screen">
      {/* Header + Bộ chọn thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 border-l-4 border-blue-600 pl-3">
          Tổng quan hệ thống
        </h2>
        
        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="period-select" className="text-sm text-gray-500 font-medium">
            Thời gian:
          </label>
          <select
            id="period-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 outline-none cursor-pointer shadow-sm font-medium"
          >
            <option value="day">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="all">Tất cả thời gian</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        {/* Doanh thu */}
        <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Doanh thu</p>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              `${stats.revenue.toLocaleString("vi-VN")}₫`
            )}
          </div>
        </div>

        {/* Đơn hàng */}
        <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
              <Clipboard className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Đơn hàng</p>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              stats.orders.toLocaleString("vi-VN")
            )}
          </div>
        </div>

        {/* Sản phẩm */}
        <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Sản phẩm</p>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              stats.products.toLocaleString("vi-VN")
            )}
          </div>
        </div>

        {/* Khách hàng */}
        <div className="stat-card bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1 font-medium">Khách hàng mới</p>
          <div className="text-2xl font-bold text-gray-900">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              stats.customers.toLocaleString("vi-VN")
            )}
          </div>
        </div>
      </div>
    </div>
  );
}