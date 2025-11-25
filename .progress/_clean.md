# Universal Maintenance / Cleanup Prompt

You are performing a recurring **maintenance, hardening, and cleanup pass** on this codebase.

Your role is to behave like a careful senior engineer and custodian of the project: you must keep it compiling, strongly typed, documented, tested, and aligned with its existing architecture and UI conventions.

Every time you receive this prompt, you MUST follow these rules.

---

## 0) Project context and non-negotiable constraints

This project is a modern **TypeScript / Node.js** application, typically with:

* Next.js (App Router) and React for the UI.
* Prisma (or another ORM) for database access.
* Stripe (or similar) for payments.
* MUI 7 for UI components in frontend apps.
* Jest / Vitest / Testing Library (or equivalent) for tests.

When you see a specific tech stack already present, **respect it**. Do not introduce entirely new frameworks or paradigms.

General constraints:

* Do **NOT** remove existing `console.log` or logging statements.
* Do **NOT** delete existing comments.
* Do **NOT** remove existing `// @ts-ignore` lines unless you are 100% sure the underlying issue is truly fixed and the ignore is no longer needed.
* Do **NOT** perform large-scale rewrites or reorganizations unless absolutely required to fix a hard error.
* Do **NOT** create new top-level folders other than the ones already described in this prompt.

### MUI / frontend rules (when this project uses MUI)

If the project uses MUI 7:

* Always import `Grid` from `@mui/material`.

* NEVER import or use `@mui/material/Unstable_Grid2`.

* Use the **new Grid sizing API**:

  * ✅ `<Grid size={{ xs: 12, md: 6 }}>`
  * ❌ Do not use `<Grid item xs={12} md={6}>`.

* Use grouped imports:

  ```ts
  import { Box, Typography, Container, Stack, Grid } from "@mui/material";
  ```

* Always use MUI icons from `@mui/icons-material`.

* Primary actions: `variant="contained"`.

* Cancel / secondary / escape actions: `variant="outlined"`.

* For buttons with icons, use `startIcon={<SomeIcon />}`.

**TextField rules**:

* Prefer `slotProps` rather than `inputProps`.

* For adornments, follow:

  ```tsx
  slotProps={{
    input: {
      endAdornment: (...),
    },
  }}
  ```

* Do NOT use deprecated props like `PaperProps` or `primaryTypographyProps`; use modern `slotProps` and current MUI patterns instead.

### Auth / session rules (when NextAuth is present)

* Always use `getServerSession` from `"next-auth/next"` for server-side session retrieval.
* Do not introduce new ad-hoc session mechanisms.

### Notifications

* Use `react-hot-toast` for user notifications.
* Do NOT use `alert`, `confirm`, or other blocking browser dialogs for UX.

### TypeScript / React discipline

* Do not weaken types to `any` unless absolutely necessary and clearly justified by the surrounding code.
* Only add comments at the top of functions summarizing inputs and outputs; do not add tutorial-style comments inside functions.
* Where React 19’s `use` hook is already used, follow existing patterns; do not introduce it in isolated places that break local conventions.

---

## 1) Guarantee the project builds and type-checks

Every maintenance run, conceptually:

1. **Database prep (if applicable)**

   * If the project has a script like `npm run db` (migrations/seed), conceptually run it before `npm run build`.
   * Fix obvious schema/code mismatches where feasible.

2. **Build verification**

   * Conceptually run `npm run build`:

     * Identify all modules that would fail the Next.js / Node / bundler build.
     * Open those files and resolve the underlying issues (imports, env usage, missing exports, obvious runtime errors).
   * Ensure there are no unhandled fatal build errors.

3. **TypeScript checking**

   * Conceptually run `tsc` with the project’s `tsconfig`:

     * Fix type errors you can infer, including:

       * Broken imports/exports.
       * Incorrect prop types or function signatures.
       * Mismatched generics.
       * Obvious dead or unreachable code that blocks compilation.

Domain-level focus (especially for commerce projects like Smart Cart):

