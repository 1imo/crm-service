'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface DashboardStats {
  customers: number;
  orders: number;
  products: number;
  revenue: number;
}

interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
  }
}

interface RecentOrder {
  id: string;
  customer_id: string;
  customer_name: string;
  product_name: string;
  quantity: number;
  total_price: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    orders: 0,
    products: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFirstName = () => {
    if (status === 'loading') return 'Loading...';
    
    const user = (session as CustomSession)?.user;
    if (!user) return 'User';
    
    // Try to use firstName directly if available
    if (user.firstName) {
      return user.firstName;
    }
    
    // Fallback to splitting name
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts[0] && nameParts[0] !== 'undefined') {
        return nameParts[0];
      }
    }
    
    return 'User';
  };

  const firstName = getFirstName();

  const quickActions = [
    {
      label: 'Add Order',
      href: '/orders/new',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      label: 'Add Customer',
      href: '/customers/new',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      ),
    },
    {
      label: 'Add Product',
      href: '/products/new',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      label: 'Add Invoice',
      href: '/invoices/new',
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'awaiting payment':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="bg-[#00603A] text-white">
        <div className="px-12 py-16">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <div className="grid grid-cols-3 gap-6 mb-16">
                <div className="bg-[#004D2E]/20 rounded-lg p-6">
                  <p className="text-[#B8E1D3] text-sm">Pending Payment</p>
                  <p className="text-2xl font-semibold mt-1">12</p>
                  <p className="text-[#B8E1D3] text-sm mt-2">+15% from last week</p>
                </div>
                <div className="bg-[#004D2E]/20 rounded-lg p-6">
                  <p className="text-[#B8E1D3] text-sm">Pending Orders</p>
                  <p className="text-2xl font-semibold mt-1">15</p>
                  <p className="text-[#B8E1D3] text-sm mt-2">+8% from last week</p>
                </div>
                <div className="bg-[#004D2E]/20 rounded-lg p-6">
                  <p className="text-[#B8E1D3] text-sm">Pending Prospects</p>
                  <p className="text-2xl font-semibold mt-1">23</p>
                  <p className="text-[#B8E1D3] text-sm mt-2">+12% from last week</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-semibold">
                  {getGreeting()}, {firstName}
                </h1>
                <p className="mt-1 text-[#B8E1D3]">Welcome to your dashboard</p>
              </div>
              <div className="flex space-x-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
                  >
                    {action.icon}
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-12">
        {/* Recent Orders */}
        <div className="bg-white">
          <div className="px-6 py-4 border-b border-gray-200 border-b-px">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div>
            {[
              { 
                id: 'ORD-001',
                customer_id: 'CUST-001',
                customer_name: 'Thomas Harris',
                product_name: 'Premium Paper Pack',
                quantity: 50,
                total_price: '610.00',
                status: 'Paid',
                created_at: '2024-01-18T10:30:00Z'
              },
              {
                id: 'ORD-002',
                customer_id: 'CUST-002',
                customer_name: 'Sarah Wilson',
                product_name: 'Recycled Card Stock',
                quantity: 25,
                total_price: '230.00',
                status: 'Draft',
                created_at: '2024-01-17T15:45:00Z'
              },
              {
                id: 'ORD-003',
                customer_id: 'CUST-003',
                customer_name: 'Michael Chen',
                product_name: 'Custom Letterheads',
                quantity: 100,
                total_price: '850.00',
                status: 'Awaiting Payment',
                created_at: '2024-01-17T09:15:00Z'
              },
              {
                id: 'ORD-004',
                customer_id: 'CUST-004',
                customer_name: 'Emma Davis',
                product_name: 'Business Cards',
                quantity: 500,
                total_price: '445.00',
                status: 'Paid',
                created_at: '2024-01-16T14:20:00Z'
              },
            ].map((order, i) => (
              <Link 
                href={`/orders/${order.id}`}
                key={order.id} 
                className="block px-6 py-4 border-t border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="grid grid-cols-5 items-center gap-4">
                  <div className="flex items-center space-x-4 justify-self-start">
                    <div className="h-10 w-10 rounded-full bg-gray-100" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                      </div>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 justify-self-center truncate max-w-[8ch]">#{order.id}</p>
                  <p className="text-sm text-gray-600 justify-self-center">{order.product_name} × {order.quantity}</p>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium justify-self-center ${getStatusBadgeColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-medium text-gray-900 justify-self-end">£{order.total_price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 