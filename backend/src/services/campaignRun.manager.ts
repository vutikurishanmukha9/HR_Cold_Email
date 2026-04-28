/**
 * Campaign Run Manager
 * In-memory store for tracking live campaign progress.
 * Each "run" holds per-recipient status that the WebSocket and polling
 * endpoint expose to the frontend.
 *
 * Runs auto-expire after 1 hour to prevent memory leaks.
 */
import { v4 as uuidv4 } from 'uuid';

export interface RecipientProgress {
    email: string;
    status: 'queued' | 'sending' | 'sent' | 'failed';
    error?: string;
    sentAt?: Date;
}

export interface CampaignRun {
    id: string;
    userId: string;
    status: 'running' | 'completed';
    recipients: Record<string, RecipientProgress>;
    totalCount: number;
    sentCount: number;
    failedCount: number;
    startedAt: Date;
    completedAt?: Date;
}

// In-memory store
const runs = new Map<string, CampaignRun>();

// Auto-expire runs after 1 hour
const EXPIRY_MS = 60 * 60 * 1000;

function scheduleExpiry(runId: string) {
    setTimeout(() => {
        runs.delete(runId);
    }, EXPIRY_MS);
}

/**
 * Create a new campaign run and return its ID.
 */
export function createRun(userId: string, recipientEmails: string[]): CampaignRun {
    const id = uuidv4();
    const recipients: Record<string, RecipientProgress> = {};

    recipientEmails.forEach(email => {
        recipients[email] = { email, status: 'queued' };
    });

    const run: CampaignRun = {
        id,
        userId,
        status: 'running',
        recipients,
        totalCount: recipientEmails.length,
        sentCount: 0,
        failedCount: 0,
        startedAt: new Date(),
    };

    runs.set(id, run);
    scheduleExpiry(id);
    return run;
}

/**
 * Update a single recipient's status within a run.
 */
export function updateRecipient(
    runId: string,
    email: string,
    status: 'sending' | 'sent' | 'failed',
    error?: string
): RecipientProgress | null {
    const run = runs.get(runId);
    if (!run || !run.recipients[email]) return null;

    const prev = run.recipients[email];
    run.recipients[email] = {
        ...prev,
        status,
        error,
        sentAt: status === 'sent' ? new Date() : prev.sentAt,
    };

    // Update counts
    if (status === 'sent') run.sentCount++;
    if (status === 'failed') run.failedCount++;

    // Check if all done
    if (run.sentCount + run.failedCount >= run.totalCount) {
        run.status = 'completed';
        run.completedAt = new Date();
    }

    return run.recipients[email];
}

/**
 * Get a campaign run by ID.
 */
export function getRun(runId: string): CampaignRun | undefined {
    return runs.get(runId);
}

/**
 * Get a summary snapshot for the polling endpoint.
 */
export function getRunStatus(runId: string) {
    const run = runs.get(runId);
    if (!run) return null;

    return {
        id: run.id,
        status: run.status,
        totalCount: run.totalCount,
        sentCount: run.sentCount,
        failedCount: run.failedCount,
        recipients: run.recipients,
        startedAt: run.startedAt,
        completedAt: run.completedAt,
    };
}

export default { createRun, updateRecipient, getRun, getRunStatus };
