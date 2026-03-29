# Setup: Supabase + GitHub Pages

## 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the script in [`supabase/schema.sql`](supabase/schema.sql).
3. Copy **Project URL** and **anon public** key from **Project Settings → API**.

## 2. Local development

```bash
cp .env.example .env
# Edit .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

With `base: '/90s-tennis-game/'` in Vite, open **`http://localhost:5173/90s-tennis-game/`** (not the site root).

## 3. GitHub Actions secrets

In the GitHub repo: **Settings → Secrets and variables → Actions**, add:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — anon public key

## 4. Enable GitHub Pages

**Settings → Pages → Build and deployment**: set **Source** to **GitHub Actions**.

Push to `main`; the workflow builds with the secrets baked into the static bundle and deploys `dist/`.

## Base path

The app is built for a **project site** at `https://<user>.github.io/90s-tennis-game/`. If you use a **user/org site** (`username.github.io` with no repo path), change `base` in [`vite.config.ts`](vite.config.ts) to `'/'`.
