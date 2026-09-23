"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.listUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Note_1 = __importDefault(require("../models/Note"));
const Post_1 = __importDefault(require("../models/Post"));
const listUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const filter = {};
        if (req.query.role && (req.query.role === 'admin' || req.query.role === 'user')) {
            filter.role = req.query.role;
        }
        const [users, total] = await Promise.all([
            User_1.default.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-password'),
            User_1.default.countDocuments(filter)
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to list users',
            error: error.message
        });
    }
};
exports.listUsers = listUsers;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: error.message
        });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, email, password, role, interests } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
            return;
        }
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
        const newUser = await User_1.default.create({
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
    }
    catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors || {}).map((e) => e.message).join(', ');
            res.status(400).json({
                success: false,
                message: messages || 'User validation failed',
                error: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create user',
            error: error.message
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const { name, email, role, interests } = req.body;
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email.toLowerCase().trim();
        if (role && (role === 'admin' || role === 'user'))
            updateData.role = role;
        if (interests !== undefined) {
            if (Array.isArray(interests)) {
                updateData.interests = interests.map((i) => String(i).trim().toLowerCase()).filter(Boolean);
            }
            else if (typeof interests === 'string') {
                updateData.interests = interests.split(',').map((i) => i.trim().toLowerCase()).filter(Boolean);
            }
        }
        const updatedUser = await User_1.default.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true, runValidators: true }).select('-password');
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update user',
            error: error.message
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User_1.default.findByIdAndDelete(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        // cascade delete user's notes and posts
        await Promise.all([
            Note_1.default.deleteMany({ userId }),
            Post_1.default.deleteMany({ authorId: userId })
        ]);
        res.status(200).json({
            success: true,
            message: 'User and all associated data deleted successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        });
    }
};
exports.deleteUser = deleteUser;
