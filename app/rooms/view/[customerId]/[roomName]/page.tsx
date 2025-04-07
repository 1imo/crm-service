'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Users, Share2, Download, Printer, Mail, User, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendEmailModal } from '@/components/SendEmailModal';
import { toast } from "@/components/ui/use-toast";

export default function ViewFloorplan({ params }: { params: { customerId: string, roomName: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [iframeUrl, setIframeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [emailModalOpen, setEmailModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.companyId) {
      router.push('/signin');
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/floorplan/${session.user.companyId}/${params.customerId}/${params.roomName}`;
    setIframeUrl(url);
    setLoading(false);
  }, [session, params.customerId, params.roomName, router]);

  const handlePrint = async () => {
    if (!session?.user?.companyId) return;
    
    const pdfUrl = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/floor/pdf/${session.user.companyId}/${params.customerId}/${params.roomName}`;
    
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to generate PDF for printing');
      
      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create an iframe to load the PDF
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      
      // When the iframe loads, trigger the print dialog
      iframe.onload = () => {
        // Wait a moment for the PDF to render
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Clean up after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        }, 500);
      };
      
      // Add the iframe to the document
      document.body.appendChild(iframe);
    } catch (error) {
      console.error('Error printing PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF for printing",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = async () => {
    if (!session?.user?.companyId) return;
    
    const pdfUrl = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/floor/pdf/${session.user.companyId}/${params.customerId}/${params.roomName}`;
    
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error('Failed to download PDF');
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `floorplan-${params.roomName}.pdf`;

      // Convert the response to a blob
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download PDF",
        variant: "destructive",
      });
    }
  };

  const handleSendToClient = async () => {
    try {
      const url = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/floorplan/send-to-client/${session?.user?.companyId}/${params.customerId}/${params.roomName}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to send to client');
      toast({
        title: "Success",
        description: "Floorplan has been sent to the client",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send floorplan to client",
        variant: "destructive",
      });
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
                Floorplans
              </h1>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
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
                <DropdownMenuItem onClick={handleSendToClient}>
                  <User className="h-4 w-4 mr-2" />
                  Send to Client
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEmailModalOpen(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send via Email
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

      <SendEmailModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        customerId={params.customerId}
        roomName={params.roomName}
        companyId={session?.user?.companyId || ''}
      />
    </div>
  );
}