# 2.2 Location Object

The `location` object represents the current URL and provides methods for navigating to new pages. It's available as both `window.location` and `document.location` (they reference the same object). Understanding the Location API is essential for SPAs, deep linking, URL parameter handling, and programmatic navigation.

---

## 2.2.1 URL Components

The location object exposes all parts of the current URL.

### URL Anatomy

```javascript
// Example URL:
// https://user:pass@www.example.com:8080/path/page.html?query=1&foo=bar#section

console.log(location.href);      
// "https://user:pass@www.example.com:8080/path/page.html?query=1&foo=bar#section"

console.log(location.protocol);  // "https:"
console.log(location.username);  // "user" (rarely used)
console.log(location.password);  // "pass" (rarely used)
console.log(location.host);      // "www.example.com:8080" (hostname + port)
console.log(location.hostname);  // "www.example.com"
console.log(location.port);      // "8080" (empty string if default)
console.log(location.pathname);  // "/path/page.html"
console.log(location.search);    // "?query=1&foo=bar"
console.log(location.hash);      // "#section"
console.log(location.origin);    // "https://www.example.com:8080" (read-only)
```

### Property Details

| Property | Includes | Writable |
|----------|----------|----------|
| `href` | Complete URL | Yes |
| `protocol` | Protocol with colon | Yes |
| `host` | Hostname + port | Yes |
| `hostname` | Hostname only | Yes |
| `port` | Port number | Yes |
| `pathname` | Path starting with `/` | Yes |
| `search` | Query string with `?` | Yes |
| `hash` | Fragment with `#` | Yes |
| `origin` | Protocol + hostname + port | **No** |

### Reading URL Parts

```javascript
// Current URL: https://shop.example.com/products?category=shoes&size=10#reviews

// Get the query string
const query = location.search;  // "?category=shoes&size=10"

// Parse query parameters
const params = new URLSearchParams(location.search);
console.log(params.get('category'));  // "shoes"
console.log(params.get('size'));      // "10"

// Get hash
const section = location.hash;  // "#reviews"
const sectionId = location.hash.slice(1);  // "reviews" (without #)

// Check protocol
if (location.protocol === 'https:') {
  console.log('Secure connection');
}
```

---

## 2.2.2 Modifying the URL

Setting location properties triggers navigation.

### Setting href

```javascript
// Navigate to new page (creates history entry)
location.href = 'https://example.com/new-page';

// Relative URLs work
location.href = '/another-page';
location.href = '../parent-page';
location.href = 'sibling-page.html';

// Shorthand: assign to location directly
location = 'https://example.com';  // Same as setting href
window.location = '/page';          // Same effect
```

### Modifying Individual Parts

```javascript
// Change just the hash (no page reload!)
location.hash = 'section2';
// URL becomes: current-url#section2

// Change query string (causes reload)
location.search = '?page=2&sort=name';

// Change pathname (causes reload)
location.pathname = '/new-path';

// Change protocol (causes reload)
location.protocol = 'https:';  // Forces HTTPS

// Change host (causes navigation)
location.hostname = 'other-domain.com';
```

### Hash Changes (No Reload)

```javascript
// Changing hash does NOT reload the page
location.hash = 'section1';

// Listen for hash changes
window.addEventListener('hashchange', (e) => {
  console.log('Old URL:', e.oldURL);
  console.log('New URL:', e.newURL);
  console.log('New hash:', location.hash);
  
  // Handle hash-based routing
  handleRoute(location.hash.slice(1));
});

// Useful for SPAs (simple client-side routing)
function navigate(sectionId) {
  location.hash = sectionId;
}
```

---

## 2.2.3 Navigation Methods

### assign()

Navigates to a new URL, adding a history entry.

```javascript
// Navigate (same as setting href)
location.assign('https://example.com/page');

// Adds to browser history
// User can press Back to return

// Equivalent to:
location.href = 'https://example.com/page';
```

### replace()

Navigates to a new URL, replacing the current history entry.

