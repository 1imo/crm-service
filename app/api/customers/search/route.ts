import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchQuery = request.nextUrl.searchParams.get('q') || '';
        const customerRepository = new CustomerRepository();
        const customers = await customerRepository.search(searchQuery, session.user.companyId);
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Customer search failed:', error);
        return NextResponse.json(
            { error: 'Failed to search customers' },
            { status: 500 }
        );
    }
} 