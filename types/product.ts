export interface Product {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stock_quantity: number;
    created_at: Date;
    updated_at: Date;
} 