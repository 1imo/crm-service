'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  Construction
} from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header + Actions */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6 gap-4">
          <div className="flex items-center flex-shrink-0">
            <Users className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">Users</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage system users and permissions
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-8"
            />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Administrators</SelectItem>
              <SelectItem value="manager">Managers</SelectItem>
              <SelectItem value="user">Standard Users</SelectItem>
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
            <Link href="/users/new">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Link>
          </Button>
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