import { Router } from 'express'
import {
  listConversations,
  search,
  getById,
  listContacts,
  searchContactsHandler,
  getContactByIdHandler
} from '../controllers/conversationsController.js'
import { requireAuthMiddleware } from '../middleware/auth.js'

const router = Router()

// All conversations routes require authentication
router.use(requireAuthMiddleware)

// Contact-based routes (must be before /:id to avoid conflict)
router.get('/contacts', listContacts)
router.get('/contacts/search', searchContactsHandler)
router.get('/contacts/:id', getContactByIdHandler)

// Session-based routes (kept for backward compatibility)
router.get('/', listConversations)
router.get('/search', search)
router.get('/:id', getById)

export default router
