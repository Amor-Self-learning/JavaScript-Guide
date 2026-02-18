# 6.1 XMLHttpRequest

XMLHttpRequest (XHR) is the original API for making HTTP requests from JavaScript. While largely superseded by the Fetch API, understanding XHR remains important for legacy code, upload progress tracking, and certain specific use cases.

---

## 6.1.1 XHR Overview

### What Is XMLHttpRequest?

```javascript
// XMLHttpRequest:
// - Original AJAX API (since IE5)
// - Makes HTTP requests from JavaScript
// - Event-based, asynchronous API
// - Name is historical - works with any data, not just XML

// When to use XHR over Fetch:
// - Upload progress tracking (native support)
// - Legacy browser support
// - Request timeout configuration
// - Synchronous requests (not recommended)
```

### Basic XHR Flow

```javascript
// 1. Create XHR object
const xhr = new XMLHttpRequest();

// 2. Configure request
xhr.open('GET', '/api/data');

// 3. Set up event handlers
xhr.onload = function() {
  if (xhr.status === 200) {
    console.log(xhr.responseText);
  }
};

// 4. Send request
xhr.send();
```

---

## 6.1.2 Creating and Sending Requests

### GET Request

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');

xhr.onload = function() {
  if (xhr.status === 200) {
    const users = JSON.parse(xhr.responseText);
    console.log(users);
  }
};

xhr.onerror = function() {
  console.error('Network error');
};

xhr.send();
```

### POST Request with JSON

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', '/api/users');

// Set Content-Type header
xhr.setRequestHeader('Content-Type', 'application/json');

xhr.onload = function() {
  if (xhr.status === 201) {
    const newUser = JSON.parse(xhr.responseText);
    console.log('Created:', newUser);
  }
};

// Send JSON body
xhr.send(JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com'
}));
```

### POST with FormData

```javascript
const formData = new FormData();
formData.append('name', 'John');
formData.append('email', 'john@example.com');
formData.append('avatar', fileInput.files[0]);

const xhr = new XMLHttpRequest();
xhr.open('POST', '/api/users');

// Don't set Content-Type - browser sets it with boundary
xhr.onload = function() {
  console.log(xhr.status, xhr.responseText);
};

xhr.send(formData);
```

### Other HTTP Methods

```javascript
// PUT
xhr.open('PUT', '/api/users/123');
xhr.send(JSON.stringify(updatedData));

// DELETE
xhr.open('DELETE', '/api/users/123');
xhr.send();

// PATCH
xhr.open('PATCH', '/api/users/123');
xhr.send(JSON.stringify({ status: 'active' }));
```

---

## 6.1.3 Ready State and Status

### readyState Values

```javascript
const xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
  console.log('readyState:', xhr.readyState);
  
  // 0 - UNSENT: XHR created, open() not called
  // 1 - OPENED: open() called
  // 2 - HEADERS_RECEIVED: send() called, headers received
  // 3 - LOADING: receiving response body
  // 4 - DONE: operation complete
  
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      console.log('Success:', xhr.responseText);
    }
  }
};

xhr.open('GET', '/api/data');
xhr.send();
```

### Status Codes

```javascript
xhr.onload = function() {
  console.log('Status:', xhr.status);        // 200, 404, 500, etc.
  console.log('Status text:', xhr.statusText);  // "OK", "Not Found", etc.
  
  if (xhr.status >= 200 && xhr.status < 300) {
    // Success
  } else if (xhr.status === 404) {
    // Not found
  } else if (xhr.status >= 500) {
    // Server error
  }
};
```

---

## 6.1.4 Event Handlers

### Load Events

```javascript
const xhr = new XMLHttpRequest();

// Fired when request completes successfully
xhr.onload = function() {
  console.log('Loaded:', xhr.status);
};

// Fired when request fails (network error)
xhr.onerror = function() {
  console.error('Network error');
};

// Fired when request times out
xhr.ontimeout = function() {
  console.error('Request timed out');
};

// Fired when request is aborted
xhr.onabort = function() {
  console.log('Request aborted');
};

// Fired when request completes (success or failure)
xhr.onloadend = function() {
  console.log('Request finished (any outcome)');
};

xhr.open('GET', '/api/data');
xhr.send();
```

### Progress Events

```javascript
const xhr = new XMLHttpRequest();

// Download progress
xhr.onprogress = function(event) {
  if (event.lengthComputable) {
    const percent = (event.loaded / event.total) * 100;
    console.log(`Downloaded: ${percent.toFixed(2)}%`);
  } else {
    console.log(`Downloaded: ${event.loaded} bytes`);
  }
};

xhr.onloadstart = function() {
  console.log('Download started');
};

xhr.open('GET', '/large-file.zip');
xhr.send();
```

