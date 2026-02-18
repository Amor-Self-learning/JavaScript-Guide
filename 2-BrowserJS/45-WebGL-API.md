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
# 45.2 Shaders

Shaders are programs that run on the GPU to process vertices and pixels.

---

## 45.2.1 Shader Types

### Vertex Shader

```glsl
attribute vec4 a_position;
uniform mat4 u_matrix;

void main() {
  gl_Position = u_matrix * a_position;
}
```

### Fragment Shader

```glsl
precision mediump float;
uniform vec4 u_color;

void main() {
  gl_FragColor = u_color;
}
```

---

## 45.2.2 Create Shaders

```javascript
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
```

---

## 45.2.3 Create Program

```javascript
function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}

gl.useProgram(program);
```

---

## 45.2.4 Summary

| Shader Type | Purpose |
|-------------|---------|
| Vertex | Position vertices |
| Fragment | Color pixels |

---

**End of Chapter 45.2: Shaders**

Next: **45.3 Buffers and Drawing**.
# 45.3 Buffers and Drawing

Buffers store vertex data on the GPU for efficient rendering.

---

## 45.3.1 Create Buffer

```javascript
const positions = new Float32Array([
  0.0,  0.5,
 -0.5, -0.5,
  0.5, -0.5
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
```

---

## 45.3.2 Connect to Attribute

```javascript
const positionLoc = gl.getAttribLocation(program, 'a_position');

gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(
  positionLoc,
  2,          // 2 components per vertex
  gl.FLOAT,   // data type
  false,      // normalize
  0,          // stride
  0           // offset
);
```

---

## 45.3.3 Set Uniforms

```javascript
const colorLoc = gl.getUniformLocation(program, 'u_color');
gl.uniform4f(colorLoc, 1.0, 0.0, 0.0, 1.0);  // Red

const matrixLoc = gl.getUniformLocation(program, 'u_matrix');
gl.uniformMatrix4fv(matrixLoc, false, matrix);
```

---

## 45.3.4 Draw

```javascript
// Draw triangles
gl.drawArrays(gl.TRIANGLES, 0, 3);

// Draw with indices
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
```

---

## 45.3.5 Summary

| Draw Mode | Description |
|-----------|-------------|
| `POINTS` | Individual points |
| `LINES` | Line segments |
| `TRIANGLES` | Filled triangles |
| `TRIANGLE_STRIP` | Connected triangles |

---

**End of Chapter 45.3: Buffers and Drawing**

This completes Group 45 — WebGL API. Next: **Group 46 — WebGPU API**.