```javascript
// Navigate without adding history entry
location.replace('https://example.com/page');

// Current page is removed from history
// User cannot press Back to return here

// Use cases:
// - Redirect after login (don't want user to go back to login)
// - Redirect after form submission
// - Temporary pages that shouldn't be in history

// Example: Post-login redirect
function handleLoginSuccess() {
  // Don't allow going back to login form
  location.replace('/dashboard');
}

// Example: Language redirect
if (location.pathname === '/') {
  const lang = navigator.language.slice(0, 2);
  location.replace(`/${lang}/home`);
}
```

### reload()

Reloads the current page.

```javascript
// Reload the page
location.reload();

// ⚠️ The forceReload parameter is deprecated
// location.reload(true);  // Don't use

// To force bypass cache, use:
// - Ctrl+Shift+R (user action)
// - Or fetch new content via JavaScript

// Reload after action
function saveAndReload() {
  saveData()
    .then(() => location.reload());
}

// Reload with new query params
function refreshWithParams(newParams) {
  const url = new URL(location.href);
  Object.entries(newParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  location.href = url.toString();
}
```

### Method Comparison

| Method | Creates History Entry? | User Can Go Back? |
|--------|------------------------|-------------------|
| `assign()` | Yes | Yes |
| `replace()` | No | No |
| Setting `href` | Yes | Yes |
| Setting `hash` | Yes | Yes (hash only) |
| `reload()` | No | N/A (same page) |

---

## 2.2.4 URL Object

Use the URL constructor for complex URL manipulation.

### Creating URLs

```javascript
// Absolute URL
const url = new URL('https://example.com/path?query=value');

// Relative URL with base
const relative = new URL('/page', 'https://example.com');
console.log(relative.href);  // "https://example.com/page"

// From current location
const current = new URL(location.href);

// With relative path
const nextPage = new URL('../other', location.href);
```

### Manipulating URLs

```javascript
const url = new URL('https://example.com/products');

// Modify parts
url.pathname = '/search';
url.hash = 'results';

// Work with query parameters
url.searchParams.set('category', 'electronics');
url.searchParams.set('page', '1');
url.searchParams.append('tag', 'sale');
url.searchParams.append('tag', 'new');

console.log(url.href);
// "https://example.com/search?category=electronics&page=1&tag=sale&tag=new#results"

// Read parameters
console.log(url.searchParams.get('category'));    // "electronics"
console.log(url.searchParams.getAll('tag'));      // ["sale", "new"]
console.log(url.searchParams.has('page'));        // true

// Remove parameters
url.searchParams.delete('tag');

// Iterate parameters
for (const [key, value] of url.searchParams) {
  console.log(`${key}: ${value}`);
}

// Sort parameters
url.searchParams.sort();
```

### URL vs location

```javascript
// URL is more powerful for manipulation
// location is specific to current page

// Build a URL without navigating
const apiUrl = new URL('/api/users', location.origin);
apiUrl.searchParams.set('limit', '10');

// Use it
fetch(apiUrl)
  .then(response => response.json())
  .then(data => console.log(data));

// Navigate only when ready
function navigate(path, params) {
  const url = new URL(path, location.origin);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  location.href = url.href;
}
```

---

## 2.2.5 URLSearchParams

The `searchParams` property (on URL) and standalone `URLSearchParams` for working with query strings.

### Creating URLSearchParams

```javascript
// From query string
const params1 = new URLSearchParams('?foo=bar&baz=qux');
const params2 = new URLSearchParams('foo=bar&baz=qux');  // ? is optional

// From current URL
const params3 = new URLSearchParams(location.search);

// From object
const params4 = new URLSearchParams({
  category: 'books',
  sort: 'price',
  page: '1'
});

// From array of pairs
const params5 = new URLSearchParams([
  ['tag', 'javascript'],
  ['tag', 'tutorial'],
  ['level', 'beginner']
]);
```

### Reading Parameters

