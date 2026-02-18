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
