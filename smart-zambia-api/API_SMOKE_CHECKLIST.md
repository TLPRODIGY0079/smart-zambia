# smart-zambia-api — smoke checklist

Use before or after merging changes that touch auth, Postgres, or civic routes. This is manual verification—not automated CI.

## 1. Environment

Ensure these are set (see `.env`; never commit real secrets):

| Variable | Required | Notes |
|---------|----------|--------|
| `JWT_SECRET` | **Yes** | Server exits without it (`server.js`). |
| `DB_USER`, `DB_HOST`, `DB_NAME`, `DB_PASSWORD`, `DB_PORT` | Recommended | `db.js`; replace any default credentials before production. |
| `PORT` | Optional | Defaults to `3001`. |
| `NODE_ENV` | Optional | Affects CORS allowed origins (`production` vs dev). |

## 2. Database migrations (order matters)

Apply only what your deployment needs—new environments typically run baseline first, then enhancers:

1. `schema.sql`
2. `enhanced_schema.sql`
3. `enhanced_features_schema.sql`
4. `civic_schema.sql`
5. `reviews_schema.sql`
6. `update_user_profile_schema.sql`
7. Use `fix-users-table.sql` only if patching an existing inconsistent install

After changes, reconnect with `psql` or your GUI and confirm expected tables exist (e.g. `users`, civic tables matching routes you call).

## 3. Boot

```powershell
cd smart-zambia-api
npm install
npm start
```

Expect: process listens on configured `PORT` with no Postgres connection stack traces at startup.

## 4. HTTP checks (minimal)

Uses `PORT` default `3001`—adjust URLs if yours differs.

**Public read**

- `GET http://localhost:3001/api/destinations` — Should return JSON (may be empty array if DB unloaded).

**Auth flow**

1. `POST http://localhost:3001/api/auth/register` with JSON `{ "email": "...", "password": "...", "fullName": "..." }` — expect token or validation error without 500 on valid input size.
2. `POST http://localhost:3001/api/auth/login` with same credentials — expect JWT-bearing response.

**Authenticated profile (JWT)**

3. `GET http://localhost:3001/api/me/profile` — `Authorization: Bearer <token>` — expect profile JSON or coherent 401 without token.

**Civic surfaces**

4. `POST http://localhost:3001/api/civic/report` — with Bearer token and minimal valid body expected by handler — expect 200/400 with explicit message (not opaque 500).

5. `GET http://localhost:3001/api/civic/profile` — with Bearer token — aligns with gamified civic progress.

Adjust bodies to match columns enforced in `schema.sql`; if migrations were skipped, failures here usually mean incomplete DB—not application logic.

## 5. Regression signals

| Symptom | Likely cause |
|--------|----------------|
| Immediate exit on boot | Missing `JWT_SECRET`. |
| `ECONNREFUSED` / Postgres errors | DB not running, wrong `DB_*`, or DB not created. |
| 401 on all `/api/me/*` | Missing/expired JWT or `Authorization` header format. |
| CORS errors from browser | `NODE_ENV` / origin not in allowlist; dev frontends must match `server.js` dev origins. |

## 6. After smoke

- Rotate any credentials used on shared dev machines.
- Document actual migration set applied in your deployment notes—not only this checklist.
