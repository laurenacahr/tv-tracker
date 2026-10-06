import { useState } from "react";
import { CUSTOM_ENTRY_CAP, KICKOUT_CAP, SHOWS } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";

export default function Additions() {
  const { me, entriesFor, getPick, setPick, addEntry, updateEntry, removeEntry } = useStore();
  const [title, setTitle] = useState("");
  const [why, setWhy] = useState("");
  // The card being edited: { kind: "entry", id, title, notes } or { kind: "cut", id, notes }
  const [editing, setEditing] = useState(null);

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

  const saveEdit = () => {
    if (editing.kind === "entry") {
      const t = editing.title.trim();
      if (!t) return;
      updateEntry(editing.id, { title: t, notes: editing.notes.trim() });
    } else {
      setPick(editing.id, { notes: editing.notes });
    }
    setEditing(null);
  };
  const editKeys = (e) => {
    if (e.key === "Escape") setEditing(null);
    if (e.key === "Enter" && e.target.tagName === "INPUT") saveEdit();
  };
  const editButtons = (
    <div className="row-flex">
      <button className="primary" onClick={saveEdit} disabled={editing?.kind === "entry" && !editing.title.trim()}>Save</button>
      <button className="ghost" onClick={() => setEditing(null)}>Cancel</button>
    </div>
  );

  return (
    <>
      <p className="helper" style={{ marginBottom: 10 }}>
        Up to {CUSTOM_ENTRY_CAP} shows you think NYT missed, and up to {KICKOUT_CAP} you'd cut from the list.
      </p>
      <h3 className="section-title" style={{ marginTop: 0 }}>Shows I'd add ({mine.length}/{CUSTOM_ENTRY_CAP})</h3>
      <div className="card-list">
        {mine.length ? mine.map((c) => editing?.kind === "entry" && editing.id === c.id ? (
          <div className="mini-card edit-card" key={c.id}>
            <input type="text" aria-label="Show title" maxLength={120} autoFocus value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })} onKeyDown={editKeys} />
            <input type="text" aria-label="Why?" placeholder="Why? (optional)" maxLength={500} value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })} onKeyDown={editKeys} />
            {editButtons}
          </div>
        ) : (
          <div className="mini-card" key={c.id}>
            <div>
              <div className="mini-card-title">{c.title}</div>
              {c.notes && <div className="mini-card-meta">{c.notes}</div>}
            </div>
            <div className="card-actions">
              <button className="ghost" onClick={() => setEditing({ kind: "entry", id: c.id, title: c.title, notes: c.notes })}>Edit</button>
              <button className="ghost" onClick={() => removeEntry(c.id)}>Remove</button>
            </div>
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
        {cutShows.length ? cutShows.map((s) => editing?.kind === "cut" && editing.id === s.id ? (
          <div className="mini-card edit-card" key={s.id}>
            <div className="mini-card-title">{s.title} <span className="helper">NYT #{s.nytRank}</span></div>
            <textarea aria-label={`Notes on ${s.title}`} placeholder="Why cut it?" maxLength={4000} autoFocus value={editing.notes}
              onChange={(e) => setEditing({ ...editing, notes: e.target.value })} onKeyDown={editKeys} />
            <div className="helper">This is your note on the show, so it also updates in the show window and on Compare.</div>
            {editButtons}
          </div>
        ) : (
          <div className="mini-card" key={s.id}>
            <div>
              <div className="mini-card-title">{s.title}</div>
              <div className="mini-card-meta">NYT #{s.nytRank}{s.notes && ` — ${s.notes}`}</div>
            </div>
            <div className="card-actions">
              <button className="ghost" onClick={() => setEditing({ kind: "cut", id: s.id, notes: s.notes })}>Edit note</button>
              <button className="ghost" onClick={() => setPick(s.id, { kickOut: false })}>Remove</button>
            </div>
          </div>
        )) : <p className="empty-note">Nothing marked to cut yet — do that from a show's detail page.</p>}
      </div>
    </>
  );
}
