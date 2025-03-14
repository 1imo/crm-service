'use client';

import { CreateOrderForm } from '@/components/orders/CreateOrderForm';
import { motion } from 'framer-motion';
import { ClipboardList } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CreateOrderPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0">
            <ClipboardList className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Create Order
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Create a new order in your CRM
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="mx-6 h-8" />
          <div className="flex-1" />
        </div>
      </div>

      {/* Main Content */}
        <div className="w-full">
          <CreateOrderForm onComplete={() => window.location.href = '/orders'} />
        </div>
    </div>
  );
} 