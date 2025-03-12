'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Company {
  id: string;
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, update: updateSession } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [isCompanySwitcherOpen, setIsCompanySwitcherOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!session || !mounted) return;

    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        setCompanies(data);

        const storedCompanyId = localStorage.getItem('selectedCompanyId');
        
        if (storedCompanyId && data.some((company: Company) => company.id === storedCompanyId)) {
          setSelectedCompanyId(storedCompanyId);
          if (storedCompanyId !== session?.user?.companyId) {
            await updateSession({
              ...session,
              user: {
                ...session?.user,
                companyId: storedCompanyId
              }
            });
          }
        } else if (data.length > 0) {
          setSelectedCompanyId(data[0].id);
          localStorage.setItem('selectedCompanyId', data[0].id);
          if (data[0].id !== session?.user?.companyId) {
            await updateSession({
              ...session,
              user: {
                ...session?.user,
                companyId: data[0].id
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchCompanies();
  }, [mounted, session, updateSession]);

  const handleCompanyChange = async (companyId: string) => {
    if (!mounted || companyId === selectedCompanyId) return;
    
    setSelectedCompanyId(companyId);
    localStorage.setItem('selectedCompanyId', companyId);
    
    await updateSession({
      ...session,
      user: {
        ...session?.user,
        companyId: companyId
      }
    });
    
    setIsCompanySwitcherOpen(false);
    window.location.reload();
  };

  // Don't show navbar on signin page
  if (!mounted || pathname === '/signin') {
    return null;
  }

  const currentCompany = companies.find((company: Company) => company.id === selectedCompanyId);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )},
    { href: '/prospects', label: 'Prospects', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )},
    { href: '/companies', label: 'Companies', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { href: '/customers', label: 'Customers', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
    { href: '/products', label: 'Products', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )},
    { href: '/orders', label: 'Orders', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )},
    { href: '/users', label: 'Users', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { href: '/settings', label: 'Settings', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  return (
    <nav className="h-screen w-64 bg-white border-r border-gray-200">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <span className="text-xl font-bold text-[#00603A]">PapStore CRM</span>
          </Link>
        </div>

        <div className="flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-[#E8F5F0] text-[#00603A]'
                  : 'text-[#00603A] hover:bg-[#E8F5F0]'
              }`}
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-3 font-medium">{item.label}</span>
              </div>
              {pathname === item.href && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </Link>
          ))}
        </div>

        <div className="border-t border-gray-200">
          <div className="relative">
            {isCompanySwitcherOpen && companies.length > 0 && (
              <div className="absolute bottom-full w-full bg-white border-t border-gray-200 max-h-64 overflow-y-auto">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanyChange(company.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 text-sm transition-colors ${
                      selectedCompanyId === company.id
                        ? 'bg-[#E8F5F0] text-[#00603A]'
                        : 'text-[#00603A] hover:bg-[#E8F5F0]'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        selectedCompanyId === company.id ? 'bg-[#00603A]' : 'bg-gray-300'
                      }`} />
                      <span className="font-medium truncate">{company.name}</span>
                    </div>
                    {selectedCompanyId === company.id && (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <button
              onClick={() => setIsCompanySwitcherOpen(!isCompanySwitcherOpen)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#E8F5F0] transition-colors border-b border-gray-200 text-[#00603A]"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-[#00603A] mr-3" />
                <span className="text-sm font-medium truncate">
                  {currentCompany?.name || 'Select Company'}
                </span>
              </div>
              <svg
                className={`w-5 h-5 transition-transform ${isCompanySwitcherOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full px-4 py-3 flex items-center justify-between text-sm text-[#00603A] hover:bg-[#E8F5F0] transition-colors"
          >
            <div className="flex items-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="ml-3 font-medium">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
} 