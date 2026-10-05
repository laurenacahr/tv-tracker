import { useState } from "react";
import { SHOWS, TIERS } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";
import { StatusPill, TierChip, UserDot } from "./ui.jsx";

export default function Compare() {
  const { users, entries, getPick, userColorIndex } = useStore();
  const [asTable, setAsTable] = useState(false);
  const [showId, setShowId] = useState("");
  const [tip, setTip] = useState(null);

  const tierCounts = (userId) => {
    const counts = [0, 0, 0, 0, 0, 0];
    let tiered = 0;
    for (const s of SHOWS) {
      const t = getPick(userId, s.id).tier;
      if (t !== null) { counts[t]++; tiered++; }
    }
    return { counts, tiered };
  };

  const cutBy = {};
  for (const s of SHOWS) for (const u of users) if (getPick(u.id, s.id).kickOut) (cutBy[s.id] ||= []).push(u.name);
  const cutIds = Object.keys(cutBy).map(Number);

  const show = SHOWS.find((s) => s.id === Number(showId));
  const owner = (id) => users.find((u) => u.id === id);

  return (
    <>
      <h3 className="section-title" style={{ marginTop: 0 }}>Stacked ranking by tranche</h3>
      <div className="legend">
        {TIERS.map((t, i) => (
          <span className="legend-item" key={t.short}>
            <span className="legend-swatch" style={{ background: `var(--tier-${i})` }} />{t.label}
          </span>
        ))}
        <span className="legend-item">
          <span className="legend-swatch" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }} />Not yet tiered
        </span>
      </div>
      <button className="table-toggle" onClick={() => setAsTable(!asTable)}>
        {asTable ? "Show as chart" : "Show as table"}
      </button>

      {asTable ? (
        <table className="compare-table">
          <thead><tr><th>Person</th>{TIERS.map((t) => <th key={t.short}>{t.short}</th>)}<th>Untiered</th></tr></thead>
          <tbody>
            {users.map((u) => {
              const { counts, tiered } = tierCounts(u.id);
              return <tr key={u.id}><td>{u.name}</td>{counts.map((c, i) => <td key={i}>{c}</td>)}<td>{100 - tiered}</td></tr>;
            })}
          </tbody>
        </table>
      ) : users.map((u) => {
        const { counts, tiered } = tierCounts(u.id);
        const remainder = 100 - tiered;
        const seg = (key, width, color, text) => (
          <div key={key} className="stack-seg" style={{ width: `${width}%`, background: color }}
            onMouseMove={(e) => setTip({ text, x: e.clientX + 14, y: e.clientY + 14 })}
            onMouseLeave={() => setTip(null)} />
        );
        return (
          <div className="user-row" key={u.id}>
            <div className="user-row-label">
              <span className="user-tag"><UserDot index={userColorIndex(u.id)} />{u.name}</span>
              <span className="helper">{tiered}/100 tiered</span>
            </div>
            <div className="stack-bar">
              {counts.map((c, i) => c > 0 && seg(i, c, `var(--tier-${i})`, `${TIERS[i].label}: ${c} show${c === 1 ? "" : "s"}`))}
              {remainder > 0 && seg("rest", remainder, "var(--surface-2)", `Not yet tiered: ${remainder} shows`)}
            </div>
          </div>
        );
      })}
      {tip && <div className="tooltip" style={{ display: "block", left: tip.x, top: tip.y }}>{tip.text}</div>}

      <h3 className="section-title">Compare a show</h3>
      <select className="search-box" value={showId} onChange={(e) => setShowId(e.target.value)}>
        <option value="">Search a show…</option>
        {SHOWS.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
      </select>
      {show && (
        <div>
          {users.map((u) => {
            const p = getPick(u.id, show.id);
            return (
              <div className="note-card" key={u.id}>
                <div className="note-card-head">
                  <span className="user-tag"><UserDot index={userColorIndex(u.id)} />{u.name}</span>
                  <span className="badges">
                    <StatusPill status={p.status} />
                    <TierChip tier={p.tier} />
                    {p.personalRank != null && <span className="helper">rank #{p.personalRank}</span>}
                    {p.watchlisted && <span className="pill pill-watchlist">★</span>}
                    {p.kickOut && <span className="pill pill-cut">would cut</span>}
                  </span>
                </div>
                <div className="note-body">{p.notes || <span className="helper">No notes yet.</span>}</div>
              </div>
            );
          })}
          <div className="helper" style={{ marginTop: 4 }}>NYT rank #{show.nytRank}</div>
        </div>
      )}

      <h3 className="section-title">Proposed additions</h3>
      {entries.length ? (
        <div className="card-list">
          {entries.map((c) => (
            <div className="mini-card" key={c.id}>
              <div>
                <div className="mini-card-title">{c.title}</div>
                <div className="mini-card-meta">{owner(c.userId)?.name ?? "?"}{c.notes && ` — ${c.notes}`}</div>
              </div>
            </div>
          ))}
        </div>
      ) : <p className="empty-note">No one has proposed additions yet.</p>}

      <h3 className="section-title">Proposed cuts</h3>
      {cutIds.length ? (
        <div className="card-list">
          {cutIds.map((id) => (
            <div className="mini-card" key={id}>
              <div className="mini-card-title">{SHOWS.find((s) => s.id === id).title}</div>
              <div className="mini-card-meta">{cutBy[id].join(", ")}</div>
            </div>
          ))}
        </div>
      ) : <p className="empty-note">No cuts proposed yet.</p>}
    </>
  );
}
