import { NextResponse } from 'next/server';
import { EventsRepository } from '@/lib/repositories/eventsRepository';

const eventsRepository = new EventsRepository();

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const events = await eventsRepository.getEventsByCustomerId(params.id);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
} 