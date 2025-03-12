import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';
const CRM_SERVICE_API_KEY = process.env.CRM_SERVICE_API_KEY;
const CRM_SERVICE_NAME = 'crm-service';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { imageId, entityId } = await request.json();
        if (!imageId || !entityId) {
            return NextResponse.json({ error: 'Image ID and Entity ID are required' }, { status: 400 });
        }

        // Delete the image from the image service
        const deleteResponse = await fetch(`${IMAGE_SERVICE_URL}/api/media/${imageId}?entityId=${entityId}`, {
            method: 'DELETE',
            headers: {
                'X-API-Key': CRM_SERVICE_API_KEY!,
                'X-Service-Name': CRM_SERVICE_NAME,
                'Content-Type': 'application/json'
            }
        });

        if (!deleteResponse.ok) {
            const error = await deleteResponse.text();
            console.error('Failed to delete image:', error);
            throw new Error('Failed to delete image');
        }

        const result = await deleteResponse.json();
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in delete-image route:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
} 