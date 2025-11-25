# API Documentation

Complete API reference for Bánh Chưng Flashcard App.

## Base URL
```
Development: http://localhost:5000/api
Production: https://your-backend-url.railway.app/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `201 Created`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "johndoe",
  "email": "john@example.com",
  "learningSettings": {
    "dailyTarget": 20,
    "voiceSpeed": 1.0
  }
}
```

---

## Deck Endpoints

### Get All Decks
```http
GET /api/decks
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Essential English",
    "description": "Basic English vocabulary",
    "user": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Deck
```http
GET /api/decks/:id
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Essential English",
  "description": "Basic English vocabulary",
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Deck
```http
POST /api/decks
```

**Request Body:**
```json
{
  "name": "Business English",
  "description": "Professional vocabulary"
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "name": "Business English",
  "description": "Professional vocabulary",
  "user": "507f1f77bcf86cd799439011",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Update Deck
```http
PUT /api/decks/:id
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Updated Name",
  "description": "Updated description",
  "user": "507f1f77bcf86cd799439011"
}
```

### Delete Deck
```http
DELETE /api/decks/:id
```

**Response:** `200 OK`
```json
{
  "msg": "Deck and associated cards removed"
}
```

---

## Flashcard Endpoints

### Get Cards by Deck
```http
GET /api/decks/:deckId/cards
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "word": "hello",
    "definition": "a greeting",
    "pronunciation": "https://translate.google.com/...",
    "examples": ["Hello world", "Say hello"],
    "deck": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "srsData": {
      "interval": 1,
      "easeFactor": 2.5,
      "repetitions": 0,
      "nextReview": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

### Create Card
```http
POST /api/decks/:deckId/cards
```

**Request Body:**
```json
{
  "word": "goodbye",
  "definition": "a farewell",
  "examples": ["Goodbye everyone", "Say goodbye"]
}
```

**Response:** `201 Created`
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "word": "goodbye",
  "definition": "a farewell",
  "examples": ["Goodbye everyone", "Say goodbye"],
  "deck": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011",
  "srsData": {
    "interval": 1,
    "easeFactor": 2.5,
    "repetitions": 0,
    "nextReview": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Single Card
```http
GET /api/cards/:cardId
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "word": "hello",
  "definition": "a greeting",
  "pronunciation": "https://translate.google.com/...",
  "examples": ["Hello world"],
  "deck": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011"
}
```

### Update Card
```http
PUT /api/cards/:cardId
```

**Request Body:**
```json
{
  "word": "hello",
  "definition": "updated definition",
  "examples": ["New example"]
}
```

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "word": "hello",
  "definition": "updated definition",
  "examples": ["New example"],
  "deck": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011"
}
```

### Delete Card
```http
DELETE /api/cards/:cardId
```

**Response:** `200 OK`
```json
{
  "msg": "Flashcard removed"
}
```

### Generate Audio
```http
POST /api/cards/:cardId/audio
```

**Request Body (optional):**
```json
{
  "lang": "en-US"
}
```

**Response:** `200 OK`
```json
{
  "audioUrl": "https://translate.google.com/translate_tts?...",
  "card": {
    "_id": "507f1f77bcf86cd799439014",
    "word": "hello",
    "pronunciation": "https://translate.google.com/..."
  }
}
```

---

## Review Endpoints

### Get Review Cards
```http
GET /api/reviews
```

Returns cards that are due for review (up to 20 cards).

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439014",
    "word": "hello",
    "definition": "a greeting",
    "pronunciation": "https://translate.google.com/...",
    "examples": ["Hello world"],
    "srsData": {
      "interval": 1,
      "easeFactor": 2.5,
      "repetitions": 0,
      "nextReview": "2024-01-01T00:00:00.000Z"
    }
  }
]
```

### Submit Review
```http
POST /api/reviews/:cardId
```

**Request Body:**
```json
{
  "quality": 4
}
```

Quality ratings:
- `0` - Again (completely forgot)
- `3` - Hard (difficult to remember)
- `4` - Good (remembered with effort)
- `5` - Easy (remembered easily)

**Response:** `200 OK`
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "word": "hello",
  "srsData": {
    "interval": 2,
    "easeFactor": 2.6,
    "repetitions": 1,
    "nextReview": "2024-01-03T00:00:00.000Z"
  }
}
```

---

## Statistics Endpoints

### Get Dashboard Stats
```http
GET /api/stats/dashboard
```

**Response:** `200 OK`
```json
{
  "cardsDueToday": 15,
  "totalCards": 150,
  "newCardsToday": 5,
  "totalDecks": 3
}
```

### Get Deck Stats
```http
GET /api/stats/deck/:deckId
```

**Response:** `200 OK`
```json
{
  "deckId": "507f1f77bcf86cd799439012",
  "deckName": "Essential English",
  "totalCards": 50,
  "cardsDue": 10,
  "masteredCards": 30,
  "newCards": 10,
  "masteryPercentage": 60
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "msg": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "msg": "User not authorized"
}
```

### 404 Not Found
```json
{
  "msg": "Resource not found"
}
```

### 500 Server Error
```json
{
  "msg": "Server Error"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding:
- 100 requests per 15 minutes per IP
- 1000 requests per hour per authenticated user

---

## Pagination

Currently endpoints return all results. Future implementation:

```http
GET /api/decks?page=1&limit=10
```

---

## Data Models

### User
```typescript
{
  _id: ObjectId,
  username: string,
  email: string,
  passwordHash: string,
  learningSettings: {
    dailyTarget: number,
    voiceSpeed: number
  },
  createdAt: Date
}
```

### Deck
```typescript
{
  _id: ObjectId,
  name: string,
  description: string,
  user: ObjectId (ref: User),
  createdAt: Date
}
```

### Flashcard
```typescript
{
  _id: ObjectId,
  word: string,
  definition: string,
  pronunciation?: string,
  examples: string[],
  deck: ObjectId (ref: Deck),
  user: ObjectId (ref: User),
  srsData: {
    interval: number,
    easeFactor: number,
    repetitions: number,
    nextReview: Date
  },
  createdAt: Date
}
```

---

## WebSocket Support

Currently not implemented. Future feature for real-time updates.

---

## API Versioning

Current version: `v1` (implicit)

Future versions will use URL versioning:
```
/api/v2/decks
```

