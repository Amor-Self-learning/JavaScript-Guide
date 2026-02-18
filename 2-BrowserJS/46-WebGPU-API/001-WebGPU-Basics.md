# 46.1 WebGPU Basics

WebGPU is the next-generation graphics API, providing modern GPU access.

---

## 46.1.1 Get Adapter and Device

```javascript
if (!navigator.gpu) {
  throw new Error('WebGPU not supported');
}

const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();
```

---

## 46.1.2 Configure Canvas

```javascript
const canvas = document.getElementById('canvas');
const context = canvas.getContext('webgpu');

context.configure({
  device,
  format: navigator.gpu.getPreferredCanvasFormat(),
  alphaMode: 'opaque'
});
```

---

## 46.1.3 Create Pipeline

```javascript
const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module: device.createShaderModule({ code: vertexShader }),
    entryPoint: 'main'
  },
  fragment: {
    module: device.createShaderModule({ code: fragmentShader }),
    entryPoint: 'main',
    targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
  }
});
```

---

## 46.1.4 Render Pass

```javascript
const commandEncoder = device.createCommandEncoder();

const renderPass = commandEncoder.beginRenderPass({
  colorAttachments: [{
    view: context.getCurrentTexture().createView(),
    clearValue: { r: 0, g: 0, b: 0, a: 1 },
    loadOp: 'clear',
    storeOp: 'store'
  }]
});

renderPass.setPipeline(pipeline);
renderPass.draw(3);
renderPass.end();

device.queue.submit([commandEncoder.finish()]);
```

---

## 46.1.5 Summary

| Concept | Description |
|---------|-------------|
| Adapter | GPU hardware |
| Device | Logical connection |
| Pipeline | Render configuration |
| Command Encoder | GPU commands |

---

**End of Chapter 46.1: WebGPU Basics**

This completes Group 46 — WebGPU API. Next: **Group 47 — WebXR API**.
