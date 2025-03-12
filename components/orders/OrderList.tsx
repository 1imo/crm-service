'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';

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

  if (batchOrders.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="mt-2 text-sm font-medium">No orders found</p>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new order</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">All Orders</h2>
      </div>
      <div>
        {batchOrders.map((batch) => (
          <Link 
            href={`/orders/${batch.batch_id}`}
            key={batch.batch_id} 
            className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 items-center gap-4">
               {/* Products Count */}
              <div className="col-span-1 flex justify-center">
                <div className="h-10 w-10 rounded-full bg-[#00603A]/10 flex items-center justify-center">
                  <span className="text-[#00603A] font-medium">
                    {batch.batch_id.slice(0, 2)}
                  </span>
                </div>
              </div>

              {/* Batch ID and Date */}
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  #{batch.batch_id.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {batch.created_at.toLocaleDateString('en-GB')}
                </p>
              </div>

              {/* Products Summary */}
              <div className="col-span-4">
                <div className="text-sm text-gray-500">
                  {batch.merged_orders.map((product, index) => (
                    <div key={product.product_name}>
                      {product.product_name}: {product.total_quantity} units
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity and Total */}
              <div className="col-span-3">
                <p className="text-sm text-gray-900">
                  {batch.total_quantity} items
                </p>
                <p className="text-sm text-gray-500">
                  Total: £{batch.total_amount.toFixed(2)}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-1 text-center">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  batch.status === 'completed' ? 'bg-green-100 text-green-800' :
                  batch.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  batch.status === 'draft' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
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