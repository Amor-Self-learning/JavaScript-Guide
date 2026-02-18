# 6.3 Response Handling

The Response object represents the response to a request. This chapter covers parsing different response types, working with response metadata, streaming responses, and handling errors effectively.

---

## 6.3.1 Response Object

### Response Properties

```javascript
const response = await fetch('/api/data');

// Status information
console.log(response.status);       // 200
console.log(response.statusText);   // "OK"
console.log(response.ok);           // true (status 200-299)

// Response type
console.log(response.type);         // "basic", "cors", "opaque", etc.

// URL (after redirects)
console.log(response.url);          // "https://api.example.com/data"

// Was there a redirect?
console.log(response.redirected);   // false

// Headers
console.log(response.headers);      // Headers object
```

### Response Types

```javascript
// basic: same-origin response, all headers accessible
// cors: cross-origin, limited headers visible
// opaque: no-cors cross-origin, no body/headers access
// opaqueredirect: redirect with redirect: 'manual'
// error: network error

const response = await fetch(url);
switch (response.type) {
  case 'basic':
    // Full access to response
    break;
  case 'cors':
    // Can read body, limited headers
    break;
  case 'opaque':
    // Can't read body or headers
    // status is always 0
    break;
}
```

---

## 6.3.2 Parsing Response Bodies

### JSON Response

```javascript
const response = await fetch('/api/users');
const users = await response.json();

// Type-safe parsing (TypeScript)
interface User {
  id: number;
  name: string;
}

const users: User[] = await response.json();
```

### Text Response

```javascript
const response = await fetch('/page.html');
const html = await response.text();
document.body.innerHTML = html;
```

### Blob Response

```javascript
const response = await fetch('/image.png');
const blob = await response.blob();

// Create URL for image
const url = URL.createObjectURL(blob);
img.src = url;

// Download file
const a = document.createElement('a');
a.href = url;
a.download = 'image.png';
a.click();

// Clean up
URL.revokeObjectURL(url);
```

### ArrayBuffer Response

```javascript
const response = await fetch('/binary-data');
const buffer = await response.arrayBuffer();

// Work with binary data
const view = new DataView(buffer);
const firstInt = view.getInt32(0);

// Or typed array
const bytes = new Uint8Array(buffer);
```

### FormData Response

```javascript
const response = await fetch('/api/form-data');
const formData = await response.formData();

// Iterate form data
for (const [key, value] of formData) {
  console.log(key, value);
}
```

---

## 6.3.3 Streaming Responses

### Reading Response Stream

```javascript
const response = await fetch('/api/large-data');

// Get readable stream
const reader = response.body.getReader();

// Read chunks
while (true) {
  const { done, value } = await reader.read();
  
  if (done) break;
  
  // value is Uint8Array chunk
  console.log(`Received ${value.length} bytes`);
}
```

### Progress Tracking

```javascript
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  
  // Get total size if available
  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  const reader = response.body.getReader();
  let received = 0;
  const chunks = [];
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    chunks.push(value);
    received += value.length;
    
    if (total) {
      onProgress(received / total * 100);
    }
  }
  
  // Combine chunks
  const body = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    body.set(chunk, position);
    position += chunk.length;
  }
  
  return body;
}

// Usage
const data = await fetchWithProgress('/large-file', (percent) => {
  console.log(`Downloaded: ${percent.toFixed(2)}%`);
});
```

### Text Decoder for Streaming

```javascript
async function streamText(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let result = '';
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    // Decode chunk, stream: true handles multi-byte chars
    result += decoder.decode(value, { stream: true });
  }
  
  // Final decode
  result += decoder.decode();
  
  return result;
}
```

### Processing Line by Line

```javascript
async function* readLines(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Process complete lines
    const lines = buffer.split('\n');
    buffer = lines.pop();  // Keep incomplete line
    
    for (const line of lines) {
      yield line;
    }
  }
  
  // Yield remaining buffer
  if (buffer) {
    yield buffer;
  }
}

// Usage
for await (const line of readLines('/api/log')) {
  console.log(line);
}
```

---

## 6.3.4 Server-Sent Events Pattern

### Streaming JSON Lines

```javascript
async function streamJSON(url, onData) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  let buffer = '';
  
  while (true) {
    const { done, value } = await reader.read();
    
    if (done) break;
    
    buffer += decoder.decode(value, { stream: true });
    
    // Parse complete JSON objects (newline-delimited)
    const lines = buffer.split('\n');
    buffer = lines.pop();
    
    for (const line of lines) {
      if (line.trim()) {
        try {
          const data = JSON.parse(line);
          onData(data);
        } catch (e) {
          console.error('Invalid JSON:', line);
        }
      }
    }
  }
}

// Usage with streaming API
await streamJSON('/api/stream', (data) => {
  console.log('Received:', data);
});
```

---

## 6.3.5 Response Cloning

### Why Clone Responses

```javascript
// Response body can only be read once
const response = await fetch('/api/data');
const text = await response.text();
const json = await response.json();  // Error! Body already consumed

// Clone to read multiple times
const response = await fetch('/api/data');
const clone = response.clone();

const text = await response.text();  // Original
const json = await clone.json();     // Clone
```

