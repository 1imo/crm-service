import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    port: number;
}

const dbConfig: DatabaseConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    user: process.env.DB_USER ?? '',
    password: process.env.DB_PASSWORD ?? '',
    port: parseInt(process.env.DB_PORT ?? '5432')
};

export const pools = {
    orders: new Pool({
        ...dbConfig,
        database: 'ordering'
    }),
    clients: new Pool({
        ...dbConfig,
        database: 'clients'
    }),
    invoicing: new Pool({
        ...dbConfig,
        database: 'invoicing'
    }),
    rooming: new Pool({
        ...dbConfig,
        database: 'Rooming'
    })
};

export function getPool(database: keyof typeof pools): Pool {
    return pools[database];
} 