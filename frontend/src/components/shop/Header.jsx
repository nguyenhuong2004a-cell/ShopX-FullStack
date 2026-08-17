"use client"; // Bắt buộc vì có dùng useEffect và useState

import { shopMenu } from '@/data/menu';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [userName, setUserName] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false); // THÊM: Trạng thái đóng/mở menu
  const router = useRouter();

  useEffect(() => {
    // Lấy tên từ localStorage khi component render lần đầu
    const name = localStorage.getItem("userName");
    if (name) {
      setUserName(name);
    }
  }, []);

  const handleLogout = () => {
    // Xóa dữ liệu khi đăng xuất
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setUserName(null);
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4 flex justify-between items-center py-4">
        {/* Logo */}
        <Link href="/">
          <h1 className="text-3xl font-extrabold text-blue-600 cursor-pointer">ShopX</h1>
        </Link>

        {/* Menu chính */}
        <ul className="hidden md:flex gap-8 text-gray-600 font-medium">
          {shopMenu.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-blue-500 transition-colors">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Cụm chức năng bên phải */}
        <div className="flex items-center gap-5">
          {userName ? (
            // Hiển thị khi đã đăng nhập
            <div className="flex items-center gap-3 relative"> {/* THÊM: relative để định vị menu con */}
              <div 
                className="group relative flex items-center gap-1 cursor-pointer"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <span className="text-blue-600 font-semibold italic">
                  Chào, <span className="capitalize">{userName}</span> ▾
                </span>

                {/* THÊM: Menu thả xuống khi di chuột vào tên */}
                {showDropdown && (
                  <div className="absolute top-full right-0 w-48 bg-white border border-gray-100 shadow-xl rounded-lg py-2 z-[100] mt-1">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      👤 Sửa thông tin
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                    >
                      📦 Đơn hàng của tôi
                    </Link>
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="text-xs text-red-500 border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            // Hiển thị khi chưa đăng nhập
            <Link href="/login" className="text-gray-600 hover:text-blue-500 font-medium">
              Login
            </Link>
          )}
          
          <Link href="/cart" className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition">
            <span className="text-lg">🛒</span>
            <span className="font-bold text-sm">(0)</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}