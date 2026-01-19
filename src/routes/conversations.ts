import { Router } from 'express'
import { listConversations, search, getById } from '../controllers/conversationsController.js'
import { requireAuthMiddleware } from '../middleware/auth.js'

const router = Router()

// All conversations routes require authentication
router.use(requireAuthMiddleware)

router.get('/', listConversations)
router.get('/search', search)
router.get('/:id', getById)

export default router
