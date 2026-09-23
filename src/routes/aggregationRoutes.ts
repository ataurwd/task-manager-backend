import { Router } from 'express';
import {
  getUsersByInterests,
  getUserPostsLookup
} from '../controllers/aggregationController';

const router = Router();

// Scenario 1: Group by Interests (exactly one collection.aggregate() call)
router.get('/users-by-interests', getUsersByInterests);

// Scenario 2: User Posts (single aggregation pipeline with a $lookup stage)
router.get('/users/:userId/posts', getUserPostsLookup);

export default router;
