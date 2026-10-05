import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api.js";
import { CUSTOM_ENTRY_CAP } from "./shows.js";

const POLL_MS = 10000;
const ME_KEY = "tvtracker:me";   // which profile this browser is, kept per device

function readMe() { try { return localStorage.getItem(ME_KEY); } catch { return null; } }
function writeMe(id) {
  try { id ? localStorage.setItem(ME_KEY, id) : localStorage.removeItem(ME_KEY); } catch { /* storage blocked */ }
}

export const pickKey = (userId, showId) => `${userId}:${showId}`;
export const defaultPick = (userId, showId) => ({
  userId, showId, status: "not_watched", watchlisted: false, tier: null, personalRank: null, kickOut: false, notes: "",
});

function toData(s) {
  const picks = {};
  for (const p of s.picks) picks[pickKey(p.userId, p.showId)] = p;
  return { users: s.users, picks, entries: s.entries };
}

const StoreCtx = createContext(null);
export const useStore = () => useContext(StoreCtx);

export function StoreProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [meId, setMeIdState] = useState(readMe);

  // `version` changes on every local write; a poll that started before a write
  // is discarded so it can't flash the old value back over an optimistic update.
  const version = useRef(0);
  const inflight = useRef(0);

  const refresh = useCallback(async () => {
    const v = version.current;
    try {
      const s = await api.get("/api/tv/state");
      if (v !== version.current || inflight.current > 0) return;
      setData(toData(s));
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, []);

  useEffect(() => {
    refresh();
    const tick = () => { if (!document.hidden) refresh(); };
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    window.addEventListener("focus", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
      window.removeEventListener("focus", tick);
    };
  }, [refresh]);

  const write = useCallback(async (send, optimistic) => {
    version.current++;
    inflight.current++;
    optimistic?.();
    try {
      await send();
    } catch (e) {
      alert(e.message);
    } finally {
      inflight.current--;
      version.current++;
      refresh();
    }
  }, [refresh]);

  const me = useMemo(() => data?.users.find((u) => u.id === meId) ?? null, [data, meId]);

  const value = useMemo(() => {
    const getPick = (userId, showId) => data?.picks[pickKey(userId, showId)] ?? defaultPick(userId, showId);
    return {
      loaded: !!data,
      error,
      users: data?.users ?? [],
      entries: data?.entries ?? [],
      me,
      getPick,
      countKickouts: (userId) =>
        Object.values(data?.picks ?? {}).filter((p) => p.userId === userId && p.kickOut).length,
      entriesFor: (userId) => (data?.entries ?? []).filter((e) => e.userId === userId),
      userColorIndex: (userId) => Math.max(0, (data?.users ?? []).findIndex((u) => u.id === userId)),

      pickProfile(id) { writeMe(id); setMeIdState(id); },

      // Throws if the server refuses the name (e.g. taken); the caller shows the error.
      async addUser(name) {
        const u = await api.post("/api/tv/users", { name });
        await refresh();
        writeMe(u.id);
        setMeIdState(u.id);
      },

      // Not optimistic: the server may refuse a taken name, and the caller shows that error.
      async renameUser(id, name) {
        await api.patch(`/api/tv/users/${id}`, { name });
        version.current++;
        setData((d) => ({ ...d, users: d.users.map((u) => (u.id === id ? { ...u, name } : u)) }));
        refresh();
      },

      setPick(showId, patch) {
        if (!me) return;
        const key = pickKey(me.id, showId);
        return write(
          () => api.put(`/api/tv/picks/${me.id}/${showId}`, patch),
          () => setData((d) => ({ ...d, picks: { ...d.picks, [key]: { ...(d.picks[key] ?? defaultPick(me.id, showId)), ...patch } } })),
        );
      },

      addEntry(title, notes) {
        if (!me || data.entries.filter((e) => e.userId === me.id).length >= CUSTOM_ENTRY_CAP) return;
        return write(() => api.post("/api/tv/entries", { userId: me.id, title, notes }));
      },

      removeEntry(id) {
        return write(
          () => api.del(`/api/tv/entries/${id}`),
          () => setData((d) => ({ ...d, entries: d.entries.filter((e) => e.id !== id) })),
        );
      },
    };
  }, [data, error, me, write, refresh]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}
