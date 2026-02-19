# Module 8: Buffer

The `Buffer` class provides a way to work with binary data directly in Node.js. Buffers are fixed-size chunks of memory allocated outside the V8 heap, essential for handling file I/O, network protocols, and binary data.

---

## 8.1 Creating Buffers

### Buffer.alloc() — Safe Allocation

```javascript
// Create zero-filled buffer
const buf = Buffer.alloc(10);
console.log(buf);
// <Buffer 00 00 00 00 00 00 00 00 00 00>

// Create buffer filled with specific value
const filled = Buffer.alloc(5, 'a');
console.log(filled);
// <Buffer 61 61 61 61 61>

// Fill with byte value
const bytes = Buffer.alloc(4, 0xFF);
console.log(bytes);
// <Buffer ff ff ff ff>
```

### Buffer.allocUnsafe() — Fast Allocation

```javascript
// Fast but may contain old data (security risk!)
const unsafe = Buffer.allocUnsafe(10);
console.log(unsafe);
// <Buffer (random old memory content)>

// Always zero-fill for sensitive data
const safe = Buffer.allocUnsafe(10).fill(0);
```

### Buffer.from() — From Existing Data

```javascript
// From string
const fromString = Buffer.from('Hello');
console.log(fromString);
// <Buffer 48 65 6c 6c 6f>

// From string with encoding
const utf8 = Buffer.from('Hello', 'utf8');
const base64 = Buffer.from('SGVsbG8=', 'base64');
const hex = Buffer.from('48656c6c6f', 'hex');

// From array
const fromArray = Buffer.from([72, 101, 108, 108, 111]);
console.log(fromArray.toString());
// 'Hello'

// From another buffer (copy)
const original = Buffer.from('Hello');
const copy = Buffer.from(original);

// From ArrayBuffer
const arrayBuffer = new ArrayBuffer(10);
const fromArrayBuffer = Buffer.from(arrayBuffer);
```

---

## 8.2 Encodings

Node.js supports these character encodings:

| Encoding | Description |
|----------|-------------|
| `utf8` | Multi-byte Unicode (default) |
| `ascii` | 7-bit ASCII |
| `utf16le` | Little-endian 16-bit Unicode |
| `ucs2` | Alias for utf16le |
| `base64` | Base64 encoding |
| `base64url` | URL-safe Base64 |
| `latin1` | ISO-8859-1 |
| `binary` | Alias for latin1 |
| `hex` | Hexadecimal |

```javascript
const buf = Buffer.from('Hello World');

// Convert to different encodings
console.log(buf.toString('utf8'));     // 'Hello World'
console.log(buf.toString('hex'));      // '48656c6c6f20576f726c64'
console.log(buf.toString('base64'));   // 'SGVsbG8gV29ybGQ='
console.log(buf.toString('base64url')); // 'SGVsbG8gV29ybGQ'

// Partial conversion
console.log(buf.toString('utf8', 0, 5)); // 'Hello'
```

---

## 8.3 Buffer Properties and Methods

### Properties

```javascript
const buf = Buffer.from('Hello');

// Length in bytes
console.log(buf.length);     // 5
console.log(buf.byteLength); // 5

// Get underlying ArrayBuffer
console.log(buf.buffer);  // ArrayBuffer

// Offset in ArrayBuffer (for slices)
console.log(buf.byteOffset);  // 0
```

### Reading Data

```javascript
const buf = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]);

// Read integers
console.log(buf.readUInt8(0));         // 1
console.log(buf.readUInt16BE(0));      // 258 (0x0102)
console.log(buf.readUInt16LE(0));      // 513 (0x0201)
console.log(buf.readUInt32BE(0));      // 16909060 (0x01020304)
console.log(buf.readInt8(0));          // 1 (signed)

// Read floating point
const floatBuf = Buffer.alloc(4);
floatBuf.writeFloatBE(3.14);
console.log(floatBuf.readFloatBE(0));  // 3.140000104904175

// Big integers (64-bit)
const bigBuf = Buffer.alloc(8);
bigBuf.writeBigInt64BE(9007199254740993n);
console.log(bigBuf.readBigInt64BE(0)); // 9007199254740993n

// Index access
console.log(buf[0]);  // 1
console.log(buf[1]);  // 2
```

