import { Router } from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes here are restricted to authenticated Admins
router.use(authenticate, authorize('admin'));

router.route('/')
  .get(listUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
