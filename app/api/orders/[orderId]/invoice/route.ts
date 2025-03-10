import { NextRequest, NextResponse } from 'next/server';

const INVOICE_SERVICE_URL = process.env.INVOICE_SERVICE_URL || 'http://localhost:3002';

export async function POST(
    request: NextRequest,
    context: { params: { orderId: string } }
) {
    try {
        const { orderId } = context.params;
        console.log('CRM: Creating invoice for order:', orderId);
        console.log('CRM: Sending request to:', `${INVOICE_SERVICE_URL}/api/invoices`);

        // Forward the request to the invoice service with template ID
        const response = await fetch(`${INVOICE_SERVICE_URL}/api/invoices`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': process.env.API_KEY!,
                'X-Service-Name': process.env.SERVICE_NAME!
            },
            body: JSON.stringify({
                orderId,
                templateId: '5051945c-da02-475c-a388-b0f47aeee9b2'  // Hardcoded template ID
            })
        });

        console.log('Invoice service response:', {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            apiKey: process.env.API_KEY,
            serviceName: process.env.SERVICE_NAME
        });

        if (!response.ok) {
            // Check if response is JSON before trying to parse it
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                console.error('CRM: Invoice service error:', error);
            } else {
                const text = await response.text();
                console.error('CRM: Invoice service returned non-JSON response:', text);
            }
            return NextResponse.json(
                { error: 'Failed to create invoice' },
                { status: response.status }
            );
        }

        const invoice = await response.json();
        console.log('CRM: Invoice created successfully:', invoice);
        return NextResponse.json(invoice, { status: 201 });

    } catch (error) {
        console.error('CRM: Failed to create invoice:', error);
        return NextResponse.json(
            { error: 'Failed to create invoice' },
            { status: 500 }
        );
    }
} 