<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats(Request $request)
    {
        try {
            $period = $request->query('period', 'month');

            $orderQuery = Order::query();
            // Lọc chỉ đếm khách hàng thông thường (role = 'user')
            $userQuery  = User::where('role', 'user');

            // Xử lý mốc thời gian
            if ($period === 'day') {
                $startDate = Carbon::today();
                $orderQuery->where('created_at', '>=', $startDate);
                $userQuery->where('created_at', '>=', $startDate);
            } elseif ($period === 'week') {
                $startDate = Carbon::now()->startOfWeek();
                $orderQuery->where('created_at', '>=', $startDate);
                $userQuery->where('created_at', '>=', $startDate);
            } elseif ($period === 'month') {
                $startDate = Carbon::now()->startOfMonth();
                $orderQuery->where('created_at', '>=', $startDate);
                $userQuery->where('created_at', '>=', $startDate);
            }
            // Nếu $period === 'all' thì giữ nguyên query lấy toàn bộ DB

            // Tính tổng tiền: Ưu tiên cộng cột total_amount (hoặc total nếu total_amount null)
            $totalRevenue = $orderQuery->sum('total_amount') ?: $orderQuery->sum('total');

            return response()->json([
                'status' => 'success',
                'data'   => [
                    'revenue'   => (float) $totalRevenue,
                    'orders'    => $orderQuery->count(),
                    'products'  => Product::count(),
                    'customers' => $userQuery->count(),
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}