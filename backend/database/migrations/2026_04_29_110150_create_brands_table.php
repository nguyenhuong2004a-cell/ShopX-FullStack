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
        Schema::create('brands', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('image')->nullable(); // Để lưu đường dẫn ảnh
            $table->text('description')->nullable();
            $table->integer('status')->default(1); // 1 là hiện, 0 là ẩn
            $table->softDeletes(); // Cần thiết vì Model của bạn có dùng SoftDeletes
            $table->timestamps(); // Tạo ra 2 cột created_at và updated_at
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('brands');
    }
};
