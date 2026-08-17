<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Brand extends Model
{
    use SoftDeletes, HasFactory;

    protected $table = 'brands';

    // Thêm dòng này để cho phép lưu dữ liệu vào các cột tương ứng
    protected $fillable = [
        'name',
        'slug',
        'image',
        'description',
        'status',
        'created_by'
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}