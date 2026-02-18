# 2.1 Window Object

The `window` object is the global object in browser JavaScript — the root of the Browser Object Model (BOM). It represents the browser window or tab and serves as the global scope for all JavaScript code. Every global variable, function, and object becomes a property of `window`.

This chapter covers the Window object comprehensively — from viewport dimensions to popup management, media queries, and advanced features like `matchMedia` and selection APIs.

---

## 2.1.1 The Global Object

In browsers, `window` is the global execution context.

### Global Scope Relationship

```javascript
// Global variables become window properties
var globalVar = 'hello';
console.log(window.globalVar);  // "hello"

// let/const do NOT become window properties
let letVar = 'world';
const constVar = '!';
console.log(window.letVar);    // undefined
console.log(window.constVar);  // undefined

// Global functions become window methods
function globalFunction() {
  return 'I am global';
}
console.log(window.globalFunction());  // "I am global"

// this in global scope
console.log(this === window);  // true (in non-strict mode)

// window is the global object
console.log(window.window === window);  // true
console.log(window.self === window);    // true
console.log(window.globalThis === window);  // true (ES2020)
```

### Implicit Window Reference

```javascript
// These are equivalent
window.alert('Hello');
alert('Hello');

window.console.log('test');
console.log('test');

window.document.getElementById('x');
document.getElementById('x');

// Built-in objects are window properties
console.log(window.Array === Array);    // true
console.log(window.Object === Object);  // true
console.log(window.Promise === Promise);  // true
```

### Window vs globalThis

```javascript
// globalThis is the ES2020 standard global object
// Works in all environments (browser, Node.js, workers)

// Browser main thread
console.log(globalThis === window);  // true

// Web Worker
// console.log(globalThis === self);  // true (no window in workers)

// Use globalThis for cross-environment code
const global = globalThis || window || self;
```

---

## 2.1.2 Viewport Dimensions

Understanding viewport and window dimensions is crucial for responsive design and layout calculations.

### Inner Dimensions (Viewport)

```javascript
// Viewport dimensions (visible content area)
const viewportWidth = window.innerWidth;   // Includes scrollbar
const viewportHeight = window.innerHeight;

console.log(`Viewport: ${viewportWidth} x ${viewportHeight}`);

// These change when browser is resized
window.addEventListener('resize', () => {
  console.log(`New size: ${innerWidth} x ${innerHeight}`);
});
```

### Outer Dimensions (Browser Window)

```javascript
// Entire browser window including toolbars, borders
const browserWidth = window.outerWidth;
const browserHeight = window.outerHeight;

console.log(`Browser window: ${browserWidth} x ${browserHeight}`);

// Difference between inner and outer indicates chrome size
const chromeHeight = outerHeight - innerHeight;  // Toolbars, address bar
const chromeWidth = outerWidth - innerWidth;     // Usually 0 or small
```

### Document vs Viewport Dimensions

```javascript
// Document dimensions (scrollable area)
const docWidth = document.documentElement.scrollWidth;
const docHeight = document.documentElement.scrollHeight;

// Client dimensions (viewport without scrollbar)
const clientWidth = document.documentElement.clientWidth;
const clientHeight = document.documentElement.clientHeight;

// innerWidth includes scrollbar, clientWidth excludes it
const scrollbarWidth = innerWidth - clientWidth;
console.log(`Scrollbar width: ${scrollbarWidth}px`);
```

### Dimension Comparison

| Property | Includes Scrollbar? | Includes Chrome? |
|----------|---------------------|------------------|
| `innerWidth/Height` | Yes | No |
| `outerWidth/Height` | Yes | Yes |
| `clientWidth/Height` | No | No |

---

## 2.1.3 Scroll Position

Track and control the document's scroll position.

### Reading Scroll Position

```javascript
// Current scroll position
const scrollX = window.scrollX;  // Horizontal scroll
const scrollY = window.scrollY;  // Vertical scroll

// Aliases (older API)
const pageXOffset = window.pageXOffset;  // Same as scrollX
const pageYOffset = window.pageYOffset;  // Same as scrollY

console.log(`Scrolled: ${scrollX}px right, ${scrollY}px down`);

// Track scroll
window.addEventListener('scroll', () => {
  console.log(`Scroll position: ${scrollX}, ${scrollY}`);
});
```

### scrollTo() — Scroll to Absolute Position

```javascript
// Scroll to specific coordinates
window.scrollTo(0, 500);  // Scroll to 500px from top

// With options (smooth scrolling)
window.scrollTo({
  top: 500,
  left: 0,
  behavior: 'smooth'  // 'auto' (instant) or 'smooth'
});

// Scroll to top
window.scrollTo(0, 0);

// Scroll to bottom
window.scrollTo(0, document.documentElement.scrollHeight);
```

### scrollBy() — Scroll by Relative Amount

```javascript
// Scroll relative to current position
window.scrollBy(0, 100);  // Scroll down 100px

// With options
window.scrollBy({
  top: 100,
  left: 0,
  behavior: 'smooth'
});

// Scroll up
window.scrollBy(0, -100);
```

### Scroll Restoration

```javascript
// Control scroll behavior on navigation
// 'auto': browser handles (restores scroll on back)
// 'manual': you handle it

history.scrollRestoration = 'manual';

// Useful for SPAs where you manage scroll yourself
window.addEventListener('popstate', () => {
  // Handle scroll manually
  window.scrollTo(0, 0);
});
```

---

## 2.1.4 Window Position and Size

Control the browser window's position and size (with limitations).

### Window Position

```javascript
// Position of window on screen
const x = window.screenX;  // Or screenLeft (older)
const y = window.screenY;  // Or screenTop (older)

console.log(`Window at screen position: ${x}, ${y}`);
```

### moveTo() and moveBy()

```javascript
// ⚠️ Only works on windows opened by window.open()
// Modern browsers block this for user-opened windows

// Move window to absolute position
window.moveTo(100, 100);  // Move to screen coordinates (100, 100)

// Move window by relative amount
window.moveBy(50, 50);    // Move 50px right and down

// Practical use with popup
const popup = window.open('about:blank', 'popup', 'width=400,height=300');
popup.moveTo(0, 0);       // Move popup to top-left corner
```

### resizeTo() and resizeBy()

```javascript
// ⚠️ Same restrictions as moveTo/moveBy

// Resize to absolute dimensions
window.resizeTo(800, 600);

// Resize by relative amount
window.resizeBy(100, 0);  // Make 100px wider

// With popup
const popup = window.open('about:blank', 'popup', 'width=200,height=200');
popup.resizeTo(500, 400);
```

### Security Restrictions

```javascript
// Modern browsers restrict these methods:
// 1. Cannot resize/move the main window
// 2. Can only affect windows opened via window.open()
// 3. User may have browser settings that block these
// 4. Minimum window size enforced

// Best practice: avoid relying on these methods
// Use responsive CSS instead
```

---

## 2.1.5 Opening and Closing Windows

### window.open()

```javascript
// Basic usage
const newWindow = window.open('https://example.com');

// With target (like link target)
window.open('https://example.com', '_blank');   // New tab (usually)
window.open('https://example.com', '_self');    // Current window
window.open('https://example.com', 'myWindow'); // Named window

// With features (creates popup, not tab)
const popup = window.open(
  'https://example.com',
  'popupName',
  'width=800,height=600,left=100,top=100'
);

// Full features string
const popup2 = window.open(
  'page.html',
  'popup',
  'width=600,height=400,menubar=no,toolbar=no,location=no,status=no,scrollbars=yes,resizable=yes'
);
```

### Feature String Options

| Feature | Values | Description |
|---------|--------|-------------|
| `width` | pixels | Window width |
| `height` | pixels | Window height |
| `left` | pixels | X position |
| `top` | pixels | Y position |
| `menubar` | yes/no | Show menu bar |
| `toolbar` | yes/no | Show toolbar |
| `location` | yes/no | Show address bar |
| `status` | yes/no | Show status bar |
| `scrollbars` | yes/no | Show scrollbars |
| `resizable` | yes/no | Allow resize |
| `noopener` | (flag) | No opener reference |
| `noreferrer` | (flag) | No referrer + no opener |

