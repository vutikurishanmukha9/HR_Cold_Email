/**
 * User credentials for Gmail SMTP authentication
 */
export interface Credentials {
  email: string;
  appPassword: string;
}

/**
 * Recipient information for personalized emails
 */
export interface Recipient {
  email: string;
  [key: string]: any;
}

/**
 * Email template with personalization placeholders
 */
export interface EmailTemplate {
  subject: string;
  body: string;
  attachments?: File[];
}

/**
 * Status of an email in the sending process
 */
export enum EmailStatus {
  Queued = 'Queued',
  Sending = 'Sending',
  Sent = 'Sent',
  Failed = 'Failed',
}

/**
 * Progress state for individual email sending
 */
export interface SendProgressState {
  status: EmailStatus;
  error?: string;
}

/**
 * Tracking statistics overview
 */
export interface TrackingStats {
  totalSent: number;
  totalOpened: number;
  openRate: number;
  totalClicks: number;
  uniqueClicks: number;
}

/**
 * Detailed tracking record for a single recipient
 */
export interface TrackingDetail {
  recipientEmail: string;
  subject?: string;
  campaignId?: string;
  opened: boolean;
  openCount: number;
  firstOpenedAt?: string;
  lastOpenedAt?: string;
  clicks: number;
  links: Array<{
    url: string;
    clicks: number;
    firstClickedAt?: string;
  }>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