### Writing Data

```javascript
const buf = Buffer.alloc(16);

// Write integers
buf.writeUInt8(255, 0);
buf.writeUInt16BE(65535, 1);
buf.writeUInt16LE(65535, 3);
buf.writeUInt32BE(4294967295, 5);
buf.writeInt8(-128, 9);

// Write floating point
buf.writeFloatBE(3.14, 10);
buf.writeDoubleBE(3.14159, 0);

// Index assignment
buf[0] = 72;
buf[1] = 105;

// Write string
const strBuf = Buffer.alloc(20);
const bytesWritten = strBuf.write('Hello World', 0, 'utf8');
console.log(bytesWritten);  // 11
```

---

## 8.4 Buffer Manipulation

### Slicing

```javascript
const buf = Buffer.from('Hello World');

// slice() returns a view (shares memory!)
const slice = buf.slice(0, 5);
console.log(slice.toString());  // 'Hello'

// Modifying slice affects original
slice[0] = 74;  // 'J'
console.log(buf.toString());  // 'Jello World'

// subarray() is the same as slice()
const sub = buf.subarray(6);
console.log(sub.toString());  // 'World'
```

### Copying

```javascript
const source = Buffer.from('Hello');
const target = Buffer.alloc(10);

// Copy entire source to target
source.copy(target);
console.log(target.toString());  // 'Hello\x00\x00\x00\x00\x00'

// Copy with offsets
const buf = Buffer.alloc(26);
for (let i = 0; i < 26; i++) {
  buf[i] = i + 65;  // A-Z
}

const copy = Buffer.alloc(10);
buf.copy(copy, 0, 0, 10);  // (target, targetStart, sourceStart, sourceEnd)
console.log(copy.toString());  // 'ABCDEFGHIJ'
```

### Concatenating

```javascript
const buf1 = Buffer.from('Hello ');
const buf2 = Buffer.from('World');
const buf3 = Buffer.from('!');

const combined = Buffer.concat([buf1, buf2, buf3]);
console.log(combined.toString());  // 'Hello World!'

// With total length (truncates or pads)
const limited = Buffer.concat([buf1, buf2], 8);
console.log(limited.toString());  // 'Hello Wo'
```

### Comparing

```javascript
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('ABD');
const buf3 = Buffer.from('ABC');

// compare() returns -1, 0, or 1
console.log(buf1.compare(buf2));  // -1 (buf1 < buf2)
console.log(buf1.compare(buf3));  // 0 (equal)
console.log(buf2.compare(buf1));  // 1 (buf2 > buf1)

// equals() for equality check
console.log(buf1.equals(buf3));  // true
console.log(buf1.equals(buf2));  // false

// Sort array of buffers
const sorted = [buf2, buf1, buf3].sort(Buffer.compare);
```

### Filling

```javascript
const buf = Buffer.alloc(10);

// Fill with string
buf.fill('abc');
console.log(buf.toString());  // 'abcabcabca'

// Fill with number
buf.fill(0);
console.log(buf);  // <Buffer 00 00 00 00 00 00 00 00 00 00>

// Fill range
buf.fill('X', 2, 5);
console.log(buf.toString());  // '\x00\x00XXX\x00\x00\x00\x00\x00'
```

---

## 8.5 Searching

### includes()

```javascript
const buf = Buffer.from('Hello World');

console.log(buf.includes('World'));     // true
console.log(buf.includes('world'));     // false (case-sensitive)
console.log(buf.includes(Buffer.from('lo'))); // true
console.log(buf.includes(111));          // true (ASCII 'o')
```

### indexOf() / lastIndexOf()

```javascript
const buf = Buffer.from('Hello World');

console.log(buf.indexOf('o'));          // 4
console.log(buf.indexOf('o', 5));       // 7 (start from offset)
console.log(buf.lastIndexOf('o'));      // 7
console.log(buf.indexOf('xyz'));        // -1 (not found)
```

---

## 8.6 Iteration

