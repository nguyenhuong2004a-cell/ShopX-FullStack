<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserAddress;
use Illuminate\Support\Facades\Validator;

class UserAddressController extends Controller
{
    /**
     * GET /api/user-addresses
     * Lấy danh sách địa chỉ nhận hàng của user đang đăng nhập
     */
    public function index(Request $request)
    {
        $addresses = UserAddress::where('user_id', $request->user()->id)
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($addresses, 200);
    }

    /**
     * POST /api/user-addresses
     * Thêm địa chỉ mới vào sổ địa chỉ
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'recipient_name' => 'required|string|max:255',
            'phone'          => 'required|string|max:20',
            'province'       => 'required|string|max:255',
            'district'       => 'required|string|max:255',
            'ward'           => 'required|string|max:255',
            'address_detail' => 'required|string',
            'is_default'     => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        $userId = $request->user()->id;
        $isDefault = $request->input('is_default', 0);

        // Nếu đây là địa chỉ đầu tiên của user -> tự động set làm mặc định
        $addressCount = UserAddress::where('user_id', $userId)->count();
        if ($addressCount === 0) {
            $isDefault = 1;
        }

        // Nếu đặt địa chỉ mới làm mặc định -> Bỏ mặc định các địa chỉ cũ
        if ($isDefault == 1) {
            UserAddress::where('user_id', $userId)->update(['is_default' => 0]);
        }

        $address = UserAddress::create([
            'user_id'        => $userId,
            'recipient_name' => $request->recipient_name,
            'phone'          => $request->phone,
            'province'       => $request->province,
            'district'       => $request->district,
            'ward'           => $request->ward,
            'address_detail' => $request->address_detail,
            'is_default'     => $isDefault,
        ]);

        return response()->json([
            'message' => 'Thêm địa chỉ thành công!',
            'data'    => $address
        ], 201);
    }

    /**
     * GET /api/user-addresses/{id}
     * Lấy chi tiết 1 địa chỉ theo ID
     */
    public function show(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        return response()->json($address, 200);
    }

    /**
     * PUT/PATCH /api/user-addresses/{id}
     * Cập nhật địa chỉ
     */
    public function update(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $validator = Validator::make($request->all(), [
            'recipient_name' => 'sometimes|required|string|max:255',
            'phone'          => 'sometimes|required|string|max:20',
            'province'       => 'sometimes|required|string|max:255',
            'district'       => 'sometimes|required|string|max:255',
            'ward'           => 'sometimes|required|string|max:255',
            'address_detail' => 'sometimes|required|string',
            'is_default'     => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors'  => $validator->errors()
            ], 422);
        }

        $userId = $request->user()->id;

        // Nếu cập nhật đặt địa chỉ này làm mặc định
        if ($request->has('is_default') && $request->is_default == 1) {
            UserAddress::where('user_id', $userId)->update(['is_default' => 0]);
        }

        $address->update($request->only([
            'recipient_name',
            'phone',
            'province',
            'district',
            'ward',
            'address_detail',
            'is_default'
        ]));

        return response()->json([
            'message' => 'Cập nhật địa chỉ thành công!',
            'data'    => $address
        ], 200);
    }

    /**
     * DELETE /api/user-addresses/{id}
     * Xóa địa chỉ khỏi sổ địa chỉ
     */
    public function destroy(Request $request, $id)
    {
        $address = UserAddress::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        $address->delete();

        return response()->json([
            'message' => 'Đã xóa địa chỉ thành công!'
        ], 200);
    }

    /**
     * PATCH /api/user-addresses/{id}/set-default
     * Đặt nhanh địa chỉ làm mặc định
     */
    public function setDefault(Request $request, $id)
    {
        $userId = $request->user()->id;

        // Bỏ mặc định tất cả
        UserAddress::where('user_id', $userId)->update(['is_default' => 0]);

        // Đặt địa chỉ được chọn làm mặc định
        $address = UserAddress::where('user_id', $userId)
            ->where('id', $id)
            ->firstOrFail();

        $address->update(['is_default' => 1]);

        return response()->json([
            'message' => 'Đã đặt làm địa chỉ mặc định!',
            'data'    => $address
        ], 200);
    }
}