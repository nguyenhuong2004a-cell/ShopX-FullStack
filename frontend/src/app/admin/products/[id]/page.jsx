"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getOnlySubCategories } from "@/services/categoryServices";
import Cookies from "js-cookie";

export default function EditProductPage() {
    const router = useRouter();
    const { id } = useParams();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Preview hình ảnh
    const [imagePreview, setImagePreview] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // 1. State khởi tạo đầy đủ các trường (Bao gồm các trường Shopee)
    const [product, setProduct] = useState({
        product_name: "",
        slug: "",
        cat_id: "",
        brand_id: 1,
        price: "",
        sale_price: "0",
        qty: "",
        description: "",
        material: "",
        origin: "",
        style: "",
        status: 1,
        image: null,      // File ảnh mới chọn (nếu có)
        images: []        // Danh sách File gallery mới chọn (nếu có)
    });

    const imageBaseUrl = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:8000/storage/";

    // 2. Load dữ liệu cũ của sản phẩm và danh sách danh mục
    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            const token = Cookies.get("admin_token");

            try {
                // Lấy danh mục
                const cats = await getOnlySubCategories();
                setCategories(cats);

                // Lấy thông tin chi tiết sản phẩm cũ
                const res = await fetch(`http://localhost:8000/api/products/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Accept": "application/json"
                    }
                });

                if (res.ok) {
                    const result = await res.json();
                    const data = result.data || result;

                    setProduct({
                        product_name: data.product_name || "",
                        slug: data.slug || "",
                        cat_id: data.cat_id || "",
                        brand_id: data.brand_id || 1,
                        price: data.price || "",
                        sale_price: data.sale_price || "0",
                        qty: data.qty || "",
                        description: data.description || "",
                        material: data.material || "",
                        origin: data.origin || "",
                        style: data.style || "",
                        status: data.status ?? 1,
                        image: null,
                        images: []
                    });

                    // Set preview ảnh đại diện cũ
                    if (data.image) {
                        setImagePreview(data.image.startsWith("http") ? data.image : `${imageBaseUrl}${data.image}`);
                    }

                    // Set preview bộ sưu tập ảnh cũ (nếu có)
                    let oldGallery = [];
                    if (Array.isArray(data.images)) {
                        oldGallery = data.images;
                    } else if (typeof data.images === "string") {
                        try { oldGallery = JSON.parse(data.images); } catch (e) { oldGallery = []; }
                    }
                    if (oldGallery.length > 0) {
                        setGalleryPreviews(oldGallery.map(img => img.startsWith("http") ? img : `${imageBaseUrl}${img}`));
                    }
                }
            } catch (error) {
                console.error("Lỗi load dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) loadInitialData();
    }, [id]);

    // 3. Xử lý khi nhập dữ liệu hoặc chọn file
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "image") {
            const file = files[0];
            if (file) {
                setProduct({ ...product, image: file });
                setImagePreview(URL.createObjectURL(file));
            }
        } else if (name === "images") {
            const fileList = Array.from(files);
            setProduct({ ...product, images: fileList });
            setGalleryPreviews(fileList.map((f) => URL.createObjectURL(f)));
        } else if (name === "product_name") {
            // Tự động tạo Slug chuẩn Tiếng Việt
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

    // 4. Submit form cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = Cookies.get("admin_token");

        // Dùng FormData để gửi được File
        const formData = new FormData();
        formData.append("_method", "PUT"); // Giả lập phương thức PUT trong Laravel
        formData.append("productName", product.product_name);
        formData.append("slug", product.slug);
        formData.append("cat", product.cat_id);
        formData.append("brand", product.brand_id);
        formData.append("price", product.price);
        formData.append("sale_price", product.sale_price);
        formData.append("qty", product.qty);
        formData.append("description", product.description || "");
        formData.append("material", product.material || "");
        formData.append("origin", product.origin || "");
        formData.append("style", product.style || "");
        formData.append("status", product.status);

        // Ảnh đại diện mới (nếu người dùng chọn lại)
        if (product.image instanceof File) {
            formData.append("image", product.image);
        }

        // Danh sách ảnh gallery mới (nếu người dùng chọn lại)
        if (product.images.length > 0) {
            product.images.forEach((file) => {
                formData.append("images[]", file);
            });
        }

        try {
            // Dùng POST kết hợp với _method: PUT để gửi FormData qua Laravel
            const response = await fetch(`http://localhost:8000/api/products/${id}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                alert("Cập nhật sản phẩm thành công!");
                router.push("/admin/products");
            } else {
                const errorMsg = result.errors
                    ? Object.values(result.errors).flat().join("\n")
                    : (result.message || "Không thể cập nhật sản phẩm");
                alert("Lỗi hệ thống:\n" + errorMsg);
            }
        } catch (error) {
            alert("Lỗi kết nối: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const labelStyle = "block text-sm font-bold mb-1 text-gray-700";
    const inputStyle = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black mb-3";

    if (loading && !product.product_name) {
        return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-extrabold mb-8 border-b pb-4 text-gray-800 text-center">
                    Chỉnh sửa sản phẩm #{id}
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* CỘT TRÁI */}
                    <div>
                        <div>
                            <label className={labelStyle}>Tên sản phẩm *</label>
                            <input
                                type="text"
                                name="product_name"
                                className={inputStyle}
                                value={product.product_name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Slug *</label>
                            <input
                                type="text"
                                name="slug"
                                className={`${inputStyle} bg-gray-100 cursor-not-allowed`}
                                value={product.slug}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className={labelStyle}>Danh mục *</label>
                            <select
                                name="cat_id"
                                className={inputStyle}
                                value={product.cat_id}
                                onChange={handleChange}
                                required
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.category_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Upload Ảnh Đại Diện Main */}
                        <div>
                            <label className={labelStyle}>Ảnh đại diện sản phẩm</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                className={inputStyle}
                                onChange={handleChange}
                            />
                            {imagePreview && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Xem trước ảnh chính:</p>
                                    <img
                                        src={imagePreview}
                                        alt="Main Preview"
                                        className="w-28 h-28 object-cover rounded-md border"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Upload Mảng Ảnh Gallery */}
                        <div>
                            <label className={labelStyle}>Bộ sưu tập ảnh (Nhiều ảnh)</label>
                            <input
                                type="file"
                                name="images"
                                accept="image/*"
                                multiple
                                className={inputStyle}
                                onChange={handleChange}
                            />
                            {galleryPreviews.length > 0 && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Xem trước album ảnh:</p>
                                    <div className="flex gap-2 overflow-x-auto mb-4 pb-2">
                                        {galleryPreviews.map((src, idx) => (
                                            <img
                                                key={idx}
                                                src={src}
                                                alt="Gallery Preview"
                                                className="w-16 h-16 object-cover rounded-md border flex-shrink-0"
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CỘT PHẢI */}
                    <div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelStyle}>Giá bán (VNĐ) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className={inputStyle}
                                    value={product.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Giá Khuyến Mãi (VNĐ)</label>
                                <input
                                    type="number"
                                    name="sale_price"
                                    className={inputStyle}
                                    value={product.sale_price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Số lượng trong kho *</label>
                            <input
                                type="number"
                                name="qty"
                                className={inputStyle}
                                value={product.qty}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* THÔNG TIN SHOPEE BỔ SUNG */}
                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label className={labelStyle}>Chất liệu</label>
                                <input
                                    type="text"
                                    name="material"
                                    placeholder="Cotton..."
                                    className={inputStyle}
                                    value={product.material}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Xuất xứ</label>
                                <input
                                    type="text"
                                    name="origin"
                                    placeholder="Việt Nam..."
                                    className={inputStyle}
                                    value={product.origin}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className={labelStyle}>Phong cách</label>
                                <input
                                    type="text"
                                    name="style"
                                    placeholder="Hàn Quốc..."
                                    className={inputStyle}
                                    value={product.style}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelStyle}>Mô tả chi tiết sản phẩm</label>
                            <textarea
                                name="description"
                                rows="5"
                                className={inputStyle}
                                value={product.description}
                                onChange={handleChange}
                                placeholder="Nhập bài viết mô tả sản phẩm..."
                            ></textarea>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>

                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg font-bold hover:bg-gray-300 transition"
                            >
                                Quay lại
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}