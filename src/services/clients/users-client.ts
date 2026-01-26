/**
 * services/clients/users-client.ts
 * Users API Client
 * 
 * CORE RESPONSIBILITIES:
 * - User management (CRUD)
 * - PIN management
 * - User authentication
 * 
 * USAGE:
 * - Accessed via apiClient.users.methodName()
 */

import { BaseClient } from '../base-client';
import { API_ENDPOINTS } from '../config';
import { User } from '@/app/components/types';

export interface CreateUserDto {
    name: string;
    role: string;
}

export class UsersClient extends BaseClient {
    /**
     * Get all users
     */
    async getAll(): Promise<User[]> {
        const data = await this.get<{ users: User[] }>(API_ENDPOINTS.USERS);
        return data.users || [];
    }

    /**
     * Update user PIN
     */
    async updatePin(userId: string, pin: string): Promise<User> {
        const data = await this.put<{ user: User }>(
            `${API_ENDPOINTS.USERS}/${userId}/pin`,
            { pin }
        );
        return data.user;
    }

    /**
     * Create a new user
     */
    async create(userData: CreateUserDto): Promise<User> {
        const data = await this.post<{ user: User }>(
            API_ENDPOINTS.USERS,
            userData
        );
        return data.user;
    }

    /**
     * Delete a user
     */
    async delete(userId: string): Promise<void> {
        await this.deleteHttp<{ success: boolean }>(
            `${API_ENDPOINTS.USERS}/${userId}`
        );
    }
    /**
     * Update user access tabs
     */
    async updateAccess(userId: string, accessibleTabs: string[]): Promise<User> {
        const data = await this.put<{ user: User }>(
            `${API_ENDPOINTS.USERS}/${userId}/access`,
            { accessibleTabs }
        );
        return data.user;
    }
}