### Upload Progress

```javascript
const xhr = new XMLHttpRequest();

// Upload progress (via xhr.upload)
xhr.upload.onprogress = function(event) {
  if (event.lengthComputable) {
    const percent = (event.loaded / event.total) * 100;
    updateProgressBar(percent);
  }
};

xhr.upload.onloadstart = function() {
  console.log('Upload started');
};

xhr.upload.onload = function() {
  console.log('Upload complete');
};

xhr.upload.onerror = function() {
  console.error('Upload failed');
};

xhr.open('POST', '/api/upload');
xhr.send(formData);
```

---

## 6.1.5 Response Handling

### responseText and responseXML

```javascript
// Text response
xhr.onload = function() {
  console.log(xhr.responseText);  // Raw text
};

// XML response
xhr.onload = function() {
  const xmlDoc = xhr.responseXML;  // DOM Document
  const items = xmlDoc.getElementsByTagName('item');
};
```

### responseType

```javascript
// Set expected response type
xhr.responseType = 'json';  // Parse JSON automatically
xhr.responseType = 'blob';  // Binary data as Blob
xhr.responseType = 'arraybuffer';  // Binary data as ArrayBuffer
xhr.responseType = 'document';  // HTML/XML as Document
xhr.responseType = 'text';  // Text (default)

// Example: JSON response
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/users');
xhr.responseType = 'json';

xhr.onload = function() {
  // xhr.response is already parsed JSON
  const users = xhr.response;
  console.log(users[0].name);
};

xhr.send();

// Example: Blob response
const xhr = new XMLHttpRequest();
xhr.open('GET', '/image.png');
xhr.responseType = 'blob';

xhr.onload = function() {
  const blob = xhr.response;
  const url = URL.createObjectURL(blob);
  img.src = url;
};

xhr.send();
```

---

## 6.1.6 Headers

### Setting Request Headers

```javascript
const xhr = new XMLHttpRequest();
xhr.open('POST', '/api/data');

// Set headers AFTER open() but BEFORE send()
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.setRequestHeader('Authorization', 'Bearer token123');
xhr.setRequestHeader('X-Custom-Header', 'value');

xhr.send(JSON.stringify(data));
```

### Reading Response Headers

```javascript
xhr.onload = function() {
  // Get single header
  const contentType = xhr.getResponseHeader('Content-Type');
  console.log(contentType);  // "application/json; charset=utf-8"
  
  // Get all headers as string
  const allHeaders = xhr.getAllResponseHeaders();
  console.log(allHeaders);
  // "content-type: application/json\r\ncache-control: no-cache\r\n..."
  
  // Parse all headers to object
  const headers = {};
  allHeaders.trim().split('\r\n').forEach(line => {
    const [name, value] = line.split(': ');
    headers[name.toLowerCase()] = value;
  });
};
```

---

## 6.1.7 Timeout and Abort

### Setting Timeout

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/slow-endpoint');

// Set timeout in milliseconds
xhr.timeout = 5000;  // 5 seconds

xhr.ontimeout = function() {
  console.error('Request timed out after 5 seconds');
};

xhr.send();
```

### Aborting Requests

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', '/api/data');

xhr.onabort = function() {
  console.log('Request was aborted');
};

xhr.send();

// Later... cancel the request
document.getElementById('cancel').onclick = function() {
  xhr.abort();
};
```

---

## 6.1.8 Credentials and CORS

### Sending Cookies Cross-Origin

```javascript
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://other-domain.com/api/data');

// Include cookies and HTTP auth
xhr.withCredentials = true;

xhr.onload = function() {
  console.log(xhr.response);
};

xhr.send();

// Server must respond with:
// Access-Control-Allow-Credentials: true
// Access-Control-Allow-Origin: https://your-domain.com (not *)
```

---

## 6.1.9 Promise Wrapper

