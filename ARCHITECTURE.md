# Architecture Overview

## System Architecture

```
┌─────────────┐
│   Client    │
│  (Browser/  │
│   App/API)  │
└──────┬──────┘
       │
       │ HTTPS/WSS
       │
       ▼
┌─────────────────────────────────────────┐
│  Cloudflare Worker (Edge Network)       │
│  ┌───────────────────────────────────┐  │
│  │  Request Handler                  │  │
│  │  • CORS Preflight                 │  │
│  │  • WebSocket Upgrade Detection    │  │
│  │  • HTTP/HTTPS Request Processing  │  │
│  └────────┬─────────────┬────────────┘  │
│           │             │                │
│    ┌──────▼──────┐ ┌───▼──────────┐    │
│    │   HTTP      │ │  WebSocket   │    │
│    │   Handler   │ │   Handler    │    │
│    └──────┬──────┘ └───┬──────────┘    │
│           │             │                │
│    ┌──────▼─────────────▼──────────┐   │
│    │   Header Manipulation         │   │
│    │   • Remove CF headers         │   │
│    │   • Add CORS headers          │   │
│    │   • Add Security headers      │   │
│    └──────┬──────────────┬─────────┘   │
└───────────┼──────────────┼─────────────┘
            │              │
            │ HTTP/HTTPS   │ WS/WSS
            │              │
            ▼              ▼
┌─────────────────────────────────────────┐
│         Target Server(s)                │
│  • API Endpoints                        │
│  • WebSocket Servers                    │
│  • Any HTTP/HTTPS Resource              │
└─────────────────────────────────────────┘
```

## Request Flow

### HTTP/HTTPS Request Flow

1. **Client Request**: Client sends HTTP/HTTPS request to worker
   ```
   GET https://worker.dev/?target=https://api.example.com/data
   ```

2. **Worker Processing**:
   - Parse target URL from query parameter or path
   - Validate target URL
   - Remove Cloudflare-specific headers
   - Forward request to target server

3. **Target Response**:
   - Receive response from target server
   - Add CORS headers
   - Add security headers
   - Remove fingerprinting headers

4. **Client Response**: Return modified response to client

### WebSocket Request Flow

1. **Client Upgrade**: Client initiates WebSocket connection
   ```
   Upgrade: websocket
   Connection: Upgrade
   ```

2. **Worker Processing**:
   - Detect WebSocket upgrade request
   - Parse target WebSocket URL
   - Create WebSocket pair (client ↔ worker)
   - Connect to target WebSocket server

3. **Bidirectional Communication**:
   - Messages from client → worker → target
   - Messages from target → worker → client
   - Handle close and error events

4. **Connection Termination**: Clean up when either side closes

## Key Components

### 1. Configuration (CONFIG)
```javascript
const CONFIG = {
  DEFAULT_TARGET: null,
  DEBUG: false,
  MAX_BODY_SIZE: 10MB,
  TIMEOUT: 30000ms,
  CORS: { ... },
  SECURITY_HEADERS: { ... },
  REMOVE_HEADERS: [ ... ]
}
```

### 2. Request Handler
- Main entry point: `fetch(request, env, ctx)`
- Routes to appropriate handler based on request type
- Implements error handling and timeout management

### 3. CORS Handler
- Handles OPTIONS preflight requests
- Adds CORS headers to all responses
- Configurable allowed origins, methods, and headers

### 4. HTTP Handler
- Processes GET, POST, PUT, DELETE, PATCH requests
- Manipulates headers for stealth
- Forwards request to target and returns response

### 5. WebSocket Handler
- Detects WebSocket upgrade requests
- Creates WebSocket pairs
- Implements bidirectional message forwarding
- Handles connection lifecycle (open, message, close, error)

### 6. Error Handler
- Catches and processes all errors
- Returns formatted error responses
- Logs errors for debugging

## Data Flow

### Request Headers
```
Client Request Headers
    ↓
Remove tracking headers:
  - cf-ray
  - cf-connecting-ip
  - x-forwarded-for
    ↓
Update Host header
    ↓
Forward to target
```

