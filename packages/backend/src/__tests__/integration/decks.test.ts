import request from "supertest";
import express from "express";
import deckRoutes from "../../routes/decks";
import {
  createTestUser,
  createTestDeck,
  getAuthHeader,
} from "../helpers/testHelpers";

const app = express();
app.use(express.json());
app.use("/api/decks", deckRoutes);

describe("Decks API Integration Tests", () => {
  let user1: any, user2: any;
  let authHeader1: string, authHeader2: string;

  beforeEach(async () => {
    user1 = await createTestUser({
      username: "deckuser1",
      email: "deckuser1@example.com",
    });
    user2 = await createTestUser({
      username: "deckuser2",
      email: "deckuser2@example.com",
    });

    authHeader1 = getAuthHeader(user1._id.toString());
    authHeader2 = getAuthHeader(user2._id.toString());
  });

  describe("POST /api/decks", () => {
    it("should create a new deck for authenticated user", async () => {
      const deckData = {
        name: "Test Deck",
        description: "A test deck for learning",
      };

      const response = await request(app)
        .post("/api/decks")
        .set("Authorization", authHeader1)
        .send(deckData)
        .expect(201);

      expect(response.body.name).toBe("Test Deck");
      expect(response.body.description).toBe("A test deck for learning");
      expect(response.body.user).toBe(user1._id.toString());
    });

    it("should fail without authentication", async () => {
      const deckData = {
        name: "Test Deck",
        description: "A test deck for learning",
      };

      await request(app).post("/api/decks").send(deckData).expect(401);
    });
  });

  describe("GET /api/decks", () => {
    beforeEach(async () => {
      // Create test decks for each user
      await createTestDeck(user1._id, { name: "User 1 Deck 1" });
      await createTestDeck(user1._id, { name: "User 1 Deck 2" });
      await createTestDeck(user2._id, { name: "User 2 Deck 1" });
    });

    it("should return only decks belonging to authenticated user", async () => {
      const response = await request(app)
        .get("/api/decks")
        .set("Authorization", authHeader1)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].name).toContain("User 1");
      expect(response.body[1].name).toContain("User 1");
    });

    it("should return empty array for user with no decks", async () => {
      const newUser = await createTestUser({
        username: "nodeck",
        email: "nodeck@example.com",
      });
      const noDecksAuthHeader = getAuthHeader(newUser._id.toString());

      const response = await request(app)
        .get("/api/decks")
        .set("Authorization", noDecksAuthHeader)
        .expect(200);

      expect(response.body).toHaveLength(0);
    });
  });

  describe("GET /api/decks/:id", () => {
    let deck1: any, deck2: any;

    beforeEach(async () => {
      deck1 = await createTestDeck(user1._id, { name: "User 1 Deck" });
      deck2 = await createTestDeck(user2._id, { name: "User 2 Deck" });
    });

    it("should return deck for authorized owner", async () => {
      const response = await request(app)
        .get(`/api/decks/${deck1._id}`)
        .set("Authorization", authHeader1)
        .expect(200);

      expect(response.body.name).toBe("User 1 Deck");
      expect(response.body._id).toBe(deck1._id.toString());
    });

    it("should deny access to deck owned by another user", async () => {
      const response = await request(app)
        .get(`/api/decks/${deck1._id}`)
        .set("Authorization", authHeader2)
        .expect(401);

      expect(response.body.msg).toBe("User not authorized");
    });

    it("should return 404 for non-existent deck", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      await request(app)
        .get(`/api/decks/${fakeId}`)
        .set("Authorization", authHeader1)
        .expect(404);
    });
  });

  describe("PUT /api/decks/:id", () => {
    let deck: any;

    beforeEach(async () => {
      deck = await createTestDeck(user1._id, {
        name: "Original Name",
        description: "Original Description",
      });
    });

    it("should update deck for authorized owner", async () => {
      const updateData = {
        name: "Updated Name",
        description: "Updated Description",
      };

      const response = await request(app)
        .put(`/api/decks/${deck._id}`)
        .set("Authorization", authHeader1)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe("Updated Name");
      expect(response.body.description).toBe("Updated Description");
    });

    it("should deny update to deck owned by another user", async () => {
      const updateData = {
        name: "Hacked Name",
      };

      await request(app)
        .put(`/api/decks/${deck._id}`)
        .set("Authorization", authHeader2)
        .send(updateData)
        .expect(404);
    });
  });

  describe("DELETE /api/decks/:id", () => {
    let deck: any;

    beforeEach(async () => {
      deck = await createTestDeck(user1._id, { name: "To Be Deleted" });
    });

    it("should delete deck for authorized owner", async () => {
      const response = await request(app)
        .delete(`/api/decks/${deck._id}`)
        .set("Authorization", authHeader1)
        .expect(200);

      expect(response.body.msg).toBe("Deck and associated cards removed");
    });

    it("should deny delete to deck owned by another user", async () => {
      await request(app)
        .delete(`/api/decks/${deck._id}`)
        .set("Authorization", authHeader2)
        .expect(404);
    });
  });
});
