import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/CustomerRepository';

export async function GET() {
    try {
        const customerRepository = new CustomerRepository();
        const customers = await customerRepository.findAll();
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
        const data = await request.json();
        const customerRepository = new CustomerRepository();
        const customer = await customerRepository.create(data);
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        console.error('Failed to create customer:', error);
        return NextResponse.json(
            { error: 'Failed to create customer' },
            { status: 500 }
        );
    }
} 