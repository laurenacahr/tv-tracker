import { useState } from "react";
import { useStore } from "../lib/store.jsx";

export default function UserPicker() {
  const { users, pickProfile, addUser } = useStore();
  const [name, setName] = useState("");

  const add = () => {
    const n = name.trim();
    if (n) addUser(n);
  };

  return (
    <div className="picker-wrap">
      <h1>Who's watching?</h1>
      <p className="helper">Pick your profile, or add a new one. Everyone's picks are shared live.</p>
      <div className="picker-list">
        {users.map((u) => <button key={u.id} onClick={() => pickProfile(u.id)}>{u.name}</button>)}
      </div>
      <div className="row-flex" style={{ justifyContent: "center" }}>
        <input type="text" placeholder="Your name" maxLength={40} value={name}
          onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} />
        <button className="primary" onClick={add}>Add profile</button>
      </div>
    </div>
  );
}
