# Module 2: Performance Optimization

JavaScript performance impacts user experience, SEO rankings, and business metrics. This module covers techniques for writing fast, efficient JavaScript.

---

## 2.1 JavaScript Engine Optimization

### How V8 Works

```
Source Code → Parser → AST → Ignition (Interpreter) → Bytecode
                                    ↓
                              TurboFan (JIT Compiler) → Optimized Machine Code
                                    ↓
                              Deoptimization (if assumptions fail)
```

### Hidden Classes (Shapes)

V8 optimizes property access using hidden classes. Objects with the same property order share hidden classes.

```javascript
// ✅ Good: Consistent object shapes
class Point {
  constructor(x, y) {
    this.x = x;  // Same order
    this.y = y;
  }
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);  // Shares hidden class with p1

// ❌ Bad: Inconsistent shapes
function createPoint(x, y, hasZ) {
  const point = { x };
  point.y = y;
  if (hasZ) point.z = 0;  // Different shape
  return point;
}

// ❌ Bad: Adding properties dynamically
const obj = {};
obj.a = 1;
obj.b = 2;  // Shape transition
obj.c = 3;  // Another transition

// ✅ Good: Initialize all properties upfront
const obj2 = { a: 1, b: 2, c: 3 };
```

### Inline Caching

V8 caches property access locations. Polymorphic code (multiple shapes) breaks inline caching.

```javascript
// ❌ Megamorphic: Many different shapes
function getX(obj) {
  return obj.x;
}

getX({ x: 1 });
getX({ x: 2, y: 3 });
getX({ x: 3, y: 4, z: 5 });
getX({ a: 1, x: 2 });  // Different property order

// ✅ Monomorphic: Same shape
class Vector { constructor(x, y) { this.x = x; this.y = y; } }
function getVectorX(v) { return v.x; }

getVectorX(new Vector(1, 2));
getVectorX(new Vector(3, 4));  // Same shape, fast
```

### Optimization Killers

```javascript
// ❌ Avoid: try-catch in hot loops
function bad(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    try {
      sum += arr[i];  // try-catch prevents optimization
    } catch (e) {}
  }
  return sum;
}

// ✅ Better: try-catch outside
function good(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// ❌ Avoid: arguments in optimized code
function useArguments() {
  return arguments[0] + arguments[1];  // Deoptimizes
}

// ✅ Better: rest parameters
function useRest(...args) {
  return args[0] + args[1];
}

// ❌ Avoid: eval, with
function bad() {
  eval('x = 1');  // Prevents optimization
  with (obj) {}   // Never use
}

// ❌ Avoid: Changing object type
let x = 1;
x = 'string';  // Type change deoptimizes

// ✅ Better: Consistent types
let count = 0;
count = count + 1;
```

### Double vs SMI

V8 has optimized paths for Small Integers (SMI).

```javascript
// ✅ SMI range: -2³¹ to 2³¹ - 1
const arr = new Array(1000).fill(0);  // SMI

// ❌ Becomes heap number (slower)
const arr2 = new Array(1000).fill(1.5);  // Doubles
arr[0] = 1.1;  // Converts entire array to doubles

// ✅ Use TypedArrays for numeric data
const floats = new Float64Array(1000);
const ints = new Int32Array(1000);
```

---

## 2.2 Memory Management

### Memory Lifecycle

```javascript
// 1. Allocation
const obj = { data: new Array(1000) };
const str = 'x'.repeat(10000);

// 2. Usage
console.log(obj.data.length);

// 3. Release (automatic via GC)
// obj becomes unreachable when no references exist
```

### Common Memory Leaks

```javascript
// ❌ Leak: Global variables
function leak() {
  leakedVar = 'I am global';  // Missing 'let/const'
}

// ❌ Leak: Forgotten timers
const data = loadHeavyData();
setInterval(() => {
  console.log(data);  // data never collected
}, 1000);

// ✅ Fix: Clear timers
const id = setInterval(() => {}, 1000);
// When done:
clearInterval(id);

// ❌ Leak: Event listeners not removed
element.addEventListener('click', handler);
// element removed from DOM, but handler keeps reference

// ✅ Fix: Remove listeners
element.removeEventListener('click', handler);
// Or use AbortController
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
controller.abort();  // Removes all listeners with this signal

// ❌ Leak: Closures holding references
function createHandler() {
  const hugeData = new Array(1000000);
  return function() {
    // hugeData is retained even if not used
    console.log('clicked');
  };
}

// ✅ Fix: Don't close over unneeded data
function createHandler() {
  return function() {
    console.log('clicked');
  };
}

// ❌ Leak: Detached DOM nodes
let detached;
document.getElementById('btn').addEventListener('click', () => {
  const div = document.createElement('div');
  detached = div;  // Reference keeps div in memory
  document.body.appendChild(div);
  document.body.removeChild(div);  // Removed but not collected
});
```

### WeakMap and WeakSet

