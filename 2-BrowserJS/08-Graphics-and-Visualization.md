# 8.1 SVG

Scalable Vector Graphics (SVG) provides XML-based vector graphics in the browser. This chapter covers inline SVG, DOM manipulation, paths, animations, and filters.

---

## 8.1.1 SVG Fundamentals

### What Is SVG?

```xml
<!-- SVG is XML-based vector graphics -->
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="50" fill="blue" />
</svg>
```

```javascript
// SVG advantages:
// - Resolution independent (scales without pixelation)
// - DOM accessible (can manipulate with JavaScript)
// - Styleable with CSS
// - Animatable
// - Smaller file sizes for simple graphics
// - Accessible (can add titles, descriptions)
```

### Inline SVG

```html
<!-- Inline SVG in HTML -->
<svg width="300" height="200" viewBox="0 0 300 200">
  <rect x="10" y="10" width="280" height="180" fill="#f0f0f0" stroke="#333" />
  <circle cx="150" cy="100" r="50" fill="blue" />
  <text x="150" y="105" text-anchor="middle" fill="white">SVG</text>
</svg>
```

### SVG as Image

```html
<!-- External SVG file -->
<img src="graphic.svg" alt="SVG graphic">

<!-- Background image -->
<style>
  .icon {
    background-image: url('icon.svg');
  }
</style>
```

---

## 8.1.2 Basic Shapes

### Rectangle

```xml
<!-- Rectangle -->
<rect x="10" y="10" width="100" height="50" 
      fill="blue" stroke="black" stroke-width="2" />

<!-- Rounded rectangle -->
<rect x="10" y="80" width="100" height="50" rx="10" ry="10" fill="green" />
```

### Circle and Ellipse

```xml
<!-- Circle -->
<circle cx="100" cy="100" r="50" fill="red" />

<!-- Ellipse -->
<ellipse cx="200" cy="100" rx="80" ry="50" fill="purple" />
```

### Line and Polyline

```xml
<!-- Line -->
<line x1="10" y1="10" x2="200" y2="100" stroke="black" stroke-width="2" />

<!-- Polyline (connected lines, not closed) -->
<polyline points="10,10 50,50 90,30 130,70" 
          fill="none" stroke="blue" stroke-width="2" />
```

### Polygon

```xml
<!-- Polygon (closed shape) -->
<polygon points="100,10 150,100 50,100" fill="orange" />

<!-- Star -->
<polygon points="100,10 120,80 190,80 130,120 150,190 100,150 50,190 70,120 10,80 80,80"
         fill="gold" stroke="orange" stroke-width="2" />
```

---

## 8.1.3 Paths

### Path Basics

```xml
<!-- Path element uses d attribute for commands -->
<path d="M 10 10 L 100 10 L 100 100 Z" fill="blue" />

<!-- Commands:
     M = Move to (start point)
     L = Line to
     H = Horizontal line
     V = Vertical line
     Z = Close path
     Lowercase = relative coordinates
-->
```

### Path Commands

```xml
<!-- Line commands -->
<path d="M 10 10 L 90 90" stroke="black" />          <!-- Line to -->
<path d="M 10 10 H 90" stroke="black" />              <!-- Horizontal -->
<path d="M 10 10 V 90" stroke="black" />              <!-- Vertical -->

<!-- Relative (lowercase) -->
<path d="M 10 10 l 80 80" stroke="black" />           <!-- Line relative -->
<path d="M 10 10 h 80" stroke="black" />              <!-- H relative -->
<path d="M 10 10 v 80" stroke="black" />              <!-- V relative -->
```

### Curves

```xml
<!-- Quadratic Bezier (Q) -->
<path d="M 10 80 Q 95 10 180 80" fill="none" stroke="black" />

<!-- Cubic Bezier (C) -->
<path d="M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80" 
      fill="none" stroke="blue" />

<!-- Arc (A) -->
<path d="M 10 80 A 45 45, 0, 0, 0, 125 125" fill="none" stroke="red" />

<!-- Arc parameters: rx ry x-axis-rotation large-arc-flag sweep-flag x y -->
```

### Complex Path Example

```xml
<!-- Heart shape -->
<path d="M 100 50 
         C 100 30, 130 10, 150 30
         C 170 50, 170 80, 100 140
         C 30 80, 30 50, 50 30
         C 70 10, 100 30, 100 50 Z" 
      fill="red" />
```

---

## 8.1.4 Text

### Basic Text

