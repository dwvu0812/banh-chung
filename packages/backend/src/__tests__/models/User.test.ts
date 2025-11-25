import User from "../../models/User";

describe("User Model", () => {
  describe("User Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
        passwordHash: "hashedpassword123",
        learningSettings: {
          dailyTarget: 25,
          voiceSpeed: 1.0,
        },
      };

      const user = await User.create(userData);

      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.passwordHash).toBe("hashedpassword123");
      expect(user.learningSettings.dailyTarget).toBe(25);
      expect(user.learningSettings.voiceSpeed).toBe(1.0);
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it("should create a user with default learning settings", async () => {
      const userData = {
        username: "testuser2",
        email: "test2@example.com",
        passwordHash: "hashedpassword123",
      };

      const user = await User.create(userData);

      expect(user.learningSettings.dailyTarget).toBe(20);
      expect(user.learningSettings.voiceSpeed).toBe(1.0);
    });
  });

  describe("User Validation", () => {
    it("should fail without username", async () => {
      const userData = {
        email: "test@example.com",
        passwordHash: "hashedpassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail without email", async () => {
      const userData = {
        username: "testuser",
        passwordHash: "hashedpassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail without password hash", async () => {
      const userData = {
        username: "testuser",
        email: "test@example.com",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail with invalid email format", async () => {
      const userData = {
        username: "testuser",
        email: "invalid-email",
        passwordHash: "hashedpassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail with short username", async () => {
      const userData = {
        username: "ab",
        email: "test@example.com",
        passwordHash: "hashedpassword123",
      };

      await expect(User.create(userData)).rejects.toThrow();
    });

    it("should fail with duplicate email", async () => {
      const userData = {
        username: "testuser1",
        email: "duplicate@example.com",
        passwordHash: "hashedpassword123",
      };

      await User.create(userData);

      const duplicateUserData = {
        username: "testuser2",
        email: "duplicate@example.com",
        passwordHash: "hashedpassword123",
      };

      await expect(User.create(duplicateUserData)).rejects.toThrow();
    });
  });
});
