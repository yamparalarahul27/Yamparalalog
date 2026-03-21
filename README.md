## Resource Library

This project is a simplified resource library for saving useful links with a source, category, notes, and saved date.

## Local setup

1. Copy `.env.example` to `.env`
2. Add your Supabase values
3. Run `npm install`
4. Run `npm run dev`

## Supabase setup

Run the SQL in [20260321_create_resources.sql](/Users/yamparalarahul/Desktop/ylog/Yamparalalog/supabase/migrations/20260321_create_resources.sql) in the Supabase SQL editor, or apply it with the Supabase CLI.

## Vercel env vars

Add these variables to Vercel for Production and Preview:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
