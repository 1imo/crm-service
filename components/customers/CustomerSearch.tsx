'use client';

import { useState, useEffect, useRef } from 'react';
import { Customer } from '@/types/customer';

interface CustomerSearchProps {
  onSelect: (customer: Customer) => void;
}

export function CustomerSearch({ onSelect }: CustomerSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCustomers = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching for:', query); // Debug log
        const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
        console.log('Response status:', response.status); // Debug log
        if (!response.ok) throw new Error('Search failed');
        const data = await response.json();
        console.log('Search results:', data); // Debug log
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

  const handleSelect = (customer: Customer) => {
    onSelect(customer);
    setShowResults(false);
    setQuery('');
  };

  const renderSearchResults = () => {
    if (loading) {
      return <div className="p-4 text-gray-500">Searching...</div>;
    }

    if (results.length > 0) {
      return results.map((customer) => (
        <button
          key={customer.id}
          onClick={() => handleSelect(customer)}
          className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
        >
          <div className="font-medium">{customer.firstName} {customer.lastName}</div>
          <div className="text-sm text-gray-600">
            {[
              customer.addressLine1,
              customer.addressLine2,
              customer.city,
              customer.postcode
            ].filter(Boolean).join(', ')}
          </div>
        </button>
      ));
    }

    if (query.trim()) {
      return <div className="p-4 text-gray-500">No customers found</div>;
    }

    return null;
  };

  return (
    <div ref={searchRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Search customers by name, address, or postcode..."
        className="w-full p-2 border rounded-md"
      />
      {showResults && (query.trim() || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {renderSearchResults()}
        </div>
      )}
    </div>
  );
} 