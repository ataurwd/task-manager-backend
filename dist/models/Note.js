"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Note = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const noteSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
        type: String,
        required: [true, 'Note content is required'],
        trim: true
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Note must belong to a user']
    }
}, {
    timestamps: true
});
// ------------------------------------------------------------------------------------------
// Explicit Index Definitions (required by task specification: use schema.index method)
// ------------------------------------------------------------------------------------------
// 1. Compound index on userId & createdAt: Supports paginated list of notes for a specific user, sorted newest first
noteSchema.index({ userId: 1, createdAt: -1 });
// 2. Compound index on _id & userId: Supports fast single-note read/update/delete operations with ownership check
noteSchema.index({ _id: 1, userId: 1 });
// 3. Index on createdAt: Supports Admin view of everyone's notes with global pagination, sorted newest first
noteSchema.index({ createdAt: -1 });
exports.Note = mongoose_1.default.model('Note', noteSchema);
exports.default = exports.Note;
