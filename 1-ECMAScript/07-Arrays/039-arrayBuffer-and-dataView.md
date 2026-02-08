# 7.7 ArrayBuffer and DataView

**ArrayBuffer** and **DataView** provide low-level mechanisms for handling raw binary data with precise control over byte representation and endianness.

---

## 7.7.1 Creating and Working with ArrayBuffer

**ArrayBuffer** is a fixed-length contiguous region of memory representing raw binary data.

```javascript
// Create empty buffer (all bytes zero-initialized)
let buffer = new ArrayBuffer(16);     // 16 bytes
buffer.byteLength;          // 16

// Cannot directly manipulate ArrayBuffer
// Must use typed array views
let view = new Uint8Array(buffer);
view[0] = 255;

// Creating multiple views of same buffer
let buffer = new ArrayBuffer(8);
let uint8View = new Uint8Array(buffer);
let uint16View = new Uint16Array(buffer);
let uint32View = new Uint32Array(buffer);

// All views see the same data
uint8View[0] = 0x12;
uint8View[1] = 0x34;
uint16View[0];              // Interpretation depends on endianness
                            // Little-endian: 0x3412
                            // Big-endian: 0x1234

// Different interpretation of same bytes
let buffer = new ArrayBuffer(4);
let uint32 = new Uint32Array(buffer);
let int32 = new Int32Array(buffer);
let float32 = new Float32Array(buffer);

uint32[0] = 0x41000000;     // Set as unsigned
int32[0];                   // View as signed: 1090519040
float32[0];                 // View as float: 8

// Slicing buffer (creates new buffer, copies data)
let buffer = new ArrayBuffer(16);
new Uint8Array(buffer).set([1, 2, 3, 4, 5, 6, 7, 8]);

let slice = buffer.slice(2, 6);    // Copy bytes 2-5
slice.byteLength;           // 4

let sliceView = new Uint8Array(slice);
sliceView;                  // [3, 4, 5, 6]

// Original unchanged
new Uint8Array(buffer)[2] = 99;
sliceView[0];               // Still 3 (different buffer)

// Transferring buffer (moves ownership)
// Not standard yet, some implementations have it
let buffer = new ArrayBuffer(16);
// let newBuffer = buffer.transfer();
// buffer.byteLength would be 0 after transfer

// Common pattern: create buffer from typed array
let data = [1, 2, 3, 4, 5];
let uint8 = new Uint8Array(data);
let buffer = uint8.buffer;
buffer.byteLength;          // 5

// Get slice of same buffer
let view1 = new Uint8Array(buffer, 0, 2);      // First 2 elements
let view2 = new Uint8Array(buffer, 2, 3);      // Next 3 elements

// Sharing buffer between workers (using Transferable)
// In main thread
let buffer = new ArrayBuffer(1000000);
worker.postMessage({ buffer }, [buffer]);
// buffer.byteLength is now 0 in main thread

// In worker
self.onmessage = function(e) {
  let buffer = e.data.buffer;
  buffer.byteLength;        // 1000000 (ownership transferred)
}
```

---

## 7.7.2 DataView - Heterogeneous Data Access

**DataView** allows reading and writing heterogeneous data types with explicit endianness control.

