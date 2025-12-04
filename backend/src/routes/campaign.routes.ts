import { Router } from 'express';
import campaignController, { upload } from '../controllers/campaign.controller';
import { authenticate } from '../middleware/auth';
import { validate, validateQuery } from '../middleware/validation';
import { createCampaignSchema, updateCampaignSchema, paginationSchema, sendCampaignSchema } from '../utils/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validate(createCampaignSchema), campaignController.createCampaign);
router.get('/', validateQuery(paginationSchema), campaignController.getCampaigns);
router.get('/:id', campaignController.getCampaignById);
router.patch('/:id', validate(updateCampaignSchema), campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// File upload route for recipients
router.post('/upload-recipients', upload.single('file'), campaignController.uploadRecipients);

// Send campaign emails via backend (secure - no credentials exposed to client)
router.post('/send', validate(sendCampaignSchema), campaignController.sendCampaign);

export default router;


