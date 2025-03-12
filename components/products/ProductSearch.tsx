'use client';

import { useState, useEffect, useRef } from 'react';
import { Product } from '@/types/product';

interface ProductSearchProps {
  onSelect: (product: Product | null, quantity?: number) => void;
  selectedProductIds?: string[];
  quantities?: { [key: string]: number };
}

export function ProductSearch({ onSelect, selectedProductIds = [], quantities = {} }: ProductSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [localQuantities, setLocalQuantities] = useState<{ [key: string]: number | null }>(quantities);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchProducts = async () => {
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  useEffect(() => {
    setLocalQuantities(quantities);
  }, [quantities]);

  const handleProductClick = (product: Product) => {
    const isSelected = selectedProductIds.includes(product.id);
    if (isSelected) {
      onSelect(null);  // Send null to deselect
    } else {
      onSelect(product, localQuantities[product.id] || 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const inputValue = e.target.value;
    const numericValue = inputValue === '' ? null : parseInt(inputValue);
    
    setLocalQuantities(prev => ({
      ...prev,
      [product.id]: numericValue
    }));

    // Only update parent if it's a valid number
    if (numericValue !== null && !isNaN(numericValue)) {
      if (selectedProductIds.includes(product.id)) {
        onSelect(product, numericValue);
      }
    }
  };

  const renderSearchResults = () => {
    if (loading) {
      return Array(4).fill(0).map((_, index) => (
        <div 
          key={index}
          className={`w-full px-6 py-4 ${
            index !== 3 ? 'border-b border-gray-200' : ''
          }`}
        >
          <div className="grid grid-cols-12 items-center gap-4">
            {/* Avatar and Name/SKU */}
            <div className="col-span-3 flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>

            {/* Price Info */}
            <div className="col-span-2 flex flex-col justify-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>

            {/* Stock Info */}
            <div className="col-span-3 flex flex-col justify-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>

            {/* Description */}
            <div className="col-span-3 flex flex-col justify-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>

            {/* Arrow */}
            <div className="col-span-1 flex justify-end items-center">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ));
    }

    if (results.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2 text-sm font-medium">No products found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different search term</p>
          </div>
        </div>
      );
    }

    return results.map((product, index) => (
      <button
        key={product.id}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleProductClick(product);
        }}
        className={`w-full text-left px-6 py-4 ${
          index !== results.length - 1 ? 'border-b border-gray-200' : ''
        } transition-colors ${
          selectedProductIds.includes(product.id)
            ? 'bg-[#00603A]/5 hover:bg-[#00603A]/10' 
            : 'hover:bg-gray-50'
        }`}
      >
        <div className="grid grid-cols-12 items-center gap-4">
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

          <div className="col-span-3">
            <p className="text-sm text-gray-900 truncate">£{Number(product.price).toFixed(2)}</p>
            <p className="text-sm text-gray-500 truncate">Stock: {product.stock_quantity}</p>
          </div>

          <div className="col-span-5 flex items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-500">Qty:</label>
              <input
                type="number"
                min="1"
                max={product.stock_quantity}
                value={localQuantities[product.id] === null ? '' : (localQuantities[product.id] ?? 1)}
                onChange={(e) => handleQuantityChange(e, product)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onFocus={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Clear the value on focus
                  setLocalQuantities(prev => ({
                    ...prev,
                    [product.id]: null
                  }));
                }}
                onBlur={(e) => {
                  // Restore to valid number on blur
                  const value = parseInt(e.target.value) || 1;
                  setLocalQuantities(prev => ({
                    ...prev,
                    [product.id]: value
                  }));
                  if (selectedProductIds.includes(product.id)) {
                    onSelect(product, value);
                  }
                }}
                className="w-20 p-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-[#00603A] focus:border-[#00603A]"
              />
            </div>
          </div>

          <div className="col-span-1 text-right">
            <svg className="w-5 h-5 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    ));
  };

  return (
    <div ref={searchRef} className="w-full bg-white">
      <div className="py-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] transition-colors duration-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        {renderSearchResults()}
      </div>
    </div>
  );
} 