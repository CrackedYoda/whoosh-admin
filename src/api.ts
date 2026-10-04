/** Talks to the backend's /v1/admin routes with the operator's token.
 *
 * The token lives in sessionStorage only: it is gone when the tab closes,
 * and it is never sent anywhere but the configured backend. */

const TOKEN_KEY = "whoosh-admin-token";
const URL_KEY = "whoosh-admin-api";
export const DEFAULT_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";

export interface Session {
  api: string;
  token: string;
}

export function loadSession(): Session | null {
  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const api = sessionStorage.getItem(URL_KEY) ?? DEFAULT_API;
    return token && api ? { api, token } : null;
  } catch {
    return null;
  }
}

export function saveSession(s: Session | null) {
  try {
    if (s) {
      sessionStorage.setItem(TOKEN_KEY, s.token);
      sessionStorage.setItem(URL_KEY, s.api);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* storage blocked: the session just lasts until reload */
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export async function request<T>(s: Session, path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(s.api + path, {
      ...init,
      headers: {
        Authorization: `Bearer ${s.token}`,
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new ApiError("Couldn't reach the backend. Check the URL and that it allows this origin (CORS).", 0);
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      res.status === 401
        ? "That admin token was rejected."
        : res.status === 404 && path.startsWith("/v1/admin")
          ? "The admin API is disabled on this backend. Set ADMIN_TOKEN (32+ characters)."
          : (body?.error?.message ?? `Request failed (${res.status}).`);
    throw new ApiError(message, res.status);
  }
  return (body?.data ?? body) as T;
}

export interface Overview {
  evmSwaps: number;
  evmSwapsSuccess: number;
  evmSwaps24h: number;
  evmVolumeUsd: number;
  evmVolumeUsd24h: number;
  solanaSwaps: number;
  solanaSwaps24h: number;
  solanaVolumeUsd: number;
  solanaVolumeUsd24h: number;
  wallets: number;
  referredWallets: number;
  wallets24h: number;
  totalXp: number;
  quotes24h: number;
  winners24h: Record<string, number>;
  tokens: number;
  verifiedTokens: number;
}

export interface Health {
  status: string;
  chainId: number;
  sources: string[];
  components: Record<string, string>;
}

export interface Swap {
  chain: "robinhood" | "solana";
  id: string;
  taker: string;
  source: string;
  tokenIn: string;
  tokenOut: string;
  symbolIn?: string;
  symbolOut?: string;
  amountIn: string;
  amountOut?: string;
  usdValue?: number;
  status: string;
  createdAt: string;
  settledAt?: string;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
  tags: string[];
  verified: boolean;
  honeypotStatus: string;
  sellTaxBps: number;
  updatedAt: string;
}

export interface Wallet {
  address: string;
  referralCode: string;
  referredBy?: string;
  referees: number;
  xp: number;
  volumeUsd: number;
  swaps: number;
  createdAt: string;
}
