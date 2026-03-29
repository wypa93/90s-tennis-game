# Tênis.BR — quadra virtual (modo 1993)

A tiny, nostalgic wall-rally game: green court, chunky pixels, and a shared high-score board for two people who already know the drill. Built as a love letter to late-web Brazil and to **Pascal** and **Franciele**—pick your name once, chase the rally, and see how the other player is doing from anywhere.

## Why it exists

Sometimes you want a game that feels like a GeoCities tab from 1993, complete with CRT shimmer, wildlife strolling across the screen, and a ranking that actually remembers yesterday’s score. This is that game.

## What you get

- **Retro tennis rally** — paddle at the bottom, ball off the walls, difficulty that ramps with time and long streaks.
- **Two players only** — Pascal or Franciele; your choice sticks on this device (honor system, no accounts).
- **Shared leaderboard** — scores sync through **Supabase** so you can humble each other across phones and laptops.
- **Magic word at the door** — a playful “qual é a palavra mágica?” gate before the court opens (friends-only vibe).
- **GitHub Pages** — one URL; works on mobile and desktop.

## Quick start (local)

```bash
npm install
cp .env.example .env
# Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for live rankings
npm run dev
```

Then open **`http://localhost:5173/90s-tennis-game/`** (the Vite `base` path matters).

## Deploy & database

Full steps for Supabase SQL, GitHub Actions secrets, and Pages are in **[SETUP.md](SETUP.md)**.

## Stack

| Piece        | Choice                          |
| ------------ | ------------------------------- |
| UI & game    | Vite, TypeScript, Canvas        |
| Scores       | Supabase (Postgres + RLS)       |
| Hosting      | Static build → GitHub Pages     |

## Scripts

| Command        | What it does        |
| -------------- | ------------------- |
| `npm run dev`    | Local dev server    |
| `npm run build`  | Typecheck + `dist/` |
| `npm run preview`| Preview production build |

## Credits

Feito por **Pascal** e **Claude Code** para **Franciele**. If you landed here uninvited, say hi anyway—then go bake something good.

---

*Melhor visto em 800×600 (brincadeira).*
