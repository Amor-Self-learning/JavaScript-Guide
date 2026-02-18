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
