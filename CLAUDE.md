# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**LookKuan** is a Thai-language POS and clothing store management system (ระบบจัดการร้านเสื้อผ้าครบวงจร) built with Next.js 14 App Router. Designed to be elderly-friendly with large fonts and high contrast. Core features: POS, inventory, embroidery job orders, customer CRM, sales reports, fraud detection, and RBAC.

## Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build (skips ESLint)
npm run lint         # Lint only

# Database (Supabase CLI)
npm run db:migrate   # Push migrations
npm run db:seed      # Seed data
npm run db:reset     # Reset DB

# E2E Tests (Playwright)
npm run test:e2e          # Run all tests (headless)
npm run test:e2e:ui       # Run with Playwright UI
npm run test:e2e:headed   # Run with browser visible

# Run a single test file
npx playwright test e2e/03-inventory.spec.ts

# Run a specific test by name
npx playwright test -g "test name here"
```

## Environment Setup

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from your Supabase project
- `NEXT_PUBLIC_STORE_NAME`, `NEXT_PUBLIC_STORE_PHONE`, `NEXT_PUBLIC_STORE_ADDRESS`, `NEXT_PUBLIC_TAX_RATE`

E2E tests also need `TEST_EMAIL` and `TEST_PASSWORD` in `.env.local`.

## Architecture

### Route Groups
- `(auth)/` — login and PIN-login pages (unauthenticated)
- `(dashboard)/` — all protected routes behind middleware auth check
- `track/[orderNumber]` — public order tracking (no auth)

### Data Flow Pattern
Pages are **server components** that fetch data directly via `src/lib/supabase/server.ts`. Interactive UI is extracted into **Client Components** in `src/components/`. This means:
- `page.tsx` files: server-side data fetching + pass data as props
- `*Client.tsx` components: all interactivity, state, event handlers

### Supabase Client Usage
- **Server components/actions** → `src/lib/supabase/server.ts` (cookie-based session)
- **Client components** → `src/lib/supabase/client.ts` (browser client)
- **Middleware** → `src/lib/supabase/middleware.ts` (session refresh)

### State Management
- **Cart state** — Zustand store at `src/stores/cartStore.ts` (POS cart operations)
- **Auth state** — `src/hooks/useAuth.ts` hook wrapping Supabase auth

### RBAC Roles
Defined in `src/types/database.ts`: `admin`, `manager`, `cashier`, `embroidery_staff`. Admin-only pages check role server-side.

### Styling Conventions
- Uses Tailwind with custom `pos-*` font size classes (`pos-sm` through `pos-3xl`) for elderly-friendly POS screens
- shadcn/ui components built on Radix UI primitives
- Primary brand color: orange
- Thai font: Sarabun (configured in `tailwind.config.ts`)
- Path alias: `@/*` maps to `src/*`

### Database
Schema lives in `supabase/migrations/00001_initial_schema.sql`. Key relationships:
- `products` → `product_variants` (size/color/SKU/barcode)
- `sales` → `sale_items` → `product_variants`
- `auth.users` → `profiles` (auto-created via trigger)
- `job_orders` track embroidery work with public `order_number` for tracking

### E2E Tests
Tests run sequentially (workers: 1). Auth state is persisted to `e2e/.auth/user.json` via `auth.setup.ts` which runs first. Tests use Thai-language UI labels. `playwright.config.ts` auto-starts the dev server.
