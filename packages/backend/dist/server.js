"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const decks_1 = __importDefault(require("./routes/decks"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/auth", auth_1.default);
app.use("/api/decks", decks_1.default);
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Banh Chung API is running",
        timestamp: new Date().toISOString(),
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found" });
});
mongoose_1.default
    .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/banh-chung")
    .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
})
    .catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map