### Popup Blockers

```javascript
// open() may return null if blocked
const newWin = window.open('https://example.com');

if (newWin === null) {
  console.log('Popup was blocked');
  // Show message to user or fallback
  alert('Please allow popups for this site');
}

// Popups are usually allowed if:
// 1. Triggered by user action (click, keypress)
// 2. Not triggered by timers, load events, etc.

// ✅ Works (user-triggered)
button.addEventListener('click', () => {
  window.open('https://example.com');
});

// ❌ Usually blocked (not user-triggered)
setTimeout(() => {
  window.open('https://example.com');  // Blocked!
}, 1000);
```

### window.close()

```javascript
// Close current window
window.close();

// ⚠️ Restrictions:
// - Can only close windows opened by JavaScript
// - Cannot close the main browser window

// Close a popup we opened
const popup = window.open('page.html', 'popup', 'width=400,height=300');

// Later...
popup.close();

// Check if window is closed
if (popup.closed) {
  console.log('Popup was closed');
}
```

### Window References

```javascript
// window.opener — reference to window that opened this one
if (window.opener) {
  // We were opened by another window
  console.log(window.opener.location.href);
  
  // Can communicate back
  window.opener.postMessage('Hello from popup', '*');
}

// Security: use noopener for external links
const external = window.open('https://untrusted.com', '_blank', 'noopener');
// external.opener will be null (safer)
```

---

## 2.1.6 Timers

The window object provides timer functions (see ECMAScript §13 for full details).

### setTimeout and setInterval

```javascript
// Execute once after delay
const timeoutId = setTimeout(() => {
  console.log('Delayed execution');
}, 1000);

// Cancel timeout
clearTimeout(timeoutId);

// Execute repeatedly
const intervalId = setInterval(() => {
  console.log('Repeating...');
}, 1000);

// Cancel interval
clearInterval(intervalId);
```

### requestAnimationFrame

```javascript
// Optimized for animations (syncs with display refresh)
let animationId;

function animate() {
  // Update animation state
  element.style.left = `${position++}px`;
  
  // Schedule next frame
  animationId = requestAnimationFrame(animate);
}

// Start animation
animationId = requestAnimationFrame(animate);

// Stop animation
cancelAnimationFrame(animationId);
```

### requestIdleCallback

```javascript
// Execute when browser is idle
const idleId = requestIdleCallback((deadline) => {
  // deadline.timeRemaining() — ms remaining in idle period
  // deadline.didTimeout — true if callback fired due to timeout
  
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    processTask(tasks.shift());
  }
  
  if (tasks.length > 0) {
    // Schedule more work
    requestIdleCallback(processRemainingTasks);
  }
}, { timeout: 2000 });  // Max wait time

// Cancel
cancelIdleCallback(idleId);
```

---

## 2.1.7 Focus and Blur

### window.focus() and window.blur()

```javascript
// Focus the window (bring to front)
window.focus();

// Remove focus from window
window.blur();

// Focus a popup we opened
const popup = window.open('page.html', 'popup');
popup.focus();

// Events for focus changes
window.addEventListener('focus', () => {
  console.log('Window focused');
  document.title = 'Active';
});

window.addEventListener('blur', () => {
  console.log('Window blurred');
  document.title = '[Inactive] Page';
});
```

### Visibility API (Better Alternative)

```javascript
// Preferred way to detect visibility
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Tab is visible');
    resumeAnimations();
    reconnectWebSocket();
  } else {
    console.log('Tab is hidden');
    pauseAnimations();
    disconnectWebSocket();
  }
});

// visibilityState: 'visible', 'hidden', 'prerender'
console.log(document.visibilityState);
console.log(document.hidden);  // Boolean shortcut
```

---

## 2.1.8 print()

Trigger the browser's print dialog.

```javascript
// Open print dialog
window.print();

// Common usage: print button
printBtn.addEventListener('click', () => {
  window.print();
});

// Print-specific styling (use CSS)
// @media print {
//   .no-print { display: none; }
//   body { font-size: 12pt; }
// }

// Listen for print events
window.addEventListener('beforeprint', () => {
  // Prepare page for printing
  showPrintableContent();
});

window.addEventListener('afterprint', () => {
  // Restore normal view
  restoreNormalContent();
});
```

---

## 2.1.9 getSelection()

Access the current text selection.

### Reading Selection

```javascript
// Get the Selection object
const selection = window.getSelection();

// Get selected text
const selectedText = selection.toString();
console.log('Selected:', selectedText);

// Selection details
console.log(selection.anchorNode);    // Node where selection started
console.log(selection.focusNode);     // Node where selection ended
console.log(selection.rangeCount);    // Number of ranges (usually 1)
console.log(selection.isCollapsed);   // true if no selection (cursor)

// Get the Range object
if (selection.rangeCount > 0) {
  const range = selection.getRangeAt(0);
  console.log(range.startContainer);
  console.log(range.endContainer);
}
```

### Manipulating Selection

```javascript
// Clear selection
window.getSelection().removeAllRanges();

// Select all text in an element
function selectElement(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

// Copy selected text
async function copySelection() {
  const text = window.getSelection().toString();
  await navigator.clipboard.writeText(text);
}
```

### Selection Events

```javascript
// Listen for selection changes
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.toString().length > 0) {
    showCopyButton(selection);
  } else {
    hideCopyButton();
  }
});
```

---

## 2.1.10 matchMedia()

Query media features programmatically — the JavaScript equivalent of CSS media queries.

### Basic Usage

```javascript
// Create a MediaQueryList
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

// Check if query matches
if (darkModeQuery.matches) {
  console.log('User prefers dark mode');
}

// Full media query syntax works
const mobileQuery = matchMedia('(max-width: 768px)');
const landscapeQuery = matchMedia('(orientation: landscape)');
const printQuery = matchMedia('print');
const hoverQuery = matchMedia('(hover: hover)');
const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
```

### Listening for Changes

```javascript
const mediaQuery = window.matchMedia('(max-width: 768px)');

// Modern approach: addEventListener
mediaQuery.addEventListener('change', (e) => {
  if (e.matches) {
    console.log('Viewport is now mobile-sized');
    enableMobileUI();
  } else {
    console.log('Viewport is now desktop-sized');
    enableDesktopUI();
  }
});

// Check initial state + listen for changes
function handleMediaChange(e) {
  document.body.classList.toggle('mobile', e.matches);
}
mediaQuery.addEventListener('change', handleMediaChange);
handleMediaChange(mediaQuery);  // Initial check
```

### Common Media Queries

```javascript
// Dark mode preference
const darkMode = matchMedia('(prefers-color-scheme: dark)');

// Reduced motion (accessibility)
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if (reducedMotion.matches) {
  // Disable animations
  document.documentElement.style.setProperty('--animation-duration', '0');
}

// High contrast
const highContrast = matchMedia('(prefers-contrast: more)');

// Touch device
const touchDevice = matchMedia('(hover: none) and (pointer: coarse)');

// Print
const printMode = matchMedia('print');
printMode.addEventListener('change', (e) => {
  if (e.matches) {
    // Entering print mode
  }
});
```

### Responsive JavaScript

