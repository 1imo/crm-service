import { NextResponse } from 'next/server';
import { pools } from '@/config/database';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Delete from pools.ordering
        await pools.invoicing.query(`
      DELETE FROM "invoices" 
      WHERE id = $1
    `, [params.id]);

        return NextResponse.json({ message: 'Invoice deleted successfully' });
    } catch (error) {
        console.error('Error deleting invoice:', error);
        return NextResponse.json(
            { error: 'Failed to delete invoice' },
            { status: 500 }
        );
    }
} 