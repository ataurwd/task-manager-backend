import dns from 'dns';
import mongoose from 'mongoose';

// Atlas SRV dns fix
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // ignore if restricted
}

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME;

  if (!uri) {
    throw new Error('Please provide MONGODB_URI in .env file');
  }
  if (!dbName) {
    throw new Error('Please provide DB_NAME in .env file');
  }

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
