import { projectId, publicAnonKey } from "/utils/supabase/info";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e66bfe94`;

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
  images?: string[];
  comments?: WikiComment[];
  createdBy: string;
  createdByName: string;
  lastModified: string;
}

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

export async function fetchWikiPages(): Promise<WikiPage[]> {
  const data = await fetchAPI("/wiki");
  return data.pages || [];
}

export async function createWikiPage(
  page: Omit<WikiPage, "id">,
): Promise<WikiPage> {
  const data = await fetchAPI("/wiki", {
    method: "POST",
    body: JSON.stringify(page),
  });
  return data.page;
}

export async function updateWikiPage(
  id: string,
  page: Partial<WikiPage>,
): Promise<WikiPage> {
  const data = await fetchAPI(`/wiki/${id}`, {
    method: "PUT",
    body: JSON.stringify(page),
  });
  return data.page;
}

export async function deleteWikiPage(id: string): Promise<void> {
  await fetchAPI(`/wiki/${id}`, {
    method: "DELETE",
  });
}