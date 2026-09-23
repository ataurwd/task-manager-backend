"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_interview_2026';
    const options = {
        expiresIn: (process.env.JWT_EXPIRES_IN || '7d')
    };
    return jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, secret, options);
};
const register = async (req, res) => {
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
        const existingUser = await User_1.default.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'A user with this email address already exists'
            });
            return;
        }
        let processedInterests = [];
        if (Array.isArray(interests)) {
            processedInterests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
        }
        else if (typeof interests === 'string') {
            processedInterests = interests.split(',').map((i) => i.trim().toLowerCase()).filter(Boolean);
        }
        const userRole = role === 'admin' ? 'admin' : 'user';
        const user = await User_1.default.create({
            name,
            email: email.toLowerCase().trim(),
            password,
            role: userRole,
            interests: processedInterests
        });
        const token = generateToken(user);
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            expiresIn,
            user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};
exports.register = register;
const login = async (req, res) => {
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
        const user = await User_1.default.findOne({ email: email.toLowerCase().trim() }).select('+password');
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
        const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            expiresIn,
            user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};
exports.getMe = getMe;
