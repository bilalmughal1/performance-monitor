# Web Performance Monitor

Track Google PageSpeed Insights (LCP, INP, CLS, Performance, SEO, A11y, Best Practices) for multiple sites. Runs mobile/desktop audits, stores history, charts results, exports CSV, and keeps each user’s data isolated via Supabase Row Level Security.

Live demo: https://performance-monitor-beta.vercel.app  
Repo: https://github.com/bilalmughal1/performance-monitor

## Feature set
- Email/password auth with Supabase (signup, login, forgot/reset password) + Google OAuth (requires your credentials and Google test/verification).
- Per-user sites with RLS protection; cascading deletes for runs.
- Mobile/desktop PSI runs, latest metrics on dashboard cards, history tables with filters, charts, CSV export, run details drawer.
- Run status and error visibility; timeouts and rate limits in API route.
- Theme toggle (light/dark/system) stored per user preference.
- Profile management (name, company, bio, phone) and app settings page.
- Landing page, contact page with form (static placeholder submit), and footer links.

## Tech stack
- Next.js (App Router), React 18, TypeScript
- Tailwind CSS v3
- Supabase (Auth, Postgres, RLS)
- Google PageSpeed Insights API
- Chart.js for charts
- Vercel for hosting

## Project structure (high level)
- `src/app` — routes (landing `/`, auth `/login`, `/signup`, `/forgot-password`, `/reset-password`, dashboard `/dashboard`, history `/sites/[id]`, contact `/contact`, settings/profile pages).
- `src/app/api/runs` — PSI run endpoint (server-side key usage, rate limit/timeout).
- `src/app/api/integrations` — Google integrations scaffolding (requires your OAuth keys and verification).
- `src/components` — dashboard UI (sidebar, cards, charts, etc.).
- `supabase/rls_policies.sql` — RLS policies for core tables.

## Environment variables
Create `.env.local` for local dev and set the same keys in Vercel (Production/Preview/Development):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PAGESPEED_API_KEY=...
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app  # used in redirects/OAuth state

# Google OAuth (optional, required for integrations page)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_STATE_SECRET=...  # any random strong string for state signing

# Cron (if you enable scheduled runs later)
# CRON_SECRET=...
```

## Supabase schema notes
- Core tables: `sites`, `runs`, `profiles`, `site_alerts` (if added), integrations tables (google_integrations, ads/analytics/search_console metrics).
- RLS: Only owner can select/insert/update/delete their rows on `sites`, `runs`, and other user-bound tables. Service-role is used only in server routes where needed.
- Cascades: `runs.site_id -> sites.id` ON DELETE CASCADE to clean up runs when a site is removed.
- See `supabase/rls_policies.sql` for the latest policies applied.

## Local development
```bash
npm install
npm run dev
# open http://localhost:3000
```

Production build:
```bash
npm run build
npm start
```

## Authentication flows
- Email/password with confirmation email (enable email confirmations in Supabase Auth settings).
- Forgot/reset password implemented at `/forgot-password` → email link → `/reset-password`.
- Signup blocks duplicate emails and shows a clear error if the address already exists.
- Google OAuth available once you supply client ID/secret, state secret, and add the correct authorized origins/redirect URIs in Google Cloud:
  - Origins: `http://localhost:3000`, `https://your-domain.vercel.app`
  - Redirects: `http://localhost:3000/api/auth/google/callback`, `https://your-domain.vercel.app/api/auth/google/callback`
  - For production, add test users or complete Google verification to avoid 403 access_denied.

## Running PageSpeed safely
- Server-side fetch uses the API key; never expose it client-side.
- Normalizes URLs, supports mobile/desktop strategies.
- Rate limiting and timeout (via AbortController) to avoid hanging builds/quota abuse.

## Theming and responsiveness
- Tailwind v3 with dark/light/system preference stored per user.
- Responsive layouts for landing, auth, dashboard, and history pages; cards and charts adapt to mobile/tablet/desktop.

## Security practices in this repo
- RLS on all user data tables.
- Service role used only in server routes.
- OAuth state signing with `GOOGLE_STATE_SECRET`.
- Input validation for URLs and auth forms.
- Duplicate-email guard on signup; forgot/reset password flows.

## Limitations / TODOs
- Google OAuth may show “app not verified” until you add test users or complete verification.
- Cron endpoint and Stripe/billing are not wired; CRON_SECRET and Stripe keys are placeholders.
- Middleware deprecation warning still present; migrate to Next.js `proxy` convention in future.

## Screenshots
- Landing, auth, dashboard, and history screenshots are stored in `public/` and referenced in the app preview section.

## Deployment
- Set all env vars in Vercel before deploying.
- Build with `npm run build`; deploy main branch. Ensure Supabase RLS policies are applied (see SQL file).
