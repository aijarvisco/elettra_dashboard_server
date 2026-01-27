// Load environment variables first, before any other imports
import './env.js'

import express from 'express'
import cors from 'cors'
import routes from './routes/index.js'
import { clerkAuthMiddleware, handleAuthError } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 3001

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
