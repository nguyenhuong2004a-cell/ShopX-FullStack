<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderDetail extends Model 
{
    use HasFactory;

    protected $table = 'order_details';

    protected $fillable = [
        'order_id', 
        'product_id', 
        'qty', 
        'price', 
        'total'
    ];

    // Lấy thông tin sản phẩm thuộc dòng chi tiết này
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    // Quan hệ ngược về Order
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}