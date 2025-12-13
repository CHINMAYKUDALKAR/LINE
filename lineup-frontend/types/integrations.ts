export type IntegrationProvider =
  | 'salesforce'
  | 'hubspot'
  | 'zoho'
  | 'workday'
  | 'lever'
  | 'greenhouse'
  | 'bamboohr'
  | 'google_calendar'
  | 'outlook_calendar'
  | 'custom';

export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending_auth';

export type AuthType = 'oauth2' | 'api_key' | 'basic';

export type SyncDirection = 'inbound' | 'outbound' | 'bidirectional';

export type SyncCadence = 'realtime' | '15min' | '1hour' | '6hours' | 'daily' | 'manual';

export type ConflictResolution = 'source_wins' | 'target_wins' | 'latest_wins' | 'manual';

export interface Integration {
  id: string;
  tenantId: string;
  provider: IntegrationProvider;
  name: string;
  description: string;
  status: IntegrationStatus;
  authType: AuthType;
  supportedObjects: string[];
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  config?: IntegrationConfig;
}

export interface IntegrationConfig {
  syncDirection: SyncDirection;
  syncCadence: SyncCadence;
  conflictResolution: ConflictResolution;
  enableWebhooks: boolean;
  webhookUrl?: string;
}

export interface FieldMapping {
  id: string;
  integrationId: string;
  sourceField: string;
  sourceType: string;
  targetField: string;
  targetType: string;
  transform?: string;
  required: boolean;
  validated: boolean;
}

export interface IntegrationField {
  name: string;
  type: string;
  label: string;
  required: boolean;
  description?: string;
}

export interface WebhookEvent {
  id: string;
  integrationId: string;
  eventType: string;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  payload: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
  attempts: number;
  createdAt: Date;
  processedAt?: Date;
}

export interface IntegrationError {
  id: string;
  integrationId: string;
  recordId: string;
  objectType: string;
  errorType: string;
  errorMessage: string;
  payload: Record<string, unknown>;
  retryable: boolean;
  retryCount: number;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface IntegrationMetrics {
  integrationId: string;
  period: string;
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  successRate: number;
  avgLatencyMs: number;
  recordsProcessed: number;
  queuedJobs: number;
  lastError?: string;
}
