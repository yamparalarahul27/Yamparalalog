# PM File: File Interconnections

## System Interconnections
The application is designed as a **Unidirectional Data Flow** system. Below is how the various layers interconnect:

### 1. The Core Flow (Request/Response)
- **UI Component** (`src/app/components/`) ↔ **API Layer** (`src/app/api/`)
  - The UI triggers an action (e.g., clicking "Save").
  - The API layer formats the `fetch()` request and handles the response.
- **API Layer** (`src/app/api/`) ↔ **Server** (`supabase/functions/server/`)
  - The request crosses the network boundary to the Hono/Deno server.
- **Server** ↔ **Database Wrapper** (`kv_store_e66bfe94`)
  - The server processes the business logic (e.g., "Is this user an admin?") and then reads/writes to the KV store.

### 2. Tab Navigation Interconnection
- `App.tsx` manages a `mainTab` state.
- Changing the state renders either `<DesignLogs />`, `<Wiki />`, or `<Resources />`.
- Each child component handles its own sub-fetching to keep `App.tsx` clean.

### 3. Identity and State Propagation
- `App.tsx` fetches the list of `users` on mount.
- The `currentUser` object is passed down as a prop to every major component.
- This object determines:
  - Role (`Admin` vs `User`).
  - Permissions (e.g., "Can I delete this Wiki page?").
  - Log ownership (`userId` match).

### 4. Stylesheet Mapping
- `index.css`: Sets the "Stage" (Layout, Background).
- `theme.css`: Sets the "Actors" (Component styling, animations).
- `ui/*.tsx`: The "Body Parts" (Buttons, Inputs) which inherit styles from `theme.css`.
