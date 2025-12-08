import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { securityHeaders, corsConfig, apiSecurityHeaders } from './middleware/security';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import credentialRoutes from './routes/credential.routes';
import campaignRoutes from './routes/campaign.routes';

const app: Application = express();

// Security middleware
app.use(securityHeaders);
app.use(corsConfig);
app.use(apiSecurityHeaders);

// Cookie parser for CSRF
app.use(cookieParser());

// Body parsing middleware - increased limit for attachments
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting for all API routes
app.use('/api', apiLimiter);

// Health check (no rate limit)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/credentials', credentialRoutes);
app.use('/api/campaigns', campaignRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📝 Environment: ${env.NODE_ENV}`);
    logger.info(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
    logger.info(`📎 VERSION: 2.0 - Attachments Enabled`);
});

export default app;
