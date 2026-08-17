"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOnlySubCategories } from "@/services/categoryServices";
import Cookies from "js-cookie";

export default function CreateProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    const [product, setProduct] = useState({
        product_name: "",
        slug: "",
        cat_id: "",
        price: "0",
        sale_price: "0",
        qty: "0",
        description: "",
        material: "",  // 🆕 Chất liệu
        origin: "",    // 🆕 Xuất xứ
        style: "",     // 🆕 Phong cách
        status: 1,
        brand_id: 1,
        image: null,
        images: []     // 🆕 Mảng chứa nhiều file ảnh gallery
    });

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await getOnlySubCategories();
                setCategories(data);
            } catch (error) {
                console.error("Lỗi load danh mục:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            const file = files[0];
            setProduct({ ...product, image: file });
            setImagePreview(URL.createObjectURL(file));
        } else if (name === "images") {
            const fileList = Array.from(files);
            setProduct({ ...product, images: fileList });
            setGalleryPreviews(fileList.map((f) => URL.createObjectURL(f)));
        } else if (name === "product_name") {
            const generatedSlug = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/([^0-9a-z-\s])/g, "")
                .replace(/(\s+)/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-+|-+$/g, "");

            setProduct({ ...product, product_name: value, slug: generatedSlug });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = Cookies.get("admin_token");

        const formData = new FormData();
        formData.append("productName", product.product_name);
        formData.append("slug", product.slug);
        formData.append("cat", product.cat_id);
        formData.append("brand", product.brand_id);
        formData.append("price", product.price);
        formData.append("salePrice", product.sale_price);
        formData.append("qty", product.qty);
        formData.append("description", product.description);
        formData.append("material", product.material);
        formData.append("origin", product.origin);
        formData.append("style", product.style);
        formData.append("status", product.status);

        if (product.image) {
            formData.append("image", product.image);
        }

        // Gửi mảng ảnh gallery
        if (product.images.length > 0) {
            product.images.forEach((file) => {
                formData.append("images[]", file);
            });
        }

        try {
            const response = await fetch("http://localhost:8000/api/products", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("Thêm sản phẩm thành công!");
                router.push("/admin/products");
            } else {
                const errorMsg = result.errors
                    ? Object.values(result.errors).flat().join("\n")
                    : result.message;
                alert("Lỗi từ hệ thống:\n" + errorMsg);
            }
        } catch (error) {
            alert("Lỗi kết nối: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = "block text-sm font-bold mb-1 text-gray-700";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black mb-3";

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-extrabold mb-8 border-b pb-4 text-gray-800">Thêm sản phẩm mới</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cột trái */}
                    <div>
                        <label className={labelStyle}>Tên sản phẩm *</label>
                        <input type="text" name="product_name" value={product.product_name} onChange={handleChange} className={inputStyle} required />

                        <label className={labelStyle}>Slug *</label>
                        <input type="text" name="slug" value={product.slug} readOnly className={`${inputStyle} bg-gray-100 cursor-not-allowed`} />

                        <label className={labelStyle}>Danh mục *</label>
                        <select name="cat_id" value={product.cat_id} onChange={handleChange} className={inputStyle} required>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                            ))}
                        </select>

                        {/* Ảnh đại diện */}
                        <label className={labelStyle}>Ảnh chính (Thumbnail)</label>
                        <input type="file" name="image" accept="image/*" onChange={handleChange} className={inputStyle} />
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border mb-4" />
                        )}

                        {/* Mảng ảnh Gallery */}
                        <label className={labelStyle}>Bộ sưu tập ảnh (Nhiều ảnh)</label>
                        <input type="file" name="images" accept="image/*" multiple onChange={handleChange} className={inputStyle} />
                        {galleryPreviews.length > 0 && (
                            <div className="flex gap-2 mb-4 overflow-x-auto">
                                {galleryPreviews.map((src, idx) => (
                                    <img key={idx} src={src} alt="Gallery preview" className="w-16 h-16 object-cover rounded-md border" />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Cột phải */}
                    <div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className={labelStyle}>Giá bán (VNĐ)</label>
                                <input type="number" name="price" value={product.price} onChange={handleChange} className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Giá Khuyến mãi</label>
                                <input type="number" name="sale_price" value={product.sale_price} onChange={handleChange} className={inputStyle} />
                            </div>
                        </div>

                        <label className={labelStyle}>Số lượng tồn kho</label>
                        <input type="number" name="qty" value={product.qty} onChange={handleChange} className={inputStyle} />

                        {/* THÔNG TIN BỔ SUNG SHOPEE */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={labelStyle}>Chất liệu</label>
                                <input type="text" name="material" value={product.material} onChange={handleChange} placeholder="VD: Cotton" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Xuất xứ</label>
                                <input type="text" name="origin" value={product.origin} onChange={handleChange} placeholder="VD: Việt Nam" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Phong cách</label>
                                <input type="text" name="style" value={product.style} onChange={handleChange} placeholder="VD: Hàn Quốc" className={inputStyle} />
                            </div>
                        </div>

                        <label className={labelStyle}>Mô tả sản phẩm</label>
                        <textarea name="description" rows="4" value={product.description} onChange={handleChange} className={inputStyle}></textarea>

                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={() => router.back()} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold">Hủy</button>
                            <button type="submit" disabled={loading} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                                {loading ? "Đang lưu..." : "Lưu sản phẩm"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}