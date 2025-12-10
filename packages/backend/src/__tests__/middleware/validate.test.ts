import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../../middleware/validate";

describe("Validation Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  describe("validate function", () => {
    const testSchema = z.object({
      body: z.object({
        username: z.string().min(3),
        email: z.string().email(),
      }),
    });

    it("should pass validation with valid data", async () => {
      mockReq.body = {
        username: "testuser",
        email: "test@example.com",
      };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it("should fail validation with invalid email", async () => {
      mockReq.body = {
        username: "testuser",
        email: "invalid-email",
      };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Validation failed",
          errors: expect.any(Array),
        })
      );
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should fail validation with username too short", async () => {
      mockReq.body = {
        username: "ab",
        email: "test@example.com",
      };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it("should provide detailed error messages", async () => {
      mockReq.body = {
        username: "",
        email: "bad-email",
      };

      const middleware = validate(testSchema);
      await middleware(mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      const response = (mockRes.json as jest.Mock).mock.calls[0][0];
      expect(response.errors).toBeInstanceOf(Array);
      expect(response.errors.length).toBeGreaterThan(0);
    });
  });
});

