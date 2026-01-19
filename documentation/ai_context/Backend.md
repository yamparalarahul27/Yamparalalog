# Backend File: APIs and Logic

## Server Infrastructure
- **Base URL**: `https://${projectId}.supabase.co/functions/v1/make-server-e66bfe94`
- **Prefix**: All routes are prefixed with `/make-server-e66bfe94`.
- **Engine**: Hono running on Deno.

## Core API Gateways (`src/app/api/`)
- `logs.ts`: Log CRUD, image uploads, and admin comments.
- `wiki.ts`: Page management and media metadata.
- `resources.ts`: URL sharing and Microlink preview integration.
- `users.ts`: Identity and PIN management.

## Backend Endpoints

### 1. Design Logs
- `GET /logs`: Fetches all logs.
- `POST /logs`: Creates a new record.
- `DELETE /logs/:id`: Soft-deletes a record.
- `POST /logs/:id/restore`: Undeletes a record.

### 2. Knowledge Base
- `GET /wiki`: All pages.
- `PUT /wiki/:id`: Updates content or adds comments.

### 3. Media & Assets
- `POST /upload-image`: Direct stream to Supabase Storage.
- Signed URLs generated for assets with 1-year availability.

## Connection with Pages
- `App.tsx` calls `users.ts` during boot.
- `DesignLogs.tsx` calls `logs.ts` on tab switch.
- `Resources.tsx` calls `resources.ts` on mount.
- `Wiki.tsx` calls `wiki.ts` on mount or sidebar selection.
