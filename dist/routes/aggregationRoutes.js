"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aggregationController_1 = require("../controllers/aggregationController");
const router = (0, express_1.Router)();
// Scenario 1: Group by Interests (exactly one collection.aggregate() call)
router.get('/users-by-interests', aggregationController_1.getUsersByInterests);
// Scenario 2: User Posts (single aggregation pipeline with a $lookup stage)
router.get('/users/:userId/posts', aggregationController_1.getUserPostsLookup);
exports.default = router;
