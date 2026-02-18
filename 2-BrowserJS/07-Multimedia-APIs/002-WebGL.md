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
