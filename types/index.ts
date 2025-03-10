export interface Order {
    id: string;
    customerId: string;
    companyId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Invoice {
    id: string;
    companyId: string;
    customerId: string;
    orderBatchId: string;
    templateId: string;
    amount: number;
    currency: string;
    dueDate: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
    }>;
    status: 'draft' | 'sent' | 'paid' | 'void';
    createdAt: string;
    updatedAt: string;
}

export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    addressLine3?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Company {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    accountName?: string;
    accountNumber?: string;
    sortCode?: string;
    bankName?: string;
    createdAt: Date;
    updatedAt: Date;
} 