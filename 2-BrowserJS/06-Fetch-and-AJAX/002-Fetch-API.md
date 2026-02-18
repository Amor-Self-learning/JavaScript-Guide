# 6.2 Fetch API

The Fetch API is the modern, promise-based API for making HTTP requests. This chapter covers request configuration, response handling, common patterns, and best practices for using fetch in modern web applications.

---

## 6.2.1 Fetch Overview

### What Is the Fetch API?

```javascript
// Fetch API:
// - Modern replacement for XMLHttpRequest
// - Promise-based, clean async/await syntax
// - Built on Request/Response objects
// - Works with Service Workers

// Basic fetch
const response = await fetch('/api/users');
const data = await response.json();

// Compared to XHR - much simpler
```

### Basic Usage

```javascript
// Simple GET request
fetch('/api/users')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// With async/await
async function getUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 6.2.2 Request Configuration

### GET Requests

```javascript
// Simple GET
const response = await fetch('/api/users');

// GET with query parameters
const params = new URLSearchParams({
  page: 1,
  limit: 10,
  sort: 'name'
});
const response = await fetch(`/api/users?${params}`);

// Explicit GET with options
const response = await fetch('/api/users', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
});
```

### POST Requests

```javascript
// POST with JSON body
const response = await fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com'
  })
});

const newUser = await response.json();
```

### Other HTTP Methods

```javascript
// PUT
await fetch('/api/users/123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedUser)
});

// PATCH
await fetch('/api/users/123', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});

// DELETE
await fetch('/api/users/123', {
  method: 'DELETE'
});
```

### Request Options

```javascript
const response = await fetch('/api/data', {
  // HTTP method
  method: 'POST',
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'value'
  },
  
  // Request body
  body: JSON.stringify(data),
  
  // Request mode
  mode: 'cors',  // cors, no-cors, same-origin
  
  // Credentials handling
  credentials: 'same-origin',  // omit, same-origin, include
  
  // Cache mode
  cache: 'default',  // default, no-store, reload, no-cache, force-cache
  
  // Redirect handling
  redirect: 'follow',  // follow, error, manual
  
  // Referrer policy
  referrerPolicy: 'no-referrer-when-downgrade',
  
  // AbortController signal
  signal: controller.signal
});
```

---

## 6.2.3 Headers

### Working with Headers

```javascript
// Create Headers object
const headers = new Headers();
headers.append('Content-Type', 'application/json');
headers.append('Authorization', 'Bearer token');

// Or use object literal
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer token'
};

// Headers methods
const h = new Headers();
h.set('Content-Type', 'application/json');
h.get('Content-Type');  // 'application/json'
h.has('Authorization');  // false
h.delete('Content-Type');
h.append('Accept', 'text/html');
h.append('Accept', 'application/json');  // Appends, doesn't replace

// Iterate headers
for (const [name, value] of h.entries()) {
  console.log(`${name}: ${value}`);
}
```

### Response Headers

```javascript
const response = await fetch('/api/data');

// Get specific header
const contentType = response.headers.get('Content-Type');

// Iterate all headers
for (const [name, value] of response.headers) {
  console.log(`${name}: ${value}`);
}

// Check if header exists
if (response.headers.has('X-Custom-Header')) {
  console.log(response.headers.get('X-Custom-Header'));
}
```

---

## 6.2.4 Request Object

### Creating Request Objects

```javascript
// Create Request directly
const request = new Request('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'John' })
});

// Use with fetch
const response = await fetch(request);

// Clone and modify
const newRequest = new Request(request, {
  method: 'GET',
  body: null
});
```

### Request Properties

```javascript
const request = new Request('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'John' })
});

console.log(request.url);         // Full URL
console.log(request.method);      // 'POST'
console.log(request.headers);     // Headers object
console.log(request.mode);        // 'cors'
console.log(request.credentials); // 'same-origin'
console.log(request.cache);       // 'default'
console.log(request.redirect);    // 'follow'

// Read body (can only be done once!)
const body = await request.json();
```

---

## 6.2.5 Sending Different Body Types

### JSON

```javascript
await fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ key: 'value' })
});
```

### FormData

```javascript
const formData = new FormData();
formData.append('name', 'John');
formData.append('file', fileInput.files[0]);

// Don't set Content-Type - browser sets it with boundary
await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### URLSearchParams

```javascript
const params = new URLSearchParams();
params.append('name', 'John');
params.append('email', 'john@example.com');

await fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: params
});
```

### Blob / File

```javascript
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain'
  },
  body: blob
});

// File upload
const file = fileInput.files[0];
await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': file.type
  },
  body: file
});
```

