import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { EventsRepository } from '@/lib/repositories/eventsRepository';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const eventsRepository = new EventsRepository();

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (customerId) {
      // Fetch events for a specific customer
      const events = await eventsRepository.getEventsByCustomerId(customerId);
      return NextResponse.json(events);
    } else if (startDate && endDate) {
      // Fetch events for a date range
      const events = await eventsRepository.getEventsByDateRange(
        session.user.companyId,
        session.user.id,
        new Date(startDate),
        new Date(endDate)
      );
      return NextResponse.json(events);
    } else {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        console.log('session', session);
        
        if (!session?.user?.id || !session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Log the received body for debugging
        console.log('Received event creation request with body:', body);
        
        // Validate required fields
        const requiredFields = {
            customerId: 'Customer ID',
            title: 'Title',
            startTime: 'Start Time',
            endTime: 'End Time',
            type: 'Type',
            status: 'Status'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !body[key])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            console.log('Missing required fields:', missingFields);
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            );
        }

        // Add user_id to each note
        const notes = body.notes?.map((note: { content: string }) => ({
            ...note,
            user_id: session.user.id
        })) || [];

        const event = await eventsRepository.createEvent({
            company_id: session.user.companyId,
            user_id: session.user.id,
            customer_id: body.customerId,
            title: body.title,
            start_time: new Date(body.startTime),
            end_time: new Date(body.endTime),
            type: body.type,
            status: body.status,
            color: body.color,
            notes
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json(
            { error: 'Failed to create event' },
            { status: 500 }
        );
    }
} 