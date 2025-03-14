'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NewCustomerFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewCustomerFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    postcode: '',
    country: ''
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create customer');

      const data = await response.json();
      toast.success('Customer created successfully');
      router.push(`/customers/${data.id}`);
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label: string, 
    name: keyof NewCustomerFormData,
    type: string = 'text'
  ) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type={type}
        value={formData[name]}
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      />
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
                New Customer
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Create a new customer
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <Card className="shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("First Name", "first_name")}
                    {renderField("Last Name", "last_name")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("Email Address", "email", "email")}
                    {renderField("Phone Number", "phone", "tel")}
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
                    {renderField("Address Line 1", "address_line1")}
                    {renderField("Address Line 2", "address_line2")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("City", "city")}
                    {renderField("County", "county")}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {renderField("Postcode", "postcode")}
                    {renderField("Country", "country")}
                  </div>
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
                  'Create Customer'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 