# 7.5 Media Capture and Streams

The Media Capture and Streams API provides access to media input devices like cameras and microphones. This chapter covers getUserMedia, MediaStream, constraints, and device enumeration.

---

## 7.5.1 getUserMedia

### Basic Usage

```javascript
// Request camera and microphone access
async function getMedia() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Use the stream
    const video = document.querySelector('video');
    video.srcObject = stream;
    
    return stream;
  } catch (error) {
    handleError(error);
  }
}

function handleError(error) {
  switch (error.name) {
    case 'NotAllowedError':
      console.error('Permission denied');
      break;
    case 'NotFoundError':
      console.error('No media devices found');
      break;
    case 'NotReadableError':
      console.error('Device is in use');
      break;
    case 'OverconstrainedError':
      console.error('Constraints cannot be satisfied');
      break;
    default:
      console.error('Error:', error);
  }
}
```

### Video Only

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: false
});
```

### Audio Only

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  video: false,
  audio: true
});
```

---

## 7.5.2 Video Constraints

### Resolution

```javascript
const constraints = {
  video: {
    width: 1280,
    height: 720
  }
};

// With ideal/min/max
const constraints = {
  video: {
    width: { min: 640, ideal: 1280, max: 1920 },
    height: { min: 480, ideal: 720, max: 1080 }
  }
};

// Exact value (will fail if not available)
const constraints = {
  video: {
    width: { exact: 1920 },
    height: { exact: 1080 }
  }
};
```

### Frame Rate

```javascript
const constraints = {
  video: {
    frameRate: { ideal: 30, max: 60 }
  }
};
```

### Facing Mode

```javascript
// Front camera
const constraints = {
  video: {
    facingMode: 'user'
  }
};

// Back camera
const constraints = {
  video: {
    facingMode: 'environment'
  }
};

// Exact facing mode (fail if not available)
const constraints = {
  video: {
    facingMode: { exact: 'environment' }
  }
};
```

### Aspect Ratio

```javascript
const constraints = {
  video: {
    aspectRatio: 16 / 9
  }
};
```

### Specific Device

```javascript
const constraints = {
  video: {
    deviceId: { exact: 'specific-device-id' }
  }
};
```

---

## 7.5.3 Audio Constraints

### Basic Audio Settings

```javascript
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};
```

### Sample Rate and Channels

```javascript
const constraints = {
  audio: {
    sampleRate: 48000,
    channelCount: 2  // Stereo
  }
};
```

### Specific Microphone

```javascript
const constraints = {
  audio: {
    deviceId: { exact: 'microphone-device-id' }
  }
};
```

---

## 7.5.4 MediaStream

### Stream Properties

```javascript
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

// Stream ID
console.log(stream.id);

// Check if active
console.log(stream.active);  // true

// Get all tracks
const tracks = stream.getTracks();

// Get video tracks
const videoTracks = stream.getVideoTracks();

// Get audio tracks
const audioTracks = stream.getAudioTracks();
```

### Stream Events

```javascript
stream.addEventListener('addtrack', (event) => {
  console.log('Track added:', event.track);
});

stream.addEventListener('removetrack', (event) => {
  console.log('Track removed:', event.track);
});
```

### Adding and Removing Tracks

```javascript
// Add track
stream.addTrack(newTrack);

// Remove track
stream.removeTrack(track);
```

### Cloning Stream

```javascript
// Clone entire stream
const clonedStream = stream.clone();

// Cloned tracks are independent
```

---

## 7.5.5 MediaStreamTrack

### Track Properties

```javascript
const track = stream.getVideoTracks()[0];

console.log(track.id);          // Unique ID
console.log(track.kind);        // 'video' or 'audio'
console.log(track.label);       // Device name
console.log(track.enabled);     // true/false
console.log(track.muted);       // true/false
console.log(track.readyState);  // 'live' or 'ended'
```

### Enable/Disable Track

```javascript
// Disable (mute) track
track.enabled = false;

// Enable track
track.enabled = true;

// Note: enabled only affects output, track still captures
```

### Stop Track

```javascript
// Stop track permanently
track.stop();

// Track becomes 'ended' and cannot be restarted
```

### Track Events

```javascript
track.addEventListener('ended', () => {
  console.log('Track ended');
});

track.addEventListener('mute', () => {
  console.log('Track muted');
});

track.addEventListener('unmute', () => {
  console.log('Track unmuted');
});
```

### Get Track Constraints

```javascript
// Get current constraints
const constraints = track.getConstraints();

// Get actual settings
const settings = track.getSettings();
console.log(settings.width);
console.log(settings.height);
console.log(settings.frameRate);

// Get supported capabilities
const capabilities = track.getCapabilities();
console.log(capabilities.width);  // { min: 1, max: 1920 }
```

