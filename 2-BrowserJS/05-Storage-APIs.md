# 5.1 Web Storage

Web Storage provides synchronous key-value storage in the browser. This chapter covers localStorage for persistent storage, sessionStorage for session-scoped data, and the storage event for cross-tab synchronization.

---

## 5.1.1 localStorage vs sessionStorage

### localStorage

```javascript
// Persists across browser sessions
// Data survives browser close and reopen

// Set item
localStorage.setItem('username', 'john');

// Get item
const username = localStorage.getItem('username');
console.log(username);  // 'john'

// Remove item
localStorage.removeItem('username');

// Clear all
localStorage.clear();

// Scope: same origin (protocol + domain + port)
// All tabs/windows share localStorage for same origin
```

### sessionStorage

```javascript
// Data persists only for the session (tab lifetime)
// Cleared when tab/window is closed

// Same API as localStorage
sessionStorage.setItem('tempData', 'value');
sessionStorage.getItem('tempData');
sessionStorage.removeItem('tempData');
sessionStorage.clear();

// Scope: same origin AND same tab
// Each tab has its own sessionStorage
// Opening link in new tab copies sessionStorage once, then they're independent
```

### Key Differences

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Persistence | Until manually cleared | Until tab closes |
| Scope | All tabs, same origin | Single tab only |
| Survives browser close | Yes | No |
| Survives page refresh | Yes | Yes |
| Duplicated to new tab | Yes (shared) | Yes (copied once) |

---

## 5.1.2 Basic Operations

### setItem() and getItem()

```javascript
// Set item
localStorage.setItem('key', 'value');

// Get item
const value = localStorage.getItem('key');

// Returns null if key doesn't exist
const missing = localStorage.getItem('nonexistent');
console.log(missing);  // null

// All values are strings!
localStorage.setItem('number', 42);  // Stored as '42'
console.log(localStorage.getItem('number'));  // '42' (string)
console.log(typeof localStorage.getItem('number'));  // 'string'
```

### removeItem()

```javascript
// Remove single item
localStorage.removeItem('key');

// Does nothing if key doesn't exist (no error)
localStorage.removeItem('nonexistent');
```

### clear()

```javascript
// Remove ALL items
localStorage.clear();

// ⚠️ Affects entire origin
// Other scripts/tabs using localStorage will lose data
```

### key() and length

```javascript
// Get number of items
console.log(localStorage.length);  // e.g., 3

// Get key by index
console.log(localStorage.key(0));  // First key
console.log(localStorage.key(1));  // Second key

// Iterate over all items
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}

// Better: use Object.keys()
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)}`);
});
```

### Direct Property Access

```javascript
// Direct property access (shorthand)
localStorage.username = 'john';
console.log(localStorage.username);
delete localStorage.username;

// ⚠️ Not recommended for several reasons:
// 1. Can't access keys named like built-in properties
// 2. Less explicit
// 3. undefined vs null semantics differ

// ❌ Problem with built-in property names
localStorage.length = '100';  // This won't work as expected!
console.log(localStorage.length);  // Returns count, not '100'

// ✅ Always use setItem/getItem methods
localStorage.setItem('length', '100');
```

---

## 5.1.3 Storing Complex Data

### JSON Serialization

```javascript
// Store objects/arrays as JSON
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Serialize to JSON
localStorage.setItem('user', JSON.stringify(user));

// Parse back to object
const storedUser = JSON.parse(localStorage.getItem('user'));
console.log(storedUser.name);  // 'John'
console.log(storedUser.preferences.theme);  // 'dark'
```

### Handling Parse Errors

```javascript
// Safe parsing function
function getJSON(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key}:`, error);
    return defaultValue;
  }
}

// Safe setting function
function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return false;
  }
}

// Usage
setJSON('settings', { theme: 'dark' });
const settings = getJSON('settings', { theme: 'light' });
```

### Storage Wrapper

```javascript
class Storage {
  constructor(storage = localStorage) {
    this.storage = storage;
  }
  
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }
  
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      }
      return false;
    }
  }
  
  remove(key) {
    this.storage.removeItem(key);
  }
  
  clear() {
    this.storage.clear();
  }
  
  has(key) {
    return this.storage.getItem(key) !== null;
  }
  
  keys() {
    return Object.keys(this.storage);
  }
}

// Usage
const store = new Storage(localStorage);
store.set('user', { name: 'John' });
const user = store.get('user');
```

---

## 5.1.4 Storage Event

### Cross-Tab Communication

```javascript
// Fires when localStorage changes in ANOTHER tab/window
window.addEventListener('storage', (e) => {
  console.log('Storage changed!');
  console.log('Key:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
  console.log('URL:', e.url);
  console.log('Storage area:', e.storageArea);
});

// ⚠️ Does NOT fire in the tab that made the change
// Only fires in OTHER tabs/windows with same origin
```

### Event Properties

```javascript
window.addEventListener('storage', (e) => {
  // Key that was changed (null if clear() was called)
  if (e.key === null) {
    console.log('Storage was cleared');
    return;
  }
  
  if (e.key === 'user') {
    const newUser = e.newValue ? JSON.parse(e.newValue) : null;
    updateUserUI(newUser);
  }
});
```

### Syncing State Across Tabs

```javascript
// Update UI when settings change in another tab
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    applyTheme(e.newValue);
  }
  
  if (e.key === 'authToken') {
    if (e.newValue === null) {
      // Logged out in another tab
      redirectToLogin();
    } else if (e.oldValue === null) {
      // Logged in from another tab
      refreshUserState();
    }
  }
});
```

### Broadcasting Messages

```javascript
// Simple cross-tab messaging
function broadcast(type, data) {
  localStorage.setItem('broadcast', JSON.stringify({
    type,
    data,
    timestamp: Date.now()
  }));
  // Remove immediately (the event already fired)
  localStorage.removeItem('broadcast');
}

// Listen for broadcasts
window.addEventListener('storage', (e) => {
  if (e.key === 'broadcast' && e.newValue) {
    const message = JSON.parse(e.newValue);
    handleBroadcast(message);
  }
});

// Usage
broadcast('logout', { userId: 123 });
```

---

## 5.1.5 Storage Limits

### Quota

```javascript
// Typical limits:
// - 5MB per origin (varies by browser)
// - Each character in a string = 2 bytes (UTF-16)

// Check if storage is available
function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      e.code === 22 ||
      e.code === 1014 ||
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ) && storage && storage.length !== 0;
  }
}

if (storageAvailable('localStorage')) {
  // Use localStorage
} else {
  // Fall back to other storage or warn user
}
```

### Handling QuotaExceededError

```javascript
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Storage is full
      console.error('Storage quota exceeded');
      
      // Option 1: Clear old items
      cleanupOldItems();
      
      // Option 2: Warn user
      showStorageWarning();
      
      return false;
    }
    throw error;
  }
}

function cleanupOldItems() {
  // Example: remove items with timestamps older than 7 days
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  Object.keys(localStorage).forEach(key => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (item.timestamp && item.timestamp < oneWeekAgo) {
        localStorage.removeItem(key);
      }
    } catch {
      // Not JSON, skip
    }
  });
}
```

