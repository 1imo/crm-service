'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import Link from 'next/link';
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Package,
  Plus
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 rounded-lg border p-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg">
        <Package className="h-10 w-10 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No products found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating your first product
        </p>
        <Button asChild>
          <Link href="/products/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
        >
          <Checkbox />
          <div className="flex flex-1 items-center space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {product.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-1 items-center justify-between">
              <div className="grid grid-cols-4 flex-1 gap-8 items-center">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                </div>
                <p className="text-sm text-center">{`£${product.price.toFixed(2)}`}</p>
                <p className="text-sm text-center">{product.stock_quantity} in stock</p>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    product.stock_quantity > 10 
                      ? 'bg-green-50 text-green-700' 
                      : product.stock_quantity > 0 
                      ? 'bg-yellow-50 text-yellow-700' 
                      : 'bg-red-50 text-red-700'
                  }`}>
                    {product.stock_quantity > 10 ? 'In Stock' : 
                     product.stock_quantity > 0 ? 'Low Stock' : 
                     'Out of Stock'}
                  </span>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem asChild>
                    <Link href={`/products/${product.id}`} className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/products/${product.id}/edit`} className="cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 