import { Router } from 'express';
import { getPosts, getPostById, createPost } from '../controllers/postController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Public post reading
router.get('/', getPosts);
router.get('/:id', getPostById);

// Authenticated post creation
router.post('/', authenticate, createPost);

export default router;
