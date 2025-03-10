export interface Order {
    id: string;
    batchId: string;
    customerId: string;
    companyId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: 'draft' | 'pending' | 'completed' | 'cancelled';
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
} 