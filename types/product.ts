export interface Product {
    id: string;
    companyId: string;
    name: string;
    description?: string;
    sku?: string;
    price: number;
    stockQuantity: number;
    createdAt: Date;
    updatedAt: Date;
} 