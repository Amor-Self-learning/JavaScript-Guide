# Rendering & Bundle

## Table of Contents

- [23.5 Rendering Performance](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#235-rendering-performance)
    - [Reflow and Repaint](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#reflow-and-repaint)
    - [Layout Thrashing](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#layout-thrashing)
    - [requestAnimationFrame](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#requestanimationframe)
    - [Virtual Scrolling](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#virtual-scrolling)
    - [Debouncing and Throttling](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#debouncing-and-throttling)
- [23.6 Bundle Optimization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#236-bundle-optimization)
    - [Code Splitting](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#code-splitting)
    - [Tree Shaking](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#tree-shaking)
    - [Minification](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#minification)
    - [Compression](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#compression)

---

## 23.5 Rendering Performance

Browser rendering performance is crucial for smooth user experiences.

### Reflow and Repaint

Understanding the browser's rendering pipeline helps avoid performance bottlenecks.

#### Browser Rendering Pipeline

```
1. JavaScript → 2. Style → 3. Layout → 4. Paint → 5. Composite
```

**Reflow (Layout)**: Recalculating element positions and sizes **Repaint (Paint)**: Redrawing pixels on screen **Composite**: Layering painted elements

```javascript
// EXPENSIVE: Causes reflow
element.style.width = '100px';  // Reflow + Repaint
element.style.height = '100px'; // Reflow + Repaint

// LESS EXPENSIVE: Only causes repaint
element.style.color = 'red';       // Repaint only
element.style.backgroundColor = 'blue'; // Repaint only

// CHEAP: Only causes composite
element.style.transform = 'translateX(100px)'; // Composite only
element.style.opacity = 0.5;                   // Composite only
```

#### Properties That Trigger Reflow

```javascript
// Reading these properties forces synchronous reflow
const element = document.getElementById('myElement');

// Geometric properties (SLOW - trigger reflow)
const width = element.offsetWidth;
const height = element.offsetHeight;
const top = element.offsetTop;
const left = element.offsetLeft;

const clientWidth = element.clientWidth;
const clientHeight = element.clientHeight;

const scrollTop = element.scrollTop;
const scrollHeight = element.scrollHeight;

// Getting computed style (SLOW - may trigger reflow)
const computed = window.getComputedStyle(element);
const fontSize = computed.fontSize;

// Writing these properties triggers reflow
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';
element.style.padding = '10px';
element.style.border = '1px solid black';
element.style.display = 'block';
element.style.position = 'absolute';
```

#### Batching DOM Changes

```javascript
const container = document.getElementById('container');

// BAD: Interleaved reads and writes (causes multiple reflows)
console.time('Interleaved');
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  container.appendChild(div);
  
  // Reading offsetHeight forces reflow
  const height = div.offsetHeight;
  div.style.height = (height * 2) + 'px';
}
console.timeEnd('Interleaved');

// GOOD: Batch reads, then batch writes
console.time('Batched');
const elements = [];

// Create all elements
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div');
  elements.push(div);
}

// Append all at once
const fragment = document.createDocumentFragment();
elements.forEach(el => fragment.appendChild(el));
container.appendChild(fragment); // Single reflow

// Read all heights
const heights = elements.map(el => el.offsetHeight); // Single forced reflow

// Write all heights
elements.forEach((el, i) => {
  el.style.height = (heights[i] * 2) + 'px';
}); // Single reflow

console.timeEnd('Batched');
```

#### Using DocumentFragment

```javascript
// BAD: Multiple reflows
console.time('Direct append');
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  container.appendChild(div); // Reflow each time
}
console.timeEnd('Direct append');

// GOOD: Single reflow
console.time('Fragment');
const fragment = document.createDocumentFragment();

for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div');
  div.textContent = `Item ${i}`;
  fragment.appendChild(div); // No reflow
}

container.appendChild(fragment); // Single reflow
console.timeEnd('Fragment');

// BEST: innerHTML for static content
console.time('innerHTML');
const html = Array.from({ length: 1000 }, (_, i) => 
  `<div>Item ${i}</div>`
).join('');
container.innerHTML = html; // Single reflow
console.timeEnd('innerHTML');
```

#### CSS Class Changes

```javascript
// BAD: Multiple style changes
element.style.width = '100px';
element.style.height = '100px';
element.style.backgroundColor = 'red';
element.style.border = '1px solid black';
// 4 reflows

// GOOD: Single class change
element.className = 'styled'; // 1 reflow

// Or use classList
element.classList.add('styled'); // 1 reflow

// CSS:
// .styled {
//   width: 100px;
//   height: 100px;
//   background-color: red;
//   border: 1px solid black;
// }
```

#### Avoid Forced Synchronous Layout

```javascript
// BAD: Reading property that was just modified
element.style.width = '100px';
const width = element.offsetWidth; // Forces immediate reflow!

// GOOD: Read first, then write
const width = element.offsetWidth;
element.style.width = (width * 2) + 'px';

// BETTER: Use transform instead of width
element.style.transform = 'scaleX(2)'; // No reflow!
```

### Layout Thrashing

Layout thrashing occurs when you repeatedly read and write to the DOM, forcing synchronous reflows.

#### What is Layout Thrashing

```javascript
// BAD: Layout thrashing
function updateElements() {
  const elements = document.querySelectorAll('.item');
  
  elements.forEach(el => {
    // Read (forces reflow)
    const height = el.offsetHeight;
    
    // Write (invalidates layout)
    el.style.height = (height + 10) + 'px';
    
    // Next read forces another reflow!
  });
}

// GOOD: Batch reads and writes
function updateElementsOptimized() {
  const elements = document.querySelectorAll('.item');
  
  // Batch all reads
  const heights = Array.from(elements).map(el => el.offsetHeight);
  
  // Batch all writes
  elements.forEach((el, i) => {
    el.style.height = (heights[i] + 10) + 'px';
  });
}
```

#### FastDOM Library Pattern

```javascript
// Manual read/write batching
const reads = [];
const writes = [];
let scheduled = false;

function fastdom() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => {
      // Execute all reads
      reads.forEach(fn => fn());
      reads.length = 0;
      
      // Execute all writes
      writes.forEach(fn => fn());
      writes.length = 0;
      
      scheduled = false;
    });
  }
}

function measure(fn) {
  reads.push(fn);
  fastdom();
}

function mutate(fn) {
  writes.push(fn);
  fastdom();
}

// Usage
const element = document.getElementById('box');

measure(() => {
  const height = element.offsetHeight;
  
  mutate(() => {
    element.style.height = (height + 10) + 'px';
  });
});
```

#### Intersection Observer Instead of Scroll

```javascript
// BAD: Scroll handler causes layout thrashing
window.addEventListener('scroll', () => {
  const elements = document.querySelectorAll('.lazy-load');
  
  elements.forEach(el => {
    const rect = el.getBoundingClientRect(); // Forced reflow!
    
    if (rect.top < window.innerHeight) {
      loadImage(el);
    }
  });
});

// GOOD: Use Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }
  });
}, {
  rootMargin: '50px' // Start loading 50px before visible
});

document.querySelectorAll('.lazy-load').forEach(el => {
  observer.observe(el);
});
```

### requestAnimationFrame

requestAnimationFrame synchronizes animations with the browser's refresh rate.

#### Basic Usage

```javascript
// BAD: Using setTimeout for animations
let position = 0;

function animate() {
  position += 1;
  element.style.left = position + 'px';
  
  setTimeout(animate, 16); // ~60fps, but not synchronized
}

animate();

// GOOD: Use requestAnimationFrame
let position = 0;

function animateOptimized() {
  position += 1;
  element.style.left = position + 'px';
  
  if (position < 500) {
    requestAnimationFrame(animateOptimized);
  }
}

requestAnimationFrame(animateOptimized);
```

#### Smooth Animations

```javascript
function smoothAnimate() {
  let start = null;
  const duration = 1000; // 1 second
  const element = document.getElementById('box');
  const startPosition = 0;
  const endPosition = 500;
  
  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const percentage = Math.min(progress / duration, 1);
    
    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - percentage, 3);
    
    const currentPosition = startPosition + (endPosition - startPosition) * eased;
    element.style.transform = `translateX(${currentPosition}px)`;
    
    if (progress < duration) {
      requestAnimationFrame(step);
    }
  }
  
  requestAnimationFrame(step);
}

smoothAnimate();
```

#### Canceling Animations

```javascript
let animationId = null;

function startAnimation() {
  let position = 0;
  
  function animate() {
    position += 2;
    element.style.left = position + 'px';
    
    if (position < 500) {
      animationId = requestAnimationFrame(animate);
    }
  }
  
  animationId = requestAnimationFrame(animate);
}

function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
}

// Start animation
startAnimation();

// Stop after 2 seconds
setTimeout(stopAnimation, 2000);
```

#### Performance Monitoring

```javascript
class FPSMonitor {
  constructor() {
    this.frames = [];
    this.lastTime = performance.now();
  }
  
  start() {
    const loop = (currentTime) => {
      // Calculate time since last frame
      const delta = currentTime - this.lastTime;
      this.lastTime = currentTime;
      
      // Store frame time
      this.frames.push(delta);
      
      // Keep only last 60 frames
      if (this.frames.length > 60) {
        this.frames.shift();
      }
      
      // Calculate average FPS
      if (this.frames.length > 0) {
        const avgDelta = this.frames.reduce((a, b) => a + b) / this.frames.length;
        const fps = Math.round(1000 / avgDelta);
        
        document.getElementById('fps').textContent = `${fps} FPS`;
      }
      
      requestAnimationFrame(loop);
    };
    
    requestAnimationFrame(loop);
  }
}

const monitor = new FPSMonitor();
monitor.start();
```

### Virtual Scrolling

Virtual scrolling only renders visible items, dramatically improving performance for long lists.

#### Basic Virtual Scrolling

```javascript
class VirtualScroller {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.scrollTop = 0;
    
    this.init();
  }
  
  init() {
    // Set container height to represent all items
    this.container.style.height = `${this.items.length * this.itemHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    
    // Create visible items container
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.width = '100%';
    this.container.appendChild(this.viewport);
    
    // Handle scroll
    this.container.addEventListener('scroll', () => this.handleScroll());
    
    // Initial render
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }
  
  render() {
    // Calculate which items should be visible
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(
      startIndex + this.visibleCount + 1,
      this.items.length
    );
    
    // Clear viewport
    this.viewport.innerHTML = '';
    
    // Position viewport
    this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    // Render visible items
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      this.viewport.appendChild(item);
    }
  }
}

// Usage
const container = document.getElementById('scroll-container');
const items = Array.from({ length: 100000 }, (_, i) => `Item ${i}`);

const scroller = new VirtualScroller(container, items, 50);
```

#### Advanced Virtual Scrolling with Buffer

```javascript
class AdvancedVirtualScroller {
  constructor(container, items, itemHeight, bufferSize = 5) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.bufferSize = bufferSize;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.scrollTop = 0;
    this.renderedItems = new Map();
    
    this.init();
  }
  
  init() {
    // Wrapper for total height
    this.wrapper = document.createElement('div');
    this.wrapper.style.height = `${this.items.length * this.itemHeight}px`;
    this.wrapper.style.position = 'relative';
    this.container.appendChild(this.wrapper);
    
    // Viewport for visible items
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.width = '100%';
    this.wrapper.appendChild(this.viewport);
    
    // Scroll handler with RAF
    let ticking = false;
    this.container.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    this.render();
  }
  
  handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }
  
  render() {
    const startIndex = Math.max(
      0,
      Math.floor(this.scrollTop / this.itemHeight) - this.bufferSize
    );
    const endIndex = Math.min(
      this.items.length,
      Math.ceil((this.scrollTop + this.container.clientHeight) / this.itemHeight) + this.bufferSize
    );
    
    // Remove items outside range
    for (const [index, element] of this.renderedItems) {
      if (index < startIndex || index >= endIndex) {
        element.remove();
        this.renderedItems.delete(index);
      }
    }
    
    // Add items in range
    for (let i = startIndex; i < endIndex; i++) {
      if (!this.renderedItems.has(i)) {
        const item = this.createItem(i);
        this.viewport.appendChild(item);
        this.renderedItems.set(i, item);
      }
    }
  }
  
  createItem(index) {
    const item = document.createElement('div');
    item.style.position = 'absolute';
    item.style.top = `${index * this.itemHeight}px`;
    item.style.height = `${this.itemHeight}px`;
    item.style.width = '100%';
    item.textContent = this.items[index];
    item.dataset.index = index;
    return item;
  }
}

// Usage with 1 million items
const container = document.getElementById('advanced-scroller');
const items = Array.from({ length: 1000000 }, (_, i) => `Item ${i}`);

const scroller = new AdvancedVirtualScroller(container, items, 40, 10);
```

### Debouncing and Throttling

Rate limiting for event handlers improves performance.

#### Debouncing

Debouncing delays function execution until after a pause in events.

```javascript
// Basic debounce
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage: Search input
const searchInput = document.getElementById('search');

// BAD: Fires on every keystroke
searchInput.addEventListener('input', (e) => {
  performSearch(e.target.value); // Expensive!
});

// GOOD: Debounced - only fires after user stops typing
const debouncedSearch = debounce((value) => {
  performSearch(value);
}, 300);

searchInput.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

function performSearch(query) {
  console.log('Searching for:', query);
  // Make API call...
}
```

#### Advanced Debounce with Leading/Trailing

```javascript
function advancedDebounce(func, delay, { leading = false, trailing = true } = {}) {
  let timeoutId;
  let lastArgs;
  
  return function(...args) {
    lastArgs = args;
    
    const callNow = leading && !timeoutId;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      if (trailing) {
        func.apply(this, lastArgs);
      }
      timeoutId = null;
    }, delay);
    
    if (callNow) {
      func.apply(this, args);
    }
  };
}

// Leading: Execute immediately, then wait
const leadingDebounce = advancedDebounce(handleResize, 300, { leading: true, trailing: false });

// Trailing: Wait, then execute (default)
const trailingDebounce = advancedDebounce(handleResize, 300, { trailing: true });

// Both: Execute immediately, then again after pause
const bothDebounce = advancedDebounce(handleResize, 300, { leading: true, trailing: true });

function handleResize() {
  console.log('Window resized:', window.innerWidth);
}

window.addEventListener('resize', leadingDebounce);
```

#### Throttling

Throttling limits function execution to once per time interval.

```javascript
// Basic throttle
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage: Scroll handler
// BAD: Fires hundreds of times per second
window.addEventListener('scroll', () => {
  updateScrollProgress(); // Expensive!
});

// GOOD: Throttled - fires at most once per 100ms
const throttledScroll = throttle(() => {
  updateScrollProgress();
}, 100);

window.addEventListener('scroll', throttledScroll);

function updateScrollProgress() {
  const scrollTop = window.pageYOffset;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = (scrollTop / docHeight) * 100;
  
  document.getElementById('progress').style.width = `${progress}%`;
}
```

#### Advanced Throttle with Leading/Trailing

```javascript
function advancedThrottle(func, limit, { leading = true, trailing = true } = {}) {
  let timeout;
  let lastRan;
  let lastFunc;
  
  return function(...args) {
    const context = this;
    
    if (!lastRan) {
      if (leading) {
        func.apply(context, args);
      }
      lastRan = Date.now();
    } else {
      clearTimeout(timeout);
      
      lastFunc = () => {
        if (Date.now() - lastRan >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      };
      
      timeout = setTimeout(() => {
        if (trailing) {
          lastFunc();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

// Mouse move throttling
const throttledMouseMove = advancedThrottle((e) => {
  console.log('Mouse position:', e.clientX, e.clientY);
}, 100);

document.addEventListener('mousemove', throttledMouseMove);
```

#### RequestAnimationFrame Throttle

```javascript
// Throttle to animation frame (best for visual updates)
function rafThrottle(func) {
  let requestId;
  let lastArgs;
  
  const later = (context) => () => {
    requestId = null;
    func.apply(context, lastArgs);
  };
  
  return function(...args) {
    lastArgs = args;
    
    if (!requestId) {
      requestId = requestAnimationFrame(later(this));
    }
  };
}

// Perfect for scroll animations
const rafScrollHandler = rafThrottle(() => {
  const scrollTop = window.pageYOffset;
  
  // Update parallax elements
  document.querySelectorAll('.parallax').forEach(el => {
    const speed = el.dataset.speed || 0.5;
    el.style.transform = `translateY(${scrollTop * speed}px)`;
  });
});

window.addEventListener('scroll', rafScrollHandler);
```

---

## 23.6 Bundle Optimization

Optimizing JavaScript bundles reduces load time and improves performance.

### Code Splitting

Split code into smaller chunks loaded on demand.

#### Dynamic Imports

```javascript
// Instead of importing everything upfront
import heavyLibrary from 'heavy-library';
import anotherLib from 'another-lib';
import utils from './utils';

// Dynamic import - load only when needed
async function processSpecialData(data) {
  if (data.requiresHeavyProcessing) {
    // Load heavy library only when needed
    const { default: heavyLibrary } = await import('heavy-library');
    return heavyLibrary.process(data);
  }
  
  return simpleProcess(data);
}

// Route-based code splitting
async function loadRoute(routeName) {
  switch (routeName) {
    case 'home':
      const { HomePage } = await import('./pages/HomePage');
      return HomePage;
    
    case 'dashboard':
      const { Dashboard } = await import('./pages/Dashboard');
      return Dashboard;
    
    case 'settings':
      const { Settings } = await import('./pages/Settings');
      return Settings;
    
    default:
      const { NotFound } = await import('./pages/NotFound');
      return NotFound;
  }
}
```

#### Webpack Code Splitting

```javascript
// webpack.config.js
module.exports = {
  entry: './src/index.js',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].[contenthash].chunk.js'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk for node_modules
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        // Common chunk for shared code
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    }
  }
};

// Magic comments for webpack
// Named chunks
import(/* webpackChunkName: "heavy-feature" */ './heavyFeature');

// Prefetch (load during idle time)
import(/* webpackPrefetch: true */ './futureFeature');

// Preload (load in parallel with parent)
import(/* webpackPreload: true */ './criticalFeature');
```

#### React Lazy Loading

```javascript
import React, { Suspense, lazy } from 'react';

// Lazy load components
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Profile = lazy(() => import('./Profile'));

function App() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Suspense>
    </div>
  );
}

// With error boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### Tree Shaking

Remove unused code from the final bundle.

#### ES6 Modules for Tree Shaking

```javascript
// utils.js - Use named exports
export function usedFunction() {
  return 'This is used';
}

export function unusedFunction() {
  return 'This is never imported';
}

export function anotherUnusedFunction() {
  return 'Also never imported';
}

// main.js - Only import what you need
import { usedFunction } from './utils';

console.log(usedFunction());

// Bundle will only include usedFunction, not the unused ones
```

#### Side Effects

```javascript
// package.json - Mark packages as side-effect free
{
  "name": "my-package",
  "sideEffects": false  // No side effects, safe to tree-shake
}

// Or specify files with side effects
{
  "name": "my-package",
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

// Code with side effects (can't be tree-shaken)
// globals.js
window.myGlobal = 'value';  // Side effect!

export function myFunction() {
  return 'hello';
}

// Code without side effects (can be tree-shaken)
// pure.js
export function add(a, b) {
  return a + b;  // Pure function, no side effects
}
```

#### Webpack Tree Shaking Configuration

```javascript
// webpack.config.js
module.exports = {
  mode: 'production', // Enables tree shaking
  optimization: {
    usedExports: true,  // Mark unused exports
    minimize: true,      // Remove unused code
    sideEffects: true    // Respect package.json sideEffects
  }
};

// Lodash tree shaking
// BAD: Imports entire lodash
import _ from 'lodash';
_.map([1, 2, 3], n => n * 2);

// GOOD: Import only what you need
import map from 'lodash/map';
map([1, 2, 3], n => n * 2);

// BETTER: Use lodash-es (ES6 modules)
import { map } from 'lodash-es';
map([1, 2, 3], n => n * 2);
```

#### Analyzing Bundle Size

```javascript
// Install webpack-bundle-analyzer
// npm install --save-dev webpack-bundle-analyzer

// webpack.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename: 'bundle-report.html',
      openAnalyzer: false
    })
  ]
};

// Run build and open bundle-report.html to see what's in your bundle
```

### Minification

Reduce code size by removing whitespace and shortening names.

#### Terser for JavaScript

```javascript
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,      // Remove console.log
            drop_debugger: true,     // Remove debugger
            pure_funcs: ['console.info', 'console.debug']  // Remove specific functions
          },
          mangle: {
            safari10: true  // Fix Safari 10 issues
          },
          format: {
            comments: false  // Remove comments
          }
        },
        extractComments: false  // Don't create separate LICENSE file
      })
    ]
  }
};

// Before minification:
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price * items[i].quantity;
  }
  return total;
}

// After minification:
function c(t){let e=0;for(let r=0;r<t.length;r++)e+=t[r].price*t[r].quantity;return e}
```

#### CSS Minification

```javascript
// Install css-minimizer-webpack-plugin
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              minifyFontValues: true
            }
          ]
        }
      })
    ]
  }
};

// Before:
.container {
  background-color: #ffffff;
  margin: 10px 10px 10px 10px;
  padding: 0px;
}

// After:
.container{background-color:#fff;margin:10px;padding:0}
```

#### HTML Minification

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
      }
    })
  ]
};
```

### Compression

Compress assets for faster transfer over the network.

#### Gzip Compression

```javascript
// Server-side (Express)
const compression = require('compression');
const express = require('express');

const app = express();

// Enable gzip compression
app.use(compression({
  level: 6,  // Compression level (0-9)
  threshold: 1024,  // Only compress files > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't accept gzip
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

app.use(express.static('public'));

app.listen(3000);
```

#### Brotli Compression

```javascript
// Webpack plugin for pre-compression
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');

module.exports = {
  plugins: [
    // Gzip compression
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240,  // Only compress files > 10KB
      minRatio: 0.8      // Only compress if size reduction > 20%
    }),
    
    // Brotli compression (better than gzip)
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      },
      threshold: 10240,
      minRatio: 0.8
    })
  ]
};

