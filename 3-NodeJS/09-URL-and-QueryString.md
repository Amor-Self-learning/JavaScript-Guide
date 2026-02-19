# Module 9: URL and Query String

Node.js provides built-in modules for parsing, constructing, and manipulating URLs and query strings. The modern `URL` and `URLSearchParams` classes are recommended over the legacy `url` and `querystring` modules.

---

## 9.1 The URL Class (WHATWG Standard)

### Creating URLs

```javascript
// From string
const url = new URL('https://user:pass@example.com:8080/path/file.html?query=value#hash');

// From relative URL with base
const relative = new URL('/api/users', 'https://example.com');
console.log(relative.href);  // 'https://example.com/api/users'

// From existing URL
const copy = new URL(url);
```

### URL Components

```javascript
const url = new URL('https://user:pass@example.com:8080/path/file.html?query=value#hash');

console.log(url.href);        // Full URL string
console.log(url.protocol);    // 'https:'
console.log(url.username);    // 'user'
console.log(url.password);    // 'pass'
console.log(url.host);        // 'example.com:8080'
console.log(url.hostname);    // 'example.com'
console.log(url.port);        // '8080'
console.log(url.pathname);    // '/path/file.html'
console.log(url.search);      // '?query=value'
console.log(url.searchParams); // URLSearchParams object
console.log(url.hash);        // '#hash'
console.log(url.origin);      // 'https://example.com:8080'
```

### Modifying URLs

```javascript
const url = new URL('https://example.com');

// All properties are settable
url.pathname = '/api/users';
url.port = '3000';
url.searchParams.set('page', '1');
url.hash = 'section1';

console.log(url.href);
// 'https://example.com:3000/api/users?page=1#section1'
```

### URL Validation

```javascript
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (err) {
    return false;
  }
}

console.log(isValidUrl('https://example.com'));  // true
console.log(isValidUrl('not-a-url'));            // false
console.log(isValidUrl('ftp://files.com'));      // true
```

---

## 9.2 URLSearchParams

### Creating URLSearchParams

```javascript
// From string
const params1 = new URLSearchParams('foo=bar&baz=qux');

// From object
const params2 = new URLSearchParams({
  name: 'John',
  age: '30'
});

// From array of pairs
const params3 = new URLSearchParams([
  ['color', 'red'],
  ['color', 'blue'],  // Duplicate keys allowed
  ['size', 'large']
]);

// From URL
const url = new URL('https://example.com?foo=bar');
const params4 = url.searchParams;
```

### Getting Values

```javascript
const params = new URLSearchParams('name=John&colors=red&colors=blue');

// Get first value
console.log(params.get('name'));    // 'John'
console.log(params.get('colors'));  // 'red' (first only)
console.log(params.get('missing')); // null

// Get all values
console.log(params.getAll('colors')); // ['red', 'blue']

// Check existence
console.log(params.has('name'));    // true
console.log(params.has('missing')); // false
```

### Setting Values

```javascript
const params = new URLSearchParams();

// Set (replaces all with same key)
params.set('name', 'John');
params.set('name', 'Jane');  // Replaces
console.log(params.toString());  // 'name=Jane'

// Append (adds another)
params.append('color', 'red');
params.append('color', 'blue');
console.log(params.toString());  // 'name=Jane&color=red&color=blue'

// Delete
params.delete('color');
console.log(params.toString());  // 'name=Jane'

// Delete with value (Node.js 20+)
params.append('fruit', 'apple');
params.append('fruit', 'banana');
params.delete('fruit', 'apple');  // Only removes 'apple'
```

### Iterating

```javascript
const params = new URLSearchParams('a=1&b=2&c=3');

// entries()
for (const [key, value] of params.entries()) {
  console.log(`${key}: ${value}`);
}

// keys()
for (const key of params.keys()) {
  console.log(key);  // 'a', 'b', 'c'
}

// values()
for (const value of params.values()) {
  console.log(value);  // '1', '2', '3'
}

// forEach
params.forEach((value, key) => {
  console.log(`${key}=${value}`);
});

// Direct iteration (same as entries())
for (const [key, value] of params) {
  console.log(key, value);
}
```

### Sorting and Stringifying

```javascript
const params = new URLSearchParams('z=1&a=2&m=3');

// Sort alphabetically
params.sort();
console.log(params.toString());  // 'a=2&m=3&z=1'

// Size
console.log(params.size);  // 3

// To string
console.log(params.toString());  // 'a=2&m=3&z=1'
console.log(String(params));     // Same
```

---

## 9.3 URL Encoding

### Automatic Encoding

```javascript
const params = new URLSearchParams();

// Special characters are encoded automatically
params.set('query', 'hello world');
params.set('special', 'a=b&c=d');
console.log(params.toString());
// 'query=hello+world&special=a%3Db%26c%3Dd'
```

### Manual Encoding/Decoding

