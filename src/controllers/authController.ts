import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../middleware/auth';

const generateToken = (user: IUser): string => {
  const secret: jwt.Secret = process.env.JWT_SECRET || 'super_secret_jwt_key_interview_2026';
  const options: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn']
  };
  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    options
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields'
      });
      return;
    }

    // Check existing email using unique index on email
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

    const userRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      interests: processedInterests
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: (error as Error).message
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
      return;
    }

    // Direct indexed query on email with +password
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: (error as Error).message
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};
