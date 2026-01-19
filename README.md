# ELETTRA Dashboard - Server

Express.js backend API for the ELETTRA Dashboard, providing metrics and conversation data.

## Tech Stack

- Express.js
- TypeScript
- PostgreSQL
- Clerk for authentication

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DB_HOST=your-db-host
DB_PORT=5432
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
CLIENT_URL=http://localhost:5173
```

4. Run development server:
```bash
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/metrics/summary` | Get KPI summary |
| GET | `/api/metrics/timeline` | Get monthly metrics |
| GET | `/api/conversations` | List conversations (paginated) |
| GET | `/api/conversations/search` | Search conversations |
| GET | `/api/conversations/:id` | Get conversation details |

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard:
   - `CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `CLIENT_URL` (your deployed client URL)
   - `NODE_ENV=production`
4. Deploy

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key | Yes |
| `CLERK_SECRET_KEY` | Clerk secret key | Yes |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PORT` | PostgreSQL port | Yes |
| `DB_USER` | PostgreSQL user | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `DB_NAME` | PostgreSQL database name | Yes |
| `CLIENT_URL` | Frontend URL for CORS | Yes |
| `NODE_ENV` | Environment (production) | Yes (prod) |
