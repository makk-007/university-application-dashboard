# Application Tracker

A full-stack web application for tracking university and scholarship applications across multiple intake cycles - deadlines, requirements, funding, and outcomes, all in one place.

Built with **React + TypeScript + Tailwind CSS** on the frontend and **Supabase** (PostgreSQL + Auth + Row Level Security) on the backend.

---

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a new project - choose a region close to you.
3. Wait for the project to provision (about a minute).

### 2. Run the Database Schema

1. In your Supabase dashboard, open **SQL Editor** in the left sidebar.
2. Open `supabase/schema.sql` from this project, copy its full contents, and run it in the SQL Editor. This creates every table, index, trigger, and RLS policy in one pass.
3. If you are upgrading an **existing** database rather than starting fresh, run the numbered files in `supabase/migrations/` in order instead (`001_...` through `004_...`). Each one is idempotent and safe to re-run.

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

## Project Structure

```
src/
├── app/
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
│   │   └── ErrorBoundary.tsx
│   ├── context/
│   │   ├── AuthContext.tsx                  # Supabase auth state
│   │   ├── CycleContext.tsx                 # Active/selected cycle state
│   │   ├── ThemeContext.tsx                 # Light/dark theme
│   │   └── UndoableDeleteContext.tsx        # App-wide undo-toast delete queue
│   ├── hooks/
│   │   ├── useEscapeKey.ts                  # Esc-to-close for custom overlays
│   │   └── usePersistedFilterState.ts       # localStorage-backed filter/sort state
│   ├── utils/
│   │   ├── statusConfig.ts                  # Status labels, colors, icons, helpers
│   │   ├── currencies.ts                    # Built-in + user-added currency list
│   │   ├── csv.ts                           # CSV parse/serialize (no dependency)
│   │   ├── dataExport.ts                    # JSON backup + CSV export builders
│   │   ├── dataImport.ts                    # CSV import parsing & validation
│   │   ├── icsExport.ts                     # .ics calendar file generation
│   │   └── notifications.ts                 # Browser Notification API wrapper
│   ├── pages/
│   │   ├── Auth.tsx                         # Sign in / sign up
│   │   ├── DashboardOverview.tsx            # KPIs, charts, deadlines, activity feed
│   │   ├── Universities.tsx                 # List, filters, detail drawer
│   │   ├── Scholarships.tsx                 # List, funding charts, detail drawer
│   │   ├── Timeline.tsx                     # Gantt-style application timeline
│   │   └── Settings.tsx                     # Cycles, data, currencies, account
│   ├── lib/supabase.ts                      # Typed Supabase client
│   ├── routes.tsx
│   └── types.ts                             # Shared TypeScript types
├── services/                                # Data access layer (one file per entity)
│   ├── universities.ts                      # CRUD, duplicate, bulk delete, import
│   ├── scholarships.ts                      # CRUD, duplicate, bulk delete, import
│   ├── cycles.ts                            # CRUD, archive, duplicate, close-out
│   ├── statusHistory.ts                     # Status-change log + activity feed
│   ├── amountHistory.ts                     # Tuition/amount change log
│   └── errors.ts                            # Error parsing + ConflictError
└── styles/
supabase/
├── schema.sql                               # Full schema (fresh install)
└── migrations/                               # Incremental migrations (existing DB)
    ├── 001_add_withdrawn_status.sql
    ├── 002_add_cycle_archived_flag.sql
    ├── 003_add_status_history.sql
    └── 004_add_amount_history.sql
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

| Layer         | Technology                              |
| ------------- | --------------------------------------- |
| Frontend      | React 18 + TypeScript                   |
| Styling       | Tailwind CSS v4                         |
| UI Components | Radix UI primitives, shadcn-ui patterns |
| Animation     | Motion (Framer Motion)                  |
| Charts        | Recharts                                |
| Toasts        | Sonner                                  |
| Routing       | React Router v7                         |
| Backend       | Supabase (PostgreSQL)                   |
| Auth          | Supabase Auth                           |
| Build         | Vite                                    |

No external CSV, calendar, or notification libraries are used - those are implemented directly in `src/app/utils/` to keep the dependency footprint minimal.

---

## Database Migrations

The `supabase/migrations/` folder tracks incremental schema changes applied after the original schema:

| File                              | Adds                                                                   |
| --------------------------------- | ---------------------------------------------------------------------- |
| `001_add_withdrawn_status.sql`    | `withdrawn` application status                                         |
| `002_add_cycle_archived_flag.sql` | Explicit `is_archived` flag on cycles, distinct from `is_active`       |
| `003_add_status_history.sql`      | `status_history` table for status-change logging and the activity feed |
| `004_add_amount_history.sql`      | `amount_history` table for tuition/amount change logging               |

A fresh install via `schema.sql` already includes all of the above - the migration files are only needed when upgrading a database that was provisioned before a given change shipped.
