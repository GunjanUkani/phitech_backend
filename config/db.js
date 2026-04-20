const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error("MONGODB_URI is not set in environment variables.");
      return; // Don't exit, let subsequent queries fail or wait
    }
    
    // Check if already connected
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // In serverless, we don't want to exit the process as it might be reused
    // process.exit(1); 
  }
};

module.exports = connectDB;
