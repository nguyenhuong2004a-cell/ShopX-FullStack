import { NextResponse } from 'next/server';

export function middleware(request) {
    // 1. Lấy token & role từ cookie
    const token = request.cookies.get('admin_token')?.value;
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === '/admin/login';
    const isAdminPage = pathname.startsWith('/admin');

    // TRƯỜNG HỢP 1: Đã đăng nhập chuẩn ADMIN mà cố tình vào lại trang Login -> Cho thẳng vào Dashboard
    if (token && role === 'admin' && isLoginPage) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // TRƯỜNG HỢP 2: Truy cập vào vùng Admin
    if (isAdminPage && !isLoginPage) {
        // Chưa đăng nhập HOẶC không phải role admin -> Đẩy về trang Đăng nhập Admin
        if (!token || role !== 'admin') {
            const response = NextResponse.redirect(new URL('/admin/login', request.url));
            // Xóa sạch cookie hỏng nếu có
            response.cookies.delete('admin_token');
            response.cookies.delete('user_role');
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*']
};