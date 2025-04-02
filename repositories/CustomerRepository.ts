import { Pool } from 'pg';
import { Customer } from '@/types/customer';
import { pools } from '@/config/database';

export class CustomerRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.orders;
    }

    async findExisting(data: {
        email?: string;
        phone?: string;
        first_name?: string;
        last_name?: string;
        company_id: string
    }): Promise<Customer | null> {
        // Build dynamic query based on provided fields
        const conditions = [];
        const values = [];
        let paramCount = 1;

        if (data.email) {
            conditions.push(`email = $${paramCount}`);
            values.push(data.email);
            paramCount++;
        }

        if (data.phone) {
            conditions.push(`phone = $${paramCount}`);
            values.push(data.phone);
            paramCount++;
        }

        if (data.first_name && data.last_name) {
            conditions.push(`(first_name = $${paramCount} AND last_name = $${paramCount + 1})`);
            values.push(data.first_name, data.last_name);
            paramCount += 2;
        }

        // Always include company_id
        conditions.push(`company_id = $${paramCount}`);
        values.push(data.company_id);

        if (conditions.length === 1) {
            return null; // Only company_id condition exists
        }

        const query = `
            SELECT * FROM customer 
            WHERE ${conditions.join(' AND ')} 
            AND company_id = $${values.length}
            LIMIT 1
        `;

        console.log(query)



        const result = await this.db.query(query, values);
        console.log(result.rows[0], "EXISTING CUSTOMER")

        return result.rows[0] || null;
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
        console.log("HIT")
        if (!query.trim()) {
            // Return 3 most recent customers when query is empty
            const result = await this.db.query(
                `SELECT * FROM customer 
                WHERE company_id = $1
                ORDER BY created_at DESC
                LIMIT 3`,
                [companyId]
            );
            console.log(result.rows)
            return result.rows;
        }

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
            LIMIT 3`,
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

    async hasAssociatedOrders(id: string, companyId: string): Promise<boolean> {
        const result = await this.db.query(
            'SELECT EXISTS(SELECT 1 FROM "order" WHERE customer_id = $1 AND company_id = $2)',
            [id, companyId]
        );
        return result.rows[0].exists;
    }

    async delete(id: string, companyId: string): Promise<{ success: boolean; error?: string }> {
        try {
            // First delete all associated orders
            await this.db.query(
                'DELETE FROM "order" WHERE customer_id = $1 AND company_id = $2',
                [id, companyId]
            );

            // Then delete the customer
            await this.db.query(
                'DELETE FROM customer WHERE id = $1 AND company_id = $2',
                [id, companyId]
            );
            return { success: true };
        } catch (error) {
            console.error('Error deleting customer:', error);
            return {
                success: false,
                error: 'Failed to delete customer'
            };
        }
    }
} 