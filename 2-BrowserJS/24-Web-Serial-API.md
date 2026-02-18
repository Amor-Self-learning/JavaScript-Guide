# 24.1 Serial Port Access

The Web Serial API provides access to serial devices connected via USB, RS-232, or Bluetooth. This chapter covers port selection, reading, and writing.

---

## 24.1.1 Basic Usage

### Request Port

```javascript
async function connectSerial() {
  if (!('serial' in navigator)) {
    console.log('Web Serial not supported');
    return null;
  }
  
  try {
    // User must select a port
    const port = await navigator.serial.requestPort();
    
    // Open with settings
    await port.open({ baudRate: 9600 });
    
    console.log('Connected');
    return port;
    
  } catch (error) {
    console.error('Connection failed:', error);
    return null;
  }
}
```

---

## 24.1.2 Port Settings

### Open Options

```javascript
await port.open({
  baudRate: 9600,      // Required
  dataBits: 8,         // 7 or 8
  stopBits: 1,         // 1 or 2
  parity: 'none',      // 'none', 'even', 'odd'
  bufferSize: 255,     // Read buffer size
  flowControl: 'none'  // 'none' or 'hardware'
});
```

### Common Baud Rates

```javascript
// Common baud rates
// 9600  - Default for many devices
// 115200 - Fast serial
// 57600, 38400, 19200, 4800, 2400, 1200
```

---

## 24.1.3 Reading Data

### Stream Reader

```javascript
async function readSerial(port) {
  const decoder = new TextDecoderStream();
  const reader = port.readable.pipeThrough(decoder).getReader();
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('Reader closed');
        break;
      }
      
      console.log('Received:', value);
    }
  } catch (error) {
    console.error('Read error:', error);
  } finally {
    reader.releaseLock();
  }
}
```

### Read Raw Bytes

```javascript
async function readBytes(port) {
  const reader = port.readable.getReader();
  
  try {
    const { value, done } = await reader.read();
    
    if (!done) {
      // value is Uint8Array
      console.log('Bytes:', value);
    }
  } finally {
    reader.releaseLock();
  }
}
```

---

## 24.1.4 Writing Data

### Write Text

```javascript
async function writeSerial(port, text) {
  const encoder = new TextEncoder();
  const writer = port.writable.getWriter();
  
  try {
    await writer.write(encoder.encode(text));
  } finally {
    writer.releaseLock();
  }
}
```

### Write Bytes

```javascript
async function writeBytes(port, bytes) {
  const writer = port.writable.getWriter();
  
  try {
    await writer.write(new Uint8Array(bytes));
  } finally {
    writer.releaseLock();
  }
}

// Usage
await writeBytes(port, [0x01, 0x02, 0x03]);
```

---

## 24.1.5 Close Connection

### Clean Disconnect

```javascript
async function disconnectSerial(port, reader, writer) {
  // Release locks first
  reader?.releaseLock();
  writer?.releaseLock();
  
  // Close port
  await port.close();
  console.log('Disconnected');
}
```

---

## 24.1.6 Port Events

### Connection Events

```javascript
navigator.serial.addEventListener('connect', (event) => {
  console.log('Port connected:', event.target);
});

navigator.serial.addEventListener('disconnect', (event) => {
  console.log('Port disconnected:', event.target);
});
```

---

## 24.1.7 Previously Connected Ports

### Get Authorized Ports

```javascript
async function getKnownPorts() {
  const ports = await navigator.serial.getPorts();
  
  for (const port of ports) {
    const info = port.getInfo();
    console.log('Known port:', info);
  }
  
  return ports;
}
```

---

## 24.1.8 Complete Example

### Serial Terminal

```javascript
class SerialTerminal {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
  }
  
  async connect(baudRate = 9600) {
    this.port = await navigator.serial.requestPort();
    await this.port.open({ baudRate });
    
    this.startReading();
    return true;
  }
  
  async startReading() {
    const decoder = new TextDecoderStream();
    this.reader = this.port.readable.pipeThrough(decoder).getReader();
    
    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        this.onData?.(value);
      }
    } catch (error) {
      this.onError?.(error);
    }
  }
  
  async send(text) {
    if (!this.port?.writable) return;
    
    const encoder = new TextEncoder();
    const writer = this.port.writable.getWriter();
    
    try {
      await writer.write(encoder.encode(text + '\n'));
    } finally {
      writer.releaseLock();
    }
  }
  
  async disconnect() {
    this.reader?.cancel();
    this.reader?.releaseLock();
    await this.port?.close();
    this.port = null;
  }
}

// Usage
const terminal = new SerialTerminal();
terminal.onData = (data) => console.log('RX:', data);
await terminal.connect(115200);
await terminal.send('Hello');
```

---

## 24.1.9 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.serial.requestPort()` | User selects port |
| `navigator.serial.getPorts()` | Get authorized ports |
| `port.open(options)` | Open port |
| `port.close()` | Close port |
| `port.getInfo()` | Get port info |

### Open Options

| Option | Type | Default |
|--------|------|---------|
| `baudRate` | Number | Required |
| `dataBits` | Number | 8 |
| `stopBits` | Number | 1 |
| `parity` | String | 'none' |
| `flowControl` | String | 'none' |

### Events

| Event | When |
|-------|------|
| `connect` | Port connected |
| `disconnect` | Port disconnected |

### Best Practices

1. **Request port via user gesture**
2. **Handle disconnect events**
3. **Release locks before closing**
4. **Use TextEncoderStream/DecoderStream** for text
5. **Buffer incoming data** if parsing packets
6. **Handle errors** gracefully

---

**End of Chapter 24.1: Serial Port Access**

Next: **25.1 USB Device Access** — Web USB API.
