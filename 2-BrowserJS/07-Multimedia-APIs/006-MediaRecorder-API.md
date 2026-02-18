# 7.6 MediaRecorder API

The MediaRecorder API captures audio and video from a MediaStream for recording. This chapter covers recording streams, handling data, and exporting recordings.

---

## 7.6.1 Basic Recording

### Creating MediaRecorder

```javascript
// Get a stream first
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
});

// Create recorder
const mediaRecorder = new MediaRecorder(stream);

// Check if format is supported
if (!MediaRecorder.isTypeSupported('video/webm')) {
  console.error('WebM not supported');
}
```

### Recording Options

```javascript
const options = {
  mimeType: 'video/webm;codecs=vp9',
  videoBitsPerSecond: 2500000,  // 2.5 Mbps
  audioBitsPerSecond: 128000    // 128 kbps
};

const mediaRecorder = new MediaRecorder(stream, options);
```

### Supported Formats

```javascript
// Check format support
MediaRecorder.isTypeSupported('video/webm');
MediaRecorder.isTypeSupported('video/webm;codecs=vp8');
MediaRecorder.isTypeSupported('video/webm;codecs=vp9');
MediaRecorder.isTypeSupported('video/webm;codecs=h264');
MediaRecorder.isTypeSupported('audio/webm');
MediaRecorder.isTypeSupported('audio/webm;codecs=opus');

// Common formats:
// video/webm (Chrome, Firefox)
// video/mp4 (Safari, some browsers)
// audio/webm
// audio/ogg
```

---

## 7.6.2 Recording Controls

### Start, Stop, Pause, Resume

```javascript
// Start recording
mediaRecorder.start();

// Start with timeslice (data every N milliseconds)
mediaRecorder.start(1000);  // Fire ondataavailable every second

// Pause recording
mediaRecorder.pause();

// Resume recording
mediaRecorder.resume();

// Stop recording
mediaRecorder.stop();
```

### Recording State

```javascript
console.log(mediaRecorder.state);
// 'inactive' - not recording
// 'recording' - currently recording
// 'paused' - recording paused
```

---

## 7.6.3 Handling Data

### ondataavailable Event

```javascript
const chunks = [];

mediaRecorder.ondataavailable = (event) => {
  if (event.data.size > 0) {
    chunks.push(event.data);
  }
};

// Request data manually (if not using timeslice)
mediaRecorder.requestData();
```

### Creating Final Recording

```javascript
mediaRecorder.onstop = () => {
  // Create blob from chunks
  const blob = new Blob(chunks, { type: 'video/webm' });
  
  // Create URL for playback
  const url = URL.createObjectURL(blob);
  
  // Play recording
  const video = document.getElementById('playback');
  video.src = url;
  
  // Download recording
  const a = document.createElement('a');
  a.href = url;
  a.download = 'recording.webm';
  a.click();
};
```

---

## 7.6.4 Events

### All Events

```javascript
mediaRecorder.onstart = () => {
  console.log('Recording started');
};

mediaRecorder.onstop = () => {
  console.log('Recording stopped');
};

mediaRecorder.onpause = () => {
  console.log('Recording paused');
};

mediaRecorder.onresume = () => {
  console.log('Recording resumed');
};

mediaRecorder.ondataavailable = (event) => {
  console.log('Data available:', event.data.size, 'bytes');
};

mediaRecorder.onerror = (event) => {
  console.error('Recording error:', event.error);
};
```

---

## 7.6.5 Complete Example

### Video Recorder

