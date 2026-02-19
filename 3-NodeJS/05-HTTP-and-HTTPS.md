# Module 5: HTTP and HTTPS

Node.js provides built-in modules for creating HTTP servers and making HTTP requests. The `http` and `https` modules form the foundation of all web servers and API clients in Node.js.

---

## 5.1 Module Import

```javascript
// CommonJS
const http = require('http');
const https = require('https');

// ES Modules
import http from 'http';
import https from 'https';
import { createServer, request, get } from 'http';
```

---

## 5.2 Creating HTTP Servers

### Basic Server

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});
```

### Request Object (IncomingMessage)

```javascript
http.createServer((req, res) => {
  // Request properties
  console.log(req.method);       // 'GET', 'POST', etc.
  console.log(req.url);          // '/path?query=value'
  console.log(req.headers);      // { host: '...', 'user-agent': '...' }
  console.log(req.httpVersion);  // '1.1'
  
  // Get specific header (lowercase)
  const contentType = req.headers['content-type'];
  const userAgent = req.headers['user-agent'];
  
  // Parse URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(url.pathname);     // '/path'
  console.log(url.searchParams.get('query'));  // 'value'
  
  res.end('Request received');
}).listen(3000);
```

### Response Object (ServerResponse)

```javascript
http.createServer((req, res) => {
  // Set status code
  res.statusCode = 200;
  
  // Set headers
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Custom-Header', 'value');
  
  // Or use writeHead for status + headers together
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache'
  });
  
  // Write body (can call multiple times)
  res.write('{"message":');
  res.write('"Hello"}');
  
  // End response (required!)
  res.end();
  
  // Or write and end in one call
  // res.end('{"message":"Hello"}');
}).listen(3000);
```

### Handling POST Data

```javascript
http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    
    // Collect data chunks
    req.on('data', chunk => {
      body += chunk.toString();
      
      // Limit body size (prevent DoS)
      if (body.length > 1e6) {
        res.writeHead(413);
        res.end('Payload Too Large');
        req.destroy();
      }
    });
    
    // Process complete body
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ received: data }));
      } catch (e) {
        res.writeHead(400);
        res.end('Invalid JSON');
      }
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
}).listen(3000);
```

### Using Promises for Body

```javascript
function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

// Usage
http.createServer(async (req, res) => {
  try {
    const body = await getBody(req);
    const data = JSON.parse(body);
    res.end(JSON.stringify({ success: true, data }));
  } catch (err) {
    res.writeHead(400);
    res.end('Bad Request');
  }
}).listen(3000);
```

---

## 5.3 Routing

### Basic Router

```javascript
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const method = req.method;
  
  // Route handling
  if (method === 'GET' && path === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Home</h1>');
  }
  else if (method === 'GET' && path === '/api/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify([{ id: 1, name: 'Alice' }]));
  }
  else if (method === 'POST' && path === '/api/users') {
    // Handle POST
    getBody(req).then(body => {
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ created: JSON.parse(body) }));
    });
  }
  else if (path.startsWith('/users/')) {
    // Dynamic route
    const userId = path.split('/')[2];
    res.end(`User ID: ${userId}`);
  }
  else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000);
```

### Pattern-Based Router

```javascript
const routes = [];

function addRoute(method, pattern, handler) {
  routes.push({
    method,
    pattern: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
    handler
  });
}

function matchRoute(method, path) {
  for (const route of routes) {
    if (route.method !== method) continue;
    const match = path.match(route.pattern);
    if (match) {
      return { handler: route.handler, params: match.groups || {} };
    }
  }
  return null;
}

// Define routes
addRoute('GET', '/', (req, res) => res.end('Home'));
addRoute('GET', '/users/:id', (req, res, params) => {
  res.end(`User: ${params.id}`);
});
addRoute('GET', '/posts/:postId/comments/:commentId', (req, res, params) => {
  res.end(`Post ${params.postId}, Comment ${params.commentId}`);
});

