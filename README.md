# Use More Kerb app

A free karting season planner: UK club rounds, rental championships and rental-track events, free weekends and clashes.

- `index.html` is the home screen (hub) linking to every tool.
- `planner/index.html` is the season planner (it uses `<base href="../">`, so its paths are relative to the site root). Each person's calendar is saved on their own device.
- `data/races.json` is the shared list of club, rental and track dates. It is refreshed automatically every week.

Hosted on Netlify. Every push to `main` goes live automatically.

## Team manager

`team/index.html` is a second app for endurance team managers, at `/team/`. It shows only the endurance races from `data/races.json`, plus any races the manager adds. Managers add drivers, coaches and mechanics, put a coach and mechanic with each driver at each race, and tick off staff payments. It is saved on the manager's own device, with backup and restore.

Both apps share `sw.js` for offline use and `fonts/f1.ttf`.

## USA and Europe versions

Tap the flag next to the logo to switch between UK, Europe and USA. The Europe version reads `data/races-eu.json` and the USA version reads `data/races-us.json` (same shape as `data/races.json`) and keeps its own saved calendar on the device. Weekends, clashes, booking and shop work the same; "Where's Brad racing?" is UK only.

## Setup coach

`setup/` is a kart troubleshooting app. Drivers describe a problem by text or voice and get driving and setup fixes from the guide in `setup/guide.js` (works offline). A Rental toggle hides setup advice. "Ask the AI" calls the Netlify function `netlify/functions/coach.mjs`, which needs an `ANTHROPIC_API_KEY` environment variable on Netlify (optional: `COACH_MODEL`, `COACH_DAILY_LIMIT`). It only works on the Netlify address, not GitHub Pages.

## Hub pages

- `standings/` reads `data/standings.json` (top 10 per class, refreshed weekly).
- `members/` is the Use More Kerb Members' Championship page. Edit `data/members.json` to add rounds and standings. The interest form uses Netlify Forms (submissions appear in the Netlify dashboard under Forms; only works on the Netlify address).
- `store/` links to the Xenduri collection, Helmet28 and YouTube membership.
- `hub.css` holds the shared look for these pages.

## Members-only lock (Discord)

The whole app can be locked to Team Use More Kerb members. `gate.js` loads first on every page and shows a lock screen (sign in with Discord, the BUT WHY trailer and a Join on YouTube button) until the visitor has a valid members' pass. The pass is issued by `netlify/functions/discord-auth.mjs`, which checks the person is in the Use More Kerb Discord server with one of the member roles that YouTube's Discord link hands out. Passes last 90 days, then they sign in again (one tap), so lapsed members drop off within three months. Change it with `UMK_PASS_DAYS`.

To switch it on:

1. **Discord server:** Server Settings › Integrations › YouTube, connect the channel, and choose the member roles (one per membership level). Turn on Developer Mode (User Settings › Advanced), then right-click the server for its ID and each member role for its ID.
2. **Discord app:** at discord.com/developers, New Application › OAuth2. Copy the Client ID and Client Secret, and add the redirect `https://<your-netlify-site>/.netlify/functions/discord-auth`.
3. **Netlify environment variables:** `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_GUILD_ID`, `DISCORD_ROLE_IDS` (comma separated), `UMK_PASS_SECRET` (any long random text). Optional: `DISCORD_EXTRA_USER_IDS` (people always let in, e.g. Brad), `UMK_PASS_DAYS`, `UMK_ALLOWED_HOSTS`.
4. **gate.js:** set `enabled: true`, `netlify` to the Netlify address (so the GitHub Pages copy can sign in too) and `discordInvite` to the server invite link.

Sign-in results are handed back to the app through Netlify Blobs (`@netlify/blobs`), so it works from the installed iPhone and Android apps as well as the browser.
