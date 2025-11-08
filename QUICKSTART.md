# Quick Start Guide

Get up and running with the No-Ping Cloudflare Worker in 5 minutes!

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works!)
- [Node.js](https://nodejs.org/) v16+ installed
- Basic familiarity with command line

## Installation Steps

### Step 1: Install Wrangler

```bash
npm install -g wrangler
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/1744132917/The-most-advanced-no-ping-cloudflare-worker.git
cd The-most-advanced-no-ping-cloudflare-worker
```

### Step 3: Login to Cloudflare

```bash
wrangler login
```

This will open a browser window for authentication.

### Step 4: Configure Your Worker

Edit `wrangler.toml` and add your account ID:

```toml
account_id = "your-account-id-here"
```

You can find your account ID in the [Cloudflare dashboard](https://dash.cloudflare.com/) → Workers → Overview → Account ID

### Step 5: Deploy!

```bash
wrangler deploy
```

That's it! Your worker is now live at `https://no-ping-worker.your-subdomain.workers.dev`

## Test Your Worker

### Test HTTP Proxying

```bash
# Replace with your worker URL
curl "https://no-ping-worker.your-subdomain.workers.dev/?target=https://api.github.com/users/github"
```

You should see GitHub user data returned!

### Test in Browser

Open your browser and navigate to:
```
https://no-ping-worker.your-subdomain.workers.dev/
```

You'll see a JSON response with information about the worker and usage instructions.

### Test WebSocket

Using [wscat](https://github.com/websockets/wscat):

```bash
# Install wscat
npm install -g wscat

# Connect to echo server through worker
wscat -c "wss://no-ping-worker.your-subdomain.workers.dev/?target=wss://echo.websocket.org"
```

Type a message and press Enter - you should see it echoed back!

## Common Use Cases

### Use Case 1: Proxy API Requests

```javascript
// In your web application
const proxyUrl = 'https://no-ping-worker.your-subdomain.workers.dev';
const targetUrl = 'https://api.example.com/data';

fetch(`${proxyUrl}/?target=${encodeURIComponent(targetUrl)}`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### Use Case 2: Bypass CORS

```html
<!-- In your HTML file -->
<script>
  fetch('https://no-ping-worker.your-subdomain.workers.dev/?target=https://api.example.com/data')
    .then(response => response.json())
    .then(data => console.log('Data:', data))
    .catch(error => console.error('Error:', error));
</script>
```

### Use Case 3: WebSocket Proxy

```javascript
const ws = new WebSocket(
  'wss://no-ping-worker.your-subdomain.workers.dev/?target=wss://your-websocket-server.com'
);

ws.onopen = () => {
  console.log('Connected!');
  ws.send('Hello!');
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};
```

## Development Mode

Want to test locally before deploying?

```bash
wrangler dev
```

Your worker will be available at `http://localhost:8787`

Test it:
```bash
curl "http://localhost:8787/?target=https://httpbin.org/get"
```

## Configuration Options

### Enable Authentication (Recommended for Production)

Edit `_worker.js`:

```javascript
const CONFIG = {
  // ... other config
  
  // Add authentication
  AUTH_ENABLED: true,
  AUTH_TOKEN: 'your-secret-token-here'
};

// Add at the start of fetch handler
if (CONFIG.AUTH_ENABLED) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${CONFIG.AUTH_TOKEN}`) {
    return new Response('Unauthorized', { status: 401 });
  }
}
```

Then use it:
```bash
curl -H "Authorization: Bearer your-secret-token-here" \
  "https://no-ping-worker.your-subdomain.workers.dev/?target=https://api.example.com"
```

### Customize CORS Settings

Edit `_worker.js`:

```javascript
const CONFIG = {
  CORS: {
    enabled: true,
    allowOrigin: 'https://yourapp.com', // Instead of '*'
    allowMethods: 'GET, POST',
    allowHeaders: 'Content-Type, Authorization',
    maxAge: 86400
  }
};
```

### Set Default Target

If you want the worker to proxy to a specific domain by default:

```javascript
const CONFIG = {
  DEFAULT_TARGET: 'https://api.example.com'
};
```

Now you can access:
```
https://no-ping-worker.your-subdomain.workers.dev/endpoint
```

Instead of:
```
https://no-ping-worker.your-subdomain.workers.dev/?target=https://api.example.com/endpoint
```

## Next Steps

### Secure Your Worker

1. **Add Authentication**: Prevent unauthorized use
2. **Domain Whitelist**: Only allow specific domains
3. **Rate Limiting**: Prevent abuse
4. **Monitor Usage**: Track requests and errors

See [EXAMPLES.md](EXAMPLES.md) for detailed security examples.

### Custom Domain

Want to use your own domain? Add to `wrangler.toml`:

```toml
routes = [
  { pattern = "proxy.yourdomain.com/*", zone_name = "yourdomain.com" }
]
```

Then deploy:
```bash
wrangler deploy --env production
```

### Monitor Your Worker

View logs in real-time:
```bash
wrangler tail
```

View logs in dashboard:
- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Navigate to Workers & Pages
- Click on your worker
- View the "Logs" tab

## Troubleshooting

### Error: "Account ID is required"

Solution: Add your account ID to `wrangler.toml`:
```toml
account_id = "your-account-id-here"
```

### Error: "Worker exceeds size limit"

Solution: The worker is optimized to be small. If you modified it, ensure you're not adding large dependencies.

### CORS Errors

Solution: Make sure CORS is enabled in CONFIG:
```javascript
CORS: {
  enabled: true,
  allowOrigin: '*'
}
```

### WebSocket Connection Fails

Solution: Ensure you're using the correct protocol (`wss://` for secure connections) and that the target URL is correct.

## Getting Help

- **Documentation**: Check [README.md](README.md) and [EXAMPLES.md](EXAMPLES.md)
- **Issues**: Search or create an [issue on GitHub](https://github.com/1744132917/The-most-advanced-no-ping-cloudflare-worker/issues)
- **Cloudflare Docs**: [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)

## What's Next?

Now that you have the worker running, you can:

1. **Integrate it** into your applications
2. **Customize it** for your specific needs
3. **Secure it** with authentication and rate limiting
4. **Monitor it** to ensure it's working correctly
5. **Scale it** by deploying to multiple environments

Happy proxying! 🚀
