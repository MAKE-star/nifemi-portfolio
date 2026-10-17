/* ============================================================================
   Supabase + site configuration.
   The anon key is SAFE to ship in client code — it only allows what your
   Row Level Security policies allow (public read; writes limited to the
   editor emails in your SQL policy). Keep your SERVICE ROLE key secret and
   NEVER put it here.
   ========================================================================== */
window.NIFEMI_CONFIG = {
  SUPABASE_URL: 'https://tiuiiivlkmlotavinfgp.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdWlpaXZsa21sb3RhdmluZmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIyNTIyNjIsImV4cCI6MjEwNzgyODI2Mn0.AHMm-3WFEEPZp3h6ImdmeteLAN22R_HYkIdoCSk26j8',

  // Which email(s) may edit. Must match the WRITE policy in your SQL exactly.
  EDITORS: ['oluwanifemikujebe@gmail.com', 'adeoyemayopoelijah@gmail.com'],

  // Where magic-link sign-in returns to. Used as the redirect target.
  SITE_URL: 'https://oluwanifemikujebe.netlify.app',

  // storage bucket (must exist + be public for resume downloads to work)
  BUCKET: 'media',

  // the single content row id (matches the SQL seed)
  ROW_ID: 'main',
};
