import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/CustomerRepository';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const customerRepository = new CustomerRepository();
        const customer = await customerRepository.findById(params.id);

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Failed to fetch customer:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 }
        );
    }
} 