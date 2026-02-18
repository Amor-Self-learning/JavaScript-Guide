# 7.1 Canvas API

The Canvas API provides a powerful way to draw graphics via JavaScript and HTML. This chapter covers 2D rendering, shapes, paths, images, transformations, and common patterns for canvas-based applications.

---

## 7.1.1 Canvas Basics

### Creating a Canvas

```html
<canvas id="myCanvas" width="800" height="600">
  Your browser does not support canvas.
</canvas>
```

```javascript
// Get canvas element
const canvas = document.getElementById('myCanvas');

// Get 2D rendering context
const ctx = canvas.getContext('2d');

// Check if canvas is supported
if (!ctx) {
  console.error('Canvas not supported');
}
```

### Canvas Size vs CSS Size

```javascript
// Canvas has two sizes:
// 1. Actual pixel size (width/height attributes)
// 2. Display size (CSS width/height)

const canvas = document.getElementById('myCanvas');

// Pixel size (drawing resolution)
canvas.width = 1600;   // Actual pixels
canvas.height = 1200;

// CSS size (display size)
canvas.style.width = '800px';
canvas.style.height = '600px';

// This creates a 2x resolution (HiDPI/Retina support)
```

### High DPI Support

```javascript
function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Set actual pixel dimensions
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  
  // Set CSS dimensions
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  
  // Scale context
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  
  return ctx;
}
```

---

## 7.1.2 Drawing Shapes

### Rectangles

```javascript
// Fill rectangle
ctx.fillStyle = 'blue';
ctx.fillRect(10, 10, 100, 50);  // x, y, width, height

// Stroke rectangle (outline)
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
ctx.strokeRect(10, 70, 100, 50);

// Clear rectangle (transparent)
ctx.clearRect(30, 30, 50, 30);
```

### Paths

```javascript
// Drawing with paths
ctx.beginPath();          // Start new path
ctx.moveTo(50, 50);       // Move to start
ctx.lineTo(150, 50);      // Line to point
ctx.lineTo(100, 100);     // Another line
ctx.closePath();          // Close path (connect to start)

ctx.fillStyle = 'green';
ctx.fill();               // Fill the shape

ctx.strokeStyle = 'black';
ctx.stroke();             // Draw outline
```

### Arcs and Circles

```javascript
// Arc: x, y, radius, startAngle, endAngle, counterclockwise
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);  // Full circle
ctx.fill();

// Half circle
ctx.beginPath();
ctx.arc(200, 100, 50, 0, Math.PI);
ctx.stroke();

// Arc segment
ctx.beginPath();
ctx.arc(300, 100, 50, Math.PI / 4, Math.PI * 3 / 4);
ctx.lineTo(300, 100);  // Connect to center
ctx.closePath();
ctx.fill();
```

### Curves

```javascript
// Quadratic curve: control point, end point
ctx.beginPath();
ctx.moveTo(50, 200);
ctx.quadraticCurveTo(100, 100, 150, 200);  // cpx, cpy, x, y
ctx.stroke();

// Bezier curve: two control points, end point
ctx.beginPath();
ctx.moveTo(200, 200);
ctx.bezierCurveTo(220, 100, 280, 100, 300, 200);  // cp1x, cp1y, cp2x, cp2y, x, y
ctx.stroke();
```

---

## 7.1.3 Styles and Colors

### Fill and Stroke

```javascript
// Colors
ctx.fillStyle = 'red';
ctx.fillStyle = '#ff0000';
ctx.fillStyle = 'rgb(255, 0, 0)';
ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
ctx.fillStyle = 'hsl(0, 100%, 50%)';

ctx.strokeStyle = 'blue';
```

### Line Styles

```javascript
ctx.lineWidth = 5;            // Line width
ctx.lineCap = 'round';        // butt, round, square
ctx.lineJoin = 'round';       // miter, round, bevel
ctx.miterLimit = 10;          // Miter limit

// Dashed lines
ctx.setLineDash([5, 15]);     // dash pattern [dash, gap]
ctx.lineDashOffset = 0;       // Offset for animation
```

### Gradients