```javascript
// Change behavior based on viewport
class ResponsiveApp {
  constructor() {
    this.breakpoints = {
      mobile: matchMedia('(max-width: 767px)'),
      tablet: matchMedia('(min-width: 768px) and (max-width: 1023px)'),
      desktop: matchMedia('(min-width: 1024px)')
    };
    
    this.setupListeners();
    this.updateForCurrentBreakpoint();
  }
  
  setupListeners() {
    Object.values(this.breakpoints).forEach(mq => {
      mq.addEventListener('change', () => {
        this.updateForCurrentBreakpoint();
      });
    });
  }
  
  updateForCurrentBreakpoint() {
    if (this.breakpoints.mobile.matches) {
      this.enableMobileMode();
    } else if (this.breakpoints.tablet.matches) {
      this.enableTabletMode();
    } else {
      this.enableDesktopMode();
    }
  }
  
  enableMobileMode() {
    // Mobile-specific JS
  }
  
  enableTabletMode() {
    // Tablet-specific JS
  }
  
  enableDesktopMode() {
    // Desktop-specific JS
  }
}
```

---

## 2.1.11 Other Window Properties

### devicePixelRatio

```javascript
// How many physical pixels per CSS pixel
const dpr = window.devicePixelRatio;

console.log(`Device pixel ratio: ${dpr}`);
// 1 = standard displays
// 2 = Retina/HiDPI displays
// Can be fractional (1.5, 2.25, etc.)

// Use for high-resolution images/canvas
function getImageSrc(baseName) {
  if (devicePixelRatio >= 2) {
    return `${baseName}@2x.png`;
  }
  return `${baseName}.png`;
}

// Canvas with high-res support
function setupHiDPICanvas(canvas, width, height) {
  const dpr = devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}
```

### name

```javascript
// Window name (used for targeting)
console.log(window.name);  // "" by default

// Set name
window.name = 'myWindow';

// Used with window.open targeting
window.open('page.html', 'myWindow');  // Opens in this window

// ⚠️ window.name persists across navigations
// Can be a security concern — don't store sensitive data
```

### parent, top, and frames

```javascript
// For frames/iframes

// Reference to parent window
console.log(window.parent);

// Reference to topmost window
console.log(window.top);

// Check if in an iframe
if (window.self !== window.top) {
  console.log('This page is in an iframe');
}

// Frames collection
console.log(window.frames.length);  // Number of iframes
console.log(window.frames[0]);      // First iframe's window
```

### isSecureContext

```javascript
// Check if running in secure context (HTTPS, localhost, etc.)
if (window.isSecureContext) {
  console.log('Secure context — can use secure-only APIs');
  // Crypto, Service Workers, Push API, etc.
} else {
  console.log('Not secure — some APIs unavailable');
}
```

---

## 2.1.12 Summary

| Property/Method | Purpose |
|-----------------|---------|
| `innerWidth/Height` | Viewport dimensions |
| `outerWidth/Height` | Browser window dimensions |
| `scrollX/Y` | Current scroll position |
| `scrollTo()` | Scroll to absolute position |
| `scrollBy()` | Scroll by relative amount |
| `open()` | Open new window/tab |
| `close()` | Close window |
| `focus()/blur()` | Window focus management |
| `print()` | Trigger print dialog |
| `getSelection()` | Get text selection |
| `matchMedia()` | Query media features |
| `devicePixelRatio` | Display density |

### Best Practices

1. **Use `globalThis`** for cross-environment code (browsers, workers, Node.js)
2. **Use `matchMedia`** for responsive JavaScript instead of resize events
3. **Respect `prefers-reduced-motion`** for accessibility
4. **Handle popup blockers** gracefully — check if `open()` returns null
5. **Use `noopener`** with `window.open()` for external links (security)
6. **Prefer Visibility API** over focus/blur for tab visibility
7. **Cache `devicePixelRatio`** — it's a constant for the session

### Common Gotchas

```javascript
// ❌ moveTo/resizeTo don't work on main window
window.resizeTo(800, 600);  // Ignored

// ❌ Popups blocked without user interaction
setTimeout(() => window.open('...'), 1000);  // Blocked

// ❌ innerWidth includes scrollbar, clientWidth doesn't
// Use clientWidth for content area calculations

// ⚠️ window.name persists — can leak between origins
window.name = 'sensitive';  // Don't do this
```

---

**End of Chapter 2.1: Window Object**

Next chapter: **2.2 Location Object** — covers URL manipulation, navigation, and the `assign`, `replace`, and `reload` methods.
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
# 2.3 History Object

The `history` object represents the browser's session history — the stack of pages visited in the current tab. It provides methods to navigate backward and forward, and crucially, the History API lets you manipulate the URL without page reloads. This is the foundation of modern single-page application (SPA) routing.

---

## 2.3.1 History Basics

### The History Stack

```javascript
// The history object manages the session history stack
console.log(history);

// Number of entries in the history stack
console.log(history.length);

// ⚠️ You cannot access the actual URLs in the history
// This is a security restriction — you only know the count
```

### Navigation Methods

```javascript
// Go back one page (like clicking Back button)
history.back();

// Go forward one page (like clicking Forward button)
history.forward();

// Go to specific position relative to current
history.go(-1);   // Same as back()
history.go(1);    // Same as forward()
history.go(-2);   // Go back 2 pages
history.go(0);    // Reload current page

// No argument = reload
history.go();     // Same as location.reload()
```

### Navigation Events

```javascript
// Listen for back/forward navigation
window.addEventListener('popstate', (event) => {
  console.log('Navigation occurred');
  console.log('Current state:', event.state);
  console.log('Current URL:', location.href);
});

// ⚠️ popstate does NOT fire for:
// - Initial page load
// - pushState/replaceState (only manual navigation or back/forward)
```

---

## 2.3.2 pushState()

Add a new entry to the history stack without reloading the page.

### Basic Usage

```javascript
// pushState(stateObject, title, url)
history.pushState(
  { page: 'about' },           // State object (can retrieve later)
  '',                          // Title (largely ignored by browsers)
  '/about'                     // New URL
);

// The URL changes but NO page load occurs!
console.log(location.pathname);  // "/about"

// History length increases
console.log(history.length);     // +1 from before
```

### Parameters Explained

```javascript
// State object: any serializable object
history.pushState({
  page: 'products',
  filters: { category: 'shoes', size: 10 },
  scrollPosition: 500
}, '', '/products');

// Title: second parameter (unused but required)
// Most browsers ignore this
// Pass empty string ''

// URL: the new URL to display
// Must be same-origin (security restriction)
// Can be relative or absolute path
history.pushState(null, '', '/new-path');
history.pushState(null, '', '?query=value');
history.pushState(null, '', '#section');
history.pushState(null, '', '../sibling');
```

### URL Restrictions

```javascript
// ✅ Same-origin URLs work
history.pushState(null, '', '/any/path');
history.pushState(null, '', '?different=params');
history.pushState(null, '', '#new-hash');

// ❌ Cross-origin URLs throw SecurityError
history.pushState(null, '', 'https://other-domain.com');
// DOMException: The operation is insecure

// ✅ Path can change completely (within origin)
// From https://example.com/page1
history.pushState(null, '', '/completely/different/path');
// URL is now https://example.com/completely/different/path
```

### State Object Limits

```javascript
// State objects must be serializable (like JSON)
// ✅ Good
history.pushState({ count: 1, name: 'test' }, '', '/page');

// ❌ Bad - cannot contain functions, DOM elements, etc.
history.pushState({
  element: document.body,      // Error!
  callback: () => {}           // Error!
}, '', '/page');

// Size limit: ~640KB (varies by browser)
// Firefox: 16MB, Chrome: ~2MB, Safari: varies
const largeState = { data: 'x'.repeat(100000) };
history.pushState(largeState, '', '/page');  // Works if under limit
```

---

## 2.3.3 replaceState()

Replace the current history entry without adding a new one.

### Basic Usage

```javascript
// replaceState(stateObject, title, url)
history.replaceState(
  { page: 'home', modified: true },
  '',
  '/home'
);

// URL changes but history.length stays the same
// User cannot go "back" to the previous URL
```

### Use Cases

