'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Share2, Copy, Mail, Link as LinkIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export default function RoomPage({ params }: { params: { customerId: string, roomName: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.companyId) {
      router.push('/signin');
      return;
    }

    // Construct the URL for the rooming service
    const url = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/rooms/${session.user.companyId}/${params.customerId}/${params.roomName}`;
    setIframeUrl(url);
    setLoading(false);
  }, [session, params.customerId, router]);

  const handleShare = async (type: 'copy' | 'email' | 'link') => {
    const shareUrl = window.location.href;

    switch (type) {
      case 'copy':
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Copied!",
          description: "URL copied to clipboard",
        });
        break;
      case 'email':
        window.location.href = `mailto:?subject=Room Plans&body=${encodeURIComponent(shareUrl)}`;
        break;
      case 'link':
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Copied!",
          description: "Link copied to clipboard",
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0 pr-6">
            <Users className="h-5 w-5" />
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">
                Room Plans
              </h1>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Share Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleShare('copy')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy to Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('email')}>
                  <Mail className="h-4 w-4 mr-2" />
                  Share via Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('link')}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content (iframe) */}
      <div className="flex-1">
        <iframe
          src={iframeUrl}
          className="w-full h-full border-0"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
} 