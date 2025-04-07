import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

interface SendEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  roomName?: string;
  companyId: string;
}

export function SendEmailModal({ open, onOpenChange, customerId, roomName, companyId }: SendEmailModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!email) return;
    
    setSending(true);
    try {
      const url = `${process.env.NEXT_PUBLIC_ROOMING_SERVICE_URL}/floorplan/send/${companyId}/${customerId}${roomName ? `/${roomName}` : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      toast({
        title: "Success",
        description: "Floorplan has been sent to the email address",
      });
      onOpenChange(false);
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send floorplan",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Floorplan</DialogTitle>
          <DialogDescription>
            Enter the email address to send the floorplan to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 