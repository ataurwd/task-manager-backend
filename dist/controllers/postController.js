"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPost = exports.getPostById = exports.getPosts = void 0;
const Post_1 = __importDefault(require("../models/Post"));
const getPosts = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            Post_1.default.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('authorId', 'name email role'),
            Post_1.default.countDocuments()
        ]);
        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit) || 1
            },
            data: posts
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
};
exports.getPosts = getPosts;
const getPostById = async (req, res) => {
    try {
        const post = await Post_1.default.findById(req.params.id).populate('authorId', 'name email role');
        if (!post) {
            res.status(404).json({
                success: false,
                message: 'Post not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: post
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch post',
            error: error.message
        });
    }
};
exports.getPostById = getPostById;
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
            return;
        }
        const post = await Post_1.default.create({
            title,
            content,
            authorId: req.user?._id
        });
        const populatedPost = await Post_1.default.findById(post._id).populate('authorId', 'name email role');
        res.status(201).json({
            success: true,
            message: 'Post published successfully',
            data: populatedPost
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to create post',
            error: error.message
        });
    }
};
exports.createPost = createPost;
