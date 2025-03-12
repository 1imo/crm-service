import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const response = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL}/media/company-logo`, {
            method: 'POST',
            headers: {
                'X-API-Key': process.env.CRM_SERVICE_API_KEY || '',
                'X-Service-Name': 'crm-service'
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload logo');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error uploading logo:', error);
        return NextResponse.json(
            { error: 'Failed to upload logo' },
            { status: 500 }
        );
    }
} 