```javascript
const params = new URLSearchParams('?id=123&name=John&tags=a&tags=b');

// Get single value (first if multiple)
console.log(params.get('id'));      // "123"
console.log(params.get('missing')); // null

// Get all values for a key
console.log(params.getAll('tags')); // ["a", "b"]

// Check existence
console.log(params.has('name'));    // true
console.log(params.has('email'));   // false

// Iterate
for (const [key, value] of params) {
  console.log(`${key}: ${value}`);
}

params.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// Get all keys, values, entries
console.log([...params.keys()]);    // ["id", "name", "tags", "tags"]
console.log([...params.values()]);  // ["123", "John", "a", "b"]
console.log([...params.entries()]); // Array of [key, value] pairs
```

### Modifying Parameters

```javascript
const params = new URLSearchParams();

// Set (replaces any existing value)
params.set('page', '1');

// Append (adds, even if key exists)
params.append('tag', 'javascript');
params.append('tag', 'es6');

// Delete all values for key
params.delete('tag');

// Sort alphabetically by key
params.sort();

// Convert to string
console.log(params.toString());  // "page=1"
```

### Practical Patterns

```javascript
// Build query string from form
function formToQueryString(form) {
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);
  return params.toString();
}

// Update URL without reload (with History API)
function updateURLParams(updates) {
  const url = new URL(location.href);
  
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  
  history.replaceState(null, '', url);
}

// Parse complex filters from URL
function parseFilters() {
  const params = new URLSearchParams(location.search);
  return {
    category: params.get('category'),
    minPrice: params.has('minPrice') ? Number(params.get('minPrice')) : null,
    maxPrice: params.has('maxPrice') ? Number(params.get('maxPrice')) : null,
    tags: params.getAll('tags'),
    page: Number(params.get('page')) || 1,
    sort: params.get('sort') || 'relevance'
  };
}
```

---

## 2.2.6 Security Considerations

### Open Redirect Vulnerability

```javascript
// ❌ DANGEROUS: User-controlled redirects
const redirect = new URLSearchParams(location.search).get('redirect');
location.href = redirect;  // XSS/phishing risk!

// ✅ SAFE: Validate redirect target
function safeRedirect(url) {
  try {
    const target = new URL(url, location.origin);
    
    // Only allow same-origin redirects
    if (target.origin !== location.origin) {
      console.error('Invalid redirect: different origin');
      return false;
    }
    
    location.href = target.href;
    return true;
  } catch (e) {
    console.error('Invalid redirect URL');
    return false;
  }
}

// Or use an allowlist
const ALLOWED_REDIRECTS = ['/home', '/dashboard', '/profile'];

function safeRedirectFromParam() {
  const redirect = new URLSearchParams(location.search).get('redirect');
  
  if (ALLOWED_REDIRECTS.includes(redirect)) {
    location.href = redirect;
  } else {
    location.href = '/home';  // Default fallback
  }
}
```

### URL Encoding

```javascript
// User input must be encoded
const userInput = 'hello world & special=chars';

// ❌ BAD: Unencoded
const badUrl = `/search?q=${userInput}`;
// "/search?q=hello world & special=chars" (broken URL)

// ✅ GOOD: Use URLSearchParams (auto-encodes)
const params = new URLSearchParams({ q: userInput });
const goodUrl = `/search?${params}`;
// "/search?q=hello+world+%26+special%3Dchars"

// Or encodeURIComponent for individual values
const encoded = encodeURIComponent(userInput);
// "hello%20world%20%26%20special%3Dchars"
```

---

## 2.2.7 Common Patterns

### Single-Page App Routing (Hash-based)

```javascript
// Simple hash router
class HashRouter {
  constructor() {
    this.routes = new Map();
    window.addEventListener('hashchange', () => this.handleRoute());
  }
  
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }
  
  handleRoute() {
    const path = location.hash.slice(1) || '/';
    const handler = this.routes.get(path);
    
    if (handler) {
      handler();
    } else {
      // 404 handling
      this.routes.get('*')?.();
    }
  }
  
  navigate(path) {
    location.hash = path;
  }
  
  start() {
    this.handleRoute();
  }
}

// Usage
const router = new HashRouter();
router
  .on('/', () => showHome())
  .on('/about', () => showAbout())
  .on('/contact', () => showContact())
  .on('*', () => show404())
  .start();
```

