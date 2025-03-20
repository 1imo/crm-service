'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Trash2, Loader2, Share, Mail, Link as LinkIcon, Receipt, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useParams, useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchInvoice = async () => {
      try {
        const response = await fetch(`/api/invoices/${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        
        const html = await response.text();
        if (!html) throw new Error('Received empty invoice content');
        
        // Add delay to ensure iframe is mounted
        setTimeout(() => {
          if (!isMounted) return;

          const iframe = document.getElementById('invoice-iframe') as HTMLIFrameElement;
          if (!iframe) {
            console.error('Iframe not found, retrying...');
            // Retry after a short delay
            setTimeout(fetchInvoice, 100);
            return;
          }

          const loadIframe = () => {
            try {
              if (!iframe.contentWindow) throw new Error('No iframe content window');
              
              iframe.contentWindow.document.open();
              iframe.contentWindow.document.write(html);
              iframe.contentWindow.document.close();

              const updateIframeHeight = () => {
                if (iframe.contentWindow) {
                  const height = iframe.contentWindow.document.documentElement.scrollHeight;
                  iframe.style.height = `${height}px`;
                }
              };

              setTimeout(updateIframeHeight, 100);
              iframe.onload = updateIframeHeight;
              window.addEventListener('resize', updateIframeHeight);

              return () => window.removeEventListener('resize', updateIframeHeight);
            } catch (err) {
              console.error('Error loading iframe content:', err);
              setError('Failed to display invoice content');
            }
          };

          if (iframe.contentWindow) {
            loadIframe();
          } else {
            iframe.onload = loadIframe;
          }
        }, 0);

      } catch (err) {
        if (isMounted) {
          console.error('Error in fetchInvoice:', err);
          setError(err instanceof Error ? err.message : 'Failed to load invoice');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (params.id) {
      fetchInvoice();
    }

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const handleSendToClient = async () => {
    try {
      setIsSending(true);
      const response = await fetch(`/api/invoices/${params.id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to send invoice');
      }

      toast({
        title: "Invoice Sent",
        description: "The invoice has been sent to the client successfully.",
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error('Error sending invoice:', error);
      toast({
        title: "Error",
        description: "Failed to send invoice. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/invoices/${params.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      toast({
        title: "Invoice Deleted",
        description: "The invoice has been deleted successfully.",
      });

      // Redirect to invoices list
      router.push('/invoices');
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast({
        title: "Error",
        description: "Failed to delete invoice. Please try again.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCopyLink = async () => {
    let shareUrl = '';
    try {
      const response = await fetch(`/api/invoices/${params.id}/share`);
      if (!response.ok) throw new Error('Failed to get share link');
      const { url } = await response.json();
      shareUrl = url;
      
      let copied = false;

      // Try modern clipboard API first
      try {
        await navigator.clipboard.writeText(shareUrl);
        copied = true;
      } catch (e) {
        // Modern API failed, try execCommand
        try {
          const textarea = document.createElement('textarea');
          textarea.value = shareUrl;
          textarea.style.position = 'absolute';
          textarea.style.left = '-9999px';
          document.body.appendChild(textarea);
          textarea.select();
          copied = document.execCommand('copy');
          document.body.removeChild(textarea);
        } catch (e2) {
          console.error('Clipboard fallback failed:', e2);
        }
      }

      if (!copied) {
        throw new Error('Unable to copy to clipboard');
      }

      toast({
        title: "Link Copied",
        description: "Share link has been copied to clipboard.",
        duration: 2000,
      });
    } catch (error) {
      console.error('Error copying link:', error);
      toast({
        title: "Error",
        description: shareUrl 
          ? `Failed to copy share link. Please copy manually: ${shareUrl}`
          : "Failed to get share link",
        duration: 5000,
      });
    }
  };

  const Header = () => (
    <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[59px] items-center px-6 gap-4">
        <div className="flex items-center flex-shrink-0">
          <Receipt className="h-5 w-5" />
          <div className="ml-3">
            <h1 className="text-sm font-medium leading-none">Invoice Details</h1>
          </div>
        </div>
        <Separator orientation="vertical" className="h-8" />
        <div className="flex-1"></div> {/* Spacer */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            <Share className="h-4 w-4 mr-2" />
            <span>Share</span>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2">
              <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
            </svg>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            <DropdownMenuItem onClick={handleSendToClient} className="px-4 py-2 gap-3 whitespace-nowrap">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>Generate Invoice</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} className="px-4 py-2 gap-3 whitespace-nowrap">
              <LinkIcon className="h-4 w-4 flex-shrink-0" />
              <span>Copy Share Link</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Separator orientation="vertical" className="h-8" />
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteDialog(true)}
          disabled={loading || !!error || isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {isDeleting ? "Deleting..." : "Delete Invoice"}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col h-full">
        <Header />
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-0">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center">
              <p className="text-sm text-white">{error}</p>
            </div>
          ) : (
            <iframe 
              id="invoice-iframe"
              className="w-full h-full bg-white"
              style={{ border: 'none', display: 'block' }}
              title="Invoice Preview"
            />
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete the invoice
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete Invoice
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}