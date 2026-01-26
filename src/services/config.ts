/**
 * services/config.ts
 * API Configuration and Environment Variables
 * 
 * CORE RESPONSIBILITIES:
 * - Centralized API configuration
 * - Environment-based settings
 * - Authentication token management
 * 
 * USAGE:
 * - Imported by API client to configure base URL and headers
 * - Uses Vite environment variables (import.meta.env)
 */

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    headers: Record<string, string>;
}

/**
 * Get API configuration from environment variables
 * Falls back to hardcoded values for backward compatibility
 */
export const getApiConfig = (): ApiConfig => {
    const baseURL = import.meta.env.VITE_API_BASE_URL ||
        'https://iuhnbtcmllpqjwituaov.supabase.co/functions/v1/make-server-e66bfe94';

    return {
        baseURL,
        timeout: 30000, // 30 seconds
        headers: {
            'Content-Type': 'application/json',
        },
    };
};

/**
 * Get authentication token from environment variables
 * Falls back to hardcoded value for backward compatibility
 */
export const getAuthToken = (): string => {
    return import.meta.env.VITE_API_TOKEN ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aG5idGNtbGxwcWp3aXR1YW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDI4MjMsImV4cCI6MjA4NDIxODgyM30.J30HRQ3R22aV0tUHELBo5UCMjhT1KesalZfzbcl2PS4';
};

/**
 * API endpoint paths
 */
export const API_ENDPOINTS = {
    LOGS: '/logs',
    USERS: '/users',
    WIKI: '/wiki',
    RESOURCES: '/resources',
    SETTINGS: '/settings',
    FEATURE_FLAGS: '/feature-flags',
    UPLOAD_IMAGE: '/upload-image',
} as const;
