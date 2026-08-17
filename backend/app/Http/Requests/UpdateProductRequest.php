<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Product;

class UpdateProductRequest extends FormRequest
{
    private ?Product $product = null;

    /**
     * Resolve and cache the product from the route slug once.
     * Abort early with 404 if not found.
     */
    protected function prepareForValidation(): void
    {
        $id = $this->route('id');

        $this->product = Product::find($id);

        if (!$this->product) {
            abort(404, 'Sản phẩm không tồn tại.');
        }
    }

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'productName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'product_name')->ignore($this->product->id),
            ],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($this->product->id),
            ],
            'cat'         => 'required|integer|exists:categories,id',
            'brand'       => 'required|integer|exists:brands,id',
            'price'       => 'required|numeric|min:0',
            'sale_price'  => 'nullable|numeric|lt:price',
            'description' => 'nullable|string',
            'qty'         => 'nullable|integer|min:0',
            'status'      => 'required|boolean',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'productName.required' => 'Tên sản phẩm là bắt buộc.',
            'productName.unique'   => 'Tên sản phẩm đã tồn tại.',
            'slug.required'        => 'Slug là bắt buộc.',
            'slug.unique'          => 'Slug đã tồn tại.',
            'cat.required'         => 'Danh mục là bắt buộc.',
            'brand.required'       => 'Thương hiệu là bắt buộc.',
            'price.required'       => 'Giá tiền là bắt buộc.',
            'price.numeric'        => 'Giá tiền phải là số.',
            'sale_price.numeric'   => 'Giá khuyến mãi phải là số.',
            'sale_price.lt'        => 'Giá khuyến mãi phải nhỏ hơn giá gốc.',
            'image.image'          => 'Tệp tải lên phải là hình ảnh.',
            'image.mimes'          => 'Định dạng hình ảnh không hợp lệ (chỉ chấp nhận jpeg, png, jpg, gif, svg).',
            'image.max'            => 'Hình ảnh không được lớn hơn 2MB.',
        ];
    }

    /**
     * Expose the resolved product to the controller
     * so it doesn't need to query again.
     */
    public function getProduct(): Product
    {
        return $this->product;
    }
}
