import { Router } from 'express'
import metricsRoutes from './metrics.js'
import conversationsRoutes from './conversations.js'

const router = Router()

router.use('/metrics', metricsRoutes)
router.use('/conversations', conversationsRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
