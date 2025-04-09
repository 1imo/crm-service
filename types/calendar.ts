export type CalendarEventType = 'order' | 'visit' | 'meeting';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  type: CalendarEventType;
  customerName: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  color: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    country: string;
  };
  linkedOrders?: string[];
} 