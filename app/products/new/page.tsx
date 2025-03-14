'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NewProductFormData {
  name: string;
  sku: string;
  price: string;
  stock_quantity: string;
  description: string;
}

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewProductFormData>({
    name: '',
    sku: '',
    price: '',
    stock_quantity: '',
    description: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields to FormData
      formDataToSend.append('name', formData.name);
      formDataToSend.append('sku', formData.sku);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock_quantity', formData.stock_quantity);
      formDataToSend.append('description', formData.description);

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formDataToSend, // Send as FormData instead of JSON
      });

      if (!response.ok) throw new Error('Failed to create product');

      const data = await response.json();
      toast.success('Product created successfully');
      router.push(`/products/${data.id}`);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (label: string, name: keyof NewProductFormData, type: string = 'text') => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {name === 'description' ? (
        <Textarea
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
          className="resize-none"
        />
      ) : (
        <Input
          type={type}
          value={formData[name]}
          onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <Package className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                New Product
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Create a new product
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8 mx-6" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Product Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('Product Name', 'name')}
                    {renderField('SKU', 'sku')}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField('Price', 'price', 'number')}
                    {renderField('Stock Quantity', 'stock_quantity', 'number')}
                  </div>
                  {renderField('Description', 'description')}
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
                  'Create Product'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 