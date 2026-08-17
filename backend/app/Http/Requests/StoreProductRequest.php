<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    /**
     * Cho phép tất cả request đi qua (kiểm tra Token ở Middleware route)
     */
    public function authorize(): bool
    {
        return true; 
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [       
            // Hỗ trợ cả productName và product_name
            'productName'  => 'nullable|string|max:255|unique:products,product_name',
            'product_name' => 'nullable|string|max:255|unique:products,product_name',
            'slug'         => 'required|string|max:255|unique:products,slug',
            
            // Danh mục (Hỗ trợ cả cat, cat_id, category_id)
            'cat'          => 'nullable',
            'cat_id'       => 'nullable',
            'category_id'  => 'nullable',

            'description'  => 'nullable|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,jfif|max:2048',
            'price'        => 'required|numeric|min:0',
            
            // 🟢 Dùng 'nullable' để không bắt buộc tồn tại ID khi gửi chuỗi rỗng từ Frontend
            'brand'        => 'nullable',
            'brand_id'     => 'nullable',

            'qty'          => 'nullable|integer|min:0',
            'status'       => 'nullable'       
        ];
    }

    /**
     * Tùy chỉnh thông báo lỗi tiếng Việt
     */
    public function messages(): array
    {
        return [
            'productName.required' => 'Tên sản phẩm là bắt buộc.',
            'productName.unique'   => 'Tên sản phẩm đã tồn tại.',
            'slug.required'        => 'Slug là bắt buộc.',
            'slug.unique'          => 'Slug đã tồn tại.',
            'price.required'       => 'Giá tiền là bắt buộc.',
            'price.numeric'        => 'Giá tiền phải là số.',
            'image.image'          => 'Tệp tải lên phải là hình ảnh.',
            'image.mimes'          => 'Định dạng hình ảnh không hợp lệ.',
            'image.max'            => 'Hình ảnh không được lớn hơn 2MB.',
        ];
    }
}