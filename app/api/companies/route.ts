import { NextRequest, NextResponse } from 'next/server';
import { CompanyRepository } from '@/repositories/CompanyRepository';
import { getServerSession } from 'next-auth';
import { pools } from '@/config/database';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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

        const data = await request.json();
        const companyRepository = new CompanyRepository();
        const company = await companyRepository.create(data, session.user.id);

        return NextResponse.json(company, { status: 201 });
    } catch (error) {
        console.error('Failed to create company:', error);
        return NextResponse.json(
            { error: 'Failed to create company' },
            { status: 500 }
        );
    }
} 