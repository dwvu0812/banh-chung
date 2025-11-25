# 🧪 Backend Testing Guide

## Overview

This testing setup provides comprehensive coverage for the Banh Chung flashcard backend API, including unit tests, integration tests, and database testing with MongoDB Memory Server.

## 🛠️ Testing Stack

- **Jest** - Testing framework
- **Supertest** - HTTP assertions for API testing
- **MongoDB Memory Server** - In-memory MongoDB for isolated testing
- **TypeScript** - Full TypeScript support for tests

## 📁 Test Structure

```
src/__tests__/
├── setup.ts                    # Global test setup
├── helpers/
│   └── testHelpers.ts          # Test utilities and factories
├── lib/
│   └── srs.test.ts            # SRS algorithm unit tests
├── models/
│   └── User.test.ts           # Model validation tests
├── controllers/
│   └── [controller].test.ts   # Controller unit tests
└── integration/
    ├── auth.test.ts           # Auth API integration tests
    └── decks.test.ts          # Deck API integration tests
```

## 🚀 Quick Start

### Install Dependencies

```bash
cd packages/backend
npm install
```

### Run All Tests

```bash
npm test
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Only Integration Tests

```bash
npm run test:integration
```

## 📝 Available Test Scripts

| Script                     | Description                    |
| -------------------------- | ------------------------------ |
| `npm test`                 | Run all tests                  |
| `npm run test:watch`       | Run tests in watch mode        |
| `npm run test:coverage`    | Run tests with coverage report |
| `npm run test:integration` | Run only integration tests     |

## 🧰 Test Utilities

### Test Factories

The `testHelpers.ts` provides factories for creating test data:

```typescript
import {
  createTestUser,
  createTestDeck,
  createTestFlashcard,
  getAuthHeader,
} from "../helpers/testHelpers";

// Create test user
const user = await createTestUser({
  username: "customuser",
  email: "custom@example.com",
});

// Create test deck
const deck = await createTestDeck(user._id, {
  name: "Custom Deck",
});

// Create test flashcard
const card = await createTestFlashcard(user._id, deck._id, {
  word: "hello",
});

// Get auth header for API calls
const authHeader = getAuthHeader(user._id.toString());
```

## 📊 Test Categories

### 1. Unit Tests

Test individual functions and components in isolation:

- **Models** - Validation, schema, defaults
- **SRS Algorithm** - Spaced repetition calculations
- **Controllers** - Business logic functions
- **Middleware** - Authentication, validation

### 2. Integration Tests

Test complete API endpoints with real HTTP requests:

- **Authentication** - Register, login, refresh token
- **Deck Management** - CRUD operations, authorization
- **Flashcard Operations** - Create, update, delete
- **Review System** - Get reviews, submit results

### 3. Database Tests

All tests use MongoDB Memory Server for:

- **Isolated testing** - Each test runs with fresh database
- **Fast execution** - In-memory database operations
- **No side effects** - Tests don't affect development data

## 🔧 Writing Tests

### Unit Test Example

```typescript
import { calculateSM2 } from "../../lib/srs";

describe("SRS Algorithm", () => {
  it("should calculate correct interval", () => {
    const result = calculateSM2(4, 2, 6, 2.5);

    expect(result.interval).toBe(15);
    expect(result.repetitions).toBe(3);
  });
});
```

### Integration Test Example

```typescript
import request from "supertest";
import { createTestUser, getAuthHeader } from "../helpers/testHelpers";

describe("Decks API", () => {
  let user: any;
  let authHeader: string;

  beforeEach(async () => {
    user = await createTestUser();
    authHeader = getAuthHeader(user._id.toString());
  });

  it("should create a deck", async () => {
    const response = await request(app)
      .post("/api/decks")
      .set("Authorization", authHeader)
      .send({ name: "Test Deck" })
      .expect(201);

    expect(response.body.name).toBe("Test Deck");
  });
});
```

## 🔒 Environment Setup

Tests use these environment variables:

- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret-key-for-testing`
- `JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing`

## 📈 Coverage Goals

- **Overall**: > 80%
- **Functions**: > 85%
- **Statements**: > 80%
- **Branches**: > 75%

## 🚨 Testing Best Practices

### 1. Isolated Tests

- Each test should be independent
- Use fresh data for each test
- Clean up after each test

### 2. Descriptive Names

```typescript
// Good
it("should return 401 for invalid JWT token");

// Bad
it("should fail authentication");
```

### 3. Arrange-Act-Assert

```typescript
it("should create user with valid data", async () => {
  // Arrange
  const userData = { username: "test", email: "test@example.com" };

  // Act
  const user = await User.create(userData);

  // Assert
  expect(user.username).toBe("test");
});
```

### 4. Test Edge Cases

- Invalid inputs
- Missing required fields
- Unauthorized access
- Non-existent resources

## 🐛 Debugging Tests

### Run Single Test File

```bash
npm test src/__tests__/lib/srs.test.ts
```

### Run Single Test Case

```bash
npm test -- --testNamePattern="should reset interval"
```

### Verbose Output

```bash
npm test -- --verbose
```

## 📋 Test Checklist

When adding new features, ensure:

- [ ] Unit tests for new functions
- [ ] Integration tests for new endpoints
- [ ] Edge case coverage
- [ ] Error handling tests
- [ ] Authorization tests (for protected routes)
- [ ] Database relationship tests
- [ ] Input validation tests

## 🎯 Current Test Status

✅ **Implemented:**

- SRS algorithm unit tests
- User model tests
- Auth API integration tests
- Deck API integration tests
- Test setup and utilities

🚧 **TODO:**

- Flashcard controller tests
- Review system tests
- Middleware unit tests
- Error handling tests
- Performance tests

Run tests to see current coverage and ensure all tests pass before deploying!
