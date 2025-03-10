import { Pool } from 'pg';
import { Product } from '@/types/product';
import { pools } from '@/config/database';

export class ProductRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.orders;
    }

    async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
        const result = await this.db.query(
            `INSERT INTO product (
        company_id, name, description, sku,
        price, stock_quantity
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
            [
                data.companyId,
                data.name,
                data.description,
                data.sku,
                data.price,
                data.stockQuantity
            ]
        );
        return result.rows[0];
    }

    async findAll(): Promise<Product[]> {
        const result = await this.db.query(
            'SELECT * FROM product ORDER BY created_at DESC'
        );
        return result.rows;
    }

    async findById(id: string): Promise<Product | null> {
        const result = await this.db.query(
            'SELECT * FROM product WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findByCompanyId(companyId: string): Promise<Product[]> {
        const result = await this.db.query(
            'SELECT * FROM product WHERE company_id = $1 ORDER BY name',
            [companyId]
        );
        return result.rows;
    }

    async update(id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await this.db.query(
            `UPDATE product 
       SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
            [id, ...values]
        );
        return result.rows[0];
    }

    async search(query: string): Promise<Product[]> {
        const searchPattern = `%${query}%`;
        const result = await this.db.query(
            `SELECT * FROM product 
             WHERE 
               LOWER(name) LIKE LOWER($1) OR
               LOWER(sku) LIKE LOWER($1) OR
               LOWER(description) LIKE LOWER($1)
             ORDER BY name
             LIMIT 10`,
            [searchPattern]
        );
        return result.rows;
    }
} 