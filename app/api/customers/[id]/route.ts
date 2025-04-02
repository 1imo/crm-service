import { NextRequest, NextResponse } from 'next/server';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const customerRepository = new CustomerRepository();
        const customer = await customerRepository.findById(params.id, session.user.companyId);

        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(customer);
    } catch (error) {
        console.error('Error fetching customer:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const data = await request.json();
        const customerRepository = new CustomerRepository();
        const updatedCustomer = await customerRepository.update(params.id, data, session.user.companyId);

        if (!updatedCustomer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedCustomer);
    } catch (error) {
        console.error('Error updating customer:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const customerRepository = new CustomerRepository();
        const result = await customerRepository.delete(params.id, session.user.companyId);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 }
        );
    }
}