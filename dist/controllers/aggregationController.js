"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPostsLookup = exports.getUsersByInterests = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
// @desc    Scenario 1: Group users by interests
// @route   GET /api/aggregations/users-by-interests
// @access  Public or Protected
// @rule    Constraint: You must use exactly one collection.aggregate() call. Do not use any other methods.
const getUsersByInterests = async (req, res) => {
    try {
        // Pipeline executed using strictly ONE User.aggregate() call
        // Supported by multikey index on interests: userSchema.index({ interests: 1 })
        const results = await User_1.default.aggregate([
            // Stage 1: Deconstruct the interests array so each element creates an individual document
            { $unwind: '$interests' },
            // Stage 2: Group by interest name and accumulate user details + count
            {
                $group: {
                    _id: '$interests',
                    count: { $sum: 1 },
                    users: {
                        $push: {
                            _id: '$_id',
                            name: '$name',
                            email: '$email',
                            role: '$role'
                        }
                    }
                }
            },
            // Stage 3: Sort alphabetically or by popular interest count
            {
                $sort: { count: -1, _id: 1 }
            },
            // Stage 4: Project clean output shape
            {
                $project: {
                    interest: '$_id',
                    count: 1,
                    users: 1,
                    _id: 0
                }
            }
        ]);
        res.status(200).json({
            success: true,
            description: 'MongoDB Aggregation Scenario 1: Users grouped by interests using single aggregate() call',
            totalGroups: results.length,
            data: results
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to execute Group by Interests aggregation',
            error: error.message
        });
    }
};
exports.getUsersByInterests = getUsersByInterests;
// @desc    Scenario 2: Retrieve all posts belonging to a particular user using $lookup
// @route   GET /api/aggregations/users/:userId/posts
// @access  Public or Protected
// @rule    Constraint: Use a single aggregation pipeline with a $lookup stage.
const getUserPostsLookup = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid userId format. Must be a valid 24-character hexadecimal ObjectId.'
            });
            return;
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        // Single aggregation pipeline with a $lookup stage
        // Supported by index on User {_id: 1} and Post { authorId: 1, createdAt: -1 }
        const results = await User_1.default.aggregate([
            // Stage 1: Filter to target user
            { $match: { _id: userObjectId } },
            // Stage 2: Lookup posts belonging to this user from the 'posts' collection
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'authorId',
                    pipeline: [
                        { $sort: { createdAt: -1 } }
                    ],
                    as: 'posts'
                }
            },
            // Stage 3: Project desired fields (hide password and internal fields)
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    role: 1,
                    interests: 1,
                    createdAt: 1,
                    postsCount: { $size: '$posts' },
                    posts: 1
                }
            }
        ]);
        if (!results || results.length === 0) {
            res.status(404).json({
                success: false,
                message: `User with id ${userId} not found`
            });
            return;
        }
        res.status(200).json({
            success: true,
            description: 'MongoDB Aggregation Scenario 2: Single aggregation pipeline with $lookup stage',
            data: results[0]
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to execute User Posts ($lookup) aggregation',
            error: error.message
        });
    }
};
exports.getUserPostsLookup = getUserPostsLookup;