```javascript
function request(method, url, data = null, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    
    // Set response type
    if (options.responseType) {
      xhr.responseType = options.responseType;
    }
    
    // Set timeout
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }
    
    // Set headers
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });
    }
    
    // Handle credentials
    if (options.withCredentials) {
      xhr.withCredentials = true;
    }
    
    // Progress callback
    if (options.onProgress) {
      xhr.onprogress = options.onProgress;
    }
    
    if (options.onUploadProgress) {
      xhr.upload.onprogress = options.onUploadProgress;
    }
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({
          status: xhr.status,
          statusText: xhr.statusText,
          data: xhr.response,
          headers: parseHeaders(xhr.getAllResponseHeaders())
        });
      } else {
        reject({
          status: xhr.status,
          statusText: xhr.statusText,
          data: xhr.response
        });
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    xhr.onabort = () => reject(new Error('Request aborted'));
    
    // Send
    if (data && typeof data === 'object' && !(data instanceof FormData)) {
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } else {
      xhr.send(data);
    }
  });
}

function parseHeaders(headerString) {
  const headers = {};
  headerString.trim().split('\r\n').forEach(line => {
    const [name, value] = line.split(': ');
    if (name) headers[name.toLowerCase()] = value;
  });
  return headers;
}

// Usage
const response = await request('GET', '/api/users', null, {
  responseType: 'json',
  timeout: 5000
});
console.log(response.data);
```

---

## 6.1.10 Gotchas

```javascript
// ❌ Setting headers before open()
xhr.setRequestHeader('Content-Type', 'application/json');
xhr.open('POST', '/api/data');
// Error: setRequestHeader must come after open()

// ✅ Set headers after open()
xhr.open('POST', '/api/data');
xhr.setRequestHeader('Content-Type', 'application/json');

// ❌ Using responseText with non-text responseType
xhr.responseType = 'json';
xhr.onload = function() {
  console.log(xhr.responseText);  // Error!
};

// ✅ Use response property
xhr.onload = function() {
  console.log(xhr.response);  // Parsed JSON
};

// ❌ Not handling status in onload
xhr.onload = function() {
  console.log(xhr.responseText);  // Could be error response!
};

// ✅ Check status
xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    console.log(xhr.responseText);
  } else {
    console.error('Error:', xhr.status);
  }
};

// ❌ Using synchronous XHR
xhr.open('GET', '/api/data', false);  // third param = async
// Blocks main thread - deprecated!

// ✅ Always use async
xhr.open('GET', '/api/data', true);  // or just omit third param
```

---

## 6.1.11 Summary

### XHR Lifecycle

| Method/Event | Description |
|-------------|-------------|
| `new XMLHttpRequest()` | Create XHR object |
| `open(method, url)` | Configure request |
| `setRequestHeader()` | Set headers |
| `send(body)` | Send request |
| `onload` | Response received |
| `onerror` | Network error |

### readyState Values

| Value | Constant | Meaning |
|-------|----------|---------|
| 0 | UNSENT | Created |
| 1 | OPENED | open() called |
| 2 | HEADERS_RECEIVED | Headers received |
| 3 | LOADING | Downloading body |
| 4 | DONE | Complete |

### responseType Values

| Value | Response Type |
|-------|--------------|
| `''` | String (default) |
| `'text'` | String |
| `'json'` | Parsed JSON |
| `'blob'` | Blob |
| `'arraybuffer'` | ArrayBuffer |
| `'document'` | HTML/XML Document |

### Best Practices

1. **Use Fetch API** for new code when possible
2. **Always handle errors** with onerror and status checks
3. **Use async mode** - never synchronous
4. **Set responseType** to avoid manual parsing
5. **Use XHR for upload progress** if needed

---

**End of Chapter 6.1: XMLHttpRequest**

Next chapter: **6.2 Fetch API** — covers the modern promise-based API for HTTP requests.
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
# 6.4 Request Cancellation

Request cancellation allows you to abort in-flight HTTP requests. This chapter covers the AbortController API, timeout implementation, and patterns for managing cancellable requests in various scenarios.

---

## 6.4.1 AbortController Overview

### What Is AbortController?

```javascript
// AbortController provides a way to abort:
// - Fetch requests
// - DOM operations
// - Any async operation that accepts an AbortSignal

// Basic structure
const controller = new AbortController();
const signal = controller.signal;

// Later... abort!
controller.abort();
```

### Basic Usage

```javascript
const controller = new AbortController();

// Pass signal to fetch
const fetchPromise = fetch('/api/data', {
  signal: controller.signal
});

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetchPromise;
  const data = await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was aborted');
  } else {
    throw error;
  }
}
```

---

## 6.4.2 Timeout Implementation

### Simple Timeout

```javascript
async function fetchWithTimeout(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
try {
  const response = await fetchWithTimeout('/api/data', {}, 3000);
} catch (error) {
  console.error(error.message);
}
```

### AbortSignal.timeout() (Modern)

```javascript
// Built-in timeout (Chrome 103+, Firefox 100+)
try {
  const response = await fetch('/api/data', {
    signal: AbortSignal.timeout(5000)  // 5 second timeout
  });
} catch (error) {
  if (error.name === 'TimeoutError') {
    console.log('Request timed out');
  } else if (error.name === 'AbortError') {
    console.log('Request aborted');
  }
}
```

