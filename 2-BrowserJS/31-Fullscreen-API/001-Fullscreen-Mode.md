# 31.1 Fullscreen Mode

The Fullscreen API enables elements to be displayed in fullscreen mode, providing immersive experiences for videos, games, and presentations.

---

## 31.1.1 Enter Fullscreen

### Request Fullscreen

```javascript
async function enterFullscreen(element = document.documentElement) {
  try {
    await element.requestFullscreen();
    console.log('Entered fullscreen');
  } catch (error) {
    console.error('Fullscreen failed:', error);
  }
}

// Fullscreen the page
await enterFullscreen();

// Fullscreen a video
const video = document.querySelector('video');
await enterFullscreen(video);
```

### With Options

```javascript
await element.requestFullscreen({
  navigationUI: 'hide'  // 'auto', 'hide', or 'show'
});
```

---

## 31.1.2 Exit Fullscreen

### Exit Fullscreen

```javascript
async function exitFullscreen() {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
    console.log('Exited fullscreen');
  }
}
```

---

## 31.1.3 Check Fullscreen State

### Current State

```javascript
// Check if in fullscreen
if (document.fullscreenElement) {
  console.log('Fullscreen element:', document.fullscreenElement);
} else {
  console.log('Not in fullscreen');
}

// Check if fullscreen is enabled
if (document.fullscreenEnabled) {
  console.log('Fullscreen is available');
}
```

---

## 31.1.4 Fullscreen Events

### Listen for Changes

```javascript
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen');
  } else {
    console.log('Exited fullscreen');
  }
});

document.addEventListener('fullscreenerror', (event) => {
  console.error('Fullscreen error:', event);
});
```

---

## 31.1.5 Toggle Fullscreen

### Toggle Function

```javascript
async function toggleFullscreen(element = document.documentElement) {
  if (document.fullscreenElement) {
    await document.exitFullscreen();
  } else {
    await element.requestFullscreen();
  }
}

// Usage
button.addEventListener('click', () => toggleFullscreen());
```

---

## 31.1.6 Fullscreen CSS

### Style Fullscreen Elements

```css
/* Style the fullscreen element */
:fullscreen {
  background: black;
}

/* Style elements inside fullscreen */
:fullscreen video {
  width: 100%;
  height: 100%;
}

/* Backdrop color */
::backdrop {
  background: black;
}
```

---

## 31.1.7 Complete Example

### Video Player Fullscreen

```javascript
class FullscreenVideo {
  constructor(video, container) {
    this.video = video;
    this.container = container;
    
    document.addEventListener('fullscreenchange', () => {
      this.onFullscreenChange();
    });
  }
  
  async toggleFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await this.container.requestFullscreen();
    }
  }
  
  onFullscreenChange() {
    const isFullscreen = !!document.fullscreenElement;
    
    this.container.classList.toggle('fullscreen', isFullscreen);
    this.onStateChange?.(isFullscreen);
  }
  
  get isFullscreen() {
    return document.fullscreenElement === this.container;
  }
}

// Usage
const player = new FullscreenVideo(video, videoContainer);
fullscreenButton.addEventListener('click', () => {
  player.toggleFullscreen();
});
```

---

## 31.1.8 Summary

### Methods

| Method | Description |
|--------|-------------|
| `element.requestFullscreen(options)` | Enter fullscreen |
| `document.exitFullscreen()` | Exit fullscreen |

### Properties

| Property | Description |
|----------|-------------|
| `document.fullscreenElement` | Current fullscreen element |
| `document.fullscreenEnabled` | Fullscreen available |

### Events

| Event | When |
|-------|------|
| `fullscreenchange` | Fullscreen state changes |
| `fullscreenerror` | Fullscreen request fails |

### CSS Selectors

| Selector | Description |
|----------|-------------|
| `:fullscreen` | Fullscreen element |
| `::backdrop` | Backdrop behind element |

### Best Practices

1. **Use user gesture** — required for request
2. **Handle errors** — may be blocked
3. **Listen for change** — update UI
4. **Style with :fullscreen** — adapt layout
5. **Provide exit control** — keyboard/button

---

**End of Chapter 31.1: Fullscreen Mode**

Next: **32.1 Mouse Lock** — Pointer Lock API.
