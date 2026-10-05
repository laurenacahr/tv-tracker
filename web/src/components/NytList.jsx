import { SHOWS } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";
import { StatusPill, TierChip } from "./ui.jsx";

export default function NytList({ onOpenShow }) {
  const { me, getPick } = useStore();
  return (
    <>
      <p className="helper" style={{ marginBottom: 14 }}>
        The full published ranking, for reference. Click a show to add your own take.
      </p>
      <table className="list">
        <thead><tr><th>#</th><th>Show</th><th>Your status</th><th>Your tier</th></tr></thead>
        <tbody>
          {SHOWS.map((s) => {
            const pick = getPick(me.id, s.id);
            return (
              <tr key={s.id} className="row-clickable" onClick={() => onOpenShow(s.id)}>
                <td className="rank-cell">{s.nytRank}</td>
                <td>{s.title}</td>
                <td>
                  <StatusPill status={pick.status} />
                  {pick.watchlisted && <> <span className="pill pill-watchlist">★ Watchlist</span></>}
                </td>
                <td><TierChip tier={pick.tier} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
