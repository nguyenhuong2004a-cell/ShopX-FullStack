<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'category_name' => 'required|string|max:255|unique:categories,category_name',
            'slug' => 'required|string|unique:categories,slug',
            'parent_id' => 'nullable|integer',
            'status' => 'required|in:0,1',
        ];
    }

    public function messages(): array
    {
        return [
            'category_name.required' => 'Tên danh mục là bắt buộc.',
            'category_name.unique' => 'Tên danh mục đã tồn tại.',
            'slug.required' => 'Slug là bắt buộc.',
            'slug.unique' => 'Slug đã tồn tại.',
        ];
    }
}