```javascript
// Linear gradient
const linearGrad = ctx.createLinearGradient(0, 0, 200, 0);
linearGrad.addColorStop(0, 'red');
linearGrad.addColorStop(0.5, 'yellow');
linearGrad.addColorStop(1, 'blue');
ctx.fillStyle = linearGrad;
ctx.fillRect(0, 0, 200, 100);

// Radial gradient
const radialGrad = ctx.createRadialGradient(100, 100, 20, 100, 100, 80);
radialGrad.addColorStop(0, 'white');
radialGrad.addColorStop(1, 'blue');
ctx.fillStyle = radialGrad;
ctx.beginPath();
ctx.arc(100, 100, 80, 0, Math.PI * 2);
ctx.fill();
```

### Patterns

```javascript
const img = new Image();
img.onload = function() {
  const pattern = ctx.createPattern(img, 'repeat');  // repeat, repeat-x, repeat-y, no-repeat
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, 400, 400);
};
img.src = 'texture.png';
```

---

## 7.1.4 Text

### Drawing Text

```javascript
// Font settings
ctx.font = '24px Arial';
ctx.textAlign = 'center';     // left, right, center, start, end
ctx.textBaseline = 'middle';  // top, hanging, middle, alphabetic, ideographic, bottom

// Fill text
ctx.fillStyle = 'black';
ctx.fillText('Hello Canvas', 200, 50);

// Stroke text
ctx.strokeStyle = 'red';
ctx.lineWidth = 2;
ctx.strokeText('Hello Canvas', 200, 100);

// Max width (text will be compressed)
ctx.fillText('This is a long text', 200, 150, 100);
```

### Measuring Text

```javascript
ctx.font = '20px Arial';
const text = 'Hello Canvas';
const metrics = ctx.measureText(text);

console.log('Width:', metrics.width);
console.log('Actual bounding box:', metrics.actualBoundingBoxAscent);
```

---

## 7.1.5 Images

### Drawing Images

```javascript
// Basic image drawing
const img = new Image();
img.onload = function() {
  ctx.drawImage(img, 10, 10);  // x, y
};
img.src = 'image.png';

// With size
ctx.drawImage(img, 10, 10, 100, 100);  // x, y, width, height

// Clipping (source rectangle)
ctx.drawImage(
  img,
  sx, sy, sWidth, sHeight,  // Source rectangle
  dx, dy, dWidth, dHeight   // Destination rectangle
);
```

### Pixel Manipulation

```javascript
// Get image data
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = imageData.data;  // Uint8ClampedArray [r,g,b,a, r,g,b,a, ...]

// Modify pixels (invert colors)
for (let i = 0; i < data.length; i += 4) {
  data[i] = 255 - data[i];       // Red
  data[i + 1] = 255 - data[i + 1]; // Green
  data[i + 2] = 255 - data[i + 2]; // Blue
  // data[i + 3] is alpha
}

// Put modified data back
ctx.putImageData(imageData, 0, 0);

// Create empty image data
const newImageData = ctx.createImageData(200, 200);
```

---

## 7.1.6 Transformations

### Basic Transforms

```javascript
// Save current state
ctx.save();

// Translate (move origin)
ctx.translate(100, 100);

// Rotate (in radians)
ctx.rotate(Math.PI / 4);  // 45 degrees

// Scale
ctx.scale(2, 2);  // Double size

// Draw at transformed position
ctx.fillRect(-25, -25, 50, 50);

// Restore previous state
ctx.restore();
```

### Transform Matrix

```javascript
// Set transform matrix
ctx.setTransform(a, b, c, d, e, f);
// a: scale x
// b: skew y
// c: skew x
// d: scale y
// e: translate x
// f: translate y

// Multiply current matrix
ctx.transform(a, b, c, d, e, f);

// Reset to identity matrix
ctx.resetTransform();

// Get current transform
const matrix = ctx.getTransform();
```

---

## 7.1.7 Compositing

### Global Alpha

```javascript
// Semi-transparent drawing
ctx.globalAlpha = 0.5;
ctx.fillRect(0, 0, 100, 100);
ctx.globalAlpha = 1;  // Reset
```

### Composite Operations

```javascript
// Default: new shapes drawn over existing
ctx.globalCompositeOperation = 'source-over';

// Common operations:
ctx.globalCompositeOperation = 'destination-over';  // Draw behind
ctx.globalCompositeOperation = 'destination-out';   // Erase (like cookie cutter)
ctx.globalCompositeOperation = 'lighter';           // Additive blending
ctx.globalCompositeOperation = 'multiply';          // Multiply blend
ctx.globalCompositeOperation = 'screen';            // Screen blend
ctx.globalCompositeOperation = 'overlay';           // Overlay blend
```

### Clipping

