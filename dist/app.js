"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const noteRoutes_1 = __importDefault(require("./routes/noteRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const aggregationRoutes_1 = __importDefault(require("./routes/aggregationRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({
    origin: '*',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
// Root API overview
app.get('/api', (_req, res) => {
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
app.use('/api/auth', authRoutes_1.default);
app.use('/api/notes', noteRoutes_1.default);
app.use('/api/admin/users', userRoutes_1.default);
app.use('/api/posts', postRoutes_1.default);
app.use('/api/aggregations', aggregationRoutes_1.default);
// 404 Handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found'
    });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('[API Error]:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
exports.default = app;
