import { NextRequest, NextResponse } from 'next/server';
import { ProductRepository } from '@/repositories/ProductRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.companyId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchQuery = request.nextUrl.searchParams.get('q') || '';

        const productRepository = new ProductRepository();
        const products = await productRepository.search(searchQuery, session.user.companyId);
        return NextResponse.json(products);
    } catch (error) {
        console.error('Product search failed:', error);
        return NextResponse.json(
            { error: 'Failed to search products' },
            { status: 500 }
        );
    }
} 