```javascript
// encodeURIComponent - encode special chars
const encoded = encodeURIComponent('hello world');
console.log(encoded);  // 'hello%20world'

// decodeURIComponent - decode
const decoded = decodeURIComponent('hello%20world');
console.log(decoded);  // 'hello world'

// encodeURI - encode full URL (preserves :, /, ?)
const url = 'https://example.com/path with spaces?q=hello world';
console.log(encodeURI(url));
// 'https://example.com/path%20with%20spaces?q=hello%20world'

// decodeURI
console.log(decodeURI('https://example.com/path%20name'));
// 'https://example.com/path name'
```

### Encoding Differences

```javascript
const text = 'Hello World! @#$%';

// encodeURIComponent: encodes everything except A-Z a-z 0-9 - _ . ~ 
console.log(encodeURIComponent(text));
// 'Hello%20World!%20%40%23%24%25'

// encodeURI: preserves URL-safe characters
console.log(encodeURI(text));
// 'Hello%20World!%20@#$%25'
```

---

## 9.4 Legacy url Module

The `url` module provides additional utilities and legacy parsing:

```javascript
const url = require('url');

// Parse URL (legacy)
const parsed = url.parse('https://user:pass@example.com/path?query=value', true);
console.log(parsed.protocol);  // 'https:'
console.log(parsed.query);     // { query: 'value' } (object when true)

// Format URL from object
const formatted = url.format({
  protocol: 'https',
  hostname: 'example.com',
  pathname: '/path',
  query: { key: 'value' }
});
console.log(formatted);  // 'https://example.com/path?key=value'

// Resolve relative URLs
console.log(url.resolve('https://example.com/a/b', '../c'));
// 'https://example.com/c'

console.log(url.resolve('https://example.com/a/b', '/c'));
// 'https://example.com/c'
```

### pathToFileURL / fileURLToPath

```javascript
const { pathToFileURL, fileURLToPath } = require('url');

// Path to file URL
const fileUrl = pathToFileURL('/home/user/file.txt');
console.log(fileUrl.href);
// 'file:///home/user/file.txt'

// File URL to path
const filePath = fileURLToPath('file:///home/user/file.txt');
console.log(filePath);
// '/home/user/file.txt'

// Useful for ES module import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
```

---

## 9.5 Legacy querystring Module

```javascript
const querystring = require('querystring');

// Parse query string
const parsed = querystring.parse('name=John&age=30&colors=red&colors=blue');
console.log(parsed);
// { name: 'John', age: '30', colors: ['red', 'blue'] }

// Stringify object
const str = querystring.stringify({
  name: 'John',
  colors: ['red', 'blue']
});
console.log(str);
// 'name=John&colors=red&colors=blue'

// Custom separator and equals
const custom = querystring.parse('name:John;age:30', ';', ':');
console.log(custom);
// { name: 'John', age: '30' }

// Escape/unescape
console.log(querystring.escape('hello world'));  // 'hello%20world'
console.log(querystring.unescape('hello%20world'));  // 'hello world'
```

---

## 9.6 Common Patterns

### Build URL with Query Parameters

```javascript
function buildUrl(base, params) {
  const url = new URL(base);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => url.searchParams.append(key, v));
    } else if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

const url = buildUrl('https://api.example.com/search', {
  q: 'hello world',
  page: 1,
  tags: ['javascript', 'nodejs'],
  empty: null  // Ignored
});
// 'https://api.example.com/search?q=hello+world&page=1&tags=javascript&tags=nodejs'
```

### Parse Query String to Object

```javascript
function parseQuery(url) {
  const params = new URL(url).searchParams;
  const result = {};
  
  for (const [key, value] of params) {
    if (result[key] !== undefined) {
      // Convert to array for duplicate keys
      if (!Array.isArray(result[key])) {
        result[key] = [result[key]];
      }
      result[key].push(value);
    } else {
      result[key] = value;
    }
  }
  
  return result;
}

console.log(parseQuery('https://example.com?a=1&b=2&a=3'));
// { a: ['1', '3'], b: '2' }
```

### Merge Query Parameters

```javascript
function mergeQueryParams(url, newParams) {
  const urlObj = new URL(url);
  
  Object.entries(newParams).forEach(([key, value]) => {
    if (value === null) {
      urlObj.searchParams.delete(key);
    } else {
      urlObj.searchParams.set(key, value);
    }
  });
  
  return urlObj.toString();
}

const url = 'https://example.com?page=1&sort=date';
console.log(mergeQueryParams(url, { page: '2', filter: 'active', sort: null }));
// 'https://example.com/?page=2&filter=active'
```

### Extract Path Parameters

```javascript
function matchPath(pattern, path) {
  const paramNames = [];
  const regexPattern = pattern.replace(/:(\w+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  
  const regex = new RegExp(`^${regexPattern}$`);
  const match = path.match(regex);
  
  if (!match) return null;
  
  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  
  return params;
}

console.log(matchPath('/users/:id/posts/:postId', '/users/123/posts/456'));
// { id: '123', postId: '456' }

console.log(matchPath('/users/:id', '/posts/123'));
// null
```

