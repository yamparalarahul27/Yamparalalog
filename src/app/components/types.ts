/**
 * components/types.ts
 * Centralized TypeScript Interface Definitions.
 * 
 * CORE RESPONSIBILITIES:
 * - Data Consistency: Defines the "Source of Truth" for all data structures in the app.
 * - Type Safety: Ensures all components and API calls adhere to the same data models.
 * 
 * LINKAGE:
 * - Global: Imported by nearly every file in `src/app/` (App, components, API services).
 * - Backend: Data structures here must align with the KV store objects in the Supabase function.
 */

export interface User {
  id: string;
  name: string;
  role: string;
  pin?: string;
  requiresPin?: boolean; // Whether this user needs PIN authentication
  accessibleTabs?: string[]; // Which tabs this user can access: "wiki", "logs", "resources"
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  date: string;
}

export interface DesignLog {
  id: string;
  title: string;
  description: string;
  date: string;
  category?: string;
  linkedLogIds?: string[];
  imageUrl?: string;
  userId: string;
  comments?: Comment[];
  deleted?: boolean;
  deletedAt?: string;
}