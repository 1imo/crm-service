'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Menu } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  HomeIcon,
  Users2Icon,
  Building2Icon,
  UserIcon,
  PackageIcon,
  ShoppingCartIcon,
  ReceiptIcon,
  Settings2Icon,
  LogOutIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Company {
  id: string;
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, update: updateSession } = useSession();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
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
    
    window.location.reload();
  };

  if (!mounted || pathname === '/signin') {
    return null;
  }

  const currentCompany = companies.find((company) => company.id === selectedCompanyId);

  const navItems = [
    {
      title: "Overview",
      items: [
        {
          href: '/dashboard',
          label: 'Dashboard',
          icon: <HomeIcon className="h-4 w-4" />
        },
        {
          href: '/analytics',
          label: 'Analytics',
          icon: <PackageIcon className="h-4 w-4" />
        },
      ]
    },
    {
      title: "Management",
      items: [
        {
          href: '/prospects',
          label: 'Prospects',
          icon: <Users2Icon className="h-4 w-4" />
        },
        {
          href: '/companies',
          label: 'Companies',
          icon: <Building2Icon className="h-4 w-4" />
        },
        {
          href: '/customers',
          label: 'Customers',
          icon: <UserIcon className="h-4 w-4" />
        },
        {
          href: '/products',
          label: 'Products',
          icon: <PackageIcon className="h-4 w-4" />
        },
        {
          href: '/orders',
          label: 'Orders',
          icon: <ShoppingCartIcon className="h-4 w-4" />
        },
        {
          href: '/invoices',
          label: 'Invoices',
          icon: <ReceiptIcon className="h-4 w-4" />
        },
      ]
    },
    {
      title: "Settings",
      items: [
        {
          href: '/users',
          label: 'Users',
          icon: <Users2Icon className="h-4 w-4" />
        },
        {
          href: '/settings',
          label: 'Settings',
          icon: <Settings2Icon className="h-4 w-4" />
        },
      ]
    }
  ];

  return (
    <div className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col">
      <div className="flex flex-col h-full border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[60px] items-center px-6 border-b">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-2 font-semibold"
          >
            <PackageIcon className="h-6 w-6" />
            <span className="font-bold">PapStore CRM</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-4">
            <Select value={selectedCompanyId} onValueChange={handleCompanyChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem 
                    key={company.id} 
                    value={company.id}
                    className="px-4 py-2"
                  >
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 p-4">
              {navItems.map((section, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="text-sm font-medium leading-none text-muted-foreground px-2">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Button
                        key={item.href}
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2",
                          pathname === item.href && "bg-secondary"
                        )}
                        asChild
                      >
                        <Link href={item.href}>
                          {item.icon}
                          <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-auto border-t">
          <div className="p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto"
                >
                  <Avatar className="h-10 w-10 border bg-secondary">
                    <AvatarImage src={session?.user?.image || ''} />
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {session?.user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start justify-center text-left">
                    <span className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      {session?.user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-[calc(100vw-32px)] lg:w-[232px]"
                align="end" 
                side="top"
                alignOffset={-8}
              >
                <DropdownMenuLabel className="px-4 py-2">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="px-4 py-2 gap-3">
                  <Settings2Icon className="h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="px-4 py-2 gap-3 text-red-600 focus:text-red-600"
                  onClick={() => signOut({ callbackUrl: '/signin' })}
                >
                  <LogOutIcon className="h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
} 