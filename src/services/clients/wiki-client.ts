/**
 * services/clients/wiki-client.ts
 * Wiki API Client
 * 
 * CORE RESPONSIBILITIES:
 * - Wiki page management (CRUD)
 * - Content and media handling
 * 
 * USAGE:
 * - Accessed via apiClient.wiki.methodName()
 */

import { BaseClient } from '../base-client';
import { API_ENDPOINTS } from '../config';

export interface WikiComment {
    id: string;
    text: string;
    author: string;
    authorId: string;
    date: string;
}

export interface WikiPage {
    id: string;
    title: string;
    content: string;
    category?: string;
    tag?: 'Design Team' | 'Public';
    images?: string[];
    videos?: string[];
    comments?: WikiComment[];
    createdBy: string;
    createdByName: string;
    lastModified: string;
}

export interface CreateWikiPageDto {
    title: string;
    content: string;
    category?: string;
    tag?: 'Design Team' | 'Public';
    images?: string[];
    videos?: string[];
    createdBy: string;
    createdByName: string;
    lastModified: string;
}

export interface UpdateWikiPageDto extends Partial<CreateWikiPageDto> { }

export class WikiClient extends BaseClient {
    /**
     * Get all wiki pages
     */
    async getPages(): Promise<WikiPage[]> {
        const data = await this.get<{ pages: WikiPage[] }>(API_ENDPOINTS.WIKI);
        return data.pages || [];
    }

    /**
     * Create a new wiki page
     */
    async createPage(page: CreateWikiPageDto): Promise<WikiPage> {
        const data = await this.post<{ page: WikiPage }>(API_ENDPOINTS.WIKI, page);
        return data.page;
    }

    /**
     * Update a wiki page
     */
    async updatePage(id: string, updates: UpdateWikiPageDto): Promise<WikiPage> {
        const data = await this.put<{ page: WikiPage }>(
            `${API_ENDPOINTS.WIKI}/${id}`,
            updates
        );
        return data.page;
    }

    /**
     * Delete a wiki page
     */
    async deletePage(id: string): Promise<void> {
        await this.deleteHttp<{ success: boolean }>(`${API_ENDPOINTS.WIKI}/${id}`);
    }
}
