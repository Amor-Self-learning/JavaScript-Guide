# 7.7 HTMLMediaElement

The HTMLMediaElement interface provides common functionality for `<audio>` and `<video>` elements. This chapter covers playback control, events, time manipulation, and common media patterns.

---

## 7.7.1 Media Elements

### Creating Media Elements

```html
<!-- Video element -->
<video id="video" src="video.mp4" controls>
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>

<!-- Audio element -->
<audio id="audio" src="audio.mp3" controls>
  <source src="audio.ogg" type="audio/ogg">
  <source src="audio.mp3" type="audio/mpeg">
</audio>
```

```javascript
// Create via JavaScript
const video = document.createElement('video');
video.src = 'video.mp4';

const audio = new Audio('audio.mp3');
```

---

## 7.7.2 Playback Control

### Play and Pause

```javascript
const video = document.getElementById('video');

// Play (returns promise)
video.play()
  .then(() => console.log('Playing'))
  .catch(err => console.error('Playback failed:', err));

// Pause
video.pause();

// Toggle play/pause
function togglePlay() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}
```

### Load and Source

```javascript
// Change source
video.src = 'newvideo.mp4';

// Or use source elements
video.innerHTML = `
  <source src="video.webm" type="video/webm">
  <source src="video.mp4" type="video/mp4">
`;

// Reload media
video.load();
```

---

## 7.7.3 Time Properties

### Current Time and Duration

```javascript
// Current playback position (seconds)
console.log(video.currentTime);  // e.g., 45.5

// Set current time (seek)
video.currentTime = 60;  // Jump to 1 minute

// Total duration
console.log(video.duration);  // e.g., 180

// Remaining time
const remaining = video.duration - video.currentTime;
```

### Progress and Buffered

```javascript
// Buffered time ranges
const buffered = video.buffered;
for (let i = 0; i < buffered.length; i++) {
  console.log(`Range ${i}: ${buffered.start(i)} - ${buffered.end(i)}`);
}

// Amount buffered
const bufferedEnd = buffered.length ? buffered.end(buffered.length - 1) : 0;
const bufferedPercent = (bufferedEnd / video.duration) * 100;

// Played time ranges
const played = video.played;

// Seekable time ranges
const seekable = video.seekable;
```

---

## 7.7.4 Playback State

### Properties

```javascript
// Paused state
console.log(video.paused);  // true/false

// Ended state
console.log(video.ended);   // true/false

// Seeking state
console.log(video.seeking); // true/false

// Ready state
console.log(video.readyState);
// 0 = HAVE_NOTHING
// 1 = HAVE_METADATA
// 2 = HAVE_CURRENT_DATA
// 3 = HAVE_FUTURE_DATA
// 4 = HAVE_ENOUGH_DATA

// Network state
console.log(video.networkState);
// 0 = NETWORK_EMPTY
// 1 = NETWORK_IDLE
// 2 = NETWORK_LOADING
// 3 = NETWORK_NO_SOURCE
```

---

## 7.7.5 Volume and Mute

### Volume Control

```javascript
// Volume (0.0 to 1.0)
video.volume = 0.5;  // 50%

// Mute/unmute
video.muted = true;
video.muted = false;

// Toggle mute
video.muted = !video.muted;
```

---

## 7.7.6 Playback Rate

### Speed Control

```javascript
// Normal speed
video.playbackRate = 1.0;

// Slow motion
video.playbackRate = 0.5;

// Fast forward
video.playbackRate = 2.0;

// Reverse (some browsers)
video.playbackRate = -1.0;

// Default playback rate
video.defaultPlaybackRate = 1.0;
```

---

## 7.7.7 Events

### Playback Events

```javascript
// Can play
video.addEventListener('canplay', () => {
  console.log('Can start playing');
});

// Can play through
video.addEventListener('canplaythrough', () => {
  console.log('Can play without buffering');
});

// Playing
video.addEventListener('playing', () => {
  console.log('Playback started');
});

// Pause
video.addEventListener('pause', () => {
  console.log('Playback paused');
});

// Ended
video.addEventListener('ended', () => {
  console.log('Playback ended');
});

// Time update (fires during playback)
video.addEventListener('timeupdate', () => {
  console.log('Current time:', video.currentTime);
});
```

### Loading Events

```javascript
// Metadata loaded
video.addEventListener('loadedmetadata', () => {
  console.log('Duration:', video.duration);
  console.log('Dimensions:', video.videoWidth, video.videoHeight);
});

// Data loaded
video.addEventListener('loadeddata', () => {
  console.log('First frame available');
});

// Progress (buffering)
video.addEventListener('progress', () => {
  console.log('Buffering...');
});

// Stalled
video.addEventListener('stalled', () => {
  console.log('Download stalled');
});

// Waiting
video.addEventListener('waiting', () => {
  console.log('Waiting for data');
});
```

