import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    REFRESH_TOKEN_SECRET: string;
    REFRESH_TOKEN_EXPIRES_IN: string;
    ENCRYPTION_KEY: string;
    FRONTEND_URL: string;
    MAX_FILE_SIZE: number;
    UPLOAD_DIR: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
}

const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};

export const env: EnvConfig = {
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    PORT: parseInt(getEnvVar('PORT', '5000'), 10),
    DATABASE_URL: getEnvVar('DATABASE_URL'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN', '15m'),
    REFRESH_TOKEN_SECRET: getEnvVar('REFRESH_TOKEN_SECRET'),
    REFRESH_TOKEN_EXPIRES_IN: getEnvVar('REFRESH_TOKEN_EXPIRES_IN', '7d'),
    ENCRYPTION_KEY: getEnvVar('ENCRYPTION_KEY'),
    FRONTEND_URL: getEnvVar('FRONTEND_URL', 'http://localhost:3000'),
    MAX_FILE_SIZE: parseInt(getEnvVar('MAX_FILE_SIZE', '10485760'), 10),
    UPLOAD_DIR: getEnvVar('UPLOAD_DIR', './uploads'),
    RATE_LIMIT_WINDOW_MS: parseInt(getEnvVar('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVar('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
};
