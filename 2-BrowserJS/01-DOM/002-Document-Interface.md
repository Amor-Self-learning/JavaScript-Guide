# 1.2 Document Interface

The `document` object is the entry point to the DOM. It represents the entire HTML or XML document loaded in the browser and provides properties and methods to access every element, create new content, and query document state. Every script that manipulates the page starts here.

Understanding the Document interface deeply is essential because:
- **All element access starts here** — `getElementById`, `querySelector`, etc. are Document methods
- **Document state matters** — code that runs before `DOMContentLoaded` can't find elements
- **Security boundaries** — cookies, referrer, and origin are exposed through Document
- **Dynamic content** — creating elements, writing HTML, and managing the document lifecycle all happen through this interface

---

## 1.2.1 The document Object

### What It Is

The `document` object is a global variable (actually `window.document`) that implements the `Document` interface. In a browser, it's always an `HTMLDocument` (which extends `Document`).

```javascript
// document is globally available
console.log(document);                    // #document
console.log(document.constructor.name);   // HTMLDocument
console.log(document instanceof Document); // true
console.log(document.nodeType);           // 9 (Node.DOCUMENT_NODE)

// document is the same as window.document
console.log(document === window.document); // true
```

### Document vs HTMLDocument

```javascript
// Document is the base interface (XML and HTML)
// HTMLDocument extends Document with HTML-specific properties

// HTML-specific properties (only on HTMLDocument):
document.body;        // <body> element
document.head;        // <head> element
document.cookie;      // Cookie access
document.domain;      // Security domain

// Generic Document properties (XML and HTML):
document.documentElement;  // Root element
document.doctype;          // DOCTYPE declaration
document.URL;              // Document URL
```

---

## 1.2.2 documentElement, head, and body

### documentElement

The `documentElement` property returns the root element of the document — for HTML, this is always `<html>`.

```javascript
const html = document.documentElement;

console.log(html.tagName);        // "HTML"
console.log(html.nodeName);       // "HTML"
console.log(html === document.querySelector('html')); // true

// documentElement is the parent of <head> and <body>
console.log(html.children.length);    // 2 (head + body, typically)
console.log(html.children[0].tagName); // "HEAD"
console.log(html.children[1].tagName); // "BODY"

// Useful for getting viewport dimensions
const viewportWidth = document.documentElement.clientWidth;
const viewportHeight = document.documentElement.clientHeight;
```

### head

The `head` property returns the `<head>` element — there's always exactly one.

```javascript
const head = document.head;

console.log(head.tagName);  // "HEAD"

// Access meta tags, stylesheets, scripts in head
const metas = head.querySelectorAll('meta');
const title = head.querySelector('title');

// Add a new stylesheet dynamically
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = '/styles/dynamic.css';
head.appendChild(link);

// Add a meta tag
const meta = document.createElement('meta');
meta.name = 'viewport';
meta.content = 'width=device-width, initial-scale=1';
head.appendChild(meta);
```

### body

The `body` property returns the `<body>` element (or `<frameset>` in legacy documents).

```javascript
const body = document.body;

console.log(body.tagName);  // "BODY"

// ⚠️ GOTCHA: body can be null if accessed too early
// This happens in <head> scripts before body is parsed
console.log(document.body);  // null (if script is in <head>)

// Safe pattern: wait for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log(document.body);  // <body> element (guaranteed)
});

// Or place scripts at end of <body>
// Or use defer attribute on script tags
```

### Gotcha: Accessing body Too Early

```javascript
// ❌ WRONG: Script in <head> without waiting
// <head>
//   <script>
//     document.body.style.background = 'red';  // TypeError: null
//   </script>
// </head>

// ✅ CORRECT: Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.background = 'red';  // Works
});

// ✅ CORRECT: Use defer
// <script defer src="app.js"></script>
// Script runs after DOM is ready

// ✅ CORRECT: Place script at end of body
// <body>
//   ...content...
//   <script src="app.js"></script>
// </body>
```

