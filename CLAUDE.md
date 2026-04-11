# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start development server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint check
```

No test suite is configured.

> **Note:** `next.config.js` sets `ignoreDuringBuilds: true` for ESLint, so lint errors won't block builds.

## Architecture

SpendTab is a financial management SaaS for small businesses built with **Next.js 15 App Router + TypeScript**. Core stack: Supabase (PostgreSQL + Auth), TanStack React Query, shadcn/ui + Tailwind CSS, React Hook Form + Zod.

### Route Structure

All authenticated routes live under `app/(dashboard)/` with a shared sidebar layout. Public routes: `/login`, `/signup`, `/reset-password`, `/payment` (subscription flow), `/invoice/[id]` (shareable invoice view).

API routes under `app/api/`:
- `/api/email/*` — Resend email sending
- `/api/payment/webhook` — Paystack payment webhook
- `/api/payment/success` — Payment confirmation

### Data Flow

```
Component → Custom Hook (lib/hooks/) → TanStack React Query → Supabase JS SDK → PostgreSQL
```

State management uses nested Context Providers (wrapped by `lib/context/DataProvider.tsx`). The hierarchy is:
`DataProvider → AccountProvider → CategoryProvider → TransactionProvider → BudgetProvider → ...`

All queries are scoped by `account_id` or `user_id`. React Query is configured with 5-minute stale time and 30-minute cache time. Custom event `account-changed` triggers cross-context data refresh on account switch.

### Multi-Account System

Users can own multiple accounts. The active account ID is stored in a cookie (`currentAccountId`). All database queries filter by this ID. Account switching dispatches a DOM custom event that all contexts listen to for refetch.

### Auth

Supabase Auth (email/password) via `@supabase/auth-helpers-nextjs`. Session is checked server-side on the root layout; unauthenticated users are redirected to `/login`. The Supabase client and all TypeScript DB types live in `lib/supabase.ts`.

### Key Patterns

- **Forms**: React Hook Form + Zod. Data entry happens in Dialog/Sheet components with Sonner toast feedback.
- **PDF generation**: `lib/invoice-pdf-generator.ts` uses jsPDF.
- **Payments**: Paystack (primary, webhook at `/api/payment/webhook`) + Polar API for subscription management.
- **Analytics**: PostHog with privacy-preserving rewrites configured in `next.config.js`.
- **TypeScript strictness**: `strictNullChecks` and `noImplicitAny` are both **disabled** in `tsconfig.json`. Path alias `@/*` maps to the repo root.

### Design System

Card accent colors: `#E6F1FD` (blue) and `#EDEEFC` (purple). Responsive grid: 1-col mobile → 2-col tablet → 4-col desktop. See `DESIGN-DOCUMENTATION.md` for full design tokens.
