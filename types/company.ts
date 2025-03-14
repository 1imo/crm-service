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
    addressLine2: string;
    postcode: string;
    iban: string;
    city: string;
    county: string;
    logo?: string;  // URL to the logo
    logoFile?: File;  // For handling file uploads
    website?: string; // Added website field
} 