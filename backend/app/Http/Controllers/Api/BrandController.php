<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;

class BrandController extends Controller
{
    public function index()
    {
        return response()->json(Brand::all());
    }

    public function store(Request $request)
    {
        try {
            $brand = Brand::create([
                'name'        => $request->name,
                'slug'        => $request->slug,
                'description' => $request->description,
                'status'      => $request->status ?? 1,
                'created_by' => \Illuminate\Support\Facades\Auth::id() ?? 1,
            ]);

            return response()->json($brand, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $brand = Brand::find($id);
        if (!$brand) return response()->json(['message' => 'Không tìm thấy'], 404);
        return response()->json($brand);
    }

    public function update(Request $request, $id)
    {
        $brand = Brand::find($id);
        if (!$brand) return response()->json(['message' => 'Không tìm thấy'], 404);

        $brand->update($request->all());
        return response()->json($brand);
    }

    public function destroy($id)
    {
        $brand = Brand::find($id);
        if (!$brand) return response()->json(['message' => 'Không tìm thấy'], 404);
        
        $brand->delete();
        return response()->json(['message' => 'Xóa thành công']);
    }
}