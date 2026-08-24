# Setting up the FNCTION Dashboard

Four short steps, once. Nothing here needs any coding.

Work through them in order — each one is a single screen.

---

## Step 1 — Create the database

1. Go to **https://supabase.com** and sign up (or sign in).
2. Click **New project**.
3. Fill in:
   - **Name**: `fnction-dashboard`
   - **Database Password**: click Generate, then **save it in your password
     manager**. You will not need it day to day, but it cannot be recovered.
   - **Region**: **London (eu-west-2)**
4. Click **Create new project** and wait about two minutes while it sets up.

---

## Step 2 — Set up the tables

1. In the left sidebar click **SQL Editor**.
2. Click **New query**.
3. Open `supabase/setup.sql` from this project, copy **all** of it, and paste it
   into the box.
4. Click **Run**.

You should see *Success. No rows returned*. That is the correct result.

---

## Step 3 — Create the two accounts

1. In the left sidebar click **Authentication**, then **Users**.
2. Click **Add user** → **Create new user**.
3. Enter `sam@fnction.co`, choose a password, and tick **Auto Confirm User**.
4. Click **Create user**.
5. Repeat for `helen@fnction.co` with its own password.

Only these two addresses can ever have an account — that rule is built into the
database, so there is no privacy setting to remember to change.

---

## Step 4 — Connect the app

1. In the left sidebar click **Project Settings** (the cog), then **API**.
2. Copy these two values:
   - **Project URL**
   - **Publishable key** (it may be labelled **anon public** instead)

Send both to Claude, or paste them into a file named `.env.local` like this:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

**Do not copy the `service_role` or `secret` key.** The app never uses it, and
it would bypass every security rule if it leaked.

---

That is the whole setup. After this, adding partners, orders, expenses,
invoices, statuses and notes all happens inside the dashboard itself.