// Server-side (Express) - Serve pre-compressed files
const express = require('express');
const expressStaticGzip = require('express-static-gzip');

const app = express();

app.use('/', expressStaticGzip('public', {
  enableBrotli: true,
  orderPreference: ['br', 'gz']  // Prefer brotli over gzip
}));

app.listen(3000);
```

#### Content-Type Specific Compression

```javascript
// Server configuration
app.use(compression({
  filter: (req, res) => {
    const contentType = res.getHeader('Content-Type');
    
    // Compress these types
    const compressible = [
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
      'application/json',
      'application/xml',
      'image/svg+xml'
    ];
    
    return compressible.some(type => contentType && contentType.includes(type));
  }
}));
```

#### Image Compression

```javascript
// Webpack image optimization
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

module.exports = {
  optimization: {
    minimizer: [
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ['imagemin-mozjpeg', { quality: 80 }],
              ['imagemin-pngquant', { quality: [0.6, 0.8] }],
              ['imagemin-svgo', {
                plugins: [
                  {
                    name: 'removeViewBox',
                    active: false
                  }
                ]
              }]
            ]
          }
        }
      })
    ]
  }
};

// Modern format generation
new ImageMinimizerPlugin({
  generator: [
    {
      preset: 'webp',
      implementation: ImageMinimizerPlugin.imageminGenerate,
      options: {
        plugins: ['imagemin-webp']
      }
    }
  ]
});

// Usage in HTML
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Fallback">
</picture>
```

---

## Summary

This document covered Rendering and Bundle Optimization:

**Rendering Performance:**

- Reflow and repaint (rendering pipeline, batching changes, DocumentFragment, CSS classes)
- Layout thrashing (read/write separation, FastDOM pattern, Intersection Observer)
- requestAnimationFrame (smooth animations, FPS monitoring, cancellation)
- Virtual scrolling (basic implementation, advanced with buffer)
- Debouncing and throttling (rate limiting, leading/trailing options, RAF throttle)

**Bundle Optimization:**

- Code splitting (dynamic imports, webpack configuration, React lazy loading)
- Tree shaking (ES6 modules, side effects, webpack config, bundle analysis)
- Minification (JavaScript with Terser, CSS, HTML)
- Compression (gzip, brotli, pre-compression, image optimization)

These optimizations reduce bundle size, improve load times, and create smooth user experiences.

---

**Related Topics:**

- Service Workers
- Progressive Web Apps
- HTTP/2 and HTTP/3
- CDN Configuration
- Critical CSS