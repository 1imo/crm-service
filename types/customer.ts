export interface Customer {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    county?: string;
    postcode: string;
    country: string;
    created_at: string;
    updated_at: string;
} 