### URL Normalization

```javascript
function normalizeUrl(urlString) {
  const url = new URL(urlString);
  
  // Lowercase hostname
  url.hostname = url.hostname.toLowerCase();
  
  // Remove default ports
  if ((url.protocol === 'https:' && url.port === '443') ||
      (url.protocol === 'http:' && url.port === '80')) {
    url.port = '';
  }
  
  // Remove trailing slash (except root)
  if (url.pathname !== '/' && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  
  // Sort query parameters
  url.searchParams.sort();
  
  // Remove hash
  url.hash = '';
  
  return url.toString();
}

console.log(normalizeUrl('HTTPS://EXAMPLE.COM:443/Path/?b=2&a=1#hash'));
// 'https://example.com/Path?a=1&b=2'
```

---

## 9.7 Security Considerations

### URL Validation

```javascript
function isHttpUrl(urlString) {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ❌ Dangerous - allows any protocol
function dangerousRedirect(userUrl) {
  return userUrl;  // Could be javascript:, data:, file:
}

// ✅ Safe - validate protocol
function safeRedirect(userUrl) {
  if (!isHttpUrl(userUrl)) {
    throw new Error('Invalid URL');
  }
  return userUrl;
}
```

### Prevent Open Redirect

```javascript
function isSameOrigin(urlString, baseUrl) {
  try {
    const url = new URL(urlString, baseUrl);
    const base = new URL(baseUrl);
    return url.origin === base.origin;
  } catch {
    return false;
  }
}

// ❌ Vulnerable to open redirect
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url);
});

// ✅ Safe - validate origin
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  if (isSameOrigin(url, 'https://myapp.com')) {
    res.redirect(url);
  } else {
    res.status(400).send('Invalid redirect URL');
  }
});
```

### Sanitize User Input in URLs

```javascript
function buildSafeUrl(base, userInput) {
  const url = new URL(base);
  
  // User input in path - encode it
  url.pathname = `/search/${encodeURIComponent(userInput)}`;
  
  // User input in query - URLSearchParams handles encoding
  url.searchParams.set('q', userInput);
  
  return url.toString();
}

buildSafeUrl('https://example.com', 'test/../../../etc/passwd');
// 'https://example.com/search/test%2F..%2F..%2F..%2Fetc%2Fpasswd?q=test%2F..%2F..%2F..%2Fetc%2Fpasswd'
```

---

## 9.8 Common Gotchas

### Relative URL Without Base

```javascript
// ❌ Throws error
new URL('/path/to/page');
// TypeError: Invalid URL

// ✅ Provide base URL
new URL('/path/to/page', 'https://example.com');
```

### URLSearchParams Order Not Preserved

```javascript
const params = new URLSearchParams();
params.set('z', '1');
params.set('a', '2');

// Order is preserved
console.log(params.toString());  // 'z=1&a=2'

// But creating from object may not preserve order
const fromObj = new URLSearchParams({ z: '1', a: '2' });
// Order depends on object property order
```

### Plus Signs in Query Strings

```javascript
// Plus sign means space in query strings
const params = new URLSearchParams('name=John+Doe');
console.log(params.get('name'));  // 'John Doe'

// To preserve plus sign, encode it
const encoded = new URLSearchParams({ email: 'test+alias@example.com' });
console.log(encoded.toString());  // 'email=test%2Balias%40example.com'
```

### Empty vs Missing Parameters

```javascript
const url1 = new URL('https://example.com?key=');
const url2 = new URL('https://example.com?key');
const url3 = new URL('https://example.com');

console.log(url1.searchParams.get('key'));  // '' (empty string)
console.log(url2.searchParams.get('key'));  // '' (empty string)
console.log(url3.searchParams.get('key'));  // null
```

---

## 9.9 Summary

| Class/Method | Description |
|--------------|-------------|
| `new URL(url)` | Parse URL string |
| `url.searchParams` | Get URLSearchParams object |
| `url.href` | Full URL string |
| `url.origin` | Protocol + host + port |
| `new URLSearchParams()` | Create query string builder |
| `params.get(key)` | Get first value |
| `params.getAll(key)` | Get all values |
| `params.set(key, value)` | Set (replace) value |
| `params.append(key, value)` | Add value |
| `params.delete(key)` | Remove parameter |

| Utility Function | Description |
|------------------|-------------|
| `encodeURIComponent()` | Encode for query/path segment |
| `decodeURIComponent()` | Decode encoded string |
| `encodeURI()` | Encode full URL (preserves special chars) |
| `pathToFileURL()` | Convert file path to file:// URL |
| `fileURLToPath()` | Convert file:// URL to path |

---

**End of Module 9: URL and Query String**

Next: **Module 10 — OS** (Operating system information)
