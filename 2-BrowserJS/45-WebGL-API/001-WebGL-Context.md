# 45.1 WebGL Context

WebGL provides hardware-accelerated 3D graphics in the browser.

---

## 45.1.1 Get Context

```javascript
const canvas = document.getElementById('canvas');

// WebGL 1.0
const gl = canvas.getContext('webgl');

// WebGL 2.0
const gl2 = canvas.getContext('webgl2');

if (!gl) {
  console.error('WebGL not supported');
}
```

---

## 45.1.2 Context Options

```javascript
const gl = canvas.getContext('webgl', {
  alpha: true,              // Transparent background
  depth: true,              // Depth buffer
  stencil: false,           // Stencil buffer
  antialias: true,          // Antialiasing
  premultipliedAlpha: true, // Alpha handling
  preserveDrawingBuffer: false,
  powerPreference: 'high-performance'
});
```

---

## 45.1.3 Basic Setup

```javascript
// Set viewport
gl.viewport(0, 0, canvas.width, canvas.height);

// Clear color
gl.clearColor(0.0, 0.0, 0.0, 1.0);

// Enable depth testing
gl.enable(gl.DEPTH_TEST);

// Clear buffers
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

---

## 45.1.4 Summary

| Method | Description |
|--------|-------------|
| `getContext('webgl')` | Get WebGL 1.0 |
| `getContext('webgl2')` | Get WebGL 2.0 |
| `viewport()` | Set viewport |
| `clearColor()` | Set clear color |
| `clear()` | Clear buffers |

---

**End of Chapter 45.1: WebGL Context**

Next: **45.2 Shaders**.
