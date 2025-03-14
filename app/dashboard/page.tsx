'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  PackagePlus,
  UserPlus,
  FileText,
  Construction,
} from "lucide-react";

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

export default function Dashboard() {
  const { data: session, status } = useSession();

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
    
    if (user.firstName) return user.firstName;
    if (user.name) {
      const nameParts = user.name.split(' ');
      if (nameParts[0] && nameParts[0] !== 'undefined') return nameParts[0];
    }
    
    return 'User';
  };

  const firstName = getFirstName();

  const quickActions = [
    {
      label: 'New Order',
      href: '/orders/new',
      icon: PackagePlus,
      description: 'Create a new order'
    },
    {
      label: 'New Customer',
      href: '/customers/new',
      icon: UserPlus,
      description: 'Add a new customer'
    },
    {
      label: 'New Invoice',
      href: '/invoices/new',
      icon: FileText,
      description: 'Create a new invoice'
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header + Quick Actions */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6 gap-4">
          <div className="flex items-center flex-shrink-0">
            <Package className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                {getGreeting()}, {firstName}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Here's what's happening with your business today.
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Under Construction Message */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Construction className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-xl font-medium text-muted-foreground">Under Construction</p>
        </div>
      </div>
    </div>
  );
} 