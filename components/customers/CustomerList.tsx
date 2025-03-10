'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Customer } from '@/types/customer';
import { useSession } from 'next-auth/react';

export function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        if (!response.ok) throw new Error('Failed to fetch customers');
        const data = await response.json();
        setCustomers(data);
      } catch (err) {
        setError('Unable to load customers');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="divide-y divide-gray-200">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse px-6 py-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="mt-2 text-sm font-medium">No customers found</p>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new customer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">All Customers</h2>
      </div>
      <div>
        {customers.map((customer) => (
          <Link 
            href={`/customers/${customer.id}`}
            key={customer.id} 
            className="block px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-12 items-center gap-4">
              {/* Name and Basic Info */}
              <div className="col-span-3 flex items-center space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#00603A]/10 flex items-center justify-center">
                  <span className="text-[#00603A] font-medium">
                    {customer.first_name?.[0]}{customer.last_name?.[0]}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Added {new Date(customer.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="col-span-3">
                <p className="text-sm text-gray-900 truncate">{customer.email}</p>
                {customer.phone && (
                  <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
                )}
              </div>

              {/* Location */}
              <div className="col-span-4">
                <p className="text-sm text-gray-900 truncate">
                  {[customer.city, customer.county, customer.postcode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
                {customer.country && (
                  <p className="text-sm text-gray-500 truncate">{customer.country}</p>
                )}
              </div>

              {/* Status */}
              <div className="col-span-1 text-center">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              {/* Arrow */}
              <div className="col-span-1 text-right">
                <svg className="w-5 h-5 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 