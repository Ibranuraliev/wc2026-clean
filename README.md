# Road to 2026 — FIFA World Cup Predictor

Predict group standings, build your knockout bracket, compete in private leagues, and play the penalty shootout mini-game.

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · Supabase · Framer Motion · GSAP · Zustand · @dnd-kit · next-intl

---

## Setup

### 1. Clone & install

```bash
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API |
| `CRON_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |

### 3. Supabase migration

```bash
# Using Supabase CLI
supabase db push --file supabase/migrations/0001_init.sql

# Or paste into the SQL editor at supabase.com
```

### 4. Run dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/ru` by default.

---

## Deploy to Vercel

1. Push repo to GitHub
2. Import in [vercel.com/new](https://vercel.com/new)
3. Add all env vars from `.env.example` in the Vercel dashboard
4. Deploy — Vercel picks up `vercel.json` cron config automatically

---

## Telegram Bot (optional)

```bash
cd packages/tg-bot
cp .env.example .env
# fill TELEGRAM_BOT_TOKEN from @BotFather
pnpm install
pnpm dev
```

---

## Project structure

```
src/
  app/[locale]/          # All pages (ru/en)
    predict/groups/      # Group stage drag-and-drop predictor
    predict/bracket/     # Knockout bracket
    predict/summary/     # Final prediction card + share
    leagues/             # Private leagues
    heatmap/             # Community stats
    daily/               # Daily challenge
    play/penalty/        # Penalty shootout mini-game
    profile/             # User profile
  components/            # Shared UI components
  store/                 # Zustand prediction store
  lib/supabase/          # Supabase clients (browser, server, middleware)
  i18n/                  # next-intl config
  types/                 # TypeScript types (Database, etc.)
messages/                # ru.json / en.json translations
supabase/migrations/     # SQL migrations
packages/tg-bot/         # Telegram bot (grammY)
```

---

## Feature flags

Set in `.env.local` to activate:

- `NEXT_PUBLIC_ENABLE_ADS=true` — show ad slots
- `NEXT_PUBLIC_ENABLE_PREMIUM=true` — gate premium features
- `NEXT_PUBLIC_ENABLE_PAID_LEAGUES=true` — enable paid leagues (requires Stripe setup)

See `TODO.md` for the full roadmap.