```javascript
// Create clipping path
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.clip();

// All subsequent drawing is clipped
ctx.drawImage(img, 0, 0);

// Use save/restore to limit clipping scope
ctx.save();
ctx.beginPath();
ctx.arc(100, 100, 50, 0, Math.PI * 2);
ctx.clip();
ctx.drawImage(img, 0, 0);
ctx.restore();
```

---

## 7.1.8 Exporting Canvas

### To Data URL

```javascript
// Get as base64 PNG
const pngDataUrl = canvas.toDataURL();  // default: image/png

// Get as JPEG with quality
const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.8);

// Get as WebP
const webpDataUrl = canvas.toDataURL('image/webp', 0.9);

// Use in image
img.src = pngDataUrl;

// Download
const link = document.createElement('a');
link.download = 'canvas.png';
link.href = pngDataUrl;
link.click();
```

### To Blob

```javascript
canvas.toBlob((blob) => {
  // Use blob
  const url = URL.createObjectURL(blob);
  
  // Download
  const link = document.createElement('a');
  link.download = 'canvas.png';
  link.href = url;
  link.click();
  
  URL.revokeObjectURL(url);
}, 'image/png');

// With quality (JPEG/WebP)
canvas.toBlob(callback, 'image/jpeg', 0.8);

// Promise version
const blob = await new Promise(resolve => canvas.toBlob(resolve));
```

---

## 7.1.9 OffscreenCanvas

### Background Rendering

```javascript
// Create offscreen canvas
const offscreen = new OffscreenCanvas(800, 600);
const offCtx = offscreen.getContext('2d');

// Draw on offscreen canvas
offCtx.fillStyle = 'red';
offCtx.fillRect(0, 0, 400, 300);

// Transfer to visible canvas
const bitmap = offscreen.transferToImageBitmap();
ctx.drawImage(bitmap, 0, 0);
```

### Worker Usage

```javascript
// main.js
const canvas = document.getElementById('myCanvas');
const offscreen = canvas.transferControlToOffscreen();

const worker = new Worker('canvas-worker.js');
worker.postMessage({ canvas: offscreen }, [offscreen]);

// canvas-worker.js
self.onmessage = function(e) {
  const canvas = e.data.canvas;
  const ctx = canvas.getContext('2d');
  
  // Render in worker thread
  function draw() {
    ctx.fillRect(0, 0, 100, 100);
    requestAnimationFrame(draw);
  }
  draw();
};
```

---

## 7.1.10 Animation Loop

### requestAnimationFrame

```javascript
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw frame
  update();
  render();
  
  // Request next frame
  requestAnimationFrame(draw);
}

// Start animation
requestAnimationFrame(draw);

// Stop animation
let animationId;
function start() {
  animationId = requestAnimationFrame(draw);
}
function stop() {
  cancelAnimationFrame(animationId);
}
```

### Delta Time

```javascript
let lastTime = 0;

function draw(currentTime) {
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;
  
  // Update with delta time for consistent speed
  position += velocity * deltaTime;
  
  // Draw
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(position, 100, 50, 50);
  
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);
```

---

## 7.1.11 Summary

### Context Methods

| Method | Description |
|--------|-------------|
| `fillRect(x, y, w, h)` | Fill rectangle |
| `strokeRect(x, y, w, h)` | Stroke rectangle |
| `clearRect(x, y, w, h)` | Clear rectangle |
| `beginPath()` | Start new path |
| `moveTo(x, y)` | Move to point |
| `lineTo(x, y)` | Line to point |
| `arc(x, y, r, start, end)` | Draw arc |
| `closePath()` | Close path |
| `fill()` | Fill path |
| `stroke()` | Stroke path |

### Style Properties

| Property | Description |
|----------|-------------|
| `fillStyle` | Fill color/gradient/pattern |
| `strokeStyle` | Stroke color |
| `lineWidth` | Line width |
| `lineCap` | Line end style |
| `lineJoin` | Line join style |
| `font` | Text font |
| `textAlign` | Text alignment |
| `globalAlpha` | Global opacity |

### Best Practices

1. **Use requestAnimationFrame** for animation
2. **Clear canvas** before redrawing
3. **Save/restore state** for complex transforms
4. **Use OffscreenCanvas** for heavy rendering
5. **Handle HiDPI displays** properly
6. **Batch drawing operations** when possible

---

**End of Chapter 7.1: Canvas API**

Next chapter: **7.2 WebGL** — covers 3D graphics with WebGL.