### Seek Events

```javascript
video.addEventListener('seeking', () => {
  console.log('Seeking to:', video.currentTime);
});

video.addEventListener('seeked', () => {
  console.log('Seek complete');
});
```

### Error Events

```javascript
video.addEventListener('error', () => {
  const error = video.error;
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      console.error('Playback aborted');
      break;
    case MediaError.MEDIA_ERR_NETWORK:
      console.error('Network error');
      break;
    case MediaError.MEDIA_ERR_DECODE:
      console.error('Decode error');
      break;
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      console.error('Format not supported');
      break;
  }
});
```

---

## 7.7.8 Video-Specific Properties

### Dimensions

```javascript
// Native video dimensions
console.log(video.videoWidth);   // e.g., 1920
console.log(video.videoHeight);  // e.g., 1080

// Element dimensions (CSS)
console.log(video.clientWidth);
console.log(video.clientHeight);
```

### Poster

```javascript
// Set poster image
video.poster = 'thumbnail.jpg';
```

---

## 7.7.9 Text Tracks (Subtitles)

### Adding Subtitles

```html
<video src="video.mp4">
  <track kind="subtitles" src="en.vtt" srclang="en" label="English" default>
  <track kind="subtitles" src="es.vtt" srclang="es" label="Spanish">
</video>
```

### Controlling Text Tracks

```javascript
// Get text tracks
const tracks = video.textTracks;

// Enable/disable track
tracks[0].mode = 'showing';  // showing, hidden, disabled

// Listen for cue changes
tracks[0].oncuechange = function() {
  const cue = this.activeCues[0];
  if (cue) {
    console.log('Subtitle:', cue.text);
  }
};
```

---

## 7.7.10 Common Patterns

### Custom Video Player

```javascript
class VideoPlayer {
  constructor(container) {
    this.container = container;
    this.video = container.querySelector('video');
    this.setupControls();
    this.bindEvents();
  }
  
  setupControls() {
    this.playBtn = this.container.querySelector('.play-btn');
    this.progress = this.container.querySelector('.progress');
    this.progressBar = this.container.querySelector('.progress-bar');
    this.timeDisplay = this.container.querySelector('.time');
    this.volumeSlider = this.container.querySelector('.volume');
  }
  
  bindEvents() {
    this.playBtn.onclick = () => this.togglePlay();
    this.progress.onclick = (e) => this.seek(e);
    this.volumeSlider.oninput = (e) => this.setVolume(e.target.value);
    
    this.video.ontimeupdate = () => this.updateProgress();
    this.video.onloadedmetadata = () => this.updateTime();
  }
  
  togglePlay() {
    if (this.video.paused) {
      this.video.play();
      this.playBtn.textContent = '⏸';
    } else {
      this.video.pause();
      this.playBtn.textContent = '▶';
    }
  }
  
  seek(event) {
    const rect = this.progress.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    this.video.currentTime = percent * this.video.duration;
  }
  
  setVolume(value) {
    this.video.volume = value;
  }
  
  updateProgress() {
    const percent = (this.video.currentTime / this.video.duration) * 100;
    this.progressBar.style.width = `${percent}%`;
    this.updateTime();
  }
  
  updateTime() {
    const current = this.formatTime(this.video.currentTime);
    const duration = this.formatTime(this.video.duration);
    this.timeDisplay.textContent = `${current} / ${duration}`;
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}
```

### Lazy Loading Videos

```javascript
const videos = document.querySelectorAll('video[data-src]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      video.load();
      observer.unobserve(video);
    }
  });
});

videos.forEach(video => observer.observe(video));
```

---

## 7.7.11 Summary

### Key Properties

| Property | Description |
|----------|-------------|
| `currentTime` | Current position (seconds) |
| `duration` | Total duration |
| `paused` | Is paused |
| `ended` | Has ended |
| `volume` | Volume level (0-1) |
| `muted` | Is muted |
| `playbackRate` | Playback speed |
| `readyState` | Data availability |

### Key Methods

| Method | Description |
|--------|-------------|
| `play()` | Start playback |
| `pause()` | Pause playback |
| `load()` | Reload media |

### Key Events

| Event | When |
|-------|------|
| `play` | Playback starts |
| `pause` | Playback pauses |
| `ended` | Playback ends |
| `timeupdate` | Time changes |
| `loadedmetadata` | Metadata loaded |
| `error` | Error occurs |

### Best Practices

1. **Always handle play() promise** for autoplay
2. **Check readyState** before operations
3. **Handle errors** gracefully
4. **Provide fallback formats**
5. **Use lazy loading** for performance
6. **Respect user preferences** (prefers-reduced-motion)

---

**End of Chapter 7.7: HTMLMediaElement**

Next chapter: **7.8 Picture-in-Picture API** — covers floating video windows.
