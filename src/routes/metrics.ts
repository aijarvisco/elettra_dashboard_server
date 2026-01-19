import { Router } from 'express'
import { getSummary, getTimeline } from '../controllers/metricsController.js'
import { requireAuthMiddleware } from '../middleware/auth.js'

const router = Router()

// All metrics routes require authentication
router.use(requireAuthMiddleware)

router.get('/summary', getSummary)
router.get('/timeline', getTimeline)

export default router
