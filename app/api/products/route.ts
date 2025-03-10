import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import axios from 'axios';

const IMAGE_SERVICE_URL = process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL || 'http://localhost:3006';
const CRM_SERVICE_API_KEY = process.env.CRM_SERVICE_API_KEY;
const CRM_SERVICE_NAME = 'crm-service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        const productRepository = new ProductRepository();
        const products = await productRepository.findAll(session.user.companyId);
        return NextResponse.json(products);
    } catch (error) {
        console.error('Failed to fetch products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.companyId) {
            return NextResponse.json(
                { error: 'No company selected' },
                { status: 400 }
            );
        }

        // Get the raw form data
        const formData = await request.formData();

        console.log('Raw form data:', {
            entries: Array.from(formData.entries()).map(([key, value]) => ({
                key,
                type: typeof value,
                isFile: value instanceof File,
                value: value instanceof File ? `File: ${value.name}` : value
            }))
        });

        // Extract and validate fields
        const name = formData.get('name');
        const description = formData.get('description');
        const sku = formData.get('sku');
        const priceStr = formData.get('price');
        const stockQuantityStr = formData.get('stockQuantity');

        // Get files and ensure they're File objects
        const rawFiles = formData.getAll('files');
        const files = rawFiles.filter(file => file instanceof File);

        if (!name || typeof name !== 'string') {
            return NextResponse.json(
                { error: 'Name is required' },
                { status: 400 }
            );
        }

        // Create product first to get the ID
        const productRepository = new ProductRepository();
        const product = await productRepository.create(
            {
                name: name,
                description: description?.toString() || '',
                sku: sku?.toString() || '',
                price: priceStr ? parseFloat(priceStr.toString()) : 0,
                stockQuantity: stockQuantityStr ? parseInt(stockQuantityStr.toString()) : 0
            },
            session.user.companyId
        );

        // If there are valid files, upload them
        if (files.length > 0) {
            const imageFormData = new FormData();

            console.log('Processing valid files:', files.map(f => ({
                name: f.name,
                type: f.type,
                size: f.size
            })));

            // Append each valid file
            files.forEach(file => {
                imageFormData.append('files', file);
            });

            imageFormData.append('entityId', product.id);
            imageFormData.append('entityType', 'product');
            imageFormData.append('companyId', session.user.companyId);

            try {
                const response = await axios.post(
                    `${IMAGE_SERVICE_URL}/api/media/upload`,
                    imageFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'X-API-Key': CRM_SERVICE_API_KEY,
                            'X-Service-Name': CRM_SERVICE_NAME
                        }
                    }
                );

                console.log('Image upload successful:', response.data);
            } catch (error: any) {
                console.error('Image upload failed:', {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status
                });
            }
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error('Failed to create product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
} 