### Estimating Usage

```javascript
// Rough estimate of storage usage
function getStorageSize(storage = localStorage) {
  let total = 0;
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    // Each char is 2 bytes in JS strings (UTF-16)
    total += (key.length + value.length) * 2;
  }
  
  return {
    bytes: total,
    kb: (total / 1024).toFixed(2),
    mb: (total / (1024 * 1024)).toFixed(4)
  };
}

console.log(getStorageSize());
// { bytes: 10240, kb: '10.00', mb: '0.0098' }
```

---

## 5.1.6 Common Patterns

### User Preferences

```javascript
const defaults = {
  theme: 'light',
  fontSize: 16,
  notifications: true,
  language: 'en'
};

function getPreferences() {
  const stored = localStorage.getItem('preferences');
  if (stored) {
    return { ...defaults, ...JSON.parse(stored) };
  }
  return defaults;
}

function setPreference(key, value) {
  const prefs = getPreferences();
  prefs[key] = value;
  localStorage.setItem('preferences', JSON.stringify(prefs));
}

// Usage
const prefs = getPreferences();
setPreference('theme', 'dark');
```

### Draft Auto-Save

```javascript
const form = document.querySelector('form');
const storageKey = `draft-${form.id}`;

// Save draft on input
form.addEventListener('input', () => {
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem(storageKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
});

// Restore draft on load
function restoreDraft() {
  const draft = localStorage.getItem(storageKey);
  if (!draft) return;
  
  const { data, timestamp } = JSON.parse(draft);
  
  // Check if draft is recent (within 24 hours)
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(storageKey);
    return;
  }
  
  // Restore values
  Object.entries(data).forEach(([name, value]) => {
    const field = form.elements[name];
    if (field) field.value = value;
  });
}

// Clear draft on submit
form.addEventListener('submit', () => {
  localStorage.removeItem(storageKey);
});
```

### Cache with Expiry

```javascript
function setWithExpiry(key, value, ttlMs) {
  const item = {
    value,
    expiry: Date.now() + ttlMs
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  const { value, expiry } = JSON.parse(item);
  
  if (Date.now() > expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return value;
}

// Usage
setWithExpiry('cache:api-data', apiResponse, 5 * 60 * 1000);  // 5 minutes
const cached = getWithExpiry('cache:api-data');
```

---

## 5.1.7 Gotchas

```javascript
// ❌ Storing non-strings directly
localStorage.setItem('obj', { a: 1 });
console.log(localStorage.getItem('obj'));  // "[object Object]"

// ✅ Use JSON.stringify
localStorage.setItem('obj', JSON.stringify({ a: 1 }));

// ❌ Not handling null for missing keys
const value = localStorage.getItem('missing').toLowerCase();
// TypeError: Cannot read property 'toLowerCase' of null

// ✅ Check for null
const value = localStorage.getItem('missing');
if (value !== null) {
  console.log(value.toLowerCase());
}

// ❌ Storing sensitive data
localStorage.setItem('password', 'secret123');
// Accessible via DevTools, XSS attacks, extensions

// ✅ Never store sensitive data in localStorage
// Use secure, httpOnly cookies for tokens

// ❌ Relying on localStorage in private/incognito mode
// Some browsers: localStorage throws in private mode
// Safari: localStorage works but is cleared on exit

// ✅ Always check availability
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    // localStorage is available
  } catch (e) {
    // localStorage not available
  }
}
```

---

## 5.1.8 Summary

### Methods

| Method | Description |
|--------|-------------|
| `setItem(key, value)` | Store value |
| `getItem(key)` | Retrieve value (or null) |
| `removeItem(key)` | Delete key |
| `clear()` | Delete all keys |
| `key(index)` | Get key by index |
| `length` | Number of items |

### localStorage vs sessionStorage

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Lifetime | Permanent | Session (tab) |
| Scope | All tabs | Single tab |
| Storage event | Yes | Yes |

### Storage Event Properties

| Property | Description |
|----------|-------------|
| `key` | Changed key (null if clear) |
| `oldValue` | Previous value |
| `newValue` | New value |
| `url` | Page URL |
| `storageArea` | Storage object |

### Best Practices

1. **Always use JSON** for objects/arrays
2. **Handle QuotaExceededError** for large data
3. **Never store sensitive data** (passwords, tokens)
4. **Check availability** before using
5. **Use storage event** for cross-tab sync
6. **Implement expiry** for cached data

---

**End of Chapter 5.1: Web Storage**

Next chapter: **5.2 Cookies** — covers reading, writing, and managing cookies with JavaScript.
# 5.2 Cookies

Cookies provide small pieces of data stored by the browser and sent with every HTTP request to the same domain. This chapter covers reading, writing, and managing cookies via JavaScript, including security attributes and best practices.

---

## 5.2.1 What Are Cookies?

### Cookie Basics

```javascript
// Cookies are:
// - Small text strings (up to ~4KB)
// - Sent with every HTTP request to the origin
// - Accessible via document.cookie
// - Set by server (Set-Cookie header) or client (document.cookie)

// Reading all cookies
console.log(document.cookie);
// "username=john; theme=dark; sessionId=abc123"

// Cookies are name=value pairs separated by "; "
```

### Cookies vs Web Storage

| Feature | Cookies | localStorage | sessionStorage |
|---------|---------|--------------|----------------|
| Size limit | ~4KB | ~5MB | ~5MB |
| Sent with requests | Yes | No | No |
| Server access | Yes | No | No |
| Expiration | Configurable | None | Session |
| API | String-based | Key-value | Key-value |

---

## 5.2.2 Reading Cookies

### Basic Reading

```javascript
// All cookies as single string
const allCookies = document.cookie;
// "name=value; name2=value2"

// Parse to object
function getCookies() {
  const cookies = {};
  
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.split('=').map(s => s.trim());
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
}

// Get single cookie
function getCookie(name) {
  const cookies = getCookies();
  return cookies[name] || null;
}

// Usage
const username = getCookie('username');
```

### Regex Approach

```javascript
function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(^| )' + name + '=([^;]+)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}

// More robust regex
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  return null;
}
```

---

## 5.2.3 Writing Cookies

### Basic Cookie

```javascript
// Set a simple cookie
document.cookie = "username=john";

// ⚠️ This doesn't replace all cookies!
// It only adds or updates this specific cookie

// With value encoding (important for special characters)
document.cookie = `username=${encodeURIComponent('John Doe')}`;
```

### Cookie Attributes

```javascript
// Full cookie with attributes
document.cookie = [
  `token=${encodeURIComponent(value)}`,
  'max-age=3600',          // Expires in 1 hour
  'path=/',                // Available to entire site
  'secure',                // HTTPS only
  'samesite=strict'        // CSRF protection
].join('; ');

// Using expires (date string)
const date = new Date();
date.setTime(date.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days
document.cookie = `username=john; expires=${date.toUTCString()}`;

// Using max-age (seconds)
document.cookie = "username=john; max-age=604800";  // 7 days in seconds
```

