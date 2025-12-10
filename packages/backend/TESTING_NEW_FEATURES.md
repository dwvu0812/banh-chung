# Testing New Features Guide

Quick guide to test all newly implemented features.

## Setup

1. **Start the server:**
```bash
cd packages/backend
npm run dev
```

2. **Access API Documentation:**
Open http://localhost:5000/api-docs in your browser

## Test Checklist

### ✅ Phase 1: Security & Validation

#### Test Rate Limiting
```bash
# Try to login 6 times quickly (should fail on 6th attempt)
for i in {1..6}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

#### Test Input Validation
```bash
# Should fail with validation error
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ab","email":"invalid","password":"weak"}'
```

### ✅ Phase 2: User Profile

#### Test Profile Update
```bash
# Replace TOKEN with your actual token
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "learningSettings": {
      "dailyTarget": 30,
      "voiceSpeed": 1.2
    }
  }'
```

#### Test Password Change
```bash
curl -X PUT http://localhost:5000/api/auth/password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "NewPass123!"
  }'
```

### ✅ Phase 3: Search & Bulk Operations

#### Test Card Search
```bash
# Search for cards with text
curl "http://localhost:5000/api/search/cards?q=hello&page=1&limit=10" \
  -H "Authorization: Bearer TOKEN"

# Filter by tags
curl "http://localhost:5000/api/search/cards?tags=grammar,vocabulary" \
  -H "Authorization: Bearer TOKEN"

# Filter by SRS status
curl "http://localhost:5000/api/search/cards?srsStatus=due" \
  -H "Authorization: Bearer TOKEN"
```

#### Test Bulk Import
```bash
curl -X POST http://localhost:5000/api/bulk/import \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_ID",
    "cards": [
      {
        "word": "hello",
        "definition": "greeting",
        "examples": ["Hello, world!"],
        "tags": ["common", "greeting"]
      },
      {
        "word": "goodbye",
        "definition": "farewell",
        "examples": ["Goodbye, see you later!"],
        "tags": ["common", "farewell"]
      }
    ]
  }'
```

#### Test Bulk Export (JSON)
```bash
curl "http://localhost:5000/api/bulk/export/YOUR_DECK_ID" \
  -H "Authorization: Bearer TOKEN"
```

#### Test Bulk Export (CSV)
```bash
curl "http://localhost:5000/api/bulk/export/YOUR_DECK_ID/csv" \
  -H "Authorization: Bearer TOKEN" \
  --output flashcards.csv
```

#### Test Bulk Tag Update
```bash
curl -X PUT http://localhost:5000/api/bulk/tags \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cardIds": ["CARD_ID_1", "CARD_ID_2"],
    "tagsToAdd": ["important", "review"],
    "tagsToRemove": ["old-tag"]
  }'
```

### ✅ Phase 4: Enhanced Statistics

#### Test Learning Streaks
```bash
curl "http://localhost:5000/api/stats/streaks" \
  -H "Authorization: Bearer TOKEN"
```

#### Test Progress Stats
```bash
# Weekly progress
curl "http://localhost:5000/api/stats/progress/week" \
  -H "Authorization: Bearer TOKEN"

# Monthly progress
curl "http://localhost:5000/api/stats/progress/month" \
  -H "Authorization: Bearer TOKEN"
```

#### Test Record Study Session
```bash
curl -X POST http://localhost:5000/api/stats/sessions \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "deckId": "YOUR_DECK_ID",
    "cardsReviewed": 20,
    "cardsCorrect": 16,
    "duration": 300,
    "averageQuality": 3.8
  }'
```

#### Test Get Study Sessions
```bash
curl "http://localhost:5000/api/stats/sessions?limit=5" \
  -H "Authorization: Bearer TOKEN"
```

### ✅ Phase 5: Performance & Documentation

#### Check API Documentation
1. Open browser: http://localhost:5000/api-docs
2. Explore all endpoints
3. Try the "Try it out" feature

#### Test Response Time Logging
```bash
# Make a request and check server logs
curl "http://localhost:5000/api/decks" \
  -H "Authorization: Bearer TOKEN"

# Check logs/all.log for response time
```

## Quick Test with Postman

Import this collection JSON:

```json
{
  "info": {
    "name": "Bánh Chưng API - New Features",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Search Cards",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{baseUrl}}/search/cards?q=hello&tags=common&page=1&limit=10",
          "host": ["{{baseUrl}}"],
          "path": ["search", "cards"],
          "query": [
            {"key": "q", "value": "hello"},
            {"key": "tags", "value": "common"},
            {"key": "page", "value": "1"},
            {"key": "limit", "value": "10"}
          ]
        }
      }
    },
    {
      "name": "Bulk Import",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"deckId\": \"{{deckId}}\",\n  \"cards\": [\n    {\n      \"word\": \"test\",\n      \"definition\": \"a test word\",\n      \"tags\": [\"test\"]\n    }\n  ]\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{baseUrl}}/bulk/import",
          "host": ["{{baseUrl}}"],
          "path": ["bulk", "import"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "YOUR_JWT_TOKEN"
    },
    {
      "key": "deckId",
      "value": "YOUR_DECK_ID"
    }
  ]
}
```

## Expected Results

### Security Features
- ✅ Rate limiting blocks excessive requests
- ✅ Invalid inputs return 400 with detailed errors
- ✅ Unauthorized requests return 401
- ✅ All responses include proper security headers

### Search Features
- ✅ Text search returns relevant cards
- ✅ Tag filtering works correctly
- ✅ Pagination returns correct page sizes
- ✅ Sorting options work as expected

### Bulk Operations
- ✅ Import accepts up to 500 cards
- ✅ Export returns complete deck data
- ✅ CSV export downloads properly
- ✅ Tag operations update multiple cards

### Statistics
- ✅ Streaks calculated correctly
- ✅ Progress shows daily breakdown
- ✅ Sessions recorded with accurate data
- ✅ History retrieved successfully

### Performance
- ✅ Response times logged
- ✅ Slow requests (>1s) flagged
- ✅ All queries use indexes
- ✅ No N+1 query problems

## Troubleshooting

### Issue: Rate limit errors
**Solution**: Wait 15 minutes or restart server (dev mode resets limits)

### Issue: Validation errors
**Solution**: Check request body matches schema in API docs

### Issue: 401 Unauthorized
**Solution**: Refresh your JWT token (expires in 15 minutes)

### Issue: Slow queries
**Solution**: Check logs/all.log for SLOW QUERY warnings

### Issue: Can't access Swagger UI
**Solution**: Ensure server is running and visit http://localhost:5000/api-docs

## Performance Benchmarks

Expected response times:
- Simple GET requests: < 50ms
- Search queries: < 200ms
- Bulk import (100 cards): < 500ms
- Export operations: < 1s
- Statistics calculations: < 300ms

## Logs to Monitor

1. **logs/all.log** - All requests and responses
2. **logs/error.log** - Errors only
3. **Console output** - Color-coded logs with timestamps

## Next Steps After Testing

1. ✅ All tests pass
2. ✅ Performance acceptable
3. ✅ No errors in logs
4. Ready for staging deployment

## Support

If you encounter issues:
1. Check logs in `logs/` directory
2. Review API documentation at `/api-docs`
3. Verify environment variables
4. Check database connection
5. Ensure all dependencies installed

---

Happy Testing! 🚀

