import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';
const CRM_SERVICE_API_KEY = process.env.CRM_SERVICE_API_KEY;
const CRM_SERVICE_NAME = 'crm-service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const productRepository = new ProductRepository();
        const product = await productRepository.findById(id, session.user.companyId);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        // Fetch images from image service with updated URL
        try {
            console.log('Fetching images for product:', {
                productId: id,
                url: `${IMAGE_SERVICE_URL}/media/entity/${id}`
            });

            const response = await axios.get(`${IMAGE_SERVICE_URL}/media/entity/${id}`, {
                headers: {
                    'X-API-Key': CRM_SERVICE_API_KEY,
                    'X-Service-Name': CRM_SERVICE_NAME
                }
            });

            console.log('Image service response:', response.data);

            return NextResponse.json({
                ...product,
                images: response.data
            });
        } catch (error: any) {
            console.error('Failed to fetch images:', {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: `${IMAGE_SERVICE_URL}/media/entity/${id}`
            });
            // Return product without images if image fetch fails
            return NextResponse.json(product);
        }
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const data = await request.json();
        const productRepository = new ProductRepository();
        const product = await productRepository.update(
            params.id,
            data,
            session.user.companyId
        );

        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to update product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const productRepository = new ProductRepository();
        await productRepository.delete(params.id, session.user.companyId);

        // Delete associated images
        try {
            await axios.delete(`${IMAGE_SERVICE_URL}/media/${params.id}`, {
                headers: {
                    'X-API-Key': CRM_SERVICE_API_KEY,
                    'X-Service-Name': CRM_SERVICE_NAME
                }
            });
        } catch (error) {
            console.error('Failed to delete images:', error);
            // Continue even if image deletion fails
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
} 