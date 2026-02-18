# 7.3 Web Audio API

The Web Audio API provides a powerful system for controlling audio in web applications. This chapter covers audio contexts, nodes, oscillators, effects, and common patterns for audio processing.

---

## 7.3.1 Audio Context

### Creating Audio Context

```javascript
// Create audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Context states: suspended, running, closed
console.log(audioCtx.state);  // 'suspended' initially

// Resume on user interaction (required by browsers)
button.addEventListener('click', () => {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
});

// Close context when done
audioCtx.close();
```

### Context Properties

```javascript
// Current time in seconds
console.log(audioCtx.currentTime);

// Sample rate (usually 44100 or 48000)
console.log(audioCtx.sampleRate);

// Destination (speakers)
const destination = audioCtx.destination;
console.log(destination.maxChannelCount);  // e.g., 2 for stereo
```

---

## 7.3.2 Audio Sources

### Playing Audio Files

```javascript
// Load and play audio buffer
async function playAudio(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  // Create source node
  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;
  
  // Connect to output
  source.connect(audioCtx.destination);
  
  // Play
  source.start(0);  // Start immediately
  
  // Stop after 5 seconds
  source.stop(audioCtx.currentTime + 5);
  
  return source;
}
```

### Audio Element Source

```javascript
// Use HTML audio element
const audio = document.querySelector('audio');
const source = audioCtx.createMediaElementSource(audio);

// Connect through processing chain
source.connect(audioCtx.destination);

// Audio element controls playback
audio.play();
```

### Microphone Input

```javascript
async function getMicrophoneInput() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioCtx.createMediaStreamSource(stream);
  
  // Connect to analyzer or effects
  const analyser = audioCtx.createAnalyser();
  source.connect(analyser);
  
  return { source, analyser, stream };
}
```

---

## 7.3.3 Oscillators

### Basic Oscillator

```javascript
// Create oscillator
const oscillator = audioCtx.createOscillator();

// Set waveform type
oscillator.type = 'sine';     // sine, square, sawtooth, triangle

// Set frequency (Hz)
oscillator.frequency.value = 440;  // A4 note

// Connect and play
oscillator.connect(audioCtx.destination);
oscillator.start();
oscillator.stop(audioCtx.currentTime + 1);  // Stop after 1 second

// Oscillators can only be started once - create new for each use
```

### Frequency and Detune

```javascript
const oscillator = audioCtx.createOscillator();

// Set frequency
oscillator.frequency.value = 440;

// Detune in cents (100 cents = 1 semitone)
oscillator.detune.value = 100;  // One semitone up

// Schedule frequency changes
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
oscillator.frequency.linearRampToValueAtTime(880, audioCtx.currentTime + 1);
```

### Custom Waveforms

```javascript
// Create custom periodic wave
const real = new Float32Array([0, 1, 0.5, 0.25]);  // Cosine terms
const imag = new Float32Array([0, 0, 0, 0]);       // Sine terms

const wave = audioCtx.createPeriodicWave(real, imag);
oscillator.setPeriodicWave(wave);
```

---

## 7.3.4 Gain Node

### Volume Control

```javascript
// Create gain node
const gainNode = audioCtx.createGain();

// Set volume (0 = silent, 1 = full)
gainNode.gain.value = 0.5;

// Connect: source → gain → destination
source.connect(gainNode);
gainNode.connect(audioCtx.destination);
```

### Fade In/Out

```javascript
const gainNode = audioCtx.createGain();

// Fade in
gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.5);

// Fade out
gainNode.gain.setValueAtTime(1, audioCtx.currentTime);
gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);

// Exponential fade (more natural for audio)
gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
```

---

## 7.3.5 Filters

### Biquad Filter

```javascript
// Create filter
const filter = audioCtx.createBiquadFilter();

// Filter types
filter.type = 'lowpass';    // Low frequencies pass
filter.type = 'highpass';   // High frequencies pass
filter.type = 'bandpass';   // Band of frequencies pass
filter.type = 'notch';      // Band of frequencies blocked
filter.type = 'peaking';    // Boost/cut at frequency
filter.type = 'lowshelf';   // Boost/cut below frequency
filter.type = 'highshelf';  // Boost/cut above frequency

// Set parameters
filter.frequency.value = 1000;  // Cutoff frequency (Hz)
filter.Q.value = 1;             // Quality factor (resonance)
filter.gain.value = 0;          // Gain for peaking/shelf filters

// Connect
source.connect(filter);
filter.connect(audioCtx.destination);
```

### Multiple Filters

```javascript
// Chain filters for complex EQ
const lowFilter = audioCtx.createBiquadFilter();
lowFilter.type = 'lowshelf';
lowFilter.frequency.value = 320;
lowFilter.gain.value = 3;

const highFilter = audioCtx.createBiquadFilter();
highFilter.type = 'highshelf';
highFilter.frequency.value = 3200;
highFilter.gain.value = -2;

source.connect(lowFilter);
lowFilter.connect(highFilter);
highFilter.connect(audioCtx.destination);
```

---

## 7.3.6 Analyser Node

### Visualizing Audio

```javascript
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 2048;  // Must be power of 2

// Connect
source.connect(analyser);
analyser.connect(audioCtx.destination);

// Get frequency data
const frequencyData = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(frequencyData);

// Get waveform data
const timeData = new Uint8Array(analyser.fftSize);
analyser.getByteTimeDomainData(timeData);
```

