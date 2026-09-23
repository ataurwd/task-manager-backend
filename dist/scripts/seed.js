"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_1 = require("../config/db");
const seedDatabase = async () => {
    try {
        await (0, db_1.connectDB)();
        console.log('[Seed] Database connected successfully.');
        console.log('[Seed] Ready for seed operations.');
        await (0, db_1.disconnectDB)();
        process.exit(0);
    }
    catch (error) {
        console.error('[Seed] Error:', error);
        process.exit(1);
    }
};
seedDatabase();