* Tenants / stores and isolation (no cross-tenant data leakage).
* Products, variants, pricing, and stock.
* Carts, line items, discounts, taxes, and totals.
* Checkout flows, Stripe payment intents, webhooks, and error handling.
* Users, roles, and permissions (merchant vs shopper vs admin).

Type organization:

* Keep domain types in shared type modules (e.g. `src/types.ts` or similar).
* Reuse these types instead of duplicating object shapes in multiple files.
* Remove types only if you are certain they are not part of any public interface and have no remaining usages.

Prisma / database:

* Ensure Prisma (or other ORM) types and queries match the current schema.
* When code references fields or models that no longer exist, adjust the code to fit the schema rather than making up new schema elements.

Stripe (if present):

* Ensure Stripe SDK usage matches the installed version and respects test/live modes.
* Keep keys, secrets, and config in environment variables, never inlined.
* Do not disrupt existing Connect/onboarding flows; instead, fix and extend them.

---

## 2) Prompt and progress system: `.prompts` → `.progress`

This project uses a **two-stage system** for instructions and progress:

### 2.1 `.prompts/` – raw instructions

* `.prompts/` contains **high-level prompts and plans**.
* As you **complete** a prompt (or a major part of it):

  * Convert its content into more permanent documentation under `.progress/` (see below).
  * Once a prompt is fully executed and reflected in `.progress`, you may **delete** or archive that original prompt file from `.prompts/`.

Goal: `.prompts/` should contain **only active / not-yet-executed** instructions.

### 2.2 `.progress/` – status, TODOs, audits, archive

Under `.progress/`, the standard structure is:

```text
.progress/
  _latest.md           # single file with last run summary
  _todo/               # categorized TODOs for ongoing work
  _audit/              # audit notes, coverage gaps, findings
  _done/               # archived, fully completed prompts/tasks
```

#### `.progress/_latest.md`

* This replaces any old `RECENT.md`.
* On each maintenance run, update **only this file** with:

  * A timestamp (human-readable).
  * A concise summary of what you changed/fixed.
  * Key TODOs or follow-ups identified in this run (linked to `_todo` entries when relevant).
* `_latest.md` always reflects the **most recent maintenance pass**.

#### `.progress/_todo/`

* This is where active work items live, grouped by area.

* For example, for Smart Cart or similar projects, you might maintain files or subfolders for:

  * `PLUGINS`
  * `GENERAL`
  * `SYSTEM`
  * `PAYMENTS`
  * `THEMES`
  * `STORE`
  * `DESIGN`

* Inside each category (e.g. `.progress/_todo/PLUGINS.md` or `.progress/_todo/PLUGINS/*.md`), keep **bullet lists** of outstanding tasks:

  * Each bullet should be concise but specific: what to implement, where, and what is “done”.

* When you discover new unfinished work during a maintenance run:

  * Add bullets to the appropriate category under `_todo`.

> The old root-level `TODO/` folder is deprecated.
> Use **only** `.progress/_todo` for structured TODOs.

#### `.progress/_audit/`

* Use `_audit` for deeper inspections:

  * Missing tests.
  * Inconsistent patterns.
  * Security or performance concerns.
* These are “findings” rather than step-by-step tasks.
* Keep each audit file focused (e.g. `tests.md`, `security.md`, `performance.md`).

#### `.progress/_done/`

* When a major prompt or feature is **truly 100% complete**:

  * Move its detailed instructions / resolution summary into `_done` as an archive.
  * You may mirror the category structure here as well (e.g. `PLUGINS`, `SYSTEM`, etc.).
* This directory is the “history” of completed work.

---

## 3) Documentation (codebase + README system)

### 3.1 `.docs` layout

* Use only the existing `.docs` tree (no new top-level directories under `.docs`).
* The main overview is `.docs/README.md`:

  * It must list **every major feature** with:

    * A one-sentence description.
    * A link to its guide or reference doc.

**Feature guides**:

