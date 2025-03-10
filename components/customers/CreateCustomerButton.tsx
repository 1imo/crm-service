'use client';

import { useState } from 'react';

export function CreateCustomerButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <button
      onClick={() => setShowForm(true)}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#00603A] hover:bg-[#004D2E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00603A] transition-colors"
    >
      <svg 
        className="h-5 w-5 mr-2" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
        />
      </svg>
      New Customer
    </button>
  );
} 