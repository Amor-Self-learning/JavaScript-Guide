# 6.5 CORS

Cross-Origin Resource Sharing (CORS) is a security mechanism that allows controlled access to resources from different origins. This chapter covers how CORS works, common scenarios, troubleshooting, and best practices for handling cross-origin requests.

---

## 6.5.1 Understanding CORS

### Same-Origin Policy

```javascript
// Same-origin policy: browser restricts scripts from making
// requests to different origins

// Origin = protocol + host + port
// https://example.com:443

// Same origin:
// https://example.com/page1 → https://example.com/page2  ✅

// Different origins:
// https://example.com → https://api.example.com  ❌ (different host)
// https://example.com → http://example.com       ❌ (different protocol)
// https://example.com → https://example.com:8080 ❌ (different port)
```

### What Is CORS?

```javascript
// CORS allows servers to specify who can access their resources
// Via HTTP headers:
// - Access-Control-Allow-Origin
// - Access-Control-Allow-Methods
// - Access-Control-Allow-Headers
// - Access-Control-Allow-Credentials
// - Access-Control-Max-Age
// - Access-Control-Expose-Headers
```

---

## 6.5.2 Simple vs Preflight Requests

### Simple Requests

```javascript
// Simple requests don't trigger preflight
// Requirements:
// - Method: GET, HEAD, or POST
// - Headers: Only simple headers (Accept, Accept-Language,
//   Content-Language, Content-Type with limited values)
// - Content-Type: application/x-www-form-urlencoded,
//   multipart/form-data, or text/plain

// This is a simple request
fetch('https://api.example.com/data', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
});

// This is also simple
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'name=John&email=john@example.com'
});
```

### Preflight Requests

```javascript
// Non-simple requests trigger preflight OPTIONS request
// Browser automatically sends OPTIONS before actual request

// This triggers preflight (custom header)
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',  // Not simple!
    'Authorization': 'Bearer token'       // Custom header
  },
  body: JSON.stringify({ name: 'John' })
});

// This triggers preflight (non-simple method)
fetch('https://api.example.com/data', {
  method: 'PUT'  // Not GET, HEAD, or POST
});

// Preflight flow:
// 1. Browser sends OPTIONS with:
//    - Origin: https://your-site.com
//    - Access-Control-Request-Method: POST
//    - Access-Control-Request-Headers: content-type, authorization
//
// 2. Server responds with:
//    - Access-Control-Allow-Origin: https://your-site.com
//    - Access-Control-Allow-Methods: POST, PUT, DELETE
//    - Access-Control-Allow-Headers: content-type, authorization
//    - Access-Control-Max-Age: 86400
//
// 3. If preflight succeeds, browser sends actual request
```

---

## 6.5.3 CORS Headers

### Server Response Headers

```javascript
// Access-Control-Allow-Origin
// Specifies allowed origin(s)
// Access-Control-Allow-Origin: https://example.com
// Access-Control-Allow-Origin: *  (any origin, no credentials)

// Access-Control-Allow-Methods
// Allowed HTTP methods for preflight
// Access-Control-Allow-Methods: GET, POST, PUT, DELETE

// Access-Control-Allow-Headers
// Allowed request headers
// Access-Control-Allow-Headers: Content-Type, Authorization, X-Custom-Header

// Access-Control-Allow-Credentials
// Allow credentials (cookies, HTTP auth)
// Access-Control-Allow-Credentials: true

// Access-Control-Max-Age
// Cache preflight response (seconds)
// Access-Control-Max-Age: 86400  (24 hours)

// Access-Control-Expose-Headers
// Headers readable by JavaScript
// Access-Control-Expose-Headers: X-Request-Id, X-RateLimit-Remaining
```

### Reading Exposed Headers

```javascript
const response = await fetch('https://api.example.com/data');

// These headers are always readable:
// - Cache-Control
// - Content-Language
// - Content-Type
// - Expires
// - Last-Modified
// - Pragma

// Custom headers need to be exposed:
const requestId = response.headers.get('X-Request-Id');
// Only works if server sends:
// Access-Control-Expose-Headers: X-Request-Id
```

---

## 6.5.4 Credentials and CORS

### Sending Credentials Cross-Origin

```javascript
// Include cookies/auth in cross-origin request
const response = await fetch('https://api.example.com/data', {
  credentials: 'include'
});

// Server MUST respond with:
// Access-Control-Allow-Credentials: true
// Access-Control-Allow-Origin: https://your-site.com (NOT *)

// ❌ Cannot use * with credentials
// Access-Control-Allow-Origin: *
// Access-Control-Allow-Credentials: true
// This combination is NOT allowed!
```

### Credential Modes

```javascript
// omit - never send credentials
fetch(url, { credentials: 'omit' });

// same-origin - send only to same origin (default)
fetch(url, { credentials: 'same-origin' });

// include - always send, even cross-origin
fetch(url, { credentials: 'include' });
```

---

## 6.5.5 Common CORS Errors

### No Access-Control-Allow-Origin

```javascript
// Error: "No 'Access-Control-Allow-Origin' header is present"

// Cause: Server doesn't include CORS headers

// Solution: Configure server to send:
// Access-Control-Allow-Origin: https://your-site.com
// Or for development:
// Access-Control-Allow-Origin: *
```

### Origin Not Allowed

```javascript
// Error: "Origin 'https://your-site.com' is not allowed"

// Cause: Server explicitly rejects your origin

// Solution: Add your origin to server's allowed list
```

### Preflight Failed