// Server
http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const match = matchRoute(req.method, url.pathname);
  
  if (match) {
    match.handler(req, res, match.params);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
}).listen(3000);
```

---

## 5.4 Serving Static Files

```javascript
const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function serveStatic(staticDir) {
  return (req, res) => {
    // Only handle GET
    if (req.method !== 'GET') {
      res.writeHead(405);
      return res.end('Method Not Allowed');
    }
    
    // Parse and sanitize path
    let filePath = new URL(req.url, 'http://localhost').pathname;
    if (filePath === '/') filePath = '/index.html';
    
    // Prevent path traversal
    const fullPath = path.join(staticDir, filePath);
    if (!fullPath.startsWith(path.resolve(staticDir))) {
      res.writeHead(403);
      return res.end('Forbidden');
    }
    
    // Get MIME type
    const ext = path.extname(fullPath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Stream file
    const stream = fs.createReadStream(fullPath);
    
    stream.on('open', () => {
      res.writeHead(200, { 'Content-Type': mimeType });
      stream.pipe(res);
    });
    
    stream.on('error', err => {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found');
      } else {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
  };
}

http.createServer(serveStatic('./public')).listen(3000);
```

---

## 5.5 Making HTTP Requests

### http.request()

```javascript
const http = require('http');

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port: 80,
  path: '/posts/1',
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Body:', JSON.parse(data));
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
});

req.end();
```

### http.get() (Convenience Method)

```javascript
http.get('http://jsonplaceholder.typicode.com/posts/1', res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(JSON.parse(data)));
}).on('error', err => {
  console.error('Error:', err.message);
});
```

### POST Request

```javascript
const postData = JSON.stringify({
  title: 'foo',
  body: 'bar',
  userId: 1
});

const options = {
  hostname: 'jsonplaceholder.typicode.com',
  port: 80,
  path: '/posts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
  });
});

req.on('error', err => console.error(err));

// Write body and end
req.write(postData);
req.end();
```

### Promise Wrapper

```javascript
function httpRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, res => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body) req.write(body);
    req.end();
  });
}

// Usage
async function fetchPost() {
  try {
    const res = await httpRequest({
      hostname: 'jsonplaceholder.typicode.com',
      path: '/posts/1',
      method: 'GET'
    });
    console.log(JSON.parse(res.body));
  } catch (err) {
    console.error(err);
  }
}
```

---

## 5.6 HTTPS Server

### Creating HTTPS Server

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('private-key.pem'),
  cert: fs.readFileSync('certificate.pem'),
  // Optional: CA certificate for client verification
  // ca: fs.readFileSync('ca-cert.pem'),
  // requestCert: true,
  // rejectUnauthorized: true
};

const server = https.createServer(options, (req, res) => {
  res.writeHead(200);
  res.end('Secure Hello!\n');
});

server.listen(443, () => {
  console.log('HTTPS server running on port 443');
});
```

### Self-Signed Certificate (Development)

```bash
# Generate self-signed certificate
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Answer prompts (use localhost for Common Name)
```

### HTTP to HTTPS Redirect

```javascript
const http = require('http');
const https = require('https');
const fs = require('fs');

// HTTPS Server
const httpsServer = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
}, (req, res) => {
  res.end('Secure Content');
});

// HTTP Redirect Server
const httpServer = http.createServer((req, res) => {
  const host = req.headers.host.replace(/:\d+$/, '');
  res.writeHead(301, {
    Location: `https://${host}${req.url}`
  });
  res.end();
});

httpsServer.listen(443);
httpServer.listen(80);
```

---

## 5.7 Server Events

```javascript
const server = http.createServer();

// Request handler (alternative to passing to createServer)
server.on('request', (req, res) => {
  res.end('Hello');
});

// Connection established
server.on('connection', socket => {
  console.log('New connection from', socket.remoteAddress);
});

// Server is listening
server.on('listening', () => {
  const addr = server.address();
  console.log(`Server listening on ${addr.address}:${addr.port}`);
});

// Server error
server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
  } else {
    console.error('Server error:', err);
  }
});

// Server closed
server.on('close', () => {
  console.log('Server closed');
});

