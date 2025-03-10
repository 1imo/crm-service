import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';

export async function GET() {
    try {
        const productRepository = new ProductRepository();
        const products = await productRepository.findAll();
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
        const data = await request.json();
        const productRepository = new ProductRepository();
        const product = await productRepository.create(data);
        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error('Failed to create product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
} 