import { Router } from "express";
import { register, login, refreshToken } from "../controllers/authController";

const router = Router();

router.post("/register", register); // POST /api/auth/register
router.post("/login", login); // POST /api/auth/login
router.post("/refresh", refreshToken); // POST /api/auth/refresh

export default router;
