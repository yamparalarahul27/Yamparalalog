/**
 * services/base-client.ts
 * Base HTTP Client for API Communication
 * 
 * CORE RESPONSIBILITIES:
 * - HTTP request/response handling
 * - Error handling and retry logic
 * - Request/response interceptors
 * - Authentication header injection
 * 
 * USAGE:
 * - Extended by resource-specific clients (LogsClient, UsersClient, etc.)
 */

import { getApiConfig, getAuthToken } from './config';

export interface ApiError {
    message: string;
    status: number;
    details?: unknown;
}

export class BaseClient {
    protected baseURL: string;
    protected timeout: number;
    protected headers: Record<string, string>;

    constructor() {
        const config = getApiConfig();
        this.baseURL = config.baseURL;
        this.timeout = config.timeout;
        this.headers = {
            ...config.headers,
            Authorization: `Bearer ${getAuthToken()}`,
        };
    }

    /**
     * Make HTTP request with error handling
     */
    protected async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...this.headers,
                    ...options.headers,
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error: ApiError = {
                    message: errorData.error || 'API request failed',
                    status: response.status,
                    details: errorData,
                };
                throw error;
            }

            return response.json();
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    throw {
                        message: 'Request timeout',
                        status: 408,
                    } as ApiError;
                }
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    protected async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    protected async post<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    protected async put<T>(endpoint: string, data?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    protected async deleteHttp<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'DELETE',
        });
    }

    /**
     * Upload file (multipart/form-data)
     */
    protected async uploadFile<T>(endpoint: string, file: File): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${this.baseURL}${endpoint}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw {
                message: errorData.error || 'File upload failed',
                status: response.status,
                details: errorData,
            } as ApiError;
        }

        return response.json();
    }
}
