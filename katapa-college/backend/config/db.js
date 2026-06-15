const mongoose = require('mongoose');

const DEFAULT_MONGO_URI = 'mongodb://127.0.0.1:27017/zentrix_college';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_MONGO_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
