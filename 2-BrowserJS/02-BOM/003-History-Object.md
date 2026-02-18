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
