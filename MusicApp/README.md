# Individual Project Phase 2

## Local setup (Server)

### Create database from code

From the `server/` folder:

- Create DB (no manual `psql` needed): `npm run db:create`
- Create DB + run migrations: `npm run db:setup`
- Reset DB (drop + create): `npm run db:reset`

### Run server

- Normal: `npm run dev`
- One command (setup DB + run): `npm run dev:setup`
