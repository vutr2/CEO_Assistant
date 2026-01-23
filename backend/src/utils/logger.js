const config = require('../config/env');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = getTimestamp();
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaString}`;
};

const logger = {
  info: (message, meta = {}) => {
    if (['info', 'debug'].includes(config.LOG_LEVEL)) {
      console.log(
        `${colors.blue}ℹ ${formatMessage('INFO', message, meta)}${colors.reset}`
      );
    }
  },

  success: (message, meta = {}) => {
    console.log(
      `${colors.green}✓ ${formatMessage('SUCCESS', message, meta)}${colors.reset}`
    );
  },

  warn: (message, meta = {}) => {
    if (['info', 'debug', 'warn'].includes(config.LOG_LEVEL)) {
      console.warn(
        `${colors.yellow}⚠ ${formatMessage('WARN', message, meta)}${colors.reset}`
      );
    }
  },

  error: (message, error = null, meta = {}) => {
    const errorMeta = error ? { ...meta, error: error.message, stack: error.stack } : meta;
    console.error(
      `${colors.red}✖ ${formatMessage('ERROR', message, errorMeta)}${colors.reset}`
    );
  },

  debug: (message, meta = {}) => {
    if (config.LOG_LEVEL === 'debug') {
      console.log(
        `${colors.magenta}🔍 ${formatMessage('DEBUG', message, meta)}${colors.reset}`
      );
    }
  },

  http: (req, res, responseTime) => {
    const { method, originalUrl, ip } = req;
    const { statusCode } = res;

    let color = colors.green;
    if (statusCode >= 400 && statusCode < 500) color = colors.yellow;
    if (statusCode >= 500) color = colors.red;

    console.log(
      `${color}${method} ${originalUrl} ${statusCode} ${responseTime}ms - ${ip}${colors.reset}`
    );
  },
};

module.exports = logger;
