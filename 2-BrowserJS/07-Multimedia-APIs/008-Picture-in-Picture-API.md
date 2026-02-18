# 7.8 Picture-in-Picture API

The Picture-in-Picture (PiP) API allows videos to float in a small window above other windows. This chapter covers entering and exiting PiP mode, handling events, and styling the PiP window.

---

## 7.8.1 Picture-in-Picture Basics

### What Is Picture-in-Picture?

```javascript
// Picture-in-Picture (PiP):
// - Video floats above other windows
// - Stays visible while using other apps
// - User can resize and position
// - Works across browser tabs and applications
```

### Checking Support

```javascript
// Check if PiP is supported
if ('pictureInPictureEnabled' in document) {
  console.log('PiP supported');
}

// Check if currently disabled
if (document.pictureInPictureEnabled) {
  console.log('PiP is available');
} else {
  console.log('PiP is disabled');
}

// Check if video can enter PiP
if (video.disablePictureInPicture) {
  console.log('PiP disabled for this video');
}
```

---

## 7.8.2 Entering and Exiting PiP

### Request Picture-in-Picture

```javascript
const video = document.getElementById('video');

async function enterPiP() {
  try {
    await video.requestPictureInPicture();
    console.log('Entered PiP');
  } catch (error) {
    console.error('Failed to enter PiP:', error);
  }
}

// Must be called from user gesture
button.addEventListener('click', enterPiP);
```

### Exit Picture-in-Picture

```javascript
async function exitPiP() {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
    console.log('Exited PiP');
  }
}

// Or just close the PiP window
```

### Toggle PiP

```javascript
async function togglePiP() {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture();
  } else {
    await video.requestPictureInPicture();
  }
}
```

---

## 7.8.3 PiP Events

### Video Events

```javascript
const video = document.getElementById('video');

video.addEventListener('enterpictureinpicture', (event) => {
  console.log('Entered PiP');
  
  // PictureInPictureWindow object
  const pipWindow = event.pictureInPictureWindow;
  console.log('PiP window size:', pipWindow.width, pipWindow.height);
});

video.addEventListener('leavepictureinpicture', () => {
  console.log('Left PiP');
});
```

### PiP Window Events

```javascript
video.addEventListener('enterpictureinpicture', (event) => {
  const pipWindow = event.pictureInPictureWindow;
  
  // Window resize
  pipWindow.addEventListener('resize', () => {
    console.log('PiP resized:', pipWindow.width, pipWindow.height);
  });
});
```

---

## 7.8.4 PictureInPictureWindow

### Window Properties

```javascript
video.addEventListener('enterpictureinpicture', (event) => {
  const pipWindow = event.pictureInPictureWindow;
  
  // Window dimensions
  console.log('Width:', pipWindow.width);
  console.log('Height:', pipWindow.height);
});
```

### Current PiP Element

```javascript
// Get current PiP element
const currentPiP = document.pictureInPictureElement;

if (currentPiP) {
  console.log('Video in PiP:', currentPiP);
}
```

---

## 7.8.5 Disabling PiP

### Per Video

```html
<!-- Disable PiP for specific video -->
<video src="video.mp4" disablepictureinpicture></video>
```

```javascript
// Or via JavaScript
video.disablePictureInPicture = true;
```

---

## 7.8.6 Media Session Integration

### Controlling PiP Playback

```javascript
// Add media session actions for PiP controls
if ('mediaSession' in navigator) {
  navigator.mediaSession.setActionHandler('play', () => {
    video.play();
  });
  
  navigator.mediaSession.setActionHandler('pause', () => {
    video.pause();
  });
  
  navigator.mediaSession.setActionHandler('seekbackward', () => {
    video.currentTime -= 10;
  });
  
  navigator.mediaSession.setActionHandler('seekforward', () => {
    video.currentTime += 10;
  });
  
  navigator.mediaSession.setActionHandler('previoustrack', () => {
    playPreviousVideo();
  });
  
  navigator.mediaSession.setActionHandler('nexttrack', () => {
    playNextVideo();
  });
}
```

### Media Metadata

```javascript
navigator.mediaSession.metadata = new MediaMetadata({
  title: 'Video Title',
  artist: 'Creator Name',
  album: 'Series Name',
  artwork: [
    { src: 'thumbnail-96.png', sizes: '96x96', type: 'image/png' },
    { src: 'thumbnail-512.png', sizes: '512x512', type: 'image/png' }
  ]
});
```

---

## 7.8.7 Complete Example

### PiP Video Player

