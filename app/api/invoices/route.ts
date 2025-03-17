import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pools } from '@/config/database';
import { OrderRepository } from '@/repositories/OrderRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { randomUUID } from 'crypto';

const INVOICE_SERVICE_URL = process.env.INVOICE_SERVICE_URL || 'http://localhost:3002';

interface InvoiceItem {
    name: string;
    quantity: number;
    basePrice: number;
}

// Helper function to wait for orders to be available
async function waitForOrders(batchId: string, companyId: string, maxAttempts = 5): Promise<boolean> {
    const orderRepository = new OrderRepository();

    for (let i = 0; i < maxAttempts; i++) {
        console.log(`Checking for orders attempt ${i + 1}/${maxAttempts} for batch ${batchId}`);
        const orders = await orderRepository.getByBatchId(batchId, companyId);

        if (orders && orders.length > 0) {
            console.log(`Found ${orders.length} orders for batch ${batchId}`);
            return true;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    console.log("INVOICES HIT")

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;

    try {
        // Fetch invoices from the invoicing database
        const invoicesResult = await pools.invoicing.query(`
            SELECT * FROM invoices WHERE company_id = $1
        `, [companyId]);

        // Fetch customer names from the ordering database
        const customerIds = invoicesResult.rows.map(invoice => invoice.customer_id).filter(id => id);
        const customersResult = customerIds.length > 0 ? await pools.orders.query(`
            SELECT id, first_name, last_name FROM customer WHERE id = ANY($1::uuid[])
        `, [customerIds]) : { rows: [] };

        // Create a map of customer names for easy lookup
        const customerMap: { [key: string]: string } = {};
        customersResult.rows.forEach((customer: { id: string; first_name: string; last_name: string }) => {
            customerMap[customer.id] = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown';
        });

        // Map invoices to include customer names
        const invoicesWithCustomerNames = invoicesResult.rows.map(invoice => ({
            ...invoice,
            customer_name: customerMap[invoice.customer_id] || 'Unknown'
        }));

        console.log("Result: ", invoicesWithCustomerNames);
        return NextResponse.json(invoicesWithCustomerNames, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching invoices' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;

    if (!companyId) {
        return NextResponse.json({ message: 'No company ID found' }, { status: 400 });
    }

    try {
        const { customer_id, items, status } = await request.json();
        const orderRepository = new OrderRepository();
        const productRepository = new ProductRepository();

        // Create all products first
        const productPromises = items.map(async (item: InvoiceItem) => {
            let product = await productRepository.findByName(item.name, companyId);

            if (!product) {
                product = await productRepository.create({
                    name: item.name,
                    price: item.basePrice,
                    stock_quantity: 0,
                    description: '',
                    sku: '',
                    companyId
                }, companyId);
            }

            return {
                product,
                quantity: item.quantity,
                basePrice: item.basePrice
            };
        });

        const productsWithQuantities = await Promise.all(productPromises);

        // Create a single order with all items - let the repository handle the batch ID
        const order = await orderRepository.create({
            customerId: customer_id,
            companyId: companyId,
            items: productsWithQuantities.map(({ product, quantity, basePrice }) => ({
                productId: product.id,
                quantity: quantity,
                unitPrice: basePrice
            }))
        }, companyId);

        // Get the batch ID from the created order
        const batchId = order[0].batch_id;
        console.log('Using batch ID from order:', batchId);

        // Forward to invoice service with the batch ID from the order
        const response = await fetch(`${INVOICE_SERVICE_URL}/api/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.API_KEY!,
                'X-Service-Name': process.env.SERVICE_NAME!
            },
            body: JSON.stringify({
                orderBatchId: batchId,
                templateId: '5051945c-da02-475c-a388-b0f47aeee9b2',
                host: request.headers.get('host')
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Invoice service error:', {
                status: response.status,
                statusText: response.statusText,
                error: errorData
            });
            throw new Error('Failed to create invoice in invoice service');
        }

        const invoice = await response.json();
        return NextResponse.json({
            ...invoice,
            batchId,
            order
        }, { status: 201 });

    } catch (error) {
        console.error('Failed to create invoice:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create invoice' },
            { status: 500 }
        );
    }
}