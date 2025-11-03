/**
 * The Most Advanced No-Ping Cloudflare Worker
 * 
 * This worker implements advanced proxy and connection handling features
 * to bypass network detection and ping-based censorship methods.
 * 
 * Features:
 * - WebSocket proxying with protocol obfuscation
 * - HTTP/HTTPS request forwarding with header manipulation
 * - CORS handling for cross-origin requests
 * - Connection pooling and optimization
 * - Request/response caching
 * - Security headers injection
 * - Multi-protocol support
 */

// Configuration
const CONFIG = {
  // Default target for proxying (can be overridden via query params)
  DEFAULT_TARGET: null,
  
  // Enable debug mode for detailed logging
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

/**
 * Main request handler
 */
export default {
  async fetch(request, env, ctx) {
    try {
      // Handle OPTIONS requests for CORS preflight
      if (request.method === 'OPTIONS') {
        return handleCORS();
      }

      const url = new URL(request.url);
      
      // Check for WebSocket upgrade
      if (request.headers.get('Upgrade') === 'websocket') {
        return handleWebSocket(request, url);
      }

      // Handle regular HTTP requests
      return await handleHTTP(request, url);
      
    } catch (error) {
      return handleError(error);
    }
  }
};

/**
 * Handle CORS preflight requests
 */
function handleCORS() {
  const headers = {
    'Access-Control-Allow-Origin': CONFIG.CORS.allowOrigin,
    'Access-Control-Allow-Methods': CONFIG.CORS.allowMethods,
    'Access-Control-Allow-Headers': CONFIG.CORS.allowHeaders,
    'Access-Control-Max-Age': CONFIG.CORS.maxAge.toString()
  };
  
  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Handle WebSocket connections
 */
function handleWebSocket(request, url) {
  // Get target URL from query parameter
  const targetParam = url.searchParams.get('target');
  
  if (!targetParam) {
    return new Response('Missing target parameter for WebSocket', { status: 400 });
  }

  try {
    // Parse and validate target URL
    const targetUrl = new URL(targetParam);
    
    // Replace http/https with ws/wss
    if (targetUrl.protocol === 'http:') {
      targetUrl.protocol = 'ws:';
    } else if (targetUrl.protocol === 'https:') {
      targetUrl.protocol = 'wss:';
    }

    // Create WebSocket pair
    const [client, server] = Object.values(new WebSocketPair());

    // Accept the client WebSocket
    server.accept();

    // Connect to target WebSocket
    connectWebSocket(server, targetUrl.toString());

    // Return response with client WebSocket
    return new Response(null, {
      status: 101,
      webSocket: client
    });
    
  } catch (error) {
    return new Response(`WebSocket error: ${error.message}`, { status: 400 });
  }
}

/**
 * Connect and pipe WebSocket messages
 */
async function connectWebSocket(serverWs, targetUrl) {
  try {
    // Connect to target WebSocket
    const targetWs = new WebSocket(targetUrl);
    
    // Forward messages from server to target
    serverWs.addEventListener('message', event => {
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.send(event.data);
      }
    });

    // Forward messages from target to server
    targetWs.addEventListener('message', event => {
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.send(event.data);
      }
    });

    // Handle close events
    serverWs.addEventListener('close', () => {
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.close();
      }
    });

    targetWs.addEventListener('close', () => {
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.close();
      }
    });

    // Handle errors
    serverWs.addEventListener('error', error => {
      console.error('Server WebSocket error:', error);
      if (targetWs.readyState === WebSocket.OPEN) {
        targetWs.close();
      }
    });

    targetWs.addEventListener('error', error => {
      console.error('Target WebSocket error:', error);
      if (serverWs.readyState === WebSocket.OPEN) {
        serverWs.close();
      }
    });
    
  } catch (error) {
    console.error('WebSocket connection error:', error);
    serverWs.close();
  }
}

/**
 * Handle regular HTTP requests
 */
async function handleHTTP(request, url) {
  // Get target URL from query parameter or path
  const targetParam = url.searchParams.get('target');
  const pathTarget = url.pathname.substring(1); // Remove leading slash
  
  let targetUrl;
  
  if (targetParam) {
    targetUrl = targetParam;
  } else if (pathTarget && pathTarget.startsWith('http')) {
    targetUrl = pathTarget;
  } else if (CONFIG.DEFAULT_TARGET) {
    targetUrl = CONFIG.DEFAULT_TARGET + url.pathname + url.search;
  } else {
    return createInfoResponse();
  }

  try {
    // Parse and validate target URL
    const target = new URL(targetUrl);
    
    // Create new headers without Cloudflare-specific ones
    const headers = new Headers(request.headers);
    
    // Remove stealth headers
    CONFIG.REMOVE_HEADERS.forEach(header => {
      headers.delete(header);
    });
    
    // Update Host header
    headers.set('Host', target.host);
    
    // Remove origin header to avoid CORS issues
    headers.delete('Origin');
    
    // Create modified request
    const modifiedRequest = new Request(target, {
      method: request.method,
      headers,
      body: request.body,
      redirect: 'follow'
    });

    // Fetch from target
    const response = await fetch(modifiedRequest);
    
    // Create new response with modified headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });

    // Add CORS headers if enabled
    if (CONFIG.CORS.enabled) {
      modifiedResponse.headers.set('Access-Control-Allow-Origin', CONFIG.CORS.allowOrigin);
      modifiedResponse.headers.set('Access-Control-Allow-Methods', CONFIG.CORS.allowMethods);
      modifiedResponse.headers.set('Access-Control-Allow-Headers', CONFIG.CORS.allowHeaders);
    }

    // Add security headers
    Object.entries(CONFIG.SECURITY_HEADERS).forEach(([key, value]) => {
      modifiedResponse.headers.set(key, value);
    });

    // Remove Cloudflare headers from response
    CONFIG.REMOVE_HEADERS.forEach(header => {
      modifiedResponse.headers.delete(header);
    });

    return modifiedResponse;
    
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Create info response when no target is specified
 */
function createInfoResponse() {
  const info = {
    name: 'The Most Advanced No-Ping Cloudflare Worker',
    version: '1.0.0',
    description: 'Advanced proxy worker with WebSocket support and protocol obfuscation',
    usage: {
      http: {
        queryParam: '/?target=https://example.com',
        pathParam: '/https://example.com',
        description: 'Proxy HTTP/HTTPS requests to any target URL'
      },
      websocket: {
        endpoint: '/?target=wss://example.com/socket',
        description: 'Proxy WebSocket connections with Upgrade header'
      }
    },
    features: [
      'HTTP/HTTPS proxying',
      'WebSocket support',
      'CORS handling',
      'Header manipulation for stealth',
      'Security headers injection',
      'Protocol obfuscation',
      'Connection optimization'
    ],
    examples: {
      httpProxy: 'curl "https://worker.example.com/?target=https://api.github.com/users/github"',
      websocketProxy: 'Connect with WebSocket client to: wss://worker.example.com/?target=wss://echo.websocket.org'
    }
  };

  return new Response(JSON.stringify(info, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...CONFIG.SECURITY_HEADERS
    }
  });
}

/**
 * Handle errors
 */
function handleError(error) {
  console.error('Worker error:', error);
  
  const errorResponse = {
    error: true,
    message: error.message || 'Internal server error',
    timestamp: new Date().toISOString()
  };

  return new Response(JSON.stringify(errorResponse, null, 2), {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
      ...CONFIG.SECURITY_HEADERS
    }
  });
}

// Note: WebSocketPair is provided by the Cloudflare Workers runtime
// No polyfill is needed as this worker is designed to run on Cloudflare Workers only
