# FNCTION Dashboard

A shared dashboard for Sam and Helen. Both sign in from their own devices, both
see the same live data, and every change saves as it is made.

Covers distribution (partners, orders, notes), finance (spending and invoices),
manufacturing (four suppliers) and marketing (seven channels).

## Setting it up

Setup happens once and takes four short steps. They are written out in
`SETUP.md` — follow that, not this file.

## Running it locally

```sh
npm install
npm run dev
```

Then open http://localhost:3000. It needs `.env.local` to exist first; copy
`.env.local.example` and fill in the two values from Supabase.

## How it is put together

| Folder | What is in it |
| --- | --- |
| `app/` | Pages: the dashboard, the login screen, sign-out |
| `components/` | The four sections and the shared pieces they are built from |
| `components/store.tsx` | Loads, saves and live-syncs the data |
| `lib/` | Supabase connection, formatting, status colours |
| `supabase/setup.sql` | The one-time database setup |

Built with Next.js, TypeScript, Tailwind and Supabase. Deploys to Vercel as-is.

## Notes for whoever works on this next

- **Money is stored in pence**, as whole numbers. Pounds only exist for display
  and typing. Keep it that way; floating point pounds drift on totals.
- **Invoice status is derived**, not stored. An unpaid invoice becomes overdue
  on its own once `due_on` passes, with no scheduled job.
- **Statuses are free text.** `lib/status.ts` maps them to colours and anything
  unrecognised shows neutral grey, so a new status never needs a code change.
- **Access is enforced in the database**, not the app. Row level security means
  the browser key can only ever read what a signed-in user is allowed to read,
  and an email allowlist means only the two addresses can hold an account.
- **Do not put the Supabase `service_role` key in this project.** Nothing here
  needs it and it bypasses every rule above.
