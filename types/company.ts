export interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountName: string;
    accountNumber: string;
    sortCode: string;
    bankName: string;
    createdAt: Date;
    updatedAt: Date;
    addressLine1: string;
    addressLine2?: string;
    postcode: string;
    iban: string;
    city: string;
    county: string;
} 