# Env setup: local (dev) vs production

| File | Role | Used by |
|------|------|---------|
| `frontend/.env.local` | **Dev** | `npm run dev`, `npm run create-admin` |
| `frontend/.env.service` | **Production** values (local copy) | `npm run create-admin:prod`; copy these keys into Vercel/host env |
| `frontend/.env.example` | Template only | Never real secrets |

Next.js does **not** auto-load `.env.service`. Production runtime must get the same keys from the host dashboard (Vercel → Project → Settings → Environment Variables).

---

## Production  apply `.env.service`

### 1. Keep production secrets in `.env.service`

Confirm these are set (new Up ’n Roll mailbox + Atlas + Google OAuth):

- `MONGODB_URI` (DB name in path, e.g. `/upnroll`)
- `SESSION_SECRET`
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `STORAGE_DRIVER=gridfs`
- `CRON_SECRET`

### 2. Create production admin (hits production MongoDB)

From repo root:

```powershell
npm run create-admin:prod -- --email admin@upnroll.in --password "YourSecurePass1" --name "Suketu"
```

From `frontend/`:

```powershell
npm run create-admin:prod -- --email admin@upnroll.in --password "YourSecurePass1" --name "Suketu"
```

Expect: `Created admin user admin@upnroll.in.` (or Updated…).

### 3. Put the same keys on the host (Vercel)

In Vercel (Production environment), set every key from `.env.service` with the same names (`MONGODB_URI`, `SMTP_*`, `GOOGLE_*`, etc.). Redeploy after saving.

### 4. Google OAuth redirect (production)

Authorized JavaScript origins:

```
https://YOUR_DOMAIN
```

Authorized redirect URIs:

```
https://YOUR_DOMAIN/api/auth/google/callback
```

---

## Dev  keep using `.env.local`

Local app + local admin:

```powershell
npm run create-admin -- --email you@example.com --password "YourSecurePass1" --name "Dev Admin"
npm run dev
```

Dev Google redirects:

```
http://localhost:3000
http://localhost:3000/api/auth/google/callback
```

---

## New Gmail / SMTP (either env)

1. Gmail → 2FA → App Password  
2. Set all five `SMTP_*` on that env file (or host)  
3. Restart / redeploy  

| Variable | Value |
|----------|--------|
| `SMTP_USER` | mailbox address |
| `SMTP_FROM` | usually same as `SMTP_USER` |
| `SMTP_PASS` | App Password (not login password) |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |

---

## Checklist

**Dev (`.env.local`)**

- [ ] Dev Mongo + SMTP + Google filled
- [ ] `npm run create-admin` if needed
- [ ] `npm run dev` works

**Production (`.env.service` → host)**

- [ ] `.env.service` filled
- [ ] `npm run create-admin:prod` for live admin
- [ ] Same keys pasted into Vercel Production env
- [ ] Google redirect URI uses production domain
- [ ] Redeployed and login works on live site

## Notes

- Do not commit `.env.local` or `.env.service`.
- `create-admin` = dev DB; `create-admin:prod` = production DB from `.env.service`.
- Changing SMTP only changes the From mailbox; it does not move existing users.