```javascript
// 1. Update URL without adding history entry
// Useful for pagination, filters, tabs
function updateFilters(filters) {
  const params = new URLSearchParams(filters);
  history.replaceState(
    { filters },
    '',
    `${location.pathname}?${params}`
  );
}

// 2. Normalize URLs
// Redirect /home to / without adding history
if (location.pathname === '/home') {
  history.replaceState(null, '', '/');
}

// 3. Clean up after redirect
// After OAuth callback, remove tokens from URL
if (location.search.includes('access_token')) {
  const token = new URLSearchParams(location.search).get('access_token');
  saveToken(token);
  history.replaceState(null, '', location.pathname);
}

// 4. Save scroll position
window.addEventListener('scroll', () => {
  history.replaceState(
    { ...history.state, scrollY: window.scrollY },
    '',
    location.href
  );
});
```

### pushState vs replaceState

| Aspect | pushState | replaceState |
|--------|-----------|--------------|
| History length | Increases | Unchanged |
| Back button | Returns to previous | Skips replaced entry |
| Use case | Navigation | State updates |

---

## 2.3.4 The State Object

Access the current state via `history.state`.

### Reading State

```javascript
// After pushState/replaceState
history.pushState({ page: 1, data: [1, 2, 3] }, '', '/page1');

// Current state is available
console.log(history.state);  // { page: 1, data: [1, 2, 3] }

// State persists after navigation
history.pushState({ page: 2 }, '', '/page2');
console.log(history.state);  // { page: 2 }

history.back();
// After popstate event fires:
console.log(history.state);  // { page: 1, data: [1, 2, 3] }
```

### State in popstate Event

```javascript
window.addEventListener('popstate', (event) => {
  // event.state contains the state object
  console.log(event.state);
  
  if (event.state) {
    // Handle known state
    renderPage(event.state);
  } else {
    // No state (initial page load or external link)
    handleInitialLoad();
  }
});
```

### Initial State

```javascript
// On page load, history.state is null by default
console.log(history.state);  // null (usually)

// Set initial state to enable restore on back navigation
if (!history.state) {
  history.replaceState({
    page: 'initial',
    loadedAt: Date.now()
  }, '', location.href);
}
```

---

## 2.3.5 The popstate Event

Fires when the user navigates using back/forward buttons.

### Event Details

```javascript
window.addEventListener('popstate', (event) => {
  // Fires when:
  // - User clicks back/forward button
  // - history.back(), history.forward(), history.go() called
  
  // Does NOT fire when:
  // - pushState() is called
  // - replaceState() is called
  // - Location changes via location.href
  
  console.log('Navigated to:', location.href);
  console.log('State:', event.state);
});
```

### Handling popstate

```javascript
// Comprehensive popstate handler
window.addEventListener('popstate', (event) => {
  const state = event.state;
  
  if (!state) {
    // No state means:
    // - Initial page load (some browsers)
    // - Navigation to page without pushState history
    loadDefaultPage();
    return;
  }
  
  // Restore UI from state
  if (state.view) {
    switchView(state.view);
  }
  
  if (state.data) {
    displayData(state.data);
  }
  
  if (state.scrollY !== undefined) {
    window.scrollTo(0, state.scrollY);
  }
});
```

### Common Gotchas

```javascript
// ⚠️ Some browsers fire popstate on initial load
// Safari, older browsers might do this
window.addEventListener('popstate', (event) => {
  // Guard against initial fire
  if (event.state !== null) {
    handleNavigation(event.state);
  }
});

// ⚠️ popstate fires AFTER the URL has changed
// location.href already shows the new URL
window.addEventListener('popstate', () => {
  console.log(location.href);  // Already the new URL
});

// ⚠️ Hash changes also trigger popstate
// If navigating between hash states
window.addEventListener('popstate', (event) => {
  if (location.hash) {
    handleHashChange(location.hash);
  }
});
```

---

## 2.3.6 Scroll Restoration

Control how the browser restores scroll position.

### scrollRestoration Property

```javascript
// Get current mode
console.log(history.scrollRestoration);  // 'auto' or 'manual'

// 'auto' (default): Browser restores scroll position on back/forward
// 'manual': You handle scroll restoration yourself

// Set to manual for SPA control
history.scrollRestoration = 'manual';
```

### Manual Scroll Restoration

```javascript
// 1. Set to manual mode
history.scrollRestoration = 'manual';

// 2. Save scroll position with state
window.addEventListener('scroll', debounce(() => {
  history.replaceState({
    ...history.state,
    scrollY: window.scrollY
  }, '', location.href);
}, 100));

// 3. Restore on popstate
window.addEventListener('popstate', (event) => {
  if (event.state?.scrollY !== undefined) {
    // Delay to let content render
    requestAnimationFrame(() => {
      window.scrollTo(0, event.state.scrollY);
    });
  }
});

// Helper function
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), wait);
  };
}
```

### SPA Considerations

```javascript
// SPAs often want scroll-to-top on navigate
router.navigate = function(path, options = {}) {
  history.pushState({ scrollY: 0 }, '', path);
  
  if (!options.preserveScroll) {
    window.scrollTo(0, 0);
  }
  
  renderRoute(path);
};

// But restore scroll on back
window.addEventListener('popstate', (event) => {
  const scrollY = event.state?.scrollY ?? 0;
  
  renderRoute(location.pathname).then(() => {
    window.scrollTo(0, scrollY);
  });
});
```

---

## 2.3.7 Building a History-Based Router

### Simple SPA Router

```javascript
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    
    // Handle browser navigation
    window.addEventListener('popstate', (e) => {
      this.handleNavigation(location.pathname, e.state, false);
    });
  }
  
  // Register route handler
  on(path, handler) {
    this.routes.set(path, handler);
    return this;
  }
  
  // Navigate to path
  navigate(path, state = {}, replace = false) {
    const fullState = { path, ...state };
    
    if (replace) {
      history.replaceState(fullState, '', path);
    } else {
      history.pushState(fullState, '', path);
    }
    
    this.handleNavigation(path, fullState, true);
  }
  
  // Handle route change
  handleNavigation(path, state, isForward) {
    // Find matching route
    const handler = this.routes.get(path) || this.routes.get('*');
    
    if (handler) {
      handler({ path, state, isForward });
    }
    
    this.currentRoute = path;
  }
  
  // Initialize with current URL
  start() {
    // Set initial state if needed
    if (!history.state) {
      history.replaceState({ path: location.pathname }, '', location.pathname);
    }
    
    this.handleNavigation(location.pathname, history.state, true);
  }
}

// Usage
const router = new Router();

router
  .on('/', ({ state }) => renderHome(state))
  .on('/about', ({ state }) => renderAbout(state))
  .on('/products', ({ state }) => renderProducts(state))
  .on('/products/:id', ({ state }) => renderProduct(state))
  .on('*', () => render404())
  .start();

// Navigate
document.querySelector('a.internal').addEventListener('click', (e) => {
  e.preventDefault();
  router.navigate(e.target.href);
});
```

### With Route Parameters

```javascript
class AdvancedRouter {
  constructor() {
    this.routes = [];
    
    window.addEventListener('popstate', (e) => {
      this.handleRoute(location.pathname, e.state);
    });
  }
  
  // Convert path pattern to regex
  pathToRegex(path) {
    return new RegExp(
      '^' + path
        .replace(/\//g, '\\/')
        .replace(/:(\w+)/g, '(?<$1>[^/]+)')
        + '$'
    );
  }
  
  on(path, handler) {
    this.routes.push({
      pattern: this.pathToRegex(path),
      handler
    });
    return this;
  }
  
  handleRoute(pathname, state) {
    for (const route of this.routes) {
      const match = pathname.match(route.pattern);
      if (match) {
        route.handler({
          params: match.groups || {},
          state,
          path: pathname
        });
        return;
      }
    }
    
    // No match - 404
    this.routes.find(r => r.pattern.source === '^\\*$')
      ?.handler({ path: pathname });
  }
  
  navigate(path, state = {}) {
    history.pushState(state, '', path);
    this.handleRoute(path, state);
  }
  
  start() {
    this.handleRoute(location.pathname, history.state);
  }
}

// Usage
const router = new AdvancedRouter();

router
  .on('/', () => console.log('Home'))
  .on('/users/:id', ({ params }) => {
    console.log('User ID:', params.id);
  })
  .on('/posts/:postId/comments/:commentId', ({ params }) => {
    console.log('Post:', params.postId, 'Comment:', params.commentId);
  })
  .on('*', () => console.log('404'))
  .start();
```

