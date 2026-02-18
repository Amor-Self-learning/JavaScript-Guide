# 3.10 Window Events

Window events handle page lifecycle, viewport changes, and user departure. This chapter covers load events, resize, scroll, visibility, and beforeunload for exit confirmation.

---

## 3.10.1 Load Events

### load Event

```javascript
// Fires when entire page is loaded (including images, stylesheets, etc.)
window.addEventListener('load', () => {
  console.log('Page fully loaded');
  console.log('All images loaded');
  console.log('All stylesheets applied');
  
  // Safe to interact with images
  const img = document.querySelector('img');
  console.log('Image dimensions:', img.naturalWidth, img.naturalHeight);
});

// Also fires on individual elements
const img = document.querySelector('img');
img.addEventListener('load', () => {
  console.log('This image loaded');
});
```

### DOMContentLoaded vs load

```javascript
// DOMContentLoaded: HTML parsed, DOM ready
// (Fires BEFORE images and stylesheets finish loading)
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready!');
  // Safe to query DOM
  // Images may still be loading
});

// load: Everything finished
window.addEventListener('load', () => {
  console.log('Everything loaded!');
  // All resources ready
});

// Typical order:
// 1. DOMContentLoaded
// 2. Images load
// 3. Stylesheets load
// 4. window.load
```

### error Event

```javascript
// Handle resource loading errors
const img = document.querySelector('img');

img.addEventListener('error', () => {
  console.log('Image failed to load');
  img.src = 'fallback.png';
});

// Global error handler
window.addEventListener('error', (e) => {
  if (e.target !== window) {
    // Resource loading error
    console.log('Resource failed:', e.target.src || e.target.href);
  } else {
    // JavaScript error
    console.log('JS error:', e.message);
  }
});
```

---

## 3.10.2 Resize Event

### Basic Usage

```javascript
window.addEventListener('resize', () => {
  console.log('Window resized');
  console.log('New size:', window.innerWidth, window.innerHeight);
});

// ⚠️ Fires frequently during resize
// Debounce for performance
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    handleResize();
  }, 100);
});
```

### Window Dimensions

```javascript
// Viewport size (excluding scrollbars)
console.log('Inner:', window.innerWidth, window.innerHeight);

// Outer window size (including chrome)
console.log('Outer:', window.outerWidth, window.outerHeight);

// Screen size
console.log('Screen:', screen.width, screen.height);

// Available screen (minus taskbar)
console.log('Available:', screen.availWidth, screen.availHeight);
```

### ResizeObserver Alternative

```javascript
// For element resizing (more efficient than window resize)
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    console.log('Element resized:', entry.contentRect.width);
  }
});

observer.observe(document.querySelector('.container'));
```

---

## 3.10.3 Scroll Events

### Basic Scroll Handling

```javascript
window.addEventListener('scroll', () => {
  console.log('Scroll position:', window.scrollX, window.scrollY);
});

// ⚠️ Fires very frequently
// Use passive listener for performance
window.addEventListener('scroll', handleScroll, { passive: true });
```

### Throttling Scroll

```javascript
// Throttle scroll handler
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

function handleScroll() {
  const scrollY = window.scrollY;
  // Handle scroll
}
```

### Scroll Position

```javascript
// Current scroll position
const scrollX = window.scrollX;  // or pageXOffset
const scrollY = window.scrollY;  // or pageYOffset

// Document dimensions
const docHeight = document.documentElement.scrollHeight;
const docWidth = document.documentElement.scrollWidth;

// Viewport dimensions
const viewHeight = window.innerHeight;
const viewWidth = window.innerWidth;

// Scroll progress (0 to 1)
const progress = scrollY / (docHeight - viewHeight);
```

### Scroll-Based Animations

```javascript
// Progress bar
const progressBar = document.querySelector('.progress');

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = window.scrollY / scrollable;
  progressBar.style.width = `${progress * 100}%`;
}, { passive: true });

// Reveal on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
```

---

## 3.10.4 Page Lifecycle Events

### beforeunload

```javascript
// Prompt before leaving (for unsaved changes)
window.addEventListener('beforeunload', (e) => {
  if (hasUnsavedChanges) {
    // Modern browsers ignore custom messages
    e.preventDefault();
    // Some browsers require returnValue
    e.returnValue = '';
    return '';
  }
});

// Only attach when needed
function markUnsaved() {
  hasUnsavedChanges = true;
  window.addEventListener('beforeunload', handleBeforeUnload);
}

function markSaved() {
  hasUnsavedChanges = false;
  window.removeEventListener('beforeunload', handleBeforeUnload);
}
```

### unload (Deprecated)

```javascript
// ⚠️ Deprecated - avoid using
// Prevents back-forward cache (bfcache)
window.addEventListener('unload', () => {
  // Don't use this!
});

// ✅ Use pagehide instead
window.addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // Page is being cached
  } else {
    // Page is being unloaded
  }
  
  // Send analytics
  navigator.sendBeacon('/analytics', data);
});
```

### visibilitychange

```javascript
// Fires when page becomes visible/hidden
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page is visible');
    resumeVideo();
    reconnectWebSocket();
  } else {
    console.log('Page is hidden');
    pauseVideo();
    // visibilityState can be: "visible", "hidden"
  }
});

// Check current state
console.log('Hidden:', document.hidden);
console.log('State:', document.visibilityState);
```

### pageshow and pagehide

```javascript
// Better alternatives to load/unload for bfcache compatibility

window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    // Restored from bfcache
    console.log('Page restored from cache');
    refreshData();
  } else {
    // Fresh page load
    console.log('Fresh page load');
  }
});

window.addEventListener('pagehide', (e) => {
  if (e.persisted) {
    // Being put in bfcache
    console.log('Page may be cached');
  }
});
```

