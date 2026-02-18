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
# 7.2 WebGL

WebGL enables hardware-accelerated 3D and 2D graphics in the browser. This chapter covers the basics of WebGL, shaders, buffers, textures, and common patterns for 3D rendering.

---

## 7.2.1 WebGL Basics

### Getting WebGL Context

```javascript
const canvas = document.getElementById('canvas');

// Try WebGL 2 first, fall back to WebGL 1
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (!gl) {
  console.error('WebGL not supported');
}

// Context options
const gl = canvas.getContext('webgl', {
  alpha: true,                // Transparent background
  antialias: true,           // Smooth edges
  depth: true,               // Depth buffer
  preserveDrawingBuffer: false,  // Don't preserve buffer
  powerPreference: 'high-performance'  // GPU preference
});
```

### WebGL Pipeline Overview

```javascript
// 1. Create shaders (vertex + fragment)
// 2. Create program (link shaders)
// 3. Create buffers (vertices, indices)
// 4. Bind attributes and uniforms
// 5. Draw

// Clear screen
gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Black
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

---

## 7.2.2 Shaders

### Vertex Shader

```javascript
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec4 a_color;
  
  uniform mat4 u_modelViewProjection;
  
  varying vec4 v_color;
  
  void main() {
    gl_Position = u_modelViewProjection * a_position;
    v_color = a_color;
  }
`;
```

### Fragment Shader

```javascript
const fragmentShaderSource = `
  precision mediump float;
  
  varying vec4 v_color;
  
  void main() {
    gl_FragColor = v_color;
  }
`;
```

### Compiling Shaders

```javascript
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  // Check for errors
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
```

### Creating Program

```javascript
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);
```

---

## 7.2.3 Buffers

### Creating Vertex Buffer

```javascript
// Triangle vertices (x, y, z)
const vertices = new Float32Array([
  0.0,  0.5, 0.0,   // Top
 -0.5, -0.5, 0.0,   // Bottom left
  0.5, -0.5, 0.0    // Bottom right
]);

// Create buffer
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
```

### Index Buffer

```javascript
// For indexed drawing (reuse vertices)
const indices = new Uint16Array([0, 1, 2]);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
```

### Binding Attributes

```javascript
// Get attribute location
const positionLocation = gl.getAttribLocation(program, 'a_position');

// Bind buffer
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

// Configure attribute
gl.vertexAttribPointer(
  positionLocation,  // Attribute location
  3,                 // Components per vertex (x, y, z)
  gl.FLOAT,          // Data type
  false,             // Normalize
  0,                 // Stride (0 = auto)
  0                  // Offset
);

// Enable attribute
gl.enableVertexAttribArray(positionLocation);
```

---

## 7.2.4 Uniforms

### Setting Uniforms

```javascript
const colorLocation = gl.getUniformLocation(program, 'u_color');
const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

// Single float
gl.uniform1f(location, value);

// Float vector
gl.uniform2f(location, x, y);
gl.uniform3f(location, x, y, z);
gl.uniform4f(location, x, y, z, w);

// Float array
gl.uniform3fv(location, [r, g, b]);

// Matrix
gl.uniformMatrix4fv(matrixLocation, false, matrix);
```

---

## 7.2.5 Drawing

### Basic Drawing

```javascript
// Clear canvas
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Draw triangles
gl.drawArrays(gl.TRIANGLES, 0, 3);  // mode, first, count

// Draw modes:
// gl.POINTS
// gl.LINES
// gl.LINE_STRIP
// gl.LINE_LOOP
// gl.TRIANGLES
// gl.TRIANGLE_STRIP
// gl.TRIANGLE_FAN
```

### Indexed Drawing

```javascript
// Bind index buffer
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

// Draw with indices
gl.drawElements(
  gl.TRIANGLES,      // Mode
  indices.length,    // Count
  gl.UNSIGNED_SHORT, // Type
  0                  // Offset
);
```

---

## 7.2.6 Textures

### Loading Texture

```javascript
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Placeholder until image loads
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA,
    1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 255, 255])  // Blue pixel
  );
  
  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA,
      gl.RGBA, gl.UNSIGNED_BYTE, image
    );
    
    // Set texture parameters
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      gl.generateMipmap(gl.TEXTURE_2D);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;
  
  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) === 0;
}
```

### Using Textures

```javascript
// In fragment shader
const fragmentShader = `
  precision mediump float;
  varying vec2 v_texCoord;
  uniform sampler2D u_texture;
  
  void main() {
    gl_FragColor = texture2D(u_texture, v_texCoord);
  }
`;

// Bind texture
gl.activeTexture(gl.TEXTURE0);
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.uniform1i(textureLocation, 0);  // Texture unit 0
```

---

## 7.2.7 3D Transformations

### Matrix Operations

```javascript
// Using a matrix library (glMatrix)
const modelMatrix = mat4.create();
const viewMatrix = mat4.create();
const projectionMatrix = mat4.create();

// Model transform
mat4.translate(modelMatrix, modelMatrix, [0, 0, -5]);
mat4.rotateY(modelMatrix, modelMatrix, rotation);
mat4.scale(modelMatrix, modelMatrix, [1, 1, 1]);

// View transform (camera)
mat4.lookAt(viewMatrix, 
  [0, 0, 5],   // Camera position
  [0, 0, 0],   // Look at
  [0, 1, 0]    // Up vector
);

// Projection
mat4.perspective(projectionMatrix,
  Math.PI / 4,              // Field of view (radians)
  canvas.width / canvas.height,  // Aspect ratio
  0.1,                      // Near plane
  100.0                     // Far plane
);

// Combined matrix
const mvpMatrix = mat4.create();
mat4.multiply(mvpMatrix, projectionMatrix, viewMatrix);
mat4.multiply(mvpMatrix, mvpMatrix, modelMatrix);

// Send to shader
gl.uniformMatrix4fv(matrixLocation, false, mvpMatrix);
```

---

## 7.2.8 Depth and Culling

### Depth Testing

```javascript
// Enable depth testing
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);

// Clear depth buffer
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
```

### Face Culling

```javascript
// Enable culling (don't render back faces)
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);    // Cull back faces
gl.frontFace(gl.CCW);    // Counter-clockwise = front
```

### Blending

```javascript
// Enable blending for transparency
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
```

---

## 7.2.9 WebGL 2 Features

### Vertex Array Objects (VAO)

```javascript
// Create VAO
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Set up attributes once
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLoc);

// Unbind
gl.bindVertexArray(null);

// Later, just bind VAO to use all attributes
gl.bindVertexArray(vao);
gl.drawArrays(gl.TRIANGLES, 0, 36);
```

### Instanced Rendering

```javascript
// Draw multiple instances efficiently
gl.vertexAttribDivisor(instanceMatrixLoc, 1);  // Once per instance
gl.drawArraysInstanced(gl.TRIANGLES, 0, 36, instanceCount);
```

### Transform Feedback

```javascript
// Capture vertex shader output
const tf = gl.createTransformFeedback();
gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, outputBuffer);

gl.beginTransformFeedback(gl.POINTS);
gl.drawArrays(gl.POINTS, 0, count);
gl.endTransformFeedback();
```

---

## 7.2.10 Summary

### WebGL Pipeline

