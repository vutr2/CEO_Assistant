require('dotenv').config();

module.exports = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || 'localhost',

  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ceo-ai-assistant',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // AI Service Configuration
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gpt-4',
  AI_MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 2000,
  AI_TEMPERATURE: parseFloat(process.env.AI_TEMPERATURE) || 0.7,

  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  // Email Configuration (optional)
  EMAIL_HOST: process.env.EMAIL_HOST || '',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@ceoai.com',

  // Redis Configuration (optional for caching)
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Session
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret',
};
