/*
 * FNCTION Dashboard — connection settings.
 *
 * These two values tell the app which Supabase project to use. They are meant
 * to be public: they are the same values the browser would show anyone using
 * the app, and the database's own rules are what keep the data private.
 *
 * To change them, edit this file on GitHub and commit. No rebuild is needed.
 *
 * NEVER put the service_role (secret) key here. It bypasses every rule.
 */
window.FNCTION_CONFIG = {
  SUPABASE_URL: "https://meqtjzmpesakaoitonav.supabase.co",
  SUPABASE_ANON_KEY: "PASTE_YOUR_PUBLISHABLE_KEY_HERE",
};
