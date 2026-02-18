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