| Step | Description |
|------|-------------|
| Create shaders | Vertex + Fragment |
| Create program | Link shaders |
| Create buffers | Vertices, indices |
| Set attributes | Vertex layout |
| Set uniforms | Matrices, colors |
| Draw | Render |

### Common Functions

| Function | Description |
|----------|-------------|
| `createShader()` | Create shader |
| `createProgram()` | Link program |
| `createBuffer()` | Create buffer |
| `bindBuffer()` | Bind buffer |
| `bufferData()` | Upload data |
| `drawArrays()` | Draw vertices |
| `drawElements()` | Draw indexed |

### Best Practices

1. **Use VAOs** in WebGL 2
2. **Batch draw calls** when possible
3. **Minimize state changes**
4. **Use appropriate buffer usage hints**
5. **Reuse buffers** instead of creating new ones
6. **Consider using a library** (Three.js, Babylon.js)

---

**End of Chapter 7.2: WebGL**

Next chapter: **7.3 Web Audio API** — covers audio processing and synthesis.
# 7.3 Web Audio API

The Web Audio API provides a powerful system for controlling audio in web applications. This chapter covers audio contexts, nodes, oscillators, effects, and common patterns for audio processing.

---

## 7.3.1 Audio Context

### Creating Audio Context

```javascript
// Create audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Context states: suspended, running, closed
console.log(audioCtx.state);  // 'suspended' initially

// Resume on user interaction (required by browsers)
button.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// Close context when done
audioCtx.close();
```

### Context Properties

```javascript
// Current time in seconds
console.log(audioCtx.currentTime);

// Sample rate (usually 44100 or 48000)
console.log(audioCtx.sampleRate);

// Destination (speakers)
const destination = audioCtx.destination;
console.log(destination.maxChannelCount);  // e.g., 2 for stereo
```

---

## 7.3.2 Audio Sources

### Playing Audio Files

```javascript
// Load and play audio buffer
async function playAudio(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  // Create source node
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  
  // Connect to output
  source.connect(audioCtx.destination);
  
  // Play
  source.start(0);  // Start immediately
  
  // Stop after 5 seconds
  source.stop(audioCtx.currentTime + 5);
  
  return source;
}
```

### Audio Element Source

```javascript
// Use HTML audio element
const audio = document.querySelector('audio');
const source = audioCtx.createMediaElementSource(audio);

// Connect through processing chain
source.connect(audioCtx.destination);

// Audio element controls playback
audio.play();
```

### Microphone Input

```javascript
async function getMicrophoneInput() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);
  
  // Connect to analyzer or effects
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  
  return { source, analyser, stream };
}
```

---

## 7.3.3 Oscillators

### Basic Oscillator

```javascript
// Create oscillator
const oscillator = audioCtx.createOscillator();

// Set waveform type
oscillator.type = 'sine';     // sine, square, sawtooth, triangle

// Set frequency (Hz)
oscillator.frequency.value = 440;  // A4 note

// Connect and play
oscillator.connect(audioCtx.destination);
oscillator.start();
oscillator.stop(audioCtx.currentTime + 1);  // Stop after 1 second

// Oscillators can only be started once - create new for each use
```

### Frequency and Detune

```javascript
const oscillator = audioCtx.createOscillator();

// Set frequency
oscillator.frequency.value = 440;

// Detune in cents (100 cents = 1 semitone)
oscillator.detune.value = 100;  // One semitone up

// Schedule frequency changes
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 1);
```

### Custom Waveforms

```javascript
// Create custom periodic wave
const real = new Float32Array([0, 1, 0.5, 0.25]);  // Cosine terms
const imag = new Float32Array([0, 0, 0, 0]);       // Sine terms

const wave = audioCtx.createPeriodicWave(real, imag);
oscillator.setPeriodicWave(wave);
```

---

## 7.3.4 Gain Node

### Volume Control

```javascript
// Create gain node
const gainNode = audioCtx.createGain();

// Set volume (0 = silent, 1 = full)
gainNode.gain.value = 0.5;

// Connect: source → gain → destination
source.connect(gainNode);
gainNode.connect(audioCtx.destination);
```

### Fade In/Out

```javascript
const gainNode = audioCtx.createGain();

// Fade in
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);

// Fade out
gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

// Exponential fade (more natural for audio)
gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
```

---

## 7.3.5 Filters

### Biquad Filter

```javascript
// Create filter
const filter = audioCtx.createBiquadFilter();

// Filter types
filter.type = 'lowpass';    // Low frequencies pass
filter.type = 'highpass';   // High frequencies pass
filter.type = 'bandpass';   // Band of frequencies pass
filter.type = 'notch';      // Band of frequencies blocked
filter.type = 'peaking';    // Boost/cut at frequency
filter.type = 'lowshelf';   // Boost/cut below frequency
filter.type = 'highshelf';  // Boost/cut above frequency

// Set parameters
filter.frequency.value = 1000;  // Cutoff frequency (Hz)
filter.Q.value = 1;             // Quality factor (resonance)
filter.gain.value = 0;          // Gain for peaking/shelf filters

// Connect
source.connect(filter);
filter.connect(audioCtx.destination);
```

### Multiple Filters

```javascript
// Chain filters for complex EQ
const lowFilter = audioCtx.createBiquadFilter();
lowFilter.type = 'lowshelf';
lowFilter.frequency.value = 320;
lowFilter.gain.value = 3;

const highFilter = audioCtx.createBiquadFilter();
highFilter.type = 'highshelf';
highFilter.frequency.value = 3200;
highFilter.gain.value = -2;

source.connect(lowFilter);
lowFilter.connect(highFilter);
highFilter.connect(audioCtx.destination);
```

---

## 7.3.6 Analyser Node

### Visualizing Audio

```javascript
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;  // Must be power of 2

// Connect
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Get frequency data
const frequencyData = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(frequencyData);

// Get waveform data
const timeData = new Uint8Array(analyser.fftSize);
analyser.getByteTimeDomainData(timeData);
```

### Frequency Visualizer

```javascript
function drawFrequency() {
  requestAnimationFrame(drawFrequency);
  
  analyser.getByteFrequencyData(frequencyData);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const barWidth = canvas.width / frequencyData.length;
  
  frequencyData.forEach((value, i) => {
    const height = (value / 255) * canvas.height;
    ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
  });
}

drawFrequency();
```

### Waveform Visualizer

```javascript
function drawWaveform() {
  requestAnimationFrame(drawWaveform);
  
  analyser.getByteTimeDomainData(timeData);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  
  const sliceWidth = canvas.width / timeData.length;
  let x = 0;
  
  timeData.forEach((value, i) => {
    const y = (value / 255) * canvas.height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  });
  
  ctx.stroke();
}
```

---

## 7.3.7 Effects

### Delay Effect

```javascript
// Create delay
const delay = audioCtx.createDelay(5);  // Max 5 seconds
delay.delayTime.value = 0.5;  // 500ms delay

// Create feedback loop
const feedback = audioCtx.createGain();
feedback.gain.value = 0.5;

// Connect
source.connect(delay);
delay.connect(feedback);
feedback.connect(delay);  // Feedback loop
delay.connect(audioCtx.destination);
```

### Reverb (Convolution)

```javascript
// Load impulse response
async function createReverb(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const impulseBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  const convolver = audioCtx.createConvolver();
  convolver.buffer = impulseBuffer;
  
  return convolver;
}

const reverb = await createReverb('impulse-response.wav');
source.connect(reverb);
reverb.connect(audioCtx.destination);
```

