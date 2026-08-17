<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'product_name',
        'slug',
        'cat_id',
        'brand_id',
        'image',
        'images',
        'price',
        'is_on_sale',
        'sale_price',
        'qty',
        'views',
        'material',
        'origin',
        'style',
        'size_chart',
        'description',
        'status',
        'created_by',
        'updated_by',
    ];

    // Ép kiểu cột images tự động chuyển thành Array khi trả về API
    protected $casts = [
        'images' => 'array',
        'is_on_sale' => 'boolean',
        'price' => 'double',
        'sale_price' => 'double',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'cat_id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }
}