### Cookie Helper Function

```javascript
function setCookie(name, value, options = {}) {
  const {
    days,
    maxAge,
    path = '/',
    domain,
    secure = false,
    sameSite = 'Lax',
    httpOnly // Can't be set via JS, included for completeness
  } = options;
  
  let cookie = `${name}=${encodeURIComponent(value)}`;
  
  if (days !== undefined) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    cookie += `; expires=${date.toUTCString()}`;
  }
  
  if (maxAge !== undefined) {
    cookie += `; max-age=${maxAge}`;
  }
  
  cookie += `; path=${path}`;
  
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  
  if (secure || sameSite === 'None') {
    cookie += '; secure';
  }
  
  cookie += `; samesite=${sameSite}`;
  
  document.cookie = cookie;
}

// Usage
setCookie('theme', 'dark', { days: 30 });
setCookie('token', 'abc123', { maxAge: 3600, secure: true });
```

---

## 5.2.4 Cookie Attributes

### expires

```javascript
// Absolute expiration date
const date = new Date('2025-12-31T23:59:59');
document.cookie = `promo=summer; expires=${date.toUTCString()}`;

// If no expires or max-age: session cookie (deleted on browser close)
document.cookie = "session=temp";  // Session cookie
```

### max-age

```javascript
// Seconds until expiration
document.cookie = "cache=data; max-age=3600";     // 1 hour
document.cookie = "cache=data; max-age=86400";    // 1 day
document.cookie = "cache=data; max-age=604800";   // 1 week

// max-age=0 or negative: delete cookie
document.cookie = "cache=; max-age=0";
```

### path

```javascript
// Restrict cookie to specific path
document.cookie = "data=value; path=/admin";
// Cookie only sent for requests to /admin/*

// Default: current path
// path=/ makes cookie available site-wide
document.cookie = "data=value; path=/";
```

### domain

```javascript
// Default: exact domain only
document.cookie = "data=value";
// Only sent to exact origin domain

// Include subdomains
document.cookie = "data=value; domain=.example.com";
// Sent to example.com, www.example.com, api.example.com

// Can only set for current domain or parent
// Can't set cookies for different domains
```

### secure

```javascript
// Only send over HTTPS
document.cookie = "token=secret; secure";

// Required for SameSite=None
document.cookie = "tracking=id; secure; samesite=none";

// ⚠️ In development (http://localhost), secure might be ignored
```

### samesite

```javascript
// SameSite=Strict: only same-site requests
document.cookie = "csrf=token; samesite=strict";
// Won't be sent when clicking link from another site

// SameSite=Lax (default): same-site + top-level navigation
document.cookie = "session=abc; samesite=lax";
// Sent when clicking link from another site, but not for POST

// SameSite=None: always sent (requires secure)
document.cookie = "tracking=id; samesite=none; secure";
// Sent on all cross-site requests
```

### httpOnly

```javascript
// ⚠️ Can only be set by server (Set-Cookie header)
// Not accessible via document.cookie
// Protects against XSS attacks

// Set-Cookie: sessionId=abc123; HttpOnly
// JavaScript cannot read this cookie
```

---

## 5.2.5 Deleting Cookies

```javascript
// Delete by setting expired date
document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC";

// Or use max-age
document.cookie = "username=; max-age=0";

// Must match path and domain!
document.cookie = "username=; max-age=0; path=/; domain=.example.com";

// Helper function
function deleteCookie(name, path = '/', domain) {
  let cookie = `${name}=; max-age=0; path=${path}`;
  if (domain) {
    cookie += `; domain=${domain}`;
  }
  document.cookie = cookie;
}
```

---

## 5.2.6 Cookie Class

```javascript
class CookieManager {
  static get(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(';').shift());
    }
    return null;
  }
  
  static set(name, value, options = {}) {
    const {
      days,
      maxAge,
      path = '/',
      domain,
      secure = location.protocol === 'https:',
      sameSite = 'Lax'
    } = options;
    
    let cookie = `${name}=${encodeURIComponent(value)}`;
    
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookie += `; expires=${date.toUTCString()}`;
    }
    
    if (maxAge) cookie += `; max-age=${maxAge}`;
    cookie += `; path=${path}`;
    if (domain) cookie += `; domain=${domain}`;
    if (secure) cookie += '; secure';
    cookie += `; samesite=${sameSite}`;
    
    document.cookie = cookie;
  }
  
  static delete(name, options = {}) {
    this.set(name, '', { ...options, maxAge: 0 });
  }
  
  static getAll() {
    const cookies = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.split('=').map(s => s.trim());
      if (name) cookies[name] = decodeURIComponent(value);
    });
    return cookies;
  }
  
  static has(name) {
    return this.get(name) !== null;
  }
}

// Usage
CookieManager.set('theme', 'dark', { days: 30 });
const theme = CookieManager.get('theme');
CookieManager.delete('theme');
```

---

## 5.2.7 Security Considerations

### XSS Protection

```javascript
// ❌ HttpOnly cookies cannot be read by JavaScript
// This is good for session tokens!

// ❌ Don't store sensitive data in JS-accessible cookies
document.cookie = "password=secret123";  // Never do this!

// ✅ Use HttpOnly for session tokens (server-side)
// Set-Cookie: sessionId=abc123; HttpOnly; Secure

// ✅ Sanitize any cookie values before using
const userInput = getCookie('data');
const sanitized = sanitizeHTML(userInput);
```

### CSRF Protection

```javascript
// SameSite attribute helps prevent CSRF
document.cookie = "csrfToken=abc; samesite=strict; secure";

// For forms, include CSRF token
const csrfToken = getCookie('csrfToken');
fetch('/api/action', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: data
});
```

### Secure Flag

```javascript
// Always use Secure for sensitive cookies
document.cookie = "auth=token; secure; samesite=strict";

// Only exception: development on localhost
// (though modern browsers often treat localhost as secure context)
```

---

## 5.2.8 Common Patterns

### Consent Banner

```javascript
function hasConsentCookie() {
  return CookieManager.has('cookie_consent');
}

function setConsent(accepted) {
  CookieManager.set('cookie_consent', accepted ? 'accepted' : 'declined', {
    days: 365,
    sameSite: 'Lax'
  });
}

// Show banner if no consent
if (!hasConsentCookie()) {
  showConsentBanner({
    onAccept: () => {
      setConsent(true);
      enableAnalytics();
    },
    onDecline: () => {
      setConsent(false);
    }
  });
}
```

### Remember Me

```javascript
// Login with remember me
async function login(username, password, rememberMe) {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    credentials: 'include'  // Include cookies
  });
  
  if (response.ok && rememberMe) {
    CookieManager.set('remember_user', username, { days: 30 });
  }
}

// Auto-fill on load
const rememberedUser = CookieManager.get('remember_user');
if (rememberedUser) {
  document.querySelector('#username').value = rememberedUser;
}
```

### Theme Preference