### Query Parameter Sync

```javascript
// Keep UI state in sync with URL params
class QuerySync {
  constructor(defaults = {}) {
    this.defaults = defaults;
    this.listeners = new Set();
  }
  
  get(key) {
    const params = new URLSearchParams(location.search);
    return params.get(key) ?? this.defaults[key] ?? null;
  }
  
  getAll() {
    const params = new URLSearchParams(location.search);
    const result = { ...this.defaults };
    
    for (const [key, value] of params) {
      result[key] = value;
    }
    
    return result;
  }
  
  set(key, value) {
    const url = new URL(location.href);
    
    if (value === null || value === this.defaults[key]) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
    
    history.pushState(null, '', url);
    this.notifyListeners();
  }
  
  setAll(values) {
    const url = new URL(location.href);
    
    Object.entries(values).forEach(([key, value]) => {
      if (value === null || value === this.defaults[key]) {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    
    history.pushState(null, '', url);
    this.notifyListeners();
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  notifyListeners() {
    this.listeners.forEach(fn => fn(this.getAll()));
  }
}

// Usage
const querySync = new QuerySync({ page: '1', sort: 'date' });

querySync.subscribe((params) => {
  console.log('URL params changed:', params);
  updateUI(params);
});

querySync.set('page', '2');
```

### Deep Linking

```javascript
// Generate shareable link with current state
function getShareableLink(state) {
  const url = new URL(location.origin + location.pathname);
  
  // Add state to URL
  Object.entries(state).forEach(([key, value]) => {
    if (value != null) {
      url.searchParams.set(key, JSON.stringify(value));
    }
  });
  
  return url.href;
}

// Restore state from URL
function restoreFromURL() {
  const params = new URLSearchParams(location.search);
  const state = {};
  
  for (const [key, value] of params) {
    try {
      state[key] = JSON.parse(value);
    } catch {
      state[key] = value;
    }
  }
  
  return state;
}
```

---

## 2.2.8 Summary

| Property/Method | Purpose | Notes |
|-----------------|---------|-------|
| `href` | Complete URL | Read/write |
| `protocol` | Protocol (with `:`) | `https:`, `http:` |
| `host` | Hostname + port | `example.com:8080` |
| `hostname` | Hostname only | `example.com` |
| `port` | Port number | Empty if default |
| `pathname` | Path | Starts with `/` |
| `search` | Query string | Includes `?` |
| `hash` | Fragment | Includes `#` |
| `origin` | Protocol + host | **Read-only** |
| `assign(url)` | Navigate | Creates history entry |
| `replace(url)` | Navigate | No history entry |
| `reload()` | Refresh page | |

### Best Practices

1. **Use `URL` and `URLSearchParams`** for complex manipulation
2. **Use `replace()`** for redirects that shouldn't be in history
3. **Always encode user input** in URLs
4. **Validate redirect targets** to prevent open redirect attacks
5. **Use `hash` changes** for lightweight client-side routing
6. **Combine with History API** for modern SPAs

### Common Gotchas

```javascript
// ❌ Changing any property except hash causes reload
location.pathname = '/new';  // Page reloads!

// ❌ origin is read-only
location.origin = 'https://other.com';  // Error!

// ⚠️ URLSearchParams.get() returns string or null
const page = params.get('page');  // "1" or null
const pageNum = Number(params.get('page')) || 1;  // Safer

// ⚠️ Multiple values need getAll()
params.set('tag', 'a');
params.append('tag', 'b');
params.get('tag');     // "a" (first only!)
params.getAll('tag');  // ["a", "b"]
```

---

**End of Chapter 2.2: Location Object**

Next chapter: **2.3 History Object** — covers browser history manipulation with `pushState`, `replaceState`, `back`, `forward`, and the `popstate` event.
