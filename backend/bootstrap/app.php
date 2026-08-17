<?php 

// use Illuminate\Foundation\Application;
// use Illuminate\Foundation\Configuration\Exceptions;
// use Illuminate\Foundation\Configuration\Middleware;
// use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

// return Application::configure(basePath: dirname(__DIR__))
//     ->withRouting(
//         web: __DIR__ . '/../routes/web.php',
//         api: __DIR__ . '/../routes/api.php',
//         commands: __DIR__ . '/../routes/console.php',
//         health: '/up',
//     )

//     ->withMiddleware(function (Middleware $middleware): void {
//         //
//         $middleware->api(prepend: [
//             EnsureFrontendRequestsAreStateful::class,
//         ]);
//     })
//     ->withExceptions(function (Exceptions $exceptions): void {
//         //
//     })->create();


use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 1. Cấu hình các Route không kiểm tra CSRF (Sửa lỗi 419)
        $middleware->validateCsrfTokens(except: [
            'api/*',                // Loại bỏ kiểm tra CSRF cho toàn bộ API
            'auth/local/register',  // Đảm bảo route đăng ký của bạn không bị chặn
        ]);

        // 2. Cấu hình Middleware cho API (Sanctum)
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);

        // 3. (Tùy chọn) Nếu bạn gặp lỗi CORS, bạn có thể cấu hình thêm tại đây hoặc file config/cors.php
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();