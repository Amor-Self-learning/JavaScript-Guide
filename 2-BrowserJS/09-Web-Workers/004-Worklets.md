# 9.4 Worklets

Worklets are lightweight, specialized workers for specific rendering and audio tasks. This chapter covers Audio Worklets, Paint Worklets, Animation Worklets, and Layout Worklets.

---

## 9.4.1 Worklets Overview

### What Are Worklets?

```javascript
// Worklets are specialized workers for:
// - Audio processing (Audio Worklet)
// - Custom CSS painting (Paint Worklet)
// - Custom animations (Animation Worklet)
// - Custom layout algorithms (Layout Worklet)

// Differences from Web Workers:
// - Render-thread access (most)
// - Specialized APIs
// - Lifecycle tied to rendering
// - Cannot use postMessage
// - Use class-based registration
```

### Worklet Types

| Worklet | Purpose | Thread |
|---------|---------|--------|
| AudioWorklet | Audio processing | Audio thread |
| PaintWorklet | Custom CSS painting | Main thread |
| AnimationWorklet | Scroll-linked animations | Compositor thread |
| LayoutWorklet | Custom layouts | Main thread |

---

## 9.4.2 Audio Worklet

### Overview

```javascript
// Audio Worklet replaces deprecated ScriptProcessorNode
// - Runs on dedicated audio thread
// - Low-latency audio processing
// - 128-sample block processing
```

### Registering Audio Worklet

```javascript
// main.js
const audioContext = new AudioContext();

// Load worklet module
await audioContext.audioWorklet.addModule('audio-processor.js');

// Create node
const processorNode = new AudioWorkletNode(audioContext, 'my-processor');

// Connect to audio graph
source.connect(processorNode);
processorNode.connect(audioContext.destination);
```

### Audio Processor

```javascript
// audio-processor.js
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.phase = 0;
  }
  
  process(inputs, outputs, parameters) {
    const output = outputs[0];
    const frequency = 440;
    const sampleRate = globalThis.sampleRate;
    
    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      
      for (let i = 0; i < outputChannel.length; i++) {
        // Generate sine wave
        outputChannel[i] = Math.sin(this.phase);
        this.phase += (2 * Math.PI * frequency) / sampleRate;
      }
    }
    
    // Return true to keep processor alive
    return true;
  }
}

registerProcessor('my-processor', MyProcessor);
```

### Parameters

```javascript
// audio-processor.js
class GainProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [{
      name: 'gain',
      defaultValue: 1,
      minValue: 0,
      maxValue: 1,
      automationRate: 'a-rate'  // or 'k-rate'
    }];
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    const gain = parameters.gain;
    
    for (let channel = 0; channel < input.length; channel++) {
      for (let i = 0; i < input[channel].length; i++) {
        // Use per-sample gain if available
        const g = gain.length > 1 ? gain[i] : gain[0];
        output[channel][i] = input[channel][i] * g;
      }
    }
    
    return true;
  }
}

registerProcessor('gain-processor', GainProcessor);
```

### Communication

```javascript
// main.js
const node = new AudioWorkletNode(audioContext, 'my-processor');

// Send message to worklet
node.port.postMessage({ type: 'config', value: 42 });

// Receive from worklet
node.port.onmessage = (event) => {
  console.log('From worklet:', event.data);
};
```

```javascript
// audio-processor.js
class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    this.port.onmessage = (event) => {
      console.log('From main:', event.data);
      // Handle configuration
    };
  }
  
  process(inputs, outputs, parameters) {
    // Send data back
    this.port.postMessage({ level: this.calculateLevel(inputs) });
    return true;
  }
}
```

---

## 9.4.3 Paint Worklet

### Overview

```javascript
// Paint Worklet enables custom CSS painting
// - Used with CSS paint() function
// - Runs on main thread
// - Access to canvas-like API
// - Triggered on paint
```

### Registering Paint Worklet

```javascript
// main.js
CSS.paintWorklet.addModule('paint-worklet.js');
```

### Paint Worklet Definition

```javascript
// paint-worklet.js
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checker-size', '--checker-color'];
  }
  
  paint(ctx, size, properties) {
    const checkerSize = parseInt(properties.get('--checker-size')) || 16;
    const color = properties.get('--checker-color').toString() || 'black';
    
    ctx.fillStyle = color;
    
    for (let y = 0; y < size.height; y += checkerSize * 2) {
      for (let x = 0; x < size.width; x += checkerSize * 2) {
        ctx.fillRect(x, y, checkerSize, checkerSize);
        ctx.fillRect(x + checkerSize, y + checkerSize, checkerSize, checkerSize);
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);
```

### Using in CSS

```css
.element {
  --checker-size: 20;
  --checker-color: blue;
  background-image: paint(checkerboard);
}
```

### Paint Context

```javascript
class MyPainter {
  paint(ctx, size, properties) {
    // ctx is similar to CanvasRenderingContext2D
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size.width, size.height);
    
    ctx.beginPath();
    ctx.arc(size.width / 2, size.height / 2, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // size.width and size.height are element dimensions
  }
}
```

### Complex Example

