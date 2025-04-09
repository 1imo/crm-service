import { CalendarEvent } from '@/types/calendar';

export const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Floor Installation',
    startTime: new Date(2025, 3, 8, 9, 0),
    endTime: new Date(2025, 3, 8, 12, 0),
    type: 'visit',
    customerName: 'John Smith',
    customerId: 'cus_123',
    status: 'confirmed',
    color: '#3b82f6',
    address: {
      street: '123 High Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'United Kingdom'
    },
    linkedOrders: ['ord_123', 'ord_124']
  },
  {
    id: '2',
    title: 'Carpet Fitting',
    startTime: new Date(2025, 3, 8, 14, 0),
    endTime: new Date(2025, 3, 8, 16, 0),
    type: 'visit',
    customerName: 'Sarah Johnson',
    customerId: 'cus_124',
    status: 'pending',
    color: '#f59e0b',
    address: {
      street: '45 Park Lane',
      city: 'Manchester',
      postcode: 'M1 2AB',
      country: 'United Kingdom'
    },
    linkedOrders: ['ord_125']
  },
  {
    id: '3',
    title: 'Order Delivery',
    startTime: new Date(2025, 3, 9, 10, 0),
    endTime: new Date(2025, 3, 9, 11, 0),
    type: 'order',
    customerName: 'Michael Brown',
    customerId: 'cus_125',
    status: 'confirmed',
    color: '#10b981',
    address: {
      street: '78 Victoria Road',
      city: 'Birmingham',
      postcode: 'B1 1AA',
      country: 'United Kingdom'
    },
    linkedOrders: ['ord_126']
  },
  {
    id: '4',
    title: 'Site Survey',
    startTime: new Date(2025, 3, 10, 13, 0),
    endTime: new Date(2025, 3, 10, 14, 30),
    type: 'visit',
    customerName: 'Emma Wilson',
    customerId: 'cus_126',
    status: 'pending',
    color: '#f59e0b',
    address: {
      street: '22 Baker Street',
      city: 'London',
      postcode: 'NW1 6XE',
      country: 'United Kingdom'
    }
  },
  {
    id: '5',
    title: 'Team Meeting',
    startTime: new Date(2025, 3, 11, 9, 0),
    endTime: new Date(2025, 3, 11, 10, 0),
    type: 'meeting',
    customerName: 'Internal',
    customerId: 'internal',
    status: 'confirmed',
    color: '#8b5cf6',
    address: {
      street: 'Office HQ',
      city: 'London',
      postcode: 'EC1A 1AA',
      country: 'United Kingdom'
    }
  },
  {
    id: '6',
    title: 'Floor Installation',
    startTime: new Date(2025, 3, 12, 8, 0),
    endTime: new Date(2025, 3, 12, 16, 0),
    type: 'visit',
    customerName: 'David Lee',
    customerId: 'cus_127',
    status: 'confirmed',
    color: '#3b82f6',
    address: {
      street: '10 Downing Street',
      city: 'London',
      postcode: 'SW1A 2AA',
      country: 'United Kingdom'
    },
    linkedOrders: ['ord_127']
  }
]; 