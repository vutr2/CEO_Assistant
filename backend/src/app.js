const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFoundHandler } = require('./middlewares/errors.middleware');
const logger = require('./utils/logger');

const app = express();

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS Configuration
const corsOptions = {
  origin: config.CORS_ORIGIN.split(',').map(origin => origin.trim()),
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP Request Logger
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Custom Request Logger
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req, res, duration);
  });

  next();
});

// Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CEO AI Assistant API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/health',
      api: '/api/v1',
    },
  });
});

// ============================================================================
// API ROUTES
// ============================================================================

app.use('/api/v1', routes);

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ============================================================================
// EXPORT APP
// ============================================================================

module.exports = app;
