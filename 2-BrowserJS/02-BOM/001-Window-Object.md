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
