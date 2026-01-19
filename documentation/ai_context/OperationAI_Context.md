# Operation AI Context File

## Product Overview
The **Yamparala Dev App** is a high-performance Design Logs Tracking Application designed for internal team collaboration. It serves as a central hub for Design Engineers to log work, manage documentation (Wiki), and share resources.

## Core Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS v4
- **Backend**: Supabase Edge Functions (Hono framework on Deno runtime)
- **Database**: Supabase KV Store (Key-Value storage)
- **Storage**: Supabase Storage (Private bucket for design assets)
- **Testing**: Playwright (End-to-End browser testing)
- **Identity**: PIN-based authentication system

## Development Philosophy
- **Speed**: Minimal loading states, optimistic UI updates, and fast backend responses.
- **Aesthetics**: Premium, modern UI with rich animations (pulsing indicators) and high-quality photography.
- **Security**: Private storage with signed URLs and PIN-protected access.

## Strict Rules (Non-Negotiable)
- **Database**: Do NOT assume SQL, ORM, or relational databases. ONLY use the Supabase KV Store wrapper.
- **Auth**: Do NOT add new authentication systems. PIN-based auth only.
- **Features**: Do NOT introduce real-time features, background jobs, or websockets.
- **Fixed Structure**: Do NOT change API prefixes (`/make-server-e66bfe94`), storage bucket names, or routing structure.
- **Patterns**: Prefer existing patterns over creating new abstractions.
- **Resolution**: If a task conflicts with documentation, STOP and ask for clarification.

## Your Role (AI Agent)
- Act as a senior engineer + product-aware system designer.
- Preserve architectural intent and product vision.
- Make changes that are minimal, explicit, and testable.
- Assume this code will be maintained long-term.

## Troubleshooting Guide
- **Connection Errors**: Check route prefix `/make-server-e66bfe94` and `Authorization` headers.
- **Media Issues**: Verify Signed URL expiration (1 year) and YouTube URL formatting.
- **Auth Issues**: Ensure `createdById` matches the authenticated user ID in local storage.
