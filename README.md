# KicksOps

KicksOps is a shoe-care operations platform built for the operational flow of a cleaning business: intake, pair tracking, quality control, delivery, and owner reporting.

This repository is currently at Phase 1, as requested:

- foundation + auth shell
- Supabase project setup
- database schema migration
- RLS-oriented security model
- dashboard shell
- environment configuration

## Tech stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Supabase Auth + Postgres
- Supabase Storage
- @supabase/ssr
- Zod
- Lucide icons

## Important setup notes

- Do not commit `.env.local`.
- Keep the Supabase keys in `.env.local` only.
- The app must never expose the Supabase service role or Anthropic API key to the browser.
- All business data is intended to be scoped by `org_id` and protected by row-level security.

## Environment

Create a local `.env.local` file with values similar to:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
ANTHROPIC_API_KEY=your-anthropic-key
```

A non-secret template is included in `.env.example`.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Supabase migrations

From the repo root:

```bash
npx supabase init
npx supabase db push
```

The initial Phase 1 migration is located in:

```text
supabase/migrations/20260918020000_phase1_foundation.sql
```

## Phase 1 scope delivered

- Next.js project scaffolded
- Supabase dependencies installed
- Supabase migration file created
- basic org-scoping security helpers added
- security tests created
- dashboard shell created
- login/signup shell created
- `.env.example` included
- README setup documentation added

## Current stop condition

This repository is intentionally stopped at Phase 1. Phase 2 is not implemented yet.

## Next phase when prompted

When you say `GO TO PHASE 2`, the next work includes:

- customer and order creation
- pair registration
- QR/printable tag generation
- photo intake and upload flow

## Verification

The project was lint-checked with:

```bash
npm run lint
```

This was run successfully in the repo.
