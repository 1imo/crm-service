"use client"

import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import { Providers } from './providers';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isSignInPage = pathname === '/signin';

  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Providers>
          {!isSignInPage && (
            <div className="fixed top-0 left-0 w-[256px] h-screen">
              <Navbar />
            </div>
          )}
          <div className="flex h-screen">
            {!isSignInPage && <div className="w-[256px] flex-shrink-0" />}
            <main className="flex-1 min-h-screen overflow-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
} 