### Frequency Visualizer

```javascript
function drawFrequency() {
  requestAnimationFrame(drawFrequency);
  
  analyser.getByteFrequencyData(frequencyData);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const barWidth = canvas.width / frequencyData.length;
  
  frequencyData.forEach((value, i) => {
    const height = (value / 255) * canvas.height;
    ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
    ctx.fillRect(i * barWidth, canvas.height - height, barWidth, height);
  });
}

drawFrequency();
```

### Waveform Visualizer

```javascript
function drawWaveform() {
  requestAnimationFrame(drawWaveform);
  
  analyser.getByteTimeDomainData(timeData);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  
  const sliceWidth = canvas.width / timeData.length;
  let x = 0;
  
  timeData.forEach((value, i) => {
    const y = (value / 255) * canvas.height;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    
    x += sliceWidth;
  });
  
  ctx.stroke();
}
```

---

## 7.3.7 Effects

### Delay Effect

```javascript
// Create delay
const delay = audioCtx.createDelay(5);  // Max 5 seconds
delay.delayTime.value = 0.5;  // 500ms delay

// Create feedback loop
const feedback = audioCtx.createGain();
feedback.gain.value = 0.5;

// Connect
source.connect(delay);
delay.connect(feedback);
feedback.connect(delay);  // Feedback loop
delay.connect(audioCtx.destination);
```

### Reverb (Convolution)

```javascript
// Load impulse response
async function createReverb(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const impulseBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  
  const convolver = audioCtx.createConvolver();
  convolver.buffer = impulseBuffer;
  
  return convolver;
}

const reverb = await createReverb('impulse-response.wav');
source.connect(reverb);
reverb.connect(audioCtx.destination);
```

### Compressor

```javascript
const compressor = audioCtx.createDynamicsCompressor();

compressor.threshold.value = -24;  // dB
compressor.knee.value = 30;        // dB
compressor.ratio.value = 12;       // Compression ratio
compressor.attack.value = 0.003;   // Seconds
compressor.release.value = 0.25;   // Seconds

source.connect(compressor);
compressor.connect(audioCtx.destination);
```

---

## 7.3.8 Spatial Audio

### Panner Node

```javascript
// Create panner
const panner = audioCtx.createPanner();

// Positioning model
panner.panningModel = 'HRTF';  // Head-related transfer function
panner.distanceModel = 'inverse';  // inverse, linear, exponential

// Set position
panner.positionX.value = 0;
panner.positionY.value = 0;
panner.positionZ.value = 0;

// Set orientation (direction sound is facing)
panner.orientationX.value = 0;
panner.orientationY.value = 0;
panner.orientationZ.value = -1;

// Distance parameters
panner.refDistance = 1;
panner.maxDistance = 10000;
panner.rolloffFactor = 1;

// Connect
source.connect(panner);
panner.connect(audioCtx.destination);
```

### Stereo Panning

```javascript
// Simple left-right panning
const panner = audioCtx.createStereoPanner();

// Range: -1 (left) to 1 (right)
panner.pan.value = -1;  // Full left
panner.pan.value = 0;   // Center
panner.pan.value = 1;   // Full right

source.connect(panner);
panner.connect(audioCtx.destination);
```

### Listener Position

```javascript
// Set listener (camera) position
const listener = audioCtx.listener;

listener.positionX.value = 0;
listener.positionY.value = 0;
listener.positionZ.value = 0;

// Listener orientation
listener.forwardX.value = 0;
listener.forwardY.value = 0;
listener.forwardZ.value = -1;

listener.upX.value = 0;
listener.upY.value = 1;
listener.upZ.value = 0;
```

---

## 7.3.9 Worklets

### Audio Worklet

```javascript
// Register processor
await audioCtx.audioWorklet.addModule('my-processor.js');

// Create node
const workletNode = new AudioWorkletNode(audioCtx, 'my-processor');

source.connect(workletNode);
workletNode.connect(audioCtx.destination);

// my-processor.js
class MyProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    for (let channel = 0; channel < output.length; channel++) {
      for (let i = 0; i < output[channel].length; i++) {
        output[channel][i] = input[channel][i] * 0.5;  // Half volume
      }
    }
    
    return true;  // Keep processor alive
  }
}

registerProcessor('my-processor', MyProcessor);
```

---

## 7.3.10 Summary

### Common Nodes

| Node | Description |
|------|-------------|
| `BufferSource` | Play audio buffer |
| `MediaElementSource` | Audio/video element |
| `Oscillator` | Generate tones |
| `GainNode` | Volume control |
| `BiquadFilter` | Frequency filter |
| `AnalyserNode` | Audio analysis |
| `DelayNode` | Echo effect |
| `ConvolverNode` | Reverb |
| `DynamicsCompressor` | Dynamic range compression |
| `PannerNode` | 3D spatial audio |
| `StereoPanner` | Left-right panning |

### Audio Graph Pattern

```javascript
// Typical audio processing chain
source.connect(filter);
filter.connect(effects);
effects.connect(gain);
gain.connect(analyser);
analyser.connect(destination);
```

### Best Practices

1. **Resume context on user interaction**
2. **Create new oscillators** for each use
3. **Use gain ramps** to avoid clicks
4. **Disconnect unused nodes**
5. **Use AudioWorklet** for custom DSP
6. **Handle context state changes**

---

**End of Chapter 7.3: Web Audio API**

Next chapter: **7.4 WebRTC** — covers real-time communication.
