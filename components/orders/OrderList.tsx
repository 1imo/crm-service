'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';
import { Checkbox } from "@/components/ui/checkbox";
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
  ClipboardList,
} from "lucide-react";

interface BatchOrder {
  batch_id: string;
  orders: Order[];
  total_amount: number;
  total_quantity: number;
  product_variety: number;
  status: string;
  created_at: Date;
  merged_orders: {
    product_name: string;
    total_quantity: number;
    total_price: number;
  }[];
}

export function OrderList() {
  const [batchOrders, setBatchOrders] = useState<BatchOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data: Order[] = await response.json();
        
        // Group orders by batch_id
        const groupedOrders = data.reduce((acc, order) => {
          const existing = acc.get(order.batch_id) || [];
          acc.set(order.batch_id, [...existing, order]);
          return acc;
        }, new Map<string, Order[]>());

        // Create batch summaries with merged products
        const batchSummaries: BatchOrder[] = Array.from(groupedOrders.entries()).map(([batch_id, orders]) => {
          // Merge orders with same product name
          const mergedProducts = orders.reduce((acc, order) => {
            const existing = acc.find(p => p.product_name === order.product_name);
            if (existing) {
              existing.total_quantity += order.quantity;
              existing.total_price += Number(order.total_price);
            } else {
              acc.push({
                product_name: order.product_name,
                total_quantity: order.quantity,
                total_price: Number(order.total_price)
              });
            }
            return acc;
          }, [] as { product_name: string; total_quantity: number; total_price: number }[]);

          return {
            batch_id,
            orders,
            total_amount: orders.reduce((sum, order) => sum + Number(order.total_price), 0),
            total_quantity: orders.reduce((sum, order) => sum + order.quantity, 0),
            product_variety: new Set(orders.map(order => order.product_name)).size,
            status: getHighestStatus(orders.map(o => o.status)),
            created_at: new Date(Math.max(...orders.map(o => new Date(o.created_at).getTime()))),
            merged_orders: mergedProducts
          };
        });

        // Sort by created_at descending
        batchSummaries.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        
        setBatchOrders(batchSummaries);
      } catch (err) {
        setError('Unable to load orders');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Helper function to determine the highest status
  const getHighestStatus = (statuses: string[]): string => {
    if (statuses.includes('completed')) return 'completed';
    if (statuses.includes('pending')) return 'pending';
    if (statuses.includes('draft')) return 'draft';
    return 'cancelled';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 rounded-lg border p-4 bg-white">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Error Loading Orders</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">{error}</p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (batchOrders.length === 0) {
    return (
      <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No orders found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            Get started by creating a new order.
          </p>
          <Button asChild size="sm">
            <Link href="/orders/new">Create order</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {batchOrders.map((batch) => (
        <div
          key={batch.batch_id}
          className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
        >
          <Checkbox />
          <div className="flex flex-1 items-center space-x-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-medium text-sm">
                {batch.batch_id.slice(0, 2)}
              </span>
            </div>
            
            <div className="flex flex-1 items-center justify-between">
              <div className="grid grid-cols-4 flex-1 gap-8 items-center">
                <div className="flex flex-col">
                  <p className="text-sm font-medium">#{batch.batch_id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground">
                    {batch.created_at.toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="flex flex-col">
                  <p className="text-sm">{batch.product_variety} products</p>
                  <p className="text-xs text-muted-foreground">
                    {batch.total_quantity} items
                  </p>
                </div>
                <p className="text-sm text-center">
                  £{batch.total_amount.toFixed(2)}
                </p>
                <div className="flex justify-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    batch.status === 'completed' ? 'bg-green-50 text-green-700' :
                    batch.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    batch.status === 'draft' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
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
                    <Link href={`/orders/${batch.batch_id}`} className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/orders/${batch.batch_id}/edit`} className="cursor-pointer">
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