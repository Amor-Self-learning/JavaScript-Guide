# 33.1 Visibility State

The Page Visibility API detects when a page becomes visible or hidden, enabling efficient resource management.

---

## 33.1.1 Current State

### Check Visibility

```javascript
// Is page hidden?
console.log('Hidden:', document.hidden);

// Visibility state
console.log('State:', document.visibilityState);
// 'visible', 'hidden', or 'prerender'
```

---

## 33.1.2 Visibility Change Event

### Listen for Changes

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    console.log('Page is hidden');
    pauseActivity();
  } else {
    console.log('Page is visible');
    resumeActivity();
  }
});
```

---

## 33.1.3 Common Use Cases

### Pause Video

```javascript
const video = document.querySelector('video');

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    video.pause();
  } else {
    video.play();
  }
});
```

### Pause Game

```javascript
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    game.pause();
    showPauseMenu();
  }
});
```

### Stop Polling

```javascript
let pollInterval;

function startPolling() {
  pollInterval = setInterval(fetchData, 5000);
}

function stopPolling() {
  clearInterval(pollInterval);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling();
  } else {
    startPolling();
  }
});

startPolling();
```

### Analytics

```javascript
let startTime = Date.now();
let totalTime = 0;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    totalTime += Date.now() - startTime;
    sendAnalytics('page_hidden', { timeSpent: totalTime });
  } else {
    startTime = Date.now();
  }
});
```

---

## 33.1.4 Complete Example

### Visibility Manager

```javascript
class VisibilityManager {
  constructor() {
    this.visible = !document.hidden;
    this.callbacks = { show: [], hide: [] };
    
    document.addEventListener('visibilitychange', () => {
      this.visible = !document.hidden;
      
      const event = this.visible ? 'show' : 'hide';
      this.callbacks[event].forEach(cb => cb());
    });
  }
  
  onShow(callback) {
    this.callbacks.show.push(callback);
    return this;
  }
  
  onHide(callback) {
    this.callbacks.hide.push(callback);
    return this;
  }
  
  get isVisible() {
    return this.visible;
  }
}

// Usage
const visibility = new VisibilityManager();

visibility
  .onHide(() => {
    video.pause();
    stopAnimations();
  })
  .onShow(() => {
    video.play();
    resumeAnimations();
  });
```

---

## 33.1.5 Summary

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `document.hidden` | Boolean | Is page hidden |
| `document.visibilityState` | String | Current state |

### Visibility States

| State | Description |
|-------|-------------|
| `visible` | Page is visible |
| `hidden` | Page is hidden |
| `prerender` | Page is prerendering |

### Events

| Event | When |
|-------|------|
| `visibilitychange` | Visibility changes |

### Best Practices

1. **Pause media** when hidden
2. **Stop animations** to save resources
3. **Pause polling** and timers
4. **Resume on visible** — don't assume state
5. **Track time** for analytics

---

**End of Chapter 33.1: Visibility State**

Next: **34.1 Element Visibility Detection** — Intersection Observer API.
