import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Mở rộng interface Request của Express để có thể chứa thuộc tính user
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role?: string;
  };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Lấy token từ header
      token = req.headers.authorization.split(" ")[1];

      // Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role?: string;
      };

      // Gắn thông tin user đã giải mã vào request
      req.user = { userId: decoded.userId, role: decoded.role };
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ msg: "Not authorized, no token" });
  }
};
