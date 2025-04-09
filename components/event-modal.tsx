'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';

interface EventModalProps {
  trigger: React.ReactNode;
  customerId?: string;
  customerName?: string;
  companyId?: string;
  orderId?: string;
  onEventCreated?: () => void;
}

export function EventModal({ 
  trigger, 
  customerId, 
  customerName, 
  companyId,
  orderId,
  onEventCreated 
}: EventModalProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('meeting');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    customer_id: string;
    company_id: string;
  } | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId) {
        try {
          const response = await fetch(`/api/orders/${orderId}`);
          if (!response.ok) throw new Error('Failed to fetch order details');
          const data = await response.json();
          setOrderDetails({
            customer_id: data.customer_id,
            company_id: data.company_id
          });
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const handleTimeChange = (value: string, setTime: (time: string) => void) => {
    // Allow typing full time format (HH:MM)
    if (value.length <= 5) {
      // Remove any non-digit characters
      const digits = value.replace(/\D/g, '');
      
      // Format as HH:MM
      if (digits.length === 0) {
        setTime('');
      } else if (digits.length === 1) {
        setTime(digits);
      } else if (digits.length === 2) {
        // Only add colon if we're not backspacing from a colon
        if (!value.endsWith(':')) {
          setTime(`${digits}:`);
        } else {
          setTime(digits);
        }
      } else if (digits.length <= 4) {
        // If we're backspacing at the colon position
        if (value.endsWith(':')) {
          // Remove the colon and the last digit of the hour
          setTime(digits.slice(0, -1));
        } else {
          setTime(`${digits.slice(0, 2)}:${digits.slice(2)}`);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime || !title) return;

    setLoading(true);
    try {
      const startDateTime = new Date(date);
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(date);
      const [endHours, endMinutes] = endTime.split(':').map(Number);
      endDateTime.setHours(endHours, endMinutes);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: companyId || orderDetails?.company_id,
          userId: 'current-user-id', // TODO: Get from auth context
          customerId: customerId || orderDetails?.customer_id,
          title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          type,
          status: 'pending',
          color: '#00603A', // Default color
          notes: notes ? [{
            content: notes
          }] : []
        }),
      });

      if (!response.ok) throw new Error('Failed to create event');

      const event = await response.json();

      // If we're on the order page, get the order ID from the URL
      const orderIdFromPath = pathname.startsWith('/orders/') ? pathname.split('/')[2] : null;
      const orderIdToLink = orderId || orderIdFromPath;

      // If we have an orderId, link it to the event
      if (orderIdToLink) {
        await fetch('/api/events/link-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event.id,
            orderId: orderIdToLink
          }),
        });
      }

      setOpen(false);
      onEventCreated?.();
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarOpen = (open: boolean) => {
    console.log('Calendar open state changed:', open);
    if (open) {
      // Use setTimeout to ensure the state change happens after the click event
      setTimeout(() => {
        setCalendarOpen(true);
      }, 0);
    } else {
      setCalendarOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Schedule a new event {customerName ? `for ${customerName}` : ''}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={handleCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal hover:bg-accent hover:text-accent-foreground",
                      !date && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-auto p-0 bg-white shadow-lg" 
                  align="start" 
                  side="bottom"
                  style={{ 
                    zIndex: 9999,
                    position: 'relative'
                  }}
                  onPointerDownOutside={(e) => {
                    e.preventDefault();
                  }}
                  onInteractOutside={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="rounded-md border">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(selectedDate) => {
                        console.log('Date selected:', selectedDate);
                        setDate(selectedDate);
                        setCalendarOpen(false);
                      }}
                      initialFocus
                      className="rounded-md"
                      disabled={(date) => date < new Date()}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  value={startTime}
                  onChange={(e) => handleTimeChange(e.target.value, setStartTime)}
                  placeholder="09:00"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  value={endTime}
                  onChange={(e) => handleTimeChange(e.target.value, setEndTime)}
                  placeholder="17:00"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="visit">Visit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the event..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 