---

## 3.10.5 Online/Offline Events

```javascript
// Detect connection changes
window.addEventListener('online', () => {
  console.log('Back online');
  syncData();
  showNotification('Connection restored');
});

window.addEventListener('offline', () => {
  console.log('Gone offline');
  showNotification('You are offline');
});

// Check current state
console.log('Online:', navigator.onLine);
```

---

## 3.10.6 Print Events

```javascript
// Before print dialog opens
window.addEventListener('beforeprint', () => {
  console.log('Preparing to print');
  expandAllSections();
  showPrintStyles();
});

// After print dialog closes
window.addEventListener('afterprint', () => {
  console.log('Print finished/cancelled');
  restoreNormalView();
});

// Alternative: matchMedia
const printQuery = window.matchMedia('print');
printQuery.addEventListener('change', (e) => {
  if (e.matches) {
    // Entering print mode
  } else {
    // Exiting print mode
  }
});
```

---

## 3.10.7 Focus Events

```javascript
// Window gains focus
window.addEventListener('focus', () => {
  console.log('Window focused');
  document.title = 'My App';
});

// Window loses focus
window.addEventListener('blur', () => {
  console.log('Window blurred');
  document.title = '(Paused) My App';
});

// Check if window has focus
console.log('Has focus:', document.hasFocus());
```

---

## 3.10.8 Common Patterns

### Sticky Header

```javascript
const header = document.querySelector('header');
const headerTop = header.offsetTop;

window.addEventListener('scroll', () => {
  if (window.scrollY >= headerTop) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
}, { passive: true });
```

### Infinite Scroll

```javascript
function setupInfiniteScroll() {
  let loading = false;
  
  window.addEventListener('scroll', async () => {
    if (loading) return;
    
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    
    // Load more when near bottom
    if (docHeight - scrollBottom < 200) {
      loading = true;
      await loadMoreContent();
      loading = false;
    }
  }, { passive: true });
}
```

### Unsaved Changes Warning

```javascript
class UnsavedChangesGuard {
  constructor(form) {
    this.form = form;
    this.hasChanges = false;
    
    form.addEventListener('input', () => {
      this.hasChanges = true;
    });
    
    form.addEventListener('submit', () => {
      this.hasChanges = false;
    });
    
    window.addEventListener('beforeunload', (e) => {
      if (this.hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }
}
```

### Responsive Breakpoints

```javascript
class BreakpointWatcher {
  constructor(breakpoints) {
    this.breakpoints = breakpoints;
    this.current = this.getCurrent();
    
    window.addEventListener('resize', this.checkBreakpoint.bind(this));
  }
  
  getCurrent() {
    const width = window.innerWidth;
    for (const [name, minWidth] of Object.entries(this.breakpoints)) {
      if (width >= minWidth) return name;
    }
    return 'xs';
  }
  
  checkBreakpoint() {
    const newBreakpoint = this.getCurrent();
    if (newBreakpoint !== this.current) {
      this.current = newBreakpoint;
      this.onChange(newBreakpoint);
    }
  }
  
  onChange(breakpoint) {
    document.body.dataset.breakpoint = breakpoint;
  }
}

new BreakpointWatcher({
  xl: 1200,
  lg: 992,
  md: 768,
  sm: 576
});
```

---

## 3.10.9 Gotchas

```javascript
// ❌ Using unload event (breaks bfcache)
window.addEventListener('unload', sendAnalytics);

// ✅ Use pagehide or sendBeacon
window.addEventListener('pagehide', () => {
  navigator.sendBeacon('/analytics', data);
});

// ❌ Not throttling scroll/resize handlers
window.addEventListener('scroll', heavyComputation);

// ✅ Throttle with requestAnimationFrame
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      heavyComputation();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

// ❌ Using passive: false on scroll without needing preventDefault
window.addEventListener('scroll', handler);  // Non-passive by default

// ✅ Use passive: true when not preventing default
window.addEventListener('scroll', handler, { passive: true });

// ❌ Relying on navigator.onLine for actual connectivity
if (navigator.onLine) {
  // Might be online but server unreachable!
}

// ✅ Actually test connectivity
async function isOnline() {
  try {
    await fetch('/ping', { method: 'HEAD' });
    return true;
  } catch {
    return false;
  }
}
```

---

## 3.10.10 Summary

### Window Events

| Event | When |
|-------|------|
| `load` | Page fully loaded (all resources) |
| `DOMContentLoaded` | DOM parsed (document event) |
| `beforeunload` | Before leaving page |
| `pagehide` | Page is being hidden/unloaded |
| `pageshow` | Page is shown (including bfcache) |

### Viewport Events

| Event | When |
|-------|------|
| `resize` | Window size changes |
| `scroll` | Page is scrolled |

### Visibility Events

| Event | When |
|-------|------|
| `visibilitychange` | Page visibility changes (document event) |
| `focus` | Window gains focus |
| `blur` | Window loses focus |
| `online` | Connection restored |
| `offline` | Connection lost |

### Best Practices

1. **Use `DOMContentLoaded`** for DOM manipulation, `load` for resources
2. **Use `pagehide`** instead of `unload` (bfcache friendly)
3. **Throttle scroll/resize** with `requestAnimationFrame`
4. **Use `passive: true`** for scroll handlers when possible
5. **Use `sendBeacon`** for analytics on page leave
6. **Only attach `beforeunload`** when actually needed

---

**End of Chapter 3.10: Window Events**

Next chapter: **3.11 Document Events** — covers DOMContentLoaded, readystatechange, visibilitychange, and fullscreen events.
