"use client";
import { useState, useEffect } from "react";
import ProductCard from "../product/ProductCard";
import { getSaleProducts } from "@/services/productSevices";

export default function SaleProducts({ limit = 4 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await getSaleProducts(limit);
        setProducts(res?.data ?? res ?? []);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [limit]);

  if (loading) return <p className="text-white text-center">Đang tải sản phẩm khuyến mãi...</p>;
  if (products.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
        🏷️ Ưu đãi cực sốc
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}