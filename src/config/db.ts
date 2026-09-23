import dns from 'dns';
import mongoose from 'mongoose';

// Ensure public DNS resolvers are used to resolve MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.DB_NAME || 'task_manager_db';

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 8000,
      autoIndex: true
    });
    console.log(`[Database] MongoDB connected successfully to database: "${dbName}" on host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[Database] Failed to connect to MongoDB at ${uri}:`, (error as Error).message);
    console.info('[Database] Please verify that your MongoDB service is running or check your MONGODB_URI in .env');
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
