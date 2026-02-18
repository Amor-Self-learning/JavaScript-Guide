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
