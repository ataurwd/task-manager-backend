"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const dns_1 = __importDefault(require("dns"));
const mongoose_1 = __importDefault(require("mongoose"));
// Ensure public DNS resolvers are used to resolve MongoDB Atlas SRV records
try {
    dns_1.default.setServers(['8.8.8.8', '1.1.1.1']);
}
catch (e) {
    // ignore if restricted
}
const connectDB = async () => {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
    const dbName = process.env.DB_NAME || 'task_manager_db';
    try {
        await mongoose_1.default.connect(uri, {
            dbName,
            serverSelectionTimeoutMS: 8000,
            autoIndex: true
        });
        console.log(`[Database] MongoDB connected successfully to database: "${dbName}" on host: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error(`[Database] Failed to connect to MongoDB at ${uri}:`, error.message);
        console.info('[Database] Please verify that your MongoDB service is running or check your MONGODB_URI in .env');
        throw error;
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.disconnect();
};
exports.disconnectDB = disconnectDB;
