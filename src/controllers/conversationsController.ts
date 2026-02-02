import type { Request, Response } from 'express'
import {
  getConversations,
  searchConversations,
  getConversationById,
  getContacts,
  searchContacts,
  getContactById,
  getTransferredLeads,
  searchTransferredLeads,
  updateCrmId,
  getPendingLeadsCount
} from '../services/conversationsService.js'

export async function listConversations(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const result = await getConversations(page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    res.status(500).json({ error: 'Failed to fetch conversations', code: '500' })
  }
}

export async function search(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    if (!query) {
      res.status(400).json({ error: 'Search query is required', code: '400' })
      return
    }

    const result = await searchConversations(query, page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error searching conversations:', error)
    res.status(500).json({ error: 'Failed to search conversations', code: '500' })
  }
}

export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const result = await getConversationById(id)

    if (!result) {
      res.status(404).json({ error: 'Conversation not found', code: '404' })
      return
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ error: 'Failed to fetch conversation', code: '500' })
  }
}

// Contact-based controllers

export async function listContacts(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const result = await getContacts(page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    res.status(500).json({ error: 'Failed to fetch contacts', code: '500' })
  }
}

export async function searchContactsHandler(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    if (!query) {
      res.status(400).json({ error: 'Search query is required', code: '400' })
      return
    }

    const result = await searchContacts(query, page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error searching contacts:', error)
    res.status(500).json({ error: 'Failed to search contacts', code: '500' })
  }
}

export async function getContactByIdHandler(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params

    const result = await getContactById(id)

    if (!result) {
      res.status(404).json({ error: 'Contact not found', code: '404' })
      return
    }

    res.json(result)
  } catch (error) {
    console.error('Error fetching contact:', error)
    res.status(500).json({ error: 'Failed to fetch contact', code: '500' })
  }
}

// Transferred leads controllers

export async function listTransferredLeads(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    const result = await getTransferredLeads(page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error fetching transferred leads:', error)
    res.status(500).json({ error: 'Failed to fetch transferred leads', code: '500' })
  }
}

export async function searchTransferredLeadsHandler(req: Request, res: Response): Promise<void> {
  try {
    const query = req.query.q as string
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 20

    if (!query) {
      res.status(400).json({ error: 'Search query is required', code: '400' })
      return
    }

    const result = await searchTransferredLeads(query, page, pageSize)
    res.json(result)
  } catch (error) {
    console.error('Error searching transferred leads:', error)
    res.status(500).json({ error: 'Failed to search transferred leads', code: '500' })
  }
}

export async function updateTransferredLeadCrmId(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { crmId } = req.body

    if (!crmId || typeof crmId !== 'string' || crmId.trim() === '') {
      res.status(400).json({ error: 'CRM ID is required and must be a non-empty string', code: '400' })
      return
    }

    const result = await updateCrmId(id, crmId.trim())

    if (!result.success) {
      const status = result.error === 'Lead not found' ? 404 : 500
      res.status(status).json({ error: result.error, code: status.toString() })
      return
    }

    res.json({ success: true, message: 'CRM ID updated successfully' })
  } catch (error) {
    console.error('Error updating CRM ID:', error)
    res.status(500).json({ error: 'Failed to update CRM ID', code: '500' })
  }
}

export async function getPendingLeadsCountHandler(req: Request, res: Response): Promise<void> {
  try {
    const count = await getPendingLeadsCount()
    res.json({ count })
  } catch (error) {
    console.error('Error fetching pending leads count:', error)
    res.status(500).json({ error: 'Failed to fetch pending leads count', code: '500' })
  }
}
