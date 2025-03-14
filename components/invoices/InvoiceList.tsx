'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: string;
  status: string;
  due_date: string;
  created_at: string;
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await fetch('/api/invoices');
        if (!response.ok) throw new Error('Failed to fetch invoices');
        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        setError('Failed to fetch invoices');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'paid':
        return 'default';
      case 'overdue':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 rounded-lg border p-4 bg-white">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg">
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Get started by creating your first invoice
        </p>
        <Button asChild>
          <Link href="/invoices/new">Create Invoice</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
        >
          <Checkbox />
          <div className="flex flex-1 items-center space-x-4">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary">
                {invoice.customer_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="grid grid-cols-6 flex-1 items-center gap-4">
              <div className="col-span-2">
                <Link 
                  href={`/invoices/${invoice.id}`}
                  className="font-medium hover:underline"
                >
                  {invoice.customer_name}
                </Link>
                <p className="text-sm text-muted-foreground">
                  #{invoice.invoice_number}
                </p>
              </div>
              
              <div className="text-sm">
                £{invoice.amount}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Due {new Date(invoice.due_date).toLocaleDateString()}
              </div>
              
              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                {invoice.status}
              </Badge>

              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${invoice.id}`} className="cursor-pointer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/invoices/${invoice.id}/edit`} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 