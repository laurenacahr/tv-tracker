import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import { api } from "./src/app.js";

// This app's one server. App Hosting runs it on Cloud Run:
// /api/** goes to the backend routes, everything else is the built React app.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const WEB = path.resolve(HERE, "../web/dist");

const app = express();
app.disable("x-powered-by");
app.use("/api", api);

// Vite fingerprints everything under /assets, so those can be cached for good;
// index.html must always be re-checked so a deploy is picked up at once. A
// missing asset is a 404, not index.html: a tab still open from before a deploy
// asks for old chunk names, and handing it HTML would fail far more confusingly.
app.use("/assets", express.static(path.join(WEB, "assets"),
  { immutable: true, maxAge: "1y", fallthrough: false }));
app.use(express.static(WEB, { index: false, maxAge: "1h" }));
app.get("/{*path}", (req, res) => {
  res.set("Cache-Control", "no-cache").sendFile(path.join(WEB, "index.html"));
});

const port = process.env.PORT || 8787;
app.listen(port, () => console.log(`listening on :${port}`));
