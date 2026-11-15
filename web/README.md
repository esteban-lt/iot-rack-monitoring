# IoT Rack Monitoring · Web

Web app to monitor warehouse racks in real time through ThingsBoard Cloud: rack status, tilt, impacts, alarms, node controls and a 3D model of each rack.

Built with React 19, Vite, TypeScript, TanStack Query/Table, Tailwind + shadcn and three.js.

## Getting started

Requires [Bun](https://bun.sh).

```bash
cp .env.template .env
bun install
bun run dev
```

| Variable | Description |
| --- | --- |
| `VITE_TB_API_URL` | ThingsBoard URL (default `https://thingsboard.cloud`) |

## Scripts

| Script | Description |
| --- | --- |
| `bun run dev` | Development server |
| `bun run build` | Type check and production build in `dist/` |
| `bun run preview` | Serve the build locally |
| `bun run lint` | Lint with oxlint |
| `bun run test` | Unit tests with Vitest (`test/` mirrors `src/`) |

## Docker

The image runs the tests, builds the app and serves it with nginx.

```bash
docker build -t iot-rack-web .
docker run --rm -p 8080:80 iot-rack-web
```

The app is then available at http://localhost:8080.

- Another ThingsBoard instance: `docker build --build-arg VITE_TB_API_URL=https://my-thingsboard.com -t iot-rack-web .`
- The port comes from the `PORT` variable (default `80`): `docker run --rm -e PORT=3000 -p 3000:3000 iot-rack-web`

## Deploy

**Render with Docker:** New → Web Service → this repository, Root Directory `web`, Runtime Docker. Optionally add `VITE_TB_API_URL` as an environment variable. Every push to `main` deploys again.

**Render as a Static Site (no Docker):** Root Directory `web`, Build Command `bun install && bun run build`, Publish Directory `dist`, and a Rewrite rule `/*` → `/index.html` so page reloads on routes like `/racks/123` work.

Pull requests that touch `web/` run lint, tests and build on GitHub Actions.