### Apply Constraints

```javascript
await track.applyConstraints({
  width: 1920,
  height: 1080
});
```

---

## 7.5.6 Device Enumeration

### List Devices

```javascript
async function listDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  
  const videoInputs = devices.filter(d => d.kind === 'videoinput');
  const audioInputs = devices.filter(d => d.kind === 'audioinput');
  const audioOutputs = devices.filter(d => d.kind === 'audiooutput');
  
  console.log('Cameras:', videoInputs);
  console.log('Microphones:', audioInputs);
  console.log('Speakers:', audioOutputs);
  
  return { videoInputs, audioInputs, audioOutputs };
}
```

### Device Properties

```javascript
devices.forEach(device => {
  console.log('Device ID:', device.deviceId);
  console.log('Kind:', device.kind);      // videoinput, audioinput, audiooutput
  console.log('Label:', device.label);    // Human-readable name
  console.log('Group ID:', device.groupId);  // Same hardware device
});

// Note: labels may be empty until permission granted
```

### Device Change Event

```javascript
navigator.mediaDevices.addEventListener('devicechange', async () => {
  console.log('Devices changed');
  const devices = await navigator.mediaDevices.enumerateDevices();
  updateDeviceList(devices);
});
```

### Select Specific Device

```javascript
// Create device selector
async function createDeviceSelector() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter(d => d.kind === 'videoinput');
  
  const select = document.getElementById('cameraSelect');
  
  cameras.forEach(camera => {
    const option = document.createElement('option');
    option.value = camera.deviceId;
    option.text = camera.label || `Camera ${select.length + 1}`;
    select.appendChild(option);
  });
}

// Use selected device
async function useSelectedCamera() {
  const deviceId = document.getElementById('cameraSelect').value;
  
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: { exact: deviceId } }
  });
  
  return stream;
}
```

---

## 7.5.7 getDisplayMedia

### Screen Capture

```javascript
async function captureScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'  // 'always', 'motion', 'never'
    },
    audio: true  // Capture system audio (if supported)
  });
  
  return stream;
}
```

### Screen Sharing Constraints

```javascript
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'monitor',  // 'monitor', 'window', 'application', 'browser'
    logicalSurface: true,
    cursor: 'always',
    width: { max: 1920 },
    height: { max: 1080 },
    frameRate: { max: 30 }
  }
});
```

### Handle Screen Share Stop

```javascript
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const track = stream.getVideoTracks()[0];

track.addEventListener('ended', () => {
  console.log('User stopped screen sharing');
  // Clean up or switch back to camera
});
```

---

## 7.5.8 Common Patterns

### Camera Switcher

```javascript
class CameraManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.stream = null;
  }
  
  async start(deviceId = null) {
    // Stop existing stream
    this.stop();
    
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true
    };
    
    this.stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.video.srcObject = this.stream;
  }
  
  async switchCamera() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter(d => d.kind === 'videoinput');
    
    const currentTrack = this.stream?.getVideoTracks()[0];
    const currentId = currentTrack?.getSettings().deviceId;
    
    const currentIndex = cameras.findIndex(c => c.deviceId === currentId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    
    await this.start(cameras[nextIndex].deviceId);
  }
  
  stop() {
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    this.video.srcObject = null;
  }
}
```

### Picture from Video

```javascript
function captureFrame(video) {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  return canvas.toDataURL('image/jpeg');
}
```

---

## 7.5.9 Summary

### getUserMedia Constraints

| Video | Audio |
|-------|-------|
| `width/height` | `echoCancellation` |
| `frameRate` | `noiseSuppression` |
| `facingMode` | `autoGainControl` |
| `aspectRatio` | `sampleRate` |
| `deviceId` | `channelCount` |

### MediaStreamTrack States

| State | Meaning |
|-------|---------|
| `live` | Track is active |
| `ended` | Track has stopped |

### Error Types

| Error | Cause |
|-------|-------|
| `NotAllowedError` | Permission denied |
| `NotFoundError` | No matching device |
| `NotReadableError` | Device in use |
| `OverconstrainedError` | Constraints impossible |

### Best Practices

1. **Handle permission errors** gracefully
2. **Stop tracks when done** to release devices
3. **Use constraints** to get desired quality
4. **Monitor device changes** for hot-plugging
5. **Check capabilities** before applying constraints
6. **Provide fallbacks** for unsupported features

---

**End of Chapter 7.5: Media Capture and Streams**

Next chapter: **7.6 MediaRecorder API** — covers recording media streams.
