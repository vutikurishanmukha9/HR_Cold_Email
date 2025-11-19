import { Response, NextFunction } from 'express';
import { AuthRequest, RecipientDTO } from '../types';
import campaignService from '../services/campaign.service';
import { parseExcelFile } from '../utils/excel';
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
}

export default new CampaignController();
