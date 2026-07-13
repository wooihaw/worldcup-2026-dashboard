# World Cup 2026 Countdown Dashboard

A live countdown to the next FIFA World Cup 2026 match, built with React + Vite.

## Run it locally

```bash
npm install
npm run dev
```

Then open the local URL it prints (usually http://localhost:5173).

## Deploy to GitHub Pages

1. **Create a new GitHub repo** (e.g. `worldcup-dashboard`) and push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/worldcup-dashboard.git
   git push -u origin main
   ```

2. **Set the base path.** Open `vite.config.js` and make sure `base` matches your repo name:
   ```js
   base: "/worldcup-dashboard/",
   ```
   (If your repo is named exactly `YOUR-USERNAME.github.io`, use `base: "/"` instead.)

3. **Install dependencies and deploy:**
   ```bash
   npm install
   npm run build
   npm run deploy
   ```
   This uses the `gh-pages` package (already in `package.json`) to push the built site to a `gh-pages` branch.

4. **Turn on Pages in GitHub:** go to your repo → **Settings → Pages** → under "Build and deployment", set Source to "Deploy from a branch" and Branch to `gh-pages` / `root`. Save.

5. Your dashboard will be live at:
   ```
   https://YOUR-USERNAME.github.io/worldcup-dashboard/
   ```
   (GitHub Pages can take a minute or two to go live the first time.)

## Updating the fixture list

Match results and semi-final/final opponents are hardcoded in `src/App.jsx` under the `FIXTURES` array. As results come in, edit the `a`/`b` team fields for the semi-final and final entries, then rebuild and redeploy (`npm run build && npm run deploy`).

## Notes

- No backend or API keys required — it's a static site.
- The countdown logic runs entirely client-side based on the visitor's local clock, so it works correctly for viewers in any timezone.