### Combining Timeout and Manual Abort

```javascript
function fetchWithTimeoutAndAbort(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  
  // Combine with timeout signal
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  
  // Use AbortSignal.any() to combine signals (if supported)
  const combinedSignal = AbortSignal.any([
    controller.signal,
    timeoutSignal
  ]);
  
  const promise = fetch(url, {
    ...options,
    signal: combinedSignal
  });
  
  // Return both the promise and the abort function
  return {
    promise,
    abort: () => controller.abort()
  };
}

// Usage
const { promise, abort } = fetchWithTimeoutAndAbort('/api/data', {}, 5000);

// Can abort manually
cancelButton.onclick = () => abort();

const response = await promise;
```

---

## 6.4.3 User-Initiated Cancellation

### Cancel Button Pattern

```javascript
let currentController = null;

async function search(query) {
  // Abort previous request
  if (currentController) {
    currentController.abort();
  }
  
  currentController = new AbortController();
  
  try {
    const response = await fetch(`/api/search?q=${query}`, {
      signal: currentController.signal
    });
    
    return await response.json();
    
  } catch (error) {
    if (error.name === 'AbortError') {
      // Ignore - request was intentionally cancelled
      return null;
    }
    throw error;
  }
}

// Input handler - cancels previous search on new input
searchInput.addEventListener('input', async (e) => {
  const results = await search(e.target.value);
  if (results) {
    displayResults(results);
  }
});
```

### Cancel on Component Unmount (React Pattern)

```javascript
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const controller = new AbortController();
    
    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load user:', error);
        }
      }
    }
    
    loadUser();
    
    // Cleanup: abort on unmount or userId change
    return () => controller.abort();
  }, [userId]);
  
  return user ? <div>{user.name}</div> : <div>Loading...</div>;
}
```

---

## 6.4.4 AbortSignal Methods

### signal.aborted

```javascript
const controller = new AbortController();

console.log(controller.signal.aborted);  // false

controller.abort();

console.log(controller.signal.aborted);  // true

// Check before starting work
if (signal.aborted) {
  return;  // Don't start if already aborted
}
```

### signal.reason

```javascript
const controller = new AbortController();

// Abort with reason
controller.abort('User cancelled');

console.log(controller.signal.reason);  // 'User cancelled'

// Or with error
controller.abort(new Error('Custom error'));
```

### signal.throwIfAborted()

```javascript
const controller = new AbortController();

async function longOperation(signal) {
  for (let i = 0; i < 100; i++) {
    // Check if aborted at each step
    signal.throwIfAborted();
    
    await doSomeWork(i);
  }
}

try {
  await longOperation(controller.signal);
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Operation aborted');
  }
}
```

### abort Event

```javascript
const controller = new AbortController();

controller.signal.addEventListener('abort', () => {
  console.log('Abort signal received');
  console.log('Reason:', controller.signal.reason);
});

controller.abort('Cleanup');
// Logs: "Abort signal received"
// Logs: "Reason: Cleanup"
```

---

## 6.4.5 Multiple Request Cancellation

### Abort Multiple Requests

```javascript
const controller = new AbortController();

// Multiple parallel requests sharing same signal
const results = await Promise.all([
  fetch('/api/users', { signal: controller.signal }),
  fetch('/api/posts', { signal: controller.signal }),
  fetch('/api/comments', { signal: controller.signal })
]);

// Abort all at once
controller.abort();
```

### Race Pattern

```javascript
async function fetchWithRace(urls, timeout = 5000) {
  const controller = new AbortController();
  
  const fetchPromises = urls.map(url =>
    fetch(url, { signal: controller.signal })
  );
  
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      controller.abort();
      reject(new Error('Timeout'));
    }, timeout);
  });
  
  try {
    // Race all fetches against timeout
    const response = await Promise.race([
      Promise.any(fetchPromises),
      timeoutPromise
    ]);
    
    // Abort remaining requests
    controller.abort();
    
    return response;
    
  } catch (error) {
    controller.abort();
    throw error;
  }
}
```

---

## 6.4.6 Custom Abortable Operations

### Making Your Functions Abortable

```javascript
function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    // Check if already aborted
    if (signal?.aborted) {
      return reject(new DOMException('Aborted', 'AbortError'));
    }
    
    const timeoutId = setTimeout(resolve, ms);
    
    // Listen for abort
    signal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

// Usage
const controller = new AbortController();

try {
  await delay(5000, controller.signal);
  console.log('Delay completed');
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Delay cancelled');
  }
}

// Cancel after 2 seconds
setTimeout(() => controller.abort(), 2000);
```

