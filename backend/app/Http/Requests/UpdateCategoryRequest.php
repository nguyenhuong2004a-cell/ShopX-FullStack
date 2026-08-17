<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;


class UpdateCategoryRequest extends FormRequest
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
         $id = $this->route('id');
        return [
            'category_name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('categories', 'category_name')->ignore($id),
            ],
            'slug' => [
                'sometimes',
                'string',
                Rule::unique('categories', 'slug')->ignore($id),
            ],
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
