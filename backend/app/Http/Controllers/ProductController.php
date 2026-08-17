<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Traits\QueryHelper;

class ProductController extends Controller
{
    use QueryHelper;

    public function __construct()
    {
        $this->allowedFields = [
            'id', 'product_name', 'slug', 'cat_id', 'brand_id', 'image', 'images',      
            'price', 'is_on_sale', 'sale_price', 'qty', 'views', 'material',     
            'origin', 'style', 'size_chart', 'description', 'status',
            'created_by', 'updated_by', 'created_at', 'updated_at'
        ];

        $this->allowedRelations  = ['category', 'brand'];
        $this->allowedFilters    = ['product_name', 'price', 'status', 'cat_id', 'is_on_sale', 'brand_id', 'material', 'origin'];
        $this->allowedSortFields = ['id', 'product_name', 'price', 'views', 'created_at'];
    }

    /**
     * GET /api/products
     * Lấy danh sách sản phẩm (Có Phân trang, Tìm kiếm, Lọc, Sắp xếp)
     */
    public function index(Request $request) 
    {
        $query = Product::withoutTrashed()->with(['category', 'brand']);

        // Tìm kiếm theo tên sản phẩm
        if ($request->has('search') && !empty($request->search)) {
            $query->where('product_name', 'like', '%' . $request->search . '%');
        }

        // Lọc theo thương hiệu (brand_id)
        if ($request->has('brand_id') && !empty($request->brand_id)) {
            $query->where('brand_id', $request->brand_id);
        }

        // Lọc theo danh mục (cat_id)
        if ($request->has('cat_id') && !empty($request->cat_id)) {
            $query->where('cat_id', $request->cat_id);
        }

        // Lọc sản phẩm đang giảm giá
        if ($request->has('is_on_sale')) {
            $query->where('is_on_sale', 1);
        }

        // Sắp xếp dữ liệu (Sort)
        if ($request->has('sort')) {
            switch ($request->sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'oldest':
                    $query->orderBy('created_at', 'asc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }
        } else {
            $query->orderBy('id', 'desc');
        }

        $perPage = $request->input('per_page', $request->input('limit', 12));
        
        if ($request->input('paginate') === 'false') {
            return response()->json($query->get(), 200);
        }

        $products = $query->paginate($perPage);

        return response()->json($products, 200);
    }

    // GET /api/productsByPaginator by page/page size
    public function getProductsByPageSize(Request $request)
    {
        $page     = $request->input('pagination.page', 1);
        $pageSize = $request->input('pagination.pageSize', 10);
        $skip     = ($page - 1) * $pageSize;

        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $query = Product::withoutTrashed()
            ->select($selectedFields)
            ->with($relations);

        $query = $this->applySort($query, $request);
        $query = $this->applyFilters($query, $request);

        $total    = $query->count();
        $products = $query->skip($skip)->take($pageSize)->get();

        return response()->json([
            'data'       => $products,
            'pagination' => [
                'page'      => (int) $page,
                'pageSize'  => (int) $pageSize,
                'total'     => $total,
                'pageCount' => (int) ceil($total / $pageSize),
            ],
            'fields'    => $selectedFields,
            'relations' => $relations,
        ]);
    }

    // GET /api/productsByPaginator by start/limit
    public function getProductsByStartLimit(Request $request)
    {
        $start = $request->input('pagination.start', 0);
        $limit = $request->input('pagination.limit', 10);

        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $query = Product::withoutTrashed()
            ->select($selectedFields)
            ->with($relations)
            ->latest();

        $query = $this->applySort($query, $request);
        $query = $this->applyFilters($query, $request);

        $total     = $query->count();
        $pageCount = (int) ceil($total / $limit);
        $page      = (int) floor($start / $limit) + 1;

        $products  = $query->skip($start)
            ->take($limit)
            ->get();

        return response()->json([
            'data'       => $products,
            'pagination' => [
                'start'       => (int) $start,
                'limit'       => (int) $limit,
                'total'       => $total,
                'page'        => $page,
                'pageCount'   => $pageCount,
            ],
            'fields'    => $selectedFields,
            'relations' => $relations,
        ]);
    }

    // GET /api/trashedProductsByPageSize
    public function getTrashedProductByPageSize(Request $request)
    {
        $page     = $request->input('pagination.page', 1);
        $pageSize = $request->input('pagination.pageSize', 10);
        $skip     = ($page - 1) * $pageSize;

        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $query = Product::onlyTrashed()
            ->select($selectedFields)
            ->with($relations)
            ->latest();

        $query = $this->applySort($query, $request);
        $query = $this->applyFilters($query, $request);

        $total    = $query->count();
        $products = $query->skip($skip)
            ->take($pageSize)
            ->get();

        return response()->json([
            'data'       => $products,
            'pagination' => [
                'page'        => (int) $page,
                'pageSize'    => (int) $pageSize,
                'total'       => $total,
                'pageCount'   => (int) ceil($total / $pageSize),
            ],
            'fields'    => $selectedFields,
            'relations' => $relations,
        ]);
    }

    // GET /api/newProducts/{limit}
    public function getNewProducts(Request $request, $limit = 5)
    {
        $limit = (int) $limit;
        $selectedFields = $this->getSelectedFields($request);

        $products = Product::withoutTrashed()
            ->select($selectedFields)
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->take($limit)
            ->get();

        return response()->json($products, 200);
    }

    // GET /api/products/saleProducts/{limit}
    public function getSaleProducts(Request $request, $limit = 5)
    {
        $limit = (int) $limit;
        $selectedFields = $this->getSelectedFields($request);
        $products = Product::withoutTrashed()
            ->select($selectedFields)
            ->where('is_on_sale', 1)
            ->orderBy('id', 'desc')
            ->take($limit)
            ->get();

        return response()->json($products, 200);
    }

    // GET /api/products/hotProducts/{limit}
    public function getHotProducts(Request $request, $limit = 5)
    {
        $limit = (int) $limit;
        $selectedFields = $this->getSelectedFields($request);
        $products = Product::withoutTrashed()
            ->select($selectedFields)
            ->orderBy('views', 'desc')
            ->take($limit)
            ->get();

        return response()->json($products, 200);
    }

    // GET /api/products/{id}
    public function show(Request $request, $id)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $product = Product::select($selectedFields)
            ->with($relations)
            ->findOrFail($id);

        return response()->json([
            'data'      => $product,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    // GET /api/products/slug/{slug}
    public function showBySlug(Request $request, $slug)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $product = Product::select($selectedFields)
            ->with($relations)
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data'      => $product,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    // GET /api/listTrashedProducts
    public function listTrashedProducts()
    {
        $trashedProducts = Product::onlyTrashed()->get();
        return response()->json($trashedProducts, 200);
    }

    // GET /api/products/category/{categoryId}
    public function getProductsByCategoryId(Request $request, $categoryId)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);
        $products = Product::select($selectedFields)
            ->with($relations)
            ->where('cat_id', $categoryId)
            ->get();
        return response()->json([
            'data'      => $products,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    // GET /api/products/category/slug/{categorySlug}
    public function getProductsByCategorySlug(Request $request, $categorySlug)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $category = Category::where('slug', $categorySlug)->firstOrFail();

        $products = Product::select($selectedFields)
            ->with($relations)
            ->where('cat_id', $category->id)
            ->get();

        return response()->json([
            'data'      => $products,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    // GET /api/products/brand/{brandId}
    public function getProductsByBrandId(Request $request, $brandId)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $products = Product::select($selectedFields)
            ->with($relations)
            ->where('brand_id', $brandId)
            ->get();

        return response()->json([
            'data'      => $products,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    // GET /api/products/brand/slug/{brandSlug}
    public function getProductsByBrandSlug(Request $request, $brandSlug)
    {
        $selectedFields = $this->getSelectedFields($request);
        $relations      = $this->getPopulate($request);

        $brand = Brand::where('slug', $brandSlug)->firstOrFail();

        $products = Product::select($selectedFields)
            ->with($relations)
            ->where('brand_id', $brand->id)
            ->get();

        return response()->json([
            'data'      => $products,
            'fields'    => $selectedFields,
            'relations' => $relations,
        ], 200);
    }

    /**
     * POST /api/products
     * Thêm sản phẩm mới từ Admin
     */
    public function store(StoreProductRequest $request)
    {
        try {
            // Linh hoạt đọc từ $request trực tiếp để tránh lỗi lệch key
            $productName = $request->input('productName') ?? $request->input('product_name');
            $catId       = $request->input('cat') ?? $request->input('cat_id') ?? $request->input('category_id');
            $brandId     = $request->input('brand') ?? $request->input('brand_id');

            $data = [
                'product_name' => $productName,
                'slug'         => $request->input('slug'),
                'cat_id'       => $catId,
                'brand_id'     => $brandId,
                'price'        => $request->input('price'),
                'description'  => $request->input('description'),
                'qty'          => $request->input('qty', 0),
                'status'       => $request->input('status', 1),

                // CÁC THUỘC TÍNH CHI TIẾT
                'material'     => $request->input('material'),
                'origin'       => $request->input('origin'),
                'style'        => $request->input('style'),
                'size_chart'   => $request->input('size_chart'),
            ];

            if ($request->hasFile('image')) {
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            $product = Product::create($data);

            return response()->json([
                'message' => 'Thêm sản phẩm thành công.',
                'data'    => $product,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi tạo sản phẩm.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/products/{id}
     * Cập nhật sản phẩm từ Admin
     */
    public function update(UpdateProductRequest $request, int $id)
    {
        try {
            $product = Product::findOrFail($id);

            $productName = $request->input('productName') ?? $request->input('product_name') ?? $product->product_name;
            $catId       = $request->input('cat') ?? $request->input('cat_id') ?? $request->input('category_id') ?? $product->cat_id;
            $brandId     = $request->input('brand') ?? $request->input('brand_id') ?? $product->brand_id;

            $data = [
                'product_name' => $productName,
                'slug'         => $request->input('slug', $product->slug),
                'cat_id'       => $catId,
                'brand_id'     => $brandId,
                'price'        => $request->input('price', $product->price),
                'description'  => $request->input('description', $product->description),
                'qty'          => $request->input('qty', $product->qty),
                'status'       => $request->input('status', $product->status),
                
                // CÁC THUỘC TÍNH CHI TIẾT
                'material'     => $request->input('material', $product->material),
                'origin'       => $request->input('origin', $product->origin),
                'style'        => $request->input('style', $product->style),
                'size_chart'   => $request->input('size_chart', $product->size_chart),
            ];

            if ($request->hasFile('image')) {
                if ($product->image && Storage::disk('public')->exists($product->image)) {
                    Storage::disk('public')->delete($product->image);
                }
                $data['image'] = $request->file('image')->store('products', 'public');
            }

            $salePrice = $request->input('sale_price'); 
            if (!empty($salePrice) && $salePrice > 0) {
                $data['is_on_sale'] = 1;
                $data['sale_price'] = $salePrice;
            } else {
                $data['is_on_sale'] = 0;
                $data['sale_price'] = 0;
            }

            $product->update($data);

            return response()->json([
                'message' => 'Cập nhật sản phẩm thành công.',
                'data'    => $product->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Đã xảy ra lỗi khi cập nhật sản phẩm.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    // DELETE /api/products/{id} - softDelete
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json([
            'message' => 'Product soft deleted successfully'
        ], 200);
    }

    // DELETE /api/products/{id}/force - forceDelete
    public function forceDelete($id)
    {
        $product = Product::withTrashed()->findOrFail($id);
        if (!$product->trashed()) {
            return response()->json([
                'message' => 'Product is not soft deleted yet'
            ], 400);
        }

        $product->forceDelete();

        return response()->json([
            'message' => 'Product permanently deleted successfully'
        ], 200);
    }

    // GET /api/categories
    public function getCategories()
    {
        $categories = Category::select('id', 'category_name')->get();
        return response()->json($categories, 200);
    }
}