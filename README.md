# LogLens – Intelligent Log Analyzer

LogLens is a full-stack developer tool for analyzing application logs, detecting recurring error patterns, correlating failures across microservices, and getting AI-powered debugging insights.

## Project structure

- `frontend` – Next.js 14, TypeScript, TailwindCSS, glassmorphism UI, Framer Motion, and reusable components (ShadCN-inspired).
- `backend` – Node.js, Express.js, TypeScript, MongoDB (Mongoose), and Grok API integration.

## Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

## Backend setup

```bash
cd backend
npm install
cp .env.example .env  # On Windows, copy manually instead
```

Edit `.env`:

- `MONGODB_URI` – your MongoDB connection string
- `PORT` – backend HTTP port (default: 4000)
- `CORS_ORIGIN` – frontend origin (default: `http://localhost:3000`)
- `GROK_API_KEY` – your Grok/xAI API key
- `GROK_API_URL` – Grok API endpoint (default: `https://api.x.ai/v1/chat/completions`)

Run the backend in development:

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:4000` with:

- `POST /api/logs/upload` – ingest logs (paste / files)
- `POST /api/logs/analyze` – summary stats + service health
- `GET /api/logs` – paginated log explorer
- `GET /api/patterns` – recurring normalized error patterns
- `GET /api/correlations` – error co-occurrence across services
- `POST /api/ai/debug` – AI debugging powered by Grok
- `GET /api/example-logs` – sample dataset for quick testing

## Frontend setup

```bash
cd frontend
npm install
```

Create `.env.local` in `frontend`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

Run the frontend:

```bash
cd frontend
npm run dev
```

The app will be available at `http://localhost:3000`.

### Frontend routes

- `/ingest` – paste logs, fetch from URL, and ingest into LogLens.
- `/dashboard` – high-level metrics, error distribution, service health bars, and repeating error patterns.
- `/explorer` – interactive log viewer with search, log level filters, color-coded severities, and pagination.
- `/correlations` – error correlation engine showing services that fail together.
- `/ai-chat` – AI debugging assistant using Grok to explain root causes and suggest fixes.

## Example logs

The backend ships with a small example dataset:

- Endpoint: `GET /api/example-logs`
- Source file: `backend/src/data/exampleLogs.ts`

You can paste this into `/ingest` to quickly populate the system.

## Production notes

- Add proper authentication and rate limiting before exposing the API publicly.
- Configure HTTPS, observability, and centralized logging for the LogLens services themselves.
- Adjust MongoDB indexes and retention policies based on expected log volume.
- Grok usage is billable; ensure keys are securely stored and rotated as needed.

