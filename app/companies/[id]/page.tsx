'use client';

import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Company } from '@/types/company';
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
import { Building2, Pencil, Trash2, Loader2, Users2, Package, Receipt, Upload } from "lucide-react";
import Link from 'next/link';
import Image from "next/image";

interface CompanyFormData extends Omit<Company, 'logoFile'> {
  logoFile?: File;
}

export default function CompanyDetailsPage({ params }: { params: { id: string } }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CompanyFormData>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch company');
        const data = await response.json();
        
        // Map snake_case to camelCase
        const mappedData = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          accountName: data.account_name,
          accountNumber: data.account_number,
          sortCode: data.sort_code,
          bankName: data.bank_name,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          addressLine1: data.address_line1,
          addressLine2: data.address_line2,
          postcode: data.postcode,
          iban: data.iban_number,
          city: data.city,
          county: data.county
        };

        setCompany(mappedData);
        setFormData(mappedData);
      } catch (err) {
        setError('Failed to fetch company details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // First update company details
      const apiData = {
        name: formData.name || company?.name,
        email: formData.email || company?.email,
        phone: formData.phone || company?.phone,
        account_name: formData.accountName || company?.accountName,
        account_number: formData.accountNumber || company?.accountNumber,
        sort_code: formData.sortCode || company?.sortCode,
        bank_name: formData.bankName || company?.bankName,
        address_line1: formData.addressLine1 || company?.addressLine1,
        address_line2: formData.addressLine2 || company?.addressLine2,
        postcode: formData.postcode || company?.postcode,
        iban_number: formData.iban || company?.iban,
        city: formData.city || company?.city,
        county: formData.county || company?.county
      };

      const response = await fetch(`/api/companies/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) throw new Error('Failed to update company');
      
      const updatedData = await response.json();

      // Then handle logo upload if there's a new logo
      if (formData.logoFile) {
        const logoFormData = new FormData();
        logoFormData.append('file', formData.logoFile);
        logoFormData.append('companyId', params.id);

        const logoResponse = await fetch('/api/companies/upload-logo', {
          method: 'POST',
          body: logoFormData
        });

        if (!logoResponse.ok) throw new Error('Failed to upload logo');
      }

      // Map the response data back to camelCase
      const mappedUpdatedData = {
        id: updatedData.id,
        name: updatedData.name,
        email: updatedData.email,
        phone: updatedData.phone,
        accountName: updatedData.account_name,
        accountNumber: updatedData.account_number,
        sortCode: updatedData.sort_code,
        bankName: updatedData.bank_name,
        createdAt: new Date(updatedData.created_at),
        updatedAt: new Date(updatedData.updated_at),
        addressLine1: updatedData.address_line1,
        addressLine2: updatedData.address_line2,
        postcode: updatedData.postcode,
        iban: updatedData.iban_number,
        city: updatedData.city,
        county: updatedData.county
      };

      setCompany(mappedUpdatedData);
      setFormData(mappedUpdatedData);
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update company:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== company?.name) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/companies/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');
      
      router.push('/companies');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete company:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleLogoChange = (file: File | undefined) => {
    setFormData(prev => ({
      ...prev,
      logoFile: file
    }));
  };

  const logoUrl = company?.id 
    ? `${process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL}/media/company-logo/file/${company.id}`
    : null;

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
      {/* Header with consistent button spacing */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0 pr-6">
            <Building2 className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Company Details
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
              <Link href={`/companies/${company?.id}/contacts`}>
                <Users2 className="h-4 w-4 mr-2" />
                Contacts
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/companies/${company?.id}/orders`}>
                <Package className="h-4 w-4 mr-2" />
                Orders
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href={`/companies/${company?.id}/invoices`}>
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
              {/* Top Row: Logo and Company Info */}
              <div className="grid grid-cols-3 gap-6">
                {/* Logo */}
                <Card className="col-span-1 shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Company Logo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="relative w-full aspect-[3/2] rounded-lg border overflow-hidden">
                        {logoPreview ? (
                          <Image
                            src={logoPreview}
                            alt="Company logo preview"
                            fill
                            className="object-contain"
                          />
                        ) : logoUrl ? (
                          <Image
                            src={logoUrl}
                            alt="Company logo"
                            fill
                            className="object-contain"
                            unoptimized
                            priority
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <Building2 className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <label className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload New Logo
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
                      )}
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
                        {renderField("Company Name", company?.name,
                          <Input
                            value={formData.name || company?.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        )}
                        {renderField("Email Address", company?.email,
                          <Input
                            type="email"
                            value={formData.email || company?.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Phone Number", company?.phone,
                          <Input
                            type="tel"
                            value={formData.phone || company?.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        )}
                        {renderField("Created", company?.createdAt.toLocaleDateString())}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row: Address and Banking split */}
              <div className="grid grid-cols-2 gap-6">
                {/* Address */}
                <Card className="shadow-none">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Address Line 1", company?.addressLine1,
                          <Input
                            value={formData.addressLine1 || company?.addressLine1}
                            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                          />
                        )}
                        {renderField("Address Line 2", company?.addressLine2,
                          <Input
                            value={formData.addressLine2 || company?.addressLine2}
                            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("City", company?.city,
                          <Input
                            value={formData.city || company?.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          />
                        )}
                        {renderField("County", company?.county,
                          <Input
                            value={formData.county || company?.county}
                            onChange={(e) => setFormData({ ...formData, county: e.target.value })}
                          />
                        )}
                      </div>
                      {renderField("Postcode", company?.postcode,
                        <Input
                          value={formData.postcode || company?.postcode}
                          onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                        />
                      )}
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
                        {renderField("Bank Name", company?.bankName,
                          <Input
                            value={formData.bankName || company?.bankName}
                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          />
                        )}
                        {renderField("Account Name", company?.accountName,
                          <Input
                            value={formData.accountName || company?.accountName}
                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                          />
                        )}
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        {renderField("Account Number", company?.accountNumber,
                          <Input
                            value={formData.accountNumber || company?.accountNumber}
                            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                          />
                        )}
                        {renderField("Sort Code", company?.sortCode,
                          <Input
                            value={formData.sortCode || company?.sortCode}
                            onChange={(e) => setFormData({ ...formData, sortCode: e.target.value })}
                          />
                        )}
                      </div>
                      {renderField("IBAN", company?.iban,
                        <Input
                          value={formData.iban || company?.iban}
                          onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

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
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company
              <span className="font-medium"> {company?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder={`Type "${company?.name}" to confirm`}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteConfirmation !== company?.name || isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Company'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}