# Setting up the FNCTION Dashboard

The dashboard runs on two services and nothing else: **GitHub** hosts the site,
**Supabase** holds the data.

There is no server. The page is plain HTML and JavaScript served by GitHub
Pages, and it talks to Supabase directly from the browser.

---

## Already done

- Supabase project, tables and the two accounts
- The application itself
- The deployment, which runs automatically on every push

## What is left

### 1. Make the repository public

GitHub Pages only works on private repositories with a paid GitHub plan. On the
free plan the repository has to be public.

**Settings** → scroll to the bottom → **Change visibility** → **Change to
public**.

This publishes the code, not the data. What protects the data is:

- Every table refuses to return anything to a visitor who is not signed in.
- Only `sam@fnction.co` and `helen@fnction.co` can ever hold an account, which
  is enforced inside the database itself.
- The key in `public/config.js` is the *publishable* key. It is designed to sit
  in a public web page — it grants nothing on its own.

The `service_role` key is the one that must never be published. It is not in
this repository and the app never uses it.

### 2. Fill in the two connection values

Open **`public/config.js`**, click the pencil icon, and replace the two
placeholders with the **Project URL** and **Publishable key** from Supabase
(**Project Settings** → **API**). Commit the change.

That is the last step. The site rebuilds itself and goes live at:

**https://fnctionltd.github.io/FNCTION-DASHBOARD-/**

---

## Afterwards

Sam and Helen open that link, sign in with their email and password, and stay
signed in on their own devices.

To change the connection values later, edit `public/config.js` again. No
rebuild is needed on your part — pushing the change is enough.
