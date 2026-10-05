import { useState } from "react";
import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { useStore } from "./lib/store.jsx";
import { UserDot } from "./components/ui.jsx";
import UserPicker from "./components/UserPicker.jsx";
import NytList from "./components/NytList.jsx";
import MyList from "./components/MyList.jsx";
import Additions from "./components/Additions.jsx";
import Compare from "./components/Compare.jsx";
import ShowModal from "./components/ShowModal.jsx";

const TABS = [
  ["/nyt", "NYT List"],
  ["/mine", "My List"],
  ["/additions", "Additions & Cuts"],
  ["/compare", "Compare"],
];

export default function App() {
  const { loaded, error, me, users, pickProfile, addUser, userColorIndex } = useStore();
  const [openShowId, setOpenShowId] = useState(null);
  const [sort, setSort] = useState("tier");
  const [filter, setFilter] = useState("all");

  if (!loaded) {
    return error ? (
      <div className="picker-wrap">
        <h1>Couldn't connect</h1>
        <p className="helper">{error}</p>
        <button className="primary" onClick={() => location.reload()}>Retry</button>
      </div>
    ) : <div className="picker-wrap"><h1>Loading…</h1></div>;
  }
  if (!me) return <UserPicker />;

  const onProfileChange = (e) => {
    if (e.target.value !== "__new") return pickProfile(e.target.value);
    const name = prompt("Name for the new profile?");
    if (name?.trim()) addUser(name.trim());
  };

  return (
    <>
      <header className="app-header">
        <h1>TV Tracker</h1>
        <div className="user-switch">
          <UserDot index={userColorIndex(me.id)} />
          <select value={me.id} onChange={onProfileChange}>
            {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            <option value="__new">+ New profile…</option>
          </select>
        </div>
      </header>

      {error && <p className="helper" role="status">Can't reach the server. Showing the last data we had; retrying…</p>}

      <nav className="tabs">
        {TABS.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
      </nav>

      <Routes>
        <Route path="/" element={<Navigate to="/nyt" replace />} />
        <Route path="/nyt" element={<NytList onOpenShow={setOpenShowId} />} />
        <Route path="/mine" element={<MyList onOpenShow={setOpenShowId} sort={sort} setSort={setSort} filter={filter} setFilter={setFilter} />} />
        <Route path="/additions" element={<Additions />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="*" element={<Navigate to="/nyt" replace />} />
      </Routes>

      {openShowId && <ShowModal key={openShowId} showId={openShowId} onClose={() => setOpenShowId(null)} />}
    </>
  );
}