### Response Headers
```
Target Response Headers
    ↓
Add CORS headers:
  - Access-Control-Allow-Origin
  - Access-Control-Allow-Methods
  - Access-Control-Allow-Headers
    ↓
Add Security headers:
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
    ↓
Remove CF headers
    ↓
Return to client
```

## Security Features

### 1. Header Manipulation
- **Stealth Mode**: Removes Cloudflare-specific headers
- **Privacy**: Removes forwarding and IP headers
- **Security**: Adds security headers to all responses

### 2. CORS Protection
- Configurable allowed origins
- Preflight request handling
- Method and header whitelisting

### 3. Request Validation
- URL validation and parsing
- Protocol validation (HTTP/HTTPS/WS/WSS)
- Body size limits

### 4. Error Handling
- Graceful error recovery
- Detailed error messages (configurable)
- Prevents information leakage

## Performance Optimization

### 1. Edge Computing
- Runs on Cloudflare's global edge network
- Low latency (< 50ms to nearest edge)
- Automatic scaling

### 2. Connection Handling
- Efficient WebSocket connection management
- HTTP/2 and HTTP/3 support via Cloudflare
- Connection pooling

### 3. Minimal Overhead
- Small worker size (< 1MB)
- Fast startup time (< 10ms)
- Efficient header manipulation

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│   Cloudflare Global Network             │
│   ┌──────────┐  ┌──────────┐           │
│   │  Edge    │  │  Edge    │  ...      │
│   │ Location │  │ Location │           │
│   │   (NYC)  │  │  (LON)   │           │
│   └────┬─────┘  └────┬─────┘           │
└────────┼─────────────┼──────────────────┘
         │             │
         │    Worker Replicated to All Edges
         │             │
    ┌────▼─────────────▼────┐
    │  Your Worker Code     │
    │  • _worker.js         │
    │  • Configuration      │
    └───────────────────────┘
```

### Deployment Environments

1. **Development**: `wrangler dev` - Local testing
2. **Staging**: Custom worker name - Pre-production testing
3. **Production**: Custom domain - Live traffic

### Multi-Environment Setup

```toml
# wrangler.toml

# Default (development)
name = "no-ping-worker"
main = "_worker.js"

# Staging environment
[env.staging]
name = "no-ping-worker-staging"

# Production environment
[env.production]
name = "no-ping-worker-production"
routes = [
  { pattern = "proxy.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

## Monitoring and Observability

### Metrics Available

1. **Request Metrics**:
   - Total requests
   - Requests per second
   - Request duration
   - Status code distribution

2. **Error Metrics**:
   - Error count
   - Error rate
   - Error types

3. **Performance Metrics**:
   - CPU usage
   - Memory usage
   - Response time percentiles (p50, p95, p99)

### Logging

```javascript
// Enable debug logging
const CONFIG = {
  DEBUG: true
};

// View logs
wrangler tail
```

### Monitoring Tools

1. **Cloudflare Dashboard**: Real-time metrics and logs
2. **Wrangler Tail**: Live log streaming
3. **Analytics API**: Programmatic access to metrics

## Scalability

### Horizontal Scaling
- Automatic: Cloudflare handles scaling
- Global: Deployed to all edge locations
- No configuration needed

### Resource Limits
- CPU: 50ms per request (standard), 500ms (bundled workers)
- Memory: 128 MB
- Request size: 100 MB
- Response size: Unlimited
- WebSocket connections: 1000 per worker instance

### Best Practices
1. Keep worker code small and efficient
2. Minimize external API calls
3. Use streaming for large responses
4. Implement caching where appropriate
5. Monitor resource usage regularly

## Extension Points

### Future Enhancements

1. **Authentication**:
   - JWT validation
   - API key management
   - OAuth integration

2. **Rate Limiting**:
   - KV-based rate limiting
   - Durable Objects for distributed rate limiting
   - Per-client limits

3. **Caching**:
   - Cache API integration
   - Custom cache rules
   - Cache warming

4. **Analytics**:
   - Custom metrics
   - Request logging
   - Performance monitoring

5. **Transformation**:
   - Request/response transformation
   - Protocol conversion
   - Data enrichment
