'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface NewCompanyFormData {
  name: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  county: string;
  postcode: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
  iban: string;
  logoFile?: File;
}

export default function NewCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewCompanyFormData>({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    county: '',
    postcode: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    sortCode: '',
    iban: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });

      const response = await fetch('/api/companies', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Failed to create company');

      const data = await response.json();
      toast.success('Company created successfully');
      router.push(`/companies/${data.id}`);
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const renderField = (
    label: string, 
    name: keyof NewCompanyFormData,
    type: string = 'text'
  ) => (
    <div className="flex flex-col space-y-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Input
        type={type}
        value={name === 'logoFile' ? '' : formData[name] || ''}
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
            <Building2 className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                New Company
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Create a new company
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
            <div className="grid grid-cols-3 gap-6">
              {/* Logo Card */}
              <Card className="col-span-1 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Company Logo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative w-full min-h-[200px] rounded-lg border overflow-hidden bg-muted">
                      {logoPreview ? (
                        <Image
                          src={logoPreview}
                          alt="Logo preview"
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Building2 className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <label className="cursor-pointer">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setFormData({ ...formData, logoFile: file });
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const result = reader.result;
                                  if (typeof result === 'string') {
                                    setLogoPreview(result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </Button>
                      {logoPreview && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setLogoPreview(null);
                            setFormData({ ...formData, logoFile: undefined });
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card className="col-span-2 shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Company Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("Company Name", "name")}
                      {renderField("Email Address", "email", "email")}
                    </div>
                    {renderField("Phone Number", "phone", "tel")}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Address */}
              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("Address Line 1", "addressLine1")}
                      {renderField("Address Line 2", "addressLine2")}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("City", "city")}
                      {renderField("County", "county")}
                    </div>
                    {renderField("Postcode", "postcode")}
                  </div>
                </CardContent>
              </Card>

              {/* Banking Information */}
              <Card className="shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Banking Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("Bank Name", "bankName")}
                      {renderField("Account Name", "accountName")}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {renderField("Account Number", "accountNumber")}
                      {renderField("Sort Code", "sortCode")}
                    </div>
                    {renderField("IBAN", "iban")}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Company'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 