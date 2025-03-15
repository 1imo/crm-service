import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { pools } from '@/config/database';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    console.log("INVOICES HIT")

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.user.companyId;

    try {
        // Fetch invoices from the invoicing database
        const invoicesResult = await pools.invoicing.query(`
            SELECT * FROM invoices WHERE company_id = $1
        `, [companyId]);

        // Fetch customer names from the ordering database
        const customerIds = invoicesResult.rows.map(invoice => invoice.customer_id).filter(id => id);
        const customersResult = customerIds.length > 0 ? await pools.orders.query(`
            SELECT id, first_name, last_name FROM customer WHERE id = ANY($1::uuid[])
        `, [customerIds]) : { rows: [] };

        // Create a map of customer names for easy lookup
        const customerMap: { [key: string]: string } = {};
        customersResult.rows.forEach((customer: { id: string; first_name: string; last_name: string }) => {
            customerMap[customer.id] = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unknown';
        });

        // Map invoices to include customer names
        const invoicesWithCustomerNames = invoicesResult.rows.map(invoice => ({
            ...invoice,
            customer_name: customerMap[invoice.customer_id] || 'Unknown'
        }));

        console.log("Result: ", invoicesWithCustomerNames);
        return NextResponse.json(invoicesWithCustomerNames, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error fetching invoices' }, { status: 500 });
    }
}