import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.DB_NAME || 'task_manager_db';

  try {
    await mongoose.connect(uri, {
      dbName,
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    });
    console.log(`[Database] MongoDB connected successfully to database: "${dbName}" on host: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`[Database] Failed to connect to MongoDB at ${uri}:`, (error as Error).message);
    console.info('[Database] Please verify that your MongoDB service is running or check your MONGODB_URI in .env');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
