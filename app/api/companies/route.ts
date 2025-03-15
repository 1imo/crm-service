import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { getServerSession } from 'next-auth';
import { pools } from '@/config/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Company } from '@/types/company';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        console.log(session)

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const companyRepository = new CompanyRepository();
        const companies = await companyRepository.findByUserId(session.user.id);
        return NextResponse.json(companies);
    } catch (error) {
        console.error('Failed to fetch companies:', error);
        return NextResponse.json(
            { error: 'Failed to fetch companies' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();

        // Convert FormData to properly typed object
        const data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'> = {
            name: String(formData.get('name') || ''),
            email: String(formData.get('email') || ''),
            phone: String(formData.get('phone') || ''),
            addressLine1: String(formData.get('addressLine1') || ''),
            addressLine2: formData.get('addressLine2') ? String(formData.get('addressLine2')) : '',
            city: String(formData.get('city') || ''),
            county: String(formData.get('county') || ''),
            postcode: String(formData.get('postcode') || ''),
            accountName: String(formData.get('accountName') || ''),
            accountNumber: String(formData.get('accountNumber') || ''),
            sortCode: String(formData.get('sortCode') || ''),
            bankName: String(formData.get('bankName') || ''),
            iban: String(formData.get('iban') || '')
        };

        const companyRepository = new CompanyRepository();
        const company = await companyRepository.create(data, session.user.id);

        // Handle logo upload if present
        const logo = formData.get('logo');
        if (logo && logo instanceof File) {
            const logoFormData = new FormData();
            logoFormData.append('file', logo);
            logoFormData.append('companyId', company.id);

            await fetch(`${process.env.NEXT_PUBLIC_IMAGE_SERVICE_URL}/api/media/company-logo`, {
                method: 'POST',
                headers: {
                    'X-API-Key': process.env.CRM_SERVICE_API_KEY || '',
                    'X-Service-Name': 'crm-service'
                },
                body: logoFormData
            });
        }

        return NextResponse.json(company, { status: 201 });
    } catch (error) {
        console.error('Failed to create company:', error);
        return NextResponse.json(
            { error: 'Failed to create company' },
            { status: 500 }
        );
    }
} 