### Compressor

```javascript
const compressor = audioCtx.createDynamicsCompressor();

compressor.threshold.value = -24;  // dB
compressor.knee.value = 30;        // dB
compressor.ratio.value = 12;       // Compression ratio
compressor.attack.value = 0.003;   // Seconds
compressor.release.value = 0.25;   // Seconds

source.connect(compressor);
compressor.connect(audioCtx.destination);
```

---

## 7.3.8 Spatial Audio

### Panner Node

```javascript
// Create panner
const panner = audioCtx.createPanner();

// Positioning model
panner.panningModel = 'HRTF';  // Head-related transfer function
panner.distanceModel = 'inverse';  // inverse, linear, exponential

// Set position
panner.positionX.value = 0;
panner.positionY.value = 0;
panner.positionZ.value = 0;

// Set orientation (direction sound is facing)
panner.orientationX.value = 0;
panner.orientationY.value = 0;
panner.orientationZ.value = -1;

// Distance parameters
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;

// Connect
source.connect(panner);
panner.connect(audioCtx.destination);
```

### Stereo Panning

```javascript
// Simple left-right panning
const panner = audioCtx.createStereoPanner();

// Range: -1 (left) to 1 (right)
panner.pan.value = -1;  // Full left
panner.pan.value = 0;   // Center
panner.pan.value = 1;   // Full right

source.connect(panner);
panner.connect(audioCtx.destination);
```

### Listener Position

```javascript
// Set listener (camera) position
const listener = audioCtx.listener;

listener.positionX.value = 0;
listener.positionY.value = 0;
listener.positionZ.value = 0;

// Listener orientation
listener.forwardX.value = 0;
listener.forwardY.value = 0;
listener.forwardZ.value = -1;

listener.upX.value = 0;
listener.upY.value = 1;
listener.upZ.value = 0;
```

---

## 7.3.9 Worklets

### Audio Worklet

```javascript
// Register processor
await audioCtx.audioWorklet.addModule('my-processor.js');

// Create node
const workletNode = new AudioWorkletNode(audioCtx, 'my-processor');

source.connect(workletNode);
workletNode.connect(audioCtx.destination);

// my-processor.js
class MyProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        output[channel][i] = input[channel][i] * 0.5;  // Half volume
      }
    }
    
    return true;  // Keep processor alive
  }
}

registerProcessor('my-processor', MyProcessor);
```

---

## 7.3.10 Summary

### Common Nodes

| Node | Description |
|------|-------------|
| `BufferSource` | Play audio buffer |
| `MediaElementSource` | Audio/video element |
| `Oscillator` | Generate tones |
| `GainNode` | Volume control |
| `BiquadFilter` | Frequency filter |
| `AnalyserNode` | Audio analysis |
| `DelayNode` | Echo effect |
| `ConvolverNode` | Reverb |
| `DynamicsCompressor` | Dynamic range compression |
| `PannerNode` | 3D spatial audio |
| `StereoPanner` | Left-right panning |

### Audio Graph Pattern

```javascript
// Typical audio processing chain
source.connect(filter);
filter.connect(effects);
effects.connect(gain);
gain.connect(analyser);
analyser.connect(destination);
```

### Best Practices

1. **Resume context on user interaction**
2. **Create new oscillators** for each use
3. **Use gain ramps** to avoid clicks
4. **Disconnect unused nodes**
5. **Use AudioWorklet** for custom DSP
6. **Handle context state changes**

---

**End of Chapter 7.3: Web Audio API**

Next chapter: **7.4 WebRTC** — covers real-time communication.
# 7.4 WebRTC

WebRTC (Web Real-Time Communication) enables peer-to-peer audio, video, and data sharing directly between browsers. This chapter covers peer connections, media streams, signaling, and data channels.

---

## 7.4.1 WebRTC Overview

### What Is WebRTC?

```javascript
// WebRTC enables:
// - Peer-to-peer video/audio calls
// - Screen sharing
// - File transfer
// - Real-time data channels

// Key components:
// 1. RTCPeerConnection - manages P2P connection
// 2. MediaStream - audio/video tracks
// 3. RTCDataChannel - arbitrary data
// 4. Signaling - exchange connection info (not part of WebRTC)
```

### Connection Flow

```javascript
// 1. Create peer connections on both sides
// 2. Get local media (camera/mic)
// 3. Exchange ICE candidates (network info)
// 4. Create and exchange offer/answer (SDP)
// 5. Connection established!
```

---

## 7.4.2 Getting User Media

### Camera and Microphone

```javascript
async function getMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display in video element
    const videoElement = document.getElementById('localVideo');
    videoElement.srcObject = stream;
    
    return stream;
  } catch (error) {
    console.error('Error accessing media:', error);
  }
}
```

### Constraints

```javascript
const constraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',  // 'environment' for back camera
    frameRate: { max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

### Screen Sharing

```javascript
async function shareScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'  // Show cursor
    },
    audio: true  // Include system audio if supported
  });
  
  return stream;
}
```

---

## 7.4.3 Peer Connection

### Creating Peer Connection

```javascript
// Configuration with STUN/TURN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
};

const peerConnection = new RTCPeerConnection(configuration);

// Monitor connection state
peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState);
  // 'new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'
};

peerConnection.oniceconnectionstatechange = () => {
  console.log('ICE state:', peerConnection.iceConnectionState);
};
```

### Adding Tracks

```javascript
// Add local stream tracks to connection
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// Receive remote tracks
peerConnection.ontrack = (event) => {
  const remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = event.streams[0];
};
```

---

## 7.4.4 Signaling

### Creating Offer (Caller)

```javascript
// Create offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send offer to remote peer via signaling server
signalingChannel.send({
  type: 'offer',
  sdp: peerConnection.localDescription
});
```

### Creating Answer (Callee)

```javascript
// Receive offer from signaling server
signalingChannel.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'offer') {
    await peerConnection.setRemoteDescription(message.sdp);
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer back
    signalingChannel.send({
      type: 'answer',
      sdp: peerConnection.localDescription
    });
  }
  
  if (message.type === 'answer') {
    await peerConnection.setRemoteDescription(message.sdp);
  }
  
  if (message.type === 'candidate') {
    await peerConnection.addIceCandidate(message.candidate);
  }
};
```

### ICE Candidates

```javascript
// Gather and send ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    signalingChannel.send({
      type: 'candidate',
      candidate: event.candidate
    });
  }
};

// Receive and add ICE candidates
async function handleCandidate(candidate) {
  await peerConnection.addIceCandidate(candidate);
}
```

---

## 7.4.5 Data Channels

### Creating Data Channel

```javascript
// Creator side
const dataChannel = peerConnection.createDataChannel('chat', {
  ordered: true,       // Guarantee order
  maxRetransmits: 3    // Max retransmit attempts
});

dataChannel.onopen = () => {
  console.log('Data channel open');
  dataChannel.send('Hello!');
};

dataChannel.onmessage = (event) => {
  console.log('Received:', event.data);
};

dataChannel.onclose = () => {
  console.log('Data channel closed');
};
```

### Receiving Data Channel

```javascript
// Receiver side
peerConnection.ondatachannel = (event) => {
  const dataChannel = event.channel;
  
  dataChannel.onopen = () => {
    console.log('Data channel open');
  };
  
  dataChannel.onmessage = (event) => {
    console.log('Received:', event.data);
  };
};
```

### Sending Data

```javascript
// Send text
dataChannel.send('Hello, World!');

