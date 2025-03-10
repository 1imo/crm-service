import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '../../../../repositories/CustomerRepository';

export async function GET(request: NextRequest) {
    const searchQuery = request.nextUrl.searchParams.get('q');

    if (!searchQuery) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        const customerRepository = new CustomerRepository();
        const customers = await customerRepository.search(searchQuery);
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Customer search failed:', error);
        return NextResponse.json(
            { error: 'Failed to search customers' },
            { status: 500 }
        );
    }
} 