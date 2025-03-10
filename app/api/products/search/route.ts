import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';

export async function GET(request: NextRequest) {
    const searchQuery = request.nextUrl.searchParams.get('q');

    if (!searchQuery) {
        return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    try {
        const productRepository = new ProductRepository();
        const products = await productRepository.search(searchQuery);
        return NextResponse.json(products);
    } catch (error) {
        console.error('Product search failed:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
} 