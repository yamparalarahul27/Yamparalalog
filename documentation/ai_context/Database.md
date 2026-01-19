# Database File: Data & Storage

## Storage Engine
- **Type**: Supabase KV Store (NoSQL Key-Value).
- **Structure**: Flat key-value pairs stored in the `kv_store_e66bfe94` table.
- **Prefixes**:
  - `user:{id}`: User profile data.
  - `log:{id}`: Design log records.
  - `wiki:{id}`: Documentation pages.
  - `resource:{id}`: Shared URL library.

## Data Models

### User Schema
```typescript
{
  id: string;   // e.g., "admin", "praveen", "shaina"
  name: string; // Display name
  role: string; // Job title
  pin: string;  // 4-digit auth code
}
```

### Design Log Schema
```typescript
{
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  imageUrl?: string;
  userId: string;
  linkedLogIds: string[];
  deleted: boolean;
  deletedAt?: string;
}
```

## Recent Schema Changes
- **Jan 18, 2026**: Added `linkedLogIds` to `log` model to support cross-referencing design work.
- **Jan 18, 2026**: Integrated soft-delete (`deleted`, `deletedAt`) keys to support the Trash Bin feature.

## Asset Storage
- **Bucket**: `make-e66bfe94-design-logs`
- **Access**: Private (signed URLs only).
- **Handling**: Server-side bucket creation on first startup.