---

## 1.2.3 Document Properties

### title

The `title` property gets or sets the document title (shown in browser tab).

```javascript
// Get current title
console.log(document.title);  // "My Page"

// Set new title
document.title = 'Updated Title';

// Dynamic title based on state
function updateTitle(unreadCount) {
  document.title = unreadCount > 0 
    ? `(${unreadCount}) Messages` 
    : 'Messages';
}

// Restore title on visibility change
let originalTitle = document.title;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.title = 'Come back!';
  } else {
    document.title = originalTitle;
  }
});
```

### URL, domain, and origin

```javascript
// URL - full URL of the document (read-only)
console.log(document.URL);
// "https://example.com/page?query=1#section"

// Same as location.href
console.log(document.URL === location.href);  // true

// documentURI - same as URL in HTML documents
console.log(document.documentURI);

// domain - hostname (can be relaxed for same-origin policy)
console.log(document.domain);  // "example.com"

// ⚠️ Setting domain is deprecated and restricted
// document.domain = 'example.com';  // Deprecated

// origin - scheme + host (inherited from location)
// Note: document doesn't have origin, use location
console.log(location.origin);  // "https://example.com"
```

### referrer

The `referrer` property contains the URL of the page that linked to the current page.

```javascript
console.log(document.referrer);
// "https://google.com/search?q=..." (if from Google)
// "" (if direct navigation or referrer blocked)

// Use cases:
// 1. Analytics - track where visitors come from
if (document.referrer.includes('google.com')) {
  analytics.track('organic_search');
}

// 2. Conditional content
if (document.referrer.includes('partner-site.com')) {
  showPartnerDiscount();
}

// ⚠️ Security: referrer can be empty or spoofed
// - Empty if: direct navigation, HTTPS→HTTP, Referrer-Policy: no-referrer
// - Don't rely on it for security decisions
```

### characterSet

```javascript
// Returns the character encoding of the document
console.log(document.characterSet);  // "UTF-8"

// Also available as charset (legacy alias)
console.log(document.charset);  // "UTF-8"

// Should match <meta charset="UTF-8">
```

### contentType

```javascript
// MIME type of the document
console.log(document.contentType);  // "text/html"

// For XML documents: "application/xml" or "text/xml"
// For XHTML: "application/xhtml+xml"
```

### lastModified

```javascript
// Date the document was last modified (from HTTP header)
console.log(document.lastModified);  // "02/18/2024 15:30:45"

// ⚠️ Format is locale-dependent, not ISO
// ⚠️ May return current time if server doesn't send Last-Modified header
```

### dir

```javascript
// Base text direction of the document
console.log(document.dir);  // "ltr" or "rtl" or ""

// Set document direction
document.dir = 'rtl';  // Right-to-left (Arabic, Hebrew)
document.dir = 'ltr';  // Left-to-right (English, etc.)

// Usually set via <html dir="rtl"> attribute
```

---

## 1.2.4 readyState and DOMContentLoaded

### readyState

The `readyState` property indicates the loading state of the document.

```javascript
// Three possible values:
console.log(document.readyState);
// "loading"     - Document is still loading
// "interactive" - DOM is ready, but resources (images) still loading
// "complete"    - Everything loaded

// Check if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();  // DOM already ready
}
```

### readystatechange Event

```javascript
// Fires when readyState changes
document.addEventListener('readystatechange', () => {
  console.log(`State: ${document.readyState}`);
});

// Output order:
// State: loading      (initial, or not fired if already past)
// State: interactive  (DOMContentLoaded fires here)
// State: complete     (load event fires here)
```

### DOMContentLoaded vs load