### ArrayBuffer / TypedArray

```javascript
const buffer = new ArrayBuffer(8);
const view = new Uint8Array(buffer);
view.set([0, 1, 2, 3, 4, 5, 6, 7]);

await fetch('/api/binary', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/octet-stream'
  },
  body: buffer
});
```

---

## 6.2.6 Credentials and CORS

### Credentials Mode

```javascript
// Don't send cookies (default for cross-origin)
await fetch('https://api.example.com/data', {
  credentials: 'omit'
});

// Send cookies only if same-origin (default for same-origin)
await fetch('/api/data', {
  credentials: 'same-origin'
});

// Always send cookies, even cross-origin
await fetch('https://api.example.com/data', {
  credentials: 'include'
});
```

### CORS Mode

```javascript
// Standard CORS request (default)
await fetch('https://api.example.com/data', {
  mode: 'cors'
});

// No CORS - limited functionality
// Only HEAD, GET, POST; limited headers; opaque response
await fetch('https://api.example.com/image.jpg', {
  mode: 'no-cors'
});

// Same-origin only
await fetch('/api/data', {
  mode: 'same-origin'  // Fails for cross-origin
});
```

---

## 6.2.7 Common Patterns

### Generic Fetch Wrapper

```javascript
async function api(endpoint, options = {}) {
  const baseURL = 'https://api.example.com';
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  // Add auth token
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Stringify body if object
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }
  
  const response = await fetch(`${baseURL}${endpoint}`, config);
  
  // Check for errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message || response.statusText);
  }
  
  // Return JSON or null
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return null;
}

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Usage
const users = await api('/users');
const newUser = await api('/users', {
  method: 'POST',
  body: { name: 'John' }
});
```

### Retry with Backoff

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }
      
      // Don't retry client errors
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }
      
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Parallel Requests

```javascript
// Fetch multiple resources in parallel
const [users, posts, comments] = await Promise.all([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json()),
  fetch('/api/comments').then(r => r.json())
]);

// With error handling
const results = await Promise.allSettled([
  fetch('/api/users').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
]);

results.forEach((result, i) => {
  if (result.status === 'fulfilled') {
    console.log(`Request ${i} succeeded:`, result.value);
  } else {
    console.error(`Request ${i} failed:`, result.reason);
  }
});
```

---

## 6.2.8 Gotchas

```javascript
// ❌ Not checking response.ok
const response = await fetch('/api/data');
const data = await response.json();  // May be error response!

// ✅ Check response status
const response = await fetch('/api/data');
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();

// ❌ fetch doesn't reject on HTTP errors
try {
  const response = await fetch('/api/404');  // Won't throw!
} catch (error) {
  // Only catches network errors, not 404
}

// ✅ Manually throw on error status
const response = await fetch('/api/404');
if (!response.ok) {
  throw new Error('Not found');
}

// ❌ Reading body twice
const response = await fetch('/api/data');
const text = await response.text();
const json = await response.json();  // Error! Body already consumed

// ✅ Clone if you need to read multiple times
const response = await fetch('/api/data');
const clone = response.clone();
const text = await response.text();
const json = await clone.json();

// ❌ Setting Content-Type for FormData
await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },  // Wrong!
  body: formData
});

// ✅ Let browser set it with boundary
await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

---

## 6.2.9 Summary

### fetch() Options

| Option | Values | Default |
|--------|--------|---------|
| `method` | GET, POST, PUT, DELETE, etc. | GET |
| `headers` | Headers object or plain object | {} |
| `body` | String, FormData, Blob, etc. | null |
| `mode` | cors, no-cors, same-origin | cors |
| `credentials` | omit, same-origin, include | same-origin |
| `cache` | default, no-store, reload, etc. | default |
| `redirect` | follow, error, manual | follow |
| `signal` | AbortSignal | null |

### Body Types

| Type | Content-Type |
|------|-------------|
| JSON string | application/json |
| FormData | multipart/form-data (auto) |
| URLSearchParams | application/x-www-form-urlencoded |
| Blob/File | As specified |
| ArrayBuffer | application/octet-stream |

### Best Practices

1. **Always check response.ok** before processing
2. **Use async/await** for cleaner code
3. **Don't set Content-Type** for FormData
4. **Clone response** if reading body multiple times
5. **Handle both network errors and HTTP errors**
6. **Use AbortController** for cancellation

---

**End of Chapter 6.2: Fetch API**

Next chapter: **6.3 Response Handling** — covers parsing responses, streaming, and error handling.
