import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Bánh Chưng Flashcard API",
      version: "1.0.0",
      description:
        "A comprehensive flashcard learning API with spaced repetition system (SRS), user management, and analytics",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "{BACKEND_URL}/api",
        description: "Production server",
        variables: {
          BACKEND_URL: {
            default: "https://your-backend-url.railway.app",
            description: "Your deployed backend URL",
          },
        },
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            username: { type: "string" },
            email: { type: "string", format: "email" },
            learningSettings: {
              type: "object",
              properties: {
                dailyTarget: { type: "number" },
                voiceSpeed: { type: "number" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Deck: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            description: { type: "string" },
            user: { type: "string" },
            isPublic: { type: "boolean" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Flashcard: {
          type: "object",
          properties: {
            _id: { type: "string" },
            word: { type: "string" },
            definition: { type: "string" },
            pronunciation: { type: "string" },
            examples: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
            deck: { type: "string" },
            user: { type: "string" },
            srsData: {
              type: "object",
              properties: {
                interval: { type: "number" },
                easeFactor: { type: "number" },
                repetitions: { type: "number" },
                nextReview: { type: "string", format: "date-time" },
              },
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

