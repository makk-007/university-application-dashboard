# Masters Application Tracker : Full Stack

A full-stack application for tracking graduate school applications, scholarships, deadlines, and checklists.

Built with **React + TypeScript + Tailwind CSS** on the frontend and **Supabase** (PostgreSQL + Auth + RLS) on the backend.

---

## 🚀 Setup Instructions

### 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project : choose a region close to you
3. Wait for the project to provision (~1 min)

### 2. Run the Database Schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar
2. Open the file `supabase/schema.sql` from this project
3. Paste the entire contents into the SQL editor
4. Click **Run** : all tables, RLS policies, and indexes will be created

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

1. Go to **Authentication → Providers**
2. Make sure **Email** is enabled (it is by default)
3. For local development, you can disable "Confirm email" under **Authentication → Settings**

### 5. Install Dependencies & Run

```bash
# Install dependencies (use pnpm, npm, or yarn)
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173)
7. Create an account and start tracking!

---

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Layout.tsx           # Sidebar + auth guard
│   │   ├── KPICard.tsx          # Metric cards
│   │   └── StatusBadge.tsx      # Status pill badges
│   ├── context/
│   │   └── AuthContext.tsx      # Supabase auth state
│   ├── lib/
│   │   └── supabase.ts          # Typed Supabase client
│   ├── pages/
│   │   ├── Auth.tsx             # Login / Signup
│   │   ├── DashboardOverview.tsx
│   │   ├── Universities.tsx     # List + detail panel
│   │   ├── Scholarships.tsx     # List + funding overview
│   │   ├── Timeline.tsx         # Gantt-style view
│   │   └── Settings.tsx
│   ├── types.ts                 # TypeScript types
│   └── utils/
│       └── statusConfig.ts      # Status labels + colors
├── services/                    # Data access layer
│   ├── universities.ts          # University CRUD + checklist
│   └── scholarships.ts          # Scholarship CRUD + checklist
└── styles/
supabase/
└── schema.sql                   # Complete DB schema with RLS
```

---

## ✅ Features

- **Authentication** : Email/password sign in & sign up via Supabase Auth
- **Row Level Security** : Each user can only see and modify their own data
- **Universities** : Add, view, filter (by region + status), and delete
- **University Detail Panel** : Status update, autosave notes, requirements checklist with progress bar, linked scholarships
- **Scholarships** : Add, view, manage eligible universities, requirements checklist
- **Funding Overview** : See total potential funding per university converted to GHS
- **Timeline** : Gantt-style view of all application windows with today indicator
- **Deadline Alerts** : Dashboard alerts for openings within 30 days and deadlines within 15 days
- **Status Tracking** : 8 statuses: Not Yet Open, Not Started, In Progress, Submitted, Accepted, Rejected, Waitlisted, Awarded

---

## 🔐 Security

All database tables have Row Level Security (RLS) enabled. Users can only read and write their own data. The Supabase anon key is safe to include in the frontend : it cannot bypass RLS policies.

---

## 📦 Tech Stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Frontend      | React 18 + TypeScript           |
| Styling       | Tailwind CSS v4                 |
| UI Components | Radix UI / shadcn-ui primitives |
| Charts        | Recharts                        |
| Routing       | React Router v7                 |
| Backend       | Supabase (PostgreSQL)           |
| Auth          | Supabase Auth                   |
| Build         | Vite                            |
