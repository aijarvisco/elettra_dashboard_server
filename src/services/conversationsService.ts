import pool from '../db/index.js'
import type {
  SessionResponse,
  MessageResponse,
  KnowledgeVaultResponse,
  PaginatedResponse,
  ContactResponse,
  SessionMetadata,
  ContactDetailResponse,
  DocumentResponse
} from '../types/index.js'

export async function getConversations(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<SessionResponse>> {
  const client = await pool.connect()
  const offset = (page - 1) * pageSize

  try {
    // Get total count
    const countResult = await client.query('SELECT COUNT(*) as count FROM sessions')
    const total = parseInt(countResult.rows[0].count, 10)

    // Get paginated sessions with contact info and transferred status
    const result = await client.query(`
      SELECT
        s.id,
        s.created_at,
        s.status,
        c.phone_number,
        c.email,
        c.name,
        CASE WHEN tl.id IS NOT NULL THEN true ELSE false END as transferred,
        (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id) as message_count
      FROM sessions s
      LEFT JOIN contacts c ON s.contact_id = c.id
      LEFT JOIN transferred_leads tl ON s.id = tl.session_id
      ORDER BY s.created_at DESC
      LIMIT $1 OFFSET $2
    `, [pageSize, offset])

    const data: SessionResponse[] = result.rows.map((row) => ({
      id: row.id,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      name: row.name || undefined,
      startedAt: row.created_at.toISOString(),
      endedAt: undefined,
      messageCount: parseInt(row.message_count, 10),
      transferred: row.transferred,
      status: row.status,
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } finally {
    client.release()
  }
}

export async function searchConversations(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<SessionResponse>> {
  const client = await pool.connect()
  const offset = (page - 1) * pageSize
  const searchPattern = `%${query}%`

  try {
    // Get total count for search
    const countResult = await client.query(`
      SELECT COUNT(*) as count
      FROM sessions s
      LEFT JOIN contacts c ON s.contact_id = c.id
      WHERE c.phone_number::text ILIKE $1 OR c.email ILIKE $1 OR c.name ILIKE $1
    `, [searchPattern])
    const total = parseInt(countResult.rows[0].count, 10)

    // Get paginated search results
    const result = await client.query(`
      SELECT
        s.id,
        s.created_at,
        s.status,
        c.phone_number,
        c.email,
        c.name,
        CASE WHEN tl.id IS NOT NULL THEN true ELSE false END as transferred,
        (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id) as message_count
      FROM sessions s
      LEFT JOIN contacts c ON s.contact_id = c.id
      LEFT JOIN transferred_leads tl ON s.id = tl.session_id
      WHERE c.phone_number::text ILIKE $1 OR c.email ILIKE $1 OR c.name ILIKE $1
      ORDER BY s.created_at DESC
      LIMIT $2 OFFSET $3
    `, [searchPattern, pageSize, offset])

    const data: SessionResponse[] = result.rows.map((row) => ({
      id: row.id,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      name: row.name || undefined,
      startedAt: row.created_at.toISOString(),
      endedAt: undefined,
      messageCount: parseInt(row.message_count, 10),
      transferred: row.transferred,
      status: row.status,
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } finally {
    client.release()
  }
}

export async function getConversationById(id: string): Promise<{
  session: SessionResponse
  messages: MessageResponse[]
  knowledgeVault: KnowledgeVaultResponse[]
} | null> {
  const client = await pool.connect()

  try {
    // Get session with contact info
    const sessionResult = await client.query(`
      SELECT
        s.id,
        s.created_at,
        s.status,
        c.phone_number,
        c.email,
        c.name,
        CASE WHEN tl.id IS NOT NULL THEN true ELSE false END as transferred,
        (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id) as message_count
      FROM sessions s
      LEFT JOIN contacts c ON s.contact_id = c.id
      LEFT JOIN transferred_leads tl ON s.id = tl.session_id
      WHERE s.id = $1
    `, [id])

    if (sessionResult.rows.length === 0) {
      return null
    }

    const row = sessionResult.rows[0]
    const session: SessionResponse = {
      id: row.id,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      name: row.name || undefined,
      startedAt: row.created_at.toISOString(),
      endedAt: undefined,
      messageCount: parseInt(row.message_count, 10),
      transferred: row.transferred,
      status: row.status,
    }

    // Get messages (sender: 0 = user, 1 = agent based on common convention)
    const messagesResult = await client.query(`
      SELECT id, session_id, sender, content, created_at
      FROM conversations
      WHERE session_id = $1
      ORDER BY created_at ASC
    `, [id])

    const messages: MessageResponse[] = messagesResult.rows.map((msg) => ({
      id: msg.id.toString(),
      sessionId: msg.session_id,
      role: msg.sender === 0 ? 'user' : 'agent',
      content: msg.content,
      timestamp: msg.created_at.toISOString(),
    }))

    // Get knowledge vault items (no category in your schema, we'll use key prefix or generic)
    const vaultResult = await client.query(`
      SELECT id, session_id, key, value
      FROM knowledge_vault
      WHERE session_id = $1
      ORDER BY key
    `, [id])

    const knowledgeVault: KnowledgeVaultResponse[] = vaultResult.rows.map((item) => ({
      id: item.id.toString(),
      sessionId: item.session_id,
      category: 'Info',
      key: item.key,
      value: item.value,
    }))

    return { session, messages, knowledgeVault }
  } finally {
    client.release()
  }
}

// Contact-based functions

export async function getContacts(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<ContactResponse>> {
  const client = await pool.connect()
  const offset = (page - 1) * pageSize

  try {
    // Get total count of contacts with sessions
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM contacts c
      JOIN sessions s ON c.id = s.contact_id
    `)
    const total = parseInt(countResult.rows[0].count, 10)

    // Get paginated contacts with aggregated data
    const result = await client.query(`
      SELECT
        c.id,
        c.name,
        c.phone_number,
        c.email,
        COUNT(DISTINCT s.id) as session_count,
        COALESCE(SUM(
          (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id)
        ), 0) as total_message_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM transferred_leads tl
          WHERE tl.contact_id = c.id
        ) THEN true ELSE false END as transferred,
        MAX(s.created_at) as last_activity_at
      FROM contacts c
      JOIN sessions s ON c.id = s.contact_id
      GROUP BY c.id, c.name, c.phone_number, c.email
      ORDER BY last_activity_at DESC
      LIMIT $1 OFFSET $2
    `, [pageSize, offset])

    const data: ContactResponse[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name || undefined,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      sessionCount: parseInt(row.session_count, 10),
      totalMessageCount: parseInt(row.total_message_count, 10),
      transferred: row.transferred,
      lastActivityAt: row.last_activity_at.toISOString(),
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } finally {
    client.release()
  }
}

export async function searchContacts(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<ContactResponse>> {
  const client = await pool.connect()
  const offset = (page - 1) * pageSize
  const searchPattern = `%${query}%`

  try {
    // Get total count for search
    const countResult = await client.query(`
      SELECT COUNT(DISTINCT c.id) as count
      FROM contacts c
      JOIN sessions s ON c.id = s.contact_id
      WHERE c.phone_number::text ILIKE $1 OR c.email ILIKE $1 OR c.name ILIKE $1
    `, [searchPattern])
    const total = parseInt(countResult.rows[0].count, 10)

    // Get paginated search results
    const result = await client.query(`
      SELECT
        c.id,
        c.name,
        c.phone_number,
        c.email,
        COUNT(DISTINCT s.id) as session_count,
        COALESCE(SUM(
          (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id)
        ), 0) as total_message_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM transferred_leads tl
          WHERE tl.contact_id = c.id
        ) THEN true ELSE false END as transferred,
        MAX(s.created_at) as last_activity_at
      FROM contacts c
      JOIN sessions s ON c.id = s.contact_id
      WHERE c.phone_number::text ILIKE $1 OR c.email ILIKE $1 OR c.name ILIKE $1
      GROUP BY c.id, c.name, c.phone_number, c.email
      ORDER BY last_activity_at DESC
      LIMIT $2 OFFSET $3
    `, [searchPattern, pageSize, offset])

    const data: ContactResponse[] = result.rows.map((row) => ({
      id: row.id,
      name: row.name || undefined,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      sessionCount: parseInt(row.session_count, 10),
      totalMessageCount: parseInt(row.total_message_count, 10),
      transferred: row.transferred,
      lastActivityAt: row.last_activity_at.toISOString(),
    }))

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    }
  } finally {
    client.release()
  }
}

export async function getContactById(id: string): Promise<ContactDetailResponse | null> {
  const client = await pool.connect()

  try {
    // Get contact info with aggregates
    const contactResult = await client.query(`
      SELECT
        c.id,
        c.name,
        c.phone_number,
        c.email,
        COUNT(DISTINCT s.id) as session_count,
        COALESCE(SUM(
          (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id)
        ), 0) as total_message_count,
        CASE WHEN EXISTS (
          SELECT 1 FROM transferred_leads tl
          WHERE tl.contact_id = c.id
        ) THEN true ELSE false END as transferred,
        MAX(s.created_at) as last_activity_at
      FROM contacts c
      JOIN sessions s ON c.id = s.contact_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.phone_number, c.email
    `, [id])

    if (contactResult.rows.length === 0) {
      return null
    }

    const row = contactResult.rows[0]
    const contact: ContactResponse = {
      id: row.id,
      name: row.name || undefined,
      phoneNumber: row.phone_number?.toString() || 'Unknown',
      email: row.email || undefined,
      sessionCount: parseInt(row.session_count, 10),
      totalMessageCount: parseInt(row.total_message_count, 10),
      transferred: row.transferred,
      lastActivityAt: row.last_activity_at.toISOString(),
    }

    // Get all sessions for this contact
    const sessionsResult = await client.query(`
      SELECT
        s.id,
        s.created_at,
        CASE WHEN tl.id IS NOT NULL THEN true ELSE false END as transferred,
        (SELECT COUNT(*) FROM conversations conv WHERE conv.session_id = s.id) as message_count
      FROM sessions s
      LEFT JOIN transferred_leads tl ON s.id = tl.session_id
      WHERE s.contact_id = $1
      ORDER BY s.created_at ASC
    `, [id])

    const sessions: SessionMetadata[] = sessionsResult.rows.map((s) => ({
      id: s.id,
      createdAt: s.created_at.toISOString(),
      transferred: s.transferred,
      messageCount: parseInt(s.message_count, 10),
    }))

    // Get all messages across all sessions, ordered by session date then message time
    const messagesResult = await client.query(`
      SELECT
        conv.id,
        conv.session_id,
        conv.sender,
        conv.content,
        conv.created_at,
        s.created_at as session_created_at
      FROM conversations conv
      JOIN sessions s ON conv.session_id = s.id
      WHERE s.contact_id = $1
      ORDER BY s.created_at ASC, conv.created_at ASC
    `, [id])

    const messages: MessageResponse[] = messagesResult.rows.map((msg) => ({
      id: msg.id.toString(),
      sessionId: msg.session_id,
      role: msg.sender === 0 ? 'user' : 'agent',
      content: msg.content,
      timestamp: msg.created_at.toISOString(),
    }))

    // Get all knowledge vault items across all sessions
    const vaultResult = await client.query(`
      SELECT
        kv.id,
        kv.session_id,
        kv.key,
        kv.value
      FROM knowledge_vault kv
      JOIN sessions s ON kv.session_id = s.id
      WHERE s.contact_id = $1
      ORDER BY kv.key
    `, [id])

    const knowledgeVault: KnowledgeVaultResponse[] = vaultResult.rows.map((item) => ({
      id: item.id.toString(),
      sessionId: item.session_id,
      category: 'Info',
      key: item.key,
      value: item.value,
    }))

    // Get all documents across all sessions
    const documentsResult = await client.query(`
      SELECT
        sd.id,
        sd.session_id,
        sd.category,
        sd.image_id,
        sd.link
      FROM session_documents sd
      JOIN sessions s ON sd.session_id = s.id
      WHERE s.contact_id = $1
      ORDER BY sd.created_at ASC
    `, [id])

    const documents: DocumentResponse[] = documentsResult.rows.map((doc) => ({
      id: doc.id.toString(),
      sessionId: doc.session_id,
      category: doc.category || undefined,
      imageId: doc.image_id,
      link: doc.link,
    }))

    return { contact, sessions, messages, knowledgeVault, documents }
  } finally {
    client.release()
  }
}