// Send binary data
const buffer = new ArrayBuffer(1024);
dataChannel.send(buffer);

// Send Blob
const blob = new Blob(['Hello'], { type: 'text/plain' });
dataChannel.send(blob);

// Check if ready to send
if (dataChannel.readyState === 'open') {
  dataChannel.send(data);
}
```

---

## 7.4.6 Managing Media

### Mute/Unmute

```javascript
function toggleAudio(stream) {
  stream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
}

function toggleVideo(stream) {
  stream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
}
```

### Replace Track

```javascript
// Switch camera or share screen
async function replaceVideoTrack(newStream) {
  const [videoTrack] = newStream.getVideoTracks();
  const sender = peerConnection.getSenders().find(s => 
    s.track?.kind === 'video'
  );
  
  if (sender) {
    await sender.replaceTrack(videoTrack);
  }
}
```

### Stop Tracks

```javascript
function stopAllTracks(stream) {
  stream.getTracks().forEach(track => track.stop());
}
```

---

## 7.4.7 Statistics

### Getting Stats

```javascript
async function getConnectionStats() {
  const stats = await peerConnection.getStats();
  
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      console.log('Bytes received:', report.bytesReceived);
      console.log('Packets lost:', report.packetsLost);
      console.log('Frames decoded:', report.framesDecoded);
    }
    
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      console.log('RTT:', report.currentRoundTripTime);
      console.log('Available bandwidth:', report.availableOutgoingBitrate);
    }
  });
}
```

---

## 7.4.8 Complete Example

### Simple Peer-to-Peer Call

```javascript
class WebRTCCall {
  constructor(signalingChannel) {
    this.signaling = signalingChannel;
    this.pc = null;
    this.localStream = null;
  }
  
  async initialize() {
    // Get user media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display local video
    document.getElementById('localVideo').srcObject = this.localStream;
    
    // Create peer connection
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    // Add tracks
    this.localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.localStream);
    });
    
    // Handle remote stream
    this.pc.ontrack = (event) => {
      document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
    
    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({ type: 'candidate', candidate: event.candidate });
      }
    };
    
    // Listen for signaling messages
    this.signaling.onmessage = async (message) => {
      await this.handleSignalingMessage(message);
    };
  }
  
  async call() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.signaling.send({ type: 'offer', sdp: this.pc.localDescription });
  }
  
  async handleSignalingMessage(message) {
    if (message.type === 'offer') {
      await this.pc.setRemoteDescription(message.sdp);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.signaling.send({ type: 'answer', sdp: this.pc.localDescription });
    }
    
    if (message.type === 'answer') {
      await this.pc.setRemoteDescription(message.sdp);
    }
    
    if (message.type === 'candidate') {
      await this.pc.addIceCandidate(message.candidate);
    }
  }
  
  hangup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
  }
}
```

---

## 7.4.9 Summary

### Key Objects

| Object | Purpose |
|--------|---------|
| `RTCPeerConnection` | Manages P2P connection |
| `MediaStream` | Audio/video tracks |
| `RTCDataChannel` | Arbitrary data transfer |
| `RTCSessionDescription` | SDP offer/answer |
| `RTCIceCandidate` | Network candidate |

### Connection States

| State | Meaning |
|-------|---------|
| `new` | Initial state |
| `connecting` | Establishing connection |
| `connected` | Connection active |
| `disconnected` | Temporarily disconnected |
| `failed` | Connection failed |
| `closed` | Connection closed |

### Best Practices

1. **Use TURN servers** for NAT traversal
2. **Handle all connection states**
3. **Implement reconnection logic**
4. **Monitor stats** for quality
5. **Clean up resources** on disconnect
6. **Use adapter.js** for cross-browser support

---

**End of Chapter 7.4: WebRTC**

Next chapter: **7.5 Media Capture and Streams** — covers getUserMedia and MediaStream APIs.
# 7.5 Media Capture and Streams

The Media Capture and Streams API provides access to media input devices like cameras and microphones. This chapter covers getUserMedia, MediaStream, constraints, and device enumeration.

---

## 7.5.1 getUserMedia

### Basic Usage

```javascript
// Request camera and microphone access
async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Use the stream
    const video = document.querySelector('video');
    video.srcObject = stream;
    
    return stream;
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  switch (error.name) {
    case 'NotAllowedError':
      console.error('Permission denied');
      break;
    case 'NotFoundError':
      console.error('No media devices found');
      break;
    case 'NotReadableError':
      console.error('Device is in use');
      break;
    case 'OverconstrainedError':
      console.error('Constraints cannot be satisfied');
      break;
    default:
      console.error('Error:', error);
  }
}
```

### Video Only

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
});
```

### Audio Only

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true
});
```

---

## 7.5.2 Video Constraints

### Resolution

```javascript
const constraints = {
  video: {
    width: 1280,
    height: 720
  }
};

// With ideal/min/max
const constraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  }
};

// Exact value (will fail if not available)
const constraints = {
  video: {
    width: { exact: 1920 },
    height: { exact: 1080 }
  }
};
```

### Frame Rate

```javascript
const constraints = {
  video: {
    frameRate: { ideal: 30, max: 60 }
  }
};
```

### Facing Mode

```javascript
// Front camera
const constraints = {
  video: {
    facingMode: 'user'
  }
};

// Back camera
const constraints = {
  video: {
    facingMode: 'environment'
  }
};

// Exact facing mode (fail if not available)
const constraints = {
  video: {
    facingMode: { exact: 'environment' }
  }
};
```

### Aspect Ratio

```javascript
const constraints = {
  video: {
    aspectRatio: 16 / 9
  }
};
```

### Specific Device

```javascript
const constraints = {
  video: {
    deviceId: { exact: 'specific-device-id' }
  }
};
```

---

## 7.5.3 Audio Constraints

### Basic Audio Settings

```javascript
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

### Sample Rate and Channels

```javascript
const constraints = {
  audio: {
    sampleRate: 48000,
    channelCount: 2  // Stereo
  }
};
```

### Specific Microphone

```javascript
const constraints = {
  audio: {
    deviceId: { exact: 'microphone-device-id' }
  }
};
```

---

## 7.5.4 MediaStream

### Stream Properties

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

// Stream ID
console.log(stream.id);

// Check if active
console.log(stream.active);  // true

// Get all tracks
const tracks = stream.getTracks();

// Get video tracks
const videoTracks = stream.getVideoTracks();

// Get audio tracks
const audioTracks = stream.getAudioTracks();
```

### Stream Events

```javascript
stream.addEventListener('addtrack', (event) => {
  console.log('Track added:', event.track);
});

stream.addEventListener('removetrack', (event) => {
  console.log('Track removed:', event.track);
});
```

### Adding and Removing Tracks

```javascript
// Add track
stream.addTrack(newTrack);

// Remove track
stream.removeTrack(track);
```

### Cloning Stream

```javascript
// Clone entire stream
const clonedStream = stream.clone();

// Cloned tracks are independent
```

---

## 7.5.5 MediaStreamTrack

### Track Properties

```javascript
const track = stream.getVideoTracks()[0];

