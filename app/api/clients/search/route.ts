import { NextRequest, NextResponse } from 'next/server';
import { ClientRepository } from '@/repositories/ClientRepository';

export async function GET(request: NextRequest) {
    const searchQuery = request.nextUrl.searchParams.get('q');

    if (!searchQuery) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        const clientRepository = new ClientRepository();
        const clients = await clientRepository.search(searchQuery);
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Client search failed:', error);
        return NextResponse.json(
            { error: 'Failed to search clients' },
            { status: 500 }
        );
    }
} 