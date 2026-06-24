# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## This is NOT the Next.js you know

This is **Next.js 16** (App Router). It has breaking changes — APIs, conventions, and file structure may differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any Next.js code, and heed deprecation notices. In particular, `cookies()`, `headers()`, and route `params` are all **async** here (`await params`).

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (flat config, eslint.config.mjs)
```

There is no test framework configured.

## Architecture

DentalFlow is a per-user SaaS that turns free-text dental clinical notes into structured insurance claims (CDT codes) via an LLM. Stack: Next.js 16 App Router + React 19, Supabase (auth + Postgres), Polar (billing), Gemini (extraction). Path alias `@/*` → `src/*`.

### Three external services, three roles
- **Supabase** — auth (email/password) and the Postgres database. Two client factories in `src/lib/supabase/`: `server.ts` (`createClient()`, async, cookie-based, for Server Components / route handlers) and `client.ts` (browser). Never mix them.
- **Gemini** (`@google/genai`, model `gemini-3-flash-preview`) — the actual claim extraction, only in `src/app/api/extract-claim/route.ts`. The prompt asks for raw JSON; the handler strips ```` ```json ```` fences before `JSON.parse`.
- **Polar** (`@polar-sh/sdk`) — subscription billing ($199/mo). Sandbox vs production is toggled by `POLAR_ENV`. (Note: `@anthropic-ai/sdk` is a dependency but not currently wired into a feature.)

### Auth + access-control layers (two distinct gates)
1. **`middleware.ts`** runs on every non-static request, refreshes the Supabase session, and redirects unauthenticated users to `/login`. `PUBLIC_PATHS` whitelists login, pricing, and the checkout/webhook API routes. When editing cookie handling, preserve the exact `getAll`/`setAll` pattern — breaking it silently logs users out.
2. **`src/lib/requireSubscription.ts`** is the paywall. Every protected page (e.g. `dashboard/`) calls `await requireSubscription()`, which redirects to `/login` if signed out and `/pricing` if there is no `active` row in `subscriptions`. Middleware only checks *auth*; it does **not** check subscription — pages must call `requireSubscription` themselves.

### Billing flow (subscription row lifecycle)
`POST /api/checkout` creates a Polar checkout (passing `externalCustomerId: user.id`) and redirects to Polar. On return, `GET /api/checkout/confirm` immediately upserts an `active` subscription keyed by `user_id` (so access is granted without waiting for webhooks). `POST /api/webhooks/polar` is the source of truth long-term: it verifies the signature with `POLAR_WEBHOOK_SECRET` and updates the row by `polar_customer_id` on `subscription.active` / `canceled` / `revoked`.

### Data model (tables live in Supabase; no migrations in repo)
- `practices` — dental practices owned by a user (`user_id`, `name`, `npi`).
- `claims` — extracted claims (`practice_id`, `user_id`, `raw_notes`, `claim_data` JSON).
- `subscriptions` — one per user (`user_id`, `status`, `polar_customer_id`, `polar_subscription_id`, `current_period_end`).

Use the **supabase MCP server** (configured in `.mcp.json`) to inspect schema, run queries, and check RLS rather than guessing.

### Server vs client components
Pages are async Server Components that fetch via the server Supabase client. Interactive pieces are `"use client"` islands: `ClaimExtractor` / `ClaimHistory` (call `/api/extract-claim`), `AddPracticeForm`, `DeletePracticeButton`, `SignOutButton`, and the `login` page.

## Environment variables

Required (grep the noted files for usage):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `POLAR_ACCESS_TOKEN`, `POLAR_ENV` (`sandbox`|`production`), `POLAR_PRODUCT_ID`, `POLAR_WEBHOOK_SECRET`.