```xml
<text x="50" y="50" font-size="24" fill="black">Hello SVG</text>

<!-- Text attributes -->
<text x="50" y="80"
      font-family="Arial"
      font-size="20"
      font-weight="bold"
      fill="blue"
      text-anchor="middle">  <!-- start | middle | end -->
  Centered Text
</text>
```

### Text on Path

```xml
<defs>
  <path id="textPath" d="M 10 100 Q 100 20 190 100" />
</defs>

<text>
  <textPath href="#textPath">Text along a curved path</textPath>
</text>
```

### Multiline Text

```xml
<text x="50" y="50">
  <tspan x="50" dy="0">Line 1</tspan>
  <tspan x="50" dy="1.2em">Line 2</tspan>
  <tspan x="50" dy="1.2em">Line 3</tspan>
</text>
```

---

## 8.1.5 Gradients and Patterns

### Linear Gradient

```xml
<defs>
  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:blue" />
    <stop offset="100%" style="stop-color:red" />
  </linearGradient>
</defs>

<rect x="10" y="10" width="200" height="100" fill="url(#gradient1)" />
```

### Radial Gradient

```xml
<defs>
  <radialGradient id="gradient2" cx="50%" cy="50%" r="50%">
    <stop offset="0%" style="stop-color:white" />
    <stop offset="100%" style="stop-color:blue" />
  </radialGradient>
</defs>

<circle cx="100" cy="100" r="80" fill="url(#gradient2)" />
```

### Patterns

```xml
<defs>
  <pattern id="pattern1" x="0" y="0" width="20" height="20" 
           patternUnits="userSpaceOnUse">
    <circle cx="10" cy="10" r="5" fill="blue" />
  </pattern>
</defs>

<rect x="10" y="10" width="200" height="100" fill="url(#pattern1)" />
```

---

## 8.1.6 SVG DOM Manipulation

### Creating SVG Elements

```javascript
const svgNS = 'http://www.w3.org/2000/svg';

// Create SVG element
const svg = document.createElementNS(svgNS, 'svg');
svg.setAttribute('width', '300');
svg.setAttribute('height', '200');
svg.setAttribute('viewBox', '0 0 300 200');

// Create circle
const circle = document.createElementNS(svgNS, 'circle');
circle.setAttribute('cx', '100');
circle.setAttribute('cy', '100');
circle.setAttribute('r', '50');
circle.setAttribute('fill', 'blue');

svg.appendChild(circle);
document.body.appendChild(svg);
```

### Modifying SVG Elements

```javascript
// Get existing element
const circle = document.querySelector('circle');

// Modify attributes
circle.setAttribute('fill', 'red');
circle.setAttribute('r', '75');

// Get attributes
const radius = circle.getAttribute('r');
console.log(radius);  // "75"

// Remove attribute
circle.removeAttribute('stroke');
```

### SVG Element Properties

```javascript
// Some SVG elements have direct properties
const rect = document.querySelector('rect');

// Access via baseVal for animated properties
rect.x.baseVal.value = 50;
rect.width.baseVal.value = 100;

// For circles
const circle = document.querySelector('circle');
circle.cx.baseVal.value = 150;
circle.cy.baseVal.value = 100;
circle.r.baseVal.value = 40;
```

### Dynamic SVG Creation

```javascript
function createChart(data) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 400 200');
  
  const barWidth = 400 / data.length - 10;
  const maxValue = Math.max(...data);
  
  data.forEach((value, index) => {
    const barHeight = (value / maxValue) * 180;
    
    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', index * (barWidth + 10) + 5);
    rect.setAttribute('y', 200 - barHeight - 10);
    rect.setAttribute('width', barWidth);
    rect.setAttribute('height', barHeight);
    rect.setAttribute('fill', `hsl(${index * 60}, 70%, 50%)`);
    
    svg.appendChild(rect);
  });
  
  return svg;
}

document.body.appendChild(createChart([40, 80, 60, 100, 45, 90]));
```

---

## 8.1.7 SVG Filters

### Basic Filter

```xml
<defs>
  <filter id="blur">
    <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
  </filter>
</defs>

<circle cx="100" cy="100" r="50" fill="blue" filter="url(#blur)" />
```

### Drop Shadow

```xml
<defs>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="5" dy="5" stdDeviation="3" flood-color="black" 
                  flood-opacity="0.5" />
  </filter>
</defs>

<rect x="50" y="50" width="100" height="100" fill="blue" filter="url(#shadow)" />
```