```javascript
// DOMContentLoaded - fires when HTML is parsed and DOM tree is built
// Does NOT wait for stylesheets, images, subframes
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready');
  // Safe to query and manipulate DOM
  const el = document.getElementById('app');
});

// load - fires when EVERYTHING is loaded (images, styles, etc.)
window.addEventListener('load', () => {
  console.log('Everything loaded');
  // Safe to get computed styles, image dimensions, etc.
  const img = document.querySelector('img');
  console.log(img.naturalWidth);  // Actual image width
});

// Timing:
// 1. HTML parsing begins
// 2. Scripts execute (unless defer/async)
// 3. DOM tree complete → readyState = "interactive"
// 4. DOMContentLoaded fires
// 5. Images, stylesheets, iframes load
// 6. readyState = "complete"
// 7. load fires
```

### Best Practice: Safe DOM Access

```javascript
// Pattern 1: Wrap in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // All DOM code here
});

// Pattern 2: Check readyState first
function whenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

whenReady(() => {
  console.log('DOM is ready');
});

// Pattern 3: Use defer attribute (preferred)
// <script defer src="app.js"></script>
// Script runs after DOM ready, before DOMContentLoaded
```

---

## 1.2.5 cookie Property

The `document.cookie` property provides read/write access to cookies for the current document.

### Reading Cookies

```javascript
// Get all cookies as a single string
console.log(document.cookie);
// "session_id=abc123; user_name=john; theme=dark"

// Parse cookies into an object
function getCookies() {
  return document.cookie
    .split('; ')
    .reduce((cookies, cookie) => {
      const [name, value] = cookie.split('=');
      cookies[name] = decodeURIComponent(value);
      return cookies;
    }, {});
}

const cookies = getCookies();
console.log(cookies.session_id);  // "abc123"
console.log(cookies.theme);       // "dark"

// Get a specific cookie
function getCookie(name) {
  const match = document.cookie.match(
    new RegExp('(^|; )' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[2]) : null;
}

console.log(getCookie('theme'));  // "dark"
```

### Writing Cookies

```javascript
// Set a simple cookie
document.cookie = 'username=john';

// ⚠️ Setting document.cookie ADDS a cookie, doesn't replace all!
document.cookie = 'theme=dark';
// Now both username and theme are set

// Cookie with options
document.cookie = 'token=xyz; max-age=3600; path=/; secure; samesite=strict';

// Cookie options:
// expires=DATE    - Expiration date (UTC string)
// max-age=SECONDS - Seconds until expiration (preferred over expires)
// path=PATH       - Cookie path (default: current path)
// domain=DOMAIN   - Cookie domain (default: current host)
// secure          - Only send over HTTPS
// samesite=VALUE  - CSRF protection (strict/lax/none)
```

### Setting Cookies with Helper

```javascript
function setCookie(name, value, options = {}) {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  
  if (options.maxAge) {
    cookie += `; max-age=${options.maxAge}`;
  }
  if (options.expires) {
    cookie += `; expires=${options.expires.toUTCString()}`;
  }
  if (options.path) {
    cookie += `; path=${options.path}`;
  }
  if (options.domain) {
    cookie += `; domain=${options.domain}`;
  }
  if (options.secure) {
    cookie += '; secure';
  }
  if (options.sameSite) {
    cookie += `; samesite=${options.sameSite}`;
  }
  
  document.cookie = cookie;
}

// Usage
setCookie('session', 'abc123', {
  maxAge: 86400,      // 1 day
  path: '/',
  secure: true,
  sameSite: 'strict'
});
```

### Deleting Cookies

```javascript
// Delete by setting expiration in the past
function deleteCookie(name, path = '/') {
  document.cookie = `${name}=; max-age=0; path=${path}`;
}

deleteCookie('session');

// ⚠️ Must match the path used when setting
// Cookie set with path=/admin can only be deleted with path=/admin
```

### Cookie Limitations and Security

