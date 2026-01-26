/**
 * services/clients/logs-client.ts
 * Design Logs API Client
 * 
 * CORE RESPONSIBILITIES:
 * - CRUD operations for design logs
 * - Image upload functionality
 * - Comment management
 * - Trash/restore operations
 * 
 * USAGE:
 * - Accessed via apiClient.logs.methodName()
 */

import { BaseClient } from '../base-client';
import { API_ENDPOINTS } from '../config';
import { DesignLog, Comment } from '@/app/components/types';

export interface CreateLogDto {
    title: string;
    description: string;
    date: string;
    category?: string;
    linkedLogIds?: string[];
    imageUrl?: string;
    userId: string;
}

export interface UpdateLogDto extends Partial<CreateLogDto> {
    id: string;
}

export interface CreateCommentDto {
    text: string;
    author: string;
    authorId: string;
}

export class LogsClient extends BaseClient {
    /**
     * Get all design logs
     */
    async getAll(): Promise<DesignLog[]> {
        const data = await this.get<{ logs: DesignLog[] }>(API_ENDPOINTS.LOGS);
        const logs = data.logs || [];

        // Migration: Convert old 'tags' format to new 'linkedLogIds' format
        return logs.map((log: any) => {
            if (log.tags && !log.linkedLogIds) {
                return {
                    ...log,
                    linkedLogIds: [],
                };
            }
            return log;
        });
    }

    /**
     * Create a new design log
     */
    async create(log: CreateLogDto): Promise<DesignLog> {
        const data = await this.post<{ log: DesignLog }>(API_ENDPOINTS.LOGS, log);
        return data.log;
    }

    /**
     * Update an existing design log
     */
    async update(log: UpdateLogDto): Promise<DesignLog> {
        const data = await this.put<{ log: DesignLog }>(
            `${API_ENDPOINTS.LOGS}/${log.id}`,
            log
        );
        return data.log;
    }

    /**
     * Soft delete a design log (move to trash)
     */
    async delete(id: string): Promise<void> {
        await this.deleteHttp<{ success: boolean }>(`${API_ENDPOINTS.LOGS}/${id}`);
    }

    /**
     * Restore a deleted design log
     */
    async restore(id: string): Promise<DesignLog> {
        const data = await this.post<{ log: DesignLog }>(
            `${API_ENDPOINTS.LOGS}/${id}/restore`
        );
        return data.log;
    }

    /**
     * Permanently delete a design log
     */
    async permanentDelete(id: string): Promise<void> {
        await this.deleteHttp<{ success: boolean }>(
            `${API_ENDPOINTS.LOGS}/${id}/permanent`
        );
    }

    /**
     * Add a comment to a design log
     */
    async addComment(logId: string, comment: CreateCommentDto): Promise<DesignLog> {
        const data = await this.post<{ log: DesignLog }>(
            `${API_ENDPOINTS.LOGS}/${logId}/comments`,
            comment
        );
        return data.log;
    }

    /**
     * Upload an image for a design log
     */
    async uploadImage(file: File): Promise<string> {
        const data = await this.uploadFile<{ imageUrl: string }>(
            API_ENDPOINTS.UPLOAD_IMAGE,
            file
        );
        return data.imageUrl;
    }
}