```javascript
// Set theme and remember
function setTheme(theme) {
  document.body.dataset.theme = theme;
  CookieManager.set('theme', theme, { days: 365 });
}

// Apply saved theme
const savedTheme = CookieManager.get('theme') || 'light';
setTheme(savedTheme);
```

---

## 5.2.9 Gotchas

```javascript
// ❌ Forgetting to encode special characters
document.cookie = "name=John Doe; age=30";
// This creates TWO cookies! (space and ; are special)

// ✅ Always encode values
document.cookie = `name=${encodeURIComponent('John Doe; age=30')}`;

// ❌ Expecting document.cookie = "..." to replace all cookies
document.cookie = "new=value";
// This adds/updates ONE cookie, doesn't clear others

// ❌ Setting cookies for different domain
document.cookie = "data=value; domain=google.com";
// Won't work - can only set for current domain or parent

// ❌ Deleting cookie without matching path/domain
document.cookie = "token=; max-age=0";  // Might not work!
// If cookie was set with path=/admin, must delete with same path
document.cookie = "token=; max-age=0; path=/admin";

// ❌ Trying to read HttpOnly cookies
const session = getCookie('sessionId');  // Returns null
// HttpOnly cookies are invisible to JavaScript

// ❌ SameSite=None without Secure
document.cookie = "cross=site; samesite=none";
// Will be rejected by browser - requires secure flag
```

---

## 5.2.10 Summary

### Cookie Attributes

| Attribute | Description |
|-----------|-------------|
| `expires` | Expiration date (GMT) |
| `max-age` | Seconds until expiration |
| `path` | URL path scope |
| `domain` | Domain scope (includes subdomains) |
| `secure` | HTTPS only |
| `samesite` | CSRF protection (Strict/Lax/None) |
| `httponly` | Server-only (can't set via JS) |

### SameSite Values

| Value | Behavior |
|-------|----------|
| `Strict` | Same-site requests only |
| `Lax` | Same-site + navigation (default) |
| `None` | All requests (requires Secure) |

### Best Practices

1. **Always encode values** with `encodeURIComponent`
2. **Use Secure flag** for sensitive cookies
3. **Use HttpOnly** for session tokens (server-side)
4. **Use SameSite** for CSRF protection
5. **Match path/domain** when deleting
6. **Don't store sensitive data** in JS-accessible cookies

---

**End of Chapter 5.2: Cookies**

Next chapter: **5.3 IndexedDB** — covers the indexed database API for structured client-side storage.
# 5.3 IndexedDB

IndexedDB is a low-level API for client-side storage of significant amounts of structured data. This chapter covers databases, object stores, transactions, indexes, and common patterns for working with IndexedDB.

---

## 5.3.1 IndexedDB Overview

### What Is IndexedDB?

```javascript
// IndexedDB is:
// - A transactional database in the browser
// - Key-value store with indexes
// - Supports large amounts of data (no fixed limit)
// - Asynchronous (event-based API)
// - Same-origin policy (data private to origin)

// When to use IndexedDB:
// - Large datasets (>5MB)
// - Structured data with queries
// - Offline-first applications
// - Complex data relationships
```

### IndexedDB vs Other Storage

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| Size limit | ~5MB | No fixed limit |
| Data types | Strings only | Structured data |
| Async | No | Yes |
| Indexes | No | Yes |
| Transactions | No | Yes |
| Queries | No | Yes |

---

## 5.3.2 Opening a Database

### Basic Open

```javascript
// Open database (creates if doesn't exist)
const request = indexedDB.open('myDatabase', 1);

request.onerror = (event) => {
  console.error('Database error:', event.target.error);
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Database opened:', db.name);
};

// Called when database is created or version increases
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // Create object stores here
};
```

### Version Management

```javascript
// Version number determines schema
const request = indexedDB.open('myDatabase', 2);  // Version 2

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion;
  
  console.log(`Upgrading from v${oldVersion} to v${newVersion}`);
  
  // Migration logic
  if (oldVersion < 1) {
    // Initial setup
    db.createObjectStore('users', { keyPath: 'id' });
  }
  
  if (oldVersion < 2) {
    // Add new store or index
    const store = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
    store.createIndex('userId', 'userId', { unique: false });
  }
};
```

---

## 5.3.3 Object Stores

### Creating Object Stores

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // With explicit key path
  const usersStore = db.createObjectStore('users', { 
    keyPath: 'id' 
  });
  
  // With auto-increment key
  const logsStore = db.createObjectStore('logs', { 
    autoIncrement: true 
  });
  
  // With key generator and key path
  const postsStore = db.createObjectStore('posts', { 
    keyPath: 'id', 
    autoIncrement: true 
  });
  
  // Add indexes
  usersStore.createIndex('email', 'email', { unique: true });
  usersStore.createIndex('name', 'name', { unique: false });
  postsStore.createIndex('userId', 'userId', { unique: false });
  postsStore.createIndex('createdAt', 'createdAt', { unique: false });
};
```

### Deleting Object Stores

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // Delete existing store
  if (db.objectStoreNames.contains('oldStore')) {
    db.deleteObjectStore('oldStore');
  }
};
```

---

## 5.3.4 Basic CRUD Operations

### Create (Add/Put)

```javascript
// Add new record (fails if key exists)
function addUser(db, user) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.add(user);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Put record (adds or updates)
function putUser(db, user) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.put(user);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Usage
await addUser(db, { id: 1, name: 'John', email: 'john@example.com' });
await putUser(db, { id: 1, name: 'John Doe', email: 'john@example.com' });
```

### Read (Get/GetAll)

