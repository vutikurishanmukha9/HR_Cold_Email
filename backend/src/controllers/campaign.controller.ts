import { Response, NextFunction } from 'express';
import { AuthRequest, RecipientDTO } from '../types';
import campaignService from '../services/campaign.service';
import credentialService from '../services/credential.service';
import emailService from '../services/email.service';
import { parseExcelFile } from '../utils/excel';
import { AppError } from '../middleware/errorHandler';
import multer from 'multer';
import path from 'path';
import { env } from '../config/env';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, env.UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: env.MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.xlsx', '.xls'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'));
        }
    },
});

interface SendCampaignRequest {
    credentialId?: string;
    credentialEmail?: string;
    subject: string;
    body: string;
    recipients: Array<{
        email: string;
        fullName: string;
        companyName: string;
        jobTitle?: string;
    }>;
    attachments?: Array<{
        filename: string;
        content: string; // base64 encoded
        contentType: string;
    }>;
    batchSize?: number;
    batchDelay?: number;
}

export class CampaignController {
    async createCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const recipients: RecipientDTO[] = req.body.recipients || [];
            const campaign = await campaignService.createCampaign(req.user!.id, req.body, recipients);
            res.status(201).json({ campaign });
        } catch (error) {
            next(error);
        }
    }

    async getCampaigns(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await campaignService.getCampaigns(req.user!.id, req.query);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async getCampaignById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const campaign = await campaignService.getCampaignById(req.user!.id, req.params.id);
            res.json({ campaign });
        } catch (error) {
            next(error);
        }
    }

    async updateCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const campaign = await campaignService.updateCampaign(req.user!.id, req.params.id, req.body);
            res.json({ campaign });
        } catch (error) {
            next(error);
        }
    }

    async deleteCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const result = await campaignService.deleteCampaign(req.user!.id, req.params.id);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async uploadRecipients(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            const fileBuffer = require('fs').readFileSync(req.file.path);
            const recipients = parseExcelFile(fileBuffer);

            // Clean up uploaded file
            require('fs').unlinkSync(req.file.path);

            res.json({ recipients, count: recipients.length });
        } catch (error) {
            // Clean up file on error
            if (req.file) {
                require('fs').unlinkSync(req.file.path);
            }
            next(error);
        }
    }

    /**
     * Send campaign emails using backend Nodemailer
     * This is the secure method - no credentials exposed to client
     */
    async sendCampaign(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
        try {
            const {
                credentialEmail,
                subject,
                body,
                recipients,
                attachments,
                batchSize = 10,
                batchDelay = 60
            } = req.body as SendCampaignRequest;

            if (!recipients || recipients.length === 0) {
                throw new AppError('No recipients provided', 400);
            }

            if (!subject || !body) {
                throw new AppError('Subject and body are required', 400);
            }

            // Log received attachments
            console.log(`[CampaignController] Received ${attachments?.length || 0} attachments`);
            if (attachments && attachments.length > 0) {
                attachments.forEach((att, i) => {
                    console.log(`[CampaignController] Attachment ${i + 1}: ${att.filename}, content length: ${att.content?.length || 0}`);
                });
            }

            // Get the user's email credential
            const credentials = await credentialService.getCredentials(req.user!.id);

            // Find the credential by email or use default
            let credential;
            if (credentialEmail) {
                const cred = credentials.find(c => c.email === credentialEmail);
                if (!cred) {
                    throw new AppError('Email credential not found', 404);
                }
                credential = await credentialService.getCredentialById(req.user!.id, cred.id);
            } else {
                const defaultCred = credentials.find(c => c.isDefault);
                if (!defaultCred) {
                    throw new AppError('No email credential configured', 400);
                }
                credential = await credentialService.getCredentialById(req.user!.id, defaultCred.id);
            }

            // Send emails in batches
            const results: Array<{ email: string; status: 'sent' | 'failed'; error?: string }> = [];

            for (let i = 0; i < recipients.length; i++) {
                const recipient = recipients[i];

                try {
                    // Personalize subject and body
                    const personalizedSubject = emailService.personalizeContent(subject, {
                        fullName: recipient.fullName,
                        companyName: recipient.companyName,
                        jobTitle: recipient.jobTitle || '',
                    });

                    const personalizedBody = emailService.personalizeContent(body, {
                        fullName: recipient.fullName,
                        companyName: recipient.companyName,
                        jobTitle: recipient.jobTitle || '',
                    });

                    // Send email with attachments - use proper nodemailer format
                    const emailAttachments = attachments?.map(att => ({
                        filename: att.filename,
                        content: Buffer.from(att.content, 'base64'),
                    }));

                    await emailService.sendEmail(
                        { email: credential.email, appPassword: credential.appPassword },
                        {
                            from: credential.email,
                            to: recipient.email,
                            subject: personalizedSubject,
                            html: personalizedBody,
                            attachments: emailAttachments,
                        }
                    );

                    results.push({ email: recipient.email, status: 'sent' });
                } catch (error: any) {
                    console.error(`Failed to send to ${recipient.email}:`, error.message);
                    results.push({
                        email: recipient.email,
                        status: 'failed',
                        error: error.message || 'Unknown error'
                    });
                }

                // Batch delay - wait between batches
                if ((i + 1) % batchSize === 0 && i < recipients.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, batchDelay * 1000));
                } else if (i < recipients.length - 1) {
                    // Small delay between individual emails (300ms)
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }

            const sentCount = results.filter(r => r.status === 'sent').length;
            const failedCount = results.filter(r => r.status === 'failed').length;

            res.json({
                message: `Campaign sent: ${sentCount} succeeded, ${failedCount} failed`,
                results,
                summary: { total: recipients.length, sent: sentCount, failed: failedCount }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new CampaignController();

