import { useState } from "react";
import { useStore } from "../lib/store.jsx";

export default function UserPicker() {
  const { users, pickProfile, addUser, renameUser } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  // While renaming a profile: { id, value }
  const [renaming, setRenaming] = useState(null);
  const [renameError, setRenameError] = useState(null);

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    try { await addUser(n); } catch (e) { setError(e.message); }
  };

  const editRename = (next) => { setRenaming(next); setRenameError(null); };
  const saveRename = async () => {
    const n = renaming.value.trim();
    if (!n) return;
    try {
      if (n !== users.find((u) => u.id === renaming.id)?.name) await renameUser(renaming.id, n);
      editRename(null);
    } catch (e) {
      setRenameError(e.message);
    }
  };

  return (
    <div className="picker-wrap">
      <h1>Who's watching?</h1>
      <p className="helper">Add a new profile, or pick yours below. Everyone's picks are shared live.</p>
      <div className="row-flex" style={{ justifyContent: "center", marginTop: 20 }}>
        <input type="text" placeholder="Your name" maxLength={40} value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="primary" onClick={add}>Add profile</button>
      </div>
      {error && <p className="name-error" role="alert">{error}</p>}
      <div className="picker-list">
        {users.map((u) => renaming?.id === u.id ? (
          <div className="picker-row" key={u.id}>
            <input type="text" className="name-input" aria-label={`New name for ${u.name}`} maxLength={40} autoFocus
              value={renaming.value} onFocus={(e) => e.target.select()}
              onChange={(e) => editRename({ ...renaming, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") saveRename(); if (e.key === "Escape") editRename(null); }} />
            <button className="primary" onClick={saveRename} disabled={!renaming.value.trim()}>Save</button>
            <button className="ghost" onClick={() => editRename(null)}>Cancel</button>
            {renameError && <span className="name-error" role="alert">{renameError}</span>}
          </div>
        ) : (
          <div className="picker-row" key={u.id}>
            <button onClick={() => pickProfile(u.id)}>{u.name}</button>
            <button className="ghost icon-btn" onClick={() => editRename({ id: u.id, value: u.name })}
              title={`Rename ${u.name}`} aria-label={`Rename ${u.name}`}>✎</button>
          </div>
        ))}
      </div>
    </div>
  );
}
