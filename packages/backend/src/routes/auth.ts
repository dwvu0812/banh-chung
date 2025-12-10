import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../validators/authValidators";
import { authLimiter } from "../middleware/security";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Auth service is healthy" });
});

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.put("/password", protect, validate(changePasswordSchema), changePassword);

export default router;