```javascript
class VideoRecorder {
  constructor(videoElement) {
    this.videoElement = videoElement;
    this.stream = null;
    this.mediaRecorder = null;
    this.chunks = [];
  }
  
  async start() {
    // Get camera stream
    this.stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display preview
    this.videoElement.srcObject = this.stream;
    this.videoElement.muted = true;
    
    // Create recorder
    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    this.chunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };
    
    // Start recording
    this.mediaRecorder.start(1000);  // Chunk every second
  }
  
  pause() {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }
  
  resume() {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }
  
  async stop() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        // Stop camera
        this.stream.getTracks().forEach(track => track.stop());
        
        // Create blob
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        resolve(blob);
      };
      
      this.mediaRecorder.stop();
    });
  }
  
  getState() {
    return this.mediaRecorder?.state || 'inactive';
  }
}

// Usage
const recorder = new VideoRecorder(document.querySelector('video'));

document.getElementById('start').onclick = () => recorder.start();
document.getElementById('pause').onclick = () => recorder.pause();
document.getElementById('resume').onclick = () => recorder.resume();
document.getElementById('stop').onclick = async () => {
  const blob = await recorder.stop();
  
  // Download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `recording-${Date.now()}.webm`;
  a.click();
  
  URL.revokeObjectURL(url);
};
```

---

## 7.6.6 Audio Recording

### Audio Only Recorder

```javascript
async function recordAudio() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  
  const mediaRecorder = new MediaRecorder(stream, {
    mimeType: 'audio/webm;codecs=opus'
  });
  
  const chunks = [];
  
  mediaRecorder.ondataavailable = (e) => {
    chunks.push(e.data);
  };
  
  mediaRecorder.onstop = () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    
    const audio = new Audio(url);
    audio.controls = true;
    document.body.appendChild(audio);
  };
  
  return mediaRecorder;
}
```

---

## 7.6.7 Screen Recording

### Record Screen with Audio

```javascript
async function recordScreen() {
  // Get screen
  const screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: { cursor: 'always' },
    audio: true
  });
  
  // Optionally add microphone
  const micStream = await navigator.mediaDevices.getUserMedia({
    audio: true
  });
  
  // Combine streams
  const combinedStream = new MediaStream([
    ...screenStream.getVideoTracks(),
    ...micStream.getAudioTracks()
  ]);
  
  const mediaRecorder = new MediaRecorder(combinedStream, {
    mimeType: 'video/webm;codecs=vp9,opus'
  });
  
  const chunks = [];
  mediaRecorder.ondataavailable = e => chunks.push(e.data);
  
  mediaRecorder.onstop = () => {
    // Stop all tracks
    screenStream.getTracks().forEach(t => t.stop());
    micStream.getTracks().forEach(t => t.stop());
    
    const blob = new Blob(chunks, { type: 'video/webm' });
    // Handle recording...
  };
  
  // Handle user stopping screen share
  screenStream.getVideoTracks()[0].onended = () => {
    mediaRecorder.stop();
  };
  
  return mediaRecorder;
}
```

---

## 7.6.8 Converting Formats

### WebM to MP4 (Using FFmpeg.wasm)

```javascript
// Note: Requires ffmpeg.wasm library
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

async function convertToMP4(webmBlob) {
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();
  
  // Write input file
  ffmpeg.FS('writeFile', 'input.webm', await fetchFile(webmBlob));
  
  // Convert
  await ffmpeg.run('-i', 'input.webm', 'output.mp4');
  
  // Read output
  const data = ffmpeg.FS('readFile', 'output.mp4');
  const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
  
  return mp4Blob;
}
```

---

## 7.6.9 Summary

### MediaRecorder States

| State | Description |
|-------|-------------|
| `inactive` | Not recording |
| `recording` | Currently recording |
| `paused` | Recording paused |

### MediaRecorder Methods

| Method | Description |
|--------|-------------|
| `start(timeslice)` | Start recording |
| `stop()` | Stop recording |
| `pause()` | Pause recording |
| `resume()` | Resume recording |
| `requestData()` | Request data chunk |

### Common MIME Types

| Type | Codec |
|------|-------|
| `video/webm` | VP8, VP9 |
| `video/webm;codecs=vp9` | VP9 |
| `video/webm;codecs=h264` | H.264 |
| `audio/webm` | Opus, Vorbis |
| `audio/webm;codecs=opus` | Opus |

### Best Practices

1. **Check format support** before recording
2. **Use timeslice** for long recordings
3. **Handle errors** gracefully
4. **Stop tracks** when done
5. **Monitor state** for UI updates
6. **Test across browsers** for compatibility

---

**End of Chapter 7.6: MediaRecorder API**

Next chapter: **7.7 HTMLMediaElement** — covers audio and video element APIs.
