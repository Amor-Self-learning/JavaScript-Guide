# 7.4 WebRTC

WebRTC (Web Real-Time Communication) enables peer-to-peer audio, video, and data sharing directly between browsers. This chapter covers peer connections, media streams, signaling, and data channels.

---

## 7.4.1 WebRTC Overview

### What Is WebRTC?

```javascript
// WebRTC enables:
// - Peer-to-peer video/audio calls
// - Screen sharing
// - File transfer
// - Real-time data channels

// Key components:
// 1. RTCPeerConnection - manages P2P connection
// 2. MediaStream - audio/video tracks
// 3. RTCDataChannel - arbitrary data
// 4. Signaling - exchange connection info (not part of WebRTC)
```

### Connection Flow

```javascript
// 1. Create peer connections on both sides
// 2. Get local media (camera/mic)
// 3. Exchange ICE candidates (network info)
// 4. Create and exchange offer/answer (SDP)
// 5. Connection established!
```

---

## 7.4.2 Getting User Media

### Camera and Microphone

```javascript
async function getMediaStream() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display in video element
    const videoElement = document.getElementById('localVideo');
    videoElement.srcObject = stream;
    
    return stream;
  } catch (error) {
    console.error('Error accessing media:', error);
  }
}
```

### Constraints

```javascript
const constraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user',  // 'environment' for back camera
    frameRate: { max: 30 }
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  }
};

const stream = await navigator.mediaDevices.getUserMedia(constraints);
```

### Screen Sharing

```javascript
async function shareScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      cursor: 'always'  // Show cursor
    },
    audio: true  // Include system audio if supported
  });
  
  return stream;
}
```

---

## 7.4.3 Peer Connection

### Creating Peer Connection

```javascript
// Configuration with STUN/TURN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: 'turn:turn.example.com:3478',
      username: 'user',
      credential: 'password'
    }
  ]
};

const peerConnection = new RTCPeerConnection(configuration);

// Monitor connection state
peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState);
  // 'new', 'connecting', 'connected', 'disconnected', 'failed', 'closed'
};

peerConnection.oniceconnectionstatechange = () => {
  console.log('ICE state:', peerConnection.iceConnectionState);
};
```

### Adding Tracks

```javascript
// Add local stream tracks to connection
const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

stream.getTracks().forEach(track => {
  peerConnection.addTrack(track, stream);
});

// Receive remote tracks
peerConnection.ontrack = (event) => {
  const remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = event.streams[0];
};
```

---

## 7.4.4 Signaling

### Creating Offer (Caller)

```javascript
// Create offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send offer to remote peer via signaling server
signalingChannel.send({
  type: 'offer',
  sdp: peerConnection.localDescription
});
```

### Creating Answer (Callee)

```javascript
// Receive offer from signaling server
signalingChannel.onmessage = async (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'offer') {
    await peerConnection.setRemoteDescription(message.sdp);
    
    // Create answer
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    // Send answer back
    signalingChannel.send({
      type: 'answer',
      sdp: peerConnection.localDescription
    });
  }
  
  if (message.type === 'answer') {
    await peerConnection.setRemoteDescription(message.sdp);
  }
  
  if (message.type === 'candidate') {
    await peerConnection.addIceCandidate(message.candidate);
  }
};
```

### ICE Candidates

```javascript
// Gather and send ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    signalingChannel.send({
      type: 'candidate',
      candidate: event.candidate
    });
  }
};

// Receive and add ICE candidates
async function handleCandidate(candidate) {
  await peerConnection.addIceCandidate(candidate);
}
```

---

## 7.4.5 Data Channels

### Creating Data Channel

```javascript
// Creator side
const dataChannel = peerConnection.createDataChannel('chat', {
  ordered: true,       // Guarantee order
  maxRetransmits: 3    // Max retransmit attempts
});

dataChannel.onopen = () => {
  console.log('Data channel open');
  dataChannel.send('Hello!');
};

dataChannel.onmessage = (event) => {
  console.log('Received:', event.data);
};

dataChannel.onclose = () => {
  console.log('Data channel closed');
};
```

### Receiving Data Channel

```javascript
// Receiver side
peerConnection.ondatachannel = (event) => {
  const dataChannel = event.channel;
  
  dataChannel.onopen = () => {
    console.log('Data channel open');
  };
  
  dataChannel.onmessage = (event) => {
    console.log('Received:', event.data);
  };
};
```

### Sending Data