```javascript
// Get single record by key
function getUser(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all records
function getAllUsers(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get with limit
function getUsers(db, limit) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.getAll(null, limit);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### Update

```javascript
// Update = get + modify + put
async function updateUser(db, id, updates) {
  const user = await getUser(db, id);
  if (!user) throw new Error('User not found');
  
  const updated = { ...user, ...updates };
  await putUser(db, updated);
  
  return updated;
}
```

### Delete

```javascript
// Delete single record
function deleteUser(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all records
function clearUsers(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

---

## 5.3.5 Indexes

### Creating Indexes

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('products', { keyPath: 'id' });
  
  // Single property index
  store.createIndex('category', 'category', { unique: false });
  
  // Unique index
  store.createIndex('sku', 'sku', { unique: true });
  
  // Compound index
  store.createIndex('category_price', ['category', 'price'], { unique: false });
  
  // Multi-entry index (for arrays)
  store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
};
```

### Querying by Index

```javascript
// Get by index
function getProductsByCategory(db, category) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const index = store.index('category');
    
    const request = index.getAll(category);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get one by index
function getProductBySku(db, sku) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const index = store.index('sku');
    
    const request = index.get(sku);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

---

## 5.3.6 Cursors

### Basic Cursor

```javascript
// Iterate with cursor
function iterateUsers(db, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      
      if (cursor) {
        callback(cursor.value, cursor.key);
        cursor.continue();  // Move to next
      } else {
        resolve();  // No more results
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Usage
await iterateUsers(db, (user, key) => {
  console.log(key, user.name);
});
```

### Cursor Direction

```javascript
// Forward (default)
store.openCursor(null, 'next');

// Backward
store.openCursor(null, 'prev');

// Forward, skip duplicates
store.openCursor(null, 'nextunique');

// Backward, skip duplicates
store.openCursor(null, 'prevunique');
```

### Cursor with Range

```javascript
// Key ranges
const range = IDBKeyRange.bound(1, 100);      // 1 <= key <= 100
const rangeOpen = IDBKeyRange.bound(1, 100, true, true);  // 1 < key < 100
const rangeOnly = IDBKeyRange.only(5);        // key === 5
const rangeLower = IDBKeyRange.lowerBound(10);  // key >= 10
const rangeUpper = IDBKeyRange.upperBound(50);  // key <= 50

// Use with cursor
store.openCursor(IDBKeyRange.lowerBound(10));

// Get all in range
store.getAll(IDBKeyRange.bound(1, 100));
```

---

## 5.3.7 Transactions

### Transaction Modes

```javascript
// Readonly - multiple stores, concurrent
const readTx = db.transaction(['users', 'posts'], 'readonly');

// Readwrite - multiple stores, exclusive
const writeTx = db.transaction(['users', 'posts'], 'readwrite');

// Transaction auto-completes when all requests finish
writeTx.oncomplete = () => console.log('Transaction completed');
writeTx.onerror = (event) => console.error('Transaction failed:', event.target.error);
writeTx.onabort = () => console.log('Transaction aborted');

// Abort transaction manually
writeTx.abort();
```

### Multi-Store Transaction

```javascript
async function transferPost(db, postId, fromUserId, toUserId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['users', 'posts'], 'readwrite');
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    
    const usersStore = tx.objectStore('users');
    const postsStore = tx.objectStore('posts');
    
    // Get post
    const getPost = postsStore.get(postId);
    getPost.onsuccess = () => {
      const post = getPost.result;
      
      if (post.userId !== fromUserId) {
        tx.abort();
        return;
      }
      
      // Update post
      post.userId = toUserId;
      postsStore.put(post);
    };
  });
}
```

---

## 5.3.8 Promise Wrapper

```javascript
class IndexedDBStore {
  constructor(dbName, version, onUpgrade) {
    this.dbName = dbName;
    this.version = version;
    this.onUpgrade = onUpgrade;
    this.db = null;
  }
  
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        this.onUpgrade(event.target.result, event);
      };
    });
  }
  
  async get(storeName, key) {
    return this._request(storeName, 'readonly', store => store.get(key));
  }
  
  async getAll(storeName, query, count) {
    return this._request(storeName, 'readonly', store => store.getAll(query, count));
  }
  
  async add(storeName, value) {
    return this._request(storeName, 'readwrite', store => store.add(value));
  }
  
  async put(storeName, value) {
    return this._request(storeName, 'readwrite', store => store.put(value));
  }
  
  async delete(storeName, key) {
    return this._request(storeName, 'readwrite', store => store.delete(key));
  }
  
  async clear(storeName) {
    return this._request(storeName, 'readwrite', store => store.clear());
  }
  
  async getByIndex(storeName, indexName, value) {
    return this._request(storeName, 'readonly', store => 
      store.index(indexName).getAll(value)
    );
  }
  
  async _request(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Usage
const store = new IndexedDBStore('myApp', 1, (db) => {
  db.createObjectStore('users', { keyPath: 'id' });
});

await store.open();
await store.add('users', { id: 1, name: 'John' });
const users = await store.getAll('users');
```

---

## 5.3.9 Common Patterns

### Offline Data Sync

```javascript
class OfflineSync {
  constructor(db, storeName) {
    this.db = db;
    this.storeName = storeName;
    this.pendingStore = `${storeName}_pending`;
  }
  
  async save(item) {
    // Save locally
    await this.db.put(this.storeName, item);
    
    // Queue for sync
    await this.db.add(this.pendingStore, {
      id: Date.now(),
      action: 'update',
      item
    });
    
    // Try to sync
    this.sync();
  }
  
  async sync() {
    if (!navigator.onLine) return;
    
    const pending = await this.db.getAll(this.pendingStore);
    
    for (const action of pending) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(action)
        });
        
        await this.db.delete(this.pendingStore, action.id);
      } catch (error) {
        // Will retry on next sync
        console.error('Sync failed:', error);
      }
    }
  }
}
```

---

## 5.3.10 Gotchas

```javascript
// ❌ Forgetting onupgradeneeded for new stores
// Stores can only be created in onupgradeneeded

// ❌ Using transaction after it completes
const tx = db.transaction('users', 'readwrite');
const store = tx.objectStore('users');
await someAsyncOperation();  // Transaction is now complete!
store.add(user);  // Error: transaction inactive

// ✅ Keep transaction active or create new one
const tx = db.transaction('users', 'readwrite');
store.add(user);
// All operations must be synchronous within transaction

// ❌ Not handling version conflicts
// If another tab has DB open at old version, upgrade blocks

// ✅ Handle blocked event
request.onblocked = () => {
  alert('Please close other tabs with this app');
};

// ❌ Storing non-cloneable objects
store.add({ fn: () => {} });  // Error: functions can't be cloned

// ✅ Only store cloneable data
store.add({ data: 'serializable' });
```

---

## 5.3.11 Summary

### Key Concepts

| Concept | Description |
|---------|-------------|
| Database | Container for object stores |
| Object Store | Table-like collection |
| Index | Secondary lookup key |
| Transaction | Atomic operation group |
| Cursor | Iterator for records |

### Transaction Modes

| Mode | Description |
|------|-------------|
| `readonly` | Read-only, allows concurrency |
| `readwrite` | Read/write, exclusive access |

### Key Range Methods

| Method | Range |
|--------|-------|
| `only(value)` | Exact match |
| `lowerBound(x)` | `>= x` |
| `upperBound(x)` | `<= x` |
| `bound(x, y)` | `x <= key <= y` |

### Best Practices

1. **Always handle errors** on requests and transactions
2. **Use version numbers** for schema migrations
3. **Keep transactions short** - they auto-complete
4. **Use indexes** for querying non-key properties
5. **Wrap in Promises** for easier async/await usage
6. **Handle `blocked` event** for multi-tab scenarios

---

**End of Chapter 5.3: IndexedDB**

Next chapter: **5.4 Cache API** — covers the Cache API for storing request/response pairs.
# 5.4 Cache API

The Cache API provides a mechanism for storing HTTP request/response pairs, designed primarily for Service Workers but also available in the main thread. This chapter covers cache operations, caching strategies, and integration with Service Workers.

---

## 5.4.1 Cache API Overview

### What Is the Cache API?

```javascript
// The Cache API:
// - Stores Request/Response pairs
// - Designed for offline-first applications
// - Works in main thread and Service Workers
// - Part of the Service Worker spec
// - Promise-based asynchronous API

// Primary use cases:
// - Caching static assets (HTML, CSS, JS, images)
// - Offline support for web apps
// - Performance optimization
// - Network fallback strategies
```

### Cache API vs Other Storage

| Feature | Cache API | IndexedDB | localStorage |
|---------|-----------|-----------|--------------|
| Data type | Request/Response | Any cloneable | Strings |
| Size limit | Large | Large | ~5MB |
| Use case | HTTP caching | Structured data | Simple data |
| Async | Yes | Yes | No |

---

## 5.4.2 Opening Caches

### caches.open()

```javascript
// Open (or create) a named cache
const cache = await caches.open('my-cache-v1');

// Returns a Cache object
console.log(cache);  // Cache {}
```

### caches.keys()

```javascript
// List all cache names
const cacheNames = await caches.keys();
console.log(cacheNames);  // ['my-cache-v1', 'my-cache-v2']
```

### caches.has()

```javascript
// Check if cache exists
const exists = await caches.has('my-cache-v1');
console.log(exists);  // true or false
```

### caches.delete()

```javascript
// Delete a cache
const deleted = await caches.delete('my-cache-v1');
console.log(deleted);  // true if existed and deleted
```

---

## 5.4.3 Cache Operations

### cache.add()

```javascript
// Fetch and cache a single request
const cache = await caches.open('static-v1');

// Add by URL
await cache.add('/styles/main.css');

// Add by Request object
await cache.add(new Request('/api/data'));

// Fails if fetch fails or non-2xx response
```

### cache.addAll()

```javascript
// Cache multiple resources at once
const cache = await caches.open('static-v1');

await cache.addAll([
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js',
  '/images/logo.png'
]);

// ⚠️ Fails entirely if any request fails
// All-or-nothing operation
```

### cache.put()

```javascript
// Manually add request/response pair
const cache = await caches.open('dynamic-v1');

// Fetch then put
const response = await fetch('/api/data');
await cache.put('/api/data', response);

// ⚠️ Response can only be used once!
// Clone if you need to use it elsewhere
const response = await fetch('/api/data');
await cache.put('/api/data', response.clone());
return response;

// Create custom response
const customResponse = new Response(
  JSON.stringify({ cached: true }),
  { headers: { 'Content-Type': 'application/json' } }
);
await cache.put('/api/cached', customResponse);
```

### cache.match()

```javascript
// Find matching response
const cache = await caches.open('static-v1');

// Match by URL
const response = await cache.match('/styles/main.css');

if (response) {
  console.log('Cache hit!');
  return response;
} else {
  console.log('Cache miss');
}

// Match by Request
const request = new Request('/api/data');
const response = await cache.match(request);
```

### caches.match()

```javascript
// Search ALL caches for match
const response = await caches.match('/styles/main.css');

// Returns first match found
// More convenient but less explicit
```

### cache.matchAll()

```javascript
// Get all matching responses
const responses = await cache.matchAll('/api/data');

// Useful when multiple versions might exist
console.log(responses.length);
```

### cache.keys()

```javascript
// List all cached requests
const cache = await caches.open('static-v1');
const requests = await cache.keys();

requests.forEach(request => {
  console.log(request.url);
});
```

### cache.delete()

```javascript
// Remove item from cache
const cache = await caches.open('static-v1');

// Delete by URL
const deleted = await cache.delete('/old-file.js');
console.log(deleted);  // true if existed

// Delete by Request
await cache.delete(new Request('/api/data'));
```

---

## 5.4.4 Match Options

### ignoreSearch

```javascript
// Ignore query string when matching
const cache = await caches.open('pages-v1');
await cache.put('/page?v=1', response1);

// Default: won't match different query
const miss = await cache.match('/page?v=2');  // undefined

// With ignoreSearch: matches
const hit = await cache.match('/page?v=2', { ignoreSearch: true });
```

### ignoreMethod

```javascript
// Ignore HTTP method
// Default: GET requests match GET cached responses

// Match POST with cached GET
const response = await cache.match(
  new Request('/api/data', { method: 'POST' }),
  { ignoreMethod: true }
);
```

### ignoreVary

```javascript
// Ignore Vary header
// Default: respects Vary header for cache matching

const response = await cache.match('/api/data', { ignoreVary: true });
```

---

## 5.4.5 Service Worker Integration

### Precaching on Install

```javascript
// In service-worker.js
const CACHE_NAME = 'static-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/scripts/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
```

### Cache-First Strategy

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cache if found
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise fetch from network
        return fetch(event.request);
      })
  );
});
```

### Network-First Strategy

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone response before caching
        const responseClone = response.clone();
        
        caches.open('dynamic-v1')
          .then(cache => cache.put(event.request, responseClone));
        
        return response;
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});
```

