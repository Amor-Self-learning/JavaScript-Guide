# 47.1 WebXR Device API

WebXR provides access to virtual reality (VR) and augmented reality (AR) devices.

---

## 47.1.1 Check Support

```javascript
if (!navigator.xr) {
  console.error('WebXR not supported');
}

// Check VR support
const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');

// Check AR support
const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
```

---

## 47.1.2 Start Session

```javascript
const session = await navigator.xr.requestSession('immersive-vr', {
  requiredFeatures: ['local-floor'],
  optionalFeatures: ['hand-tracking']
});
```

---

## 47.1.3 Render Loop

```javascript
const gl = canvas.getContext('webgl2', { xrCompatible: true });
const glLayer = new XRWebGLLayer(session, gl);

session.updateRenderState({
  baseLayer: glLayer
});

const referenceSpace = await session.requestReferenceSpace('local-floor');

session.requestAnimationFrame(function onFrame(time, frame) {
  session.requestAnimationFrame(onFrame);
  
  const pose = frame.getViewerPose(referenceSpace);
  
  if (pose) {
    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
      
      // Render scene with view.transform and view.projectionMatrix
    }
  }
});
```

---

## 47.1.4 Input Sources

```javascript
session.addEventListener('inputsourceschange', (event) => {
  for (const source of event.added) {
    console.log('Input added:', source.handedness, source.targetRayMode);
  }
});

// In render loop
for (const source of session.inputSources) {
  const pose = frame.getPose(source.targetRaySpace, referenceSpace);
  // Use pose.transform for controller position/rotation
}
```

---

## 47.1.5 Summary

| Session Type | Description |
|--------------|-------------|
| `inline` | In-page (no headset) |
| `immersive-vr` | Full VR |
| `immersive-ar` | Full AR |

---

**End of Chapter 47.1: WebXR Device API**

This completes Group 47 — WebXR API. Next: **Group 48 — Picture-in-Picture API**.
