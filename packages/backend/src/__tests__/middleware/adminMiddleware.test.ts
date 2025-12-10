import { Request, Response, NextFunction } from "express";
import { requireSuperAdmin, requireAdmin } from "../../middleware/adminMiddleware";
import User, { UserRole } from "../../models/User";
import { AuthRequest } from "../../middleware/authMiddleware";

jest.mock("../../models/User");

describe("Admin Middleware", () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: "testUserId" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("requireSuperAdmin", () => {
    it("should allow super admin users", async () => {
      const mockUser = {
        _id: "testUserId",
        role: UserRole.SUPER_ADMIN,
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await requireSuperAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should reject non-super-admin users", async () => {
      const mockUser = {
        _id: "testUserId",
        role: UserRole.USER,
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await requireSuperAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Access denied. Super admin privileges required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should reject unauthenticated requests", async () => {
      mockReq.user = undefined;

      await requireSuperAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should handle user not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await requireSuperAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ msg: "User not found" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("requireAdmin", () => {
    it("should allow super admin users", async () => {
      const mockUser = {
        _id: "testUserId",
        role: UserRole.SUPER_ADMIN,
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should allow admin users", async () => {
      const mockUser = {
        _id: "testUserId",
        role: UserRole.ADMIN,
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should reject regular users", async () => {
      const mockUser = {
        _id: "testUserId",
        role: UserRole.USER,
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        msg: "Access denied. Admin privileges required.",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

