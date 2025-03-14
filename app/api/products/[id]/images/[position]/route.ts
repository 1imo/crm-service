import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL;
const CRM_SERVICE_API_KEY = process.env.API_KEY;
const CRM_SERVICE_NAME = process.env.SERVICE_NAME;

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; position: string }> }
) {
    try {
        const resolvedParams = await params;
        console.log('Delete request received:', resolvedParams);

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.companyId) {
            return NextResponse.json({ error: 'No company selected' }, { status: 400 });
        }

        const deleteUrl = `${IMAGE_SERVICE_URL}/media/${resolvedParams.id}/${resolvedParams.position}?companyId=${session.user.companyId}`;
        console.log('Sending delete request to:', deleteUrl);

        const response = await axios.delete(deleteUrl, {
            headers: {
                'X-API-Key': CRM_SERVICE_API_KEY,
                'X-Service-Name': CRM_SERVICE_NAME
            }
        });

        console.log('Delete response:', response.status);

        if (response.status !== 200) {
            throw new Error('Failed to delete image');
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete request failed:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
} 