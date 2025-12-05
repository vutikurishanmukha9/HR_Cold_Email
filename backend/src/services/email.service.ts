import nodemailer from 'nodemailer';
import { AppError } from '../middleware/errorHandler';

interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Array<{
        filename: string;
        path: string;
    }>;
}

interface SMTPConfig {
    email: string;
    appPassword: string;
}

export class EmailService {
    /**
     * Sends an email using nodemailer with Gmail SMTP
     */
    async sendEmail(config: SMTPConfig, options: EmailOptions): Promise<void> {
        console.log(`[EmailService] Attempting to send email to: ${options.to}`);
        console.log(`[EmailService] Using sender: ${config.email}`);

        try {
            // Create transporter
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: config.email,
                    pass: config.appPassword,
                },
                debug: true, // Enable debug output
                logger: true, // Log to console
            });

            // Verify connection first
            console.log('[EmailService] Verifying SMTP connection...');
            try {
                await transporter.verify();
                console.log('[EmailService] SMTP connection verified successfully');
            } catch (verifyError: any) {
                console.error('[EmailService] SMTP verification failed:', verifyError.message);
                throw new AppError(`SMTP authentication failed: ${verifyError.message}`, 401);
            }

            // Send email
            console.log('[EmailService] Sending email...');
            const info = await transporter.sendMail({
                from: options.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments,
            });

            console.log(`[EmailService] Email sent successfully! MessageId: ${info.messageId}`);
        } catch (error: any) {
            console.error('[EmailService] Email sending failed:');
            console.error('[EmailService] Error name:', error.name);
            console.error('[EmailService] Error message:', error.message);
            console.error('[EmailService] Error code:', error.code);
            console.error('[EmailService] Error response:', error.response);

            // Provide user-friendly error messages
            if (error.code === 'EAUTH' || error.message?.includes('Invalid login')) {
                throw new AppError('Gmail authentication failed. Please check your App Password is correct and has no spaces.', 401);
            } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
                throw new AppError('Unable to connect to Gmail. Please check your internet connection.', 503);
            } else if (error instanceof AppError) {
                throw error;
            } else {
                throw new AppError(`Email sending failed: ${error.message}`, 500);
            }
        }
    }

    /**
     * Personalizes email content with recipient data
     */
    personalizeContent(template: string, data: Record<string, string>): string {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            const placeholder = `{${key}}`;
            result = result.replace(new RegExp(placeholder, 'g'), value || '');
        }
        return result;
    }
}

export default new EmailService();