console.log(track.id);          // Unique ID
console.log(track.kind);        // 'video' or 'audio'
console.log(track.label);       // Device name
console.log(track.enabled);     // true/false
console.log(track.muted);       // true/false
console.log(track.readyState);  // 'live' or 'ended'
```

### Enable/Disable Track

```javascript
// Disable (mute) track
track.enabled = false;

// Enable track
track.enabled = true;

// Note: enabled only affects output, track still captures
```

### Stop Track

```javascript
// Stop track permanently
track.stop();

// Track becomes 'ended' and cannot be restarted
```

### Track Events

```javascript
track.addEventListener('ended', () => {
  console.log('Track ended');
});

track.addEventListener('mute', () => {
  console.log('Track muted');
});

track.addEventListener('unmute', () => {
  console.log('Track unmuted');
});
```

### Get Track Constraints

```javascript
// Get current constraints
const constraints = track.getConstraints();

// Get actual settings
const settings = track.getSettings();
console.log(settings.width);
console.log(settings.height);
console.log(settings.frameRate);

// Get supported capabilities
const capabilities = track.getCapabilities();
console.log(capabilities.width);  // { min: 1, max: 1920 }
```

### Apply Constraints

```javascript
await track.applyConstraints({
  width: 1920,
  height: 1080
});
```

---

## 7.5.6 Device Enumeration

### List Devices

```javascript
async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  
  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioInputs = devices.filter(d => d.kind === 'audioinput');
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
  
  console.log('Cameras:', videoInputs);
  console.log('Microphones:', audioInputs);
  console.log('Speakers:', audioOutputs);
  
  return { videoInputs, audioInputs, audioOutputs };
}
```

### Device Properties

```javascript
devices.forEach(device => {
  console.log('Device ID:', device.deviceId);
  console.log('Kind:', device.kind);      // videoinput, audioinput, audiooutput
  console.log('Label:', device.label);    // Human-readable name
  console.log('Group ID:', device.groupId);  // Same hardware device
});

// Note: labels may be empty until permission granted
```

### Device Change Event

```javascript
navigator.mediaDevices.addEventListener('devicechange', async () => {
  console.log('Devices changed');
  const devices = await navigator.mediaDevices.enumerateDevices();
  updateDeviceList(devices);
});
```

### Select Specific Device

```javascript
// Create device selector
async function createDeviceSelector() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput');
  
  const select = document.getElementById('cameraSelect');
  
  cameras.forEach(camera => {
    const option = document.createElement('option');
    option.value = camera.deviceId;
    option.text = camera.label || `Camera ${select.length + 1}`;
    select.appendChild(option);
  });
}

// Use selected device
async function useSelectedCamera() {
  const deviceId = document.getElementById('cameraSelect').value;
  
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } }
  });
  
  return stream;
}
```

---

## 7.5.7 getDisplayMedia

### Screen Capture

```javascript
async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'  // 'always', 'motion', 'never'
    },
    audio: true  // Capture system audio (if supported)
  });
  
  return stream;
}
```

### Screen Sharing Constraints

```javascript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'monitor',  // 'monitor', 'window', 'application', 'browser'
    logicalSurface: true,
    cursor: 'always',
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: { max: 30 }
  }
});
```

### Handle Screen Share Stop

```javascript
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const track = stream.getVideoTracks()[0];

track.addEventListener('ended', () => {
  console.log('User stopped screen sharing');
  // Clean up or switch back to camera
});
```

---

## 7.5.8 Common Patterns

### Camera Switcher

```javascript
class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
  }
  
  async start(deviceId = null) {
    // Stop existing stream
    this.stop();
    
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    };
    
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
  }
  
  async switchCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    
    const currentTrack = this.stream?.getVideoTracks()[0];
    const currentId = currentTrack?.getSettings().deviceId;
    
    const currentIndex = cameras.findIndex(c => c.deviceId === currentId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    
    await this.start(cameras[nextIndex].deviceId);
  }
  
  stop() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.video.srcObject = null;
  }
}
```

### Picture from Video

```javascript
function captureFrame(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  return canvas.toDataURL('image/jpeg');
}
```

---

## 7.5.9 Summary

### getUserMedia Constraints

| Video | Audio |
|-------|-------|
| `width/height` | `echoCancellation` |
| `frameRate` | `noiseSuppression` |
| `facingMode` | `autoGainControl` |
| `aspectRatio` | `sampleRate` |
| `deviceId` | `channelCount` |

### MediaStreamTrack States

| State | Meaning |
|-------|---------|
| `live` | Track is active |
| `ended` | Track has stopped |

### Error Types

| Error | Cause |
|-------|-------|
| `NotAllowedError` | Permission denied |
| `NotFoundError` | No matching device |
| `NotReadableError` | Device in use |
| `OverconstrainedError` | Constraints impossible |

### Best Practices

1. **Handle permission errors** gracefully
2. **Stop tracks when done** to release devices
3. **Use constraints** to get desired quality
4. **Monitor device changes** for hot-plugging
5. **Check capabilities** before applying constraints
6. **Provide fallbacks** for unsupported features

---

**End of Chapter 7.5: Media Capture and Streams**

Next chapter: **7.6 MediaRecorder API** — covers recording media streams.
# 7.6 MediaRecorder API

The MediaRecorder API captures audio and video from a MediaStream for recording. This chapter covers recording streams, handling data, and exporting recordings.

---

## 7.6.1 Basic Recording

### Creating MediaRecorder

```javascript
// Get a stream first
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// Create recorder
const mediaRecorder = new MediaRecorder(stream);

// Check if format is supported
if (!MediaRecorder.isTypeSupported('video/webm')) {
  console.error('WebM not supported');
}
```

### Recording Options

```javascript
const options = {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000,  // 2.5 Mbps
  audioBitsPerSecond: 128000    // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);
```

### Supported Formats

```javascript
// Check format support
MediaRecorder.isTypeSupported('video/webm');
MediaRecorder.isTypeSupported('video/webm;codecs=vp8');
MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
MediaRecorder.isTypeSupported('video/webm;codecs=h264');
MediaRecorder.isTypeSupported('audio/webm');
MediaRecorder.isTypeSupported('audio/webm;codecs=opus');

// Common formats:
// video/webm (Chrome, Firefox)
// video/mp4 (Safari, some browsers)
// audio/webm
// audio/ogg
```

---

## 7.6.2 Recording Controls

### Start, Stop, Pause, Resume

```javascript
// Start recording
mediaRecorder.start();

// Start with timeslice (data every N milliseconds)
mediaRecorder.start(1000);  // Fire ondataavailable every second

// Pause recording
mediaRecorder.pause();

// Resume recording
mediaRecorder.resume();

// Stop recording
mediaRecorder.stop();
```

### Recording State

```javascript
console.log(mediaRecorder.state);
// 'inactive' - not recording
// 'recording' - currently recording
// 'paused' - recording paused
```

---

## 7.6.3 Handling Data

### ondataavailable Event

```javascript
const chunks = [];

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunks.push(event.data);
  }
};

// Request data manually (if not using timeslice)
mediaRecorder.requestData();
```

### Creating Final Recording

```javascript
mediaRecorder.onstop = () => {
  // Create blob from chunks
  const blob = new Blob(chunks, { type: 'video/webm' });
  
  // Create URL for playback
  const url = URL.createObjectURL(blob);
  
  // Play recording
  const video = document.getElementById('playback');
  video.src = url;
  
  // Download recording
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recording.webm';
  a.click();
};
```

---

## 7.6.4 Events

### All Events

```javascript
mediaRecorder.onstart = () => {
  console.log('Recording started');
};

