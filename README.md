# The Most Advanced No-Ping Cloudflare Worker

A powerful and feature-rich Cloudflare Worker implementation for proxying HTTP/HTTPS requests and WebSocket connections with advanced stealth and obfuscation capabilities.

## 🚀 Features

- **HTTP/HTTPS Proxying**: Forward any HTTP/HTTPS request through the worker
- **WebSocket Support**: Full WebSocket proxying with bidirectional communication
- **Protocol Obfuscation**: Remove Cloudflare-specific headers for stealth
- **CORS Handling**: Automatic CORS header injection for cross-origin requests
- **Security Headers**: Inject security headers for enhanced protection
- **Header Manipulation**: Remove tracking headers and fingerprinting data
- **Connection Optimization**: Efficient request handling and connection pooling
- **Multi-Protocol Support**: Handle HTTP, HTTPS, WS, and WSS protocols
- **Zero Configuration**: Works out of the box with sensible defaults
- **Production Ready**: Error handling, logging, and timeout management

## 📋 Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [HTTP/HTTPS Proxying](#httphttps-proxying)
  - [WebSocket Proxying](#websocket-proxying)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/1744132917/The-most-advanced-no-ping-cloudflare-worker.git
cd The-most-advanced-no-ping-cloudflare-worker
```

2. Install Wrangler (if not already installed):
```bash
npm install -g wrangler
```

3. Authenticate with Cloudflare:
```bash
wrangler login
```

4. Update `wrangler.toml` with your account details:
```toml
account_id = "your-account-id"
```

## 🎯 Usage

### HTTP/HTTPS Proxying

#### Query Parameter Method
Access any URL by passing it as a query parameter:

```bash
# Using curl
curl "https://your-worker.workers.dev/?target=https://api.github.com/users/github"

# Using browser
https://your-worker.workers.dev/?target=https://example.com
```

#### Path Parameter Method
Alternatively, append the target URL to the worker path:

```bash
# Using curl
curl "https://your-worker.workers.dev/https://api.github.com/users/github"

# Using browser
https://your-worker.workers.dev/https://example.com
```

### WebSocket Proxying

Connect to any WebSocket server through the worker:

```javascript
// JavaScript example
const ws = new WebSocket('wss://your-worker.workers.dev/?target=wss://echo.websocket.org');

ws.onopen = () => {
  console.log('Connected!');
  ws.send('Hello WebSocket!');
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};
```

```python
# Python example
import asyncio
import websockets

async def connect():
    uri = "wss://your-worker.workers.dev/?target=wss://echo.websocket.org"
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello WebSocket!")
        response = await websocket.recv()
        print(f"Received: {response}")

asyncio.run(connect())
```

## ⚙️ Configuration

Edit the `CONFIG` object in `_worker.js` to customize behavior:

```javascript
const CONFIG = {
  // Default target for proxying (optional)
  DEFAULT_TARGET: null,
  
  // Enable debug mode
  DEBUG: false,
  
  // Maximum request body size (10MB)
  MAX_BODY_SIZE: 10 * 1024 * 1024,
  
  // Connection timeout in milliseconds
  TIMEOUT: 30000,
  
  // CORS configuration
  CORS: {
    enabled: true,
    allowOrigin: '*',
    allowMethods: 'GET, POST, PUT, DELETE, OPTIONS, HEAD, PATCH',
    allowHeaders: '*',
    maxAge: 86400
  },
  
  // Security headers
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  },
  
  // Headers to remove for stealth mode
  REMOVE_HEADERS: [
    'cf-ray',
    'cf-connecting-ip',
    'cf-visitor',
    'cf-request-id',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-real-ip'
  ]
};
```

## 🚢 Deployment

### Deploy to Cloudflare Workers

1. **Development deployment** (workers.dev subdomain):
```bash
wrangler deploy
```

2. **Production deployment** (custom domain):

First, update `wrangler.toml`:
```toml
routes = [
  { pattern = "proxy.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

Then deploy:
```bash
wrangler deploy --env production
```

### Environment-Specific Deployments

Deploy to staging:
```bash
wrangler deploy --env staging
```

Deploy to production:
```bash
wrangler deploy --env production
```

## 📚 API Reference

### Worker Endpoint

**Base URL**: `https://your-worker.workers.dev`

### HTTP Requests

#### GET/POST/PUT/DELETE/PATCH

**Query Parameter Method:**
```
GET /?target=https://api.example.com/endpoint
```

**Path Parameter Method:**
```
GET /https://api.example.com/endpoint
```

**Headers:**
- All headers are forwarded to the target
- Cloudflare-specific headers are removed for stealth
- CORS headers are automatically added

### WebSocket Connections

**Connection URL:**
```
wss://your-worker.workers.dev/?target=wss://target-server.com/socket
```

**Requirements:**
- Include `Upgrade: websocket` header
- Specify target URL in query parameter

### Info Endpoint

Access the worker without parameters to see available endpoints and usage:

```bash
curl https://your-worker.workers.dev/
```

**Response:**
```json
{
  "name": "The Most Advanced No-Ping Cloudflare Worker",
  "version": "1.0.0",
  "description": "Advanced proxy worker with WebSocket support",
  "usage": {
    "http": {
      "queryParam": "/?target=https://example.com",
      "pathParam": "/https://example.com"
    },
    "websocket": {
      "endpoint": "/?target=wss://example.com/socket"
    }
  },
  "features": [
    "HTTP/HTTPS proxying",
    "WebSocket support",
    "CORS handling",
    "Header manipulation for stealth",
    "Security headers injection"
  ]
}
```

## 💡 Examples

### Example 1: Proxy API Request

```javascript
// Fetch GitHub user data through the proxy
fetch('https://your-worker.workers.dev/?target=https://api.github.com/users/github')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Example 2: POST Request with Body

```javascript
// Post data through the proxy
fetch('https://your-worker.workers.dev/?target=https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    key: 'value'
  })
})
  .then(response => response.json())
  .then(data => console.log(data));
