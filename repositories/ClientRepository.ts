import { Pool } from 'pg';
import { Client } from '@/types/client';
import { pools } from '@/config/database';

export class ClientRepository {
    private readonly db: Pool;

    constructor() {
        this.db = pools.clients;
    }

    async findAll(): Promise<Client[]> {
        const result = await this.db.query('SELECT * FROM company ORDER BY created_at DESC');
        return result.rows;
    }

    async findById(id: string): Promise<Client | null> {
        const result = await this.db.query('SELECT * FROM company WHERE id = $1', [id]);
        return result.rows[0] || null;
    }

    async search(query: string): Promise<Client[]> {
        const searchPattern = `%${query}%`;
        const result = await this.db.query(
            `SELECT * FROM company 
             WHERE 
               LOWER(name) LIKE LOWER($1) OR
               LOWER(email) LIKE LOWER($1)
             ORDER BY name
             LIMIT 10`,
            [searchPattern]
        );
        return result.rows;
    }
} 