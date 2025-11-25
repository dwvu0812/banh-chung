import request from "supertest";
import express from "express";
import authRoutes from "../../routes/auth";
import { createTestUser } from "../helpers/testHelpers";

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Auth API Integration Tests", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.msg).toBe("User registered successfully");
    });

    it("should fail to register with duplicate email", async () => {
      const userData = {
        username: "testuser",
        email: "duplicate@example.com",
        password: "password123",
      };

      // Register first user
      await request(app).post("/api/auth/register").send(userData).expect(201);

      // Try to register with same email
      const duplicateUserData = {
        username: "testuser2",
        email: "duplicate@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.msg).toBe("User already exists");
    });

    it("should fail to register without required fields", async () => {
      const userData = {
        username: "testuser",
        // missing email and password
      };

      await request(app).post("/api/auth/register").send(userData).expect(500);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user for login tests
      await createTestUser({
        username: "loginuser",
        email: "login@example.com",
      });
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "login@example.com",
        password: "testpass123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
    });

    it("should fail login with invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "testpass123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.msg).toBe("Invalid credentials");
    });

    it("should fail login with invalid password", async () => {
      const loginData = {
        email: "login@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body.msg).toBe("Invalid credentials");
    });
  });

  describe("POST /api/auth/refresh", () => {
    let refreshToken: string;

    beforeEach(async () => {
      // Create user and get refresh token
      await createTestUser({
        username: "refreshuser",
        email: "refresh@example.com",
      });

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "refresh@example.com",
        password: "testpass123",
      });

      refreshToken = loginResponse.body.refreshToken;
    });

    it("should refresh access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
    });

    it("should fail with invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(403);

      expect(response.body.msg).toBe("Invalid refresh token");
    });

    it("should fail without refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({})
        .expect(401);

      expect(response.body.msg).toBe("No refresh token provided");
    });
  });
});
