/**
 * api/users.ts
 * API Service Layer for User Management.
 * 
 * CORE RESPONSIBILITIES:
 * - Direct communication with the Supabase Edge Function (`make-server-*`).
 * - CRUD operations for system users (Fetch, Create, Delete).
 * - Security management: Updating user PINs.
 * 
 * LINKAGE:
 * - Imported by: `src/app/App.tsx` (for session and user list management) and `src/app/components/AdminPanel.tsx`.
 * - Imports: `src/app/components/types.ts` for User interface.
 */

import { projectId, publicAnonKey } from "/utils/supabase/info";
import { User } from "@/app/components/types";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e66bfe94`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
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
    console.error(`API error on ${endpoint}:`, errorData);
    throw new Error(errorData.error || "API request failed");
  }

  return response.json();
}

export async function fetchUsers(): Promise<User[]> {
  const data = await fetchAPI("/users");
  return data.users;
}

export async function updateUserPin(
  userId: string,
  pin: string
): Promise<User> {
  const data = await fetchAPI(`/users/${userId}/pin`, {
    method: "PUT",
    body: JSON.stringify({ pin }),
  });
  return data.user;
}

export async function createUser(name: string, role: string): Promise<User> {
  const data = await fetchAPI("/users", {
    method: "POST",
    body: JSON.stringify({ name, role }),
  });
  return data.user;
}

export async function deleteUser(userId: string): Promise<void> {
  await fetchAPI(`/users/${userId}`, {
    method: "DELETE",
  });
}

export async function updateUserAccess(
  userId: string,
  accessibleTabs: string[]
): Promise<User> {
  const data = await fetchAPI(`/users/${userId}/access`, {
    method: "PUT",
    body: JSON.stringify({ accessibleTabs }),
  });
  return data.user;
}