### Complex Filter

```xml
<defs>
  <filter id="glow">
    <!-- Blur the source -->
    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
    <!-- Merge original on top of blur -->
    <feMerge>
      <feMergeNode in="blur" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>

<text x="100" y="50" font-size="24" fill="yellow" filter="url(#glow)">
  Glowing Text
</text>
```

### Color Matrix

```xml
<defs>
  <filter id="grayscale">
    <feColorMatrix type="saturate" values="0" />
  </filter>
</defs>

<image href="photo.jpg" width="200" height="150" filter="url(#grayscale)" />
```

---

## 8.1.8 SVG Animation

### CSS Animation

```xml
<style>
  .pulse {
    animation: pulse 1s ease-in-out infinite;
    transform-origin: center;
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
</style>

<circle class="pulse" cx="100" cy="100" r="50" fill="red" />
```

### SMIL Animation (Native SVG)

```xml
<!-- Animate attribute -->
<circle cx="100" cy="100" r="50" fill="blue">
  <animate attributeName="r" from="50" to="80" dur="1s" 
           repeatCount="indefinite" />
</circle>

<!-- Animate along path -->
<circle r="10" fill="red">
  <animateMotion dur="3s" repeatCount="indefinite"
                 path="M 50 100 Q 150 50 250 100 T 450 100" />
</circle>

<!-- Transform animation -->
<rect x="-25" y="-25" width="50" height="50" fill="green">
  <animateTransform attributeName="transform" type="rotate"
                    from="0" to="360" dur="2s" repeatCount="indefinite" />
</rect>
```

### JavaScript Animation

```javascript
function animateCircle(circle) {
  let radius = 50;
  let growing = true;
  
  function animate() {
    if (growing) {
      radius += 0.5;
      if (radius >= 80) growing = false;
    } else {
      radius -= 0.5;
      if (radius <= 50) growing = true;
    }
    
    circle.setAttribute('r', radius);
    requestAnimationFrame(animate);
  }
  
  animate();
}
```

---

## 8.1.9 Transforms

### Transform Attribute

```xml
<!-- Translate -->
<rect transform="translate(50, 30)" ... />

<!-- Rotate -->
<rect transform="rotate(45)" ... />
<rect transform="rotate(45, 100, 100)" ... />  <!-- Around point -->

<!-- Scale -->
<rect transform="scale(2)" ... />
<rect transform="scale(2, 0.5)" ... />  <!-- Different x/y -->

<!-- Skew -->
<rect transform="skewX(30)" ... />
<rect transform="skewY(30)" ... />

<!-- Multiple transforms -->
<rect transform="translate(50, 50) rotate(45) scale(1.5)" ... />
```

### Transform via JavaScript

```javascript
// Apply transform
element.setAttribute('transform', 'translate(100, 50) rotate(45)');

// Using SVGTransform API
const svg = document.querySelector('svg');
const rect = document.querySelector('rect');

const transform = svg.createSVGTransform();
transform.setRotate(45, 100, 100);

rect.transform.baseVal.appendItem(transform);
```

---

## 8.1.10 viewBox and Coordinate System

### viewBox

```xml
<!-- viewBox: min-x, min-y, width, height -->
<svg width="200" height="200" viewBox="0 0 100 100">
  <!-- Coordinates 0-100 map to 0-200px -->
  <circle cx="50" cy="50" r="40" />
</svg>

<!-- Zoom in (smaller viewBox = zoomed) -->
<svg width="200" height="200" viewBox="25 25 50 50">
  <!-- Only see center portion, zoomed 2x -->
</svg>

<!-- Pan (offset viewBox) -->
<svg width="200" height="200" viewBox="50 0 100 100">
  <!-- Shifted right by 50 units -->
</svg>
```

### preserveAspectRatio

```xml
<!-- How to fit content when aspect ratios differ -->
<svg viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet">
  <!-- Default: center and fit inside -->
</svg>

<svg viewBox="0 0 100 50" preserveAspectRatio="xMidYMid slice">
  <!-- Fill container, crop excess -->
</svg>

<svg viewBox="0 0 100 50" preserveAspectRatio="none">
  <!-- Stretch to fill (distorts) -->
</svg>
```

---

## 8.1.11 Summary

### Basic Shapes

| Shape | Key Attributes |
|-------|----------------|
| `<rect>` | x, y, width, height, rx, ry |
| `<circle>` | cx, cy, r |
| `<ellipse>` | cx, cy, rx, ry |
| `<line>` | x1, y1, x2, y2 |
| `<polygon>` | points |
| `<path>` | d (path commands) |

