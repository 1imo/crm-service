'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Receipt, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface InvoiceItem {
  name: string;
  quantity: number;
  basePrice: number;
}

interface CustomerDetails {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postcode: string;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postcode: ''
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', quantity: 1, basePrice: 0 }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create customer
      const customerResponse = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerDetails)
      });

      if (!customerResponse.ok) throw new Error('Failed to create customer');
      const customer = await customerResponse.json();

      // Create the invoice
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          items,
          status: 'draft',
        })
      });

      if (!response.ok) throw new Error('Failed to create invoice');

      const data = await response.json();
      toast.success('Invoice created successfully');
      router.push(`/invoices/${data.id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const renderCustomerField = (
    label: string,
    field: keyof CustomerDetails,
    type: string = 'text'
  ) => (
    <div className="flex flex-col space-y-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Input
        type={type}
        value={customerDetails[field]}
        onChange={(e) => setCustomerDetails({ ...customerDetails, [field]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <Receipt className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">New Invoice</h1>
              <p className="text-xs text-muted-foreground mt-1">Create a new invoice</p>
            </div>
          </div>
          <Separator orientation="vertical" className="mx-6 h-8" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {renderCustomerField('First Name', 'first_name')}
                  {renderCustomerField('Last Name', 'last_name')}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {renderCustomerField('Email', 'email', 'email')}
                  {renderCustomerField('Phone', 'phone', 'tel')}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {renderCustomerField('Address Line 1', 'address_line1')}
                  {renderCustomerField('Address Line 2', 'address_line2')}
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {renderCustomerField('City', 'city')}
                  {renderCustomerField('Postcode', 'postcode')}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Items */}
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Item description"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = { ...item, name: e.target.value };
                            setItems(newItems);
                          }}
                        />
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = { ...item, quantity: parseInt(e.target.value) || 0 };
                            setItems(newItems);
                          }}
                          className="text-center"
                          min="1"
                        />
                      </div>
                      <div className="w-32 flex items-center gap-2">
                        <span className="text-muted-foreground">£</span>
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.basePrice}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index] = { ...item, basePrice: parseFloat(e.target.value) || 0 };
                            setItems(newItems);
                          }}
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div className="w-32 flex items-center justify-between">
                        <span className="text-muted-foreground">
                          £{(item.quantity * item.basePrice).toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newItems = items.filter((_, i) => i !== index);
                            setItems(newItems.length ? newItems : [{ name: '', quantity: 1, basePrice: 0 }]);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setItems([...items, { name: '', quantity: 1, basePrice: 0 }])}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Total */}
            <Card className="shadow-none">
              <CardContent>
                <div className="flex justify-end items-center">
                  <span className="text-lg font-medium mr-4">Total:</span>
                  <span className="text-lg font-medium">
                    £{items.reduce((sum, item) => sum + (item.quantity * item.basePrice), 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Invoice'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 