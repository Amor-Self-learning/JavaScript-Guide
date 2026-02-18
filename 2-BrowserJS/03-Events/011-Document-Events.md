# 3.11 Document Events

Document events handle DOM readiness, document state changes, and full-screen mode. This chapter covers DOMContentLoaded, readyState, clipboard events on document, and fullscreen API events.

---

## 3.11.1 DOM Ready Events

### DOMContentLoaded

```javascript
// Fires when HTML is parsed and DOM tree is ready
// Does NOT wait for stylesheets, images, or subframes
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready');
  
  // Safe to query DOM
  const app = document.querySelector('#app');
  initializeApp(app);
});

// If script is at end of body, DOM is already ready
// But DOMContentLoaded is still useful for:
// - Scripts in <head> with defer
// - Dynamic script loading
// - Ensuring all DOM is parsed
```

### readystatechange

```javascript
// Fires when document.readyState changes
document.addEventListener('readystatechange', () => {
  console.log('State:', document.readyState);
});

// readyState values:
// "loading" - Document is loading
// "interactive" - DOM parsed (DOMContentLoaded fires here)
// "complete" - All resources loaded (load fires here)

// Wait for specific state
function waitForReady() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          resolve();
        }
      });
    }
  });
}
```

### Checking if DOM is Ready

```javascript
// Pattern for scripts that might load at any time
function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    // DOM is already ready
    callback();
  }
}

// Usage
onReady(() => {
  initializeApp();
});

// jQuery-style ready function
function $(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

$(() => {
  console.log('Ready!');
});
```

---

## 3.11.2 Visibility Events

### visibilitychange

```javascript
// Fires when page visibility changes
// More reliable than window focus/blur for tab switching
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page is now visible');
    resumeAnimations();
    checkForUpdates();
  } else if (document.visibilityState === 'hidden') {
    console.log('Page is now hidden');
    pauseAnimations();
    saveProgress();
  }
});

// Check current visibility
console.log('Hidden:', document.hidden);
console.log('State:', document.visibilityState);
// visibilityState: "visible", "hidden"
```

### Use Cases

```javascript
// Pause video when tab is hidden
const video = document.querySelector('video');

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play();
  }
});

// Pause game loop
let animationId;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    cancelAnimationFrame(animationId);
  } else {
    animationId = requestAnimationFrame(gameLoop);
  }
});

// Refresh data when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    fetchLatestData();
  }
});
```

---

## 3.11.3 Selection Events

### selectionchange

```javascript
// Fires when text selection changes
document.addEventListener('selectionchange', () => {
  const selection = document.getSelection();
  
  if (selection.toString()) {
    console.log('Selected text:', selection.toString());
    showSelectionToolbar(selection);
  } else {
    hideSelectionToolbar();
  }
});

// Get selection details
function getSelectionDetails() {
  const selection = document.getSelection();
  
  return {
    text: selection.toString(),
    rangeCount: selection.rangeCount,
    anchorNode: selection.anchorNode,
    focusNode: selection.focusNode,
    isCollapsed: selection.isCollapsed
  };
}
```

### selectstart

```javascript
// Fires when selection starts
document.addEventListener('selectstart', (e) => {
  console.log('Selection starting on:', e.target);
  
  // Prevent selection on certain elements
  if (e.target.classList.contains('no-select')) {
    e.preventDefault();
  }
});

// CSS alternative for preventing selection
// user-select: none;
```

---

## 3.11.4 Fullscreen Events

### Entering/Exiting Fullscreen

```javascript
// Request fullscreen on an element
const element = document.querySelector('.player');

async function enterFullscreen() {
  try {
    await element.requestFullscreen();
  } catch (err) {
    console.error('Fullscreen failed:', err);
  }
}

// Exit fullscreen
async function exitFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  }
}

// Toggle fullscreen
async function toggleFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await element.requestFullscreen();
  }
}
```

### fullscreenchange Event

```javascript
// Fires when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen:', document.fullscreenElement);
    showFullscreenUI();
  } else {
    console.log('Exited fullscreen');
    showNormalUI();
  }
});

// Check current state
console.log('Fullscreen element:', document.fullscreenElement);
console.log('Is fullscreen:', !!document.fullscreenElement);
console.log('Fullscreen enabled:', document.fullscreenEnabled);
```

### fullscreenerror Event

```javascript
// Fires if fullscreen request fails
document.addEventListener('fullscreenerror', (e) => {
  console.error('Fullscreen error on:', e.target);
  showError('Fullscreen not available');
});

// Common failure reasons:
// - No user gesture
// - iframe without allowfullscreen
// - Browser restrictions
```

### Fullscreen CSS

```css
/* Style fullscreen element */
:fullscreen {
  background: black;
}

/* Style backdrop (empty space) */
::backdrop {
  background: rgba(0, 0, 0, 0.9);
}

/* Different fullscreen states */
.player:fullscreen .controls {
  position: fixed;
  bottom: 20px;
}
```

---

## 3.11.5 Clipboard Events on Document

