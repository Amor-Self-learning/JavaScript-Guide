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
