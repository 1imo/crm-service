import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventsRepository } from '@/lib/repositories/eventsRepository';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, orderId } = await request.json();

    const batchId = orderId;

    if (!eventId || !batchId) {
      return NextResponse.json(
        { error: 'Event ID and Batch ID are required' },
        { status: 400 }
      );
    }

    const eventsRepository = new EventsRepository();
    
    // First check if the event exists
    const event = await eventsRepository.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Link the batch to the event using the event_linked_orders table
    await eventsRepository.linkOrderToEvent(eventId, batchId);

    // Return the updated event with all its details
    const updatedEvent = await eventsRepository.getEventById(eventId);
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error linking batch to event:', error);
    return NextResponse.json(
      { error: 'Failed to link batch to event' },
      { status: 500 }
    );
  }
} 