'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Company } from '@/types/company';

export default function CompanyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${id}`);
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
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
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

      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) throw new Error('Failed to update company');
      
      const updatedData = await response.json();
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
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete company');
      
      router.push('/companies');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete company:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="p-6">Loading company details...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!company) return <div className="p-6">Company not found</div>;

  const renderField = (label: string, value: string | undefined, fieldName: keyof Company) => (
    <div className="col-span-2 sm:col-span-1">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={formData[fieldName]?.toString() || ''}
          onChange={(e) => setFormData({ ...formData, [fieldName]: e.target.value })}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] sm:text-sm"
        />
      ) : (
        <p className="text-sm text-gray-900">{value || '-'}</p>
      )}
    </div>
  );

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">{company?.name}</h1>
              <p className="mt-1 text-[#B8E1D3]">Company Details</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#9B2C2C] text-white rounded-md hover:bg-[#7C2222] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B2C2C] transition-colors"
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-12">
            {/* Company Information */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Company Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Company Name', company?.name, 'name')}
                  {renderField('Email', company?.email, 'email')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Phone', company?.phone, 'phone')}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">{formatDate(company?.createdAt)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-900">{formatDate(company?.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Address</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Address Line 1', company?.addressLine1, 'addressLine1')}
                  {renderField('Address Line 2', company?.addressLine2, 'addressLine2')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('City', company?.city, 'city')}
                  {renderField('County', company?.county, 'county')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Postcode', company?.postcode, 'postcode')}
                </div>
              </div>
            </section>

            {/* Banking Details */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Banking Details</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Bank Name', company?.bankName, 'bankName')}
                  {renderField('Account Name', company?.accountName, 'accountName')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Account Number', company?.accountNumber, 'accountNumber')}
                  {renderField('Sort Code', company?.sortCode, 'sortCode')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('IBAN', company?.iban, 'iban')}
                </div>
              </div>
            </section>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-3 mt-12">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#00603A] hover:bg-[#004D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Company</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. This will permanently delete the company
              <span className="font-medium text-gray-900"> {company?.name}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please type <span className="font-medium text-gray-900">{company?.name}</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] mb-4"
              placeholder="Type company name to confirm"
            />
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirmation !== company?.name || isDeleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Company'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 