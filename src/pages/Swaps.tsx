import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { request, type Swap } from "../api";
import { useSession } from "../App";
import { EXPLORER, ago, short, usd } from "../format";
import { Badge, QueryState, statusTone } from "./common";

export function SwapsPage() {
  const s = useSession();
  const [chain, setChain] = useState<"robinhood" | "solana">("robinhood");
  const swaps = useQuery({
    queryKey: ["swaps", s.api, chain],
    queryFn: () => request<Swap[]>(s, `/v1/admin/swaps?chain=${chain}&limit=100`),
    refetchInterval: 20_000,
  });
  const ex = EXPLORER[chain];

  return (
    <>
      <div className="head">
        <h1>Swaps</h1>
        <div className="seg">
          {(["robinhood", "solana"] as const).map((c) => (
            <button key={c} className={c === chain ? "active" : ""} onClick={() => setChain(c)}>
              {c === "robinhood" ? "Robinhood" : "Solana"}
            </button>
          ))}
        </div>
      </div>
      <QueryState error={swaps.error} loading={swaps.isLoading} empty={swaps.data?.length === 0} />
      {!!swaps.data?.length && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Pair</th>
                <th>Value</th>
                <th>Source</th>
                <th>Status</th>
                <th>Trader</th>
                <th>Tx</th>
              </tr>
            </thead>
            <tbody>
              {swaps.data.map((w) => (
                <tr key={w.id}>
                  <td title={w.createdAt}>{ago(w.createdAt)}</td>
                  <td>
                    {w.symbolIn || short(w.tokenIn, 4, 4)} → {w.symbolOut || short(w.tokenOut, 4, 4)}
                  </td>
                  <td className="num">{w.usdValue ? usd(w.usdValue) : "–"}</td>
                  <td>{w.source || "–"}</td>
                  <td>
                    <Badge tone={statusTone(w.status)}>{w.status}</Badge>
                  </td>
                  <td>
                    {w.taker ? (
                      <a href={ex.address + w.taker} target="_blank" rel="noreferrer" className="mono">
                        {short(w.taker)}
                      </a>
                    ) : (
                      "–"
                    )}
                  </td>
                  <td>
                    <a href={ex.tx + w.id} target="_blank" rel="noreferrer" className="mono">
                      {short(w.id, 8, 6)}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
