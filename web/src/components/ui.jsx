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

// Loud reminder of whose data is being edited, tinted with that person's color.
export function EditingAs({ name, index }) {
  return (
    <span className="editing-badge" style={{ "--who": `var(--u-${index % 7})` }}>
      <UserDot index={index} /><span className="editing-label">Editing as</span> <strong>{name}</strong>
    </span>
  );
}
