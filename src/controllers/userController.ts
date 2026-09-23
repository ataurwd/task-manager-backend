import { Request, Response } from 'express';
import User from '../models/User';
import Note from '../models/Note';
import Post from '../models/Post';

// @desc    List all users with pagination (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
export const listUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.role && (req.query.role === 'admin' || req.query.role === 'user')) {
      filter.role = req.query.role;
    }

    // Supported by compound index { role: 1, createdAt: -1 }
    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to list users',
      error: (error as Error).message
    });
  }
};

// @desc    Get single user details by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: (error as Error).message
    });
  }
};

// @desc    Create/Add a new user (Admin only)
// @route   POST /api/admin/users
// @access  Private (Admin)
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'A user with this email address already exists'
      });
      return;
    }

    let processedInterests: string[] = [];
    if (Array.isArray(interests)) {
      processedInterests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
    } else if (typeof interests === 'string') {
      processedInterests = interests.split(',').map((i) => i.trim().toLowerCase()).filter(Boolean);
    }

    const newUser = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
      interests: processedInterests
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully by admin',
      data: newUser
    });
  } catch (error) {
    if ((error as any).name === 'ValidationError') {
      const messages = Object.values((error as any).errors || {}).map((e: any) => e.message).join(', ');
      res.status(400).json({
        success: false,
        message: messages || 'User validation failed',
        error: (error as Error).message
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: (error as Error).message
    });
  }
};

// @desc    Update user details (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role, interests } = req.body;
    const updateData: Record<string, unknown> = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase().trim();
    if (role && (role === 'admin' || role === 'user')) updateData.role = role;
    if (interests !== undefined) {
      if (Array.isArray(interests)) {
        updateData.interests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
      } else if (typeof interests === 'string') {
        updateData.interests = interests.split(',').map((i) => i.trim().toLowerCase()).filter(Boolean);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: (error as Error).message
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Cascade delete associated user's notes and posts
    await Promise.all([
      Note.deleteMany({ userId }),
      Post.deleteMany({ authorId: userId })
    ]);

    res.status(200).json({
      success: true,
      message: 'User and all associated data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: (error as Error).message
    });
  }
};