### Stale-While-Revalidate

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic-v1').then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // Start network fetch regardless
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        
        // Return cached immediately, update in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
```

---

## 5.4.6 Cache Versioning

### Managing Cache Versions

```javascript
const CACHE_VERSION = 'v2';
const CACHE_NAME = `static-${CACHE_VERSION}`;

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('static-'))
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### Multiple Named Caches

```javascript
const CACHES = {
  static: 'static-v2',
  dynamic: 'dynamic-v1',
  images: 'images-v1'
};

// Use appropriate cache for each resource type
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  if (url.pathname.match(/\.(jpg|png|gif|svg)$/)) {
    event.respondWith(imageStrategy(event.request, CACHES.images));
  } else if (url.pathname.startsWith('/api/')) {
    event.respondWith(apiStrategy(event.request, CACHES.dynamic));
  } else {
    event.respondWith(staticStrategy(event.request, CACHES.static));
  }
});
```

---

## 5.4.7 Common Patterns

### Offline Fallback

```javascript
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-v1')
      .then(cache => cache.add(OFFLINE_URL))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(OFFLINE_URL))
    );
  }
});
```

### Cache with Size Limit

```javascript
async function cacheLimited(cacheName, request, response, maxItems = 50) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  // Remove oldest if at limit
  if (keys.length >= maxItems) {
    await cache.delete(keys[0]);
  }
  
  await cache.put(request, response);
}
```

### Main Thread Usage

```javascript
// Cache API works in main thread too
async function preCacheResources() {
  const cache = await caches.open('prefetch-v1');
  
  // Prefetch resources user might need
  await cache.addAll([
    '/next-page.html',
    '/heavy-image.jpg'
  ]);
}

// Check cache before fetching
async function getFromCacheOrNetwork(url) {
  const cached = await caches.match(url);
  if (cached) return cached;
  
  const response = await fetch(url);
  const cache = await caches.open('dynamic-v1');
  cache.put(url, response.clone());
  
  return response;
}
```

---

## 5.4.8 Gotchas

