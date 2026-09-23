"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const keepAlive_1 = require("./utils/keepAlive");
const PORT = process.env.PORT || 5000;
const startServer = () => {
    app_1.default.listen(PORT, () => {
        console.log(`=======================================================`);
        console.log(`🚀 Task Manager Backend Server is running on port ${PORT}`);
        console.log(`👉 API Docs & Health: http://localhost:${PORT}/api`);
        console.log(`👉 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`=======================================================`);
        (0, keepAlive_1.initKeepAlive)();
    });
    (0, db_1.connectDB)().catch((err) => {
        console.error('[Database] Asynchronous connection error:', err.message);
    });
};
startServer();
