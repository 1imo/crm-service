import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';
const CRM_SERVICE_API_KEY = process.env.CRM_SERVICE_API_KEY;
const CRM_SERVICE_NAME = 'crm-service';

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { positions } = await request.json();
        const entityId = params.id;

        console.log('Forwarding position update:', {
            entityId,
            positions
        });

        const response = await fetch(`${IMAGE_SERVICE_URL}/api/media/positions`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CRM_SERVICE_API_KEY!,
                'X-Service-Name': CRM_SERVICE_NAME
            },
            body: JSON.stringify({
                entityId,
                positions
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Image service position update failed:', error);
            return NextResponse.json(
                { error: 'Failed to update positions', details: error },
                { status: response.status }
            );
        }

        const result = await response.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating positions:', error);
        return NextResponse.json(
            { error: 'Failed to update positions', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 