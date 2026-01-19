# Deployment File

## Cloud Infrastructure
- **Hosting Provider**: Vercel (Frontend)
- **Backend Infrastructure**: Supabase (Edge Functions & KV Store)
- **Region**: Project-specific (typically US-East)

## Essential Variables (`utils/supabase/info.tsx`)
- `projectId`: Used to construct function URLs and database keys.
- `publicAnonKey`: Required for authenticating frontend requests.
- `SUPABASE_URL`: Required env var on server.
- `SUPABASE_SERVICE_ROLE_KEY`: Required env var on server for KV store access.

## Deployment Checklist
1. **Supabase Functions**:
   ```bash
   supabase functions deploy server --project-id {YOUR_PROJECT_ID}
   ```
2. **Vite Frontend**:
   - Push to GitHub.
   - Connect to Vercel.
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## CI/CD Pipeline
- **GitHub Actions**: (To be implemented)
- **QA Gate**: Run `npm run test:e2e` locally before pushing to the `main` branch.
