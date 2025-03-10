'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  city: string;
  county: string;
  postcode: string;
  country: string;
  created_at: string;
  updated_at: string;
}

export default function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${id}`);
        if (!response.ok) throw new Error('Failed to fetch customer');
        const data = await response.json();
        setCustomer(data);
        setFormData(data);
      } catch (err) {
        setError('Failed to load customer details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/customers/${id}`, {
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
    if (deleteConfirmation !== customer?.first_name + ' ' + customer?.last_name) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');
      
      router.push('/customers');
      router.refresh();
    } catch (error) {
      console.error('Failed to delete customer:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00603A]"></div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-500">{error || 'Customer not found'}</div>
      </div>
    );
  }

  const renderField = (label: string, value: string | undefined, fieldName: keyof Customer) => (
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-semibold">{customer?.first_name} {customer?.last_name}</h1>
              <p className="mt-1 text-[#B8E1D3]">Customer Details</p>
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
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-12">
            {/* Personal Information */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Personal Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderField('First Name', customer?.first_name, 'first_name')}
                  {renderField('Last Name', customer?.last_name, 'last_name')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Email', customer?.email, 'email')}
                  {renderField('Phone', customer?.phone, 'phone')}
                </div>
              </div>
            </section>

            {/* Address Information */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Address</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Address Line 1', customer?.address_line1, 'address_line1')}
                  {renderField('Address Line 2', customer?.address_line2, 'address_line2')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('City', customer?.city, 'city')}
                  {renderField('County', customer?.county, 'county')}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  {renderField('Postcode', customer?.postcode, 'postcode')}
                  {renderField('Country', customer?.country, 'country')}
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section className="pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-8 pb-2 border-b border-gray-200">Additional Information</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                    <p className="text-sm text-gray-900">{new Date(customer?.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                    <p className="text-sm text-gray-900">{new Date(customer?.updated_at).toLocaleDateString()}</p>
                  </div>
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
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Customer</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. This will permanently delete the customer
              <span className="font-medium text-gray-900"> {customer?.first_name} {customer?.last_name}</span>.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please type <span className="font-medium text-gray-900">{customer?.first_name} {customer?.last_name}</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] mb-4"
              placeholder="Type customer name to confirm"
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
                disabled={deleteConfirmation !== customer?.first_name + ' ' + customer?.last_name || isDeleting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 