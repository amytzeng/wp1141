# API Testing Guide

This guide explains how to test the backend API using Swagger UI and other tools.

## Using Swagger UI

### Access Swagger UI

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api/swagger-ui
   ```

3. You'll see the Swagger UI interface with all available API endpoints organized by tags:
   - **Webhook**: Line webhook endpoints
   - **Admin**: Admin API endpoints for managing conversations
   - **System**: System health check endpoints
   - **Documentation**: API documentation endpoints

### Testing Endpoints in Swagger UI

1. **Expand an endpoint** by clicking on it
2. Click the **"Try it out"** button
3. Fill in any required parameters
4. Click **"Execute"** to send the request
5. View the response below, including:
   - Response code
   - Response headers
   - Response body

### Example: Testing Health Check

1. Navigate to `/api/health` endpoint
2. Click "Try it out"
3. Click "Execute"
4. You should see a response like:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "services": {
       "database": "connected",
       "line": "configured",
       "llm": "configured"
     }
   }
   ```

### Example: Testing Conversations List

1. Navigate to `/api/admin/conversations` endpoint
2. Click "Try it out"
3. Optionally set query parameters:
   - `page`: Page number (default: 1)
   - `limit`: Items per page (default: 20)
   - `lineUserId`: Filter by user ID
   - `startDate`: Filter from date (ISO 8601 format)
   - `endDate`: Filter until date (ISO 8601 format)
4. Click "Execute"
5. View the response with conversation list and pagination info

## Using cURL

You can also test endpoints using cURL from the command line.

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Get Conversations
```bash
curl "http://localhost:3000/api/admin/conversations?page=1&limit=10"
```

### Get Statistics
```bash
curl "http://localhost:3000/api/admin/stats"
```

### Get Conversation Details
```bash
curl "http://localhost:3000/api/admin/conversations/{conversationId}"
```

## Using Postman

1. Import the OpenAPI spec:
   - Go to Postman
   - Click "Import"
   - Enter URL: `http://localhost:3000/api/swagger`
   - Or import the JSON file directly

2. All endpoints will be imported as a collection
3. You can test each endpoint individually
4. Set environment variables if needed

## Testing Line Webhook

The Line webhook endpoint requires special handling:

1. **Signature Validation**: The endpoint validates the `x-line-signature` header
2. **Request Body**: Must be the raw request body (not JSON parsed)
3. **Testing**: Use Line's webhook testing tool or simulate with proper signature

### Simulating Line Webhook (for testing)

You can use the Line Developers Console to send test events, or use a tool like ngrok to expose your local server:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Use the ngrok URL in Line Developer Console webhook settings
```

## Expected Responses

### Success Response
- Status: `200 OK`
- Body: JSON object with requested data

### Error Responses
- `400 Bad Request`: Invalid parameters
- `401 Unauthorized`: Missing or invalid signature (for webhook)
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: Service unhealthy (for health check)

## Common Issues

### CORS Errors
- Swagger UI should work without CORS issues in the same origin
- For external testing, you may need to configure CORS headers

### Database Connection Errors
- Ensure MongoDB URI is correct in `.env.local`
- Check that MongoDB Atlas allows connections from your IP

### Missing Environment Variables
- Check that all required environment variables are set
- Use the health check endpoint to verify configuration

## Next Steps

After testing the backend API:
1. Verify all endpoints return expected responses
2. Test error handling with invalid inputs
3. Test pagination and filtering
4. Verify database operations (create, read)
5. Test with actual Line webhook events (after deployment)

