import type { Request, Response } from 'express'
import {
  getConversations,
  searchConversations,
  getConversationById,
  getContacts,
  searchContacts,
  getContactById
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
