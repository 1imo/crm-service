export interface Point {
    x: number;
    y: number;
}

export interface RoomMeasurements {
    trueArea: number;
    carpetArea: number;
    truePerimeter: number;
    carpetPerimeter: number;
}

export interface Room {
    id: number;
    name: string;
    customer_id: string;
    company_id: string;
    points: Point[];
    notes?: string;
    floor_type?: string;
    measurements: RoomMeasurements;
    created_at: Date;
    updated_at: Date;
} 