### Path Commands

| Command | Meaning |
|---------|---------|
| M/m | Move to |
| L/l | Line to |
| H/h | Horizontal line |
| V/v | Vertical line |
| C/c | Cubic Bezier |
| Q/q | Quadratic Bezier |
| A/a | Arc |
| Z | Close path |

### Filter Primitives

| Filter | Effect |
|--------|--------|
| `feGaussianBlur` | Blur |
| `feDropShadow` | Shadow |
| `feColorMatrix` | Color transform |
| `feMerge` | Combine results |

### Best Practices

1. **Use viewBox** for responsive SVGs
2. **Define reusable elements** in `<defs>`
3. **Optimize paths** with tools like SVGO
4. **Use CSS for styling** when possible
5. **Add accessibility** with title and desc
6. **Use symbols** for icon systems

---

**End of Chapter 8.1: SVG**

Next chapter: **8.2 Web Animations API** — covers JavaScript-based animations.
# 8.2 Web Animations API

The Web Animations API provides programmatic control over animations, unifying CSS Animations, CSS Transitions, and JavaScript-based animations under a single API.

---

## 8.2.1 Basic Animation

### element.animate()

```javascript
const element = document.getElementById('box');

// Simple animation
const animation = element.animate([
  { transform: 'translateX(0px)' },
  { transform: 'translateX(300px)' }
], {
  duration: 1000,
  iterations: 1
});
```

### Multiple Properties

```javascript
element.animate([
  { 
    transform: 'scale(1)',
    opacity: 1,
    backgroundColor: 'blue'
  },
  { 
    transform: 'scale(1.5)',
    opacity: 0.5,
    backgroundColor: 'red'
  }
], {
  duration: 500,
  fill: 'forwards'
});
```

---

## 8.2.2 Keyframes

### Array Format

```javascript
// Array of keyframes (auto-distributed)
const keyframes = [
  { transform: 'rotate(0deg)', opacity: 1 },
  { transform: 'rotate(180deg)', opacity: 0.5 },
  { transform: 'rotate(360deg)', opacity: 1 }
];

element.animate(keyframes, 2000);
```

### With Offsets

```javascript
// Control timing with offset (0-1)
const keyframes = [
  { transform: 'translateX(0)', offset: 0 },
  { transform: 'translateX(100px)', offset: 0.3 },
  { transform: 'translateX(200px)', offset: 0.8 },
  { transform: 'translateX(300px)', offset: 1 }
];

element.animate(keyframes, 2000);
```

### Object Format

```javascript
// Object format with arrays per property
const keyframes = {
  transform: ['translateX(0)', 'translateX(100px)', 'translateX(0)'],
  opacity: [1, 0.5, 1],
  offset: [0, 0.7, 1]  // Optional timing
};

element.animate(keyframes, 1000);
```

### Computed Keyframes

```javascript
// Use null to compute from current style
element.style.transform = 'translateX(50px)';

element.animate([
  { transform: null },  // Computed: translateX(50px)
  { transform: 'translateX(200px)' }
], 1000);
```

---

## 8.2.3 Animation Options

### All Options

```javascript
element.animate(keyframes, {
  // Timing
  duration: 1000,              // milliseconds
  delay: 200,                  // start delay
  endDelay: 100,               // delay after animation
  
  // Iteration
  iterations: 3,               // number or Infinity
  iterationStart: 0.5,         // start midway through
  
  // Direction
  direction: 'normal',         // normal | reverse | alternate | alternate-reverse
  
  // Easing
  easing: 'ease-in-out',       // CSS easing or cubic-bezier
  
  // Fill mode
  fill: 'forwards',            // none | forwards | backwards | both
  
  // Composite
  composite: 'replace',        // replace | add | accumulate
  
  // ID for debugging
  id: 'my-animation'
});
```

### Easing Functions

```javascript
// Built-in
element.animate(keyframes, { easing: 'linear' });
element.animate(keyframes, { easing: 'ease' });
element.animate(keyframes, { easing: 'ease-in' });
element.animate(keyframes, { easing: 'ease-out' });
element.animate(keyframes, { easing: 'ease-in-out' });

// Cubic bezier
element.animate(keyframes, { easing: 'cubic-bezier(0.42, 0, 0.58, 1)' });

// Steps
element.animate(keyframes, { easing: 'steps(5, end)' });

// Per-keyframe easing
const keyframes = [
  { transform: 'translateX(0)', easing: 'ease-in' },
  { transform: 'translateX(100px)', easing: 'ease-out' },
  { transform: 'translateX(200px)' }
];
```

