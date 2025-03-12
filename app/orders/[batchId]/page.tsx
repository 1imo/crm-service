'use client';

import { useEffect, useState, use } from 'react';
import { Order } from '@/types/order';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OrderWithDetails extends Order {
  customer_details: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    postcode: string;
    country: string;
  };
  product_details: {
    id: string;
    name: string;
    sku: string;
    price: number;
    stock_quantity: number;
  };
}

interface MergedOrder {
  product_id: string;
  product_name: string;
  product_sku: string;
  total_quantity: number;
  unit_price: number;
  total_price: number;
}

export default function OrderBatchDetailsPage({ params }: { params: Promise<{ batchId: string }> }) {
  const { batchId } = use(params);
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [mergedOrders, setMergedOrders] = useState<MergedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/orders/batch/${batchId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        console.log('Raw API Response:', data);
        setOrders(data);

        // Merge orders with same product name
        const merged = data.reduce((acc: MergedOrder[], order: OrderWithDetails) => {
          const existing = acc.find(o => o.product_name === order.product_name);
          if (existing) {
            existing.total_quantity += order.quantity;
            existing.total_price += Number(order.total_price);
          } else {
            acc.push({
              product_id: order.product_details?.id || '',
              product_name: order.product_name,
              product_sku: order.product_details?.sku || '',
              total_quantity: order.quantity,
              unit_price: Number(order.unit_price),
              total_price: Number(order.total_price)
            });
          }
          return acc;
        }, []);
        console.log('Merged Orders:', merged);
        setMergedOrders(merged);
      } catch (err) {
        setError('Failed to fetch orders');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [batchId]);

  const handleDelete = async () => {
    if (deleteConfirmation !== batchId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/batch/${batchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete batch');
      
      router.push('/orders');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete batch:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  const firstOrder = orders[0]; // Use first order for customer info

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">Batch #{batchId.slice(0, 8)}</h1>
              <p className="mt-1 text-[#B8E1D3]">
                {mergedOrders.length} {mergedOrders.length === 1 ? 'product' : 'products'} · 
                Total: £{orders.reduce((sum, order) => sum + Number(order.total_price), 0).toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/orders/batch/${batchId}/invoice`, {
                      method: 'POST',
                    });
                    
                    if (!response.ok) {
                      throw new Error('Failed to create invoice');
                    }
                    
                    const invoice = await response.json();
                    // Redirect to invoice viewer or show success message
                    window.open(`${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${invoice.id}`, '_blank');
                  } catch (error) {
                    console.error('Error creating invoice:', error);
                    // You might want to show an error toast/notification here
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Invoice
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#9B2C2C] text-white rounded-md hover:bg-[#7C2222] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-12 py-16">
        <div className="space-y-16">
          {/* Order Summary and Customer Details Row */}
          <div className="grid grid-cols-2 gap-12">
            {/* Order Summary */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Order Summary</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Products</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{mergedOrders.length}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    £{orders.reduce((sum, order) => sum + Number(order.total_price), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </section>

            {/* Customer Information */}
            <section>
              <h3 className="text-lg font-medium text-gray-900 mb-6 pb-2 border-b border-gray-200">Customer Details</h3>
              <Link 
                href={`/customers/${firstOrder.customer_details?.id}`}
                className="group"
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div>
                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#00603A]">
                      {firstOrder.customer_details?.first_name && firstOrder.customer_details?.last_name 
                        ? `${firstOrder.customer_details.first_name} ${firstOrder.customer_details.last_name}`
                        : 'Unknown Customer'}
                    </p>
                    <p className="text-sm text-gray-500">{firstOrder.customer_details?.email || 'No email'}</p>
                    <p className="text-sm text-gray-500">{firstOrder.customer_details?.phone || 'No phone'}</p>
                  </div>
                  {/* Address Information */}
                  <div>
                    <p className="text-sm text-gray-500">{firstOrder.customer_details?.address_line1 || 'No address'}</p>
                    {firstOrder.customer_details?.address_line2 && (
                      <p className="text-sm text-gray-500">{firstOrder.customer_details.address_line2}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {[
                        firstOrder.customer_details?.city,
                        firstOrder.customer_details?.postcode
                      ].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {firstOrder.customer_details?.country || ''}
                    </p>
                  </div>
                </div>
              </Link>
            </section>
          </div>

          {/* Products Table */}
          <section>
            <h3 className="text-lg font-medium mt-6 text-gray-900 pb-2 border-b border-gray-200">Products</h3>
            <div className="overflow-hidden">
              <table className="min-w-full">
                <tbody className="divide-y divide-gray-200">
                  {mergedOrders.map((order) => (
                    <tr 
                      key={`${order.product_id}-${order.product_name}`}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-4 pl-4 pr-3">
                        <Link 
                          href={`/products/${order.product_id}`}
                          className="group flex items-center"
                        >
                          <div className="h-10 w-10 rounded-full bg-[#00603A]/10 flex items-center justify-center mr-3">
                            <span className="text-[#00603A] font-medium">
                              {order.product_name[0]}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 group-hover:text-[#00603A]">
                            {order.product_name}
                          </span>
                        </Link>
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">{order.product_sku}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 text-right">{order.total_quantity}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 text-right">£{order.unit_price.toFixed(2)}</td>
                      <td className="py-4 pl-3 pr-4 text-sm font-medium text-gray-900 text-right">£{order.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Batch</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. This will permanently delete all orders in batch
              <span className="font-medium text-gray-900"> #{batchId.slice(0, 8)}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please type <span className="font-medium text-gray-900">{batchId}</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
              placeholder="Type batch ID to confirm"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmation !== batchId || isDeleting}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Batch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 