```javascript
const buf = Buffer.from('Hello');

// entries()
for (const [index, byte] of buf.entries()) {
  console.log(index, byte);
}
// 0 72
// 1 101
// 2 108
// 3 108
// 4 111

// keys()
for (const index of buf.keys()) {
  console.log(index);
}
// 0, 1, 2, 3, 4

// values()
for (const byte of buf.values()) {
  console.log(byte);
}
// 72, 101, 108, 108, 111

// forEach
buf.forEach((byte, index) => {
  console.log(`${index}: ${byte}`);
});
```

---

## 8.7 Buffer and TypedArrays

Buffers are Uint8Arrays under the hood:

```javascript
const buf = Buffer.from([1, 2, 3, 4]);

// Buffer is a Uint8Array
console.log(buf instanceof Uint8Array);  // true

// Create typed array views
const int16View = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2);
console.log(int16View);  // Int16Array [ 513, 1027 ]

// Create buffer from typed array
const uint16 = new Uint16Array([256, 512]);
const bufFromTyped = Buffer.from(uint16.buffer);
console.log(bufFromTyped);  // <Buffer 00 01 00 02>
```

---

## 8.8 Common Patterns

### Reading Binary File Format

```javascript
// Simple BMP header parser
function parseBMPHeader(buffer) {
  return {
    signature: buffer.toString('ascii', 0, 2),
    fileSize: buffer.readUInt32LE(2),
    reserved: buffer.readUInt32LE(6),
    dataOffset: buffer.readUInt32LE(10),
    headerSize: buffer.readUInt32LE(14),
    width: buffer.readInt32LE(18),
    height: buffer.readInt32LE(22),
    planes: buffer.readUInt16LE(26),
    bitsPerPixel: buffer.readUInt16LE(28)
  };
}

const bmpBuffer = fs.readFileSync('image.bmp');
const header = parseBMPHeader(bmpBuffer);
console.log(header);
```

### Creating Binary Protocol Message

```javascript
function createMessage(type, payload) {
  const payloadBuffer = Buffer.from(JSON.stringify(payload));
  const message = Buffer.alloc(8 + payloadBuffer.length);
  
  // Write header
  message.writeUInt32BE(0xDEADBEEF, 0);  // Magic number
  message.writeUInt8(type, 4);            // Message type
  message.writeUInt8(0, 5);               // Reserved
  message.writeUInt16BE(payloadBuffer.length, 6);  // Payload length
  
  // Write payload
  payloadBuffer.copy(message, 8);
  
  return message;
}

function parseMessage(buffer) {
  const magic = buffer.readUInt32BE(0);
  if (magic !== 0xDEADBEEF) {
    throw new Error('Invalid message');
  }
  
  return {
    type: buffer.readUInt8(4),
    payload: JSON.parse(buffer.slice(8).toString())
  };
}
```

### Base64 Image Handling

```javascript
// Image to base64
function imageToBase64(filePath) {
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1);
  return `data:image/${ext};base64,${buffer.toString('base64')}`;
}

// Base64 to image
function base64ToImage(dataUrl, outputPath) {
  const matches = dataUrl.match(/^data:image\/\w+;base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');
  
  const buffer = Buffer.from(matches[1], 'base64');
  fs.writeFileSync(outputPath, buffer);
}
```

### Hex Dump

```javascript
function hexDump(buffer, bytesPerLine = 16) {
  const lines = [];
  
  for (let i = 0; i < buffer.length; i += bytesPerLine) {
    const slice = buffer.slice(i, i + bytesPerLine);
    
    // Offset
    const offset = i.toString(16).padStart(8, '0');
    
    // Hex bytes
    const hex = [...slice]
      .map(b => b.toString(16).padStart(2, '0'))
      .join(' ')
      .padEnd(bytesPerLine * 3 - 1);
    
    // ASCII representation
    const ascii = [...slice]
      .map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')
      .join('');
    
    lines.push(`${offset}  ${hex}  |${ascii}|`);
  }
  
  return lines.join('\n');
}

console.log(hexDump(Buffer.from('Hello, World! This is a test.')));
// 00000000  48 65 6c 6c 6f 2c 20 57 6f 72 6c 64 21 20 54 68  |Hello, World! Th|
// 00000010  69 73 20 69 73 20 61 20 74 65 73 74 2e           |is is a test.|
```

