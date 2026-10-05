import { useState } from "react";
import { useStore } from "../lib/store.jsx";

export default function UserPicker() {
  const { users, pickProfile, addUser } = useStore();
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    try { await addUser(n); } catch (e) { setError(e.message); }
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
        {users.map((u) => <button key={u.id} onClick={() => pickProfile(u.id)}>{u.name}</button>)}
      </div>
    </div>
  );
}
