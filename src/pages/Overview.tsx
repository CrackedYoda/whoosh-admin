import { useQuery } from "@tanstack/react-query";
import { request, type Health, type Overview } from "../api";
import { useSession } from "../App";
import { num, usd } from "../format";
import { Badge, QueryState, Stat } from "./common";

export function OverviewPage() {
  const s = useSession();
  const overview = useQuery({
    queryKey: ["overview", s.api],
    queryFn: () => request<Overview>(s, "/v1/admin/overview"),
    refetchInterval: 30_000,
  });
  const health = useQuery({
    queryKey: ["health", s.api],
    queryFn: () => request<Health>(s, "/healthz"),
    refetchInterval: 30_000,
  });
  const o = overview.data;
  const winners = Object.entries(o?.winners24h ?? {}).sort((a, b) => b[1] - a[1]);
  const maxWins = winners[0]?.[1] ?? 1;

  return (
    <>
      <h1>Overview</h1>
      <QueryState error={overview.error} loading={overview.isLoading} />
      {o && (
        <>
          <section className="grid">
            <Stat
              label="Volume (all time)"
              value={usd(o.evmVolumeUsd + o.solanaVolumeUsd)}
              sub={`${usd(o.evmVolumeUsd24h + o.solanaVolumeUsd24h)} in 24h`}
            />
            <Stat
              label="Robinhood swaps"
              value={num(o.evmSwaps)}
              sub={`${num(o.evmSwaps24h)} in 24h · ${num(o.evmSwapsSuccess)} succeeded`}
            />
            <Stat label="Solana swaps" value={num(o.solanaSwaps)} sub={`${num(o.solanaSwaps24h)} in 24h`} />
            <Stat
              label="Wallets"
              value={num(o.wallets)}
              sub={`${num(o.wallets24h)} new in 24h · ${num(o.referredWallets)} referred`}
            />
            <Stat label="XP issued" value={num(o.totalXp)} />
            <Stat label="Quotes (24h)" value={num(o.quotes24h)} />
            <Stat
              label="Tokens"
              value={num(o.tokens)}
              sub={`${num(o.verifiedTokens)} verified`}
            />
            <Stat
              label="Volume by chain"
              value={
                <span className="split">
                  <span>RH {usd(o.evmVolumeUsd)}</span>
                  <span>SOL {usd(o.solanaVolumeUsd)}</span>
                </span>
              }
            />
          </section>

          <section className="two">
            <div className="card">
              <h2>Winning sources (24h quotes)</h2>
              {winners.length === 0 && <p className="muted">No quotes in the last 24 hours.</p>}
              {winners.map(([name, n]) => (
                <div key={name} className="bar-row">
                  <span>{name}</span>
                  <div className="bar">
                    <div style={{ width: `${(n / maxWins) * 100}%` }} />
                  </div>
                  <span className="num">{num(n)}</span>
                </div>
              ))}
            </div>
            <div className="card">
              <h2>Backend health</h2>
              <QueryState error={health.error} loading={health.isLoading} />
              {health.data && (
                <>
                  <p>
                    <Badge tone={health.data.status === "ok" ? "ok" : "bad"}>{health.data.status}</Badge>{" "}
                    <span className="muted">chain {health.data.chainId}</span>
                  </p>
                  <table>
                    <tbody>
                      {Object.entries(health.data.components).map(([k, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td>
                            <Badge tone={v.startsWith("ok") ? "ok" : v.startsWith("disabled") ? "muted" : "bad"}>
                              {v}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="muted small">Swap sources: {health.data.sources.join(", ")}</p>
                </>
              )}
            </div>
          </section>
        </>
      )}
    </>
  );
}