```javascript
// Error: "Response to preflight request doesn't pass"

// Cause: OPTIONS request failed or returned wrong headers

// Check:
// 1. Server handles OPTIONS method
// 2. Returns correct Access-Control-* headers
// 3. Returns 2xx status code
```

### Credentials with Wildcard

```javascript
// Error: "Cannot use wildcard with credentials"

// Cause: Using credentials: 'include' with
// Access-Control-Allow-Origin: *

// Solution: Server must specify exact origin:
// Access-Control-Allow-Origin: https://your-site.com
```

---

## 6.5.6 CORS Workarounds

### Proxy Server

```javascript
// Instead of direct cross-origin request:
// fetch('https://api.external.com/data')

// Use your own proxy:
fetch('/api/proxy?url=https://api.external.com/data');

// Your server makes the request (no CORS!)
// Express example:
app.get('/api/proxy', async (req, res) => {
  const response = await fetch(req.query.url);
  const data = await response.json();
  res.json(data);
});
```

### JSONP (Legacy)

```javascript
// Only for GET requests
// Server wraps response in callback

function jsonp(url, callbackName) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    
    script.src = `${url}?callback=${callbackName}`;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

// Server returns: callback123({data: 'value'})
const data = await jsonp('https://api.example.com/data', 'callback123');
```

### no-cors Mode

```javascript
// For requests where you don't need to read response
fetch('https://api.example.com/track', {
  method: 'POST',
  mode: 'no-cors',  // Won't fail, but response is opaque
  body: JSON.stringify({ event: 'pageview' })
});

// Response is opaque:
// - status is 0
// - Can't read headers or body
// - Can cache in Service Worker
```

---

## 6.5.7 Server-Side CORS Configuration

### Node.js / Express

```javascript
const cors = require('cors');

// Allow all origins
app.use(cors());

// Or configure:
app.use(cors({
  origin: 'https://your-site.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
}));

// Or dynamically:
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://your-site.com',
      'https://app.your-site.com'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### Manual Headers

```javascript
// Without cors package
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-site.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});
```

---

## 6.5.8 Debugging CORS

### Browser DevTools

```javascript
// Check Network tab:
// 1. Look for OPTIONS request (preflight)
// 2. Check request headers (Origin, Access-Control-Request-*)
// 3. Check response headers (Access-Control-Allow-*)

// Console shows CORS errors with details
```

### Common Debugging Steps

```javascript
// 1. Is it actually a CORS error?
// - Check if request reaches server (server logs)
// - Check for other errors (network, DNS)

// 2. Is preflight needed?
// - Check method and headers
// - Simplify request to avoid preflight

// 3. Server returning correct headers?
// - Check OPTIONS response
// - Verify headers are present

// 4. Using credentials?
// - Wildcard origin not allowed
// - Check cookie SameSite attribute
```

### Testing Tool

```javascript
// Quick test from console
async function testCORS(url) {
  try {
    const response = await fetch(url);
    console.log('Status:', response.status);
    console.log('CORS headers:');
    for (const [name, value] of response.headers) {
      if (name.startsWith('access-control')) {
        console.log(`  ${name}: ${value}`);
      }
    }
  } catch (error) {
    console.error('CORS error:', error);
  }
}

testCORS('https://api.example.com/test');
```

---

## 6.5.9 Security Considerations

### Don't Use Wildcard in Production

```javascript
// ❌ Avoid in production
Access-Control-Allow-Origin: *

// ✅ Specify allowed origins
Access-Control-Allow-Origin: https://trusted-site.com

// Or dynamically validate origin
function validateOrigin(origin) {
  const allowed = ['https://app.example.com', 'https://admin.example.com'];
  return allowed.includes(origin);
}
```

### Validate Origin Server-Side

```javascript
// ❌ Don't blindly reflect origin
res.header('Access-Control-Allow-Origin', req.headers.origin);

// ✅ Validate against whitelist
const allowedOrigins = ['https://trusted-site.com'];
const origin = req.headers.origin;

if (allowedOrigins.includes(origin)) {
  res.header('Access-Control-Allow-Origin', origin);
}
```

### Be Careful with Credentials

```javascript
// Credentials expose user sessions cross-origin
// Only enable for trusted origins

// ❌ Too permissive
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true  // Invalid anyway

// ✅ Strict
Access-Control-Allow-Origin: https://trusted-app.com
Access-Control-Allow-Credentials: true
```

---

## 6.5.10 Summary

### Request Types

| Type | When Triggered |
|------|---------------|
| Simple | GET/HEAD/POST with simple headers |
| Preflight | Custom headers, methods like PUT/DELETE |

### Key Headers

| Header | Description |
|--------|-------------|
| `Access-Control-Allow-Origin` | Allowed origin(s) |
| `Access-Control-Allow-Methods` | Allowed methods |
| `Access-Control-Allow-Headers` | Allowed headers |
| `Access-Control-Allow-Credentials` | Allow cookies |
| `Access-Control-Max-Age` | Preflight cache time |
| `Access-Control-Expose-Headers` | Readable headers |

### Credentials Mode

| Mode | Behavior |
|------|----------|
| `omit` | Never send credentials |
| `same-origin` | Same-origin only (default) |
| `include` | Always send |

### Best Practices

1. **Don't use wildcard** in production
2. **Validate origins** server-side
3. **Limit exposed headers** to what's needed
4. **Cache preflight** with Max-Age
5. **Use proxy** for third-party APIs without CORS
6. **Enable credentials** only for trusted origins

---

**End of Chapter 6.5: CORS**

This completes the Fetch and AJAX group. Next section: **Group 07 — Timers and Scheduling** — covers setTimeout, setInterval, requestAnimationFrame, and scheduling APIs.
