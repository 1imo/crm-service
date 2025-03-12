export interface Order {
    id: string;
    batch_id: string;
    customer_id: string;
    company_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: 'draft' | 'pending payment' | 'paid' | 'completed' | 'cancelled';
    notes?: string;
    created_at: Date;
    updated_at: Date;
} 