// Client error (malformed request, etc.)
server.on('clientError', (err, socket) => {
  if (err.code === 'ECONNRESET' || !socket.writable) return;
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(3000);
```

---

## 5.8 Keep-Alive and Connection Pooling

### Server Keep-Alive

```javascript
const server = http.createServer((req, res) => {
  res.end('Hello');
});

// Configure timeouts
server.keepAliveTimeout = 5000;  // How long to keep idle connection open
server.headersTimeout = 60000;   // Max time for client to send headers
server.timeout = 120000;         // Max time for entire request

server.listen(3000);
```

### Client Keep-Alive (Agent)

```javascript
// Create custom agent with keep-alive
const agent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 25,
  maxFreeSockets: 10
});

// Use agent for requests
const options = {
  hostname: 'api.example.com',
  path: '/data',
  agent: agent  // Reuses connections
};

http.get(options, res => {
  // Handle response
});

// Destroy agent when done
// agent.destroy();
```

---

## 5.9 Request Timeouts

```javascript
const req = http.request(options, res => {
  // Handle response
});

// Set timeout
req.setTimeout(5000, () => {
  req.destroy();
  console.error('Request timed out');
});

// Or using AbortController (Node 15+)
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);

const req = http.request(url, { signal: controller.signal }, res => {
  clearTimeout(timeout);
  // Handle response
});

req.on('error', err => {
  if (err.name === 'AbortError') {
    console.error('Request aborted');
  }
});
```

---

## 5.10 Streaming Responses

### Chunked Transfer

```javascript
http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });
  
  // Stream data over time
  let count = 0;
  const interval = setInterval(() => {
    res.write(`Chunk ${++count}\n`);
    if (count >= 5) {
      clearInterval(interval);
      res.end('Done!\n');
    }
  }, 1000);
}).listen(3000);
```

### Server-Sent Events

```javascript
http.createServer((req, res) => {
  if (req.url === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // Send events
    let id = 0;
    const interval = setInterval(() => {
      res.write(`id: ${++id}\n`);
      res.write(`event: message\n`);
      res.write(`data: ${JSON.stringify({ time: Date.now() })}\n\n`);
    }, 1000);
    
    // Cleanup on close
    req.on('close', () => {
      clearInterval(interval);
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <script>
        const es = new EventSource('/events');
        es.onmessage = e => console.log(JSON.parse(e.data));
      </script>
    `);
  }
}).listen(3000);
```

---

## 5.11 Common Gotchas

### Missing res.end()

```javascript
// ❌ Request hangs forever
http.createServer((req, res) => {
  res.write('Hello');
  // Forgot res.end()!
});

// ✅ Always end response
http.createServer((req, res) => {
  res.write('Hello');
  res.end();
});
```

### Headers After Body

```javascript
// ❌ Throws error
http.createServer((req, res) => {
  res.write('Hello');
  res.setHeader('X-Custom', 'value');  // Error!
  res.end();
});

// ✅ Set headers before body
http.createServer((req, res) => {
  res.setHeader('X-Custom', 'value');
  res.write('Hello');
  res.end();
});
```

### Handling Both Success and Error

```javascript
// ❌ Missing error handler
http.get(url, res => {
  // Only handles success
});

// ✅ Always handle errors
http.get(url, res => {
  // Handle response
}).on('error', err => {
  console.error('Request failed:', err.message);
});
```

### Not Consuming Response Body

```javascript
// ❌ Connection not freed
http.get(url, res => {
  console.log(res.statusCode);
  // Not reading body - connection stays open
});

// ✅ Consume or discard body
http.get(url, res => {
  console.log(res.statusCode);
  res.resume();  // Discard body, free connection
});
```

---

## 5.12 Summary

| Component | Purpose |
|-----------|---------|
| `http.createServer()` | Create HTTP server |
| `https.createServer()` | Create HTTPS server |
| `http.request()` | Make HTTP request |
| `http.get()` | Shortcut for GET requests |
| `req` (IncomingMessage) | Request data (method, url, headers) |
| `res` (ServerResponse) | Response methods (writeHead, write, end) |
| `http.Agent` | Connection pooling and keep-alive |

| Event | Description |
|-------|-------------|
| `request` | New incoming request |
| `connection` | New TCP connection |
| `close` | Server closed |
| `error` | Server error |
| `clientError` | Client request error |

---

**End of Module 5: HTTP and HTTPS**

Next: **Module 6 — Events** (EventEmitter, custom events, patterns)