mediaRecorder.onstop = () => {
  console.log('Recording stopped');
};

mediaRecorder.onpause = () => {
  console.log('Recording paused');
};

mediaRecorder.onresume = () => {
  console.log('Recording resumed');
};

mediaRecorder.ondataavailable = (event) => {
  console.log('Data available:', event.data.size, 'bytes');
};

mediaRecorder.onerror = (event) => {
  console.error('Recording error:', event.error);
};
```

---

## 7.6.5 Complete Example

### Video Recorder

```javascript
class VideoRecorder {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
  }
  
  async start() {
    // Get camera stream
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display preview
    this.videoElement.srcObject = this.stream;
    this.videoElement.muted = true;
    
    // Create recorder
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    
    // Start recording
    this.mediaRecorder.start(1000);  // Chunk every second
  }
  
  pause() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }
  
  resume() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
  
  async stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        // Stop camera
        this.stream.getTracks().forEach(track => track.stop());
        
        // Create blob
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  getState() {
    return this.mediaRecorder?.state || 'inactive';
  }
}

// Usage
const recorder = new VideoRecorder(document.querySelector('video'));

document.getElementById('start').onclick = () => recorder.start();
document.getElementById('pause').onclick = () => recorder.pause();
document.getElementById('resume').onclick = () => recorder.resume();
document.getElementById('stop').onclick = async () => {
  const blob = await recorder.stop();
  
  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recording-${Date.now()}.webm`;
  a.click();
  
  URL.revokeObjectURL(url);
};
```

---

## 7.6.6 Audio Recording

### Audio Only Recorder

```javascript
async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  const chunks = [];
  
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    
    const audio = new Audio(url);
    audio.controls = true;
    document.body.appendChild(audio);
  };
  
  return mediaRecorder;
}
```

---

## 7.6.7 Screen Recording

### Record Screen with Audio

```javascript
async function recordScreen() {
  // Get screen
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always' },
    audio: true
  });
  
  // Optionally add microphone
  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  
  // Combine streams
  const combinedStream = new MediaStream([
    ...screenStream.getVideoTracks(),
    ...micStream.getAudioTracks()
  ]);
  
  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: 'video/webm;codecs=vp9,opus'
  });
  
  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
  mediaRecorder.onstop = () => {
    // Stop all tracks
    screenStream.getTracks().forEach(t => t.stop());
    micStream.getTracks().forEach(t => t.stop());
    
    const blob = new Blob(chunks, { type: 'video/webm' });
    // Handle recording...
  };
  
  // Handle user stopping screen share
  screenStream.getVideoTracks()[0].onended = () => {
    mediaRecorder.stop();
  };
  
  return mediaRecorder;
}
```

---

## 7.6.8 Converting Formats

### WebM to MP4 (Using FFmpeg.wasm)

```javascript
// Note: Requires ffmpeg.wasm library
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

async function convertToMP4(webmBlob) {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  
  // Write input file
  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
  
  // Convert
  await ffmpeg.run('-i', 'input.webm', 'output.mp4');
  
  // Read output
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
  
  return mp4Blob;
}
```

---

## 7.6.9 Summary

### MediaRecorder States

| State | Description |
|-------|-------------|
| `inactive` | Not recording |
| `recording` | Currently recording |
| `paused` | Recording paused |

### MediaRecorder Methods

| Method | Description |
|--------|-------------|
| `start(timeslice)` | Start recording |
| `stop()` | Stop recording |
| `pause()` | Pause recording |
| `resume()` | Resume recording |
| `requestData()` | Request data chunk |

### Common MIME Types

| Type | Codec |
|------|-------|
| `video/webm` | VP8, VP9 |
| `video/webm;codecs=vp9` | VP9 |
| `video/webm;codecs=h264` | H.264 |
| `audio/webm` | Opus, Vorbis |
| `audio/webm;codecs=opus` | Opus |

### Best Practices

1. **Check format support** before recording
2. **Use timeslice** for long recordings
3. **Handle errors** gracefully
4. **Stop tracks** when done
5. **Monitor state** for UI updates
6. **Test across browsers** for compatibility

---

**End of Chapter 7.6: MediaRecorder API**

Next chapter: **7.7 HTMLMediaElement** — covers audio and video element APIs.
# 7.7 HTMLMediaElement

The HTMLMediaElement interface provides common functionality for `<audio>` and `<video>` elements. This chapter covers playback control, events, time manipulation, and common media patterns.

---

## 7.7.1 Media Elements

### Creating Media Elements

```html
<!-- Video element -->
<video id="video" src="video.mp4" controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>

<!-- Audio element -->
<audio id="audio" src="audio.mp3" controls>
  <source src="audio.ogg" type="audio/ogg">
  <source src="audio.mp3" type="audio/mpeg">
</audio>
```

```javascript
// Create via JavaScript
const video = document.createElement('video');
video.src = 'video.mp4';

const audio = new Audio('audio.mp3');
```

---

## 7.7.2 Playback Control

### Play and Pause

```javascript
const video = document.getElementById('video');

// Play (returns promise)
video.play()
  .then(() => console.log('Playing'))
  .catch(err => console.error('Playback failed:', err));

// Pause
video.pause();

// Toggle play/pause
function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}
```

### Load and Source

```javascript
// Change source
video.src = 'newvideo.mp4';

// Or use source elements
video.innerHTML = `
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
`;

// Reload media
video.load();
```

---

## 7.7.3 Time Properties

### Current Time and Duration

```javascript
// Current playback position (seconds)
console.log(video.currentTime);  // e.g., 45.5

// Set current time (seek)
video.currentTime = 60;  // Jump to 1 minute

// Total duration
console.log(video.duration);  // e.g., 180

// Remaining time
const remaining = video.duration - video.currentTime;
```

### Progress and Buffered

```javascript
// Buffered time ranges
const buffered = video.buffered;
for (let i = 0; i < buffered.length; i++) {
  console.log(`Range ${i}: ${buffered.start(i)} - ${buffered.end(i)}`);
}

// Amount buffered
const bufferedEnd = buffered.length ? buffered.end(buffered.length - 1) : 0;
const bufferedPercent = (bufferedEnd / video.duration) * 100;

// Played time ranges
const played = video.played;

// Seekable time ranges
const seekable = video.seekable;
```

---

## 7.7.4 Playback State

### Properties

```javascript
// Paused state
console.log(video.paused);  // true/false

// Ended state
console.log(video.ended);   // true/false

// Seeking state
console.log(video.seeking); // true/false

// Ready state
console.log(video.readyState);
// 0 = HAVE_NOTHING
// 1 = HAVE_METADATA
// 2 = HAVE_CURRENT_DATA
// 3 = HAVE_FUTURE_DATA
// 4 = HAVE_ENOUGH_DATA

// Network state
console.log(video.networkState);
// 0 = NETWORK_EMPTY
// 1 = NETWORK_IDLE
// 2 = NETWORK_LOADING
// 3 = NETWORK_NO_SOURCE
```

---

## 7.7.5 Volume and Mute

### Volume Control

```javascript
// Volume (0.0 to 1.0)
video.volume = 0.5;  // 50%

// Mute/unmute
video.muted = true;
video.muted = false;

// Toggle mute
video.muted = !video.muted;
```

---

## 7.7.6 Playback Rate

### Speed Control

```javascript
// Normal speed
video.playbackRate = 1.0;

// Slow motion
video.playbackRate = 0.5;

// Fast forward
video.playbackRate = 2.0;

// Reverse (some browsers)
video.playbackRate = -1.0;

// Default playback rate
video.defaultPlaybackRate = 1.0;
```

---

## 7.7.7 Events

### Playback Events

```javascript
// Can play
video.addEventListener('canplay', () => {
  console.log('Can start playing');
});

// Can play through
video.addEventListener('canplaythrough', () => {
  console.log('Can play without buffering');
});

// Playing
video.addEventListener('playing', () => {
  console.log('Playback started');
});

// Pause
video.addEventListener('pause', () => {
  console.log('Playback paused');
});

// Ended
video.addEventListener('ended', () => {
  console.log('Playback ended');
});

// Time update (fires during playback)
video.addEventListener('timeupdate', () => {
  console.log('Current time:', video.currentTime);
});
```

### Loading Events

```javascript
// Metadata loaded
video.addEventListener('loadedmetadata', () => {
  console.log('Duration:', video.duration);
  console.log('Dimensions:', video.videoWidth, video.videoHeight);
});

// Data loaded
video.addEventListener('loadeddata', () => {
  console.log('First frame available');
});

// Progress (buffering)
video.addEventListener('progress', () => {
  console.log('Buffering...');
});

// Stalled
video.addEventListener('stalled', () => {
  console.log('Download stalled');
});

// Waiting
video.addEventListener('waiting', () => {
  console.log('Waiting for data');
});
```

### Seek Events

```javascript
video.addEventListener('seeking', () => {
  console.log('Seeking to:', video.currentTime);
});

video.addEventListener('seeked', () => {
  console.log('Seek complete');
});
```

### Error Events

```javascript
video.addEventListener('error', () => {
  const error = video.error;
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      console.error('Playback aborted');
      break;
    case MediaError.MEDIA_ERR_NETWORK:
      console.error('Network error');
      break;
    case MediaError.MEDIA_ERR_DECODE:
      console.error('Decode error');
      break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      console.error('Format not supported');
      break;
  }
});
```

---

## 7.7.8 Video-Specific Properties

### Dimensions

```javascript
// Native video dimensions
console.log(video.videoWidth);   // e.g., 1920
console.log(video.videoHeight);  // e.g., 1080

// Element dimensions (CSS)
console.log(video.clientWidth);
console.log(video.clientHeight);
```

### Poster

```javascript
// Set poster image
video.poster = 'thumbnail.jpg';
```

---

## 7.7.9 Text Tracks (Subtitles)

### Adding Subtitles

```html
<video src="video.mp4">
  <track kind="subtitles" src="en.vtt" srclang="en" label="English" default>
  <track kind="subtitles" src="es.vtt" srclang="es" label="Spanish">
</video>
```

### Controlling Text Tracks

```javascript
// Get text tracks
const tracks = video.textTracks;

// Enable/disable track
tracks[0].mode = 'showing';  // showing, hidden, disabled

// Listen for cue changes
tracks[0].oncuechange = function() {
  const cue = this.activeCues[0];
  if (cue) {
    console.log('Subtitle:', cue.text);
  }
};
```

---

## 7.7.10 Common Patterns

### Custom Video Player

```javascript
class VideoPlayer {
  constructor(container) {
    this.container = container;
    this.video = container.querySelector('video');
    this.setupControls();
    this.bindEvents();
  }
  
  setupControls() {
    this.playBtn = this.container.querySelector('.play-btn');
    this.progress = this.container.querySelector('.progress');
    this.progressBar = this.container.querySelector('.progress-bar');
    this.timeDisplay = this.container.querySelector('.time');
    this.volumeSlider = this.container.querySelector('.volume');
  }
  
  bindEvents() {
    this.playBtn.onclick = () => this.togglePlay();
    this.progress.onclick = (e) => this.seek(e);
    this.volumeSlider.oninput = (e) => this.setVolume(e.target.value);
    
    this.video.ontimeupdate = () => this.updateProgress();
    this.video.onloadedmetadata = () => this.updateTime();
  }
  
  togglePlay() {
    if (this.video.paused) {
      this.video.play();
      this.playBtn.textContent = '⏸';
    } else {
      this.video.pause();
      this.playBtn.textContent = '▶';
    }
  }
  
  seek(event) {
    const rect = this.progress.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.video.currentTime = percent * this.video.duration;
  }
  
  setVolume(value) {
    this.video.volume = value;
  }
  
  updateProgress() {
    const percent = (this.video.currentTime / this.video.duration) * 100;
    this.progressBar.style.width = `${percent}%`;
    this.updateTime();
  }
  
  updateTime() {
    const current = this.formatTime(this.video.currentTime);
    const duration = this.formatTime(this.video.duration);
    this.timeDisplay.textContent = `${current} / ${duration}`;
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

### Lazy Loading Videos

```javascript
const videos = document.querySelectorAll('video[data-src]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      video.load();
      observer.unobserve(video);
    }
  });
});

