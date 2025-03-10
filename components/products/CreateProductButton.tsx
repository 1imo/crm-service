'use client';

import Link from 'next/link';

export function CreateProductButton() {
  return (
    <Link
      href="/products/new"
      className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      Create Product
    </Link>
  );
} 