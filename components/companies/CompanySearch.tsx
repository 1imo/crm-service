'use client';

import { useState, useEffect, useRef } from 'react';
import { Company } from '@/types/company';

interface CompanySearchProps {
  onSelect: (company: Company) => void;
}

export function CompanySearch({ onSelect }: CompanySearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Company[]>([]);
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
    const searchCompanies = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/clients/search?q=${encodeURIComponent(query)}`);
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

    const debounce = setTimeout(searchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [query]);

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
        placeholder="Search companies..."
        className="w-full p-2 border rounded-md"
      />
      {showResults && (query.trim() || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-gray-500">Searching...</div>
          ) : results.length > 0 ? (
            results.map((company) => (
              <button
                key={company.id}
                onClick={() => {
                  onSelect(company);
                  setShowResults(false);
                  setQuery('');
                }}
                className="w-full text-left p-3 hover:bg-gray-100 border-b last:border-b-0"
              >
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-600">{company.email}</div>
              </button>
            ))
          ) : (
            <div className="p-4 text-gray-500">No companies found</div>
          )}
        </div>
      )}
    </div>
  );
} 