<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 
        'customer_name',    // 🆕 Bổ sung tên người nhận
        'customer_phone',   // 🆕 Bổ sung SĐT nhận
        'customer_address', // 🆕 Bổ sung Địa chỉ nhận
        'total_amount', 
        'status', 
        'created_by',
        'updated_by'
    ];

    // Quan hệ với bảng OrderDetail
    public function order_details(): HasMany 
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    // Alias items() để linh hoạt gọi API
    public function items(): HasMany 
    {
        return $this->hasMany(OrderDetail::class, 'order_id');
    }

    // Quan hệ lấy thông tin User đặt hàng
    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}