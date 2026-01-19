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

## Vercel Configuration

### Important: Base Path Settings
- **DO NOT** set a `base` path in `vite.config.ts` for Vercel deployments
- Vercel serves from the root path (`/`), not a subdirectory
- If you see a blank page or 404 errors for assets, check that `base` is not configured

### Environment Variables (Vercel Dashboard)
Set these in your Vercel project settings:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Deployment Checklist
1. **Supabase Functions**:
   ```bash
   supabase functions deploy server --project-id {YOUR_PROJECT_ID}
   ```
2. **Vite Frontend**:
   - Push to GitHub.
   - Vercel auto-deploys on push to `main` branch.
   - Verify environment variables are set in Vercel dashboard.

## CI/CD Pipeline
- **GitHub Actions**: (To be implemented)
- **QA Gate**: Run `npm run test:e2e` locally before pushing to the `main` branch.
