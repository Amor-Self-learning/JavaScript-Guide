# 28.1 MIDI Access

The Web MIDI API provides access to MIDI devices for musical input and output. This chapter covers MIDI input/output, message handling, and device communication.

---

## 28.1.1 Basic Usage

### Request MIDI Access

```javascript
async function connectMIDI() {
  if (!('requestMIDIAccess' in navigator)) {
    console.log('Web MIDI not supported');
    return null;
  }
  
  try {
    const midiAccess = await navigator.requestMIDIAccess();
    console.log('MIDI access granted');
    
    listDevices(midiAccess);
    return midiAccess;
    
  } catch (error) {
    console.error('MIDI access denied:', error);
    return null;
  }
}
```

---

## 28.1.2 List Devices

### Inputs and Outputs

```javascript
function listDevices(midiAccess) {
  console.log('--- Inputs ---');
  for (const input of midiAccess.inputs.values()) {
    console.log(input.name, input.manufacturer);
  }
  
  console.log('--- Outputs ---');
  for (const output of midiAccess.outputs.values()) {
    console.log(output.name, output.manufacturer);
  }
}
```

---

## 28.1.3 Receive MIDI Messages

### Listen to Input

```javascript
function setupInput(midiAccess) {
  for (const input of midiAccess.inputs.values()) {
    input.addEventListener('midimessage', handleMIDI);
  }
}

function handleMIDI(event) {
  const [status, data1, data2] = event.data;
  
  const command = status >> 4;
  const channel = status & 0xF;
  
  switch (command) {
    case 9:  // Note On
      if (data2 > 0) {
        console.log('Note On:', data1, 'Velocity:', data2);
      } else {
        console.log('Note Off:', data1);
      }
      break;
      
    case 8:  // Note Off
      console.log('Note Off:', data1);
      break;
      
    case 11:  // Control Change
      console.log('CC:', data1, 'Value:', data2);
      break;
  }
}
```

---

## 28.1.4 Send MIDI Messages

### Send to Output

```javascript
function sendNoteOn(output, note, velocity = 127, channel = 0) {
  const status = 0x90 | channel;  // Note On, channel
  output.send([status, note, velocity]);
}

function sendNoteOff(output, note, channel = 0) {
  const status = 0x80 | channel;  // Note Off, channel
  output.send([status, note, 0]);
}

function sendCC(output, controller, value, channel = 0) {
  const status = 0xB0 | channel;  // Control Change
  output.send([status, controller, value]);
}
```

### Timed Messages

```javascript
// Send with timestamp
output.send([0x90, 60, 127], performance.now() + 1000);

// Clear scheduled messages
output.clear();
```

---

## 28.1.5 Device Events

### Connection Changes

```javascript
midiAccess.addEventListener('statechange', (event) => {
  const port = event.port;
  
  console.log(port.type, port.name, port.state);
  // port.state: 'connected' or 'disconnected'
});
```

---

## 28.1.6 Sysex Messages

### System Exclusive

```javascript
// Request sysex access
const midiAccess = await navigator.requestMIDIAccess({
  sysex: true
});

// Send sysex
const sysex = [0xF0, 0x41, 0x10, 0x42, 0x12, /* ... */, 0xF7];
output.send(sysex);
```

---

## 28.1.7 Complete Example

### MIDI Controller

```javascript
class MIDIController {
  constructor() {
    this.access = null;
    this.inputs = [];
    this.outputs = [];
  }
  
  async connect() {
    this.access = await navigator.requestMIDIAccess();
    
    this.access.addEventListener('statechange', 
      () => this.updateDevices());
    
    this.updateDevices();
    return true;
  }
  
  updateDevices() {
    this.inputs = [...this.access.inputs.values()];
    this.outputs = [...this.access.outputs.values()];
    
    for (const input of this.inputs) {
      input.onmidimessage = (e) => this.handleMessage(e);
    }
    
    this.onDevicesChanged?.();
  }
  
  handleMessage(event) {
    const [status, data1, data2] = event.data;
    const command = status >> 4;
    const channel = status & 0xF;
    
    if (command === 9 && data2 > 0) {
      this.onNoteOn?.(data1, data2, channel);
    } else if (command === 8 || (command === 9 && data2 === 0)) {
      this.onNoteOff?.(data1, channel);
    } else if (command === 11) {
      this.onControlChange?.(data1, data2, channel);
    }
  }
  
  sendNote(outputIndex, note, velocity, duration = 500) {
    const output = this.outputs[outputIndex];
    if (!output) return;
    
    output.send([0x90, note, velocity]);
    output.send([0x80, note, 0], performance.now() + duration);
  }
}

// Usage
const midi = new MIDIController();
midi.onNoteOn = (note, vel, ch) => console.log('Note:', note);
await midi.connect();
```

---

## 28.1.8 Summary

### Request Access

```javascript
navigator.requestMIDIAccess(options)
// options: { sysex: true }
```

### MIDIAccess Properties

| Property | Type | Description |
|----------|------|-------------|
| `inputs` | Map | Input ports |
| `outputs` | Map | Output ports |
| `sysexEnabled` | Boolean | Sysex allowed |

### MIDIPort Properties

| Property | Description |
|----------|-------------|
| `name` | Device name |
| `manufacturer` | Manufacturer |
| `state` | 'connected'/'disconnected' |
| `type` | 'input'/'output' |

### MIDI Commands

| Command | Hex | Description |
|---------|-----|-------------|
| Note Off | 0x8n | Note release |
| Note On | 0x9n | Note press |
| Aftertouch | 0xAn | Key pressure |
| Control Change | 0xBn | CC message |
| Program Change | 0xCn | Patch change |
| Pitch Bend | 0xEn | Pitch wheel |

### Best Practices

1. **Check support** before using
2. **Handle disconnection** events
3. **Parse status byte** for command and channel
4. **Use timestamps** for precise timing
5. **Request sysex** only when needed

---

**End of Chapter 28.1: MIDI Access**

Next: **29.1 Gamepad Input** — Gamepad API.
