<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\MenuController; 
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\UserAddressController; 






Route::get('/test', [TestController::class, 'index']);

//api for user
// ─────────────────────────────────────────
// Public Auth Routes
// ─────────────────────────────────────────
Route::post('/auth/local/register', [AuthController::class, 'register']);
Route::post('/auth/local',          [AuthController::class, 'login']);

// ─────────────────────────────────────────
// Protected Auth Routes
// ─────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout',          [AuthController::class, 'logout']);
    Route::get('/auth/me',               [AuthController::class, 'me']);
    Route::put('/auth/me',               [AuthController::class, 'updateMe']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);

    // product routes
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    // soft delete
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    // force delete
    Route::delete('/products/{id}/force', [ProductController::class, 'forceDelete']);

    // category routes
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    // soft delete
    Route::delete('/categories/{id}', [CategoryController::class, 'softDelete']);
    // force delete
    Route::delete('/categories/{id}/force', [CategoryController::class, 'forceDelete']);
});


//api for products
Route::get('/products', [ProductController::class, 'index']);
Route::get('/newProducts/{limit}', [ProductController::class, 'getNewProducts']);
Route::get('/saleProducts/{limit}', [ProductController::class, 'getSaleProducts']);
Route::get('/hotProducts/{limit}', [ProductController::class, 'getHotProducts']);
Route::get('/products/{id}', [ProductController::class, 'show']);
Route::get('products/slug/{slug}', [ProductController::class, 'showBySlug']);
// Route::get('/showDetails/{slug}', [ProductController::class, 'showBySlug']);
Route::get('/productsByPageSize', [ProductController::class, 'getProductsByPageSize']);
Route::get('/productsByStartLimit', [ProductController::class, 'getProductsByStartLimit']);
//lấy danh sách sản phẩm đã xoá mềm
Route::get('/trashedProductsByPageSize', [ProductController::class, 'getTrashedProductByPageSize']);
//get products by category id
Route::get('/productsByCategoryId/{categoryId}', [ProductController::class, 'getProductsByCategoryId']);
Route::get('/productsByCategorySlug/{slug}', [ProductController::class, 'getProductsByCategorySlug']);
//get products by brand id
Route::get('/productsByBrandId/{brandId}', [ProductController::class, 'getProductsByBrandId']);
Route::get('/productsByBrandSlug/{slug}', [ProductController::class, 'getProductsByBrandSlug']);

//api for categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/activeCategories', [CategoryController::class, 'getActiveCategories']);
Route::get('/inactiveCategories', [CategoryController::class, 'getInactiveCategories']);

Route::get('/categoriesByPageSize', [CategoryController::class, 'getCategoriesByPageSize']);
Route::get('/trashedCategoriesByPageSize', [CategoryController::class, 'getTrashedCategoriesByPageSize']);

Route::get('/parentCategories', [CategoryController::class, 'getParentCategories']);
Route::get('/showById/{id}', [CategoryController::class, 'show']);
Route::get('/showBySlug/{slug}', [CategoryController::class, 'showBySlug']);
Route::get('/subcategories', [CategoryController::class, 'getSubCategories']);
Route::get('/categories/{slug}/products', [CategoryController::class, 'getProductsByCategory']);
Route::put('/categories/{id}', [CategoryController::class, 'update']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('categories', [CategoryController::class, 'index']);






Route::middleware('auth:sanctum')->group(function () {
    Route::get('/orders', [OrderController::class, 'index']); // Lấy danh sách
    Route::post('/orders/store', [OrderController::class, 'store']);
    // Phải có dòng lấy chi tiết đơn hàng theo ID
    Route::get('/orders/{id}', [OrderController::class, 'show']); // Lưu đơn hàng
});
Route::prefix('admin')->group(function () {
    Route::get('orders/notifications', [OrderController::class, 'getNotifications']);
    Route::get('orders', [OrderController::class, 'adminIndex']); 
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);
});


Route::apiResource('brands', BrandController::class);


Route::get('admin/menus', [MenuController::class, 'index']);
Route::post('admin/menus', [MenuController::class, 'store']);
Route::put('admin/menus/{id}', [MenuController::class, 'update']);
Route::delete('admin/menus/{id}', [MenuController::class, 'destroy']);




// Routes cho User (Trang cá nhân)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserController::class, 'show']); // Gọi chính mình
    Route::put('/user/update', [UserController::class, 'update']);
});

// Routes cho Admin
Route::prefix('admin')->group(function () {
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/users/{id}', [UserController::class, 'show']); // Gọi theo ID
});



Route::get('admin/dashboard/stats', [DashboardController::class, 'getStats']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user-addresses', [UserAddressController::class, 'index']);
    Route::post('/user-addresses', [UserAddressController::class, 'store']);
});