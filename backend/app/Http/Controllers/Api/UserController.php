<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Lấy danh sách toàn bộ người dùng cho Admin (Mục 9)
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // Xem chi tiết 1 người dùng và các đơn hàng của họ (Mục 10)
    // public function show($id)
    // {
    //     // Sử dụng 'with' để lấy luôn danh sách đơn hàng liên quan
    //     $user = User::with('orders')->find($id);

    //     if (!$user) {
    //         return response()->json(['message' => 'Không tìm thấy người dùng'], 404);
    //     }

    //     return response()->json($user);
    // }
// Sửa lại dòng định nghĩa hàm ở dòng 30
public function show(Request $request, $id = null) 
{
    try {
        // Lấy ID: Ưu tiên $id từ URL (Admin), nếu không có thì lấy từ User đang login
        $userId = $id ?: ($request->user() ? $request->user()->id : null);

        if (!$userId) {
            return response()->json(['message' => 'Bạn chưa đăng nhập hoặc thiếu ID'], 401);
        }

        // Tìm User
        $user = \App\Models\User::findOrFail($userId);

        // Nạp dữ liệu tùy theo URL
        if ($request->is('*admin*')) {
            $user->load(['orders.order_details.product']);
        } else {
            $user->load(['orders']);
        }

        return response()->json($user);

    } catch (\Exception $e) {
        logger("Lỗi chi tiết: " . $e->getMessage());
        return response()->json(['message' => 'Không tìm thấy dữ liệu người dùng'], 404);
    }
}

    // Cập nhật thông tin (Dùng cho cả Admin sửa hoặc User tự sửa)
    public function update(Request $request, $id = null)
    {
        $user = $id ? User::findOrFail($id) : $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:15',
            'address' => 'nullable|string',
        ]);

        $user->update($request->only('name', 'phone', 'address', 'role'));

        return response()->json(['message' => 'Cập nhật thành công', 'user' => $user]);
    }
}