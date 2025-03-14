import { NextResponse } from 'next/server';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log(`${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${params.id}/send`)
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${params.id}/send`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': process.env.API_KEY || '',
                    'X-Service-Name': process.env.SERVICE_NAME || '',
                },
            }
        );

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send invoice');
        }

        return NextResponse.json({ message: 'Invoice sent successfully' });
    } catch (error) {
        console.error('Error sending invoice:', error);
        return NextResponse.json(
            { error: 'Failed to send invoice' },
            { status: 500 }
        );
    }
} 