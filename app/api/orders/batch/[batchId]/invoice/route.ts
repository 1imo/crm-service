import { NextResponse } from 'next/server';
import { OrderRepository } from '@/repositories/OrderRepository';
import { CustomerRepository } from '@/repositories/CustomerRepository';
import { ProductRepository } from '@/repositories/ProductRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const CRM_SERVICE_API_KEY = process.env.API_KEY;
const CRM_SERVICE_NAME = 'crm-service';
const DEFAULT_TEMPLATE_ID = '5051945c-da02-475c-a388-b0f47aeee9b2';

export async function POST(
    request: Request,
    context: { params: { batchId: string } }
) {
    try {
        if (!CRM_SERVICE_API_KEY) {
            throw new Error('CRM_SERVICE_API_KEY is not configured');
        }

        const { batchId } = context.params;

        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use repositories directly
        const orderRepository = new OrderRepository();
        const orders = await orderRepository.getByBatchId(batchId, session.user.companyId);

        if (!orders || orders.length === 0) {
            return NextResponse.json(
                { error: 'No orders found in batch' },
                { status: 404 }
            );
        }

        // Prepare invoice data
        const invoiceData = {
            orderBatchId: batchId,
            customerId: orders[0].customer_id,
            companyId: session.user.companyId,
            templateId: DEFAULT_TEMPLATE_ID,
            currency: 'GBP',
            status: 'draft'
        };

        console.log('Sending invoice data:', invoiceData);

        // Send to invoice service with properly typed headers
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'X-API-Key': CRM_SERVICE_API_KEY,
            'X-Service-Name': CRM_SERVICE_NAME
        };

        const invoiceResponse = await fetch('http://localhost:3002/api/invoices', {
            method: 'POST',
            headers,
            body: JSON.stringify(invoiceData)
        });

        if (!invoiceResponse.ok) {
            const errorData = await invoiceResponse.json();
            console.error('Invoice service error:', errorData);
            throw new Error(errorData.error || 'Failed to create invoice');
        }

        const invoice = await invoiceResponse.json();
        return NextResponse.json(invoice, { status: 201 });

    } catch (error) {
        console.error('Error creating invoice:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create invoice' },
            { status: 500 }
        );
    }
} 