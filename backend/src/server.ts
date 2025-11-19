import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';

// Import routes
import authRoutes from './routes/auth.routes';
import credentialRoutes from './routes/credential.routes';
import campaignRoutes from './routes/campaign.routes';

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.FRONTEND_URL,
    credentials: true,
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', apiLimiter);

// Health check
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
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
});

export default app;
