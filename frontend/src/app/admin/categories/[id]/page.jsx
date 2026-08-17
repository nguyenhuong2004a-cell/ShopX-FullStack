"use client";
import { useState, useEffect, use } from "react"; 
import axios from "axios"; 
import { useRouter } from "next/navigation";

export default function EditCategoryPage({ params: paramsPromise }) {
  const params = use(paramsPromise); 
  const id = params.id;
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("0");
  const [description, setDescription] = useState("");
  
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [detailRes, listRes] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/categories/${id}`),
          axios.get(`http://127.0.0.1:8000/api/categories`)
        ]);

        // Kiểm tra dữ liệu thực tế từ API trong Console
        console.log("Chi tiết danh mục:", detailRes.data);
        console.log("Danh sách danh mục:", listRes.data);

        // Xử lý dữ liệu chi tiết (Phòng trường hợp Laravel bọc trong res.data.data)
        const detail = detailRes.data.data || detailRes.data;
        setName(detail.category_name || detail.name || "");
        setSlug(detail.slug || "");
        setParentId(detail.parent_id !== undefined && detail.parent_id !== null ? String(detail.parent_id) : "0");
        setDescription(detail.description || "");

        // Xử lý danh sách danh mục (Phòng trường hợp bọc trong res.data.data)
        const list = listRes.data.data || listRes.data || [];
        setCategories(list.filter(cat => String(cat.id) !== String(id)));

      } catch (error) {
        console.error("Lỗi Fetch Data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("category_name", name);
      formData.append("slug", slug);
      formData.append("parent_id", parentId);
      formData.append("description", description || "");
      formData.append("_method", "PUT"); 

      await axios.post(`http://127.0.0.1:8000/api/categories/${id}`, formData);
      alert("Cập nhật thành công!");
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Lỗi Update:", error);
      alert("Thất bại! Hãy xem Console log để biết lỗi.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-black font-bold">Đang tải dữ liệu ShopX...</div>;

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg max-w-4xl mx-auto mt-10 text-black">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">CHỈNH SỬA DANH MỤC</h2>
      
      <form onSubmit={handleUpdate} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Tên danh mục *</label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Slug</label>
            <input
              type="text"
              className="w-full border p-3 rounded-lg bg-gray-100 text-black outline-none"
              value={slug}
              readOnly
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Danh mục cha</label>
          <select
            className="w-full border p-3 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="0">-- Là danh mục gốc --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.category_name || cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-bold mb-2">Mô tả</label>
          <textarea
            className="w-full border p-3 rounded-lg h-32 bg-white text-black focus:ring-2 focus:ring-blue-500 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        <div className="flex gap-4 pt-4">
          <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-200 py-3 rounded-lg font-bold">Hủy</button>
          <button type="submit" disabled={isUpdating} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold">
            {isUpdating ? "Đang lưu..." : "Cập nhật danh mục"}
          </button>
        </div>
      </form>
    </div>
  );
}