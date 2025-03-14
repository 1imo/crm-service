'use client';

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BarChart2,
  Download,
  Calendar,
  SlidersHorizontal,
  Construction
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header + Actions */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6 gap-4">
          <div className="flex items-center flex-shrink-0">
            <BarChart2 className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">Analytics & Reports</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Track your business performance
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-8" />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
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