```javascript
// ❌ Using response without cloning
const response = await fetch('/api/data');
cache.put('/api/data', response);
return response;  // Error: body already used!

// ✅ Clone before caching
const response = await fetch('/api/data');
cache.put('/api/data', response.clone());
return response;

// ❌ Caching opaque responses carelessly
// Cross-origin responses without CORS have opaque type
// They report status 0, can't read body, but CAN be cached
const response = await fetch('https://other-site.com/image.jpg', { mode: 'no-cors' });
// This caches even if response was an error!
cache.put('/fallback', response);

// ✅ Check response status for same-origin
if (response.ok) {
  cache.put(request, response.clone());
}

// ❌ Assuming cache.addAll is partial
await cache.addAll(['/a', '/b', '/c']);
// If /b fails, NOTHING is cached

// ✅ Cache individually if partial success needed
for (const url of urls) {
  try {
    await cache.add(url);
  } catch (e) {
    console.log(`Failed to cache ${url}`);
  }
}

// ❌ Not versioning caches
// Old cached content persists forever

// ✅ Use versioned cache names and cleanup
const CACHE_NAME = 'static-v2';
// Clean old versions on activate
```

---

## 5.4.9 Summary

### CacheStorage Methods

| Method | Description |
|--------|-------------|
| `caches.open(name)` | Open/create cache |
| `caches.match(request)` | Search all caches |
| `caches.has(name)` | Check if cache exists |
| `caches.keys()` | List cache names |
| `caches.delete(name)` | Delete cache |

### Cache Methods

| Method | Description |
|--------|-------------|
| `add(request)` | Fetch and cache |
| `addAll(requests)` | Fetch and cache multiple |
| `put(request, response)` | Store pair directly |
| `match(request)` | Find response |
| `matchAll(request)` | Find all responses |
| `keys()` | List cached requests |
| `delete(request)` | Remove from cache |

### Caching Strategies

| Strategy | Use Case |
|----------|----------|
| Cache-first | Static assets, offline-first |
| Network-first | API data, fresh content |
| Stale-while-revalidate | Balance freshness/speed |
| Network-only | Never cache |
| Cache-only | Pre-cached content only |

### Best Practices

1. **Version your caches** and clean old versions
2. **Clone responses** before caching
3. **Handle failures** in addAll
4. **Use appropriate strategies** for different resources
5. **Limit cache size** for dynamic content

---

**End of Chapter 5.4: Cache API**

Next chapter: **5.5 Storage Manager** — covers the Storage Manager API for checking and managing storage quota.
# 5.5 Storage Manager

The Storage Manager API provides methods to check storage quota, estimate usage, and request persistent storage. This chapter covers querying storage capacity, requesting persistence, and managing storage across different browser storage mechanisms.

---

## 5.5.1 Storage Manager Overview

### What Is Storage Manager?

```javascript
// Storage Manager API (navigator.storage):
// - Estimate storage quota and usage
// - Request persistent storage
// - Check persistence status
// - Unified across all storage types

// Covers all storage:
// - IndexedDB
// - Cache API
// - Service Worker registrations
// - Cookies (conceptually)
// - Web Storage (localStorage/sessionStorage)

// Access the API
const storage = navigator.storage;
```

### Browser Support

```javascript
// Check if Storage Manager is available
if ('storage' in navigator && 'estimate' in navigator.storage) {
  // Use Storage Manager API
  const estimate = await navigator.storage.estimate();
} else {
  // Fallback for older browsers
  console.log('Storage Manager not supported');
}
```

---

## 5.5.2 Estimating Storage

### navigator.storage.estimate()

```javascript
// Get storage quota and usage
const estimate = await navigator.storage.estimate();

console.log('Quota:', estimate.quota);           // Total available bytes
console.log('Usage:', estimate.usage);           // Currently used bytes
console.log('Available:', estimate.quota - estimate.usage);

// Format for display
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  
  return `${bytes.toFixed(2)} ${units[i]}`;
}

console.log(`Used: ${formatBytes(estimate.usage)} of ${formatBytes(estimate.quota)}`);
// "Used: 15.50 MB of 2.00 GB"
```

### Usage Breakdown

```javascript
// Some browsers provide usage breakdown
const estimate = await navigator.storage.estimate();

if (estimate.usageDetails) {
  console.log('IndexedDB:', formatBytes(estimate.usageDetails.indexedDB || 0));
  console.log('Cache API:', formatBytes(estimate.usageDetails.caches || 0));
  console.log('Service Workers:', formatBytes(estimate.usageDetails.serviceWorkerRegistrations || 0));
}

// Example output:
// IndexedDB: 10.25 MB
// Cache API: 5.10 MB
// Service Workers: 0.15 MB
```

### Usage Percentage

```javascript
async function getStorageUsage() {
  const estimate = await navigator.storage.estimate();
  
  return {
    quota: estimate.quota,
    usage: estimate.usage,
    available: estimate.quota - estimate.usage,
    percentUsed: (estimate.usage / estimate.quota) * 100,
    percentAvailable: ((estimate.quota - estimate.usage) / estimate.quota) * 100
  };
}

const usage = await getStorageUsage();
console.log(`${usage.percentUsed.toFixed(2)}% used`);  // "0.75% used"
```

---

## 5.5.3 Persistent Storage

### Understanding Persistence

```javascript
// Browser storage is by default "best-effort"
// Browser may clear it under storage pressure:
// - Low disk space
// - User hasn't visited in a while
// - Storage quota exceeded

// Persistent storage survives storage pressure
// Only cleared by user action or explicit code

// Benefits of persistence:
// - Data won't be evicted automatically
// - More reliable for important data
// - User has more control
```

### Checking Persistence

```javascript
// Check if storage is persistent
const isPersisted = await navigator.storage.persisted();

if (isPersisted) {
  console.log('Storage is persistent');
} else {
  console.log('Storage may be cleared by browser');
}
```

### Requesting Persistence

```javascript
// Request persistent storage
const granted = await navigator.storage.persist();

if (granted) {
  console.log('Persistence granted!');
} else {
  console.log('Persistence denied');
}
```

### Persistence Criteria

```javascript
// Browsers decide persistence based on various factors:
// Chrome: 
// - Site is bookmarked
// - Has high engagement
// - Has push notifications enabled
// - Added to homescreen

// Firefox:
// - Prompts user

// Safari:
// - Limited persistence support

// Example: Request after user action
async function enablePersistence() {
  // First check if already persisted
  if (await navigator.storage.persisted()) {
    return true;
  }
  
  // Request persistence
  const granted = await navigator.storage.persist();
  
  if (!granted) {
    // Notify user they might lose data
    showWarning('Your data may be cleared by the browser under low storage conditions.');
  }
  
  return granted;
}
```

---

## 5.5.4 Storage Quota Management

### Handling Quota Exceeded

```javascript
async function safeStore(key, data) {
  try {
    await storeData(key, data);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Try to free up space
      await cleanupOldData();
      
      // Retry
      try {
        await storeData(key, data);
        return true;
      } catch (retryError) {
        console.error('Still quota exceeded after cleanup');
        return false;
      }
    }
    throw error;
  }
}
```

### Proactive Quota Management

