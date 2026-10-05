import { SHOWS, STATUSES } from "../lib/shows.js";
import { useStore } from "../lib/store.jsx";
import { StatusPill, TierChip } from "./ui.jsx";

export default function MyList({ onOpenShow, sort, setSort, filter, setFilter }) {
  const { me, getPick } = useStore();

  let rows = SHOWS.map((show) => ({ show, pick: getPick(me.id, show.id) }));
  if (filter === "watchlist") rows = rows.filter((r) => r.pick.watchlisted);
  else if (filter !== "all") rows = rows.filter((r) => r.pick.status === filter);

  if (sort === "tier") {
    rows.sort((a, b) => {
      const at = a.pick.tier ?? -1, bt = b.pick.tier ?? -1;
      return at !== bt ? bt - at : a.show.nytRank - b.show.nytRank;
    });
  }

  const rankCounts = {};
  for (const r of rows) if (r.pick.personalRank != null) rankCounts[r.pick.personalRank] = (rankCounts[r.pick.personalRank] || 0) + 1;

  return (
    <>
      <div className="controls-row">
        <label>Sort{" "}
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="tier">By tier</option>
            <option value="rank">By NYT rank</option>
          </select>
        </label>
        <label>Filter{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            <option value="watchlist">Watchlisted</option>
          </select>
        </label>
      </div>
      {rows.length ? (
        <table className="list mylist">
          <thead><tr><th>#</th><th>Show</th><th>Status</th><th>Tier</th><th>My rank</th></tr></thead>
          <tbody>
            {rows.map(({ show, pick }) => {
              const dup = pick.personalRank != null && rankCounts[pick.personalRank] > 1;
              return (
                <tr key={show.id} className="row-clickable" onClick={() => onOpenShow(show.id)}>
                  <td className="rank-cell">{show.nytRank}</td>
                  <td>{show.title}</td>
                  <td>
                    <StatusPill status={pick.status} />
                    {pick.watchlisted && <> <span className="pill pill-watchlist">★</span></>}
                    {pick.kickOut && <> <span className="pill pill-cut">cut</span></>}
                  </td>
                  <td><TierChip tier={pick.tier} /></td>
                  <td>
                    {pick.personalRank != null
                      ? <>{pick.personalRank}{dup && <> <span title="Another show shares this rank" style={{ color: "var(--warning)" }}>⚠</span></>}</>
                      : <span className="helper">—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <p className="empty-note">No shows match this filter yet.</p>}
    </>
  );
}
