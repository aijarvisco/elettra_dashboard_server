export interface Session {
  id: string
  contact_id: string
  status: number
  associated_leads?: string[]
  created_at: Date
}

export interface Conversation {
  id: number
  contact_id: string
  session_id: string
  sender: number // 0 = user, 1 = agent
  content: string
  wa_id: string
  created_at: Date
}

export interface Contact {
  id: string
  name?: string
  phone_number?: number
  email?: string
  consent_data: object
  created_at: Date
}

export interface TransferredLead {
  id: number
  contact_id: string
  session_id: string
  qualification_status: number
  summary: string
  created_at: Date
  service_type?: string
  local_type?: string
  address?: string
  energy_power?: string
}

export interface KnowledgeVaultItem {
  id: number
  contact_id: string
  session_id: string
  key: string
  value: string
  created_at: Date
}

export interface MetricsSummary {
  totalConversations: number
  transferredLeads: number
  qualificationRate: number
  avgMessagesPerSession: number
}

export interface TimelineDataPoint {
  month: string
  totalConversations: number
  transferredLeads: number
  qualificationRate: number
}

export interface SessionResponse {
  id: string
  phoneNumber: string
  email?: string
  name?: string
  startedAt: string
  endedAt?: string
  messageCount: number
  transferred: boolean
  status?: number
}

export interface MessageResponse {
  id: string
  sessionId: string
  role: 'user' | 'agent'
  content: string
  timestamp: string
}

export interface KnowledgeVaultResponse {
  id: string
  sessionId: string
  category: string
  key: string
  value: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
