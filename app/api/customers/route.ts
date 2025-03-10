import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        console.log("Session: ", session)

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const customerRepository = new CustomerRepository();
        const customers = await customerRepository.findAll(session.user.companyId);
        return NextResponse.json(customers);
    } catch (error) {
        console.error('Failed to fetch customers:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const data = await request.json();
        const customerRepository = new CustomerRepository();
        const customer = await customerRepository.create({
            ...data,
            company_id: session.user.companyId
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Failed to create customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
} 