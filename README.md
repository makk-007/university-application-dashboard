# Application Tracker

A full-stack web application for tracking university and scholarship applications across multiple intake cycles - deadlines, requirements, funding, and outcomes, all in one place.

Built with **React + TypeScript + Tailwind CSS** on the frontend and **Supabase** (PostgreSQL + Auth + Row Level Security) on the backend.

---

## Setup Instructions

**Prerequisites:** Node.js 22.13 or newer (24 also works) and npm. Vite alone only needs Node 20.19+, but the test runner and linter need 22.13+. You also need a free [Supabase](https://supabase.com) account.

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a new project - choose a region close to you.
3. Wait for the project to provision (about a minute).

### 2. Run the Database Schema

1. In your Supabase dashboard, open **SQL Editor** in the left sidebar.
2. Open `supabase/schema.sql` from this project, copy its full contents, and run it in the SQL Editor. This creates every table, index, trigger, and RLS policy in one pass. It is safe to re-run: triggers and policies are recreated, and existing tables and data are left as they are.
3. If you are upgrading an **existing** database rather than starting fresh, run the numbered files in `supabase/migrations/` in order instead (`001_...` through `005_...`). Each one is idempotent and safe to re-run.

### 3. Configure Environment Variables

1. Copy the example env file:

   ```bash
   cp .env.example .env
   ```

2. In Supabase, go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

3. Your `.env` should look like:
   ```
   VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 4. Enable Email Auth in Supabase

1. Go to **Authentication → Providers** and confirm **Email** is enabled (it is by default).
2. For local development, you can disable "Confirm email" under **Authentication → Settings** to skip email verification while testing.

### 5. Install Dependencies & Run

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173), create an account, and start tracking.

### 6. Building for Production

```bash
npm run build
```

Output is written to `dist/`, ready to deploy to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Set the same two `VITE_SUPABASE_*` environment variables in your hosting provider's dashboard.

---

### 7. Quality Checks

```bash
npm run typecheck   # TypeScript, strict mode
npm run lint        # ESLint (errors fail CI; warnings are tracked)
npm test             # Vitest: utilities and service failure paths
npm run build       # Production build (needs the VITE_SUPABASE_* variables)
```

The same checks run on every push to `main` and on pull requests through GitHub Actions (`.github/workflows/ci.yml`).

---

## Architecture

```
Pages and components  ->  Services (data access)  ->  Typed Supabase client  ->  PostgreSQL + RLS
        ^
 Contexts: auth, cycle, theme, undoable deletes
```

- **Layers.** Pages and components own the UI and local state. All database access goes through `src/services/` (one file per entity), which maps database rows to the app's types in `src/app/types.ts`. Services use a single Supabase client typed with generated definitions (`lib/database.types.ts`), so a renamed column shows up as a type error instead of a runtime surprise.
- **Security.** Row Level Security enforces `auth.uid() = user_id` on every table. The user id the client reads from its local session (`services/session.ts`, no network call) is only used to filter and stamp rows, never to authorize anything.
- **Failure-safe writes.** Multi-step operations check every result and compensate: a record whose checklist insert fails is removed, scholarship links are added before stale ones are removed, and a failed active-cycle switch restores the previous active cycle. Edits are checked against the record's last-known update time, so a stale tab cannot silently overwrite newer changes.
- **Routing and loading.** Pages are lazy-loaded, so the sign-in screen does not download the charting library. Route errors, including a page that fails to load, fall through to the app-level error boundary.
- **Shared UI.** Reusable pieces (pagination, modal shell, status selector, bulk-action bar, editable fields, checklist editor) live in `components/`; page-specific logic stays in the page.
- **Testing and CI.** Vitest covers the pure utilities (CSV, import validation, deadline logic, currencies, calendar export, pagination) and the services' failure paths against an in-memory Supabase stand-in (`src/test/fakeSupabase.ts`). GitHub Actions runs typecheck, lint, tests, and a build on every push to `main` and every pull request.

---

## Project Structure

```
.github/workflows/ci.yml                     # Typecheck, lint, test, build on push and PR
src/
├── main.tsx
├── app/
│   ├── App.tsx                              # Providers + router
│   ├── routes.tsx                           # Lazy-loaded routes
│   ├── types.ts                             # Shared TypeScript types
│   ├── components/
│   │   ├── Layout.tsx                       # Sidebar nav + auth guard
│   │   ├── KPICard.tsx                      # Dashboard metric cards
│   │   ├── StatusBadge.tsx                  # Status pill (9 statuses)
│   │   ├── OverdueBadge.tsx                 # Computed staleness indicator
│   │   ├── CycleSelector.tsx                # Active-cycle / All Cycles switcher
│   │   ├── CycleManagementCard.tsx          # Cycle CRUD, archive, close-out review
│   │   ├── DataManagementCard.tsx           # CSV/JSON export, CSV import
│   │   ├── DuplicateToCycleModal.tsx        # Single + bulk duplicate to a cycle
│   │   ├── DuplicateCycleModal.tsx          # Duplicate an entire cycle's contents
│   │   ├── ConfirmDeleteModal.tsx           # Single-item delete confirmation
│   │   ├── BulkDeleteConfirmModal.tsx       # Multi-select delete confirmation
│   │   ├── StatusTransitionConfirmModal.tsx # Confirms leaving Accepted/Awarded
│   │   ├── StatusHistorySection.tsx         # Collapsible status-change timeline
│   │   ├── AmountHistorySection.tsx         # Collapsible tuition/amount timeline
│   │   ├── PageTransition.tsx               # Route transition wrapper
│   │   ├── ErrorBoundary.tsx                # App-level error screen
│   │   ├── RouteFallback.tsx                # Themed blank screen on first page load
│   │   ├── RouteError.tsx                   # Sends route errors to ErrorBoundary
│   │   ├── Pagination.tsx                   # Shared pager for list pages
│   │   ├── StatusSelector.tsx               # Status buttons in detail drawers
│   │   ├── ModalShell.tsx                   # Backdrop, card, and header for add modals
│   │   ├── BulkActionBar.tsx                # "N selected" bar with bulk actions
│   │   ├── EditableName.tsx                 # Click-to-edit drawer heading
│   │   ├── EditableLink.tsx                 # Drawer URL field with save indicator
│   │   ├── ChecklistEditor.tsx              # Drag-to-reorder requirements checklist
│   │   └── ui/                              # Small shadcn-style primitives (button, dropdown, alert dialog, ...)
│   ├── context/
│   │   ├── AuthContext.tsx                  # Supabase auth state
│   │   ├── CycleContext.tsx                 # Active/selected cycle state
│   │   ├── ThemeContext.tsx                 # Light/dark theme
│   │   └── UndoableDeleteContext.tsx        # App-wide undo-toast delete queue
│   ├── hooks/
│   │   ├── useEscapeKey.ts                  # Esc-to-close for custom overlays
│   │   └── usePersistedFilterState.ts       # localStorage-backed filter/sort state
│   ├── utils/                               # Unit tests (*.test.ts) sit next to each file
│   │   ├── statusConfig.ts                  # Status labels, colors, icons, helpers
│   │   ├── currencies.ts                    # Built-in + user-added currency list
│   │   ├── csv.ts                           # CSV parse/serialize (no dependency)
│   │   ├── dataExport.ts                    # JSON backup + CSV export builders
│   │   ├── dataImport.ts                    # CSV import parsing & validation
│   │   ├── icsExport.ts                     # .ics calendar file generation
│   │   ├── notifications.ts                 # Browser Notification API wrapper
│   │   └── pagination.ts                    # Page-button and ellipsis logic
│   ├── pages/
│   │   ├── Auth.tsx                         # Sign in / sign up
│   │   ├── DashboardOverview.tsx            # KPIs, charts, deadlines, activity feed
│   │   ├── Universities.tsx                 # List, filters, detail drawer
│   │   ├── Scholarships.tsx                 # List, funding charts, detail drawer
│   │   ├── Timeline.tsx                     # Gantt-style application timeline
│   │   └── Settings.tsx                     # Cycles, data, currencies, account
│   └── lib/
│       ├── supabase.ts                      # Typed Supabase client
│       └── database.types.ts                # Generated DB types (supabase gen types)
├── services/                                # Data access layer (one file per entity)
│   ├── universities.ts                      # CRUD, duplicate, bulk delete, import
│   ├── scholarships.ts                      # CRUD, duplicate, bulk delete, import
│   ├── cycles.ts                            # CRUD, archive, duplicate, close-out
│   ├── statusHistory.ts                     # Status-change log + activity feed
│   ├── amountHistory.ts                     # Tuition/amount change log
│   ├── session.ts                           # Current user id from the local session
│   ├── errors.ts                            # Error parsing + ConflictError
│   └── writes.test.ts                       # Failure-path tests for multi-step writes
├── test/
│   └── fakeSupabase.ts                      # In-memory Supabase stand-in for tests
└── styles/
    ├── index.css
    ├── tailwind.css
    ├── theme.css                            # Design tokens (light + dark)
    └── fonts.css
supabase/
├── schema.sql                               # Full schema (fresh install, safe to re-run)
└── migrations/                              # Incremental migrations (existing DB)
    ├── 001_add_withdrawn_status.sql
    ├── 002_add_cycle_archived_flag.sql
    ├── 003_add_status_history.sql
    ├── 004_add_amount_history.sql
    └── 005_add_checklist_sort_order.sql
```

---

## Features

### Core tracking

- **Universities & Scholarships** - full CRUD with autosaving inline edits, requirement checklists with progress bars, notes, and application links.
- **9 application statuses** - Not Yet Open, Not Started, In Progress, Submitted, Accepted, Rejected, Waitlisted, Awarded, and Withdrawn.
- **Application cycles** - every university and scholarship belongs to a named cycle (e.g. "Fall 2026"); switch between a single cycle or an "All Cycles" combined view at any time.

### Cycle lifecycle

- Create, edit, set active, archive, restore, and permanently delete cycles, with linked-record counts shown before any destructive action.
- **Duplicate to another cycle** - copy a single university or scholarship (with its full checklist) into a different cycle as an independent record, or duplicate an entire cycle's contents in one action. Eliminates re-entering recurring applications every intake.
- **Bulk operations** - multi-select checkboxes on both list pages support bulk duplicate and bulk delete, with a single atomic bulk-delete request and a clear summary of any failures.
- **End-of-cycle close-out** - cycles past their end date are flagged with a one-click review showing final outcomes (accepted/rejected/pending, scholarships awarded, funding secured) and a direct path to archive.

### Dashboard & reporting

- KPI cards, status breakdown charts, and a per-cycle outcomes table (universities and scholarships) in the All Cycles view.
- **Upcoming Deadlines** - strictly scoped to In Progress applications due within 15 days, with empty-state handling.
- **Upcoming Applications** - not-yet-open universities and scholarships, soonest opening first.
- **Funding charts** - total potential funding per university, plus a stacked breakdown view showing exactly which scholarship contributes what, with tooltips and a legend.
- **Recent Activity feed** - the latest status changes across every university and scholarship, most recent first.
- **Overdue indicator** - a computed, non-destructive badge for applications whose deadline has passed while still Not Started or In Progress; never alters the stored status.

### Data integrity & safety

- **Undo-toast deletion** - single-item deletes remove instantly from view with a 6-second undo window before the real delete commits, surviving navigation away from the page.
- **Bulk delete confirmation** - multi-record deletes require an explicit, non-undoable confirmation stating the exact count.
- **Status-transition confirmation** - changing away from Accepted or Awarded prompts for confirmation, since it replaces a finalized outcome; every other transition applies immediately.
- **Multi-tab conflict detection** - edits are checked against the record's last-known update time before saving; if another tab changed the record first, the save is rejected with a clear message instead of silently overwriting it.
- **Status & amount history** - every status change and every tuition/amount change is logged with a timestamp and viewable per record.

### Data portability & notifications

- **Export** - full JSON backup (every field, every cycle) or flattened CSV exports for universities and scholarships.
- **Import** - CSV import with a preview step showing valid/skipped row counts and reasons before committing; never overwrites existing records.
- **Calendar export** - download an .ics file of upcoming deadlines, importable into Google Calendar, Outlook, or Apple Calendar.
- **Browser notifications** - opt-in deadline alerts while the app is open in a tab (not background push).

### Personalization

- Light/dark theme, persisted filter and sort preferences per page, a custom currency list (code + GHS exchange rate) on top of the built-in defaults, and a Timeline page with a Gantt-style view of every application window.

---

## Security

Every table has Row Level Security enabled. Policies scope all reads and writes to `auth.uid()`, so a user can only ever see and modify their own data - this is enforced at the database level, not just in the UI. The Supabase anon key is safe to expose in the frontend bundle: it identifies the project, not a privileged credential, and RLS cannot be bypassed with it.

---

## Tech Stack

| Layer         | Technology                                                     |
| ------------- | -------------------------------------------------------------- |
| Frontend      | React 18 + TypeScript (strict)                                 |
| Styling       | Tailwind CSS v4                                                |
| UI Components | shadcn-ui patterns, Radix UI (alert dialog, dropdown menu)     |
| Animation     | Motion (Framer Motion)                                         |
| Charts        | Recharts                                                       |
| Toasts        | Sonner                                                         |
| Routing       | React Router v7 (lazy-loaded routes)                           |
| Backend       | Supabase (PostgreSQL)                                          |
| Auth          | Supabase Auth                                                  |
| Build         | Vite                                                           |
| Testing       | Vitest                                                         |
| Linting       | ESLint, typescript-eslint, React Hooks rules                   |
| CI            | GitHub Actions (typecheck, lint, test, build)                  |

No external CSV, calendar, or notification libraries are used - those are implemented directly in `src/app/utils/` to keep the dependency footprint minimal.

---

## Database Migrations

The `supabase/migrations/` folder tracks incremental schema changes applied after the original schema:

| File                               | Adds                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `001_add_withdrawn_status.sql`     | `withdrawn` application status                                         |
| `002_add_cycle_archived_flag.sql`  | Explicit `is_archived` flag on cycles, distinct from `is_active`       |
| `003_add_status_history.sql`       | `status_history` table for status-change logging and the activity feed |
| `004_add_amount_history.sql`       | `amount_history` table for tuition/amount change logging               |
| `005_add_checklist_sort_order.sql` | `sort_order` on both checklist tables, backfilled in creation order    |

A fresh install via `schema.sql` already includes all of the above - the migration files are only needed when upgrading a database that was provisioned before a given change shipped.

After any schema change, regenerate the typed client definitions so the services stay in sync with the database:

```bash
npx supabase login
npx supabase gen types typescript --project-id <your-project-ref> > src/app/lib/database.types.ts
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

---

## License

This project is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). You're free to use, modify, and distribute it for any noncommercial purpose. Commercial use requires permission from the licensor.
