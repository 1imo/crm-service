import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/OrderRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const batchId = searchParams.get('batchId');
        const companyId = session.user.companyId;

        const orderRepo = new OrderRepository();

        if (batchId) {
            const orders = await orderRepo.getByBatchId(batchId, companyId);
            return NextResponse.json(orders);
        } else {
            const orders = await orderRepo.getAll(companyId);
            return NextResponse.json(orders);
        }
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        console.log("HERE")

        // Validate customerId is a valid UUID
        if (!data.customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID format' },
                { status: 400 }
            );
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }


        // Validate each product ID in items
        for (const item of data.items) {
            if (!item.productId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(item.productId)) {
                return NextResponse.json(
                    { error: 'Invalid product ID format' },
                    { status: 400 }
                );
            }
        }

        const orderRepository = new OrderRepository();
        console.log("HIT")
        const order = await orderRepository.create(data, session.user.companyId);
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Failed to create order:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create order' },
            { status: 500 }
        );
    }
} 