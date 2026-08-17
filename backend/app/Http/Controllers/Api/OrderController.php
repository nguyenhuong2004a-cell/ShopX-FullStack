<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * 1. Lấy danh sách đơn hàng dành cho Admin
     */
    public function adminIndex()
    {
        try {
            $orders = Order::with('user')->orderBy('created_at', 'desc')->get();
            return response()->json($orders, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 2. Lấy lịch sử đơn hàng của khách hàng (User)
     */
    public function index(Request $request)
    {
        try {
            $orders = Order::with(['items.product'])
                ->where('user_id', $request->user()->id)
                ->orderBy('created_at', 'desc')
                ->get();
            return response()->json($orders, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 3. Xem chi tiết 1 đơn hàng (Admin & User)
     */
    public function show($id)
    {
        try {
            $order = Order::with(['items.product', 'user'])->findOrFail($id);
            return response()->json($order, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        }
    }

    /**
     * 4. Tạo đơn hàng mới từ giỏ hàng
     */
    public function store(Request $request)
    {
        DB::beginTransaction();
        try {
            $userId = $request->user() ? $request->user()->id : null;

            $order = Order::create([
                'user_id'          => $userId,
                'customer_name'    => $request->customer_name ?? ($request->user() ? $request->user()->name : 'Khách hàng'),
                'customer_phone'   => $request->customer_phone ?? '',
                'customer_address' => $request->customer_address ?? '',
                'total_amount'     => $request->total ?? $request->total_amount ?? 0,
                'status'           => 'pending',
            ]);

            $items = $request->items;

            if (empty($items) || !is_array($items)) {
                throw new \Exception("Danh sách sản phẩm thanh toán đang trống!");
            }

            foreach ($items as $item) {
                OrderDetail::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['id'],
                    'qty'        => $item['qty'],
                    'price'      => $item['price'],
                    'total'      => $item['total'] ?? ($item['price'] * $item['qty']),
                ]);
            }

            DB::commit();

            return response()->json([
                'message'  => 'Đặt hàng thành công!',
                'order_id' => $order->id
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error'   => $e->getMessage(),
                'message' => 'Lỗi tạo đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * 5. Cập nhật tình trạng đơn hàng (Admin)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);
            
            $order->update([
                'status' => $request->status
            ]);

            return response()->json(['message' => 'Cập nhật trạng thái thành công']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * 6. Lấy thông báo đơn hàng mới
     */
    public function getNotifications()
    {
        try {
            $newOrders = Order::with('user')
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get();

            return response()->json([
                'unread_count' => $newOrders->count(),
                'orders'       => $newOrders
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'unread_count' => 0,
                'orders'       => []
            ], 200);
        }
    }
}