---

## 2.3.8 Best Practices

### Consistent State Management

```javascript
// Always include identifying info in state
function navigate(path, data = {}) {
  history.pushState({
    path,
    timestamp: Date.now(),
    ...data
  }, '', path);
}

// Validate state exists before using
window.addEventListener('popstate', (e) => {
  const state = e.state || {};
  const path = state.path || location.pathname;
  handleRoute(path, state);
});
```

### Handle Edge Cases

```javascript
// Handle refresh (no popstate, but state might exist)
document.addEventListener('DOMContentLoaded', () => {
  if (history.state) {
    // Restore from state
    restoreFromState(history.state);
  } else {
    // Initialize fresh
    initFromURL(location.pathname);
  }
});

// Handle external links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  
  const url = new URL(link.href);
  
  // Only handle same-origin links
  if (url.origin !== location.origin) return;
  
  // Skip if modifier keys (let browser handle new tab, etc.)
  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
  
  e.preventDefault();
  router.navigate(url.pathname + url.search + url.hash);
});
```

### Server-Side Considerations

```javascript
// For SPAs, server must return index.html for all routes
// Otherwise, direct access to /about returns 404

// Express example:
// app.get('*', (req, res) => {
//   res.sendFile('index.html');
// });

// Or use hash-based routing to avoid this issue
history.pushState(null, '', '/#/about');
// Server always sees / regardless of hash
```

---

## 2.3.9 Summary

| Property/Method | Purpose | Notes |
|-----------------|---------|-------|
| `length` | Number of history entries | Read-only |
| `state` | Current state object | Read-only |
| `scrollRestoration` | Scroll behavior | `'auto'` or `'manual'` |
| `back()` | Go back one page | Same as `go(-1)` |
| `forward()` | Go forward one page | Same as `go(1)` |
| `go(delta)` | Go to relative position | |
| `pushState(state, title, url)` | Add history entry | No page load |
| `replaceState(state, title, url)` | Replace current entry | No page load |

### Events

| Event | When it Fires |
|-------|---------------|
| `popstate` | Back/forward navigation or `go()` |
| Does NOT fire | `pushState()`, `replaceState()` |

### Best Practices

1. **Set initial state** with `replaceState` on page load
2. **Include path in state** for reliable restoration
3. **Handle missing state** gracefully (null check)
4. **Use `scrollRestoration = 'manual'`** for SPAs
5. **Validate state** before using properties
6. **Consider hash routing** for simpler server setup

### Common Gotchas

```javascript
// ❌ pushState doesn't trigger popstate
history.pushState(state, '', '/new');
// popstate does NOT fire!

// ❌ Cross-origin URLs throw error
history.pushState(null, '', 'https://other.com');

// ⚠️ State must be serializable
history.pushState({ fn: () => {} }, '', '/');  // Error!

// ⚠️ State is null on initial load
console.log(history.state);  // null (usually)
```

---

**End of Chapter 2.3: History Object**

Next chapter: **2.4 Navigator Object** — covers browser information, online status, geolocation, clipboard, permissions, and more.
# 2.4 Navigator Object

The `navigator` object provides information about the browser and device, as well as access to various Web APIs. It includes browser detection, online status, geolocation, clipboard access, permissions, service workers, and more. This chapter covers the most important navigator properties and APIs.

---

## 2.4.1 Browser Information

### userAgent

The user agent string identifies the browser. However, it's notoriously unreliable for browser detection.

```javascript
// Get the user agent string
console.log(navigator.userAgent);
// Chrome: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 
//          (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
// Firefox: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) 
//           Gecko/20100101 Firefox/121.0"

// ⚠️ User agent parsing is unreliable
// Many browsers include "Mozilla", "Safari", etc. for compatibility
```

### Modern Alternative: User Agent Client Hints

```javascript
// More reliable browser detection (Chromium-based only)
if (navigator.userAgentData) {
  // Available in Chrome, Edge, Opera
  console.log(navigator.userAgentData.brands);
  // [{brand: "Chromium", version: "120"}, {brand: "Google Chrome", version: "120"}]
  
  console.log(navigator.userAgentData.mobile);  // false
  console.log(navigator.userAgentData.platform);  // "Windows"
  
  // Get full details (requires promise)
  navigator.userAgentData.getHighEntropyValues([
    'architecture',
    'bitness',
    'fullVersionList',
    'model',
    'platformVersion'
  ]).then(data => {
    console.log(data);
    // { architecture: "x86", bitness: "64", ... }
  });
}
```

### Feature Detection (Preferred Approach)

```javascript
// ✅ Instead of browser detection, test for features
if ('IntersectionObserver' in window) {
  // Use Intersection Observer
} else {
  // Fall back
}

if ('serviceWorker' in navigator) {
  // Service Workers supported
}

if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
  // Modern clipboard API available
}

// ❌ Avoid this pattern
if (navigator.userAgent.includes('Chrome')) {
  // This is fragile
}
```

### Other Browser Info Properties

```javascript
// Browser language preferences
console.log(navigator.language);    // "en-US" (primary)
console.log(navigator.languages);   // ["en-US", "en", "es"]

// Platform info
console.log(navigator.platform);    // "Win32", "MacIntel", "Linux x86_64"
// ⚠️ Deprecated but still works

// Number of CPU cores (approximate)
console.log(navigator.hardwareConcurrency);  // 8

// Max touch points
console.log(navigator.maxTouchPoints);  // 0 (no touch), 10, etc.

// Browser engine
console.log(navigator.product);     // "Gecko" (always)
console.log(navigator.vendor);      // "Google Inc.", "Apple Computer, Inc."
```

---

## 2.4.2 Online/Offline Status

### Checking Connection Status

```javascript
// Current status
console.log(navigator.onLine);  // true or false

// ⚠️ onLine only indicates network connection
// Does NOT guarantee internet access
// A connected router without internet shows as online
```

### Listening for Changes

```javascript
// Online event
window.addEventListener('online', () => {
  console.log('Back online');
  showNotification('Connection restored');
  syncPendingData();
});

// Offline event
window.addEventListener('offline', () => {
  console.log('Gone offline');
  showNotification('You are offline. Changes will sync when back online.');
  enableOfflineMode();
});

// Practical implementation
class ConnectionMonitor {
  constructor() {
    this.listeners = new Set();
    this.isOnline = navigator.onLine;
    
    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }
  
  setOnline(status) {
    const wasOnline = this.isOnline;
    this.isOnline = status;
    
    if (wasOnline !== status) {
      this.notifyListeners(status);
    }
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notifyListeners(isOnline) {
    this.listeners.forEach(fn => fn(isOnline));
  }
}

const connection = new ConnectionMonitor();
connection.subscribe((online) => {
  document.body.classList.toggle('offline-mode', !online);
});
```

### Better Connection Detection

```javascript
// More reliable check: actually test connectivity
async function checkConnectivity() {
  try {
    const response = await fetch('/api/ping', {
      method: 'HEAD',
      cache: 'no-store'
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Network Information API (experimental)
if ('connection' in navigator) {
  const connection = navigator.connection;
  
  console.log(connection.type);          // 'wifi', 'cellular', etc.
  console.log(connection.effectiveType); // '4g', '3g', '2g', 'slow-2g'
  console.log(connection.downlink);      // Mbps
  console.log(connection.rtt);           // Round-trip time in ms
  console.log(connection.saveData);      // User prefers reduced data
  
  connection.addEventListener('change', () => {
    console.log('Connection type changed:', connection.effectiveType);
    if (connection.effectiveType === 'slow-2g') {
      enableLowBandwidthMode();
    }
  });
}
```

