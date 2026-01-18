/**
 * api/logs.ts
 * API Service Layer for Design Logs.
 * 
 * CORE RESPONSIBILITIES:
 * - Direct communication with the Supabase Edge Function (`make-server-*`).
 * - CRUD operations for design logs (Fetch, Create, Update, Delete, Restore).
 * - Media handling: Image upload to Supabase storage.
 * - Social features: Adding comments to specific logs.
 * 
 * LINKAGE:
 * - Imported by: `src/app/App.tsx` for main data orchestration.
 * - Imports: `src/app/components/types.ts` for DesignLog and Comment interfaces.
 * - Config: Uses `utils/supabase/info` for project credentials.
 */

import { projectId, publicAnonKey } from "/utils/supabase/info";
import { DesignLog, Comment } from "@/app/components/types";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e66bfe94`;

async function fetchAPI(
  endpoint: string,
  options: RequestInit = {},
): Promise<any> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`API Error on ${endpoint}:`, errorData);
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
}

export async function fetchLogs(): Promise<DesignLog[]> {
  const data = await fetchAPI("/logs");
  const logs = data.logs || [];

  // Migration: Convert old 'tags' format to new 'linkedLogIds' format
  return logs.map((log: any) => {
    // If log has 'tags' but not 'linkedLogIds', it's old data
    if (log.tags && !log.linkedLogIds) {
      return {
        ...log,
        linkedLogIds: [], // Convert old tags to empty linkedLogIds
        // Keep the tags field for reference if needed
      };
    }
    return log;
  });
}

export async function createLog(
  log: Omit<DesignLog, "id">,
): Promise<DesignLog> {
  const data = await fetchAPI("/logs", {
    method: "POST",
    body: JSON.stringify(log),
  });
  return data.log;
}

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/upload-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Image upload error:", errorData);
    throw new Error(
      errorData.error || "Failed to upload image",
    );
  }

  const data = await response.json();
  return data.imageUrl;
}

export async function updateLog(
  log: DesignLog,
): Promise<DesignLog> {
  const data = await fetchAPI(`/logs/${log.id}`, {
    method: "PUT",
    body: JSON.stringify(log),
  });
  return data.log;
}

export async function deleteLog(id: string): Promise<void> {
  await fetchAPI(`/logs/${id}`, {
    method: "DELETE",
  });
}

export async function restoreLog(
  id: string,
): Promise<DesignLog> {
  const data = await fetchAPI(`/logs/${id}/restore`, {
    method: "POST",
  });
  return data.log;
}

export async function permanentDeleteLog(
  id: string,
): Promise<void> {
  await fetchAPI(`/logs/${id}/permanent`, {
    method: "DELETE",
  });
}

export async function addComment(
  logId: string,
  comment: Omit<Comment, "id" | "date">,
): Promise<DesignLog> {
  const data = await fetchAPI(`/logs/${logId}/comments`, {
    method: "POST",
    body: JSON.stringify(comment),
  });
  return data.log;
}