### Caching Cloned Responses

```javascript
// In Service Worker
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then(response => {
      // Clone before caching
      const clone = response.clone();
      
      caches.open('dynamic').then(cache => {
        cache.put(event.request, clone);
      });
      
      return response;
    })
  );
});
```

---

## 6.3.6 Creating Responses

### Constructing Response Objects

```javascript
// Simple text response
const response = new Response('Hello, World!');

// JSON response
const response = new Response(JSON.stringify({ success: true }), {
  headers: {
    'Content-Type': 'application/json'
  }
});

// With status code
const response = new Response('Not Found', {
  status: 404,
  statusText: 'Not Found'
});

// Blob response
const blob = new Blob(['data'], { type: 'application/octet-stream' });
const response = new Response(blob);
```

### Static Response Methods

```javascript
// Error response
const response = Response.error();
// type: "error", status: 0

// Redirect response
const response = Response.redirect('https://example.com', 301);
// status: 301, Location header set

// JSON response (convenience)
const response = Response.json({ success: true });
// Content-Type: application/json, body stringified
```

---

## 6.3.7 Error Handling

### Network vs HTTP Errors

```javascript
async function safeFetch(url) {
  try {
    const response = await fetch(url);
    
    // HTTP errors don't throw - check manually
    if (!response.ok) {
      // 4xx, 5xx errors
      throw new HTTPError(response.status, response.statusText);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof TypeError) {
      // Network error, CORS error, etc.
      console.error('Network error:', error.message);
    } else if (error instanceof HTTPError) {
      // HTTP error
      console.error('HTTP error:', error.status);
    }
    throw error;
  }
}

class HTTPError extends Error {
  constructor(status, statusText) {
    super(`HTTP ${status}: ${statusText}`);
    this.status = status;
  }
}
```

### Handling Different Status Codes

```javascript
async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }
  
  switch (response.status) {
    case 400:
      const errors = await response.json();
      throw new ValidationError(errors);
      
    case 401:
      redirectToLogin();
      throw new AuthError('Not authenticated');
      
    case 403:
      throw new AuthError('Not authorized');
      
    case 404:
      throw new NotFoundError('Resource not found');
      
    case 429:
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError(retryAfter);
      
    case 500:
    case 502:
    case 503:
      throw new ServerError('Server error, please try again');
      
    default:
      throw new Error(`Unexpected error: ${response.status}`);
  }
}
```

### Error Response Bodies

```javascript
async function parseError(response) {
  const contentType = response.headers.get('Content-Type');
  
  if (contentType?.includes('application/json')) {
    const error = await response.json();
    return {
      message: error.message || error.error || 'Unknown error',
      code: error.code,
      details: error.details || error.errors
    };
  }
  
  if (contentType?.includes('text/')) {
    const text = await response.text();
    return { message: text };
  }
  
  return { message: response.statusText };
}

// Usage
if (!response.ok) {
  const error = await parseError(response);
  throw new Error(error.message);
}
```

---

## 6.3.8 Common Patterns

### Response Interceptor

```javascript
async function fetchWithInterceptors(url, options = {}) {
  // Request interceptor
  const modifiedOptions = requestInterceptor(options);
  
  let response = await fetch(url, modifiedOptions);
  
  // Response interceptor
  response = await responseInterceptor(response);
  
  return response;
}

function requestInterceptor(options) {
  return {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${getToken()}`
    }
  };
}

async function responseInterceptor(response) {
  // Refresh token on 401
  if (response.status === 401) {
    const newToken = await refreshToken();
    // Retry request with new token
  }
  
  return response;
}
```

### Response Cache

```javascript
const cache = new Map();

async function cachedFetch(url, options = {}) {
  const cacheKey = `${options.method || 'GET'}:${url}`;
  
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    const age = Date.now() - timestamp;
    
    if (age < 60000) {  // 1 minute cache
      return data;
    }
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}
```

---

## 6.3.9 Summary

### Response Body Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `json()` | Promise<any> | JSON data |
| `text()` | Promise<string> | Plain text, HTML |
| `blob()` | Promise<Blob> | Files, images |
| `arrayBuffer()` | Promise<ArrayBuffer> | Binary data |
| `formData()` | Promise<FormData> | Form submissions |

### Response Properties

| Property | Type | Description |
|----------|------|-------------|
| `status` | number | HTTP status code |
| `statusText` | string | Status message |
| `ok` | boolean | Status 200-299 |
| `headers` | Headers | Response headers |
| `url` | string | Final URL |
| `type` | string | Response type |
| `redirected` | boolean | Was redirected |
| `body` | ReadableStream | Response body stream |

### Best Practices

1. **Always check response.ok** before parsing
2. **Handle different error types** separately
3. **Clone response** if reading body multiple times
4. **Use streaming** for large responses
5. **Parse errors** to get meaningful messages
6. **Consider response type** for cross-origin requests

---

**End of Chapter 6.3: Response Handling**

Next chapter: **6.4 Request Cancellation** — covers AbortController and timeout handling.
