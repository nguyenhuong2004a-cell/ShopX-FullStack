"use client";

import axios from 'axios';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    // Danh sách các địa chỉ đã lưu từ DB
    const [savedAddresses, setSavedAddresses] = useState([]);
    // State lưu ID địa chỉ đang được chọn (mặc định chọn "new" hoặc ID của địa chỉ mặc định)
    const [selectedAddressId, setSelectedAddressId] = useState("new");

    // Form thông tin người nhận
    const [addressForm, setAddressForm] = useState({
        recipient_name: "",
        phone: "",
        province: "",
        district: "",
        ward: "",
        address_detail: "",
        save_address: true // Mặc định tích chọn lưu địa chỉ mới
    });

    // Hàm gọi API lấy danh sách địa chỉ đã lưu của User
    const fetchAddresses = async () => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const res = await axios.get("http://127.0.0.1:8000/api/user-addresses", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const addrs = res.data || [];
                setSavedAddresses(addrs);

                // Nếu user đã có địa chỉ lưu -> Chọn sẵn địa chỉ mặc định (is_default === 1)
                if (addrs.length > 0) {
                    const defaultAddr = addrs.find(a => a.is_default === 1) || addrs[0];
                    applyAddressToForm(defaultAddr);
                } else {
                    // Nếu chưa có địa chỉ nào -> Điền tên/SĐT từ localStorage
                    setSelectedAddressId("new");
                    setAddressForm(prev => ({
                        ...prev,
                        recipient_name: localStorage.getItem("userName") || "",
                        phone: localStorage.getItem("userPhone") || "",
                    }));
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách địa chỉ:", err);
            }
        }
    };

    useEffect(() => {
        const selectedCart = JSON.parse(
            localStorage.getItem("checkout_items") || localStorage.getItem("cart") || "[]"
        );

        if (selectedCart.length === 0) {
            alert("Không có sản phẩm nào được chọn để thanh toán!");
            router.push("/cart");
            return;
        }
        setCart(selectedCart);

        fetchAddresses();
        setLoading(false);
    }, [router]);

    // Gán dữ liệu địa chỉ được chọn vào Form
    const applyAddressToForm = (addr) => {
        setSelectedAddressId(addr.id);
        setAddressForm({
            recipient_name: addr.recipient_name || "",
            phone: addr.phone || "",
            province: addr.province || "",
            district: addr.district || "",
            ward: addr.ward || "",
            address_detail: addr.address_detail || "",
            save_address: false
        });
    };

    // Khi người dùng bấm chọn một địa chỉ khác từ danh sách hoặc bấm "Thêm mới"
    const handleSelectSavedAddress = (id) => {
        if (id === "new") {
            setSelectedAddressId("new");
            setAddressForm({
                recipient_name: localStorage.getItem("userName") || "",
                phone: localStorage.getItem("userPhone") || "",
                province: "",
                district: "",
                ward: "",
                address_detail: "",
                save_address: true
            });
        } else {
            const addr = savedAddresses.find(a => String(a.id) === String(id));
            if (addr) applyAddressToForm(addr);
        }
    };

    const subtotal = cart.reduce((acc, item) => {
        const price = item.sale_price > 0 ? item.sale_price : item.price;
        return acc + price * item.qty;
    }, 0);

    const fullAddress = `${addressForm.address_detail}, ${addressForm.ward}, ${addressForm.district}, ${addressForm.province}`;

    const handleCheckout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("Vui lòng đăng nhập trước khi thanh toán!");
                router.push("/login");
                return;
            }

            // 1. Tạo đơn hàng
            const orderData = {
                total: subtotal,
                customer_name: addressForm.recipient_name,
                customer_phone: addressForm.phone,
                customer_address: fullAddress,
                items: cart.map((item) => {
                    const itemPrice = item.sale_price > 0 ? item.sale_price : item.price;
                    return {
                        id: item.id,
                        price: itemPrice,
                        qty: item.qty,
                        total: itemPrice * item.qty
                    };
                }),
            };

            const res = await axios.post("http://127.0.0.1:8000/api/orders/store", orderData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 200 || res.status === 201) {
                // 2. Nếu đang chọn nhập địa chỉ mới VÀ tích chọn "Lưu địa chỉ" -> Gọi API lưu địa chỉ mới vào CSDL
                if (selectedAddressId === "new" && addressForm.save_address) {
                    try {
                        await axios.post("http://127.0.0.1:8000/api/user-addresses", {
                            recipient_name: addressForm.recipient_name,
                            phone: addressForm.phone,
                            province: addressForm.province,
                            district: addressForm.district,
                            ward: addressForm.ward,
                            address_detail: addressForm.address_detail,
                            is_default: savedAddresses.length === 0 ? 1 : 0
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                    } catch (err) {
                        console.error("Lỗi lưu địa chỉ mới:", err);
                    }
                }

                alert("Chúc mừng! Đặt hàng thành công.");

                // Xóa giỏ hàng đã mua
                const originalCart = JSON.parse(localStorage.getItem("cart") || "[]");
                const purchasedIds = cart.map(item => item.id);
                const remainingCart = originalCart.filter(item => !purchasedIds.includes(item.id));

                localStorage.setItem("cart", JSON.stringify(remainingCart));
                localStorage.removeItem("checkout_items");

                router.push("/");
            }
        } catch (error) {
            console.error("Checkout Error:", error);
            alert("Lỗi: " + (error.response?.data?.message || error.response?.data?.error || "Không thể xử lý đơn hàng"));
        }
    };

    if (loading) return <div className="text-center py-20 text-black">Đang chuẩn bị đơn hàng...</div>;

    const inputClass = "w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-black text-sm bg-white";

    return (
        <div className="min-h-screen bg-[#f8f9fa] py-10 text-black">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Xác nhận thanh toán</h1>

                <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* KHỐI BÊN TRÁI: ĐỊA CHỈ NHẬN HÀNG */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            
                            {/* DANH SÁCH TẤT CẢ CÁC ĐỊA CHỈ ĐÃ LƯU */}
                            {savedAddresses.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        📍 Chọn từ Sổ địa chỉ đã lưu ({savedAddresses.length}):
                                    </h3>
                                    
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => handleSelectSavedAddress(addr.id)}
                                                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                                    String(selectedAddressId) === String(addr.id)
                                                        ? "border-indigo-600 bg-indigo-50/50"
                                                        : "border-gray-200 hover:border-gray-300 bg-white"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {addr.recipient_name} <span className="font-normal text-gray-500">({addr.phone})</span>
                                                    </span>
                                                    {addr.is_default === 1 && (
                                                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                                            Mặc định
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {addr.address_detail}, {addr.ward}, {addr.district}, {addr.province}
                                                </p>
                                            </div>
                                        ))}

                                        {/* NÚT THÊM ĐỊA CHỈ MỚI */}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectSavedAddress("new")}
                                            className={`w-full py-2.5 px-4 rounded-xl border-2 border-dashed font-semibold text-xs transition-all ${
                                                selectedAddressId === "new"
                                                    ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                                                    : "border-gray-300 text-gray-600 hover:border-indigo-400"
                                            }`}
                                        >
                                            + Nhập và sử dụng địa chỉ giao hàng mới
                                        </button>
                                    </div>
                                </div>
                            )}

                            <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2 border-t pt-4">
                                <span className="bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                                {selectedAddressId === "new" ? "Nhập thông tin địa chỉ mới" : "Chi tiết địa chỉ được chọn"}
                            </h2>
                            
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tên người nhận *</label>
                                        <input 
                                            type="text" 
                                            value={addressForm.recipient_name} 
                                            onChange={(e) => setAddressForm({...addressForm, recipient_name: e.target.value})}
                                            className={inputClass} 
                                            placeholder="Nguyễn Văn A"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Số điện thoại *</label>
                                        <input 
                                            type="tel" 
                                            value={addressForm.phone} 
                                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                                            className={inputClass} 
                                            placeholder="0987654321"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tỉnh / Thành *</label>
                                        <input 
                                            type="text" 
                                            value={addressForm.province} 
                                            onChange={(e) => setAddressForm({...addressForm, province: e.target.value})}
                                            className={inputClass} 
                                            placeholder="Ninh Bình"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Quận / Huyện *</label>
                                        <input 
                                            type="text" 
                                            value={addressForm.district} 
                                            onChange={(e) => setAddressForm({...addressForm, district: e.target.value})}
                                            className={inputClass} 
                                            placeholder="TP. Ninh Bình"
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Phường / Xã *</label>
                                        <input 
                                            type="text" 
                                            value={addressForm.ward} 
                                            onChange={(e) => setAddressForm({...addressForm, ward: e.target.value})}
                                            className={inputClass} 
                                            placeholder="Phường Vân Giang"
                                            required 
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Địa chỉ chi tiết (Số nhà, tên đường) *</label>
                                    <input 
                                        type="text"
                                        value={addressForm.address_detail}
                                        onChange={(e) => setAddressForm({...addressForm, address_detail: e.target.value})}
                                        className={inputClass} 
                                        placeholder="Số 123 đường Trần Hưng Đạo"
                                        required
                                    />
                                </div>

                                {selectedAddressId === "new" && (
                                    <div className="flex items-center gap-2 pt-2">
                                        <input 
                                            type="checkbox"
                                            id="save_addr"
                                            checked={addressForm.save_address}
                                            onChange={(e) => setAddressForm({...addressForm, save_address: e.target.checked})}
                                            className="w-4 h-4 text-indigo-600 rounded cursor-pointer accent-indigo-600"
                                        />
                                        <label htmlFor="save_addr" className="text-xs text-gray-700 cursor-pointer font-medium">
                                            Lưu địa chỉ này vào Sổ địa chỉ để dùng cho các lần sau
                                        </label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-base font-bold text-gray-800 mb-3">Phương thức vận chuyển</h2>
                            <div className="p-3 border-2 border-indigo-600 bg-indigo-50 rounded-xl flex items-center gap-3">
                                <div className="w-4 h-4 border-4 border-indigo-600 rounded-full"></div>
                                <span className="font-semibold text-sm text-indigo-900">Giao hàng nhanh (Miễn phí vận chuyển)</span>
                            </div>
                        </div>
                    </div>

                    {/* KHỐI BÊN PHẢI: TÓM TẮT ĐƠN HÀNG */}
                    <div className="lg:col-span-5">
                        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 sticky top-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-4">Tóm tắt đơn hàng ({cart.length} món)</h2>
                            
                            <div className="max-h-[300px] overflow-y-auto pr-2 mb-4 space-y-3">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center border-b border-gray-100 pb-3">
                                        <img 
                                            src={item.image?.startsWith("http") ? item.image : `http://127.0.0.1:8000/storage/${item.image}`} 
                                            className="w-14 h-14 object-cover rounded-lg border" 
                                            alt={item.product_name} 
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{item.product_name}</h4>
                                            <p className="text-[11px] text-gray-500">SL: x{item.qty}</p>
                                        </div>
                                        <div className="text-xs font-bold text-gray-900">
                                            {((item.sale_price || item.price) * item.qty).toLocaleString()}đ
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2 border-t pt-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500">Tạm tính</span>
                                    <span className="text-gray-900 font-semibold">{subtotal.toLocaleString()}đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-dashed">
                                    <span className="text-base font-bold text-gray-800">Tổng thanh toán</span>
                                    <span className="text-xl font-black text-red-600">
                                        {subtotal.toLocaleString()}đ
                                    </span>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold mt-6 hover:bg-indigo-700 transition-all shadow-md uppercase text-xs tracking-wider"
                            >
                                Đặt hàng ngay
                            </button>
                        </div>
                    </div>

                </form>
            </div>
        </div>
    );
}