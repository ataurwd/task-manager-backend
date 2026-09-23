import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/db';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Database connected successfully.');
    console.log('[Seed] Ready for seed operations.');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error:', error);
    process.exit(1);
  }
};

seedDatabase();
