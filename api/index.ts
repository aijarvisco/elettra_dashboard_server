import express from 'express'
import cors from 'cors'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import routes from '../src/routes/index.js'
import { clerkAuthMiddleware, handleAuthError } from '../src/middleware/auth.js'

const app = express()

// CORS configuration for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[]

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true)

    if (allowedOrigins.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')))) {
      return callback(null, true)
    }

    // In production, be more permissive with Vercel preview URLs
    if (origin.includes('vercel.app')) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json())
app.use(clerkAuthMiddleware)

// Routes
app.use('/api', routes)

// Error handling
app.use(handleAuthError)

app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error', code: '500' })
})

// Export for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req as unknown as express.Request, res as unknown as express.Response)
}

// Also export the app for local development
export { app }
