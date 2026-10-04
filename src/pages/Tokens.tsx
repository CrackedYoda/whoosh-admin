import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request, type Token } from "../api";
import { useSession } from "../App";
import { EXPLORER, ago, short } from "../format";
import { Badge, QueryState } from "./common";

type Filter = "all" | "true" | "false";

export function TokensPage() {
  const s = useSession();
  const client = useQueryClient();
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const id = setTimeout(() => setQ(input.trim()), 300);
    return () => clearTimeout(id);
  }, [input]);

  const params = new URLSearchParams({ limit: "200" });
  if (q) params.set("q", q);
  if (filter !== "all") params.set("verified", filter);
  const tokens = useQuery({
    queryKey: ["tokens", s.api, q, filter],
    queryFn: () => request<Token[]>(s, `/v1/admin/tokens?${params}`),
  });

  const verify = useMutation({
    mutationFn: ({ address, verified }: { address: string; verified: boolean }) =>
      request(s, `/v1/admin/tokens/${address}/verified`, {
        method: "POST",
        body: JSON.stringify({ verified }),
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["tokens"] });
      void client.invalidateQueries({ queryKey: ["overview"] });
    },
  });

  return (
    <>
      <div className="head">
        <h1>Tokens</h1>
        <div className="seg">
          {(
            [
              ["all", "All"],
              ["true", "Verified"],
              ["false", "Unverified"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} className={id === filter ? "active" : ""} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <input
        className="search"
        placeholder="Search by symbol, name or contract address"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p className="muted small">
        Robinhood Chain tokens. Verifying removes the unverified warning from quotes immediately. A
        token appears here once someone has looked it up or it is on the token list.
      </p>
      {verify.error && <p className="error">{(verify.error as Error).message}</p>}
      <QueryState error={tokens.error} loading={tokens.isLoading} empty={tokens.data?.length === 0} />
      {!!tokens.data?.length && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Contract</th>
                <th>Tags</th>
                <th>Honeypot</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {tokens.data.map((t) => (
                <tr key={t.address}>
                  <td>
                    <div className="token">
                      {t.logoUrl ? <img src={t.logoUrl} alt="" /> : <span className="glyph">{t.symbol.slice(0, 2)}</span>}
                      <div>
                        <strong>{t.symbol}</strong>
                        <div className="muted small">{t.name}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a href={EXPLORER.robinhood.address + t.address} target="_blank" rel="noreferrer" className="mono">
                      {short(t.address, 8, 6)}
                    </a>
                  </td>
                  <td>
                    {t.tags.map((tag) => (
                      <Badge key={tag} tone={tag === "verified" ? "ok" : tag === "unverified" ? "warn" : "muted"}>
                        {tag}
                      </Badge>
                    ))}
                  </td>
                  <td>
                    <Badge
                      tone={
                        t.honeypotStatus === "clean"
                          ? "ok"
                          : t.honeypotStatus === "trapped"
                            ? "bad"
                            : t.honeypotStatus === "taxed"
                              ? "warn"
                              : "muted"
                      }
                    >
                      {t.honeypotStatus}
                      {t.sellTaxBps ? ` ${(t.sellTaxBps / 100).toFixed(1)}%` : ""}
                    </Badge>
                  </td>
                  <td className="muted">{ago(t.updatedAt)}</td>
                  <td>
                    <button
                      className={t.verified ? "ghost" : "primary"}
                      disabled={verify.isPending}
                      onClick={() => {
                        const action = t.verified ? "Unverify" : "Verify";
                        if (confirm(`${action} ${t.symbol} (${t.address})?`)) {
                          verify.mutate({ address: t.address, verified: !t.verified });
                        }
                      }}
                    >
                      {t.verified ? "Unverify" : "Verify"}
                    </button>
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
