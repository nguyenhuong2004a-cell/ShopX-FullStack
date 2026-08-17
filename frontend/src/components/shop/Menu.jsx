"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Menu() {
    const [keyword, setKeyword] = useState("");
    const [brandId, setBrandId] = useState("");
    const router = useRouter();

    const handleSearch = (e) => {
        e.preventDefault();
        // Khi bấm tìm kiếm, sẽ chuyển hướng sang trang sản phẩm kèm tham số
        router.push(`/products?search=${keyword}&brand=${brandId}`);
    };

    return (
        <nav className="bg-white shadow-sm py-3 border-b">
            <div className="container mx-auto flex items-center justify-between px-4">
                <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-2xl">
                    {/* Ô tìm kiếm tên */}
                    <input 
                        type="text"
                        placeholder="Tìm sản phẩm..."
                        className="border p-2 rounded-md flex-grow text-black"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />

                    {/* Bộ lọc nhà cung cấp theo ID trong hình bạn gửi */}
                    <select 
                        className="border p-2 rounded-md text-black bg-white"
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                    >
                        <option value="">Tất cả thương hiệu</option>
                        <option value="1">Việt Tiến</option>
                        <option value="2">Hồng Hà</option>
                        <option value="3">Lucy</option>
                        <option value="4">Amany</option>
                        <option value="5">Dirty Coin</option>
                    </select>

                    <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-md font-bold">
                        Lọc
                    </button>
                </form>
            </div>
        </nav>
    );
}