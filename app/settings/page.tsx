'use client';

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  Save,
  Construction
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header + Actions */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6 gap-4">
          <div className="flex items-center flex-shrink-0">
            <Settings className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">Settings</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Manage your system preferences
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <Button variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
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