import { Pool } from 'pg';
import { Room, Point } from '@/types/room';
import { pools } from '@/config/database';

export class RoomRepository {
    private pool: Pool;

    constructor() {
        this.pool = pools.rooming;
    }

    async getRoomsByCustomer(customerId: string): Promise<Room[]> {
        const result = await this.pool.query(
            `SELECT r.*, 
                    rm.x_coordinate, 
                    rm.y_coordinate,
                    rm.true_area,
                    rm.carpet_area,
                    rm.true_perimeter,
                    rm.carpet_perimeter,
                    rm.point_order
             FROM rooms r
             JOIN room_measurements rm ON r.id = rm.room_id
             WHERE r.customer_id = $1
             ORDER BY r.id, rm.point_order`,
            [customerId]
        );

        // Group the rows by room ID to handle multiple points per room
        const roomsMap = new Map<number, Room>();
        
        for (const row of result.rows) {
            if (!roomsMap.has(row.id)) {
                roomsMap.set(row.id, {
                    id: row.id,
                    name: row.name,
                    customer_id: row.customer_id,
                    company_id: row.company_id,
                    points: [],
                    notes: row.notes,
                    floor_type: row.floor_type,
                    measurements: {
                        trueArea: parseFloat(row.true_area),
                        carpetArea: parseFloat(row.carpet_area),
                        truePerimeter: parseFloat(row.true_perimeter),
                        carpetPerimeter: parseFloat(row.carpet_perimeter)
                    },
                    created_at: row.created_at,
                    updated_at: row.updated_at
                });
            }

            const room = roomsMap.get(row.id)!;
            room.points.push({
                x: parseFloat(row.x_coordinate),
                y: parseFloat(row.y_coordinate)
            });
        }

        return Array.from(roomsMap.values());
    }
} 