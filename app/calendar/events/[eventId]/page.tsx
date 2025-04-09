'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar as CalendarIcon, Clock, User, MapPin, Phone, Mail, ChevronLeft, Package, Plus, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { Event } from '@/types/event';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface Order {
  id: string;
  batch_id: string;
  order_number?: string;
  status: string;
  total_price: string;
  created_at: string;
  company_id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  notes: string | null;
  customer_details: {
    id: string;
    first_name: string;
    last_name: string;
  };
  product_details: {
    id: string;
    company_id: string;
  };
  updated_at: string;
}

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [linkedOrders, setLinkedOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/events/${params.eventId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event');
        }
        const data = await response.json();
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        setError('Failed to load event. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [params.eventId]);

  useEffect(() => {
    const fetchLinkedOrders = async () => {
      if (!event?.linked_orders?.length) {
        setLinkedOrders([]);
        return;
      }
      
      try {
        setLoadingOrders(true);
        // Use Set to ensure unique batch IDs
        const uniqueBatchIds = [...new Set(event.linked_orders)];
        const orders = await Promise.all(
          uniqueBatchIds.map(async (batchId) => {
            const response = await fetch(`/api/orders/batch/${batchId}`);
            if (!response.ok) throw new Error('Failed to fetch order');
            const data = await response.json();
            // The API returns an array of orders, so we need to handle that
            if (Array.isArray(data)) {
              return data[0]; // Get the first order from the batch
            }
            return data; // If it's a single order object
          })
        );
        // Filter out any undefined/null values and ensure unique keys
        const uniqueOrders = orders.filter(order => order && order.id);
        // Ensure we don't have duplicate orders by batch_id
        const seenBatchIds = new Set();
        const filteredOrders = uniqueOrders.filter(order => {
          if (seenBatchIds.has(order.batch_id)) {
            return false;
          }
          seenBatchIds.add(order.batch_id);
          return true;
        });
        setLinkedOrders(filteredOrders);
      } catch (error) {
        console.error('Error fetching linked orders:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive",
        });
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchLinkedOrders();
  }, [event?.linked_orders]); // Only depend on the linked_orders array itself

  const openGoogleMaps = () => {
    if (!event) return;
    const address = `${event.address?.street || ''}, ${event.address?.city || ''}, ${event.address?.postcode || ''}, ${event.address?.country || ''}`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const handleAddNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Error",
        description: "Note content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/events/notes/${params.eventId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: noteContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add note');
      }

      const updatedEvent = await response.json();
      setEvent(updatedEvent);
      setIsNoteModalOpen(false);
      setNoteContent('');
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (deleteConfirmation !== event.title) {
      toast({
        title: "Error",
        description: "Please enter the exact event title to confirm deletion",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/events/${params.eventId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      router.push('/calendar');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setDeleteConfirmation('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Loading event...</h1>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Event not found</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => router.push('/calendar')}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-[59px] items-center px-6">
          <div className="flex items-center flex-shrink-0 pr-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/calendar')}
              className="px-4"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center flex-shrink-0 pl-6 pr-6">
            <div className="p-2 rounded-md bg-muted">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h1 className="text-sm font-medium leading-none">{event.title}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(event.start_time), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <Separator orientation="vertical" className="h-8" />
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Call Customer
            </Button>
            <Button variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Resend Email Invite
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={openGoogleMaps}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View Location
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => setIsNoteModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Event
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* Event Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Time Card */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {format(new Date(event.start_time), 'HH:mm')} - {format(new Date(event.end_time), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Customer Card */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Customer</p>
                      <Link 
                        href={`/customers/${event.customer_id}`}
                        className="font-medium hover:underline"
                      >
                        {event.customer_name || 'Unknown Customer'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Address Card */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {event.address?.street || 'No address provided'}<br />
                        {event.address?.city ? `${event.address.city}, ${event.address.postcode}` : ''}<br />
                        {event.address?.country || ''}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Type & Status Card */}
                <div className="p-4 rounded-lg border bg-card">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: event.color || '#00603A' }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{event.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{event.status}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Linked Orders */}
            {event?.linked_orders && event.linked_orders.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-medium mb-2">Linked Orders</h3>
                  <div className="space-y-2">
                    {loadingOrders ? (
                      <div className="text-sm text-muted-foreground">Loading orders...</div>
                    ) : (
                      linkedOrders.map((order) => (
                        <Link
                          key={order.id}
                          href={`/orders/${order.batch_id}`}
                          className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                        >
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Batch #{order.batch_id.split('-')[0].toUpperCase()}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>Status: {order.status}</span>
                              <span>•</span>
                              <span>Total: £{order.total_price}</span>
                              <span>•</span>
                              <span>
                                {order.created_at ? 
                                  format(new Date(order.created_at.replace('Z', '')), 'MMM d, yyyy') 
                                  : 'No date'
                                }
                              </span>
                            </div>
                          </div>
                          <ChevronLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Notes Section */}
            <div>
              <h3 className="text-sm font-medium mb-2">Notes</h3>
              <div className="rounded-md border p-4 min-h-[100px]">
                {event.notes && event.notes.length > 0 ? (
                  <div className="space-y-4">
                    {event.notes.map((note) => (
                      <div key={note.id} className="text-sm">
                        <p className="text-muted-foreground">
                          {format(new Date(note.created_at), 'MMM d, yyyy HH:mm')}
                        </p>
                        <p className="mt-1">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No notes available for this event.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>
              Add a note to this event. The note will be visible to all users with access to this event.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter your note here..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the event and all associated notes and linked orders.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Please type the event title to confirm deletion:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter event title"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || deleteConfirmation !== event?.title}
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 