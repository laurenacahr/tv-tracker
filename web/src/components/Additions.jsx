import { useState } from "react";
import { CUSTOM_ENTRY_CAP, KICKOUT_CAP, SHOWS } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";

export default function Additions() {
  const { me, entriesFor, getPick, addEntry, removeEntry } = useStore();
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");

  const mine = entriesFor(me.id);
  const full = mine.length >= CUSTOM_ENTRY_CAP;
  const cutShows = SHOWS.map((s) => ({ ...s, ...getPick(me.id, s.id) })).filter((s) => s.kickOut);

  const add = () => {
    const t = title.trim();
    if (!t || full) return;
    addEntry(t, why.trim());
    setTitle("");
    setWhy("");
  };

  return (
    <>
      <p className="helper" style={{ marginBottom: 10 }}>
        Up to {CUSTOM_ENTRY_CAP} shows you think NYT missed, and up to {KICKOUT_CAP} you'd cut from the list.
      </p>
      <h3 className="section-title" style={{ marginTop: 0 }}>Shows I'd add ({mine.length}/{CUSTOM_ENTRY_CAP})</h3>
      <div className="card-list">
        {mine.length ? mine.map((c) => (
          <div className="mini-card" key={c.id}>
            <div>
              <div className="mini-card-title">{c.title}</div>
              {c.notes && <div className="mini-card-meta">{c.notes}</div>}
            </div>
            <button className="ghost" onClick={() => removeEntry(c.id)}>Remove</button>
          </div>
        )) : <p className="empty-note">Nothing added yet.</p>}
      </div>
      <div className="row-flex" style={{ marginTop: 12 }}>
        <input type="text" placeholder="Show title" maxLength={120} disabled={full} value={title}
          onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <input type="text" placeholder="Why? (optional)" maxLength={500} disabled={full} value={why}
          onChange={(e) => setWhy(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="primary" disabled={full} onClick={add}>Add</button>
      </div>

      <h3 className="section-title">Shows I'd cut ({cutShows.length}/{KICKOUT_CAP})</h3>
      <div className="card-list">
        {cutShows.length ? cutShows.map((s) => (
          <div className="mini-card" key={s.id}>
            <div>
              <div className="mini-card-title">{s.title}</div>
              <div className="mini-card-meta">NYT #{s.nytRank}{s.notes && ` — ${s.notes}`}</div>
            </div>
          </div>
        )) : <p className="empty-note">Nothing marked to cut yet — do that from a show's detail page.</p>}
      </div>
    </>
  );
}
