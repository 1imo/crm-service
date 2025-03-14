'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/types/customer';
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
import { Users, Pencil, Trash2, Loader2, Package, Receipt } from "lucide-react";
import Link from 'next/link';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Order {
  id: string;
  batch_id: string;
  company_id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch customer');
        const data = await response.json();
        setCustomer(data);
        setFormData(data);
      } catch (err) {
        setError('Failed to fetch customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [params.id]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/customers/${params.id}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update customer');
      
      const updatedData = await response.json();
      setCustomer(updatedData);
      setFormData(updatedData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update customer:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== `${customer?.first_name} ${customer?.last_name}`) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');
      
      router.push('/customers');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const renderField = (
    label: string, 
    value: string | null | undefined, 
    editField?: ReactNode
  ) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {isEditing && editField ? editField : (
        <span className="text-sm">{value || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0 pr-6">
            <Users className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Customer Details
              </h1>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/customers/${customer?.id}/orders`}>
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/customers/${customer?.id}/invoices`}>
                <Receipt className="h-4 w-4 mr-2" />
                Invoices
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-8" />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              disabled={loading}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Details
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Top Row: Personal Info and Address side by side */}
              <div className="grid grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("First Name", customer?.first_name,
                          <Input
                            value={formData.first_name || customer?.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          />
                        )}
                        {renderField("Last Name", customer?.last_name,
                          <Input
                            value={formData.last_name || customer?.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Email", customer?.email,
                          <Input
                            type="email"
                            value={formData.email || customer?.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        )}
                        {renderField("Phone", customer?.phone,
                          <Input
                            type="tel"
                            value={formData.phone || customer?.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Address Line 1", customer?.address_line1,
                          <Input
                            value={formData.address_line1 || customer?.address_line1}
                            onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                          />
                        )}
                        {renderField("Address Line 2", customer?.address_line2,
                          <Input
                            value={formData.address_line2 || customer?.address_line2}
                            onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("City", customer?.city,
                          <Input
                            value={formData.city || customer?.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        )}
                        {renderField("County", customer?.county,
                          <Input
                            value={formData.county || customer?.county}
                            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Postcode", customer?.postcode,
                          <Input
                            value={formData.postcode || customer?.postcode}
                            onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                          />
                        )}
                        {renderField("Country", customer?.country,
                          <Input
                            value={formData.country || customer?.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row: Orders (full width) */}
              <Card className="shadow-none col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingOrders ? (
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
                  ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Package className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No orders found</h3>
                      <p className="text-sm text-muted-foreground">
                        This customer hasn't placed any orders yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <Link 
                          href={`/orders/${order.batch_id}`}
                          key={order.id} 
                          className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                        >
                          <div className="flex flex-1 items-center space-x-4">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {order.product_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-1 items-center justify-between">
                              <div className="grid grid-cols-4 flex-1 gap-8">
                                <p className="text-sm font-medium">{order.product_name}</p>
                                <p className="text-sm text-muted-foreground">{order.status}</p>
                                <p className="text-sm text-muted-foreground">{order.quantity} units</p>
                                <p className="text-sm text-muted-foreground">£{parseFloat(order.total_price).toFixed(2)}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer
              <span className="font-medium"> {customer?.first_name} {customer?.last_name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={`Type "${customer?.first_name} ${customer?.last_name}" to confirm`}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmation !== `${customer?.first_name} ${customer?.last_name}` || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Customer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 