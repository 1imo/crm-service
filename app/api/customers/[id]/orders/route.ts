import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/OrderRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.companyId) {
            return NextResponse.json({ error: 'Company ID not found' }, { status: 400 });
        }

        const orderRepository = new OrderRepository();
        const orders = await orderRepository.findByCustomerId(
            params.id,
        );

        return NextResponse.json(orders.slice(0, orders.length >= 5 ? orders.length : orders.length));
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 