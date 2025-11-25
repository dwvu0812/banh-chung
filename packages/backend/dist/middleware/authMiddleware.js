"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. No token provided or invalid format.",
            });
        }
        const token = authHeader.substring(7);
        if (!token) {
            return res.status(401).json({
                message: "Access denied. No token provided.",
            });
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET is not set in environment variables");
            return res.status(500).json({
                message: "Server configuration error.",
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await User_1.default.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(401).json({
                message: "Token is not valid. User not found.",
            });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "Token is not valid.",
            });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token has expired.",
            });
        }
        console.error("Auth middleware error:", error);
        res.status(500).json({
            message: "Server error during authentication.",
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }
        const token = authHeader.substring(7);
        if (!token) {
            return next();
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            return next();
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const user = await User_1.default.findById(decoded.userId).select("-password");
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=authMiddleware.js.map