---

## 2.4.3 Cookies and Storage

### cookieEnabled

```javascript
// Check if cookies are enabled
console.log(navigator.cookieEnabled);  // true or false

if (!navigator.cookieEnabled) {
  showMessage('Cookies are required for this site to work properly.');
}

// ⚠️ This checks if cookies can be set
// Not whether they are actually working (3rd party blocks, etc.)
```

---

## 2.4.4 Geolocation

Access the user's geographic location (requires permission).

### Getting Current Position

```javascript
// Check if supported
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      console.log('Latitude:', position.coords.latitude);
      console.log('Longitude:', position.coords.longitude);
      console.log('Accuracy:', position.coords.accuracy, 'meters');
      console.log('Altitude:', position.coords.altitude);  // May be null
      console.log('Speed:', position.coords.speed);        // May be null
      console.log('Heading:', position.coords.heading);    // May be null
      console.log('Timestamp:', position.timestamp);
    },
    // Error callback
    (error) => {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          console.log('User denied location access');
          break;
        case error.POSITION_UNAVAILABLE:
          console.log('Location unavailable');
          break;
        case error.TIMEOUT:
          console.log('Request timed out');
          break;
      }
    },
    // Options
    {
      enableHighAccuracy: true,  // GPS vs network location
      timeout: 10000,            // Max wait time (ms)
      maximumAge: 60000          // Accept cached position this old (ms)
    }
  );
}
```

### Watching Position (Continuous)

```javascript
// Start watching
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    updateMap(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error('Watch error:', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 1000  // Frequent updates
  }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

### Promise Wrapper

```javascript
function getCurrentPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

// Usage
async function getLocation() {
  try {
    const position = await getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 5000
    });
    return {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    };
  } catch (error) {
    console.error('Failed to get location:', error);
    return null;
  }
}
```

---

## 2.4.5 Clipboard API

Modern async clipboard access (requires permission for read).

### Writing to Clipboard

```javascript
// Write text (no permission needed)
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied to clipboard');
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}

// Usage
copyBtn.addEventListener('click', async () => {
  const success = await copyText('Hello, clipboard!');
  if (success) {
    showToast('Copied!');
  }
});
```

### Reading from Clipboard

```javascript
// Read text (requires permission)
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('Pasted:', text);
    return text;
  } catch (error) {
    console.error('Paste failed:', error);
    // User denied permission or no clipboard access
    return null;
  }
}

// Read with permission check
pasteBtn.addEventListener('click', async () => {
  const result = await navigator.permissions.query({ name: 'clipboard-read' });
  
  if (result.state === 'denied') {
    showMessage('Clipboard access denied');
    return;
  }
  
  const text = await navigator.clipboard.readText();
  inputField.value = text;
});
```

### Writing Rich Content

```javascript
// Write HTML, images, or other formats
async function copyRichContent() {
  const blob = new Blob(['<b>Bold text</b>'], { type: 'text/html' });
  const textBlob = new Blob(['Bold text'], { type: 'text/plain' });
  
  const item = new ClipboardItem({
    'text/html': blob,
    'text/plain': textBlob
  });
  
  await navigator.clipboard.write([item]);
}

// Copy an image
async function copyImage(canvas) {
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
  
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob })
  ]);
}
```

### Reading Rich Content

```javascript
async function pasteContent() {
  const items = await navigator.clipboard.read();
  
  for (const item of items) {
    for (const type of item.types) {
      if (type === 'image/png') {
        const blob = await item.getType(type);
        const img = document.createElement('img');
        img.src = URL.createObjectURL(blob);
        document.body.appendChild(img);
      } else if (type === 'text/plain') {
        const blob = await item.getType(type);
        const text = await blob.text();
        console.log('Text:', text);
      }
    }
  }
}
```

### Fallback for Older Browsers

```javascript
async function copyWithFallback(text) {
  // Try modern API first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }
  
  // Fallback: execCommand (deprecated but works)
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    return true;
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
```

---

## 2.4.6 Permissions API

Query and request permissions for various features.

### Querying Permission Status

```javascript
// Check a permission
const result = await navigator.permissions.query({ name: 'geolocation' });

console.log(result.state);  // 'granted', 'denied', or 'prompt'

// Listen for changes
result.addEventListener('change', () => {
  console.log('Permission changed to:', result.state);
  updateUI(result.state);
});
```

### Available Permissions

```javascript
// Commonly supported permissions:
const permissions = [
  'geolocation',
  'notifications',
  'camera',
  'microphone',
  'clipboard-read',
  'clipboard-write',
  'persistent-storage'
];

// Check multiple permissions
async function checkPermissions() {
  const results = {};
  
  for (const name of permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      results[name] = result.state;
    } catch {
      results[name] = 'unsupported';
    }
  }
  
  return results;
}
```

### Permission Patterns

```javascript
// Request permission gracefully
async function requestGeolocation() {
  const status = await navigator.permissions.query({ name: 'geolocation' });
  
  if (status.state === 'granted') {
    return getPosition();
  }
  
  if (status.state === 'prompt') {
    // Show explanation before prompting
    const userConsent = await showExplanationDialog(
      'We need your location to show nearby stores.'
    );
    
    if (userConsent) {
      return getPosition();  // This triggers the browser prompt
    }
  }
  
  if (status.state === 'denied') {
    showMessage('Location access is blocked. Please enable in browser settings.');
    return null;
  }
}
```

---

## 2.4.7 Service Worker

Register and manage service workers for offline capability.

### Checking Support

```javascript
if ('serviceWorker' in navigator) {
  console.log('Service Workers supported');
}
```

### Registration

```javascript
// Register a service worker
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('SW registered:', registration.scope);
    
    // Check for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New version available
            showUpdateNotification();
          }
        }
      });
    });
    
    return registration;
  } catch (error) {
    console.error('SW registration failed:', error);
  }
}
```

### Communicating with Service Worker

```javascript
// Send message to SW
navigator.serviceWorker.controller?.postMessage({
  type: 'CACHE_URLS',
  payload: ['/images/logo.png', '/api/config']
});

// Receive messages from SW
navigator.serviceWorker.addEventListener('message', (event) => {
  console.log('Message from SW:', event.data);
});
```

---

## 2.4.8 Other Navigator APIs

### share() — Web Share API

```javascript
// Share content using native share dialog
async function shareContent(data) {
  if (!navigator.share) {
    // Fallback to custom share dialog
    showCustomShareDialog(data);
    return;
  }
  
  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url
    });
    console.log('Shared successfully');
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Share failed:', error);
    }
  }
}

// Share with files
async function shareWithFiles(files) {
  if (!navigator.canShare?.({ files })) {
    console.log('File sharing not supported');
    return;
  }
  
  await navigator.share({
    files,
    title: 'Shared files'
  });
}
```

### vibrate() — Vibration API

```javascript
// Vibrate for duration (mobile devices)
navigator.vibrate(200);  // Vibrate for 200ms

// Pattern: vibrate, pause, vibrate
navigator.vibrate([100, 50, 100]);  // vibrate 100ms, pause 50ms, vibrate 100ms

// Stop vibration
navigator.vibrate(0);

// Check support
if ('vibrate' in navigator) {
  hapticFeedback();
}
```

### getBattery() — Battery API

```javascript
// Get battery status (Chrome/Firefox)
if ('getBattery' in navigator) {
  const battery = await navigator.getBattery();
  
  console.log('Level:', battery.level * 100 + '%');
  console.log('Charging:', battery.charging);
  console.log('Charging time:', battery.chargingTime);
  console.log('Discharging time:', battery.dischargingTime);
  
  // Listen for changes
  battery.addEventListener('levelchange', () => {
    console.log('Battery level:', battery.level);
  });
  
  battery.addEventListener('chargingchange', () => {
    console.log('Charging:', battery.charging);
  });
}
```

### mediaDevices — Camera/Microphone Access

```javascript
// Access camera and microphone
async function getMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720 },
      audio: true
    });
    
    videoElement.srcObject = stream;
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.log('Permission denied');
    } else if (error.name === 'NotFoundError') {
      console.log('No camera/microphone found');
    }
    throw error;
  }
}

