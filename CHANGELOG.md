# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow
[Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-23

A quality, safety, and maintainability release. No features were removed from
the app, but contributors and anyone deploying it should read the upgrade
notes below.

### Added

- **Quality gates:** `npm run typecheck` (strict TypeScript), `npm run lint`
  (ESLint with typescript-eslint and React Hooks rules), and `npm test`
  (Vitest, 56 tests).
- **CI:** a GitHub Actions workflow that runs typecheck, lint, tests, and a
  build on every push to `main` and every pull request.
- **Typed database access:** generated Supabase types
  (`src/app/lib/database.types.ts`) and a client typed with them. The README
  documents how to regenerate them.
- **Migration `005_add_checklist_sort_order.sql`** for the checklist
  `sort_order` columns the app already relied on. It backfills existing items
  in creation order and is safe to re-run.
- **Shared components:** `Pagination`, `StatusSelector`, `ModalShell`,
  `BulkActionBar`, `EditableName`, `EditableLink`, and `ChecklistEditor`,
  replacing code that was duplicated between the Universities and
  Scholarships pages.
- **Route-level lazy loading** with `RouteFallback` and `RouteError`.
- README architecture section, prerequisites, and an updated project
  structure; this changelog.

### Changed

- **Safer multi-step writes.** Creating, duplicating, or importing a record now
  inserts its checklist once and removes the record if that fails, instead of
  leaving a record with a missing checklist. Linking universities to a
  scholarship adds new links before removing stale ones. Switching or creating
  the active cycle restores the previous active cycle if the follow-up step
  fails.
- **Faster requests.** Services read the user id from the local session
  instead of calling `auth.getUser()` (a network round trip) on every request.
- **Smaller downloads.** Pages load on demand, so the sign-in screen downloads
  roughly 40% less JavaScript, and built CSS is about 45% smaller after
  removing unused component styles.
- **`supabase/schema.sql` is safe to re-run.** Triggers and policies are
  recreated; existing tables and data are untouched.
- **Error handling.** Route failures and page render errors now show the
  app's error screen with a reload button. Caught errors are typed
  (`unknown`) and read through a shared `getErrorMessage` helper.
- Hook lint rules (`set-state-in-effect`, `static-components`,
  `exhaustive-deps`) are now errors. The remaining intentional effects carry
  an inline comment explaining why.
- Checklist checkboxes now use the brand accent color, like every other
  checkbox in the app.

### Fixed

- A failed checklist insert during create, duplicate, or import no longer
  looks like success.
- A failed link replacement on a scholarship can no longer drop all of its
  linked universities.
- A failed active-cycle switch can no longer leave you with no active cycle.
- Deprecated `baseUrl` removed from `tsconfig.json`.

### Removed

- 35 unused shadcn components and 23 unused `@radix-ui/*` dependencies.
- Figma Make leftovers (asset resolver plugin, pnpm override, empty
  `peerDependencies`).
- Committed build output (`dist/`) and a generated data file
  (`migration.sql`). Both are now ignored, and the repository history was
  rewritten to remove them.

### Upgrade notes

1. **Node.js 22.13 or newer** (24 also works). Vite alone needs 20.19+, but
   Vitest and ESLint need 22.13+.
2. **Re-clone the repository** if you have an older clone: the git history was
   rewritten, so old clones will not merge cleanly.
3. **Run `npm install`** after pulling. The lockfile and dev dependencies
   changed.
4. **Existing databases:** run `supabase/migrations/005_add_checklist_sort_order.sql`
   if it has not been applied yet.
5. **Builds need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.** Without
   them the build silently drops the app. CI uses placeholder values.
6. After any schema change, regenerate `src/app/lib/database.types.ts` (see
   the README).