videos.forEach(video => observer.observe(video));
```

---

## 7.7.11 Summary

### Key Properties

| Property | Description |
|----------|-------------|
| `currentTime` | Current position (seconds) |
| `duration` | Total duration |
| `paused` | Is paused |
| `ended` | Has ended |
| `volume` | Volume level (0-1) |
| `muted` | Is muted |
| `playbackRate` | Playback speed |
| `readyState` | Data availability |

### Key Methods

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `load()` | Reload media |

### Key Events

| Event | When |
|-------|------|
| `play` | Playback starts |
| `pause` | Playback pauses |
| `ended` | Playback ends |
| `timeupdate` | Time changes |
| `loadedmetadata` | Metadata loaded |
| `error` | Error occurs |

### Best Practices

1. **Always handle play() promise** for autoplay
2. **Check readyState** before operations
3. **Handle errors** gracefully
4. **Provide fallback formats**
5. **Use lazy loading** for performance
6. **Respect user preferences** (prefers-reduced-motion)

---

**End of Chapter 7.7: HTMLMediaElement**

Next chapter: **7.8 Picture-in-Picture API** — covers floating video windows.
# 7.8 Picture-in-Picture API

The Picture-in-Picture (PiP) API allows videos to float in a small window above other windows. This chapter covers entering and exiting PiP mode, handling events, and styling the PiP window.

---

## 7.8.1 Picture-in-Picture Basics

### What Is Picture-in-Picture?

```javascript
// Picture-in-Picture (PiP):
// - Video floats above other windows
// - Stays visible while using other apps
// - User can resize and position
// - Works across browser tabs and applications
```

### Checking Support

```javascript
// Check if PiP is supported
if ('pictureInPictureEnabled' in document) {
  console.log('PiP supported');
}

// Check if currently disabled
if (document.pictureInPictureEnabled) {
  console.log('PiP is available');
} else {
  console.log('PiP is disabled');
}

// Check if video can enter PiP
if (video.disablePictureInPicture) {
  console.log('PiP disabled for this video');
}
```

---

## 7.8.2 Entering and Exiting PiP

### Request Picture-in-Picture

```javascript
const video = document.getElementById('video');

