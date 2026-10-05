# TV Tracker: notes for agents

Read [README.md](README.md) first.

- This app shares the `wurb-dashboards` Firestore (default database) with the
  WURB dashboards but owns only the `tv_*` collections. Never read, write or
  delete anything else in there.
- The browser never touches Firestore; only `server/` does, via the Admin SDK.
- No npm workspaces; Vite and its React plugin stay in `dependencies`.
- Never commit anything under `.secrets/` or named `*firebase-adminsdk*.json`.
- Commit and push only when the user asks. Pushing to `main` deploys.
- Simulate App Hosting before pushing a build change: copy the repo to a clean
  folder, then `npx -p node@22 -p npm@10 npm ci && npm run build && npm start`.
