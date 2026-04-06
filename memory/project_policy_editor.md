---
name: Policy Editor implementation
description: TipTap rich text editor built for 9 HIPAA policy templates
type: project
---

Rich policy editor implemented on 2026-03-29. Route: `/dashboard/policies/[id]/edit`.

**Files created:**
- `lib/policy-editor-templates.ts` — 9 HTML templates + `fillPolicyTemplate()` helper
- `app/actions/policy-editor.ts` — `getLatestEditorContent`, `saveEditorDraft`, `activatePolicyWithSignature`, `archivePolicy`
- `app/(dashboard)/dashboard/policies/[id]/edit/page.tsx` — server page
- `components/policies/policy-editor-client.tsx` — full TipTap editor with toolbar, sidebar, signature modal, version history panel, PDF download

**TipTap extensions installed:** @tiptap/react, @tiptap/pm, @tiptap/starter-kit, extension-placeholder, extension-underline, extension-text-align, extension-highlight, extension-typography

**Why:** User requested Word/Google Docs-like editing experience for HIPAA policies with placeholder auto-fill, version history, electronic signatures, and PDF export.

**How to apply:** Placeholder format is `{{UPPER_SNAKE_CASE}}` — auto-filled from org profile, unfilled ones get amber highlight via inline style on `<mark>` tags.
