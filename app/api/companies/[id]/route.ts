import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyRepository = new CompanyRepository();
        const company = await companyRepository.findById(params.id);

        if (!company) {
            return NextResponse.json(
                { error: 'Company not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(company);
    } catch (error) {
        console.error('Failed to fetch company:', error);
        return NextResponse.json(
            { error: 'Failed to fetch company' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const data = await request.json();

        // Ensure all required fields have values
        const updateData = {
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            account_name: data.account_name || '',
            account_number: data.account_number || '',
            sort_code: data.sort_code || '',
            bank_name: data.bank_name || '',
            address_line1: data.address_line1 || '',
            address_line2: data.address_line2 || '',
            postcode: data.postcode || '',
            iban_number: data.iban_number || '',
            city: data.city || '',
            county: data.county || ''
        };

        const companyRepository = new CompanyRepository();
        const updatedCompany = await companyRepository.update(params.id, updateData);

        return NextResponse.json(updatedCompany);
    } catch (error) {
        console.error('Failed to update company:', error);
        return NextResponse.json(
            { error: 'Failed to update company' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyRepository = new CompanyRepository();
        await companyRepository.delete(params.id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete company:', error);
        return NextResponse.json(
            { error: 'Failed to delete company' },
            { status: 500 }
        );
    }
} 