* For each non-trivial feature you create or significantly modify:

  * Create or update a markdown file in `.docs/guides/`.
  * Each guide should explain:

    * What the feature does.
    * Where its main entrypoints/components live (pages, routes, key modules).
    * How to use it locally (env vars, test data, flags).
    * How to extend it (e.g. add a new payment method, AI flow, plugin type).

**Reference docs**:

* For cross-cutting configuration and schemas:

  * Use `.docs/references/`.
  * Explain:

    * Schema/fields for key config objects and types.
    * How core systems connect (tenants ↔ products ↔ carts ↔ orders ↔ payments ↔ AI).
    * Any central config files (e.g. env var mapping, AI provider config).

### 3.2 Every README must have a `## Testing` section

For every README you touch (whether in `src/`, `apps/`, `packages/`, or `.docs`):

* Ensure there is a `## Testing` section that includes:

  * Links or paths to the UI pages/routes where this feature can be exercised manually.
  * 1–3 short sentences describing **what to look for** during manual testing:

    * e.g. “Go to `/admin/products`. Verify that adding a new product validates required fields and shows a toast on success.”
* These are **manual test checklists**, not exhaustive QA scripts.
  They exist so you (or a human) can quickly confirm the feature is working.

---

## 4) Tests – keep them aligned with implementation

Use the project’s preferred stack (Jest, Vitest, Testing Library, Playwright/Cypress, etc.). Do not introduce a second parallel test framework.

For any substantial logic change, especially around:

* Cart calculations (discounts, taxes, totals, shipping).
* Multi-tenant boundaries and access control.
* Stripe/payment flows, webhooks, and errors.
* AI features (recommendations, search, RAG, autosuggest).
* Shared domain types used across modules.

You must:

1. **Add or update tests** in existing locations:

   * Do NOT create new test folder hierarchies; follow the existing structure.
2. **Cover at least**:

   * A happy-path scenario.
   * At least one meaningful edge case (empty state, permissions failure, Stripe failure, etc.).
3. If existing tests fail because of your changes:

   * Update them to reflect the intended behavior.
   * Do not delete tests merely to “make it green” unless they are truly obsolete.

Conceptually ensure `npm test` (or `pnpm test` / `yarn test`) passes after your changes.

---

## 5) Frontend & UI discipline

When modifying or adding UI components:

* Preserve the project’s visual language:

  * Spacing, typography, color palette (e.g. dark, electric blue for Smart Cart).
  * Consistent use of layout primitives (`Grid`, `Stack`, `Box`).
* Prefer small, reusable components over huge monoliths.
* Respect existing patterns for:

  * Product listing cards.
  * Cart UI (drawer/panel).
  * Checkout forms and summary blocks.
  * Admin dashboards and charts.

Forms:

* Use the form library already present (React Hook Form, Formik, etc.).
* Keep client-side validation aligned with server-side validation (Yup, Zod, etc.).
* Use `slotProps` for advanced TextField behavior and adornments.

UX:

* Replace legacy alerts with `react-hot-toast` or equivalent.
* Ensure async actions have clear loading/disabled states.

---

## 6) Code cleanup without architectural upheaval

You MAY:

* Refactor small pieces for clarity, typing, or reuse.
* Extract helper functions.
* Improve naming for readability.
* Consolidate duplicated logic where appropriate (e.g. price calculation, tax computation).

You MAY NOT:

* Introduce new top-level folders beyond what is described here.
* Move large swaths of files around.
* Replace major architectural patterns (e.g. data-fetching strategy) unless you are fixing a critical, structural bug.

Comments:

* Only add short, professional comments at the top of functions summarizing inputs and outputs.
* Do not add tutorial-style explanations or “teaching” comments.

---

## 7) Dependency and CLI hygiene

Conceptually run and honor existing scripts:

* `npm install` (or `pnpm install` / `yarn`) when new dependencies are needed.
* `npm run db` (if present) **before** `npm run build` to ensure schema and seed state are valid.
* `npm run lint` and fix lint errors where practical.
* `npm run build` to confirm build is clean.
* `npm test` to confirm tests pass.

When updating dependencies, especially for security:

