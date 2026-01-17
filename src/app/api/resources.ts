import { projectId, publicAnonKey } from "/utils/supabase/info";

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

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e66bfe94`;

export async function fetchResources(): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/resources`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch resources: ${error}`);
  }

  const data = await response.json();
  return data.resources || [];
}

export async function createResource(
  resource: Omit<Resource, "id">
): Promise<Resource> {
  const response = await fetch(`${API_URL}/resources`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create resource: ${error}`);
  }

  const data = await response.json();
  return data.resource;
}

export async function deleteResource(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/resources/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to delete resource: ${error}`);
  }
}

export async function updateResource(resource: Resource): Promise<Resource> {
  const response = await fetch(`${API_URL}/resources/${resource.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(resource),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update resource: ${error}`);
  }

  return response.json();
}