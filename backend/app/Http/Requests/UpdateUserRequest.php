<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateUserRequest extends FormRequest
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
        $userId = Auth::id(); // Or $this->user()->id

        return [
            'name' => 'required|string|max:255',
            'gender' => 'required|in:0,1',
            'birthday' => 'nullable|date',
            'phone' => 'required|string|max:10|unique:users,phone,' . $userId,
            'email' => 'required|email|unique:users,email,' . $userId,
            'address' => 'nullable|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $userId,
            'password' => 'nullable|string|min:6', // not required
            'image' => 'nullable|image|mimes:jpg,jpeg,png,gif|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.unique' => 'Email đã được sử dụng.',
            'phone.required' => 'Vui lòng nhập sđt.',
            'phone.unique' => 'Sđt đã được sử dụng.',
            'username.required' => 'Vui lòng nhập tên đăng nhập.',
            'username.unique' => 'Tên đăng nhập đã tồn tại.',
            'password.min' => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'image.image' => 'File tải lên phải là ảnh.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
