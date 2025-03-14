import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${params.id}`,
            {
                headers: {
                    'Content-Type': 'text/html',
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch invoice');
        }

        const html = await response.text();
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html',
            },
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
} 