---

## 8.2.4 Animation Object

### Properties

```javascript
const animation = element.animate(keyframes, options);

// Read-only properties
console.log(animation.id);              // Animation ID
console.log(animation.playState);       // 'idle' | 'running' | 'paused' | 'finished'
console.log(animation.pending);         // true if pending play/pause
console.log(animation.ready);           // Promise resolved when ready
console.log(animation.finished);        // Promise resolved when finished

// Writable properties
animation.currentTime = 500;            // Current position (ms)
animation.playbackRate = 2;             // Speed multiplier
animation.startTime = 1000;             // Sync with timeline
```

### Methods

```javascript
const animation = element.animate(keyframes, options);

// Playback control
animation.play();       // Start/resume
animation.pause();      // Pause
animation.finish();     // Jump to end
animation.cancel();     // Stop and reset
animation.reverse();    // Reverse direction

// Update timing
animation.updatePlaybackRate(0.5);  // Smooth rate change

// Persist
animation.persist();    // Keep finished animation (replaces fill: forwards)

// Commit
animation.commitStyles();  // Apply current styles to element
```

---

## 8.2.5 Playback Control

### Play, Pause, Resume

```javascript
const animation = element.animate(keyframes, { duration: 2000 });

// Pause
pauseButton.onclick = () => animation.pause();

// Resume
playButton.onclick = () => animation.play();

// Check state
console.log(animation.playState);  // 'running', 'paused', etc.
```

### Speed Control

```javascript
// Slow motion
animation.playbackRate = 0.5;

// Fast forward
animation.playbackRate = 2;

// Reverse
animation.playbackRate = -1;

// Smooth rate change
animation.updatePlaybackRate(2);
```

### Seeking

```javascript
// Jump to specific time
animation.currentTime = 1000;  // Jump to 1 second

// Jump to percentage
animation.currentTime = animation.effect.getTiming().duration * 0.5;

// Scrubbing (paused seeking)
animation.pause();
slider.oninput = (e) => {
  animation.currentTime = e.target.value;
};
```

---

## 8.2.6 Animation Events

### Promise-Based Events

```javascript
const animation = element.animate(keyframes, options);

// When animation is ready to play
animation.ready.then(() => {
  console.log('Animation ready');
});

// When animation finishes
animation.finished.then(() => {
  console.log('Animation finished');
}).catch(() => {
  console.log('Animation cancelled');
});
```

### Event Listeners

```javascript
animation.addEventListener('finish', () => {
  console.log('Animation finished');
});

animation.addEventListener('cancel', () => {
  console.log('Animation cancelled');
});

animation.addEventListener('remove', () => {
  console.log('Animation removed');
});

// Using onfinish
animation.onfinish = () => {
  console.log('Finished');
};

animation.oncancel = () => {
  console.log('Cancelled');
};
```

---

## 8.2.7 KeyframeEffect

### Creating KeyframeEffect

```javascript
// Create effect separately from animation
const effect = new KeyframeEffect(
  element,
  keyframes,
  options
);

// Create animation from effect
const animation = new Animation(effect, document.timeline);
animation.play();
```

### Modifying Effect

```javascript
const animation = element.animate(keyframes, options);

// Access the effect
const effect = animation.effect;

// Get timing
const timing = effect.getTiming();
console.log(timing.duration);
console.log(timing.iterations);

// Update timing
effect.updateTiming({ duration: 2000 });

// Get computed timing
const computed = effect.getComputedTiming();
console.log(computed.progress);       // 0-1 progress
console.log(computed.currentIteration);

// Get keyframes
const frames = effect.getKeyframes();

// Set new keyframes
effect.setKeyframes([
  { opacity: 1 },
  { opacity: 0 }
]);
```

### Retargeting Animation

```javascript
// Change target element
const newElement = document.getElementById('other');
const effect = animation.effect;

const newEffect = new KeyframeEffect(
  newElement,
  effect.getKeyframes(),
  effect.getTiming()
);

animation.effect = newEffect;
```

---

## 8.2.8 Document.getAnimations()

### Get All Animations

```javascript
// All animations on document
const allAnimations = document.getAnimations();

// Animations on specific element
const elementAnimations = element.getAnimations();

// Include CSS animations
const animations = element.getAnimations({ subtree: true });
```

