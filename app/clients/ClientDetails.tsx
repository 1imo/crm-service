'use client';

import { useEffect, useState } from 'react';
import { ApiService } from '@/lib/api';
import { Company } from '@/types';

export function ClientDetails({ id }: { id: string }) {
  const [client, setClient] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await ApiService.fetch(`${process.env.NEXT_PUBLIC_CRM_SERVICE_URL}/api/clients/${id}`);
        setClient(data);
      } catch (err) {
        setError('Failed to fetch client details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading) return <div>Loading client details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!client) return <div>Client not found</div>;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold">{client.name}</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          {isEditing ? 'Save Changes' : 'Edit Details'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Email:</span> {client.email}</p>
            <p><span className="font-medium">Phone:</span> {client.phone || 'N/A'}</p>
            <p><span className="font-medium">Address:</span> {client.address || 'N/A'}</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Banking Details</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Account Name:</span> {client.accountName}</p>
            <p><span className="font-medium">Account Number:</span> {client.accountNumber}</p>
            <p><span className="font-medium">Sort Code:</span> {client.sortCode}</p>
            <p><span className="font-medium">Bank Name:</span> {client.bankName}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 