```javascript
// Create DataView
let buffer = new ArrayBuffer(20);
let view = new DataView(buffer);

// Determine system endianness
function isLittleEndian() {
  let buffer = new ArrayBuffer(2);
  new Uint8Array(buffer)[0] = 0x01;
  return new Uint16Array(buffer)[0] === 0x0100;
}

isLittleEndian();           // true on most systems

// Writing with DataView
let buffer = new ArrayBuffer(8);
let view = new DataView(buffer);

view.setUint8(0, 0xFF);           // 8-bit unsigned: 0-255
view.setInt8(1, -1);              // 8-bit signed: -128 to 127
view.setUint16(2, 0x1234);        // 16-bit unsigned
view.setInt16(4, -1000);          // 16-bit signed
view.setUint32(6, 0xDEADBEEF);    // 32-bit unsigned

// Reading back (default is big-endian)
view.getUint8(0);           // 255
view.getInt8(1);            // -1
view.getUint16(2);          // 4660 (0x1234)
view.getInt16(4);           // -1000
view.getUint32(6);          // 3735928559 (0xDEADBEEF)

// Endianness parameter (true = little-endian, false = big-endian)
let buffer = new ArrayBuffer(4);
let view = new DataView(buffer);

// Big-endian (network order, default)
view.setUint32(0, 0x12345678, false);
new Uint8Array(buffer);     // [0x12, 0x34, 0x56, 0x78]

// Little-endian
view.setUint32(0, 0x12345678, true);
new Uint8Array(buffer);     // [0x78, 0x56, 0x34, 0x12]

// Floating-point values
let buffer = new ArrayBuffer(8);
let view = new DataView(buffer);

view.setFloat32(0, 3.14159, true);   // 32-bit float, little-endian
view.setFloat64(4, 2.71828, false);  // 64-bit double, big-endian

view.getFloat32(0, true);   // 3.1415901660919189
view.getFloat64(4, false);  // 2.71828

// Offset and length parameters
let buffer = new ArrayBuffer(20);
let view = new DataView(buffer, 4, 8);  // 8 bytes starting at offset 4

view.byteOffset;            // 4
view.byteLength;            // 8

// Can only access within this range
view.setUint32(0, 100);     // OK (offset 0 in view = 4 in buffer)
view.setUint32(10, 100);    // RangeError (10 >= byteLength)

// Mixed read/write operations
function packStructure(name, age, score) {
  let buffer = new ArrayBuffer(14);  // 2 + 10 + 2
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  // Write age (16-bit)
  view.setUint16(0, age);
  
  // Write name (10 characters max)
  for (let i = 0; i < name.length && i < 10; i++) {
    uint8[2 + i] = name.charCodeAt(i);
  }
  
  // Write score (32-bit float)
  view.setFloat32(12, score);
  
  return buffer;
}

function unpackStructure(buffer) {
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  let age = view.getUint16(0);
  let name = '';
  for (let i = 0; i < 10 && uint8[2 + i] !== 0; i++) {
    name += String.fromCharCode(uint8[2 + i]);
  }
  let score = view.getFloat32(12);
  
  return { age, name, score };
}

let packed = packStructure('John', 25, 95.5);
unpackStructure(packed);    // { age: 25, name: 'John', score: 95.5 }

// Big/Little-endian utility functions
function readBigEndianInt32(buffer, offset) {
  let view = new DataView(buffer);
  return view.getInt32(offset, false);  // false = big-endian
}

function writeBigEndianInt32(buffer, offset, value) {
  let view = new DataView(buffer);
  view.setInt32(offset, value, false);
}

function readLittleEndianInt32(buffer, offset) {
  let view = new DataView(buffer);
  return view.getInt32(offset, true);   // true = little-endian
}

function writeLittleEndianInt32(buffer, offset, value) {
  let view = new DataView(buffer);
  view.setInt32(offset, value, true);
}
```

---

## 7.7.3 Endianness Handling

**Endianness** determines byte order for multi-byte values (big-endian vs little-endian).

