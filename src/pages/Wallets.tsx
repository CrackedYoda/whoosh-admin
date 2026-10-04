import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { request, type Wallet } from "../api";
import { useSession } from "../App";
import { EXPLORER, ago, num, short, usd } from "../format";
import { QueryState } from "./common";

export function WalletsPage() {
  const s = useSession();
  const [input, setInput] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setAddress(/^0x[0-9a-fA-F]{40}$/.test(input.trim()) ? input.trim() : ""), 300);
    return () => clearTimeout(id);
  }, [input]);

  const wallets = useQuery({
    queryKey: ["wallets", s.api, address],
    queryFn: () =>
      request<Wallet[]>(s, `/v1/admin/wallets?limit=200${address ? `&address=${address}` : ""}`),
  });

  return (
    <>
      <h1>Wallets</h1>
      <input
        className="search"
        placeholder="Find a wallet by address (0x…)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p className="muted small">Robinhood Chain wallets that have earned XP or used a referral, highest XP first.</p>
      <QueryState error={wallets.error} loading={wallets.isLoading} empty={wallets.data?.length === 0} />
      {!!wallets.data?.length && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Wallet</th>
                <th className="num">XP</th>
                <th className="num">Volume</th>
                <th className="num">Swaps</th>
                <th>Referral code</th>
                <th className="num">Referees</th>
                <th>Referred by</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {wallets.data.map((w) => (
                <tr key={w.address}>
                  <td>
                    <a href={EXPLORER.robinhood.address + w.address} target="_blank" rel="noreferrer" className="mono">
                      {short(w.address)}
                    </a>
                  </td>
                  <td className="num">{num(w.xp)}</td>
                  <td className="num">{usd(w.volumeUsd)}</td>
                  <td className="num">{num(w.swaps)}</td>
                  <td className="mono">{w.referralCode}</td>
                  <td className="num">{num(w.referees)}</td>
                  <td className="mono">{w.referredBy ? short(w.referredBy) : "–"}</td>
                  <td className="muted" title={w.createdAt}>
                    {ago(w.createdAt)}
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
