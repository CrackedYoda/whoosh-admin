# Whoosh Admin

Operator panel for Whoosh. It is a static React app that talks to the
backend's `/v1/admin` API with an admin token.

## Pages

- **Overview**: volume and swap counts on both chains (all time and the last 24h),
  wallets, XP issued, quotes and the sources that won them, token counts, and backend health.
- **Swaps**: the latest Robinhood Chain and Solana swaps, with explorer links.
- **Tokens**: search Robinhood Chain tokens, and verify or unverify them. Verifying a token
  removes the "unverified token" warning from its quotes straight away.
- **Wallets**: wallets ranked by XP, with volume, swaps and referrals.

## Backend setup

The backend (whoosh-backend) needs:

| Variable | Value |
| --- | --- |
| `ADMIN_TOKEN` | A random secret of at least 32 characters, e.g. `openssl rand -hex 32`. If it is unset or shorter, `/v1/admin` answers 404. |
| `CORS_ALLOWED_ORIGINS` | Add this panel's origin, e.g. `https://admin.example.com`, alongside the main site. |

## Running

```sh
cp .env.example .env    # set VITE_API_URL to the backend
npm install
npm run dev             # http://localhost:3001
npm run build           # static files in dist/
```

Deploy `dist/` to any static host (Railway, Vercel, Netlify, Cloudflare Pages).
`VITE_API_URL` is only the default for the sign-in form; it is not a secret.

## Security

- Sign in by pasting the admin token. It stays in this tab's `sessionStorage`,
  so closing the tab signs you out, and it is only ever sent to the backend you entered.
- The token is checked against the backend before it is kept.
- Anyone who has the token has full admin access, so keep it out of chat and source control.
  To revoke it, change `ADMIN_TOKEN` on the backend.
- The page asks search engines not to index it.
