import { Router } from 'express'
import {
  listTransferredLeads,
  searchTransferredLeadsHandler,
  updateTransferredLeadCrmId,
  getPendingLeadsCountHandler
} from '../controllers/conversationsController.js'
import { requireAuthMiddleware } from '../middleware/auth.js'

const router = Router()

// All transferred leads routes require authentication
router.use(requireAuthMiddleware)

router.get('/', listTransferredLeads)
router.get('/search', searchTransferredLeadsHandler)
router.get('/pending-count', getPendingLeadsCountHandler)
router.put('/:id/crm-id', updateTransferredLeadCrmId)

export default router