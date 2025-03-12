'use client';

import Link from 'next/link';

export function CreateOrderButton() {
  return (
    <Link
      href="/orders/new"
      className="inline-flex items-center px-4 py-2 bg-white text-[#00603A] rounded-md hover:bg-[#E8F5F0] transition-colors"
    >
      Create Order
    </Link>
  );
} 