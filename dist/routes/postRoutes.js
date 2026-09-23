"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public post reading
router.get('/', postController_1.getPosts);
router.get('/:id', postController_1.getPostById);
// Authenticated post creation
router.post('/', auth_1.authenticate, postController_1.createPost);
exports.default = router;
