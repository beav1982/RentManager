# RentManager UI workspace

A Vite + React (TypeScript) workspace that prototypes the modern CRM shell for the RentManager platform. The layout mirrors the FastAPI routers—properties, units, programs, households, compliance, reports, and transactions—to keep front-end navigation aligned with backend responsibilities.

## Getting started

```bash
cd ui
npm install
npm run dev
```

The development server runs at `http://localhost:5173` by default. Pass `-- --host 0.0.0.0 --port <port>` if you want to access it from another device.

## Available scripts

- `npm run dev` – start the Vite development server with hot module reloading.
- `npm run build` – type-check the project and emit an optimized production build.
- `npm run lint` – run ESLint using the shared configuration for TypeScript and React.

## Workspace highlights

- **Two-column CRM shell** with a persistent navigation rail bound to the API domains (properties → compliance).
- **Portfolio dashboards** that surface occupancy, AMI mix, program catalog updates, and ledger summaries.
- **Guided workflows** for certifications, turn management, compliance findings, and reporting insights to match the backend parity checklist.

Extend the static views by wiring each section to the corresponding FastAPI endpoint (see `/docs` or `/openapi.json` in the backend service) as you progress toward a fully data-driven experience.
