import { Router } from "express";
import { register, login, refreshToken, getCurrentUser } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.post("/refresh", refreshToken); // POST /api/auth/refresh
router.get("/me", protect, getCurrentUser); // GET /api/auth/me

export default router;
