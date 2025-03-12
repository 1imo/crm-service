'use client';

import { useState, useEffect, useRef } from 'react';
import { Customer } from '@/types/customer';

interface CustomerSearchProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomerId?: string;
}

export function CustomerSearch({ onSelect, selectedCustomerId }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchCustomers = async () => {
      try {
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchCustomers, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleCustomerClick = (customer: Customer) => {
    if (selectedCustomerId === customer.id) {
      onSelect(null);
    } else {
      onSelect(customer);
    }
  };

  const renderSearchResults = () => {
    if (loading) {
      return Array(3).fill(0).map((_, index) => (
        <div 
          key={index}
          className={`w-full px-6 py-4 ${
            index !== 3 ? 'border-b border-gray-200' : ''
          }`}
        >
          <div className="grid grid-cols-12 items-center gap-4">
            {/* Avatar and Name */}
            <div className="col-span-3 flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="space-y-2 flex-1 flex flex-col justify-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-span-2 flex flex-col justify-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>

            {/* Address */}
            <div className="col-span-3 flex flex-col justify-center space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>



            {/* Arrow */}
            <div className="col-span-1 flex justify-end items-center">
              <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      ));
    }

    if (results.length === 0) {
      return (
        <div className="p-8 text-center">
          <div className="text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="mt-2 text-sm font-medium">No customers found</p>
            <p className="mt-1 text-sm text-gray-400">Try a different search term</p>
          </div>
        </div>
      );
    }

    return results.map((customer, index) => (
      <button
        key={customer.id}
        onClick={(e) => {
          e.preventDefault();  // Prevent form submission
          e.stopPropagation(); // Stop event bubbling
          handleCustomerClick(customer);
        }}
        className={`w-full text-left px-6 py-4 ${
          index !== results.length - 1 ? 'border-b border-gray-200' : ''
        } transition-colors ${
          selectedCustomerId === customer.id 
            ? 'bg-[#00603A]/5 hover:bg-[#00603A]/10' 
            : 'hover:bg-gray-50'
        }`}
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
                {new Date(customer.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-2">
            <p className="text-sm text-gray-900 truncate">{customer.email}</p>
            {customer.phone && (
              <p className="text-sm text-gray-500 truncate">{customer.phone}</p>
            )}
          </div>

          {/* Location */}
          <div className="col-span-3">
            <p className="text-sm text-gray-900 truncate">
              {[customer.city, customer.county, customer.postcode]
                .filter(Boolean)
                .join(', ')}
            </p>
            {customer.country && (
              <p className="text-sm text-gray-500 truncate">{customer.country}</p>
            )}
          </div>


          {/* Arrow */}
          <div className="col-span-1 text-right">
            <svg className="w-5 h-5 inline-block text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </button>
    ));
  };

  return (
    <div ref={searchRef} className="w-full bg-white">
      <div className="py-4">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search customers by name, address, or postcode..."
            className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[#00603A] focus:border-[#00603A] transition-colors duration-200"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div>
        {renderSearchResults()}
      </div>
    </div>
  );
} 