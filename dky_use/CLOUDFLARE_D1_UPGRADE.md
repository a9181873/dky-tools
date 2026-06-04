# US stocks D1 upgrade

`/api/state` keeps the same GET/PUT API used by the frontend, but storage is now:

1. D1 `STOCK_DB` as the primary store.
2. KV `STOCK_KV` as a legacy migration source and mirror backup.
3. Browser `localStorage` as the offline client-side fallback.

## Cloudflare resources

- D1 database name: `dky-us-stocks`
- Pages D1 binding: `STOCK_DB`
- Existing KV binding: `STOCK_KV`
- State key: `us-stocks:default`

## Migration

Apply `migrations/0001_stock_state.sql` to the D1 database.

The function also creates missing tables defensively at runtime, so a deploy will not fail permanently if the migration is missed. The migration file is still the source of truth for the schema.

## Runtime behavior

- `GET /api/state` reads D1 first.
- If D1 has no row, it reads KV and writes the same state into D1.
- If D1 read fails, it falls back to KV.
- `PUT /api/state` writes D1 first, then mirrors to KV with `waitUntil`.
- If the D1 binding is not present yet, the API keeps using KV so production can transition safely.