```javascript
// ❌ LIMITATIONS:
// - 4KB max per cookie
// - ~50 cookies per domain
// - Sent with EVERY request (bandwidth)
// - String-only (must serialize objects)

// ❌ SECURITY ISSUES:
// - XSS can steal cookies (unless HttpOnly)
// - CSRF if SameSite not set

// ✅ BEST PRACTICES:
// 1. Use HttpOnly for sensitive cookies (set by server, not JS)
// 2. Use Secure flag for HTTPS-only
// 3. Use SameSite=Strict or Lax
// 4. Set appropriate expiration
// 5. Use narrow path when possible

// For client-side storage, prefer:
// - localStorage/sessionStorage (more space, no request overhead)
// - IndexedDB (structured data)
```

---

## 1.2.6 Document Methods

### open(), write(), close()

These legacy methods write to the document stream. **Avoid them in modern code.**

```javascript
// ❌ LEGACY: document.write()
// Opens stream, writes HTML, can replace entire document
document.write('<h1>Hello</h1>');

// ⚠️ DANGEROUS: If called after page load, replaces entire document!
window.addEventListener('load', () => {
  document.write('Oops!');  // Entire page replaced with "Oops!"
});

// document.open() - explicitly opens the stream
// document.close() - closes the stream

// ✅ MODERN ALTERNATIVE: innerHTML or DOM methods
document.body.innerHTML = '<h1>Hello</h1>';

// Or:
const h1 = document.createElement('h1');
h1.textContent = 'Hello';
document.body.appendChild(h1);
```

### hasFocus()

```javascript
// Returns true if document or any element in it has focus
console.log(document.hasFocus());  // true (if tab is active)

// Use case: pause animations when tab loses focus
if (!document.hasFocus()) {
  pauseAnimation();
}

// Listen for focus changes
window.addEventListener('blur', () => {
  console.log('Window lost focus');
});
window.addEventListener('focus', () => {
  console.log('Window gained focus');
});
```

### activeElement

```javascript
// Returns the currently focused element
console.log(document.activeElement);  // <input>, <button>, etc.

// If no element is focused, returns <body> or null
console.log(document.activeElement.tagName);  // "BODY"

// Useful for:
// 1. Saving focus before modal opens
const previousFocus = document.activeElement;
openModal();
// ... later
previousFocus.focus();  // Restore focus

// 2. Validating which element has focus
if (document.activeElement === usernameInput) {
  showUsernameTips();
}
```

### getSelection()

```javascript
// Returns the Selection object representing selected text
const selection = document.getSelection();

console.log(selection.toString());    // Selected text as string
console.log(selection.rangeCount);    // Number of selection ranges
console.log(selection.anchorNode);    // Node where selection started
console.log(selection.focusNode);     // Node where selection ended

// Get selected range
if (selection.rangeCount > 0) {
  const range = selection.getRangeAt(0);
  console.log(range.startContainer);  // Start node
  console.log(range.endContainer);    // End node
}

// Clear selection
selection.removeAllRanges();

// Programmatically select text
const range = document.createRange();
range.selectNodeContents(document.getElementById('content'));
selection.removeAllRanges();
selection.addRange(range);
```

### elementFromPoint() and elementsFromPoint()

```javascript
// Get element at specific coordinates
const element = document.elementFromPoint(100, 200);
console.log(element);  // Element at x=100, y=200

// Get all elements at coordinates (topmost first)
const elements = document.elementsFromPoint(100, 200);
console.log(elements);  // [<span>, <div>, <body>, <html>]

// Use case: Custom tooltip at cursor position
document.addEventListener('mousemove', (e) => {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (el.dataset.tooltip) {
    showTooltip(el.dataset.tooltip, e.clientX, e.clientY);
  }
});
```

---

## 1.2.7 Document Collections

### forms, images, links, scripts

