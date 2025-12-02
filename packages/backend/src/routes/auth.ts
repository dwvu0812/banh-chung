import { Router } from "express";
import { register, login, refreshToken, getCurrentUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Auth service is healthy" });
});

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.post("/refresh", refreshToken); // POST /api/auth/refresh
router.get("/me", protect, getCurrentUser); // GET /api/auth/me

export default router;
