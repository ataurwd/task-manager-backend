import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import noteRoutes from './routes/noteRoutes';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';
import aggregationRoutes from './routes/aggregationRoutes';

const app: Application = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Root API overview
app.get('/api', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Secure Note-Taking & Task REST API',
    version: '1.0.0',
    documentation: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      notes: {
        list: 'GET /api/notes (paginated: page, limit)',
        getOne: 'GET /api/notes/:id',
        create: 'POST /api/notes',
        update: 'PUT /api/notes/:id',
        delete: 'DELETE /api/notes/:id'
      },
      admin: {
        listUsers: 'GET /api/admin/users (paginated: page, limit, role)',
        getUser: 'GET /api/admin/users/:id',
        createUser: 'POST /api/admin/users',
        updateUser: 'PUT /api/admin/users/:id',
        deleteUser: 'DELETE /api/admin/users/:id'
      },
      posts: {
        list: 'GET /api/posts (paginated)',
        getOne: 'GET /api/posts/:id',
        create: 'POST /api/posts'
      },
      aggregations: {
        groupByInterests: 'GET /api/aggregations/users-by-interests (Scenario 1)',
        userPostsLookup: 'GET /api/aggregations/users/:userId/posts (Scenario 2)'
      }
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/aggregations', aggregationRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

export default app;