async function enterPiP() {
  try {
    await video.requestPictureInPicture();
    console.log('Entered PiP');
  } catch (error) {
    console.error('Failed to enter PiP:', error);
  }
}

// Must be called from user gesture
button.addEventListener('click', enterPiP);
```

### Exit Picture-in-Picture

```javascript
async function exitPiP() {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    console.log('Exited PiP');
  }
}

// Or just close the PiP window
```

### Toggle PiP

```javascript
async function togglePiP() {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
  } else {
    await video.requestPictureInPicture();
  }
}
```

---

## 7.8.3 PiP Events

### Video Events

```javascript
const video = document.getElementById('video');

video.addEventListener('enterpictureinpicture', (event) => {
  console.log('Entered PiP');
  
  // PictureInPictureWindow object
  const pipWindow = event.pictureInPictureWindow;
  console.log('PiP window size:', pipWindow.width, pipWindow.height);
});

video.addEventListener('leavepictureinpicture', () => {
  console.log('Left PiP');
});
```

### PiP Window Events

```javascript
video.addEventListener('enterpictureinpicture', (event) => {
  const pipWindow = event.pictureInPictureWindow;
  
  // Window resize
  pipWindow.addEventListener('resize', () => {
    console.log('PiP resized:', pipWindow.width, pipWindow.height);
  });
});
```

---

## 7.8.4 PictureInPictureWindow

### Window Properties

```javascript
video.addEventListener('enterpictureinpicture', (event) => {
  const pipWindow = event.pictureInPictureWindow;
  
  // Window dimensions
  console.log('Width:', pipWindow.width);
  console.log('Height:', pipWindow.height);
});
```

### Current PiP Element

```javascript
// Get current PiP element
const currentPiP = document.pictureInPictureElement;

if (currentPiP) {
  console.log('Video in PiP:', currentPiP);
}
```

---

## 7.8.5 Disabling PiP

### Per Video

```html
<!-- Disable PiP for specific video -->
<video src="video.mp4" disablepictureinpicture></video>
```

```javascript
// Or via JavaScript
video.disablePictureInPicture = true;
```

---

## 7.8.6 Media Session Integration

### Controlling PiP Playback

```javascript
// Add media session actions for PiP controls
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    video.play();
  });
  
  navigator.mediaSession.setActionHandler('pause', () => {
    video.pause();
  });
  
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    video.currentTime -= 10;
  });
  
  navigator.mediaSession.setActionHandler('seekforward', () => {
    video.currentTime += 10;
  });
  
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    playPreviousVideo();
  });
  
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    playNextVideo();
  });
}
```

### Media Metadata

```javascript
navigator.mediaSession.metadata = new MediaMetadata({
  title: 'Video Title',
  artist: 'Creator Name',
  album: 'Series Name',
  artwork: [
    { src: 'thumbnail-96.png', sizes: '96x96', type: 'image/png' },
    { src: 'thumbnail-512.png', sizes: '512x512', type: 'image/png' }
  ]
});
```

---

## 7.8.7 Complete Example

### PiP Video Player

```javascript
class PiPPlayer {
  constructor(videoElement, pipButton) {
    this.video = videoElement;
    this.button = pipButton;
    this.pipWindow = null;
    
    this.setupEventListeners();
    this.updateButton();
  }
  
  setupEventListeners() {
    // Button click
    this.button.addEventListener('click', () => this.togglePiP());
    
    // PiP events
    this.video.addEventListener('enterpictureinpicture', (e) => {
      this.pipWindow = e.pictureInPictureWindow;
      this.updateButton();
      
      this.pipWindow.addEventListener('resize', () => {
        this.onPiPResize();
      });
    });
    
    this.video.addEventListener('leavepictureinpicture', () => {
      this.pipWindow = null;
      this.updateButton();
    });
  }
  
  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await this.video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }
  
  updateButton() {
    if (document.pictureInPictureElement) {
      this.button.textContent = 'Exit PiP';
      this.button.classList.add('active');
    } else {
      this.button.textContent = 'Enter PiP';
      this.button.classList.remove('active');
    }
    
    // Disable if PiP not available
    this.button.disabled = !document.pictureInPictureEnabled;
  }
  
  onPiPResize() {
    console.log(`PiP resized: ${this.pipWindow.width}x${this.pipWindow.height}`);
  }
  
  get isInPiP() {
    return document.pictureInPictureElement === this.video;
  }
}

// Usage
const player = new PiPPlayer(
  document.getElementById('video'),
  document.getElementById('pip-button')
);
```

---

## 7.8.8 Auto-PiP on Scroll

```javascript
function setupAutoPiP(video) {
  const observer = new IntersectionObserver(
    async (entries) => {
      const [entry] = entries;
      
      if (!entry.isIntersecting && !video.paused) {
        // Video scrolled out of view while playing
        try {
          if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
            await video.requestPictureInPicture();
          }
        } catch (e) {
          // User gesture required or other error
        }
      } else if (entry.isIntersecting && document.pictureInPictureElement === video) {
        // Video scrolled back into view
        await document.exitPictureInPicture();
      }
    },
    { threshold: 0.5 }
  );
  
  observer.observe(video);
  
  return observer;
}
```

---

## 7.8.9 Document Picture-in-Picture (Emerging)

### Full Document PiP

```javascript
// Document PiP API (Chrome 116+)
// Allows any HTML content in PiP, not just video

async function openDocumentPiP() {
  // Check support
  if (!('documentPictureInPicture' in window)) {
    console.log('Document PiP not supported');
    return;
  }
  
  // Open PiP window
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: 400,
    height: 300
  });
  
  // Add content to PiP window
  const container = document.createElement('div');
  container.innerHTML = `
    <video src="video.mp4" autoplay></video>
    <button id="next">Next</button>
  `;
  
  // Copy styles
  [...document.styleSheets].forEach(sheet => {
    try {
      const css = [...sheet.cssRules].map(rule => rule.cssText).join('');
      const style = pipWindow.document.createElement('style');
      style.textContent = css;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      // Cross-origin stylesheets
    }
  });
  
  pipWindow.document.body.appendChild(container);
}
```

---

## 7.8.10 Summary

### Key Methods

| Method | Description |
|--------|-------------|
| `video.requestPictureInPicture()` | Enter PiP |
| `document.exitPictureInPicture()` | Exit PiP |

### Key Properties

| Property | Description |
|----------|-------------|
| `document.pictureInPictureEnabled` | PiP available |
| `document.pictureInPictureElement` | Current PiP element |
| `video.disablePictureInPicture` | Disable PiP |

### Key Events

| Event | When |
|-------|------|
| `enterpictureinpicture` | Entered PiP |
| `leavepictureinpicture` | Left PiP |

### PiP Window Properties

| Property | Description |
|----------|-------------|
| `width` | Window width |
| `height` | Window height |

### Best Practices

1. **Check support** before using
2. **Handle errors** from requestPictureInPicture
3. **Integrate with Media Session** for controls
4. **Update UI** on PiP state changes
5. **Consider auto-PiP** on scroll for video sites
6. **Respect user preference** - don't force PiP

---

**End of Chapter 7.8: Picture-in-Picture API**

This completes the Multimedia APIs group. Next section: **Group 08 — Graphics and Visualization** — covers SVG and Web Animations API.
