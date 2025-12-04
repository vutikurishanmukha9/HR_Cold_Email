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
            });

            // Send email
            await transporter.sendMail({
                from: options.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                attachments: options.attachments,
            });
        } catch (error) {
            console.error('Email sending error:', error);
            throw new AppError('Failed to send email', 500);
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
