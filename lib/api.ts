/**
 * Service for making authenticated requests to backend services
 */
import { ApiError } from '@/types/errors';

export class ApiService {
    /**
     * Makes an authenticated request to a service
     * @param url - Full URL to the endpoint
     * @param options - Fetch options
     * @returns Promise resolving to the response
     */
    static async fetch(url: string, options: RequestInit = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'X-Service-Name': process.env.SERVICE_NAME ?? 'crm-service',
            'X-API-Key': process.env.API_KEY ?? '',
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            throw new ApiError('API request failed', response.status);
        }

        return response.json();
    }
} 