```javascript
// Store metadata without preventing GC
const metadata = new WeakMap();

function processElement(element) {
  metadata.set(element, { 
    processed: true, 
    timestamp: Date.now() 
  });
}

// When element is removed from DOM and unreferenced,
// metadata entry is automatically collected

// Use case: Private data
const _private = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    _private.set(this, { password });  // Hidden from enumeration
  }
  
  checkPassword(input) {
    return _private.get(this).password === input;
  }
}
```

### Memory Profiling

```javascript
// Check memory usage (Node.js)
console.log(process.memoryUsage());
// { rss, heapTotal, heapUsed, external, arrayBuffers }

// Force garbage collection (Node.js with --expose-gc)
if (global.gc) global.gc();

// Performance memory (Chrome)
console.log(performance.memory);
// { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize }
```

---

## 2.3 Rendering Performance

### Critical Rendering Path

```
HTML → DOM Tree
              ↘
                Render Tree → Layout → Paint → Composite
              ↗
CSS → CSSOM
```

### Reflow (Layout) vs Repaint

```javascript
// ❌ Forces reflow (expensive)
element.style.width = '100px';
const width = element.offsetWidth;  // Forces layout
element.style.height = '100px';     // Another reflow

// ✅ Batch reads and writes
const width = element.offsetWidth;   // Read
const height = element.offsetHeight; // Read
element.style.width = '100px';       // Write
element.style.height = '100px';      // Write (single reflow)

// Layout-triggering properties:
// offsetTop, offsetLeft, offsetWidth, offsetHeight
// scrollTop, scrollLeft, scrollWidth, scrollHeight
// clientTop, clientLeft, clientWidth, clientHeight
// getComputedStyle(), getBoundingClientRect()
```

### Compositor-Only Properties

```javascript
// ❌ Triggers layout + paint
element.style.left = '100px';
element.style.top = '50px';
element.style.width = '200px';

// ✅ Compositor only (GPU accelerated)
element.style.transform = 'translateX(100px) translateY(50px)';
element.style.opacity = 0.5;

// Properties handled by compositor:
// - transform
// - opacity
// - filter (in some cases)
```

### requestAnimationFrame

```javascript
// ❌ Don't animate with setTimeout
function badAnimate() {
  element.style.left = parseInt(element.style.left) + 1 + 'px';
  setTimeout(badAnimate, 16);
}

// ✅ Use requestAnimationFrame
function goodAnimate(timestamp) {
  element.style.transform = `translateX(${timestamp / 10}px)`;
  requestAnimationFrame(goodAnimate);
}
requestAnimationFrame(goodAnimate);

// With delta time for consistent speed
let lastTime = 0;
function animate(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  
  // Move 100px per second regardless of frame rate
  const distance = (delta / 1000) * 100;
  position += distance;
  element.style.transform = `translateX(${position}px)`;
  
  requestAnimationFrame(animate);
}
```

### Virtual Scrolling

```javascript
// Only render visible items
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.style.height = `${items.length * itemHeight}px`;
    
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    
    this.scrollContainer.appendChild(this.content);
    container.appendChild(this.scrollContainer);
    
    container.addEventListener('scroll', () => this.render());
    this.render();
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);
    
    // Only create DOM for visible items
    this.content.innerHTML = '';
    this.content.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      this.content.appendChild(item);
    }
  }
}

// Renders 10 items instead of 10,000
const list = new VirtualList(container, bigArray, 40);
```

---

## 2.4 Network Optimization

### Code Splitting

```javascript
// Static import (bundled together)
import { heavyFunction } from './heavy-module.js';

// Dynamic import (separate chunk, loaded on demand)
async function loadFeature() {
  const { heavyFunction } = await import('./heavy-module.js');
  heavyFunction();
}

// Route-based splitting (React example)
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

// Webpack magic comments
const Analytics = await import(
  /* webpackChunkName: "analytics" */
  /* webpackPrefetch: true */
  './analytics.js'
);
```

### Lazy Loading

```javascript
// Images
<img loading="lazy" src="image.jpg" alt="...">

// Intersection Observer for custom lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### Prefetching

```html
<!-- Preload critical resources -->
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- Prefetch for likely navigation -->
<link rel="prefetch" href="/next-page.js">

<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- Preconnect (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://api.example.com">
```

### Caching Strategies

```javascript
// Service Worker caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache first, then network
      if (cached) return cached;
      
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open('v1').then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});

// Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.open('v1').then(cache => cache.put(event.request, response.clone()));
        return response;
      });
      
      return cached || fetchPromise;
    })
  );
});
```

---

## 2.5 Bundle Optimization

### Tree Shaking

```javascript
// ✅ Named exports enable tree shaking
// utils.js
export function used() { return 'used'; }
export function unused() { return 'unused'; }

// main.js
import { used } from './utils.js';
used();  // unused() is removed from bundle

// ❌ Default exports can prevent tree shaking
export default {
  used() {},
  unused() {}
};

// ❌ Side effects prevent tree shaking
// analytics.js
console.log('Loaded');  // Side effect
export function track() {}

