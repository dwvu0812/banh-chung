# Bánh Chưng API Reference

Complete API documentation for the Flashcard Learning Application.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-url.railway.app/api
```

## API Documentation UI

Interactive API documentation is available at:
- Development: http://localhost:5000/api-docs
- Production: https://your-backend-url.railway.app/api-docs

## Authentication

All endpoints except `/auth/register`, `/auth/login`, and `/auth/refresh` require JWT authentication.

Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **Create endpoints**: 50 requests per hour
- **General API**: 100 requests per 15 minutes

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
```

#### Update Profile
```http
PUT /api/auth/profile
```

**Request Body:**
```json
{
  "username": "new_username",
  "email": "new@example.com",
  "learningSettings": {
    "dailyTarget": 25,
    "voiceSpeed": 1.2
  }
}
```

#### Change Password
```http
PUT /api/auth/password
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "NewSecurePass123"
}
```

### Decks

#### Get All Decks
```http
GET /api/decks
```

#### Create Deck
```http
POST /api/decks
```

**Request Body:**
```json
{
  "name": "English Vocabulary",
  "description": "Common English words"
}
```

#### Get Single Deck
```http
GET /api/decks/:id
```

#### Update Deck
```http
PUT /api/decks/:id
```

#### Delete Deck
```http
DELETE /api/decks/:id
```

#### Get Cards in Deck
```http
GET /api/decks/:deckId/cards
```

#### Create Card in Deck
```http
POST /api/decks/:deckId/cards
```

**Request Body:**
```json
{
  "word": "hello",
  "definition": "A greeting",
  "pronunciation": "https://...",
  "examples": ["Hello, how are you?"],
  "tags": ["greeting", "common"]
}
```

### Flashcards

#### Get Single Card
```http
GET /api/cards/:cardId
```

#### Update Card
```http
PUT /api/cards/:cardId
```

#### Delete Card
```http
DELETE /api/cards/:cardId
```

#### Generate Audio
```http
POST /api/cards/:cardId/audio
```

**Request Body:**
```json
{
  "lang": "en-US"
}
```

### Reviews

#### Get Review Cards
```http
GET /api/reviews
```

#### Submit Review
```http
POST /api/reviews/:cardId
```

**Request Body:**
```json
{
  "quality": 4
}
```
*Quality: 0-5 (0=Again, 3=Hard, 4=Good, 5=Easy)*

### Statistics

#### Dashboard Stats
```http
GET /api/stats/dashboard
```

#### Deck Stats
```http
GET /api/stats/deck/:deckId
```

#### Learning Streaks
```http
GET /api/stats/streaks
```

#### Progress Stats
```http
GET /api/stats/progress/:timeframe
```
*Timeframe: week, month, year*

#### Record Study Session
```http
POST /api/stats/sessions
```

**Request Body:**
```json
{
  "deckId": "deck-id",
  "cardsReviewed": 20,
  "cardsCorrect": 16,
  "duration": 300,
  "averageQuality": 3.8
}
```

#### Get Study Sessions
```http
GET /api/stats/sessions?limit=10
```

### Search

#### Search Cards
```http
GET /api/search/cards?q=hello&deckId=xxx&tags=grammar&srsStatus=due
```

**Query Parameters:**
- `q`: Search text
- `deckId`: Filter by deck
- `tags`: Comma-separated tags
- `srsStatus`: new, learning, review, due
- `sortBy`: word, nextReview, createdAt
- `order`: asc, desc
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 20)

#### Search Decks
```http
GET /api/search/decks?q=english&isPublic=false
```

#### Get All Tags
```http
GET /api/search/tags
```

### Bulk Operations

#### Bulk Import Cards
```http
POST /api/bulk/import
```

**Request Body:**
```json
{
  "deckId": "deck-id",
  "cards": [
    {
      "word": "hello",
      "definition": "greeting",
      "examples": ["Hello!"],
      "tags": ["common"]
    }
  ]
}
```

#### Bulk Export Cards (JSON)
```http
GET /api/bulk/export/:deckId
```

#### Bulk Export Cards (CSV)
```http
GET /api/bulk/export/:deckId/csv
```

#### Bulk Update Tags
```http
PUT /api/bulk/tags
```

**Request Body:**
```json
{
  "cardIds": ["id1", "id2"],
  "tagsToAdd": ["grammar"],
  "tagsToRemove": ["old-tag"]
}
```

#### Bulk Delete Cards
```http
DELETE /api/bulk/cards
```

**Request Body:**
```json
{
  "cardIds": ["id1", "id2", "id3"]
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Data Models

### User
```typescript
{
  _id: string;
  username: string;
  email: string;
  learningSettings: {
    dailyTarget: number;
    voiceSpeed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Deck
```typescript
{
  _id: string;
  name: string;
  description?: string;
  user: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Flashcard
```typescript
{
  _id: string;
  word: string;
  definition: string;
  pronunciation?: string;
  examples: string[];
  tags: string[];
  deck: string;
  user: string;
  srsData: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    nextReview: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### StudySession
```typescript
{
  _id: string;
  user: string;
  deck: string;
  startTime: Date;
  endTime: Date;
  cardsReviewed: number;
  cardsCorrect: number;
  cardsIncorrect: number;
  averageQuality: number;
  duration: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting per endpoint type
- Request size limits (10MB)
- MongoDB injection protection
- XSS protection via input sanitization
- Security headers (helmet)
- CORS configuration

## Performance Features

- Database indexing on frequently queried fields
- Text search indexes
- Compound indexes for complex queries
- Response time logging
- Slow query detection
- In-memory caching utility
- Request/response compression (recommended in production)

## Best Practices

1. **Always include Authorization header** for protected routes
2. **Handle rate limiting** - implement exponential backoff
3. **Validate input** on client side before sending
4. **Use pagination** for large datasets
5. **Cache frequent requests** when appropriate
6. **Monitor response times** and optimize slow queries
7. **Keep tokens secure** - never expose in URLs or logs
8. **Refresh tokens** before expiry (access tokens expire in 15 minutes)

## Support

For issues or questions, please refer to the main README or open an issue in the repository.

