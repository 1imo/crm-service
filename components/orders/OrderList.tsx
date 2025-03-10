'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Order } from '@/types/order';

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders');
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        // Convert price strings to numbers if needed
        const formattedData = data.map((order: any) => ({
          ...order,
          unitPrice: parseFloat(order.unit_price),
          totalPrice: parseFloat(order.total_price)
        }));
        setOrders(formattedData);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleSendInvoice = async (orderId: string) => {
    setProcessingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      // Update the order status locally
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'pending' }
          : order
      ));

    } catch (error) {
      console.error('Failed to send invoice:', error);
      alert('Failed to send invoice. Please try again.');
    } finally {
      setProcessingOrder(null);
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <div key={order.id} className="block p-6 bg-white rounded-lg shadow">
          <Link
            href={`/orders/${order.id}`}
            className="block hover:text-blue-600"
          >
            <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
            <p className="text-gray-600">Product: {order.productName}</p>
            <p className="text-gray-600">
              Quantity: {order.quantity} x £{order.unitPrice.toFixed(2)}
            </p>
            <p className="text-gray-600">Total: £{order.totalPrice.toFixed(2)}</p>
            <p className={`text-sm ${
              order.status === 'completed' ? 'text-green-600' :
              order.status === 'pending' ? 'text-yellow-600' :
              order.status === 'draft' ? 'text-blue-600' :
              'text-red-600'
            }`}>
              Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </p>
          </Link>
          
          {order.status === 'draft' && (
            <button
              onClick={() => handleSendInvoice(order.id)}
              disabled={processingOrder === order.id}
              className={`mt-4 w-full py-2 px-4 rounded-md text-white 
                ${processingOrder === order.id 
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
              {processingOrder === order.id ? 'Sending...' : 'Send Invoice'}
            </button>
          )}
        </div>
      ))}
    </div>
  );
} 