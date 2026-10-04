import { createContext, useContext, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DEFAULT_API, loadSession, request, saveSession, type Overview, type Session } from "./api";
import { OverviewPage } from "./pages/Overview";
import { SwapsPage } from "./pages/Swaps";
import { TokensPage } from "./pages/Tokens";
import { WalletsPage } from "./pages/Wallets";

const SessionContext = createContext<Session | null>(null);

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession outside a session");
  return s;
}

const PAGES = {
  overview: { label: "Overview", Component: OverviewPage },
  swaps: { label: "Swaps", Component: SwapsPage },
  tokens: { label: "Tokens", Component: TokensPage },
  wallets: { label: "Wallets", Component: WalletsPage },
} as const;
type PageId = keyof typeof PAGES;

export function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [page, setPage] = useState<PageId>("overview");
  const client = useQueryClient();

  if (!session) {
    return (
      <Login
        onLogin={(s) => {
          saveSession(s);
          setSession(s);
        }}
      />
    );
  }

  const { Component } = PAGES[page];
  return (
    <SessionContext.Provider value={session}>
      <header className="top">
        <div className="brand">
          whoosh <span>admin</span>
        </div>
        <nav>
          {(Object.keys(PAGES) as PageId[]).map((id) => (
            <button key={id} className={id === page ? "active" : ""} onClick={() => setPage(id)}>
              {PAGES[id].label}
            </button>
          ))}
        </nav>
        <button
          className="ghost"
          onClick={() => {
            saveSession(null);
            client.clear();
            setSession(null);
          }}
        >
          Sign out
        </button>
      </header>
      <main>
        <Component />
      </main>
    </SessionContext.Provider>
  );
}

function Login({ onLogin }: { onLogin: (s: Session) => void }) {
  const [api, setApi] = useState(DEFAULT_API);
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const s = { api: api.trim().replace(/\/$/, ""), token: token.trim() };
    setBusy(true);
    setError(null);
    try {
      // Checked before it is kept, so a typo never becomes a stored session.
      await request<Overview>(s, "/v1/admin/overview");
      onLogin(s);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <form onSubmit={submit} className="card">
        <div className="brand">
          whoosh <span>admin</span>
        </div>
        <label>
          Backend URL
          <input value={api} onChange={(e) => setApi(e.target.value)} placeholder="https://…" required />
        </label>
        <label>
          Admin token
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>
          {busy ? "Checking…" : "Sign in"}
        </button>
        <p className="muted small">The token is kept for this tab only.</p>
      </form>
    </div>
  );
}