```javascript
// Detecting system endianness
const ENDIANNESS = (() => {
  let buffer = new ArrayBuffer(2);
  new Uint8Array(buffer)[0] = 0x01;
  return new Uint16Array(buffer)[0] === 0x0100 ? 'LE' : 'BE';
})();

ENDIANNESS;                 // 'LE' on most modern systems

// Big-endian (network order, most significant byte first)
// Value: 0x12345678
// Bytes: [0x12, 0x34, 0x56, 0x78]

let buffer = new ArrayBuffer(4);
let view = new DataView(buffer);
view.setUint32(0, 0x12345678, false);  // false = big-endian
let bytes = new Uint8Array(buffer);
bytes[0];                   // 0x12
bytes[1];                   // 0x34
bytes[2];                   // 0x56
bytes[3];                   // 0x78

// Little-endian (Intel/ARM, least significant byte first)
// Value: 0x12345678
// Bytes: [0x78, 0x56, 0x34, 0x12]

let buffer = new ArrayBuffer(4);
let view = new DataView(buffer);
view.setUint32(0, 0x12345678, true);   // true = little-endian
let bytes = new Uint8Array(buffer);
bytes[0];                   // 0x78
bytes[1];                   // 0x56
bytes[2];                   // 0x34
bytes[3];                   // 0x12

// Network protocols typically use big-endian
function readNetworkPacket(buffer) {
  let view = new DataView(buffer);
  
  // Version (4 bits) + IHL (4 bits)
  let firstByte = view.getUint8(0);
  let version = (firstByte >> 4) & 0xF;
  let ihl = firstByte & 0xF;
  
  // Total length (big-endian)
  let totalLength = view.getUint16(2, false);
  
  // TTL
  let ttl = view.getUint8(8);
  
  // Source IP (4 bytes, read as big-endian)
  let srcIP = view.getUint32(12, false);
  
  return { version, ihl, totalLength, ttl, srcIP };
}

// Converting between endianness
function swapEndianness(value, bytes) {
  let result = 0;
  for (let i = 0; i < bytes; i++) {
    result = (result << 8) | (value & 0xFF);
    value >>= 8;
  }
  return result;
}

swapEndianness(0x12345678, 4);  // 0x78563412

// Method 2: using DataView
function swapEndianness(value) {
  let buffer = new ArrayBuffer(4);
  let view = new DataView(buffer);
  
  view.setUint32(0, value, false);  // Write as big-endian
  return view.getUint32(0, true);   // Read as little-endian
}

swapEndianness(0x12345678);     // 0x78563412

// Automated conversion utility
class Endian {
  static isBigEndian() {
    let buffer = new ArrayBuffer(2);
    new Uint8Array(buffer)[0] = 1;
    return new Uint16Array(buffer)[0] !== 256;
  }
  
  static toNetworkOrder(value, type = 'uint32') {
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);
    let isLE = !this.isBigEndian();
    
    if (type === 'uint32') {
      view.setUint32(0, value, isLE);
      return view.getUint32(0, false);
    }
  }
  
  static fromNetworkOrder(value, type = 'uint32') {
    let buffer = new ArrayBuffer(4);
    let view = new DataView(buffer);
    let isLE = !this.isBigEndian();
    
    if (type === 'uint32') {
      view.setUint32(0, value, false);
      return view.getUint32(0, isLE);
    }
  }
}

// Test
Endian.isBigEndian();       // false (on most systems)

// Practical: reading file formats
// PNG files are big-endian
function readPNGChunk(buffer) {
  let view = new DataView(buffer);
  
  let length = view.getUint32(0, false);  // Big-endian
  let type = '';
  for (let i = 0; i < 4; i++) {
    type += String.fromCharCode(view.getUint8(4 + i));
  }
  let data = buffer.slice(8, 8 + length);
  let crc = view.getUint32(8 + length, false);  // Big-endian
  
  return { length, type, data, crc };
}
```

---

## 7.7.4 Use Cases: Binary Protocols and File Formats

**Real-world applications** for handling binary data.

