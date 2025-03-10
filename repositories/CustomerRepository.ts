import { Pool } from 'pg';
import { Customer } from '@/types/customer';
import { pools } from '@/config/database';

export class CustomerRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.orders;
    }

    async create(data: Omit<Customer, 'id' | 'created_at' | 'updated_at'> & { company_id: string }): Promise<Customer> {
        const result = await this.db.query(
            `INSERT INTO customer (
                first_name, last_name, email, phone,
                address_line1, address_line2, city, postcode,
                company_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
            [
                data.first_name,
                data.last_name,
                data.email,
                data.phone,
                data.address_line1,
                data.address_line2,
                data.city,
                data.postcode,
                data.company_id
            ]
        );
        return result.rows[0];
    }

    async findAll(companyId: string): Promise<Customer[]> {
        const result = await this.db.query(
            'SELECT * FROM customer WHERE company_id = $1 ORDER BY created_at DESC',
            [companyId]
        );
        return result.rows;
    }

    async findById(id: string, companyId: string): Promise<Customer | null> {
        const result = await this.db.query(
            'SELECT * FROM customer WHERE id = $1 AND company_id = $2',
            [id, companyId]
        );
        return result.rows[0] || null;
    }

    async search(query: string, companyId: string): Promise<Customer[]> {
        const searchPattern = `%${query}%`;
        const result = await this.db.query(
            `SELECT * FROM customer 
            WHERE 
                company_id = $1 AND
                (LOWER(first_name) LIKE LOWER($2) OR
                LOWER(last_name) LIKE LOWER($2) OR
                LOWER(address_line1) LIKE LOWER($2) OR
                LOWER(address_line2) LIKE LOWER($2) OR
                LOWER(city) LIKE LOWER($2) OR
                LOWER(postcode) LIKE LOWER($2))
            ORDER BY first_name, last_name
            LIMIT 10`,
            [companyId, searchPattern]
        );
        return result.rows;
    }

    async update(id: string, data: Partial<Customer>, companyId: string): Promise<Customer> {
        const result = await this.db.query(
            `UPDATE customer SET
                first_name = $1,
                last_name = $2,
                email = $3,
                phone = $4,
                address_line1 = $5,
                address_line2 = $6,
                city = $7,
                postcode = $8
            WHERE id = $9 AND company_id = $10
            RETURNING *`,
            [
                data.first_name,
                data.last_name,
                data.email,
                data.phone,
                data.address_line1,
                data.address_line2,
                data.city,
                data.postcode,
                id,
                companyId
            ]
        );
        return result.rows[0];
    }

    async delete(id: string, companyId: string): Promise<void> {
        await this.db.query(
            'DELETE FROM customer WHERE id = $1 AND company_id = $2',
            [id, companyId]
        );
    }
} 