```javascript
// Legacy HTMLCollections - live collections of specific elements

// All <form> elements
console.log(document.forms);              // HTMLCollection
console.log(document.forms.length);       // Number of forms
console.log(document.forms[0]);           // First form
console.log(document.forms.myForm);       // Form with name="myForm"

// All <img> elements
console.log(document.images);
console.log(document.images.length);

// All <a> and <area> elements with href
console.log(document.links);

// All <script> elements
console.log(document.scripts);

// All <style> and <link rel="stylesheet"> elements
console.log(document.styleSheets);

// All <embed> elements
console.log(document.embeds);
console.log(document.plugins);  // Same as embeds

// ⚠️ These are LIVE collections
// Adding/removing elements updates them automatically
const formCount = document.forms.length;  // e.g., 2
document.body.innerHTML += '<form></form>';
console.log(document.forms.length);       // 3 (updated!)
```

### Accessing Forms by Name

```javascript
// Forms can be accessed by name attribute
// <form name="login">...</form>
const loginForm = document.forms.login;
const loginForm2 = document.forms['login'];
const loginForm3 = document.forms.namedItem('login');

// Form elements can be accessed the same way
// <input name="username">
const username = loginForm.elements.username;
const password = loginForm.elements.password;

// Or by index
const firstInput = loginForm.elements[0];
```

---

## 1.2.8 Common Pitfalls

### Pitfall 1: Accessing DOM Before Ready

```javascript
// ❌ Script in <head> without defer
// document.body is null!
document.body.className = 'loaded';  // TypeError

// ✅ Use DOMContentLoaded or defer
document.addEventListener('DOMContentLoaded', () => {
  document.body.className = 'loaded';
});
```

### Pitfall 2: document.write After Load

```javascript
// ❌ document.write after page load replaces everything
setTimeout(() => {
  document.write('Oops!');  // Entire page wiped!
}, 1000);

// ✅ Use DOM methods instead
setTimeout(() => {
  document.body.innerHTML = '<p>New content</p>';
}, 1000);
```

### Pitfall 3: Cookie String Manipulation

```javascript
// ❌ Thinking document.cookie = 'x=1' replaces all cookies
document.cookie = 'a=1';
document.cookie = 'b=2';  // Both a and b exist now

// ❌ Forgetting to encode values
document.cookie = 'name=John Doe';  // Space may cause issues

// ✅ Always encode
document.cookie = `name=${encodeURIComponent('John Doe')}`;
```

### Pitfall 4: Live vs Static Collections

```javascript
// document.forms/images/links are LIVE
const forms = document.forms;
console.log(forms.length);  // 2

document.body.appendChild(document.createElement('form'));
console.log(forms.length);  // 3 (automatically updated!)

// querySelectorAll returns STATIC NodeList
const forms2 = document.querySelectorAll('form');
console.log(forms2.length);  // 3

document.body.appendChild(document.createElement('form'));
console.log(forms2.length);  // Still 3 (not updated)
```

---

## 1.2.9 Summary

| Property/Method | Purpose |
|-----------------|---------|
| `document.documentElement` | Root `<html>` element |
| `document.head` | `<head>` element |
| `document.body` | `<body>` element |
| `document.title` | Document title (read/write) |
| `document.URL` | Full document URL |
| `document.referrer` | URL of linking page |
| `document.readyState` | Loading state (loading/interactive/complete) |
| `document.cookie` | Cookie access (read/write) |
| `document.activeElement` | Currently focused element |
| `document.hasFocus()` | Whether document has focus |
| `document.getSelection()` | Current text selection |
| `document.elementFromPoint()` | Element at coordinates |
| `document.forms/images/links` | Live element collections |

### Best Practices

1. **Always wait for DOM ready** — use `DOMContentLoaded` or `defer`
2. **Never use `document.write()`** — use DOM methods instead
3. **Use `document.cookie` carefully** — encode values, set proper flags
4. **Prefer `querySelector`** over legacy collections
5. **Check `readyState`** before accessing body

---

**End of Chapter 1.2: Document Interface**

Next chapter: **1.3 Selecting Elements** — covers `getElementById`, `querySelector`, `querySelectorAll`, and more.
