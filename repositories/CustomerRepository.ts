import { Pool } from 'pg';
import { Customer } from '@/types/customer';
import { pools } from '@/config/database';

export class CustomerRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.orders;
    }

    async create(data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
        const result = await this.db.query(
            `INSERT INTO customer (
                first_name, last_name, email, phone,
                address_line1, address_line2, city, postcode
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *`,
            [
                data.firstName,
                data.lastName,
                data.email,
                data.phone,
                data.addressLine1,
                data.addressLine2,
                data.city,
                data.postcode
            ]
        );
        return result.rows[0];
    }

    async findAll(): Promise<Customer[]> {
        const result = await this.db.query(
            'SELECT * FROM customer ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findById(id: string): Promise<Customer | null> {
        const result = await this.db.query(
            'SELECT * FROM customer WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async search(query: string): Promise<Customer[]> {
        const searchPattern = `%${query}%`;
        const result = await this.db.query(
            `SELECT * FROM customer 
       WHERE 
         LOWER(first_name) LIKE LOWER($1) OR
         LOWER(last_name) LIKE LOWER($1) OR
         LOWER(address_line1) LIKE LOWER($1) OR
         LOWER(address_line2) LIKE LOWER($1) OR
         LOWER(city) LIKE LOWER($1) OR
         LOWER(postcode) LIKE LOWER($1)
       ORDER BY first_name, last_name
       LIMIT 10`,
            [searchPattern]
        );
        return result.rows;
    }
} 