### Controlling Multiple Animations

```javascript
// Pause all
document.getAnimations().forEach(animation => {
  animation.pause();
});

// Resume all
document.getAnimations().forEach(animation => {
  animation.play();
});

// Speed up all
document.getAnimations().forEach(animation => {
  animation.playbackRate = 2;
});
```

---

## 8.2.9 Composite Modes

### Replace (Default)

```javascript
// Each animation replaces previous values
element.animate([{ transform: 'translateX(100px)' }], {
  duration: 1000,
  composite: 'replace'  // Default
});
```

### Add

```javascript
// Animations combine
element.animate([{ transform: 'translateX(100px)' }], {
  duration: 1000,
  composite: 'add'
});

// Second animation adds to first
element.animate([{ transform: 'translateY(50px)' }], {
  duration: 1000,
  composite: 'add'
});

// Result: translateX(100px) + translateY(50px)
```

### Accumulate

```javascript
// Values accumulate across iterations
element.animate([
  { transform: 'translateX(0)' },
  { transform: 'translateX(100px)' }
], {
  duration: 500,
  iterations: 3,
  iterationComposite: 'accumulate'
});

// Each iteration adds 100px more
```

---

## 8.2.10 Common Patterns

### Fade In/Out

```javascript
function fadeIn(element, duration = 300) {
  return element.animate([
    { opacity: 0 },
    { opacity: 1 }
  ], {
    duration,
    fill: 'forwards'
  }).finished;
}

function fadeOut(element, duration = 300) {
  return element.animate([
    { opacity: 1 },
    { opacity: 0 }
  ], {
    duration,
    fill: 'forwards'
  }).finished;
}

// Usage with await
await fadeOut(element);
element.remove();
```

### Slide Animation

```javascript
function slideIn(element, direction = 'left') {
  const from = {
    left: 'translateX(-100%)',
    right: 'translateX(100%)',
    up: 'translateY(-100%)',
    down: 'translateY(100%)'
  }[direction];
  
  return element.animate([
    { transform: from, opacity: 0 },
    { transform: 'translate(0)', opacity: 1 }
  ], {
    duration: 300,
    easing: 'ease-out',
    fill: 'forwards'
  });
}
```

### Bounce Effect

```javascript
function bounce(element) {
  return element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.2)', offset: 0.3 },
    { transform: 'scale(0.9)', offset: 0.5 },
    { transform: 'scale(1.05)', offset: 0.7 },
    { transform: 'scale(1)' }
  ], {
    duration: 500,
    easing: 'ease-out'
  });
}
```

### Shake Effect

```javascript
function shake(element) {
  return element.animate([
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' }
  ], {
    duration: 500,
    easing: 'ease-in-out'
  });
}
```

### Staggered Animation

```javascript
function staggeredFadeIn(elements, stagger = 100) {
  return elements.map((element, index) => {
    return element.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 300,
      delay: index * stagger,
      fill: 'forwards',
      easing: 'ease-out'
    });
  });
}

// Usage
const items = document.querySelectorAll('.item');
staggeredFadeIn([...items], 50);
```

---

## 8.2.11 Summary

### Animation Methods

| Method | Description |
|--------|-------------|
| `element.animate()` | Create animation |
| `animation.play()` | Start/resume |
| `animation.pause()` | Pause |
| `animation.cancel()` | Stop and reset |
| `animation.finish()` | Jump to end |
| `animation.reverse()` | Reverse direction |

### Animation Properties

| Property | Description |
|----------|-------------|
| `playState` | Current state |
| `currentTime` | Position in ms |
| `playbackRate` | Speed multiplier |
| `ready` | Ready promise |
| `finished` | Finished promise |

### Animation Options

| Option | Description |
|--------|-------------|
| `duration` | Length in ms |
| `delay` | Start delay |
| `iterations` | Repeat count |
| `direction` | Play direction |
| `easing` | Timing function |
| `fill` | Before/after behavior |

### Best Practices

1. **Use promises** for sequencing
2. **Clean up animations** to prevent memory leaks
3. **Use `will-change`** for performance hints
4. **Prefer transform/opacity** for smooth animations
5. **Consider reduced motion** preferences
6. **Use composite modes** for layered effects

---

**End of Chapter 8.2: Web Animations API**

This completes the Graphics and Visualization group. Next section: **Group 09 — Web Workers** — covers background thread APIs.
