// Database connection module
// Currently using in-memory mock data
// To use MongoDB, install mongoose and uncomment the code below

const config = require('./env');

const connectDB = async () => {
  try {
    // Mock database connection for development
    console.log('✅ Using in-memory mock database');
    console.log(`📊 Environment: ${config.NODE_ENV}`);
    console.log('💡 To use MongoDB: install mongoose and update this file');

    // Simulated connection delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return { connected: true, type: 'mock' };

    /*
    // Uncomment below to use MongoDB:
    // npm install mongoose

    const mongoose = require('mongoose');
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
    */
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't exit in development with mock data
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
    return { connected: false, type: 'mock' };
  }
};

module.exports = connectDB;
