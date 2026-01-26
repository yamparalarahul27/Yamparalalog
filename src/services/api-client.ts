/**
 * services/api-client.ts
 * Main API Client - Single Entry Point for All API Calls
 * 
 * CORE RESPONSIBILITIES:
 * - Centralized API client instance
 * - Exposes all resource clients (logs, users, wiki, resources)
 * - Single import for all API operations
 * 
 * USAGE:
 * import { apiClient } from '@/services/api-client';
 * 
 * const logs = await apiClient.logs.getAll();
 * const users = await apiClient.users.getAll();
 * const pages = await apiClient.wiki.getPages();
 * const resources = await apiClient.resources.getAll();
 */

import { LogsClient } from './clients/logs-client';
import { UsersClient } from './clients/users-client';
import { WikiClient } from './clients/wiki-client';
import { ResourcesClient } from './clients/resources-client';

/**
 * Main API Client
 * Provides access to all resource-specific clients
 */
class ApiClient {
    public readonly logs: LogsClient;
    public readonly users: UsersClient;
    public readonly wiki: WikiClient;
    public readonly resources: ResourcesClient;

    constructor() {
        this.logs = new LogsClient();
        this.users = new UsersClient();
        this.wiki = new WikiClient();
        this.resources = new ResourcesClient();
    }
}

/**
 * Singleton instance of API client
 * Import and use this throughout your application
 */
export const apiClient = new ApiClient();

/**
 * Export types for convenience
 */
export type { CreateLogDto, UpdateLogDto, CreateCommentDto } from './clients/logs-client';
export type { CreateUserDto } from './clients/users-client';
export type { WikiPage, CreateWikiPageDto, UpdateWikiPageDto } from './clients/wiki-client';
export type { Resource, CreateResourceDto, UpdateResourceDto } from './clients/resources-client';
export type { ApiError } from './base-client';
