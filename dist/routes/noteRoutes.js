"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = require("../controllers/noteController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All note routes require authentication
router.use(auth_1.authenticate);
router.route('/')
    .get(noteController_1.getNotes)
    .post(noteController_1.createNote);
router.route('/:id')
    .get(noteController_1.getNoteById)
    .put(noteController_1.updateNote)
    .delete(noteController_1.deleteNote);
exports.default = router;
