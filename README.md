# World Cup 2026 Countdown Dashboard

A live countdown to the next FIFA World Cup 2026 match, built with React + Vite.
The schedule updates itself — no manual editing, no API key, no cost.

## How the auto-update works

- `public/fixtures.json` holds the current schedule (teams, kickoff times, venues).
  The site fetches this file at runtime, so updating that one file is all it takes
  to change what visitors see.
- `scripts/update-fixtures.mjs` calls **ESPN's free public scoreboard API**
  (`site.api.espn.com` — no key, no signup, no cost) to check whether the semifinals
  are complete, and if so, fills in the real finalist names.
- `.github/workflows/update-fixtures.yml` runs that script automatically every 4 hours,
  commits the result if anything changed, then Vercel rebuilds and redeploys the site.

Once this is set up (just pushing to GitHub — no secrets to configure), you never need
to touch the code again as results come in.

## One-time setup

There's nothing to configure — no API key, no signup. Just push this project to GitHub
and the workflow takes over from there (see **Deploy to Vercel** below).

## Deploy to Vercel

1. **Push this project to GitHub** (if you haven't already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/worldcup-dashboard.git
   git push -u origin main
   ```

2. **Import the repo into Vercel:** go to [vercel.com/new](https://vercel.com/new), sign in
   with GitHub, and select this repo. Vercel auto-detects it as a Vite project —
   no configuration needed. Click **Deploy**.

3. That's it. Your dashboard is live at `https://your-project-name.vercel.app`
   (or a custom domain if you add one under Project Settings → Domains).

From here on, every push to `main` — including the automated `fixtures.json` updates
from the GitHub Action — triggers a fresh deploy automatically. No `npm run build`
or manual deploy step needed; Vercel handles that.

## Running the update manually

You can also trigger a refresh anytime instead of waiting for the schedule:
- **From GitHub:** go to the **Actions** tab → "Update fixtures" → **Run workflow**.
- **From your machine:**
  ```bash
  node scripts/update-fixtures.mjs
  git add public/fixtures.json
  git commit -m "Manual fixtures update"
  git push
  ```
  Vercel will pick up the push and redeploy automatically — no build/deploy commands needed.

## Notes

- If the ESPN fetch ever fails (rate limit, endpoint hiccup), the script leaves
  `fixtures.json` untouched rather than overwriting it with bad data — the site
  just keeps showing the last good schedule.
- ESPN's `site.api.espn.com` endpoints are undocumented by ESPN (there's no official
  public API), but they're widely used by hobby projects and have been stable for years.
  If ESPN ever changes something and the script starts failing, the site still works —
  it just stops picking up new results until the script is fixed.
- The countdown itself runs entirely client-side based on the visitor's local clock.
- To stop the auto-updates (e.g. after the tournament ends), delete or disable
  `.github/workflows/update-fixtures.yml` from the repo.
