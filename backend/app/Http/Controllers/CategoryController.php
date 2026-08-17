<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
use App\Traits\QueryHelper;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    use QueryHelper;

    public function __construct()
    {
        $this->allowedFields = [
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

        $this->allowedFilters    = ['parent_id', 'status'];
        $this->allowedSortFields = ['id', 'category_name', 'slug', 'created_at'];
    }
    //get all categories
    // public function index()
    // {
    //     return response()->json([
    //         'categories' => Category::all()
    //     ]);
    // }
    public function index()
    {
        // Lấy tất cả danh mục từ database
        $categories = \App\Models\Category::all();
        return response()->json($categories);
    }
    //get all categories with pagination
    public function getCategoriesByPageSize(Request $request)
    {
        $page     = $request->input('pagination.page', 1);
        $pageSize = $request->input('pagination.pageSize', 10);
        $skip     = ($page - 1) * $pageSize;

        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $query = Category::withoutTrashed()
            ->select($selectedFields)
            ->with($relations);

        $query = $this->applySort($query, $request);
        $query = $this->applyFilters($query, $request);

        $total    = $query->count();
        $categories = $query->skip($skip)->take($pageSize)->get();
        return response()->json([
            'data'       => $categories,
            'pagination' => [
                'page'      => (int) $page,
                'pageSize'  => (int) $pageSize,
                'total'     => $total,
                'pageCount' => (int) ceil($total / $pageSize),
            ],
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }
    //get all categories without trashed pagination
    public function getTrashedCategoriesByPageSize(Request $request)
    {
        $page     = $request->input('pagination.page', 1);
        $pageSize = $request->input('pagination.pageSize', 10);
        $skip     = ($page - 1) * $pageSize;

        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $query = Category::onlyTrashed()
            ->select($selectedFields)
            ->with($relations);

        $query = $this->applySort($query, $request);
        $query = $this->applyFilters($query, $request);

        $total    = $query->count();
        $categories = $query->skip($skip)->take($pageSize)->get();
        return response()->json([
            'data'       => $categories,
            'pagination' => [
                'page'      => (int) $page,
                'pageSize'  => (int) $pageSize,
                'total'     => $total,
                'pageCount' => (int) ceil($total / $pageSize),
            ],
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    //get parent categories
    public function getParentCategories()
    {
        $categories = Category::where('parent_id', 0)->get();
        return response()->json($categories, 200);
    }
    //get category with status = 1, without trashed
    public function getActiveCategories()
    {
        $categories = Category::withoutTrashed()
            ->where('status', 1)
            ->get();
        return response()->json($categories, 200);
    }
    //get category with status = 0
    public function getInactiveCategories()
    {
        $categories = Category::where('status', 0)->get();
        return response()->json($categories, 200);
    }

    //get category by id
    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return response()->json($category, 200);
    }

    //get category by slug
    public function showBySlug($slug)
    {
        $category = Category::where('slug', $slug)->first();
        if (!$category) {
            return response()->json(['message' => 'Category not found'], 404);
        }
        return response()->json($category, 200);
    }

    // POST /api/categories
    // public function store(StoreCategoryRequest $request)
    // {
    //     $validated = $request->validated();

    //     $category = Category::create([
    //         'category_name'   => $validated['category_name'],
    //         'slug'   => Str::slug($validated['category_name']),
    //         'parent_id' => $validated['parent_id'],
    //         'status' => $validated['status'] ?? 1,
    //     ]);


    //     $category = Category::create([
    //         'category_name'   => $validated['category_name'],
    //         'slug'   => Str::slug($validated['category_name']),
    //         'parent_id' => $validated['parent_id'],
    //         'status' => $validated['status'] ?? 1,
    //     ]);

    //     return response()->json([
    //         'message'  => 'Category created successfully',
    //         'category' => $category
    //     ], 201);
    // }

    public function store(StoreCategoryRequest $request)
    {
        try {
            $validated = $request->validated();

            // Map frontend field names to DB column names
            $data = [
                'category_name' => $validated['category_name'],
                'slug'         => $validated['slug'],
                'parent_id'    => $validated['parent_id'],
                'status'       => $validated['status'] ?? 1,
            ];

            // Handle image upload
            // if ($request->hasFile('image')) {
            //     $data['image'] = $request->file('image')->store('products', 'public');
            // }

            $category = Category::create($data);

            return response()->json([
                'message' => 'Thêm danh mục thành công.',
                'data'    => $category,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi tạo danh mục.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }
    // PUT /api/categories/{id}
    public function update(UpdateCategoryRequest $request, int $id)
    {
        try {
            $category = Category::findOrFail($id);

            $validated = $request->validated();

            $category->update([
                'category_name' => $validated['category_name'] ?? $category->category_name,
                'slug'          => isset($validated['category_name'])
                    ? Str::slug($validated['category_name'])
                    : $category->slug,
                'parent_id'     => $validated['parent_id'] ?? $category->parent_id,
                'status'        => $validated['status'] ?? $category->status,
            ]);

            return response()->json([
                'message'  => 'Category updated successfully',
                'category' => $category
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Category not found'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // DELETE  soft delete  0 /api/categories/{id}
    public function softDelete($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json([
            'message' => 'Category soft deleted successfully'
        ], 200);
    }

    // DELETE /api/categories/{id}
    public function forceDelete($id)
    {
        $category = Category::withTrashed()->findOrFail($id);
        $category->forceDelete();

        return response()->json([
            'message' => 'Category permanently deleted'
        ], 200);
    }
    public function getSubCategories() 
    {
        // Lấy các danh mục có parent_id khác null/0
        $subs = Category::whereNotNull('parent_id')->where('parent_id', '>', 0)->get();
        return response()->json($subs);
    }
    public function getProductsByCategory($slug) {
        // 1. Lấy danh mục hiện tại theo slug
        $category = Category::where('slug', $slug)->first();

        if (!$category) {
            return response()->json(['message' => 'Danh mục không tồn tại'], 404);
        }

        // 2. Lấy ID của danh mục này và các con của nó (cấp 1)
        $categoryIds = Category::where('parent_id', $category->id)
                                ->pluck('id')
                                ->push($category->id)
                                ->toArray();

        // 3. Lấy sản phẩm dựa trên danh sách ID đã tìm được
        $products = Product::whereIn('cat_id', $categoryIds)->get();

        return response()->json([
            'category' => $category,
            'data' => $products
        ]);
    }

}
