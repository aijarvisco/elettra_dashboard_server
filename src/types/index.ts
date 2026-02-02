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
  electrical_panel_phtos?: string
  installation_site_photos?: string
  documents?: string
  cable_meters?: string
  crm_entrance: boolean
  crm_id?: string
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

// Contact-based response types
export interface ContactResponse {
  id: string
  name?: string
  phoneNumber: string
  email?: string
  sessionCount: number
  totalMessageCount: number
  transferred: boolean
  lastActivityAt: string
  crmId?: string
}

export interface SessionMetadata {
  id: string
  createdAt: string
  transferred: boolean
  messageCount: number
}

export interface DocumentResponse {
  id: string
  sessionId: string
  category?: string
  imageId: string
  link: string
}

export interface ContactDetailResponse {
  contact: ContactResponse
  sessions: SessionMetadata[]
  messages: MessageResponse[]
  knowledgeVault: KnowledgeVaultResponse[]
  documents: DocumentResponse[]
}

export interface TransferredLeadResponse {
  id: string
  contactId: string
  sessionId: string
  contactName?: string
  phoneNumber: string
  email?: string
  qualificationStatus: number
  summary: string
  serviceType?: string
  localType?: string
  address?: string
  energyPower?: string
  electricalPanelPhotos?: string
  installationSitePhotos?: string
  documents?: string
  cableMeters?: string
  crmEntrance: boolean
  crmId?: string
  createdAt: string
  lastActivityAt: string
}
