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

/**
 * Represents a user in the Design Log Tracker.
 * Users can either be "admin" or standard engineers.
 */
export interface User {
  /** Unique identifier for the user (e.g., "admin", "newjoin", "user123"). */
  id: string;
  /** Display name of the user (e.g., "Yamparala Rahul"). */
  name: string;
  /** Role/Title of the user (e.g., "Lead Design Engineer"). */
  role: string;
  /** Optional 4-digit PIN used for local authentication. Admin sets this initially, users can update it. */
  pin?: string;
  /** Discontinued/Optional flag for enforcing PIN login. Defaults to false if undefined. */
  requiresPin?: boolean;
  /** Array of tab keys the user is allowed to access. Used by Admins to restrict view segments. Valid values: "wiki", "logs", "resources". */
  accessibleTabs?: string[];
}

/**
 * Represents a comment added to a DesignLog by a user.
 * Cannot be nested; flat structure only.
 */
export interface Comment {
  /** Unique ID for the comment. */
  id: string;
  /** The body text of the comment. */
  text: string;
  /** The display name of the user who authored the comment. */
  author: string;
  /** The ID of the user who authored the comment. */
  authorId: string;
  /** ISO string representing when the comment was created. */
  date: string;
}

/**
 * Represents a single Design Log entry tracking an engineering design choice, hypothesis, or outcome.
 * Acts as the primary unit of work in the application.
 */
export interface DesignLog {
  /** Unique UUID for the design log. */
  id: string;
  /** The headline/title of the log. Should concisely summarize the design entry. */
  title: string;
  /** Detailed HTML or Markdown-capable description of the design entry, decisions, and impact. */
  description: string;
  /** ISO string representing when the log was created. Used for timeline sorting. */
  date: string;
  /** The project or component category this log applies to. Used for filtering. */
  category?: string;
  /** Array of other DesignLog IDs this log is related to. Used to create chains of related decisions. */
  linkedLogIds?: string[];
  /** Optional URL linking to an image stored in Supabase Storage supporting this log. */
  imageUrl?: string;
  /** The User ID of the owner/creator of this log. */
  userId: string;
  /** Array of comments appended to this log by various users. */
  comments?: Comment[];
  /** Soft-delete flag. If true, the log appears only in the Trash dialog. */
  deleted?: boolean;
  /** ISO string denoting when the log was soft-deleted. */
  deletedAt?: string;
}