* Prefer targeted version bumps rather than indiscriminate “latest” upgrades.
* If you conceptually run `npm audit`, handle critical issues with deliberate version changes, not random upgrades that might break the app.

---

## 8) End-of-run reporting and `.progress` updates

At the end of each maintenance run, you MUST produce a concise summary that could serve as a commit message and keep `.progress` up to date.

### 8.1 Summary content

Include:

* Which build or type errors you fixed (by area or key files).
* Which docs you added or updated:

  * `.docs/README.md`
  * `.docs/guides/...`
  * `.docs/references/...`
  * Any other README files, especially noting new `## Testing` sections.
* Which tests you added or updated and what they cover.
* Any notable refactors or changes to critical flows:

  * Authentication / session handling.
  * Tenancy logic.
  * Cart / checkout / payments.
  * AI-driven features.
  * Plugin / module systems.

### 8.2 Update `.progress/_latest.md`

* Overwrite or update `.progress/_latest.md` with:

  * Date/time in human-readable form.
  * Bullet list of key changes (from the summary above).
  * Links or references to any `_todo`, `_audit`, `_done` files touched.

### 8.3 Update `.progress/_todo/`, `_audit/`, `_done/`

* For **remaining work** you discovered:

  * Add concise bullets under the appropriate `.progress/_todo` category (PLUGINS, SYSTEM, PAYMENTS, THEMES, STORE, DESIGN, etc.).
* For **completed major prompts/tasks**:

  * Move or recreate their final description under `.progress/_done` (mirroring the category structure).
* For **audits/findings**:

  * Add or update files under `.progress/_audit` (tests, security, performance) to reflect any gaps you intentionally did not fix in this run.

---

// ⬇️ OpenAPI/Swagger sync reminder for all projects

/**
 * Smart Cart uses OpenAPI 3.0.3 with Swagger UI for API documentation.
 *
 * Whenever you add, move, or remove an API route under:
 *   - src/app/api/**/route.ts
 *
 * You MUST keep the OpenAPI spec in sync:
 *   - OpenAPI spec:     src/lib/openapi/spec.ts              → served at /api/openapi.json
 *   - Swagger UI:       src/app/api-docs/page.tsx            → accessible at /api-docs
 *
 * Maintenance rules:
 * 1. Scan src/app/api for any new or changed routes.
 * 2. If a route is missing from the OpenAPI spec, add it:
 *      - Add path definition to appropriate route file in src/lib/openapi/routes/
 *        (e.g., orders.ts, cart.ts, plugins.ts) or add to main spec.ts
 *      - Include: path, method(s), request/response schemas, authentication requirements
 *      - Import and merge into main spec.ts paths object
 * 3. The spec is modular - create new route files in src/lib/openapi/routes/ for organization
 * 4. After updating, verify:
 *      - /api/openapi.json returns valid OpenAPI 3.0 JSON
 *      - /api-docs displays the new routes in Swagger UI
 * 5. Key files:
 *      - src/lib/openapi/spec.ts              - Main OpenAPI specification
 *      - src/lib/openapi/routes/*.ts          - Route definitions (modular)
 *      - src/app/api/openapi.json/route.ts    - Spec endpoint
 *      - src/app/api-docs/page.tsx            - Swagger UI page
 */

## TESTS

Do not build tests right now, but put missing tests into _missing-tests.md in .progress


We will keep track of tests to build here
## missing-features.md

after cleanup, put missing features into this file. mark off anything completed and update the file with time with AM or PM.

## the _MASTER-PROGRESS.md file should also be updated, high level, what has been done, what needs to be done as far as ALL features.

time stamp am pm, eastern time and date of last updat ewith percentage

Treat every run of this prompt as production maintenance on a revenue-generating system: stability, clarity, and correctness are always more important than being clever.


Use only the newest version of MUI for all components and layouts. Never use Grid2 or any Unstable_Grid variants under any circumstance. All responsive structure must rely exclusively on the standard @mui/material/Grid component with the modern size={{}} breakpoint syntax. This rule is absolute and applies globally across the entire codebase.
