<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Exception;
use Illuminate\Database\QueryException;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\UpdateUserRequest;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    // ─────────────────────────────────────────
    // POST /api/auth/local/register
    // ─────────────────────────────────────────
    public function register(RegisterRequest $request)
    {
        try {
            $imagePath = null;

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('users', 'public');
            } elseif ($request->hasFile('avatar')) {
                $imagePath = $request->file('avatar')->store('users', 'public');
            }

            // Tài khoản đăng ký mặc định luôn mang role = 'user'
            $user = User::create([
                'name'     => $request->name,
                'username' => $request->username ?? explode('@', $request->email)[0],
                'email'    => $request->email,
                'password' => Hash::make($request->password),
                'phone'    => $request->phone,
                'address'  => $request->address,
                'dob'      => $request->birthday ?? $request->dob,
                'gender'   => $request->gender,
                'avatar'   => $imagePath,
                'role'     => 'user',
            ]);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error',
                'error'   => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error'   => $e->getMessage()
            ], 500);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
        ], 201);
    }

    // ─────────────────────────────────────────
    // POST /api/auth/local (Đăng nhập)
    // ─────────────────────────────────────────
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại trong hệ thống'], 401);
        }

        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Sai mật khẩu!'], 401);
        }

        // 🛑 KIỂM TRA PHÂN QUYỀN TRANG ADMIN
        // Nếu API này được gọi từ trang Login Admin (có header / flag) hoặc kiểm tra trực tiếp
        // (Nếu là tài khoản đăng nhập Admin thì bắt buộc role phải là 'admin')
        if ($request->has('is_admin_login') && $request->is_admin_login) {
            if ($user->role !== 'admin') {
                return response()->json([
                    'message' => 'Tài khoản của bạn không có quyền truy cập trang quản trị Admin!'
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'data'         => $user,
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'role'         => $user->role ?? 'user', // Trả về rõ role để Frontend dễ lưu
        ], 200);
    }

    // ─────────────────────────────────────────
    // POST /api/auth/logout
    // ─────────────────────────────────────────
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully'
        ], 200);
    }

    // ─────────────────────────────────────────
    // GET /api/auth/me
    // ─────────────────────────────────────────
    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()
        ], 200);
    }

    // ─────────────────────────────────────────
    // PUT /api/auth/me
    // ─────────────────────────────────────────
    public function updateMe(UpdateUserRequest $request)
    {
        $user = $request->user();
        try {
            if ($request->hasFile('image') || $request->hasFile('avatar')) {
                $file = $request->file('image') ?? $request->file('avatar');
                if ($user->avatar) {
                    Storage::disk('public')->delete($user->avatar);
                }
                $user->avatar = $file->store('users', 'public');
            }

            if ($request->filled('name'))     $user->name     = $request->name;
            if ($request->filled('username')) $user->username = $request->username;
            if ($request->filled('email'))    $user->email    = $request->email;
            if ($request->filled('phone'))    $user->phone    = $request->phone;
            if ($request->filled('address'))  $user->address  = $request->address;
            if ($request->filled('birthday')) $user->dob      = $request->birthday;
            if ($request->filled('dob'))      $user->dob      = $request->dob;
            if ($request->filled('gender'))   $user->gender   = $request->gender;
            if ($request->filled('password')) $user->password = Hash::make($request->password);

            $user->save();
            $user = $user->fresh();
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Database error',
                'error'   => $e->getMessage()
            ], 500);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error'   => $e->getMessage()
            ], 500);
        }

        return response()->json([
            'data'    => $user,
            'message' => 'Profile updated successfully'
        ], 200);
    }

    // ─────────────────────────────────────────
    // POST /api/auth/change-password
    // ─────────────────────────────────────────
    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 401);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'message' => 'Password changed successfully'
        ], 200);
    }
}