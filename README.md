# AI Back Office

A web-based back office that is part of the **Centralized Intelligent LPR** (License Plate Recognition) system. It tracks vehicle entry/exit through camera feeds, grouping events into **sessions** (entry → parked → exit), and stores the logs and images produced by the license-plate OCR pipeline for review and auditing.

## What it does

- **Tracks entry/exit sessions** per vehicle, per organization (multi-organization support), with live status, parking duration, and a real-time feed over WebSocket
- **Stores OCR logs** for every successful plate read (registration number, province, model confidence, original image, and cropped/processed image)
- **Verify / correct results** — operators can accept or reject each OCR result and correct misread values; these verified results are the basis for pulling images back to **refine the model**
- **Bulk image download (ZIP)** by date range/organization, for retraining datasets
- **Multi-organization support** — data, pricing/plans, and access are scoped per organization
- **Role-based access control**: Admin, Supervisor, Manager, Guest

## Architecture

```
ai-back-office/
├── api/    NestJS + MongoDB (REST API, WebSocket, Auth, Storage)
└── web/    React + Vite (Dashboard, Session, OCR log/verify UI)
```

- **api** — NestJS, MongoDB (Mongoose), JWT auth (access + refresh token), Socket.IO for realtime logs, images stored on an S3-compatible object store (Cloudflare R2)
- **web** — React + Vite + TypeScript, TanStack Query/Router, shadcn/ui + Tailwind

### Backend modules (`api/src/service`)

| Module | Responsibility |
|---|---|
| `auth` | Login, JWT access/refresh tokens, role-based guards |
| `ocr-services-logs` | Store/query OCR logs, entry/exit sessions, realtime feed via Socket.IO |
| `ocr-services-imgs` | List/presign/download images from object storage (S3-compatible) |
| `ocr-services-rate-model` | Records verify results (accept/reject) per image, used for model refinement |
| `ocr-services-orgs` | Organization management (multi-org) |
| `price` | Pricing/plans per organization |
| `users` | User and permission management |
| `overall` | Overview/aggregate statistics |

## Frontend Pages (`web/src/pages`)

All organization-scoped pages live under `/ocr-services/:orgId/...` and require login. Selecting an organization (`orgId`) puts it into `SubIdContext`, which every page below reads to scope its data.

| Page | Route | Description |
|---|---|---|
| **LoginPage** | `/login` | Production login/register screen |
| **DashboardPage** ("Overview") | `/ocr-services/:orgId/overview` | KPI cards (vehicles today, currently inside, avg. parking time, peak entry hour), a live searchable table of today's sessions, and an hourly entry chart |
| **SessionPage** ("Sessions") | `/ocr-services/:orgId/sessions` | Read-only history of entry/exit sessions — stat cards (total/open/closed/average time), filters, pagination, and a detail modal per session |
| **ImageLogPage** ("Image Log") | `/ocr-services/:orgId/home` | Grid/list of OCR results (plate number, province, original + processed image) with **accept/reject verification and correction** — the source of truth for model refinement |
| **ImageIssuePage** ("Image Issues") | `/ocr-services/:orgId/issues` | Read-only gallery of images flagged as problematic, for manual review |

The default route (`/` and `/ocr-services`) redirects to the first organization's overview page (or to `/login` if the user has none).

> `BackendLoginPage`/`BackendAuthContext` and `EventTrackingTestPage` also exist in the codebase but are not wired into the app's routing/layout — they're leftover scaffolding and a manual dev harness for the realtime WebSocket hook, not live features.

## Getting Started (Development)

### 1. Backend (`api/`)

```bash
cd api
cp .env.example .env   # fill in MongoDB URI, JWT secrets, storage credentials
bun install
bun run start:dev
```

Key environment variables in `.env`:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET` | Secrets for signing access/refresh tokens |
| `DO_SPACES_KEY/SECRET/BUCKET/ENDPOINT` | Credentials for the S3-compatible object store (supports both DigitalOcean Spaces and Cloudflare R2) |
| `ISSUE_PREFIX`, `PROCESS_PREFIX` | Bucket path prefixes for images, scoped per organization (`subId`) |
| `FRONTEND_ORIGIN` | Allowed web origin for CORS |

### 2. Frontend (`web/`)

```bash
cd web
bun install
bun run dev
```

Runs at `http://localhost:5173` (API runs at `http://localhost:5167/api/v1`)

### Run with Docker

```bash
docker-compose up --build
```

## Tech Stack

- **Runtime/Package manager**: [Bun](https://bun.sh)
- **Backend**: NestJS, MongoDB/Mongoose, Socket.IO, AWS SDK v3 (`@aws-sdk/client-s3`)
- **Frontend**: React, Vite, TypeScript, TanStack Query/Router, Tailwind CSS, shadcn/ui
- **Storage**: S3-compatible object storage (Cloudflare R2)
