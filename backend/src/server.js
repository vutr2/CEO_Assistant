const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

// ============================================================================
// HANDLE UNCAUGHT EXCEPTIONS
// ============================================================================

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', err);
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

const startServer = async () => {
  try {
    // Connect to Database
    logger.info('Connecting to database...');
    await connectDB();

    // Start Express Server
    const server = app.listen(config.PORT, () => {
      logger.success(`Server started successfully`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info(`Server running on http://${config.HOST}:${config.PORT}`);
      logger.info(`Health check: http://${config.HOST}:${config.PORT}/health`);
      logger.info(`API endpoint: http://${config.HOST}:${config.PORT}/api/v1`);
      logger.info('Press CTRL+C to stop the server');
    });

    // ============================================================================
    // HANDLE UNHANDLED PROMISE REJECTIONS
    // ============================================================================

    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
      server.close(() => {
        process.exit(1);
      });
    });

    // ============================================================================
    // GRACEFUL SHUTDOWN
    // ============================================================================

    const gracefulShutdown = (signal) => {
      logger.info(`\n${signal} received. Closing HTTP server gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// ============================================================================
// INITIALIZE APPLICATION
// ============================================================================

startServer();
