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
        setError('Unable to load products');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="mt-2 text-sm font-medium">No products found</p>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new product</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">All Products</h2>
      </div>
      <div>
        {products.map((product) => (
          <Link 
            href={`/products/${product.id}`}
            key={product.id} 
            className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 items-center gap-4">
              {/* Product Name and SKU */}
              <div className="col-span-3 flex items-center space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#00603A]/10 flex items-center justify-center">
                  <span className="text-[#00603A] font-medium">
                    {product.name[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    SKU: {product.sku || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-3">
                <p className="text-sm text-gray-900">£{product.price.toFixed(2)}</p>
              </div>

              {/* Stock */}
              <div className="col-span-4">
                <p className={`text-sm ${
                  product.stockQuantity > 10 ? 'text-green-600' : 
                  product.stockQuantity > 0 ? 'text-yellow-600' : 
                  'text-red-600'
                }`}>
                  Stock: {product.stockQuantity}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-1 text-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  product.stockQuantity > 10 ? 'bg-green-100 text-green-800' : 
                  product.stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {product.stockQuantity > 10 ? 'In Stock' : 
                   product.stockQuantity > 0 ? 'Low Stock' : 
                   'Out of Stock'}
                </span>
              </div>

              {/* Arrow */}
              <div className="col-span-1 text-right">
                <svg className="w-5 h-5 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 