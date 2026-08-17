"use client";
import { useEffect, useState } from "react";

export default function UserListPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/admin/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tên / Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Số điện thoại
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex items-center">
                    <div>
                      <p className="text-gray-900 whitespace-no-wrap font-bold">{user.name}</p>
                      <p className="text-gray-600 whitespace-no-wrap">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 whitespace-no-wrap">{user.phone || "Chưa có"}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <button 
                    onClick={() => window.location.href = `/admin/users/${user.id}`}
                    className="text-blue-600 hover:text-blue-900 font-semibold"
                  >
                    Xem đơn hàng
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}