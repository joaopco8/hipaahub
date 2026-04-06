---
name: HIPAA Hub project overview
description: Core project facts about HIPAA Hub SaaS platform
type: project
---

HIPAA Hub is a HIPAA compliance SaaS platform built with Next.js 14 (App Router), Supabase, Stripe, shadcn/ui, Tailwind, and pnpm.

**Why:** Helps healthcare organizations achieve and maintain HIPAA compliance.

**Key facts:**
- Package manager: pnpm (not npm/yarn)
- DB: Supabase (PostgreSQL) with RLS; uses `(supabase as any)` for tables not in generated types
- Auth: Supabase SSR
- UI: shadcn/ui + Radix + Lucide icons + Tailwind
- PDF: jspdf (^4.0.0) already installed — use this for PDF generation
- Plan gating: `ActionGate` component + `useSubscription()` context
- Dashboard route group: `app/(dashboard)/dashboard/`
- 9 HIPAA policy templates pre-loaded (IDs 1–9)
- Policy DB tables: `generated_policy_documents`, `policy_versions`, `policy_attachments`
- Color palette: `#0e274e` (navy), `#00bceb` (cyan), `#71bc48` (green), `#565656` (gray)

**How to apply:** Always use pnpm; follow existing color palette; use ActionGate for paid features; use `(supabase as any)` for extended tables.
