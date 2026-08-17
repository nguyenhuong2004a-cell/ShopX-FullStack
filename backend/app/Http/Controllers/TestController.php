<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use OpenApi\Attributes as OA;

// This provides the metadata
#[OA\Info(title: "My API", version: "1.0.0")]
#[OA\Server(url: "http://127.0.0.1:8000/api", description: "Local Server")]

class TestController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/test",
     *     summary="Get test data",
     *     tags={"Test"},
     *     @OA\Response(
     *         response=200,
     *         description="Successful response"
     *     )
     * )
     */
    public function index()
    {
        return response()->json([
            'message' => 'Swagger works'
        ]);
    }
}
