import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/OrderRepository';

export async function GET() {
    try {
        const orderRepository = new OrderRepository();
        const orders = await orderRepository.findAll();
        return NextResponse.json(orders);
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

        // Validate customerId is a valid UUID
        if (!data.customerId || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.customerId)) {
            return NextResponse.json(
                { error: 'Invalid customer ID format' },
                { status: 400 }
            );
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
        const order = await orderRepository.create(data);
        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Failed to create order:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create order' },
            { status: 500 }
        );
    }
} 