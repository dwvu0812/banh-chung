import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { protect, AuthRequest } from "../../middleware/authMiddleware";

// Mock environment variables
process.env.JWT_SECRET = "test-secret-key";

describe("Auth Middleware", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("protect middleware", () => {
    it("should fail if no token provided", () => {
      protect(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Not authorized, no token",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail if token is invalid", () => {
      mockReq.headers = {
        authorization: "Bearer invalid-token",
      };

      protect(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Not authorized, token failed",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should pass if valid token provided", () => {
      const userId = "test-user-id";
      const token = jwt.sign({ userId }, process.env.JWT_SECRET!);

      mockReq.headers = {
        authorization: `Bearer ${token}`,
      };

      protect(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.user).toEqual({ userId });
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should fail if authorization header does not start with Bearer", () => {
      mockReq.headers = {
        authorization: "InvalidFormat token",
      };

      protect(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});

