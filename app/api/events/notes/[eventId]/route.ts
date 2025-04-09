import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { EventsRepository } from '@/lib/repositories/eventsRepository';

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 });
    }

    const eventsRepository = new EventsRepository();
    const event = await eventsRepository.addNoteToEvent(
      params.eventId,
      content,
      session.user.id
    );

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error adding note to event:', error);
    return NextResponse.json(
      { error: 'Failed to add note to event' },
      { status: 500 }
    );
  }
} 