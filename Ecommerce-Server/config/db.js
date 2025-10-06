import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // Set connection timeout and other options
    const options = {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    };
    
    console.log(`🔌 Attempting to connect to MongoDB: ${process.env.MONGO_URI}`);
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    // In development, provide helpful instructions
    if (process.env.NODE_ENV !== 'production') {
      console.log(`
🔧 MongoDB Connection Failed - Development Instructions:
1. Install MongoDB: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service: 'sudo systemctl start mongod' or 'brew services start mongodb/brew/mongodb-community'
3. Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
4. Update MONGO_URI in .env file

Current MONGO_URI: ${process.env.MONGO_URI}
      `);
    }
    
    // Don't exit in development to allow testing of other endpoints
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;