// Mark as side-effect free in package.json
{
  "sideEffects": false
}
// Or specify files with side effects
{
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```

### Bundle Analysis

```bash
# Webpack
npx webpack --analyze
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer

# Rollup
npx rollup -c --plugin visualizer
```

### Minification Tips

```javascript
// Enable property mangling for smaller bundles
// terser.config.js
{
  mangle: {
    properties: {
      regex: /^_/  // Mangle _private properties
    }
  }
}

// Use shorter property names for internal APIs
const cache = {
  _items: [],    // Mangled to single char
  _timeout: null
};
```

### Compression

```javascript
// Enable Brotli/Gzip in server
// Express.js
const compression = require('compression');
app.use(compression({ level: 6 }));

// Build-time compression
// vite.config.js
import viteCompression from 'vite-plugin-compression';
export default {
  plugins: [
    viteCompression({ algorithm: 'brotliCompress' })
  ]
}
```

---

## 2.6 Algorithm Optimization

### Time Complexity

```javascript
// O(n²) - Quadratic (avoid for large n)
function findDuplicatesSlow(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// O(n) - Linear (preferred)
function findDuplicatesFast(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}

// Benchmark
const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
console.time('slow'); findDuplicatesSlow(arr); console.timeEnd('slow');  // ~100ms
console.time('fast'); findDuplicatesFast(arr); console.timeEnd('fast');  // ~1ms
```

### Data Structure Selection

| Operation | Array | Object/Map | Set |
|-----------|-------|------------|-----|
| Access by index | O(1) | O(1) | — |
| Search | O(n) | O(1) | O(1) |
| Insert | O(n) | O(1) | O(1) |
| Delete | O(n) | O(1) | O(1) |

```javascript
// ❌ Array for frequent lookups
const users = [{ id: 1, name: 'Alice' }, ...];
function findUser(id) {
  return users.find(u => u.id === id);  // O(n)
}

// ✅ Map for frequent lookups
const usersMap = new Map(users.map(u => [u.id, u]));
function findUser(id) {
  return usersMap.get(id);  // O(1)
}

// ✅ Set for membership checks
const allowedIds = new Set([1, 2, 3, 4, 5]);
allowedIds.has(3);  // O(1)
```

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Expensive calculation
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(40);  // Fast with memoization
```

### Debounce and Throttle

```javascript
// Debounce: Wait until calls stop
function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Use: Search input, resize handlers
const search = debounce((query) => {
  fetchResults(query);
}, 300);

// Throttle: Execute at most once per interval
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Use: Scroll handlers, mouse move
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

---

## 2.7 Profiling Tools

### Performance API

```javascript
// Measure execution time
performance.mark('start');
expensiveOperation();
performance.mark('end');

performance.measure('operation', 'start', 'end');
const [measure] = performance.getEntriesByName('operation');
console.log(`Duration: ${measure.duration}ms`);

// Resource timing
const resources = performance.getEntriesByType('resource');
resources.forEach(r => {
  console.log(`${r.name}: ${r.duration}ms`);
});

// Navigation timing
const nav = performance.getEntriesByType('navigation')[0];
console.log('DOM Content Loaded:', nav.domContentLoadedEventEnd);
console.log('Load Complete:', nav.loadEventEnd);

// Long tasks
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Long task:', entry.duration, 'ms');
  });
});
observer.observe({ entryTypes: ['longtask'] });
```

### Chrome DevTools

```javascript
// Console timing
console.time('operation');
doSomething();
console.timeEnd('operation');

// Profile in code
console.profile('MyProfile');
heavyComputation();
console.profileEnd('MyProfile');

// CPU profiling steps:
// 1. DevTools → Performance tab
// 2. Click Record
// 3. Perform actions
// 4. Stop recording
// 5. Analyze flame chart

// Memory profiling:
// 1. DevTools → Memory tab
// 2. Take heap snapshot
// 3. Perform actions
// 4. Take another snapshot
// 5. Compare snapshots
```

### Lighthouse Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| FCP (First Contentful Paint) | < 1.8s | First content visible |
| LCP (Largest Contentful Paint) | < 2.5s | Largest element visible |
| FID (First Input Delay) | < 100ms | Response to first interaction |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| TTI (Time to Interactive) | < 3.8s | Fully interactive |

```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

---

## 2.8 Summary

| Category | Key Techniques |
|----------|---------------|
| **V8 Optimization** | Consistent shapes, monomorphic code, avoid deopt triggers |
| **Memory** | Clear references, use WeakMap, avoid closures over large data |
| **Rendering** | Batch DOM reads/writes, use transform/opacity, rAF |
| **Network** | Code splitting, lazy loading, prefetching, caching |
| **Bundle** | Tree shaking, compression, analyze bundle size |
| **Algorithms** | Choose right data structure, memoize, debounce/throttle |
| **Profiling** | Performance API, DevTools, Lighthouse |

### Optimization Checklist

- [ ] Profile before optimizing (measure, don't guess)
- [ ] Optimize the critical path first
- [ ] Use production builds for benchmarks
- [ ] Test on real devices, not just dev machines
- [ ] Monitor Core Web Vitals in production
- [ ] Set performance budgets
- [ ] Automate performance testing in CI

---

**End of Module 2: Performance Optimization**

Next: Module 3 — Security Best Practices
