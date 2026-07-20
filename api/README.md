# AI Back-Office OCR Service — API

Backend API for the AI Back-Office OCR Service, built with **NestJS + MongoDB (Mongoose)**. Exposes a REST API under `/api/v1` plus a Socket.IO gateway for real-time OCR log updates, and stores processed images/files in DigitalOcean Spaces (S3-compatible).

## Tech Stack

- **NestJS 11** (Express platform)
- **MongoDB** via `@nestjs/mongoose`
- **JWT auth** via `@nestjs/jwt` + `passport`
- **Socket.IO** via `@nestjs/platform-socket.io` / `@nestjs/websockets`
- **DigitalOcean Spaces / S3** via `@aws-sdk/client-s3`
- **bcryptjs** for password hashing
- **archiver** for ZIP bundling (bulk image download)

## Project Structure

```
api/
├── src/
│   ├── common/
│   │   └── dto/
│   ├── service/
│   │   ├── auth/                     # sign-up, sign-in, refresh-token
│   │   ├── users/                    # user profile & management
│   │   ├── ocr-services-imgs/        # OCR processed image management
│   │   ├── ocr-services-logs/        # OCR processing logs + realtime gateway
│   │   ├── ocr-services-orgs/        # organization / multi-tenant management
│   │   ├── ocr-services-rate-model/  # rate model configuration
│   │   ├── overall/                  # dashboard / overview stats
│   │   └── price/                    # pricing
│   ├── utils/
│   ├── app.module.ts
│   └── main.ts                       # bootstrap, global prefix, CORS, WS adapter
├── test/                             # e2e tests
├── Dockerfile
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+ or Bun 1.0+
- A MongoDB instance (Atlas or self-hosted)
- DigitalOcean Spaces (or S3-compatible) credentials, for image storage

### Installation

```bash
npm install
# or
bun install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Description | Notes |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | required |
| `JWT_SECRET` | Secret for signing access tokens | change from the example default before deploying |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens | change from the example default before deploying |
| `JWT_EXPIRES_IN` | Access token TTL | e.g. `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL | e.g. `120m` |
| `DO_SPACES_KEY` / `DO_SPACES_SECRET` | DigitalOcean Spaces (S3-compatible) credentials | required for image upload/storage |
| `DO_SPACES_BUCKET` | Spaces bucket name | required |
| `DO_SPACES_ENDPOINT` | Spaces endpoint URL | required |
| `ISSUE_PREFIX` | Key prefix for issue images | default: `ocr-services/subId/issue_images/process/` |
| `PROCESS_PREFIX` | Key prefix for processed images | default: `ocr-services/subId/process/` |
| `PORT` | HTTP port | default `5167` |
| `ENV` | Set to `production` to enable strict CORS | **see warning below** |
| `FRONTEND_ORIGIN` | Allowed CORS origin (REST + WebSocket) | the deployed web app's URL |

**Production CORS warning**: CORS (`app.enableCors`) and the WebSocket adapter only restrict `origin` to `FRONTEND_ORIGIN` when `process.env.ENV === 'production'` (see `src/main.ts`). If `ENV` is unset, CORS is wide open (`*`). Always set **both** `ENV=production` and `FRONTEND_ORIGIN` together in production — setting one without the other leaves CORS open.

### Development

```bash
npm run start:dev
```

The API listens on `http://localhost:5167`, with all routes prefixed `api/v1` (e.g. `POST /api/v1/auth/sign-in`).

### Production

```bash
npm run build
npm run start:prod
```

### Tests

```bash
npm run test        # unit tests
npm run test:e2e     # e2e tests
npm run test:cov     # coverage
```

## API Modules

| Module | Base path | Purpose |
|---|---|---|
| Auth | `/api/v1/auth` | sign-up, sign-in, refresh-token |
| Users | `/api/v1/users` | user profile & management |
| OCR Service Images | `/api/v1/ocr-services-imgs` | processed OCR image management |
| OCR Service Logs | `/api/v1/ocr-services-logs` | OCR processing logs; also exposes a Socket.IO gateway for realtime log updates |
| OCR Service Orgs | `/api/v1/ocr-services-orgs` | organization / multi-tenant management |
| OCR Rate Model | `/api/v1/ocr-services-rate-model` | rate model configuration |
| Overall | `/api/v1/overall` | dashboard / overview statistics |
| Price | `/api/v1/price` | pricing |

## Deployment

### Docker

```bash
docker build -t ai-back-office-api ./api
docker run -p 5167:5167 --env-file ./api/.env ai-back-office-api
```

The image is built with Bun (`oven/bun:1.2.18`), runs `bun run build`, and starts with `bun run dist/main.js`. `.env` is **not** copied into the image (excluded via `.dockerignore`) — inject it at container runtime via `--env-file` or your orchestrator's secret mechanism.

### Docker Compose

The repo root `docker-compose.yml` builds this service together with `web`, loading env vars from `./api/.env`:

```bash
docker-compose build
docker-compose up -d
```

See `../web/README.md` for the frontend counterpart.

## License

UNLICENSED (private)
