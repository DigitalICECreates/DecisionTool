# ICE Creates · Clinical Decision Tracker

A production web app for clinical directors to log **decisions, non-decisions and
anti-decisions** — capturing the time, place, context, pressure and outcome of
each, for reflective practice and leadership development.

Built per the ICE Creates Developer Brief: **Next.js 14 (App Router) · TypeScript ·
Tailwind · Supabase (auth + Postgres) · Vercel**, with the prototype's ICE brand
system carried through exactly (Poppins, dark navy `#1A1130`, yellow `#F5C832`,
and the 7-colour spectrum).

The original prototype is preserved, read-only, at
`prototype/decision-tracker-reference.jsx`.

---

## What's in the box

| Area | Status |
|------|--------|
| Auth — sign in, create account, 3-step password reset | ✅ wired to Supabase Auth |
| Dashboard — greeting, stat cards, type breakdown, filter + search | ✅ |
| Decision logging — full form, voice-to-text, create/read/update/delete | ✅ |
| Entry detail — view, edit, delete | ✅ |
| Profile sheet — stats, edit name, sign out | ✅ |
| Voice input (Web Speech API, Chrome/Edge) | ✅ ported |
| Row Level Security — per-user data isolation in the database | ✅ |
| Security headers, error boundaries, loading skeletons, responsive | ✅ |
| Resend email, Azure Front Door / Key Vault / Monitor | ⏳ Phase 4 (see below) |

---

## 1. Local development

### Prerequisites
- Node.js 18.17+ (this machine has v24 — fine)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

### Steps

```bash
# 1. Install dependencies (already done if node_modules exists)
npm install

# 2. Create your local environment file
cp .env.local.example .env.local      # PowerShell: Copy-Item .env.local.example .env.local
#    then fill in the Supabase values (see step 3)

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

> The app will load but **auth/data won't work until Supabase is configured** (step 2 below).

---

## 2. Supabase setup (the backend)

1. **Create the project**
   - supabase.com → *New project*.
   - **Region: choose `eu-west-2` (London)** — critical for UK data residency.
   - Pick a strong database password and save it.

2. **Run the database schema**
   - Dashboard → **SQL Editor** → *New query*.
   - Paste the entire contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and **Run**.
   - This creates the `profiles` + `decisions` tables, Row Level Security
     policies, and the triggers (auto-create profile on signup, auto-update
     `updated_at`).

3. **Get your API keys**
   - Dashboard → **Settings → API**. Copy into `.env.local`:
     - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, keep secret)

4. **Auth settings**
   - Dashboard → **Authentication → URL Configuration**:
     - *Site URL*: `http://localhost:3000` for dev (and your production URL later).
     - *Redirect URLs*: add `http://localhost:3000/auth/callback` and your
       production `https://…/auth/callback`.
   - **Email confirmation**: by default Supabase requires users to confirm their
     email before first login. That matches the brief's "register → verify →
     login" flow. (You can turn it off under *Authentication → Providers → Email*
     for faster pilot testing.)

5. **Password reset = 6-digit code (matches the prototype)**
   The 3-step reset screen verifies a **6-digit code** rather than a magic link.
   To make Supabase email that code, edit the template:
   - Dashboard → **Authentication → Email Templates → Reset Password**.
   - Make sure the template includes the token, e.g.:
     ```
     Your password reset code is: {{ .Token }}
     ```
   - Save. The reset flow then works end-to-end: enter email → receive code →
     enter code → set new password.
   *(If you prefer magic-link reset instead, the `/auth/callback` route already
   handles recovery links — just point the template at `{{ .ConfirmationURL }}`.)*

---

## 3. Deploy to Vercel

1. Push this repo to **private** GitHub (`icecreates/decision-tracker` recommended):
   ```bash
   git init
   git add .
   git commit -m "Initial build — ICE Decision Tracker"
   git branch -M main
   git remote add origin https://github.com/icecreates/decision-tracker.git
   git push -u origin main
   ```
2. vercel.com → **Add New → Project** → import the repo.
3. **Environment Variables** — add the same keys from `.env.local`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
4. **Deploy.** Every push to `main` redeploys; every PR gets a preview URL.
5. **Custom domain** — Vercel → *Settings → Domains* → add
   `decisions.icecreates.com`, then add the `CNAME` it shows to your DNS.
6. Back in **Supabase → Auth → URL Configuration**, set *Site URL* and add the
   production `/auth/callback` redirect.

---

## 4. Phase 4 — production hardening (later)

These need accounts/logins and aren't code in this repo yet — checklist for when
you're ready:

- **Resend** transactional email — sign up, verify `icecreates.com` domain, then
  point Supabase SMTP (*Auth → Email → SMTP Settings*) at Resend so reset codes
  send from `noreply@icecreates.com`. Add `RESEND_API_KEY` / `EMAIL_FROM` to env.
- **Azure Front Door** — put it in front of the Vercel domain as a WAF (DDoS +
  bot protection).
- **Azure Key Vault** — store `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY`;
  reference from Vercel rather than storing raw.
- **Azure Monitor** — forward Vercel + Supabase logs.
- Security headers are already set in `next.config.mjs` (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).

---

## Project structure

```
app/
  (auth)/login · signup · reset-password   # public auth screens
  (app)/dashboard · new · entry/[id] · entry/[id]/edit   # protected
  (app)/layout.tsx        # header + spectrum + footer + profile sheet
  auth/callback/route.ts  # email confirmation / recovery handler
  layout.tsx · globals.css · not-found.tsx
components/
  ui/        # IceLogo, Avatar, Dot, SpectrumBar, TypeBadge, OutcomeBadge,
             # StatCard, VoiceInput (+ VoiceArea)
  auth/      # AuthShell, LoginSignup, ResetFlow
  decisions/ # DecisionCard, DecisionList, DecisionForm, DetailView
  layout/    # AppShell, ProfileSheet
lib/
  constants.ts · utils.ts · styles.ts · schema.ts (Zod) · actions.ts (server actions)
  supabase/  client.ts · server.ts · middleware.ts · queries.ts
types/database.ts
supabase/migrations/0001_init.sql
middleware.ts            # session refresh + route protection
prototype/               # original artifact (read-only reference)
```

## Notes on fidelity & decisions
- **Styling** is ported from the prototype as brand-token inline styles to match
  the original pixel-for-pixel; Tailwind is configured (`tailwind.config.ts`) with
  the ICE tokens and used for base/global styling. Components can be migrated to
  Tailwind utility classes incrementally without visual change.
- **Field mapping**: the UI keeps the prototype's field names (`title`,
  `context`, `notes`, `pressure`, `timestamp`); these map to the brief's canonical
  DB columns (`title`, `context_notes`, `reflection_notes`, `pressure_level`,
  `decision_timestamp`) in `lib/actions.ts`. Decision-type ids use the DB values
  `decision` / `non_decision` / `anti_decision`.
- **Auth** fully replaces the prototype's localStorage accounts with Supabase Auth
  (real users, hashed passwords, JWT sessions, server-enforced RLS).

---

_ice creates · leading behaviour change · icecreates.com_