### Abortable Generator

```javascript
async function* fetchPaginated(baseUrl, signal) {
  let page = 1;
  
  while (true) {
    signal?.throwIfAborted();
    
    const response = await fetch(`${baseUrl}?page=${page}`, { signal });
    const data = await response.json();
    
    if (data.length === 0) break;
    
    yield data;
    page++;
  }
}

// Usage
const controller = new AbortController();

for await (const page of fetchPaginated('/api/items', controller.signal)) {
  console.log('Got page:', page);
  
  if (shouldStop()) {
    controller.abort();
    break;
  }
}
```

---

## 6.4.7 Common Patterns

### Debounced Search with Cancellation

```javascript
function createDebouncedSearch(delay = 300) {
  let timeoutId;
  let controller;
  
  return async function search(query) {
    // Clear previous timeout
    clearTimeout(timeoutId);
    
    // Abort previous request
    controller?.abort();
    controller = new AbortController();
    
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?q=${query}`, {
            signal: controller.signal
          });
          resolve(await response.json());
        } catch (error) {
          if (error.name !== 'AbortError') {
            reject(error);
          }
        }
      }, delay);
    });
  };
}

const debouncedSearch = createDebouncedSearch();

// Automatically cancels previous requests
input.addEventListener('input', async (e) => {
  const results = await debouncedSearch(e.target.value);
  displayResults(results);
});
```

### Request Queue with Cancellation

```javascript
class RequestQueue {
  constructor() {
    this.queue = [];
    this.controller = null;
  }
  
  async add(url, options = {}) {
    // Store in queue with unique id
    const id = Date.now();
    const item = { id, url, options };
    this.queue.push(item);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: this.controller?.signal
      });
      return response;
    } finally {
      // Remove from queue
      this.queue = this.queue.filter(i => i.id !== id);
    }
  }
  
  cancelAll() {
    this.controller?.abort();
    this.controller = new AbortController();
    this.queue = [];
  }
  
  get pending() {
    return this.queue.length;
  }
}
```

---

## 6.4.8 Gotchas

```javascript
// ❌ Reusing aborted controller
const controller = new AbortController();
controller.abort();

// This will fail immediately!
await fetch('/api/data', { signal: controller.signal });

// ✅ Create new controller for each request
const newController = new AbortController();
await fetch('/api/data', { signal: newController.signal });

// ❌ Not catching AbortError
try {
  await fetch('/api/data', { signal: controller.signal });
} catch (error) {
  console.error(error);  // Logs AbortError even for intentional abort
}

// ✅ Handle AbortError separately
try {
  await fetch('/api/data', { signal: controller.signal });
} catch (error) {
  if (error.name === 'AbortError') {
    // Intentional abort - ignore or handle gracefully
    return;
  }
  console.error(error);  // Real error
}

// ❌ Memory leak - not removing abort listener
signal.addEventListener('abort', handler);
// Handler stays in memory even after operation completes

// ✅ Clean up listener
const handler = () => { /* ... */ };
signal.addEventListener('abort', handler);
// Later...
signal.removeEventListener('abort', handler);

// Or use { once: true }
signal.addEventListener('abort', handler, { once: true });
```

---

## 6.4.9 Summary

### AbortController API

| Property/Method | Description |
|----------------|-------------|
| `new AbortController()` | Create controller |
| `controller.signal` | Get AbortSignal |
| `controller.abort(reason)` | Abort with optional reason |

### AbortSignal Properties

| Property | Description |
|----------|-------------|
| `signal.aborted` | Boolean - is aborted? |
| `signal.reason` | Abort reason |
| `signal.throwIfAborted()` | Throw if aborted |
| `'abort'` event | Fired on abort |

### Static Methods

| Method | Description |
|--------|-------------|
| `AbortSignal.timeout(ms)` | Auto-abort after timeout |
| `AbortSignal.any(signals)` | Abort when any signal aborts |
| `AbortSignal.abort(reason)` | Create pre-aborted signal |

### Best Practices

1. **Create new controller** for each request
2. **Handle AbortError** separately from other errors
3. **Clean up listeners** to prevent memory leaks
4. **Abort on unmount** in component-based frameworks
5. **Use timeout** for long-running requests
6. **Cancel previous** when starting new related request

---

**End of Chapter 6.4: Request Cancellation**

Next chapter: **6.5 CORS** — covers Cross-Origin Resource Sharing and how to handle cross-origin requests.
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
