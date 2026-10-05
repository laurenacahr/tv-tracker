# TV Tracker

Track which of the NYT's 100 best TV shows of the 21st century you've watched,
tier them, and compare takes with friends.

It's an App Hosting app in the same Firebase project as the WURB dashboards
(`wurb-dashboards`) and uses that project's default Firestore database, but it
is its own repo and its own backend, and it is not listed on the WURB home page.

```
web/      React + Vite front end (built to web/dist)
server/   one Express server: serves web/dist and /api
```

## How it works

- **The browser never talks to Firestore.** The React app calls `/api/tv/*`;
  only the server reads or writes Firestore, with the Admin SDK. The WURB
  repo's `firestore.rules` already denies all client access.
- **Collections** (this app touches nothing else in the database):

  | Collection | Document id | Holds |
  | --- | --- | --- |
  | `tv_profiles` | auto | `name`, `createdAt` |
  | `tv_picks` | `<userId>_<showId>` | `userId`, `showId`, `status`, `watchlisted`, `tier`, `personalRank`, `kickOut`, `notes`, `updatedAt` |
  | `tv_entries` | auto | `userId`, `title`, `notes`, `createdAt` (shows someone wants added) |

- **The show list is code**, not data: `web/src/lib/shows.js`. A show's id is
  its NYT rank (1-100).
- **Sync** is polling: each screen re-reads `/api/tv/state` every 10 seconds
  and when the tab regains focus. Your own edits show instantly (optimistic)
  and are saved in the background.
- **No sign-in.** Anyone who has the URL can read and write. A browser
  remembers which profile it is in `localStorage`. Fine for a private link
  between friends; add a passcode or real auth before sharing it widely.
- Caps (20 cuts, 20 additions per person) are enforced on the server.

## Running locally

Needs Node 22+ and a Java runtime for the Firestore emulator (on this Mac,
Homebrew's `openjdk@21`):

```bash
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
npm install
npm run dev
```

That starts the Firestore emulator (port 8081, so it can run next to WURB-Dashboard's on 8080), the API (8790) and Vite
(5180). Open http://localhost:5180. The emulator keeps no data between runs.

To run the way App Hosting does:

```bash
npm run build && npm start      # http://localhost:8787
```

(Against the real database that also needs
`GOOGLE_APPLICATION_CREDENTIALS` pointing at the service-account key.)

## Deploying

Push to `main`; the App Hosting backend `tv-tracker` runs `npm ci`,
`npm run build`, `npm start`.

One-time setup in the Firebase console (project `wurb-dashboards`):
**App Hosting → Create backend**, region `us-central1`, repo
`laurenacahr/tv-tracker`, live branch `main`, root directory `/`, backend ID
`tv-tracker`, automatic rollouts on.

## Rules that have already cost failed deploys (from WURB-Dashboard)

- No npm workspaces. App Hosting installs only the root `package.json`.
- Build tools (Vite, its React plugin) stay in `dependencies`, not
  `devDependencies`.
- No Cloud Functions and no classic Firebase Hosting: one Express server.
- Commit `package-lock.json`; App Hosting runs `npm ci`.