```javascript
// Document-level clipboard events
// (See chapter 3.6 for form-level clipboard events)

document.addEventListener('copy', (e) => {
  console.log('Copy event on document');
  
  // Modify copied content
  const selection = document.getSelection().toString();
  const modified = `${selection}\n\nCopied from MyApp`;
  
  e.clipboardData.setData('text/plain', modified);
  e.preventDefault();
});

document.addEventListener('cut', (e) => {
  console.log('Cut event');
});

document.addEventListener('paste', (e) => {
  const text = e.clipboardData.getData('text/plain');
  console.log('Pasted:', text);
  
  // Check for images
  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      handlePastedImage(file);
    }
  }
});
```

---

## 3.11.6 Scroll-Related Document Properties

```javascript
// Document scroll dimensions
const scrollHeight = document.documentElement.scrollHeight;
const scrollWidth = document.documentElement.scrollWidth;

// Client dimensions (viewport)
const clientHeight = document.documentElement.clientHeight;
const clientWidth = document.documentElement.clientWidth;

// Scroll position
const scrollTop = document.documentElement.scrollTop;
const scrollLeft = document.documentElement.scrollLeft;

// Scroll to position
document.documentElement.scrollTo({
  top: 0,
  behavior: 'smooth'
});

// Scroll by amount
document.documentElement.scrollBy({
  top: 100,
  behavior: 'smooth'
});
```

---

## 3.11.7 Common Patterns

### Loading Indicator

```javascript
class LoadingIndicator {
  constructor() {
    this.indicator = this.createIndicator();
    document.body.appendChild(this.indicator);
    
    // Show until DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      this.hide();
    });
    
    // Or until fully loaded
    window.addEventListener('load', () => {
      this.indicator.remove();
    });
  }
  
  createIndicator() {
    const div = document.createElement('div');
    div.className = 'loading-overlay';
    div.innerHTML = '<div class="spinner"></div>';
    return div;
  }
  
  hide() {
    this.indicator.classList.add('fade-out');
  }
}
```

### Copy-to-Clipboard Feature

```javascript
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Copied!');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
    showToast('Copied!');
  }
}
```

### Idle Detection

```javascript
class IdleDetector {
  constructor(timeout = 60000) {
    this.timeout = timeout;
    this.timer = null;
    this.isIdle = false;
    
    const events = ['mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, () => this.reset(), { passive: true });
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.goIdle();
      } else {
        this.reset();
      }
    });
    
    this.reset();
  }
  
  reset() {
    if (this.isIdle) {
      this.isIdle = false;
      this.onActive();
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.goIdle(), this.timeout);
  }
  
  goIdle() {
    this.isIdle = true;
    this.onIdle();
  }
  
  onIdle() {
    console.log('User is idle');
  }
  
  onActive() {
    console.log('User is active');
  }
}
```

---

## 3.11.8 Gotchas

```javascript
// ❌ Waiting for DOMContentLoaded when DOM is already ready
document.addEventListener('DOMContentLoaded', init);
// If script runs after DOM is ready, callback never fires!

// ✅ Check readyState first
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// ❌ Using document.body before it exists
// In <head>, document.body is null
console.log(document.body);  // null in <head>

// ✅ Wait for DOMContentLoaded or use documentElement
document.addEventListener('DOMContentLoaded', () => {
  console.log(document.body);  // Now exists
});

// ❌ Fullscreen without user gesture
requestFullscreen();  // Will fail!

// ✅ Trigger from user interaction
button.addEventListener('click', () => {
  element.requestFullscreen();
});

// ❌ Forgetting vendor prefixes for older browsers
element.requestFullscreen();  // May not work

// ✅ Use with fallbacks
function requestFullscreen(element) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    return element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    return element.msRequestFullscreen();
  }
}
```

---

## 3.11.9 Summary

### Document Ready Events

| Event | When | Target |
|-------|------|--------|
| `DOMContentLoaded` | DOM parsed | document |
| `readystatechange` | readyState changes | document |
| `load` | All resources loaded | window |

### Document States

| readyState | Meaning |
|------------|---------|
| `"loading"` | Document loading |
| `"interactive"` | DOM ready |
| `"complete"` | Fully loaded |

### Fullscreen Events

| Event | When |
|-------|------|
| `fullscreenchange` | Enter/exit fullscreen |
| `fullscreenerror` | Fullscreen request failed |

### Key Properties

| Property | Description |
|----------|-------------|
| `document.readyState` | Current loading state |
| `document.hidden` | Page visibility boolean |
| `document.visibilityState` | "visible" or "hidden" |
| `document.fullscreenElement` | Current fullscreen element |
| `document.fullscreenEnabled` | Fullscreen supported |

### Best Practices

1. **Check `readyState` before adding `DOMContentLoaded`**
2. **Use `visibilitychange` for pausing/resuming**
3. **Fullscreen requires user gesture**
4. **Use `selectionchange` for custom selection UI**
5. **Handle both DOM ready and full load as needed**

---

**End of Chapter 3.11: Document Events**

Next chapter: **3.12 Custom Events** — covers creating and dispatching CustomEvent with detail data.
