# Advanced Usage Examples

This document provides advanced usage examples for the No-Ping Cloudflare Worker.

## Table of Contents

1. [HTTP/HTTPS Examples](#httphttps-examples)
2. [WebSocket Examples](#websocket-examples)
3. [Integration Examples](#integration-examples)
4. [Security Examples](#security-examples)

## HTTP/HTTPS Examples

### Example 1: Simple GET Request

```bash
curl "https://your-worker.workers.dev/?target=https://api.github.com/users/github"
```

### Example 2: POST Request with JSON Body

```bash
curl -X POST \
  "https://your-worker.workers.dev/?target=https://httpbin.org/post" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","age":30}'
```

### Example 3: Request with Authentication Headers

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://your-worker.workers.dev/?target=https://api.example.com/protected"
```

### Example 4: Download a File

```bash
curl -o output.pdf \
  "https://your-worker.workers.dev/?target=https://example.com/document.pdf"
```

### Example 5: Upload a File

```bash
curl -X POST \
  -F "file=@/path/to/local/file.jpg" \
  "https://your-worker.workers.dev/?target=https://upload.example.com/api/upload"
```

## WebSocket Examples

### Example 1: Basic WebSocket Connection (JavaScript)

```javascript
const ws = new WebSocket('wss://your-worker.workers.dev/?target=wss://echo.websocket.org');

ws.onopen = () => {
  console.log('Connected');
  ws.send('Hello Server!');
};

ws.onmessage = (event) => {
  console.log('Received:', event.data);
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('Connection closed');
};
```

### Example 2: WebSocket with Reconnection Logic

```javascript
class WebSocketClient {
  constructor(workerUrl, targetUrl) {
    this.workerUrl = workerUrl;
    this.targetUrl = targetUrl;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  connect() {
    const url = `${this.workerUrl}/?target=${encodeURIComponent(this.targetUrl)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to WebSocket');
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      console.log('Received:', event.data);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onclose = () => {
      console.log('Connection closed');
      this.reconnect();
    };
  }

  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      console.error('WebSocket is not connected');
    }
  }

  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Usage
const client = new WebSocketClient(
  'wss://your-worker.workers.dev',
  'wss://your-target-server.com/socket'
);
client.connect();
```

### Example 3: WebSocket Chat Client

```javascript
class ChatClient {
  constructor(workerUrl, targetUrl, username) {
    this.workerUrl = workerUrl;
    this.targetUrl = targetUrl;
    this.username = username;
    this.ws = null;
    this.messageHandlers = [];
  }

  connect() {
    const url = `${this.workerUrl}/?target=${encodeURIComponent(this.targetUrl)}`;
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Connected to chat');
      this.send({ type: 'join', username: this.username });
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.messageHandlers.forEach(handler => handler(message));
    };

    this.ws.onclose = () => {
      console.log('Disconnected from chat');
    };
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  sendMessage(text) {
    this.send({
      type: 'message',
      username: this.username,
      text: text,
      timestamp: new Date().toISOString()
    });
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  disconnect() {
    if (this.ws) {
      this.send({ type: 'leave', username: this.username });
      this.ws.close();
    }
  }
}

// Usage
const chat = new ChatClient(
  'wss://your-worker.workers.dev',
  'wss://chat-server.example.com',
  'User123'
);

chat.onMessage((message) => {
  console.log(`${message.username}: ${message.text}`);
});

chat.connect();
chat.sendMessage('Hello everyone!');
```

### Example 4: WebSocket in Node.js

```javascript
const WebSocket = require('ws');

const workerUrl = 'wss://your-worker.workers.dev';
const targetUrl = 'wss://echo.websocket.org';
const url = `${workerUrl}/?target=${encodeURIComponent(targetUrl)}`;

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('Connected');
  ws.send('Hello from Node.js!');
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
});

ws.on('error', (error) => {
  console.error('Error:', error);
});

ws.on('close', () => {
  console.log('Connection closed');
});
```

### Example 5: WebSocket in Python

```python
import asyncio
import websockets
import json

async def chat_client():
    worker_url = "wss://your-worker.workers.dev"
    target_url = "wss://chat-server.example.com"
    url = f"{worker_url}/?target={target_url}"
    
    async with websockets.connect(url) as websocket:
        # Send join message
        await websocket.send(json.dumps({
            "type": "join",
            "username": "PythonUser"
        }))
        
        # Send a message
        await websocket.send(json.dumps({
            "type": "message",
            "text": "Hello from Python!"
        }))
        
        # Receive messages
        while True:
            try:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received: {data}")
            except websockets.exceptions.ConnectionClosed:
                print("Connection closed")
                break

# Run the client
asyncio.run(chat_client())
```

## Integration Examples

### Example 1: React Application

```jsx
import React, { useState, useEffect } from 'react';

function ProxyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const workerUrl = 'https://your-worker.workers.dev';
      const targetUrl = 'https://api.github.com/users/github';
      const response = await fetch(`${workerUrl}/?target=${encodeURIComponent(targetUrl)}`);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.bio}</p>
    </div>
  );
}

export default ProxyComponent;
```

### Example 2: Vue.js Application

```vue
<template>
  <div>
    <button @click="fetchData" :disabled="loading">
      Fetch Data
    </button>
    <div v-if="loading">Loading...</div>
    <div v-if="error">Error: {{ error }}</div>
    <div v-if="data">
      <h2>{{ data.name }}</h2>
      <p>{{ data.bio }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      data: null,
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchData() {
      this.loading = true;
      this.error = null;
      
      try {
        const workerUrl = 'https://your-worker.workers.dev';
        const targetUrl = 'https://api.github.com/users/github';
        const response = await fetch(`${workerUrl}/?target=${encodeURIComponent(targetUrl)}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        this.data = await response.json();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchData();
  }
}
</script>
```

### Example 3: Express.js Backend Integration

```javascript
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const WORKER_URL = 'https://your-worker.workers.dev';

app.get('/api/proxy', async (req, res) => {
  const targetUrl = req.query.target;
  
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target parameter' });
  }

  try {
    const response = await fetch(`${WORKER_URL}/?target=${encodeURIComponent(targetUrl)}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Example 4: Chrome Extension Integration

```javascript
// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'proxy') {
    const workerUrl = 'https://your-worker.workers.dev';
    const targetUrl = request.url;
    
    fetch(`${workerUrl}/?target=${encodeURIComponent(targetUrl)}`)
      .then(response => response.json())
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    
    return true; // Keep the message channel open for async response
  }
});

// popup.js
document.getElementById('fetchBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({
    action: 'proxy',
    url: 'https://api.example.com/data'
  }, (response) => {
    if (response.success) {
      console.log('Data:', response.data);
    } else {
      console.error('Error:', response.error);
    }
  });
});
```

## Security Examples

### Example 1: Add Authentication

Modify `_worker.js` to add authentication:

```javascript
// Add authentication check at the beginning of fetch handler
const authToken = request.headers.get('Authorization');
const expectedToken = 'Bearer your-secret-token';

if (authToken !== expectedToken) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Example 2: Domain Whitelist

```javascript
// Add domain whitelist check
const ALLOWED_DOMAINS = [
  'api.github.com',
  'httpbin.org',
  'echo.websocket.org'
];

function isAllowedDomain(targetUrl) {
  try {
    const url = new URL(targetUrl);
    return ALLOWED_DOMAINS.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Use in handler
if (!isAllowedDomain(targetUrl)) {
  return new Response('Domain not allowed', { status: 403 });
}
```

### Example 3: Rate Limiting with KV

```javascript
// In wrangler.toml, add:
// [[kv_namespaces]]
// binding = "RATE_LIMIT"
// id = "your-kv-namespace-id"

async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP');
  const key = `ratelimit:${ip}`;
  
  const current = await env.RATE_LIMIT.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= 100) { // 100 requests per minute
    return false;
  }
  
  await env.RATE_LIMIT.put(key, (count + 1).toString(), {
    expirationTtl: 60 // 1 minute
  });
  
  return true;
}

// Use in handler
if (!await checkRateLimit(request, env)) {
  return new Response('Rate limit exceeded', { status: 429 });
}
```

### Example 4: Request Logging

```javascript
// Add logging function
function logRequest(request, url, response) {
  const logData = {
    timestamp: new Date().toISOString(),
    method: request.method,
    target: url.searchParams.get('target'),
    ip: request.headers.get('CF-Connecting-IP'),
    userAgent: request.headers.get('User-Agent'),
    status: response.status
  };
  
  console.log(JSON.stringify(logData));
}

// Use after handling request
logRequest(request, url, response);
```

### Example 5: Content Filtering

```javascript
// Add content type filtering
const BLOCKED_CONTENT_TYPES = [
  'application/x-executable',
  'application/x-msdownload'
];

async function checkContentType(response) {
  const contentType = response.headers.get('Content-Type');
  
  if (contentType && BLOCKED_CONTENT_TYPES.some(type => contentType.includes(type))) {
    return new Response('Content type not allowed', { status: 403 });
  }
  
  return response;
}

// Use after fetching from target
const response = await fetch(modifiedRequest);
return await checkContentType(response);
```

## Performance Examples

### Example 1: Request Caching

```javascript
// Add caching logic
const cache = caches.default;
const cacheKey = new Request(targetUrl, request);

// Try to get from cache
let response = await cache.match(cacheKey);

if (!response) {
  // Fetch from target
  response = await fetch(modifiedRequest);
  
  // Cache successful responses
  if (response.status === 200) {
    const responseToCache = response.clone();
    await cache.put(cacheKey, responseToCache);
  }
}

return response;
```

### Example 2: Response Compression

```javascript
// Add compression support
const modifiedResponse = new Response(response.body, {
  status: response.status,
  statusText: response.statusText,
  headers: new Headers(response.headers)
});

// Add compression header
if (request.headers.get('Accept-Encoding')?.includes('gzip')) {
  modifiedResponse.headers.set('Content-Encoding', 'gzip');
}
```

## Troubleshooting

### Common Issues and Solutions

1. **CORS Errors**: Make sure CORS is enabled in CONFIG
2. **WebSocket Connection Fails**: Check that target URL uses wss:// protocol
3. **Rate Limiting**: Implement rate limiting if getting 429 errors
4. **Authentication Required**: Add Authorization header to requests
5. **Large File Uploads**: Increase MAX_BODY_SIZE in CONFIG

### Debug Mode

Enable debug mode to see detailed logs:

```javascript
const CONFIG = {
  DEBUG: true,
  // ... rest of config
};
```

Then check logs with:

```bash
wrangler tail
```
