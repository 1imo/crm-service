import { Pool, PoolClient } from 'pg';
import { Order } from '@/types';
import { pools } from '@/config/database';
import { ProductRepository } from './ProductRepository';

interface OrderItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

interface OrderData {
    customerId: string;
    companyId: string;
    items: OrderItem[];
}

export class OrderRepository {
    private readonly db: Pool;
    private readonly productRepository: ProductRepository;

    constructor() {
        this.db = pools.orders;
        this.productRepository = new ProductRepository();
    }

    private async getOrCreateBatchId(client: PoolClient, customerId: string): Promise<string> {
        // First, check for an existing draft order for this customer
        const draftResult = await client.query(
            `SELECT batch_id 
             FROM "order" 
             WHERE customer_id = $1 
             AND status = 'draft' 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [customerId]
        );

        if (draftResult.rows.length > 0) {
            return draftResult.rows[0].batch_id;
        }

        // If no draft order exists, generate a new UUID for batch_id
        const newBatchResult = await client.query(
            `SELECT uuid_generate_v4() as new_batch_id`
        );

        return newBatchResult.rows[0].new_batch_id;
    }

    async create(data: OrderData) {
        const client = await this.db.connect();

        try {
            await client.query('BEGIN');

            const batchId = await this.getOrCreateBatchId(client, data.customerId);
            const orders = [];

            for (const item of data.items) {
                // Fetch product details
                const product = await this.productRepository.findById(item.productId);
                if (!product) {
                    throw new Error(`Product not found: ${item.productId}`);
                }

                // Create the order with product details
                const orderResult = await client.query(
                    `INSERT INTO "order" (
                        customer_id, company_id, batch_id,
                        product_name, quantity, unit_price,
                        total_price, status
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'draft')
                    RETURNING *`,
                    [
                        data.customerId,
                        data.companyId,
                        batchId,
                        product.name,
                        item.quantity,
                        product.price,
                        product.price * item.quantity
                    ]
                );

                orders.push(orderResult.rows[0]);
            }

            await client.query('COMMIT');
            return orders;

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findDraftByCustomer(customerId: string) {
        const result = await this.db.query(
            `SELECT * FROM "order" 
             WHERE customer_id = $1 
             AND status = 'draft' 
             ORDER BY created_at DESC 
             LIMIT 1`,
            [customerId]
        );
        return result.rows[0] || null;
    }

    async findById(id: string): Promise<Order | null> {
        const result = await this.db.query(
            'SELECT * FROM "order" WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    async findByCompanyId(companyId: string): Promise<Order[]> {
        const result = await this.db.query(
            'SELECT * FROM "order" WHERE company_id = $1 ORDER BY created_at DESC',
            [companyId]
        );
        return result.rows;
    }

    async findByCustomerId(customerId: string): Promise<Order[]> {
        const result = await this.db.query(
            'SELECT * FROM "order" WHERE customer_id = $1 ORDER BY created_at DESC',
            [customerId]
        );
        return result.rows;
    }

    async update(id: string, data: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Order> {
        const fields = Object.keys(data);
        const values = Object.values(data);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

        const result = await this.db.query(
            `UPDATE "order" SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [id, ...values]
        );
        return result.rows[0];
    }

    async findAll(): Promise<Order[]> {
        const result = await this.db.query(
            'SELECT * FROM "order" ORDER BY created_at DESC'
        );
        return result.rows;
    }
} 