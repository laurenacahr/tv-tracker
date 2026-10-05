import express from "express";
import { tv } from "./routes/tv.js";

// Everything under /api. Each data area is one router in routes/.
export const api = express.Router();

api.use(express.json({ limit: "32kb" }));
api.get("/health", (req, res) => res.json({ ok: true }));
api.use("/tv", tv);

api.use((req, res) => res.status(404).json({ error: "Not found" }));

api.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Bad JSON" });
  console.error(err);
  res.status(500).json({ error: "Server error" });
});
