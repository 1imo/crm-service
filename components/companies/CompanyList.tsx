'use client';

import { useEffect, useState } from 'react';
import { Company } from '@/types/company';
import Link from 'next/link';

export function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError('Failed to fetch companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) return <div className="p-6">Loading companies...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200 border-b-px">
        <h2 className="text-lg font-medium text-gray-900">All Companies</h2>
      </div>
      <div>
        {companies.map((company) => (
          <Link 
            href={`/companies/${company.id}`}
            key={company.id} 
            className="block px-6 py-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="grid grid-cols-6 items-center gap-4">
              <div className="col-span-2 flex items-center space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-[#00603A]/10 flex items-center justify-center">
                  <span className="text-[#00603A] font-medium">
                    {company.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{company.name}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center truncate"></p>
              <p className="text-sm text-gray-600 text-center truncate"></p>
              <p className="text-sm text-gray-600 text-center truncate"></p>
              <p className="text-sm text-gray-400 text-right">
                <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 