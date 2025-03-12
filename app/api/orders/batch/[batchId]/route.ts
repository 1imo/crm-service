import { NextRequest, NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/OrderRepository';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: NextRequest,
    { params }: { params: { batchId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return new NextResponse(null, { status: 401 });
        }

        const orderRepository = new OrderRepository();
        const customerRepository = new CustomerRepository();
        const productRepository = new ProductRepository();

        // Get orders
        const orders = await orderRepository.getByBatchId(params.batchId, session.user.companyId);

        // Get unique customer ID and product names
        const customerId = orders[0]?.customer_id;
        const uniqueProductNames = Array.from(new Set(
            orders
                .map(order => order.product_name)
                .filter((name): name is string => typeof name === 'string')
        ));

        // Fetch customer and product details
        const customer = customerId ? await customerRepository.findById(customerId, session.user.companyId) : null;
        const products = await Promise.all(
            uniqueProductNames.map(async (name) => {
                try {
                    if (session?.user?.companyId == null) return
                    return await productRepository.findByName(name, session.user.companyId);
                } catch (error) {
                    console.error(`Failed to fetch product details for ${name}:`, error);
                    return null;
                }
            })
        );

        // Merge the data
        const enrichedOrders = orders.map(order => ({
            ...order,
            customer_details: customer,
            product_details: products.find(p => p?.name === order.product_name) || null
        }));

        return NextResponse.json(enrichedOrders);
    } catch (error) {
        console.error('Failed to fetch orders:', error);
        return new NextResponse(null, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { batchId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return new NextResponse(null, { status: 401 });
        }

        const orderRepository = new OrderRepository();
        await orderRepository.deleteByBatchId(params.batchId, session.user.companyId);

        return new NextResponse(null, { status: 200 });
    } catch (error) {
        console.error('Failed to delete batch:', error);
        return new NextResponse(null, { status: 500 });
    }
} 