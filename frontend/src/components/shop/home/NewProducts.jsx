"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "../product/ProductCard";
import { getNewProducts } from "@/services/productSevices";

export default function NewProducts({ limit = 8 }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNewProducts(limit);
      // This handles both res.data or the res itself if it's the array
      setProducts(res?.data ?? res ?? []); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- MISSING PART TO ADD ---
  useEffect(() => {
    fetchProducts();
  }, [limit]); // Re-run if limit changes
  // ---------------------------

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
  <section className="py-10">
    <h2 className="text-2xl font-bold mb-6 text-blue-500 flex items-center gap-2">
      ✨ Sản phẩm mới nhất
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </section>
);
}