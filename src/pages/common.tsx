import type { ReactNode } from "react";

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card stat">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}

export function QueryState({ error, loading, empty }: { error: unknown; loading: boolean; empty?: boolean }) {
  if (error) return <p className="error">{error instanceof Error ? error.message : "Something went wrong."}</p>;
  if (loading) return <p className="muted">Loading…</p>;
  if (empty) return <p className="muted">Nothing here yet.</p>;
  return null;
}

export function Badge({ tone, children }: { tone: "ok" | "warn" | "bad" | "muted"; children: ReactNode }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

export function statusTone(status: string): "ok" | "warn" | "bad" | "muted" {
  if (["success", "confirmed", "finalized"].includes(status)) return "ok";
  if (["pending", "sent", "processed"].includes(status)) return "warn";
  if (["reverted", "failed", "dropped", "expired"].includes(status)) return "bad";
  return "muted";
}
