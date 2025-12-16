import { Response, NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import User, { UserRole } from "../models/User";

export const requireSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ msg: "Not authenticated" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      res
        .status(403)
        .json({ msg: "Access denied. Super admin privileges required." });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ msg: "Not authenticated" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ msg: "User not found" });
      return;
    }

    if (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
      res
        .status(403)
        .json({ msg: "Access denied. Admin privileges required." });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
