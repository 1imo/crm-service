export interface Event {
    id: string;
    company_id: string;
    user_id: string;
    customer_id: string;
    customer_name?: string;
    title: string;
    start_time: Date;
    end_time: Date;
    status: string;
    type: string;
    color?: string;
    notes?: EventNote[];
    linked_orders?: string[];
    address?: {
        street?: string;
        city?: string;
        postcode?: string;
        country?: string;
    };
    created_at: Date;
    updated_at: Date;
}

export interface EventNote {
    id: string;
    event_id: string;
    user_id: string;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export interface EventLinkedOrder {
    event_id: string;
    order_id: string;
    created_at: Date;
} 