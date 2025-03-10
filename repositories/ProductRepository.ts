import { Pool } from 'pg';
import { pools } from '@/config/database';
import { Product } from '@/types/product';

export class ProductRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.orders;
    }

    async findById(id: string, companyId: string): Promise<Product | null> {
        const result = await this.db.query(
            'SELECT * FROM product WHERE id = $1 AND company_id = $2',
            [id, companyId]
        );
        return result.rows[0] || null;
    }

    async findAll(companyId: string): Promise<Product[]> {
        const result = await this.db.query(
            'SELECT * FROM product WHERE company_id = $1 ORDER BY created_at DESC',
            [companyId]
        );
        return result.rows;
    }

    async create(data: Partial<Product>, companyId: string): Promise<Product> {
        const result = await this.db.query(
            `INSERT INTO product (
                name, description, sku, price, stock_quantity, company_id
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [
                data.name,
                data.description,
                data.sku,
                data.price,
                data.stockQuantity,
                companyId
            ]
        );
        return result.rows[0];
    }

    async update(id: string, data: Partial<Product>, companyId: string): Promise<Product> {
        const result = await this.db.query(
            `UPDATE product 
            SET name = $1, description = $2, sku = $3, price = $4, stock_quantity = $5, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 AND company_id = $7
            RETURNING *`,
            [
                data.name,
                data.description,
                data.sku,
                data.price,
                data.stockQuantity,
                id,
                companyId
            ]
        );
        return result.rows[0];
    }

    async delete(id: string, companyId: string): Promise<void> {
        await this.db.query(
            'DELETE FROM product WHERE id = $1 AND company_id = $2',
            [id, companyId]
        );
    }

    async findByCompanyId(companyId: string): Promise<Product[]> {
        const result = await this.db.query(
            'SELECT * FROM product WHERE company_id = $1 ORDER BY name',
            [companyId]
        );
        return result.rows;
    }

    async search(query: string, companyId: string): Promise<Product[]> {
        const searchPattern = `%${query}%`;
        const result = await this.db.query(
            `SELECT * FROM product 
            WHERE company_id = $1 AND (
                LOWER(name) LIKE LOWER($2) OR
                LOWER(sku) LIKE LOWER($2) OR
                LOWER(description) LIKE LOWER($2)
            )
            ORDER BY name
            LIMIT 10`,
            [companyId, searchPattern]
        );
        return result.rows;
    }
} 