```javascript
async function checkAndManageStorage() {
  const { usage, quota } = await navigator.storage.estimate();
  const percentUsed = (usage / quota) * 100;
  
  if (percentUsed > 80) {
    console.warn('Storage over 80% - consider cleanup');
    await cleanupCaches();
  }
  
  if (percentUsed > 95) {
    console.error('Storage critical - performing emergency cleanup');
    await emergencyCleanup();
  }
}

async function cleanupCaches() {
  const cacheNames = await caches.keys();
  
  // Delete old versioned caches
  for (const name of cacheNames) {
    if (name.includes('-old') || name.includes('-v1')) {
      await caches.delete(name);
    }
  }
}
```

---

## 5.5.5 Storage Buckets API (Emerging)

### Storage Buckets Overview

```javascript
// Storage Buckets API (Chrome 122+)
// Provides more granular storage management

// Check support
if ('storageBuckets' in navigator) {
  // Use Storage Buckets API
}

// Create a bucket
const bucket = await navigator.storageBuckets.open('user-data', {
  persisted: true,  // Request persistence
  durability: 'strict',  // Prioritize durability
  quota: 500 * 1024 * 1024  // Request 500MB
});

// Use bucket's storage
const indexedDB = bucket.indexedDB;
const caches = bucket.caches;
```

### Bucket Properties

```javascript
// Get bucket information
const bucket = await navigator.storageBuckets.open('app-data');

// Check estimated usage
const estimate = await bucket.estimate();
console.log('Bucket usage:', estimate.usage);
console.log('Bucket quota:', estimate.quota);

// Check persistence
const persisted = await bucket.persisted();

// Check durability
const durability = bucket.durability;  // 'strict' or 'relaxed'

// Get expiration
const expiration = await bucket.expires();  // Date or null
```

### Managing Buckets

```javascript
// List all buckets
const buckets = await navigator.storageBuckets.keys();
console.log(buckets);  // ['user-data', 'app-cache', ...]

// Delete a bucket (and all its data!)
await navigator.storageBuckets.delete('old-bucket');

// Set expiration
const bucket = await navigator.storageBuckets.open('session-data', {
  expires: Date.now() + (24 * 60 * 60 * 1000)  // 24 hours
});
```

---

## 5.5.6 Common Patterns

### Storage Status Component

```javascript
class StorageStatus {
  constructor() {
    this.update();
    
    // Update every minute
    setInterval(() => this.update(), 60000);
  }
  
  async update() {
    if (!navigator.storage?.estimate) {
      this.status = { supported: false };
      return;
    }
    
    const estimate = await navigator.storage.estimate();
    const persisted = await navigator.storage.persisted();
    
    this.status = {
      supported: true,
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota - estimate.usage,
      percentUsed: (estimate.usage / estimate.quota) * 100,
      persisted,
      usageDetails: estimate.usageDetails || null
    };
    
    this.render();
  }
  
  render() {
    const el = document.getElementById('storage-status');
    if (!el) return;
    
    const { status } = this;
    if (!status.supported) {
      el.textContent = 'Storage API not supported';
      return;
    }
    
    el.innerHTML = `
      <div>Storage: ${this.formatBytes(status.usage)} / ${this.formatBytes(status.quota)}</div>
      <div>Available: ${this.formatBytes(status.available)}</div>
      <div>Persistent: ${status.persisted ? '✅' : '❌'}</div>
      <progress value="${status.percentUsed}" max="100"></progress>
    `;
  }
  
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }
}
```

### Request Persistence on Important Action

```javascript
async function saveImportantDocument(doc) {
  // Ensure persistence for important data
  if (navigator.storage) {
    const persisted = await navigator.storage.persisted();
    
    if (!persisted) {
      const granted = await navigator.storage.persist();
      
      if (!granted) {
        // Warn user but don't block
        showToast('Note: Your browser may clear offline data');
      }
    }
  }
  
  // Save the document
  await saveToIndexedDB(doc);
}
```

### Storage Monitor

```javascript
class StorageMonitor {
  constructor(thresholds = { warning: 80, critical: 95 }) {
    this.thresholds = thresholds;
    this.listeners = [];
  }
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  async check() {
    const estimate = await navigator.storage.estimate();
    const percent = (estimate.usage / estimate.quota) * 100;
    
    let level = 'ok';
    if (percent >= this.thresholds.critical) {
      level = 'critical';
    } else if (percent >= this.thresholds.warning) {
      level = 'warning';
    }
    
    const event = {
      level,
      percent,
      usage: estimate.usage,
      quota: estimate.quota
    };
    
    this.listeners.forEach(cb => cb(event));
    return event;
  }
  
  startMonitoring(intervalMs = 60000) {
    this.check();  // Initial check
    this.interval = setInterval(() => this.check(), intervalMs);
  }
  
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Usage
const monitor = new StorageMonitor();
monitor.addListener(event => {
  if (event.level === 'critical') {
    performEmergencyCleanup();
  } else if (event.level === 'warning') {
    showStorageWarning();
  }
});
monitor.startMonitoring();
```

---

## 5.5.7 Gotchas

```javascript
// ❌ Assuming exact quota numbers
// estimate() returns estimates, not exact values
const { quota } = await navigator.storage.estimate();
// Don't rely on this for exact calculations

// ❌ Expecting persistence to always succeed
const granted = await navigator.storage.persist();
// May return false - always have fallback strategy

// ✅ Handle denied persistence gracefully
if (!granted) {
  // Continue but warn user
  // Or store less critical data only
}

// ❌ Not checking browser support
navigator.storage.estimate();  // Might throw

// ✅ Feature detection first
if (navigator.storage && navigator.storage.estimate) {
  // Safe to use
}

// ❌ Blocking on persistence request
// Some browsers prompt user - may take time
await navigator.storage.persist();  // Could wait for user

// ✅ Non-blocking persistence request
navigator.storage.persist().then(granted => {
  // Update UI accordingly
});

// ❌ Assuming usageDetails is always available
const { usageDetails } = await navigator.storage.estimate();
console.log(usageDetails.indexedDB);  // Might be undefined!

// ✅ Check before accessing
if (usageDetails?.indexedDB) {
  console.log(usageDetails.indexedDB);
}
```

---

## 5.5.8 Summary

### Storage Manager Methods

| Method | Description |
|--------|-------------|
| `estimate()` | Get quota and usage |
| `persisted()` | Check persistence status |
| `persist()` | Request persistence |

### estimate() Return Value

| Property | Description |
|----------|-------------|
| `quota` | Total available bytes |
| `usage` | Currently used bytes |
| `usageDetails` | Breakdown by storage type (optional) |

### Persistence Factors (Chrome)

| Factor | Impact |
|--------|--------|
| Site bookmarked | Increases chance |
| High engagement | Increases chance |
| Push notifications | Increases chance |
| Added to homescreen | Increases chance |

### Best Practices

1. **Check quota before large operations**
2. **Request persistence for important data**
3. **Handle persistence denial gracefully**
4. **Monitor storage usage over time**
5. **Implement cleanup strategies**
6. **Feature-detect before using API**

---

**End of Chapter 5.5: Storage Manager**

This completes the Storage APIs group. Next section: **Group 06 — Fetch and AJAX** — covers making HTTP requests from the browser.
