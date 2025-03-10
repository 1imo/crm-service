import { NextResponse } from 'next/server';
import { ClientRepository } from '@/repositories/ClientRepository';

export async function GET() {
    try {
        const clientRepository = new ClientRepository();
        const clients = await clientRepository.findAll();
        return NextResponse.json(clients);
    } catch (error) {
        console.error('Failed to fetch clients:', error);
        return NextResponse.json(
            { error: 'Failed to fetch clients' },
            { status: 500 }
        );
    }
} 