"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const generateToken = (userId) => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "7d";
    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not set");
    }
    return jsonwebtoken_1.default.sign({ userId }, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });
};
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email, and password",
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters long",
            });
        }
        const existingUser = await User_1.default.findOne({
            $or: [{ email }, { username }],
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email or username already exists",
            });
        }
        const user = new User_1.default({
            username,
            email,
            password,
        });
        await user.save();
        const token = generateToken(user._id.toString());
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({
                message: `${field} already exists`,
            });
        }
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({
            message: "Server error during registration",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password",
            });
        }
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const token = generateToken(user._id.toString());
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error during login",
        });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }
        res.json({
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            message: "Server error while fetching profile",
        });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "User not authenticated",
            });
        }
        const { username, email } = req.body;
        const userId = req.user._id;
        if (username || email) {
            const query = {
                _id: { $ne: userId },
            };
            if (username && email) {
                query.$or = [{ username }, { email }];
            }
            else if (username) {
                query.username = username;
            }
            else if (email) {
                query.email = email;
            }
            const existingUser = await User_1.default.findOne(query);
            if (existingUser) {
                return res.status(400).json({
                    message: "Username or email already exists",
                });
            }
        }
        const updateData = {};
        if (username)
            updateData.username = username;
        if (email)
            updateData.email = email;
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
            runValidators: true,
        });
        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        res.json({
            message: "Profile updated successfully",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                createdAt: updatedUser.createdAt,
                updatedAt: updatedUser.updatedAt,
            },
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                message: "Validation error",
                errors: messages,
            });
        }
        res.status(500).json({
            message: "Server error while updating profile",
        });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map