/**
 * services/clients/resources-client.ts
 * Resources API Client
 * 
 * CORE RESPONSIBILITIES:
 * - Resource library management (CRUD)
 * - URL and metadata handling
 * 
 * USAGE:
 * - Accessed via apiClient.resources.methodName()
 */

import { BaseClient } from '../base-client';
import { API_ENDPOINTS } from '../config';

export interface Resource {
    id: string;
    title: string;
    url: string;
    description: string;
    category: string;
    addedBy: string;
    addedById: string;
    addedDate: string;
    isAdminResource: boolean;
}

export interface CreateResourceDto {
    title: string;
    url: string;
    description: string;
    category: string;
    addedBy: string;
    addedById: string;
    addedDate: string;
    isAdminResource: boolean;
}

export interface UpdateResourceDto extends Partial<CreateResourceDto> { }

export class ResourcesClient extends BaseClient {
    /**
     * Get all resources
     */
    async getAll(): Promise<Resource[]> {
        const data = await this.get<{ resources: Resource[] }>(API_ENDPOINTS.RESOURCES);
        return data.resources || [];
    }

    /**
     * Create a new resource
     */
    async create(resource: CreateResourceDto): Promise<Resource> {
        const data = await this.post<{ resource: Resource }>(
            API_ENDPOINTS.RESOURCES,
            resource
        );
        return data.resource;
    }

    /**
     * Update a resource
     */
    async update(id: string, updates: UpdateResourceDto): Promise<Resource> {
        const data = await this.put<{ resource: Resource }>(
            `${API_ENDPOINTS.RESOURCES}/${id}`,
            updates
        );
        return data.resource;
    }

    /**
     * Delete a resource
     */
    async delete(id: string): Promise<void> {
        await this.deleteHttp<{ success: boolean }>(
            `${API_ENDPOINTS.RESOURCES}/${id}`
        );
    }
}