```javascript
// HTTP Header Parsing
function parseHTTPRequest(buffer) {
  let view = new Uint8Array(buffer);
  let str = '';
  
  // Find \r\n\r\n (0x0D 0x0A 0x0D 0x0A)
  let endIndex = -1;
  for (let i = 0; i < view.length - 3; i++) {
    if (view[i] === 0x0D && view[i+1] === 0x0A &&
        view[i+2] === 0x0D && view[i+3] === 0x0A) {
      endIndex = i;
      break;
    }
  }
  
  if (endIndex === -1) return null;
  
  // Convert header to string
  for (let i = 0; i < endIndex; i++) {
    str += String.fromCharCode(view[i]);
  }
  
  let lines = str.split('\r\n');
  let requestLine = lines[0].split(' ');
  
  let headers = {};
  for (let i = 1; i < lines.length; i++) {
    let match = lines[i].match(/^([^:]+):\s*(.+)$/);
    if (match) {
      headers[match[1]] = match[2];
    }
  }
  
  return {
    method: requestLine[0],
    path: requestLine[1],
    version: requestLine[2],
    headers: headers,
    body: buffer.slice(endIndex + 4)
  };
}

// PNG File Format
function isPNGFile(buffer) {
  let view = new Uint8Array(buffer);
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  let signature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  
  if (view.length < 8) return false;
  
  for (let i = 0; i < 8; i++) {
    if (view[i] !== signature[i]) return false;
  }
  return true;
}

// Reading PNG IHDR chunk
function readPNGInfo(buffer) {
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  // Skip signature (8 bytes)
  if (!isPNGFile(buffer)) return null;
  
  // Read IHDR chunk
  let dataView = new DataView(buffer, 8);
  
  let length = dataView.getUint32(0, false);  // Big-endian
  let type = '';
  for (let i = 0; i < 4; i++) {
    type += String.fromCharCode(dataView.getUint8(4 + i));
  }
  
  if (type !== 'IHDR' || length !== 13) {
    return null;
  }
  
  let width = dataView.getUint32(8, false);
  let height = dataView.getUint32(12, false);
  let bitDepth = dataView.getUint8(16);
  let colorType = dataView.getUint8(17);
  
  return { width, height, bitDepth, colorType };
}

// WAV Audio File Format
function readWAVHeader(buffer) {
  let view = new DataView(buffer);
  
  // RIFF header
  let riffId = '';
  for (let i = 0; i < 4; i++) {
    riffId += String.fromCharCode(view.getUint8(i));
  }
  
  if (riffId !== 'RIFF') return null;
  
  // File size
  let fileSize = view.getUint32(4, true);  // Little-endian
  
  // WAVE format
  let format = '';
  for (let i = 0; i < 4; i++) {
    format += String.fromCharCode(view.getUint8(8 + i));
  }
  
  if (format !== 'WAVE') return null;
  
  // Find fmt subchunk
  let pos = 12;
  while (pos < buffer.byteLength) {
    let id = '';
    for (let i = 0; i < 4; i++) {
      id += String.fromCharCode(view.getUint8(pos + i));
    }
    
    let size = view.getUint32(pos + 4, true);
    
    if (id === 'fmt ') {
      let audioFormat = view.getUint16(pos + 8, true);
      let channels = view.getUint16(pos + 10, true);
      let sampleRate = view.getUint32(pos + 12, true);
      let byteRate = view.getUint32(pos + 16, true);
      let blockAlign = view.getUint16(pos + 20, true);
      let bitsPerSample = view.getUint16(pos + 22, true);
      
      return {
        audioFormat,
        channels,
        sampleRate,
        byteRate,
        blockAlign,
        bitsPerSample
      };
    }
    
    pos += 8 + size;
  }
  
  return null;
}

// ZIP File Format (simplified)
function findZIPCentralDirectory(buffer) {
  let view = new Uint8Array(buffer);
  
  // End of central directory record signature: 0x06054b50
  let dataView = new DataView(buffer);
  
  // Search from end of file backwards
  for (let i = buffer.byteLength - 4; i >= 0; i--) {
    if (dataView.getUint32(i, true) === 0x06054b50) {
      // Found end of central directory
      let recordView = new DataView(buffer, i);
      
      let diskNumber = recordView.getUint16(4, true);
      let centralDirDisk = recordView.getUint16(6, true);
      let entriesOnDisk = recordView.getUint16(8, true);
      let totalEntries = recordView.getUint16(10, true);
      let centralDirSize = recordView.getUint32(12, true);
      let centralDirOffset = recordView.getUint32(16, true);
      let commentLength = recordView.getUint16(20, true);
      
      return {
        diskNumber,
        centralDirDisk,
        entriesOnDisk,
        totalEntries,
        centralDirSize,
        centralDirOffset,
        commentLength
      };
    }
  }
  
  return null;
}

// Custom binary protocol (game state sync)
class GameStateMessage {
  static write(state) {
    let buffer = new ArrayBuffer(20);
    let view = new DataView(buffer);
    let uint8 = new Uint8Array(buffer);
    
    // Message type (1 byte)
    view.setUint8(0, state.type);
    
    // Player ID (2 bytes)
    view.setUint16(1, state.playerId, true);
    
    // Position X, Y (2 x 4-byte floats)
    view.setFloat32(3, state.x, true);
    view.setFloat32(7, state.y, true);
    
    // Health (1 byte)
    view.setUint8(11, state.health);
    
    // Rotation (2 bytes angle, 0-359)
    view.setUint16(12, state.rotation, true);
    
    // Status flags (1 byte)
    let flags = 0;
    if (state.jumping) flags |= 0x01;
    if (state.shooting) flags |= 0x02;
    if (state.alive) flags |= 0x04;
    view.setUint8(14, flags);
    
    return buffer;
  }
  
  static read(buffer) {
    let view = new DataView(buffer);
    
    return {
      type: view.getUint8(0),
      playerId: view.getUint16(1, true),
      x: view.getFloat32(3, true),
      y: view.getFloat32(7, true),
      health: view.getUint8(11),
      rotation: view.getUint16(12, true),
      jumping: !!(view.getUint8(14) & 0x01),
      shooting: !!(view.getUint8(14) & 0x02),
      alive: !!(view.getUint8(14) & 0x04)
    };
  }
}

// Usage
let state = {
  type: 1,
  playerId: 42,
  x: 123.45,
  y: 67.89,
  health: 100,
  rotation: 45,
  jumping: true,
  shooting: false,
  alive: true
};

let message = GameStateMessage.write(state);
let decoded = GameStateMessage.read(message);
decoded;  // { type: 1, playerId: 42, x: 123.45..., ... }
```