```javascript
// Send text
dataChannel.send('Hello, World!');

// Send binary data
const buffer = new ArrayBuffer(1024);
dataChannel.send(buffer);

// Send Blob
const blob = new Blob(['Hello'], { type: 'text/plain' });
dataChannel.send(blob);

// Check if ready to send
if (dataChannel.readyState === 'open') {
  dataChannel.send(data);
}
```

---

## 7.4.6 Managing Media

### Mute/Unmute

```javascript
function toggleAudio(stream) {
  stream.getAudioTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
}

function toggleVideo(stream) {
  stream.getVideoTracks().forEach(track => {
    track.enabled = !track.enabled;
  });
}
```

### Replace Track

```javascript
// Switch camera or share screen
async function replaceVideoTrack(newStream) {
  const [videoTrack] = newStream.getVideoTracks();
  const sender = peerConnection.getSenders().find(s => 
    s.track?.kind === 'video'
  );
  
  if (sender) {
    await sender.replaceTrack(videoTrack);
  }
}
```

### Stop Tracks

```javascript
function stopAllTracks(stream) {
  stream.getTracks().forEach(track => track.stop());
}
```

---

## 7.4.7 Statistics

### Getting Stats

```javascript
async function getConnectionStats() {
  const stats = await peerConnection.getStats();
  
  stats.forEach(report => {
    if (report.type === 'inbound-rtp' && report.kind === 'video') {
      console.log('Bytes received:', report.bytesReceived);
      console.log('Packets lost:', report.packetsLost);
      console.log('Frames decoded:', report.framesDecoded);
    }
    
    if (report.type === 'candidate-pair' && report.state === 'succeeded') {
      console.log('RTT:', report.currentRoundTripTime);
      console.log('Available bandwidth:', report.availableOutgoingBitrate);
    }
  });
}
```

---

## 7.4.8 Complete Example

### Simple Peer-to-Peer Call

```javascript
class WebRTCCall {
  constructor(signalingChannel) {
    this.signaling = signalingChannel;
    this.pc = null;
    this.localStream = null;
  }
  
  async initialize() {
    // Get user media
    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    });
    
    // Display local video
    document.getElementById('localVideo').srcObject = this.localStream;
    
    // Create peer connection
    this.pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    
    // Add tracks
    this.localStream.getTracks().forEach(track => {
      this.pc.addTrack(track, this.localStream);
    });
    
    // Handle remote stream
    this.pc.ontrack = (event) => {
      document.getElementById('remoteVideo').srcObject = event.streams[0];
    };
    
    // Handle ICE candidates
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.signaling.send({ type: 'candidate', candidate: event.candidate });
      }
    };
    
    // Listen for signaling messages
    this.signaling.onmessage = async (message) => {
      await this.handleSignalingMessage(message);
    };
  }
  
  async call() {
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    this.signaling.send({ type: 'offer', sdp: this.pc.localDescription });
  }
  
  async handleSignalingMessage(message) {
    if (message.type === 'offer') {
      await this.pc.setRemoteDescription(message.sdp);
      const answer = await this.pc.createAnswer();
      await this.pc.setLocalDescription(answer);
      this.signaling.send({ type: 'answer', sdp: this.pc.localDescription });
    }
    
    if (message.type === 'answer') {
      await this.pc.setRemoteDescription(message.sdp);
    }
    
    if (message.type === 'candidate') {
      await this.pc.addIceCandidate(message.candidate);
    }
  }
  
  hangup() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.pc?.close();
  }
}
```

---

## 7.4.9 Summary

### Key Objects

| Object | Purpose |
|--------|---------|
| `RTCPeerConnection` | Manages P2P connection |
| `MediaStream` | Audio/video tracks |
| `RTCDataChannel` | Arbitrary data transfer |
| `RTCSessionDescription` | SDP offer/answer |
| `RTCIceCandidate` | Network candidate |

### Connection States

| State | Meaning |
|-------|---------|
| `new` | Initial state |
| `connecting` | Establishing connection |
| `connected` | Connection active |
| `disconnected` | Temporarily disconnected |
| `failed` | Connection failed |
| `closed` | Connection closed |

### Best Practices

1. **Use TURN servers** for NAT traversal
2. **Handle all connection states**
3. **Implement reconnection logic**
4. **Monitor stats** for quality
5. **Clean up resources** on disconnect
6. **Use adapter.js** for cross-browser support

---

**End of Chapter 7.4: WebRTC**

Next chapter: **7.5 Media Capture and Streams** — covers getUserMedia and MediaStream APIs.
