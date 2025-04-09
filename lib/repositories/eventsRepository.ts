import { getPool } from '@/config/database';
import { Event, EventNote, EventLinkedOrder } from '@/types/event';
import { CustomerRepository } from '@/repositories/CustomerRepository';

export class EventsRepository {
    private pool = getPool('bookings');
    private customerRepository = new CustomerRepository();

    async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // First create the event
            const eventQuery = `
                INSERT INTO events (
                    company_id,
                    user_id,
                    customer_id,
                    title,
                    start_time,
                    end_time,
                    status,
                    type,
                    color
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const eventValues = [
                event.company_id,
                event.user_id,
                event.customer_id,
                event.title,
                event.start_time,
                event.end_time,
                event.status,
                event.type,
                event.color
            ];

            const eventResult = await client.query(eventQuery, eventValues);
            const createdEvent = eventResult.rows[0];

            // If there are initial notes, create them
            if (event.notes && event.notes.length > 0) {
                const noteQuery = `
                    INSERT INTO event_notes (event_id, user_id, content)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `;

                for (const note of event.notes) {
                    await client.query(noteQuery, [
                        createdEvent.id,
                        event.user_id,
                        note.content
                    ]);
                }
            }

            await client.query('COMMIT');

            // Fetch the complete event with notes
            return this.getEventById(createdEvent.id) as Promise<Event>;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getEventsByCustomerId(customerId: string): Promise<Event[]> {
        const query = `
            SELECT * FROM events
            WHERE customer_id = $1
            ORDER BY start_time DESC
        `;

        const result = await this.pool.query(query, [customerId]);
        return result.rows;
    }

    async getEventById(id: string): Promise<Event | null> {
        // First get the event with notes and linked orders
        const eventQuery = `
            SELECT 
                e.*,
                ARRAY_AGG(elo.order_id) FILTER (WHERE elo.order_id IS NOT NULL) as linked_orders,
                json_agg(
                    json_build_object(
                        'id', en.id,
                        'content', en.content,
                        'user_id', en.user_id,
                        'created_at', en.created_at,
                        'updated_at', en.updated_at
                    )
                ) FILTER (WHERE en.id IS NOT NULL) as notes
            FROM events e
            LEFT JOIN event_linked_orders elo ON elo.event_id = e.id
            LEFT JOIN event_notes en ON en.event_id = e.id
            WHERE e.id = $1
            GROUP BY e.id
        `;

        const eventResult = await this.pool.query(eventQuery, [id]);
        if (!eventResult.rows[0]) return null;

        const event = eventResult.rows[0];
        
        // If there's a customer_id, fetch customer details
        let customerDetails = null;
        if (event.customer_id) {
            customerDetails = await this.customerRepository.findById(event.customer_id, event.company_id);
        }

        return {
            ...event,
            customer_name: customerDetails ? `${customerDetails.first_name} ${customerDetails.last_name}` : undefined,
            address: customerDetails ? {
                street: customerDetails.address_line1,
                city: customerDetails.city,
                postcode: customerDetails.postcode,
                country: customerDetails.country || 'United Kingdom'
            } : undefined,
            linked_orders: event.linked_orders || [],
            notes: event.notes || []
        };
    }

    async updateEvent(id: string, event: Partial<Event>): Promise<Event | null> {
        const fields = Object.keys(event).map((key, index) => `${key} = $${index + 2}`);
        const values = Object.values(event);
        
        const query = `
            UPDATE events
            SET ${fields.join(', ')}
            WHERE id = $1
            RETURNING *
        `;

        const result = await this.pool.query(query, [id, ...values]);
        return result.rows[0] || null;
    }

    async deleteEvent(id: string): Promise<boolean> {
        const query = `
            DELETE FROM events
            WHERE id = $1
        `;

        const result = await this.pool.query(query, [id]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    // Event Notes Methods
    async createEventNote(note: Omit<EventNote, 'id' | 'created_at' | 'updated_at'>): Promise<EventNote> {
        const query = `
            INSERT INTO event_notes (
                event_id,
                user_id,
                content
            ) VALUES ($1, $2, $3)
            RETURNING *
        `;

        const values = [
            note.event_id,
            note.user_id,
            note.content
        ];

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    async getEventNotes(eventId: string): Promise<EventNote[]> {
        const query = `
            SELECT * FROM event_notes
            WHERE event_id = $1
            ORDER BY created_at DESC
        `;

        const result = await this.pool.query(query, [eventId]);
        return result.rows;
    }

    // Event Linked Orders Methods
    async linkOrderToEvent(eventId: string, orderId: string): Promise<EventLinkedOrder> {
        const query = `
            INSERT INTO event_linked_orders (
                event_id,
                order_id
            ) VALUES ($1, $2)
            RETURNING *
        `;

        const result = await this.pool.query(query, [eventId, orderId]);
        return result.rows[0];
    }

    async getLinkedOrders(eventId: string): Promise<EventLinkedOrder[]> {
        const query = `
            SELECT * FROM event_linked_orders
            WHERE event_id = $1
            ORDER BY created_at DESC
        `;

        const result = await this.pool.query(query, [eventId]);
        return result.rows;
    }

    async getEventsByDateRange(companyId: string, userId: string, startDate: Date, endDate: Date): Promise<Event[]> {
        const result = await this.pool.query(
            `SELECT * FROM events 
            WHERE company_id = $1 
            AND user_id = $2 
            AND start_time >= $3 
            AND end_time <= $4 
            ORDER BY start_time ASC`,
            [companyId, userId, startDate, endDate]
        );
        return result.rows;
    }

    async addNote(eventId: string, userId: string, content: string): Promise<EventNote> {
        const query = `
            INSERT INTO event_notes (event_id, user_id, content)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

        const result = await this.pool.query(query, [eventId, userId, content]);
        return result.rows[0];
    }

    async getNotes(eventId: string): Promise<EventNote[]> {
        const query = `
            SELECT * FROM event_notes
            WHERE event_id = $1
            ORDER BY created_at DESC
        `;

        const result = await this.pool.query(query, [eventId]);
        return result.rows;
    }

    async updateNote(noteId: string, content: string): Promise<EventNote | null> {
        const query = `
            UPDATE event_notes
            SET content = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;

        const result = await this.pool.query(query, [content, noteId]);
        return result.rows[0] || null;
    }

    async deleteNote(noteId: string): Promise<boolean> {
        const query = `
            DELETE FROM event_notes
            WHERE id = $1
        `;

        const result = await this.pool.query(query, [noteId]);
        return result.rowCount ? result.rowCount > 0 : false;
    }

    async addNoteToEvent(eventId: string, content: string, userId: string): Promise<Event | null> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // First add the note
            const noteQuery = `
                INSERT INTO event_notes (event_id, user_id, content)
                VALUES ($1, $2, $3)
                RETURNING *
            `;

            await client.query(noteQuery, [eventId, userId, content]);

            await client.query('COMMIT');

            // Return the updated event with all its details
            return this.getEventById(eventId);
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
} 