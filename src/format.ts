export function usd(n: number | undefined): string {
  if (n === undefined || !Number.isFinite(n)) return "–";
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: n >= 1000 ? 0 : 2,
  });
}

export function num(n: number | undefined): string {
  return n === undefined ? "–" : n.toLocaleString();
}

export function short(addr: string | undefined, head = 6, tail = 4): string {
  if (!addr) return "–";
  return addr.length <= head + tail + 1 ? addr : `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${Math.floor(s)}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const EXPLORER = {
  robinhood: { tx: "https://robin.etherscan.io/tx/", address: "https://robin.etherscan.io/address/" },
  solana: { tx: "https://solscan.io/tx/", address: "https://solscan.io/account/" },
} as const;
