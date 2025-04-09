'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Order } from '@/types/order';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ClipboardList,
  Mail,
  Trash2,
  Loader2,
  User,
  MapPin,
  Phone,
  CalendarIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { EventModal } from '@/components/event-modal';

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

export default function OrderBatchDetailsPage({ params }: { params: { batchId: string } }) {
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
        const response = await fetch(`/api/orders/batch/${params.batchId}`);
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
  }, [params.batchId]);

  const handleDelete = async () => {
    if (deleteConfirmation !== params.batchId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/batch/${params.batchId}`, {
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

  if (loading) return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <ClipboardList className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Loading batch details...
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                <Skeleton className="h-4 w-32 inline-block" />
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="mx-6 h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
            <Button variant="destructive" size="sm" disabled>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <div className="text-2xl font-semibold">
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <div className="text-2xl font-semibold">
                      <Skeleton className="h-8 w-28" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="block space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <div className="text-sm">
                        <Skeleton className="h-5 w-36" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <div className="text-sm">
                        <Skeleton className="h-5 w-48" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Address</span>
                      <div className="text-sm">
                        <Skeleton className="h-5 w-40 mb-1" />
                        <Skeleton className="h-5 w-44 mb-1" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Phone</span>
                      <div className="text-sm">
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <Skeleton className="h-4 w-4" />
                  </div>
                  <div className="flex flex-1 items-center justify-between">
                    <div className="grid grid-cols-4 flex-1 gap-8 items-center">
                      <div className="flex flex-col">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="text-sm">
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <div className="text-sm text-center">
                        <Skeleton className="h-5 w-16 mx-auto" />
                      </div>
                      <div className="text-sm font-medium text-right">
                        <Skeleton className="h-5 w-20 ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return <div className="text-red-500">{error}</div>;
  if (orders.length === 0) return <div>No orders found</div>;

  const firstOrder = orders[0];
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <ClipboardList className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Batch #{params.batchId.slice(0, 8)}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                {mergedOrders.length} products · £{totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="mx-6 h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/orders/batch/${params.batchId}/invoice`, {
                    method: 'POST',
                  });
                  if (!response.ok) throw new Error('Failed to create invoice');
                  const invoice = await response.json();
                  window.open(`${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${invoice.id}`, '_blank');
                } catch (error) {
                  console.error('Error creating invoice:', error);
                }
              }}
            >
              <Mail className="mr-2 h-4 w-4" />
              Send Invoice
            </Button>
            <EventModal
              trigger={
                <Button variant="outline" size="sm">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Set Meeting
                </Button>
              }
              customerId={firstOrder.customer_details?.id}
              customerName={`${firstOrder.customer_details?.first_name} ${firstOrder.customer_details?.last_name}`}
              onEventCreated={() => {
                // Optional: Add any post-creation logic here
              }}
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Order Summary */}
            <Card className="shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                    <div className="text-2xl font-semibold">
                      {mergedOrders.length}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <div className="text-2xl font-semibold">
                      £{totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card className="shadow-none bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Link 
                  href={`/customers/${firstOrder.customer_details?.id}`}
                  className="block space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <div className="text-sm">
                        {firstOrder.customer_details?.first_name} {firstOrder.customer_details?.last_name}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Email</span>
                      <div className="text-sm">
                        {firstOrder.customer_details?.email}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Address</span>
                      <div className="text-sm">
                        <p>{firstOrder.customer_details?.address_line1}</p>
                        {firstOrder.customer_details?.address_line2 && (
                          <p>{firstOrder.customer_details.address_line2}</p>
                        )}
                        <p>
                          {[
                            firstOrder.customer_details?.city,
                            firstOrder.customer_details?.postcode
                          ].filter(Boolean).join(', ')}
                        </p>
                        <p>{firstOrder.customer_details?.country}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Phone</span>
                      <div className="text-sm">
                        {firstOrder.customer_details?.phone}
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Products List */}
          <div className="mt-6">
            <div className="space-y-4">
              {mergedOrders.map((order) => (
                <div
                  key={`${order.product_id}-${order.product_name}`}
                  className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
                >
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium text-sm">
                      {order.product_name[0]}
                    </span>
                  </div>
                  
                  <div className="flex flex-1 items-center justify-between">
                    <div className="grid grid-cols-4 flex-1 gap-8 items-center">
                      <div className="flex flex-col">
                        <Link 
                          href={`/products/${order.product_id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {order.product_name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {order.product_sku}
                        </p>
                      </div>
                      <div className="text-sm">
                        {order.total_quantity} units
                      </div>
                      <div className="text-sm text-center">
                        £{order.unit_price.toFixed(2)}
                      </div>
                      <div className="text-sm font-medium text-right">
                        £{order.total_price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all orders in batch
              <span className="font-medium"> #{params.batchId.slice(0, 8)}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={`Type "${params.batchId}" to confirm`}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmation !== params.batchId || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Batch'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 