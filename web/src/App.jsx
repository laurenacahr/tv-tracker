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
  const { loaded, error, me, users, pickProfile, addUser, renameMe, userColorIndex } = useStore();
  const [openShowId, setOpenShowId] = useState(null);
  const [sort, setSort] = useState("tier");
  const [filter, setFilter] = useState("all");
  // While naming a profile in the header: { mode: "rename" | "new", value }
  const [nameEdit, setNameEdit] = useState(null);
  const [nameError, setNameError] = useState(null);

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

  const editName = (next) => { setNameEdit(next); setNameError(null); };
  const onProfileChange = (e) => {
    if (e.target.value === "__new") editName({ mode: "new", value: "" });
    else pickProfile(e.target.value);
  };
  const saveName = async () => {
    const name = nameEdit.value.trim();
    if (!name) return;
    try {
      if (nameEdit.mode === "new") await addUser(name);
      else if (name !== me.name) await renameMe(name);
      editName(null);
    } catch (e) {
      setNameError(e.message);
    }
  };

  return (
    <>
      <header className="app-header">
        <h1>TV Tracker</h1>
        <div className="user-switch">
          <UserDot index={userColorIndex(me.id)} />
          {nameEdit === null ? (
            <>
              <select value={me.id} onChange={onProfileChange}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                <option value="__new">+ New profile…</option>
              </select>
              <button className="ghost icon-btn" onClick={() => editName({ mode: "rename", value: me.name })} title="Rename this profile" aria-label="Rename this profile">✎</button>
            </>
          ) : (
            <>
              <input type="text" className="name-input" maxLength={40} autoFocus value={nameEdit.value}
                aria-label={nameEdit.mode === "new" ? "New profile name" : "Profile name"}
                placeholder={nameEdit.mode === "new" ? "New profile name" : undefined}
                onChange={(e) => editName({ ...nameEdit, value: e.target.value })} onFocus={(e) => e.target.select()}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") editName(null); }} />
              <button className="primary" onClick={saveName} disabled={!nameEdit.value.trim()}>
                {nameEdit.mode === "new" ? "Add" : "Save"}
              </button>
              <button className="ghost" onClick={() => editName(null)}>Cancel</button>
              {nameError && <span className="name-error" role="alert">{nameError}</span>}
            </>
          )}
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