---

## 7.7.5 Performance and Best Practices

**Optimization techniques** for binary data handling.

```javascript
// Memory pooling for buffers
class BufferPool {
  constructor(bufferSize, poolSize = 10) {
    this.bufferSize = bufferSize;
    this.available = [];
    this.inUse = new Set();
    
    for (let i = 0; i < poolSize; i++) {
      this.available.push(new ArrayBuffer(bufferSize));
    }
  }
  
  acquire() {
    let buffer;
    if (this.available.length > 0) {
      buffer = this.available.pop();
    } else {
      buffer = new ArrayBuffer(this.bufferSize);
    }
    this.inUse.add(buffer);
    return buffer;
  }
  
  release(buffer) {
    this.inUse.delete(buffer);
    this.available.push(buffer);
  }
  
  clear() {
    this.available.forEach(buf => {
      // Clear buffer data
      new Uint8Array(buf).fill(0);
    });
  }
}

// Usage
let pool = new BufferPool(1024);
let buffer = pool.acquire();
// Use buffer
pool.release(buffer);

// Efficient byte copying
function copyBytes(src, srcOffset, dst, dstOffset, length) {
  // Use typed array views for efficiency
  let srcView = new Uint8Array(src, srcOffset, length);
  let dstView = new Uint8Array(dst, dstOffset, length);
  dstView.set(srcView);
}

// Alternative: memcpy-like for large operations
function fastCopy(src, srcOffset, dst, dstOffset, length) {
  // Copy as uint32 when possible (4x faster)
  let remaining = length;
  let soff = srcOffset;
  let doff = dstOffset;
  
  // Align to 4-byte boundary
  while (remaining > 0 && (soff % 4) !== 0) {
    new Uint8Array(dst)[doff] = new Uint8Array(src)[soff];
    soff++;
    doff++;
    remaining--;
  }
  
  // Copy in 4-byte chunks
  let uint32Len = Math.floor(remaining / 4);
  let uint32Src = new Uint32Array(src, soff, uint32Len);
  let uint32Dst = new Uint32Array(dst, doff, uint32Len);
  uint32Dst.set(uint32Src);
  
  soff += uint32Len * 4;
  doff += uint32Len * 4;
  remaining -= uint32Len * 4;
  
  // Copy remaining bytes
  while (remaining > 0) {
    new Uint8Array(dst)[doff] = new Uint8Array(src)[soff];
    soff++;
    doff++;
    remaining--;
  }
}

// Benchmarking
console.time('Regular copy');
for (let i = 0; i < 1000; i++) {
  copyBytes(srcBuffer, 0, dstBuffer, 0, 4096);
}
console.timeEnd('Regular copy');

console.time('Fast copy');
for (let i = 0; i < 1000; i++) {
  fastCopy(srcBuffer, 0, dstBuffer, 0, 4096);
}
console.timeEnd('Fast copy');

// SIMD-like optimization (mental exercise)
// Some JavaScript engines can optimize typed array operations
function vectorAdd(a, b, result) {
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i];  // JIT can vectorize this
  }
}

let float32a = new Float32Array(1000);
let float32b = new Float32Array(1000);
let float32result = new Float32Array(1000);
vectorAdd(float32a, float32b, float32result);

// Minimize buffer allocations
function processStream(data) {
  // Bad: creates many buffers
  for (let i = 0; i < data.length; i++) {
    let chunk = data.slice(i * 1024, (i + 1) * 1024);  // Creates new buffer each time
    process(chunk);
  }
}

function processStreamOptimized(data) {
  // Good: reuse view
  let view = new Uint8Array(data.buffer, data.byteOffset);
  for (let i = 0; i < data.length; i += 1024) {
    let chunkView = new Uint8Array(data.buffer, data.byteOffset + i, 1024);
    process(chunkView);  // No allocation, just view
  }
}

// Type-specific optimizations
function sumFloat32Array(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];  // JIT can specialize this
  }
  return sum;
}

// More optimizable than
function sumMixedArray(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];  // JIT can't specialize (unknown type)
  }
  return sum;
}

// Best practices summary
// 1. Use typed arrays for numerical data (faster, less memory)
// 2. Use DataView for heterogeneous structures (explicit control)
// 3. Avoid buffer allocation in hot loops (reuse views)
// 4. Match endianness to protocol (network = big-endian)
// 5. Use ArrayBuffer pooling for repeated allocations
// 6. Profile before optimizing (actual bottlenecks matter)
```