// List available devices
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter(d => d.kind === 'videoinput');
const mics = devices.filter(d => d.kind === 'audioinput');
```

### credentials — Credential Management

```javascript
// Store credentials
if ('credentials' in navigator) {
  const credential = new PasswordCredential({
    id: 'user@example.com',
    password: 'password123',
    name: 'John Doe'
  });
  
  await navigator.credentials.store(credential);
}

// Retrieve credentials
const credential = await navigator.credentials.get({
  password: true
});

if (credential) {
  // Auto-fill login form
  loginForm.email.value = credential.id;
  loginForm.password.value = credential.password;
}
```

---

## 2.4.9 Summary

| Property/Method | Purpose | Permission Required |
|-----------------|---------|---------------------|
| `userAgent` | Browser identification | No |
| `language`/`languages` | User language preferences | No |
| `onLine` | Network connection status | No |
| `cookieEnabled` | Cookie support check | No |
| `geolocation` | Geographic position | Yes |
| `clipboard` | Read/write clipboard | Read: Yes, Write: No* |
| `permissions` | Check/request permissions | No |
| `serviceWorker` | Offline/background features | No |
| `share()` | Native share dialog | No |
| `vibrate()` | Haptic feedback | No |
| `getBattery()` | Battery status | No |
| `mediaDevices` | Camera/microphone access | Yes |
| `credentials` | Password management | No |

### Best Practices

1. **Use feature detection** instead of browser detection
2. **Check permissions** before requesting sensitive APIs
3. **Provide fallbacks** for unsupported features
4. **Handle errors gracefully** — permissions can be denied
5. **Use secure contexts** (HTTPS) for sensitive APIs
6. **Respect user preferences** (`saveData`, reduced motion, etc.)

### Security Requirements

```javascript
// Many APIs require secure context (HTTPS)
if (window.isSecureContext) {
  // Safe to use: clipboard, geolocation, serviceWorker, etc.
} else {
  // These APIs will fail or not exist
}
```

---

**End of Chapter 2.4: Navigator Object**

Next chapter: **2.5 Screen Object** — covers screen dimensions, orientation, color depth, and multi-monitor detection.
# 2.5 Screen Object

The `screen` object provides information about the user's physical screen. This includes dimensions, color depth, orientation, and available space. While less commonly used than other BOM objects, screen information is valuable for optimizing layouts on different displays, handling multi-monitor setups, and adapting to device capabilities.

---

## 2.5.1 Screen Dimensions

### Total Screen Size

```javascript
// Full screen dimensions (physical resolution)
console.log(screen.width);   // 1920 (pixels)
console.log(screen.height);  // 1080 (pixels)

// ⚠️ These are CSS pixels, not physical pixels
// On a Retina/HiDPI display, physical pixels = CSS pixels × devicePixelRatio

const physicalWidth = screen.width * window.devicePixelRatio;
const physicalHeight = screen.height * window.devicePixelRatio;
console.log(`Physical resolution: ${physicalWidth}x${physicalHeight}`);
```

### Available Screen Size

```javascript
// Available dimensions (excluding OS taskbars, docks, etc.)
console.log(screen.availWidth);   // 1920 (or less if vertical taskbar)
console.log(screen.availHeight);  // 1040 (1080 minus taskbar height)

// The difference tells you about system UI
const taskbarHeight = screen.height - screen.availHeight;
console.log(`Taskbar/dock height: ${taskbarHeight}px`);

// Available area position (where usable space starts)
console.log(screen.availLeft);  // 0 (or offset if monitors arranged)
console.log(screen.availTop);   // 0 (or offset for top menu bar on Mac)
```

### Practical Use Cases

```javascript
// Determine if screen is large enough for a feature
function supportsFullFeatures() {
  return screen.width >= 1024 && screen.height >= 768;
}

// Calculate optimal popup size
function getPopupDimensions(preferredWidth, preferredHeight) {
  return {
    width: Math.min(preferredWidth, screen.availWidth - 50),
    height: Math.min(preferredHeight, screen.availHeight - 50)
  };
}

// Center a popup on screen
function openCenteredPopup(url, width, height) {
  const left = (screen.width - width) / 2;
  const top = (screen.height - height) / 2;
  
  window.open(
    url,
    'popup',
    `width=${width},height=${height},left=${left},top=${top}`
  );
}
```

---

## 2.5.2 Screen vs Window vs Viewport

Understanding the difference between these measurements:

```javascript
// Screen: Physical display
console.log('Screen:', screen.width, 'x', screen.height);

// Window outer: Browser window including chrome
console.log('Window:', window.outerWidth, 'x', window.outerHeight);

// Window inner (viewport): Content area including scrollbar
console.log('Viewport:', window.innerWidth, 'x', window.innerHeight);

// Document client: Content area excluding scrollbar
console.log('Client:', 
  document.documentElement.clientWidth, 'x',
  document.documentElement.clientHeight
);
```

### Visual Comparison

```
+--------------------------------------------------+
| SCREEN (screen.width × screen.height)            |
|  +--------------------------------------------+  |
|  | OS TASKBAR / DOCK                          |  |
|  +--------------------------------------------+  |
|  | BROWSER WINDOW (outerWidth × outerHeight)  |  |
|  | +----------------------------------------+ |  |
|  | | Address bar, tabs, toolbars            | |  |
|  | +----------------------------------------+ |  |
|  | | VIEWPORT (innerWidth × innerHeight)    | |  |
|  | | +------------------------------------+ | |  |
|  | | | DOCUMENT (clientWidth × clientH.)| | | |  |
|  | | |                                    |S| |  |
|  | | |                                    |c| |  |
|  | | |                                    |r| |  |
|  | | |                                    |o| |  |
|  | | |                                    |l| |  |
|  | | |                                    |l| |  |
|  | | +------------------------------------+ | |  |
|  | +----------------------------------------+ |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
```

---

## 2.5.3 Color Depth

Information about the display's color capabilities.

### colorDepth and pixelDepth

```javascript
// Bits per pixel for color
console.log(screen.colorDepth);  // 24 (typical) or 32
console.log(screen.pixelDepth);  // Usually same as colorDepth

// Common values:
// 24 = 16.7 million colors (8 bits × 3 channels)
// 32 = 24-bit color + 8-bit alpha channel

// ⚠️ Modern displays are almost always 24 or 32 bits
// Lower values are extremely rare now
```

### Use Cases

```javascript
// Adapt for low-color displays (rare but possible)
if (screen.colorDepth < 24) {
  // Use simpler graphics, avoid gradients
  document.body.classList.add('low-color-mode');
}

// Check for HDR-capable display (experimental)
if (window.matchMedia('(dynamic-range: high)').matches) {
  console.log('HDR display detected');
  enableHDRContent();
}
```

---

## 2.5.4 Screen Orientation

The `screen.orientation` API provides information about and control over screen orientation.

### Reading Orientation

```javascript
// Orientation object (modern API)
if (screen.orientation) {
  console.log(screen.orientation.type);
  // "portrait-primary", "portrait-secondary",
  // "landscape-primary", "landscape-secondary"
  
  console.log(screen.orientation.angle);
  // 0, 90, 180, or 270 degrees
}

// Simpler check using media query
if (window.matchMedia('(orientation: portrait)').matches) {
  console.log('Portrait mode');
} else {
  console.log('Landscape mode');
}
```

### Orientation Change Events

```javascript
// Modern event
screen.orientation?.addEventListener('change', () => {
  console.log('Orientation changed to:', screen.orientation.type);
  console.log('Angle:', screen.orientation.angle);
  
  handleOrientationChange(screen.orientation.type);
});

