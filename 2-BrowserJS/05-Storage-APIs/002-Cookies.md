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