---

## 8.9 Blob (Node.js 18+)

```javascript
// Create Blob from buffer
const buffer = Buffer.from('Hello World');
const blob = new Blob([buffer], { type: 'text/plain' });

console.log(blob.size);  // 11
console.log(blob.type);  // 'text/plain'

// Read blob
const text = await blob.text();
console.log(text);  // 'Hello World'

// Blob to ArrayBuffer
const arrayBuffer = await blob.arrayBuffer();
const buf = Buffer.from(arrayBuffer);
```

---

## 8.10 Memory Considerations

### Buffer Pool

```javascript
// Small buffers (< 8KB) use pooled memory
const small = Buffer.alloc(100);       // From pool
const large = Buffer.alloc(10000);     // Direct allocation

// allocUnsafe uses pool (faster but may leak data)
const pooled = Buffer.allocUnsafe(100);  // From pool

// allocUnsafeSlow bypasses pool
const direct = Buffer.allocUnsafeSlow(100);  // Direct allocation
```

### Controlling Pool Size

```javascript
// Default pool size is 8KB
console.log(Buffer.poolSize);  // 8192

// Modify pool size (before any allocations)
Buffer.poolSize = 16384;  // 16KB
```

---

## 8.11 Common Gotchas

### Slice Shares Memory

```javascript
// ❌ Slice modifies original
const original = Buffer.from('Hello');
const slice = original.slice(0, 3);
slice[0] = 74;  // Changes original too!
console.log(original.toString());  // 'Jello'

// ✅ Use copy for independent buffer
const original = Buffer.from('Hello');
const copy = Buffer.from(original.slice(0, 3));
copy[0] = 74;
console.log(original.toString());  // 'Hello'
```

### String Length vs Buffer Length

```javascript
// ❌ String length !== byte length for Unicode
const emoji = '👋';
console.log(emoji.length);  // 2 (surrogate pair)
console.log(Buffer.from(emoji).length);  // 4 (UTF-8 bytes)

const chinese = '中文';
console.log(chinese.length);  // 2
console.log(Buffer.from(chinese).length);  // 6
```

### allocUnsafe Security

```javascript
// ❌ May contain sensitive old data
const buf = Buffer.allocUnsafe(1000);
console.log(buf.toString());  // Could contain passwords, keys, etc.

// ✅ Always fill for security-sensitive code
const safeBuf = Buffer.allocUnsafe(1000).fill(0);

// ✅ Or use alloc
const safeBuf2 = Buffer.alloc(1000);
```

### Buffer.from() with Numbers

```javascript
// ❌ Number creates buffer of that size (deprecated)
// Buffer.from(10);  // Don't do this

// ✅ Use array for bytes
Buffer.from([10]);  // Single byte buffer with value 10
```

---

## 8.12 Summary

| Creation Method | Description |
|-----------------|-------------|
| `Buffer.alloc(size)` | Zero-filled buffer (safe) |
| `Buffer.allocUnsafe(size)` | Uninitialized buffer (fast) |
| `Buffer.from(data)` | From string, array, or buffer |

| Read Methods | Write Methods |
|--------------|---------------|
| `readUInt8()` | `writeUInt8()` |
| `readUInt16BE/LE()` | `writeUInt16BE/LE()` |
| `readUInt32BE/LE()` | `writeUInt32BE/LE()` |
| `readFloatBE/LE()` | `writeFloatBE/LE()` |
| `readDoubleBE/LE()` | `writeDoubleBE/LE()` |

| Manipulation | Description |
|--------------|-------------|
| `slice()` / `subarray()` | Create view (shares memory) |
| `copy()` | Copy bytes to target buffer |
| `concat()` | Combine multiple buffers |
| `fill()` | Fill with value |
| `compare()` / `equals()` | Compare buffers |

---

**End of Module 8: Buffer**

Next: **Module 9 — URL and Query String** (URL parsing and manipulation)
