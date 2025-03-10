import { Pool } from 'pg';
import { pools } from '@/config/database';
import { Company } from '@/types/company';

export class CompanyRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.clients;
    }

    async findById(id: string): Promise<Company | null> {
        const result = await this.db.query(
            `SELECT * FROM company WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async update(id: string, data: Partial<Company>): Promise<Company> {
        const result = await this.db.query(
            `UPDATE company
             SET name = $1,
                 email = $2,
                 phone = $3,
                 account_name = $4,
                 account_number = $5,
                 sort_code = $6,
                 bank_name = $7,
                 address_line1 = $8,
                 address_line2 = $9,
                 postcode = $10,
                 iban_number = $11,
                 city = $12,
                 county = $13,
                 updated_at = NOW()
             WHERE id = $14
             RETURNING *`,
            [
                data.name,
                data.email,
                data.phone,
                data.accountName,
                data.accountNumber,
                data.sortCode,
                data.bankName,
                data.addressLine1,
                data.addressLine2,
                data.postcode,
                data.iban,
                data.city,
                data.county,
                id
            ]
        );
        return result.rows[0];
    }

    async create(data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, userId: string): Promise<Company> {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            const companyResult = await client.query(
                `INSERT INTO company (
                    name,
                    email,
                    phone,
                    account_name,
                    account_number,
                    sort_code,
                    bank_name,
                    created_at,
                    updated_at,
                    address_line1,
                    address_line2,
                    postcode,
                    iban_number,
                    city,
                    county
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9, $10, $11, $12, $13)
                RETURNING *`,
                [
                    data.name,
                    data.email,
                    data.phone,
                    data.accountName,
                    data.accountNumber,
                    data.sortCode,
                    data.bankName,
                    data.addressLine1,
                    data.addressLine2,
                    data.postcode,
                    data.iban,
                    data.city,
                    data.county
                ]
            );

            const company = companyResult.rows[0];

            // Create the permission using user id
            await client.query(
                `INSERT INTO company_permissions (user_id, company_id)
                 VALUES ($1, $2)`,
                [userId, company.id]
            );

            await client.query('COMMIT');
            return company;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findByUserId(userId: string): Promise<Company[]> {
        const result = await this.db.query(
            `SELECT c.* 
             FROM company c
             INNER JOIN company_permissions cp ON c.id = cp.company_id
             WHERE cp.user_id = $1
             ORDER BY c.name ASC`,
            [userId]
        );
        return result.rows;
    }

    async delete(id: string): Promise<void> {
        await this.db.query(
            `DELETE FROM company WHERE id = $1`,
            [id]
        );
    }
} 