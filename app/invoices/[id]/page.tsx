'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Trash2, Loader2 } from "lucide-react";
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
        variant: "destructive",
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
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const Header = () => (
    <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[59px] items-center px-6 gap-4 justify-between">
        <h1 className="text-sm font-medium">Invoice Details</h1>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            onClick={handleSendToClient}
            disabled={loading || !!error || isSending}
          >
            {isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            {isSending ? "Sending..." : "Send to Client"}
          </Button>
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
              <p className="text-sm text-muted-foreground">{error}</p>
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
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
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