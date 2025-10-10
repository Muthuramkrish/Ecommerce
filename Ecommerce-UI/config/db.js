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
  }
};

export default connectDB;