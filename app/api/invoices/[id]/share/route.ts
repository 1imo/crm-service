import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = await Promise.resolve(params.id);
    return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${id}/view`,
    });
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    return NextResponse.json({
        url: `${process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL}/api/invoices/${params.id}/view`,
    });
}