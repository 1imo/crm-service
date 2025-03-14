'use client';

import { Metadata } from "next";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import {
  Building2,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Company {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (!response.ok) throw new Error('Failed to fetch companies');
        const data = await response.json();
        console.log(data)
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

  return (
    <div className="flex flex-col h-full">
      {/* Header + Filters and Actions */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6 gap-4">
          <div className="flex items-center flex-shrink-0">
            <Building2 className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">Manage your company relationships</h1>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search companies..."
              className="w-full pl-8"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild>
            <Link href="/companies/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Company
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
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
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] border rounded-lg">
            <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No companies found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first company
            </p>
            <Button asChild>
              <Link href="/companies/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 bg-white"
              >
                <Checkbox />
                <div className="flex flex-1 items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {company.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-1 items-center justify-between">
                    <p className="text-sm font-medium">{company.name}</p>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem asChild>
                          <Link href={`/companies/${company.id}`} className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/companies/${company.id}/edit`} className="cursor-pointer">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 