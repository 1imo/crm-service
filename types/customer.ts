export interface Customer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    postcode: string;
    createdAt: Date;
    updatedAt: Date;
} 