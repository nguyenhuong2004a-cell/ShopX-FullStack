"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getParentCategories } from "@/services/categoryServices";

export default function CategoryHome() {
  const [categories, setCategories] = useState([]); // Luôn khởi tạo là mảng rỗng
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function fetchCats() {
    try {
      const res = await getParentCategories();
      console.log("Dữ liệu gốc từ API:", res);

      // SỬA TẠI ĐÂY: Vì console hiện { categories: Array(12) }
      // nên chúng ta phải lấy res.categories
      if (res && res.categories) {
        setCategories(res.categories);
      } else if (Array.isArray(res)) {
        setCategories(res);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Lỗi:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }
  fetchCats();
}, []);

  if (loading) return <div className="container mx-auto px-4 mt-6 text-white text-center">Đang tải danh mục...</div>;
  
  // Nếu sau khi tải mà vẫn không có dữ liệu thì ẩn luôn component
  if (!Array.isArray(categories) || categories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Danh mục</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/category/${cat.slug || '#'}`}
            className="bg-white p-4 rounded shadow text-center hover:bg-blue-50 cursor-pointer flex items-center justify-center transition-all"
          >
            <span className="text-gray-800 font-medium lowercase first-letter:uppercase">
              {cat.category_name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}