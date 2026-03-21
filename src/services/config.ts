export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const DEFAULT_SUPABASE_URL = "https://baogqyicexmltofymcem.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhb2dxeWljZXhtbHRvZnltY2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNDk5MTAsImV4cCI6MjA4OTYyNTkxMH0.BnEsTSigu-6106MwHbECrd0hNpDPYKP8Lb11WdvgaP0";

export function getSupabaseConfig(): SupabaseConfig {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
  };
}

export const SUPABASE_TABLES = {
  RESOURCES: "resources",
} as const;
