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

        const formData = await request.formData();

        // Create a new FormData with the company ID from the session
        const imageServiceFormData = new FormData();

        // Copy existing fields
        for (const [key, value] of formData.entries()) {
            imageServiceFormData.append(key, value);
        }

        // Add company ID from session
        imageServiceFormData.append('companyId', session.user.companyId);

        try {
            // Forward the request to the image service
            const uploadResponse = await fetch(`${IMAGE_SERVICE_URL}/api/media/upload`, {
                method: 'POST',
                headers: {
                    'X-API-Key': CRM_SERVICE_API_KEY!,
                    'X-Service-Name': CRM_SERVICE_NAME
                },
                body: imageServiceFormData
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Image service upload failed:', errorText);
                return NextResponse.json(
                    { error: 'Failed to upload images', details: errorText },
                    { status: uploadResponse.status }
                );
            }

            const result = await uploadResponse.json();
            return NextResponse.json(result);
        } catch (fetchError) {
            console.error('Failed to connect to image service:', fetchError);
            return NextResponse.json(
                {
                    error: 'Image service unavailable',
                    details: 'Could not connect to image service. Please ensure the service is running.'
                },
                { status: 503 }
            );
        }
    } catch (error) {
        console.error('Error in upload-images route:', error);
        return NextResponse.json(
            { error: 'Failed to upload images', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 