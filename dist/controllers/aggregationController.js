"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPostsLookup = exports.getUsersByInterests = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../models/User"));
// group users by interests using MongoDB aggregation
const getUsersByInterests = async (req, res) => {
    try {
        const results = await User_1.default.aggregate([
            { $unwind: '$interests' },
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
            {
                $sort: { count: -1, _id: 1 }
            },
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
            description: 'Users grouped by interests',
            totalGroups: results.length,
            data: results
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to execute aggregation',
            error: error.message
        });
    }
};
exports.getUsersByInterests = getUsersByInterests;
// get user with their posts using $lookup
const getUserPostsLookup = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(userId)) {
            res.status(400).json({
                success: false,
                message: 'Invalid userId format'
            });
            return;
        }
        const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
        const results = await User_1.default.aggregate([
            { $match: { _id: userObjectId } },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'authorId',
                    pipeline: [{ $sort: { createdAt: -1 } }],
                    as: 'posts'
                }
            },
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
            description: 'User details with authored posts',
            data: results[0]
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to execute aggregation',
            error: error.message
        });
    }
};
exports.getUserPostsLookup = getUserPostsLookup;
