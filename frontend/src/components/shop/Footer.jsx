export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-10">
    <div className="container mx-auto px-4 grid grid-cols-4 gap-6 p-6">
        <div>
        <h3 className="font-bold mb-2">ShopX</h3>
        <p className="text-sm text-gray-300">Nền tảng mua sắm online đơn giản bằng Tailwind.</p>
        </div>
        <div>
        <h3 className="font-bold mb-2">Liên kết</h3>
        <ul className="text-sm text-gray-300 space-y-1">
            <li><a href="#">Trang chủ</a></li>
            <li><a href="#">Sản phẩm</a></li>
        </ul>
        </div>
        <div>
        <h3 className="font-bold mb-2">Hỗ trợ</h3>
        <ul className="text-sm text-gray-300 space-y-1">
            <li><a href="#">Chính sách</a></li>
            <li><a href="#">FAQ</a></li>
        </ul>
        </div>
        <div>
        <h3 className="font-bold mb-2">Liên hệ</h3>
        <p className="text-sm text-gray-300">support@shopx.vn</p>
        </div>
    </div>
    <div className="text-center text-sm text-gray-400 pb-4">© 2026 ShopX</div>
    </footer>
  );
}