```javascript
class PiPPlayer {
  constructor(videoElement, pipButton) {
    this.video = videoElement;
    this.button = pipButton;
    this.pipWindow = null;
    
    this.setupEventListeners();
    this.updateButton();
  }
  
  setupEventListeners() {
    // Button click
    this.button.addEventListener('click', () => this.togglePiP());
    
    // PiP events
    this.video.addEventListener('enterpictureinpicture', (e) => {
      this.pipWindow = e.pictureInPictureWindow;
      this.updateButton();
      
      this.pipWindow.addEventListener('resize', () => {
        this.onPiPResize();
      });
    });
    
    this.video.addEventListener('leavepictureinpicture', () => {
      this.pipWindow = null;
      this.updateButton();
    });
  }
  
  async togglePiP() {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await this.video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }
  
  updateButton() {
    if (document.pictureInPictureElement) {
      this.button.textContent = 'Exit PiP';
      this.button.classList.add('active');
    } else {
      this.button.textContent = 'Enter PiP';
      this.button.classList.remove('active');
    }
    
    // Disable if PiP not available
    this.button.disabled = !document.pictureInPictureEnabled;
  }
  
  onPiPResize() {
    console.log(`PiP resized: ${this.pipWindow.width}x${this.pipWindow.height}`);
  }
  
  get isInPiP() {
    return document.pictureInPictureElement === this.video;
  }
}

// Usage
const player = new PiPPlayer(
  document.getElementById('video'),
  document.getElementById('pip-button')
);
```

---

## 7.8.8 Auto-PiP on Scroll

```javascript
function setupAutoPiP(video) {
  const observer = new IntersectionObserver(
    async (entries) => {
      const [entry] = entries;
      
      if (!entry.isIntersecting && !video.paused) {
        // Video scrolled out of view while playing
        try {
          if (document.pictureInPictureEnabled && !document.pictureInPictureElement) {
            await video.requestPictureInPicture();
          }
        } catch (e) {
          // User gesture required or other error
        }
      } else if (entry.isIntersecting && document.pictureInPictureElement === video) {
        // Video scrolled back into view
        await document.exitPictureInPicture();
      }
    },
    { threshold: 0.5 }
  );
  
  observer.observe(video);
  
  return observer;
}
```

---

## 7.8.9 Document Picture-in-Picture (Emerging)

### Full Document PiP

```javascript
// Document PiP API (Chrome 116+)
// Allows any HTML content in PiP, not just video

async function openDocumentPiP() {
  // Check support
  if (!('documentPictureInPicture' in window)) {
    console.log('Document PiP not supported');
    return;
  }
  
  // Open PiP window
  const pipWindow = await documentPictureInPicture.requestWindow({
    width: 400,
    height: 300
  });
  
  // Add content to PiP window
  const container = document.createElement('div');
  container.innerHTML = `
    <video src="video.mp4" autoplay></video>
    <button id="next">Next</button>
  `;
  
  // Copy styles
  [...document.styleSheets].forEach(sheet => {
    try {
      const css = [...sheet.cssRules].map(rule => rule.cssText).join('');
      const style = pipWindow.document.createElement('style');
      style.textContent = css;
      pipWindow.document.head.appendChild(style);
    } catch (e) {
      // Cross-origin stylesheets
    }
  });
  
  pipWindow.document.body.appendChild(container);
}
```

---

## 7.8.10 Summary

### Key Methods

| Method | Description |
|--------|-------------|
| `video.requestPictureInPicture()` | Enter PiP |
| `document.exitPictureInPicture()` | Exit PiP |

### Key Properties

| Property | Description |
|----------|-------------|
| `document.pictureInPictureEnabled` | PiP available |
| `document.pictureInPictureElement` | Current PiP element |
| `video.disablePictureInPicture` | Disable PiP |

### Key Events

| Event | When |
|-------|------|
| `enterpictureinpicture` | Entered PiP |
| `leavepictureinpicture` | Left PiP |

### PiP Window Properties

| Property | Description |
|----------|-------------|
| `width` | Window width |
| `height` | Window height |

### Best Practices

1. **Check support** before using
2. **Handle errors** from requestPictureInPicture
3. **Integrate with Media Session** for controls
4. **Update UI** on PiP state changes
5. **Consider auto-PiP** on scroll for video sites
6. **Respect user preference** - don't force PiP

---

**End of Chapter 7.8: Picture-in-Picture API**

This completes the Multimedia APIs group. Next section: **Group 08 — Graphics and Visualization** — covers SVG and Web Animations API.
