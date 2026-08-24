# FNCTION Dashboard

A shared dashboard for Sam and Helen. Both sign in from their own devices, both
see the same live data, and every change saves as it is made.

Covers distribution (partners, orders, notes), finance (spending and invoices),
manufacturing (four suppliers) and marketing (seven channels).

**Live at:** https://fnctionltd.github.io/FNCTION-DASHBOARD-/

## How it is hosted

Two services, no others:

- **GitHub Pages** serves the site. There is no server and no server-side
  rendering — `next build` produces a folder of static files, which the
  workflow in `.github/workflows/deploy.yml` publishes on every push.
- **Supabase** provides sign-in, the database, and the live updates that let
  one person's edit appear on the other's screen. The browser talks to it
  directly.

Setup instructions are in `SETUP.md`.

## Running it locally

```sh
npm install
npm run dev
```

Then open http://localhost:3000. It reads the same `public/config.js` as the
live site, so it points at the same database.

## How it is put together

| Folder | What is in it |
| --- | --- |
| `app/` | The two pages: the dashboard and the login screen |
| `components/` | The four sections and the shared pieces they are built from |
| `components/store.tsx` | Loads, saves and live-syncs the data |
| `lib/` | Supabase connection, formatting, status colours |
| `public/config.js` | Which Supabase project to use |
| `supabase/setup.sql` | The one-time database setup |

## Notes for whoever works on this next

- **This is a static export.** No server components, no API routes, no
  middleware — GitHub Pages cannot run any of them. Keep it that way.
- **`basePath` is the repository name**, because a project Pages site is served
  from a subdirectory rather than the domain root. It is set in the deploy
  workflow, not hardcoded in the app.
- **`public/config.js` is read at runtime**, not baked in at build time, so the
  two Supabase values can be corrected by editing one file.
- **Money is stored in pence**, as whole numbers. Pounds exist only for display
  and typing; floating point pounds drift on totals.
- **Invoice status is derived**, not stored. An unpaid invoice becomes overdue
  on its own once `due_on` passes, with no scheduled job.
- **Statuses are free text.** `lib/status.ts` maps them to colours and anything
  unrecognised shows neutral grey, so a new status needs no code change.
- **Access is enforced in the database.** Row level security means the
  publishable key can only read what a signed-in user may read, and an email
  allowlist restricts accounts to the two addresses.
- **Never add the Supabase `service_role` key to this project.** Nothing here
  needs it and it bypasses every rule above.
