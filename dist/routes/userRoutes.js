"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes here are restricted to authenticated Admins
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin'));
router.route('/')
    .get(userController_1.listUsers)
    .post(userController_1.createUser);
router.route('/:id')
    .get(userController_1.getUserById)
    .put(userController_1.updateUser)
    .delete(userController_1.deleteUser);
exports.default = router;