```javascript
// ripple-worklet.js
class RipplePainter {
  static get inputProperties() {
    return ['--ripple-x', '--ripple-y', '--ripple-progress'];
  }
  
  paint(ctx, size, properties) {
    const x = parseFloat(properties.get('--ripple-x')) || 0;
    const y = parseFloat(properties.get('--ripple-y')) || 0;
    const progress = parseFloat(properties.get('--ripple-progress')) || 0;
    
    const maxRadius = Math.hypot(
      Math.max(x, size.width - x),
      Math.max(y, size.height - y)
    );
    
    const radius = maxRadius * progress;
    const alpha = 1 - progress;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

registerPaint('ripple', RipplePainter);
```

---

## 9.4.4 Animation Worklet

### Overview

```javascript
// Animation Worklet enables scroll-linked and
// high-performance animations
// - Runs on compositor thread
// - Avoids main thread jank
// - Scroll-driven animations
```

### Registering Animation Worklet

```javascript
// main.js
await CSS.animationWorklet.addModule('animation-worklet.js');
```

### Animation Definition

```javascript
// animation-worklet.js
class ScrollProgressAnimator {
  constructor(options) {
    this.rate = options.rate || 1;
  }
  
  animate(currentTime, effect) {
    // currentTime is scroll position (0-100%)
    effect.localTime = currentTime * this.rate;
  }
}

registerAnimator('scroll-progress', ScrollProgressAnimator);
```

### Using Animation Worklet

```javascript
// main.js
const element = document.querySelector('.animated');

// Create scroll timeline
const scrollTimeline = new ScrollTimeline({
  source: document.documentElement,
  orientation: 'vertical'
});

// Create animation
const animation = new WorkletAnimation(
  'scroll-progress',
  new KeyframeEffect(
    element,
    [
      { transform: 'translateX(0)' },
      { transform: 'translateX(500px)' }
    ],
    { duration: 1, fill: 'both' }
  ),
  scrollTimeline,
  { rate: 1 }
);

animation.play();
```

---

## 9.4.5 Layout Worklet

### Overview

```javascript
// Layout Worklet enables custom CSS layouts
// - Define your own display algorithms
// - Like creating a new display type
// - Experimental feature
```

### Registering Layout Worklet

```javascript
// main.js
CSS.layoutWorklet.addModule('layout-worklet.js');
```

### Layout Definition

```javascript
// layout-worklet.js
class MasonryLayout {
  static get inputProperties() {
    return ['--columns', '--gap'];
  }
  
  static get childInputProperties() {
    return [];
  }
  
  async intrinsicSizes(children, edges, styleMap) {
    // Return min/max content sizes
  }
  
  async layout(children, edges, constraints, styleMap) {
    const columns = parseInt(styleMap.get('--columns')) || 3;
    const gap = parseInt(styleMap.get('--gap')) || 10;
    
    const columnWidth = (constraints.fixedInlineSize - gap * (columns - 1)) / columns;
    const columnHeights = new Array(columns).fill(0);
    
    const childFragments = await Promise.all(children.map(async (child) => {
      const fragment = await child.layoutNextFragment({
        fixedInlineSize: columnWidth
      });
      
      // Find shortest column
      const column = columnHeights.indexOf(Math.min(...columnHeights));
      
      fragment.inlineOffset = column * (columnWidth + gap);
      fragment.blockOffset = columnHeights[column];
      
      columnHeights[column] += fragment.blockSize + gap;
      
      return fragment;
    }));
    
    return {
      childFragments,
      autoBlockSize: Math.max(...columnHeights)
    };
  }
}

registerLayout('masonry', MasonryLayout);
```

### Using in CSS

```css
.container {
  display: layout(masonry);
  --columns: 3;
  --gap: 16;
}
```

---

## 9.4.6 Comparison

### Feature Matrix

| Feature | Audio | Paint | Animation | Layout |
|---------|-------|-------|-----------|--------|
| Thread | Audio | Main | Compositor | Main |
| Canvas API | No | Yes | No | No |
| CSS Properties | No | Yes | No | Yes |
| Streaming | Yes | No | No | No |
| Browser Support | Good | Good | Limited | Limited |

### When to Use

```javascript
// Audio Worklet
// - Real-time audio effects
// - Audio synthesis
// - Audio analysis

// Paint Worklet
// - Custom backgrounds
// - Dynamic patterns
// - Animated backgrounds via CSS vars

// Animation Worklet
// - Scroll-linked animations
// - Parallax effects
// - Frame-perfect animations

// Layout Worklet
// - Custom layout algorithms
// - Masonry layouts
// - Complex grid systems
```

---

## 9.4.7 Summary

### Worklet Registration

| Type | Registration |
|------|--------------|
| Audio | `audioContext.audioWorklet.addModule()` |
| Paint | `CSS.paintWorklet.addModule()` |
| Animation | `CSS.animationWorklet.addModule()` |
| Layout | `CSS.layoutWorklet.addModule()` |

### Class Registration

| Type | Function |
|------|----------|
| Audio | `registerProcessor()` |
| Paint | `registerPaint()` |
| Animation | `registerAnimator()` |
| Layout | `registerLayout()` |

### Best Practices

1. **Check browser support** before using
2. **Keep worklet code lightweight**
3. **Use for performance-critical tasks**
4. **Provide fallbacks** for unsupported browsers
5. **Test across browsers**
6. **Consider polyfills** for Paint Worklet

---

**End of Chapter 9.4: Worklets**

This completes the Web Workers group. Next section: **Group 10 — Progressive Web Apps** — covers PWA features.
