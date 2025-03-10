'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import Link from 'next/link';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        // Convert price to number if it's a string
        const formattedData = data.map((product: Product) => ({
          ...product,
          price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
        }));
        setProducts(formattedData);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">SKU: {product.sku || 'N/A'}</p>
          <p className="text-gray-600">£{product.price.toFixed(2)}</p>
          <p className={`text-sm ${
            product.stockQuantity > 10 ? 'text-green-600' : 
            product.stockQuantity > 0 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            Stock: {product.stockQuantity}
          </p>
        </Link>
      ))}
    </div>
  );
} 