// Alternative: window event (older, more compatible)
window.addEventListener('orientationchange', () => {
  console.log('Orientation:', window.orientation);  // 0, 90, -90, 180
});

// Also works: resize event (fires on orientation change too)
window.addEventListener('resize', () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  updateLayout(isPortrait);
});

// Media query approach (most reliable)
const orientationQuery = window.matchMedia('(orientation: portrait)');
orientationQuery.addEventListener('change', (e) => {
  console.log('Portrait:', e.matches);
});
```

### Locking Orientation

```javascript
// Lock to specific orientation (fullscreen only in most browsers)
async function lockToLandscape() {
  try {
    // Must be in fullscreen for most browsers
    await document.documentElement.requestFullscreen();
    await screen.orientation.lock('landscape');
    console.log('Locked to landscape');
  } catch (error) {
    console.error('Could not lock orientation:', error);
  }
}

// Lock options:
// 'any'              - any orientation
// 'natural'          - device's natural orientation
// 'landscape'        - either landscape
// 'portrait'         - either portrait
// 'portrait-primary' - specific portrait
// 'landscape-primary' - specific landscape

// Unlock
screen.orientation.unlock();
```

### Practical Examples

```javascript
// Responsive behavior based on orientation
class OrientationHandler {
  constructor() {
    this.listeners = new Set();
    this.isPortrait = this.checkPortrait();
    
    // Use matchMedia for reliability
    const mq = window.matchMedia('(orientation: portrait)');
    mq.addEventListener('change', () => {
      this.isPortrait = this.checkPortrait();
      this.notify();
    });
  }
  
  checkPortrait() {
    return window.innerHeight > window.innerWidth;
  }
  
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  notify() {
    this.listeners.forEach(fn => fn(this.isPortrait));
  }
}

const orientation = new OrientationHandler();
orientation.subscribe((isPortrait) => {
  if (isPortrait) {
    showMobileNav();
    stackCards();
  } else {
    showSideNav();
    gridCards();
  }
});
```

---

## 2.5.5 Multi-Monitor Detection

Detecting and working with multiple displays.

### Window Placement API (Experimental)

```javascript
// Modern multi-screen API (requires permission)
if ('getScreenDetails' in window) {
  try {
    const screens = await window.getScreenDetails();
    
    console.log('Number of screens:', screens.screens.length);
    console.log('Current screen:', screens.currentScreen);
    
    screens.screens.forEach((screen, i) => {
      console.log(`Screen ${i}:`, {
        width: screen.width,
        height: screen.height,
        left: screen.left,
        top: screen.top,
        isPrimary: screen.isPrimary,
        isInternal: screen.isInternal,
        label: screen.label
      });
    });
    
    // Listen for screen changes
    screens.addEventListener('screenschange', () => {
      console.log('Screens changed');
    });
  } catch (error) {
    console.log('Multi-screen API not available or denied');
  }
}
```

### Legacy Detection

```javascript
// Check if window is on secondary monitor
function isOnSecondaryMonitor() {
  // If availLeft is non-zero, there might be monitors to the left
  // This is a heuristic, not definitive
  return screen.availLeft !== 0 || screen.availTop !== 0;
}

// Detect potential multi-monitor from screen size vs available
function estimateMultipleMonitors() {
  // If availWidth is much smaller than typical, might be extended desktop
  // This is very unreliable
  const ratio = window.outerWidth / screen.width;
  return ratio < 0.3;  // Window is small portion of screen
}
```

### Opening Windows on Specific Screens

```javascript
// With Window Placement API
async function openOnSecondaryScreen(url) {
  const screens = await window.getScreenDetails();
  const secondaryScreen = screens.screens.find(s => !s.isPrimary);
  
  if (secondaryScreen) {
    window.open(
      url,
      'secondary',
      `left=${secondaryScreen.left},top=${secondaryScreen.top},` +
      `width=${secondaryScreen.availWidth},height=${secondaryScreen.availHeight}`
    );
  } else {
    window.open(url);  // Fallback to default
  }
}
```

---

## 2.5.6 Device Pixel Ratio

While technically on `window`, this is closely related to screen capabilities.

```javascript
// Ratio of physical pixels to CSS pixels
const dpr = window.devicePixelRatio;

console.log('Device Pixel Ratio:', dpr);
// 1    = standard displays
// 1.5  = some Windows laptops
// 2    = Retina, most mobile devices
// 2+   = high-DPI mobile, 4K/5K displays

// Physical screen resolution
const physicalRes = {
  width: screen.width * dpr,
  height: screen.height * dpr
};
console.log('Physical pixels:', physicalRes);
```

### Adapting to DPR

```javascript
// Load appropriate image resolution
function getImageUrl(baseName) {
  if (devicePixelRatio >= 2) {
    return `${baseName}@2x.png`;
  } else if (devicePixelRatio >= 1.5) {
    return `${baseName}@1.5x.png`;
  }
  return `${baseName}.png`;
}

// HiDPI Canvas
function createHiDPICanvas(width, height) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set display size
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  // Set actual resolution
  canvas.width = width * devicePixelRatio;
  canvas.height = height * devicePixelRatio;
  
  // Scale context to match
  ctx.scale(devicePixelRatio, devicePixelRatio);
  
  return { canvas, ctx };
}
```

---

## 2.5.7 Media Queries for Screen Features

Using CSS media queries in JavaScript for screen detection.

```javascript
// Check for touch capability
const isTouchDevice = matchMedia('(hover: none) and (pointer: coarse)').matches;

// Check for HDR display
const isHDR = matchMedia('(dynamic-range: high)').matches;

// Check for high contrast mode
const highContrast = matchMedia('(prefers-contrast: more)').matches;

// Check display type
const isRetina = matchMedia('(min-resolution: 2dppx)').matches;
const isPrint = matchMedia('print').matches;

// Dark mode preference
const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches;

// Reduced motion preference
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
```

---

## 2.5.8 Summary

| Property | Description | Notes |
|----------|-------------|-------|
| `width`/`height` | Total screen dimensions | CSS pixels |
| `availWidth`/`availHeight` | Usable screen area | Excludes taskbar |
| `availLeft`/`availTop` | Available area offset | Multi-monitor info |
| `colorDepth` | Bits per pixel | Usually 24 or 32 |
| `pixelDepth` | Same as colorDepth | |
| `orientation.type` | Current orientation | portrait/landscape |
| `orientation.angle` | Rotation in degrees | 0, 90, 180, 270 |

### Orientation Types

| Type | Description |
|------|-------------|
| `portrait-primary` | Natural portrait |
| `portrait-secondary` | Inverted portrait |
| `landscape-primary` | Natural landscape |
| `landscape-secondary` | Inverted landscape |

### Best Practices

1. **Prefer media queries** over screen object for responsive design
2. **Use orientation events** for handling rotation
3. **Account for devicePixelRatio** on HiDPI displays
4. **Don't assume single monitor** — screen.width might span displays
5. **Test on actual devices** — emulators may report different values
6. **Consider available vs total** when sizing popups

### Common Gotchas

```javascript
// ❌ screen.width is CSS pixels, not physical
// On 4K display at 200% scaling, screen.width is 1920, not 3840

// ❌ availWidth varies by OS and settings
// Don't hard-code assumptions about taskbar size

// ❌ Orientation lock only works in fullscreen
await screen.orientation.lock('landscape');  // Fails without fullscreen

// ⚠️ Multi-monitor detection is limited
// getScreenDetails() is experimental and requires permission
```

---

**End of Chapter 2.5: Screen Object**

This completes Group 02: Browser Object Model (BOM). Next group: **03 — Events** — starting with **3.1 Event Fundamentals**.
