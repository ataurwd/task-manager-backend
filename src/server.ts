import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { connectDB } from './config/db';
import { initKeepAlive } from './utils/keepAlive';

const PORT = process.env.PORT || 5000;

const startServer = (): void => {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Task Manager Backend Server is running on port ${PORT}`);
    console.log(`👉 API Docs & Health: http://localhost:${PORT}/api`);
    console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);

    initKeepAlive();
  });

  connectDB().catch((err) => {
    console.error('[Database] Asynchronous connection error:', err.message);
  });
};

startServer();
