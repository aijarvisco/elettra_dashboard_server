import pool from '../db/index.js'
import type { MetricsSummary, TimelineDataPoint } from '../types/index.js'

export async function getMetricsSummary(): Promise<MetricsSummary> {
  console.log('getMetricsSummary: Starting...')
  const client = await pool.connect()
  console.log('getMetricsSummary: Connected to pool')

  try {
    // Total conversations (sessions)
    const totalConversationsResult = await client.query(
      'SELECT COUNT(*) as count FROM sessions'
    )
    const totalConversations = parseInt(totalConversationsResult.rows[0].count, 10)

    // Transferred leads
    const transferredLeadsResult = await client.query(
      'SELECT COUNT(*) as count FROM transferred_leads'
    )
    const transferredLeads = parseInt(transferredLeadsResult.rows[0].count, 10)

    // Qualification rate
    const qualificationRate = totalConversations > 0
      ? (transferredLeads / totalConversations) * 100
      : 0

    // Average messages per session
    const avgMessagesResult = await client.query(`
      SELECT AVG(msg_count) as avg FROM (
        SELECT session_id, COUNT(*) as msg_count
        FROM conversations
        WHERE session_id IS NOT NULL
        GROUP BY session_id
      ) as session_counts
    `)
    const avgMessagesPerSession = parseFloat(avgMessagesResult.rows[0].avg) || 0

    return {
      totalConversations,
      transferredLeads,
      qualificationRate: Math.round(qualificationRate * 100) / 100,
      avgMessagesPerSession: Math.round(avgMessagesPerSession * 100) / 100,
    }
  } finally {
    client.release()
  }
}

export async function getMetricsTimeline(): Promise<TimelineDataPoint[]> {
  const client = await pool.connect()

  try {
    const result = await client.query(`
      SELECT
        TO_CHAR(s.created_at, 'YYYY-MM') as month,
        COUNT(DISTINCT s.id) as total_conversations,
        COUNT(DISTINCT tl.session_id) as transferred_leads
      FROM sessions s
      LEFT JOIN transferred_leads tl ON s.id = tl.session_id
      WHERE s.created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(s.created_at, 'YYYY-MM')
      ORDER BY month ASC
    `)

    return result.rows.map((row) => {
      const total = parseInt(row.total_conversations, 10)
      const transferred = parseInt(row.transferred_leads, 10)
      const rate = total > 0 ? (transferred / total) * 100 : 0

      return {
        month: row.month,
        totalConversations: total,
        transferredLeads: transferred,
        qualificationRate: Math.round(rate * 100) / 100,
      }
    })
  } finally {
    client.release()
  }
}
