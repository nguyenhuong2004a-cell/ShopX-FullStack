<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên menu (VD: Trang chủ, Sản phẩm)
            $table->string('link'); // Đường dẫn (VD: /, /products)
            $table->integer('position')->default(0); // Thứ tự sắp xếp
            $table->string('status')->default('active'); // active hoặc inactive
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
