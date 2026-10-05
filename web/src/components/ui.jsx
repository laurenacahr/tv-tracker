import { STATUSES, TIERS } from "../lib/shows.js";

export function StatusPill({ status }) {
  const s = STATUSES.find((x) => x.id === status) ?? STATUSES[0];
  return <span className={`pill pill-${s.id}`}>{s.label}</span>;
}

export function TierChip({ tier }) {
  if (tier === null || tier === undefined) return <span className="helper">not tiered</span>;
  return <span className="tier-chip" style={{ background: `var(--tier-${tier})` }}>{TIERS[tier].short}</span>;
}

export function UserDot({ index }) {
  return <span className="user-dot" style={{ background: `var(--u-${index % 7})` }} />;
}