```

### Example 3: WebSocket Chat Application

```javascript
// Connect to a WebSocket server through the proxy
const ws = new WebSocket('wss://your-worker.workers.dev/?target=wss://chat.example.com');

ws.addEventListener('open', () => {
  console.log('Connected to chat server');
  ws.send(JSON.stringify({ type: 'join', user: 'User123' }));
});

ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  console.log('Received message:', message);
});

ws.addEventListener('close', () => {
  console.log('Disconnected from chat server');
});
```

### Example 4: Using with cURL

```bash
# Simple GET request
curl "https://your-worker.workers.dev/?target=https://httpbin.org/get"

# POST request with data
curl -X POST \
  "https://your-worker.workers.dev/?target=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# With custom headers
curl -H "Authorization: Bearer token123" \
  "https://your-worker.workers.dev/?target=https://api.example.com/protected"
```

### Example 5: Using with Python Requests

```python
import requests

# Simple GET request
response = requests.get(
    'https://your-worker.workers.dev/',
    params={'target': 'https://api.github.com/users/github'}
)
print(response.json())

# POST request
response = requests.post(
    'https://your-worker.workers.dev/',
    params={'target': 'https://httpbin.org/post'},
    json={'key': 'value'}
)
print(response.json())
```

## 🔒 Security Considerations

### Important Security Notes

1. **Open Proxy Risk**: This worker acts as an open proxy. Consider implementing authentication to prevent abuse.

2. **Rate Limiting**: Implement rate limiting to prevent denial-of-service attacks.

3. **Target Whitelist**: Consider restricting allowed target domains in production:

```javascript
const ALLOWED_DOMAINS = ['example.com', 'api.example.com'];

function isAllowedDomain(url) {
  const hostname = new URL(url).hostname;
  return ALLOWED_DOMAINS.some(domain => hostname.endsWith(domain));
}
```

4. **Authentication**: Add authentication for production use:

```javascript
const AUTH_TOKEN = 'your-secret-token';

if (request.headers.get('Authorization') !== `Bearer ${AUTH_TOKEN}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

5. **HTTPS Only**: Always use HTTPS in production to prevent man-in-the-middle attacks.

### Recommended Security Enhancements

```javascript
// Add to CONFIG
const CONFIG = {
  // ... existing config
  
  // Authentication
  AUTH_ENABLED: true,
  AUTH_TOKEN: 'your-secret-token',
  
  // Domain whitelist
  ALLOWED_DOMAINS: ['example.com', '*.example.com'],
  
  // Rate limiting
  RATE_LIMIT: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  }
};
```

## 🛠️ Development

### Local Development

1. Start local development server:
```bash
wrangler dev
```

2. Test the worker:
```bash
curl "http://localhost:8787/?target=https://api.github.com/users/github"
```

### Testing

Test HTTP proxying:
```bash
# Test GET request
curl "https://your-worker.workers.dev/?target=https://httpbin.org/get"

# Test POST request
curl -X POST "https://your-worker.workers.dev/?target=https://httpbin.org/post" \
  -d '{"test":"data"}'

# Test headers
curl -I "https://your-worker.workers.dev/?target=https://httpbin.org/headers"
```

Test WebSocket:
```bash
# Using wscat (install: npm i -g wscat)
wscat -c "wss://your-worker.workers.dev/?target=wss://echo.websocket.org"
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Cloudflare Workers](https://workers.cloudflare.com/)
- Inspired by the need for privacy-preserving proxy solutions
- Thanks to the Cloudflare Workers community

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Check the [Cloudflare Workers documentation](https://developers.cloudflare.com/workers/)

## 🗺️ Roadmap

- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add request/response caching
- [ ] Support for more protocols (gRPC, etc.)
- [ ] Built-in analytics and monitoring
- [ ] Domain whitelist/blacklist management
- [ ] Custom error pages
- [ ] Request/response transformation plugins

---

**Note**: This worker is intended for legitimate proxy and privacy use cases. Please ensure you comply with all applicable laws and terms of service when deploying and using this worker.
