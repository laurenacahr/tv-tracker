import { Router } from "express";
import { db, profiles, picks, entries } from "../db.js";

export const tv = Router();

const SHOW_COUNT = 100;
const KICKOUT_CAP = 20;
const ENTRY_CAP = 20;
const STATUSES = ["not_watched", "partial", "watched"];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

const pickId = (userId, showId) => `${userId}_${showId}`;

function cleanString(v, max, { required = false, field = "value" } = {}) {
  if (typeof v !== "string") {
    if (required) throw new HttpError(400, `${field} is required`);
    return "";
  }
  const s = v.trim();
  if (required && !s) throw new HttpError(400, `${field} is required`);
  if (s.length > max) throw new HttpError(400, `${field} is too long (max ${max})`);
  return s;
}

function parseShowId(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > SHOW_COUNT) throw new HttpError(400, "unknown show");
  return n;
}

// Only these fields can be set on a pick; each is checked before it is stored.
function parsePickPatch(body) {
  const out = {};
  if ("status" in body) {
    if (!STATUSES.includes(body.status)) throw new HttpError(400, "bad status");
    out.status = body.status;
  }
  if ("watchlisted" in body) {
    if (typeof body.watchlisted !== "boolean") throw new HttpError(400, "bad watchlisted");
    out.watchlisted = body.watchlisted;
  }
  if ("kickOut" in body) {
    if (typeof body.kickOut !== "boolean") throw new HttpError(400, "bad kickOut");
    out.kickOut = body.kickOut;
  }
  if ("tier" in body) {
    const t = body.tier;
    if (t !== null && !(Number.isInteger(t) && t >= 0 && t <= 5)) throw new HttpError(400, "bad tier");
    out.tier = t;
  }
  if ("personalRank" in body) {
    const r = body.personalRank;
    if (r !== null && !(Number.isInteger(r) && r >= 1 && r <= SHOW_COUNT)) throw new HttpError(400, "bad personalRank");
    out.personalRank = r;
  }
  if ("notes" in body) out.notes = cleanString(body.notes, 4000, { field: "notes" });
  return out;
}

function normalizePick(d) {
  return {
    userId: d.userId,
    showId: d.showId,
    status: d.status ?? "not_watched",
    watchlisted: d.watchlisted ?? false,
    tier: d.tier ?? null,
    personalRank: d.personalRank ?? null,
    kickOut: d.kickOut ?? false,
    notes: d.notes ?? "",
    updatedAt: d.updatedAt ?? 0,
  };
}

// Everything the screens need, in one read. The data is small (a few people x 100 shows).
tv.get("/state", async (req, res) => {
  const [profSnap, pickSnap, entrySnap] = await Promise.all([
    profiles.orderBy("createdAt").get(),
    picks.get(),
    entries.orderBy("createdAt").get(),
  ]);
  res.set("Cache-Control", "no-store").json({
    users: profSnap.docs.map((d) => ({ id: d.id, name: d.data().name })),
    picks: pickSnap.docs.map((d) => normalizePick(d.data())),
    entries: entrySnap.docs.map((d) => {
      const e = d.data();
      return { id: d.id, userId: e.userId, title: e.title, notes: e.notes ?? "", createdAt: e.createdAt };
    }),
  });
});

tv.post("/users", async (req, res) => {
  const name = cleanString(req.body?.name, 40, { required: true, field: "name" });
  const ref = profiles.doc();
  await ref.set({ name, createdAt: Date.now() });
  res.status(201).json({ id: ref.id, name });
});

async function requireUser(userId) {
  if (typeof userId !== "string" || !userId) throw new HttpError(400, "userId is required");
  const snap = await profiles.doc(userId).get();
  if (!snap.exists) throw new HttpError(404, "unknown user");
}

tv.put("/picks/:userId/:showId", async (req, res) => {
  const { userId } = req.params;
  const showId = parseShowId(req.params.showId);
  const patch = parsePickPatch(req.body ?? {});
  await requireUser(userId);

  const ref = picks.doc(pickId(userId, showId));
  await db.runTransaction(async (tx) => {
    const cur = await tx.get(ref);
    // Marking a show to cut is the one write with a cap, so it is checked inside
    // the transaction: two screens can't both take the last slot.
    if (patch.kickOut === true && !(cur.exists && cur.data().kickOut === true)) {
      const cuts = await tx.get(picks.where("userId", "==", userId).where("kickOut", "==", true));
      if (cuts.size >= KICKOUT_CAP) throw new HttpError(409, `You can cut at most ${KICKOUT_CAP} shows`);
    }
    tx.set(ref, { ...patch, userId, showId, updatedAt: Date.now() }, { merge: true });
  });
  res.json({ ok: true });
});

tv.post("/entries", async (req, res) => {
  const userId = req.body?.userId;
  const title = cleanString(req.body?.title, 120, { required: true, field: "title" });
  const notes = cleanString(req.body?.notes, 500, { field: "notes" });
  await requireUser(userId);

  const ref = entries.doc();
  await db.runTransaction(async (tx) => {
    const mine = await tx.get(entries.where("userId", "==", userId));
    if (mine.size >= ENTRY_CAP) throw new HttpError(409, `You can add at most ${ENTRY_CAP} shows`);
    tx.set(ref, { userId, title, notes, createdAt: Date.now() });
  });
  res.status(201).json({ id: ref.id });
});

tv.delete("/entries/:id", async (req, res) => {
  await entries.doc(req.params.id).delete();
  res.json({ ok: true });
});

tv.use((err, req, res, next) => {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
  next(err);
});
