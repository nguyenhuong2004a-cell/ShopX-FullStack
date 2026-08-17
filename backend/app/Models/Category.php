<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'categories'; // Specify the table name

    protected $fillable = [
        'id',
        'category_name',
        'slug',
        'parent_id',
        'sort_order',
        'image',
        'description',
        'created_by',
        'updated_by',
        'status'
    ];

    protected $dates = ['deleted_at']; // For soft deletes

    /**
     * Get the parent category
     */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }
    /**
     * Get child categories
     */
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
