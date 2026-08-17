<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\Request;

class MenuController extends Controller {
    // 18. Danh sách menu
    // app/Http/Controllers/MenuController.php

    public function index()
    {
        $menus = \App\Models\Menu::all(); 
        return response()->json($menus); // Phải đảm bảo trả về một JSON Array
    }

    // 19. Thêm menu
    public function store(Request $request) {
        $menu = Menu::create($request->all());
        return response()->json(['message' => 'Thêm menu thành công', 'data' => $menu]);
    }

    // 20. Sửa menu
    public function update(Request $request, $id) {
        $menu = Menu::findOrFail($id);
        $menu->update($request->all());
        return response()->json(['message' => 'Cập nhật thành công', 'data' => $menu]);
    }

    // 21. Xóa menu
    public function destroy($id) {
        Menu::destroy($id);
        return response()->json(['message' => 'Đã xóa menu']);
    }
}