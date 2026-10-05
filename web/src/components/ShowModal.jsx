import { useEffect, useRef, useState } from "react";
import { KICKOUT_CAP, SHOWS, STATUSES, TIERS } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";
import { EditingAs } from "./ui.jsx";

// Runs `fn` once the value has stopped changing for `ms`. The pending call is
// deliberately not cancelled on unmount, so closing the modal right after a
// change doesn't drop it.
function useDebouncedSave(fn, ms) {
  const timer = useRef(null);
  const latest = useRef(fn);
  latest.current = fn;
  return (...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => latest.current(...args), ms);
  };
}

export default function ShowModal({ showId, onClose }) {
  const { me, getPick, setPick, countKickouts, userColorIndex } = useStore();
  const show = SHOWS.find((s) => s.id === showId);
  const pick = getPick(me.id, showId);

  // Text-like fields are edited locally and saved after a pause, so one
  // keystroke or slider drag isn't one request; polling can't overwrite a draft.
  const [tier, setTier] = useState(pick.tier ?? -1);
  const [rank, setRank] = useState(pick.personalRank ?? "");
  const [notes, setNotes] = useState(pick.notes);
  const saveTier = useDebouncedSave((v) => setPick(showId, { tier: v === -1 ? null : v }), 250);
  const saveNotes = useDebouncedSave((v) => setPick(showId, { notes: v }), 400);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const kickCount = countKickouts(me.id);
  const kickDisabled = !pick.kickOut && kickCount >= KICKOUT_CAP;

  const commitRank = () => {
    if (rank === "") return setPick(showId, { personalRank: null });
    const v = Math.max(1, Math.min(100, Math.round(Number(rank))));
    setRank(v);
    setPick(showId, { personalRank: v });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <h2>{show.title}</h2>
            <div className="modal-sub">NYT rank #{show.nytRank}</div>
          </div>
          <button className="ghost" aria-label="Close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-editing"><EditingAs name={me.name} index={userColorIndex(me.id)} /></div>

        <div className="field">
          <label className="field-label">Status</label>
          <div className="btn-group">
            {STATUSES.map((s) => (
              <button key={s.id} className={pick.status === s.id ? "on" : ""}
                onClick={() => setPick(showId, { status: s.id })}>{s.label}</button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Watchlist</label>
          <button className={pick.watchlisted ? "on" : ""}
            onClick={() => setPick(showId, { watchlisted: !pick.watchlisted })}>
            {pick.watchlisted ? "★ On watchlist" : "☆ Add to watchlist"}
          </button>
        </div>

        <div className="field">
          <label className="field-label">Draft tier</label>
          <div className="slider-wrap">
            <input type="range" min="-1" max="5" step="1" value={tier}
              onChange={(e) => { const v = Number(e.target.value); setTier(v); saveTier(v); }} />
            <div className="slider-ticks">
              <span>unranked</span>{TIERS.map((t) => <span key={t.short}>{t.short}</span>)}
            </div>
            <div className="slider-current">{tier === -1 ? "Not yet ranked" : TIERS[tier].label}</div>
          </div>
        </div>

        <div className="field">
          <label className="field-label">Personal exact rank (optional)</label>
          <input type="number" min="1" max="100" placeholder="e.g. 7" style={{ width: 100 }}
            value={rank} onChange={(e) => setRank(e.target.value)} onBlur={commitRank}
            onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
          <div className="helper">Leave blank until you've tiered everything, then fill in exact order if you want one.</div>
        </div>

        <div className="field">
          <label className="field-label">Would you cut this from the list?</label>
          <button className={pick.kickOut ? "on" : ""} disabled={kickDisabled}
            onClick={() => setPick(showId, { kickOut: !pick.kickOut })}>
            {pick.kickOut ? "✂ Marked to cut" : "Mark to cut"}
          </button>
          <div className="cap-note">
            {kickCount} / {KICKOUT_CAP} cuts used{kickDisabled && " — remove one elsewhere to add this"}
          </div>
        </div>

        <div className="field">
          <label className="field-label">Notes (visible to everyone)</label>
          <textarea placeholder="Your take..." maxLength={4000} value={notes}
            onChange={(e) => { setNotes(e.target.value); saveNotes(e.target.value); }} />
        </div>
      </div>
    </div>
  );
}
