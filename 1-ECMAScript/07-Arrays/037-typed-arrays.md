# 7.6 Typed Arrays

**Typed Arrays** provide a mechanism to access raw binary data with fixed data types. They're essential for performance-critical code, binary protocol handling, and low-level data manipulation.

---

## 7.6.1 Typed Array Types and Creation

**Typed Arrays** come in various types for different integer and floating-point sizes.

```javascript
// Integer typed arrays (signed)
let int8 = new Int8Array(4);          // -128 to 127
let int16 = new Int16Array(4);        // -32,768 to 32,767
let int32 = new Int32Array(4);        // -2^31 to 2^31-1

// Unsigned integer typed arrays
let uint8 = new Uint8Array(4);        // 0 to 255
let uint16 = new Uint16Array(4);      // 0 to 65,535
let uint32 = new Uint32Array(4);      // 0 to 2^32-1

// Floating-point typed arrays
let float32 = new Float32Array(4);    // 32-bit float
let float64 = new Float64Array(4);    // 64-bit double

// Big integer typed arrays (ES2020)
let bigInt64 = new BigInt64Array(4);   // -2^63 to 2^63-1
let bigUint64 = new BigUint64Array(4); // 0 to 2^64-1

// Initialization with values
let arr = new Uint8Array([1, 2, 3, 4]);
arr                         // Uint8Array [1, 2, 3, 4]

// From regular array
let regular = [10, 20, 30];
let typed = new Uint8Array(regular);
typed                       // Uint8Array [10, 20, 30]

// From another typed array
let source = new Uint8Array([1, 2, 3]);
let copy = new Uint16Array(source);
copy                        // Uint16Array [1, 2, 3]

// From ArrayBuffer
let buffer = new ArrayBuffer(16);     // 16 bytes
let view = new Uint8Array(buffer);
view.length                 // 16

// With offset and length
let buffer = new ArrayBuffer(16);
let view1 = new Uint8Array(buffer, 0, 4);    // First 4 bytes
let view2 = new Uint8Array(buffer, 4, 4);    // Next 4 bytes
// Different views of same buffer

// Zero-filled array
let arr = new Uint8Array(5);
arr                         // Uint8Array [0, 0, 0, 0, 0]

// Fixed length (cannot change)
let arr = new Uint8Array(5);
arr.push(10);               // TypeError: push is not a function
arr.length = 10;            // Silently ignored

// Type coercion
let arr = new Uint8Array([1.9, 2.5, 3.1]);
arr                         // Uint8Array [1, 2, 3] - truncated!

// Overflow
let arr = new Uint8Array([260]);  // 260 = 0x104
arr                         // Uint8Array [4] - wraps around (260 & 0xFF = 4)

// Negative values (unsigned)
let arr = new Uint8Array([-1, -2, -3]);
arr                         // Uint8Array [255, 254, 253] - wrapped
```

**Key Properties:**

```javascript
// BYTES_PER_ELEMENT
Uint8Array.BYTES_PER_ELEMENT;       // 1
Uint16Array.BYTES_PER_ELEMENT;      // 2
Uint32Array.BYTES_PER_ELEMENT;      // 4
Float32Array.BYTES_PER_ELEMENT;     // 4
Float64Array.BYTES_PER_ELEMENT;     // 8

// Instance properties
let arr = new Uint8Array(10);
arr.byteLength;             // 10 (bytes)
arr.byteOffset;             // 0 (offset in buffer)
arr.buffer;                 // ArrayBuffer

// Length in elements
arr.length;                 // 10 (elements, not bytes)

// For Uint32Array with 4 elements
let arr = new Uint32Array(4);
arr.length;                 // 4 (elements)
arr.byteLength;             // 16 (bytes: 4 * 4)
Uint32Array.BYTES_PER_ELEMENT;  // 4 (bytes per element)
```

---

## 7.6.2 Typed Array Operations

**Operations** on typed arrays include indexing, modification, and copying.

```javascript
// Reading elements
let arr = new Uint8Array([10, 20, 30, 40]);
arr[0];                     // 10
arr[2];                     // 30
arr[10];                    // undefined (out of bounds)

// Writing elements
arr[0] = 99;
arr[0];                     // 99

// Assignment with type conversion
arr[1] = 256;               // Wraps to 0 (256 & 0xFF)
arr[1];                     // 0

// Float truncation
let floats = new Float32Array(2);
floats[0] = 3.14159;
floats[0];                  // 3.1415901660919189 (precision loss)

// Iteration methods (same as regular arrays)
let arr = new Uint8Array([1, 2, 3, 4, 5]);

// forEach
arr.forEach((x, i) => {
  console.log(`${i}: ${x}`);
});

// map
let doubled = arr.map(x => x * 2);  // Returns new typed array

// filter
let evens = arr.filter(x => x % 2 === 0);

// reduce
let sum = arr.reduce((a, b) => a + b, 0);  // 15

// find
let found = arr.find(x => x > 3);   // 4

// some / every
arr.some(x => x > 4);       // true
arr.every(x => x > 0);      // true

// Copying elements
let src = new Uint8Array([1, 2, 3, 4]);
let dst = new Uint8Array(4);

// set() method
dst.set(src);               // [1, 2, 3, 4]

// With offset
let dst2 = new Uint8Array(6);
dst2.set(src, 2);           // [0, 0, 1, 2, 3, 4]

// Subarray (view, not copy)
let arr = new Uint8Array([1, 2, 3, 4, 5]);
let sub = arr.subarray(1, 4);  // [2, 3, 4]

// Modification through subarray affects original
sub[0] = 99;
arr[1];                     // 99 (same buffer!)

// slice (true copy)
let copy = arr.slice(1, 4);  // [2, 3, 4]
copy[0] = 99;
arr[1];                     // Not affected (different buffer)

// indexOf / lastIndexOf
let arr = new Uint8Array([1, 2, 3, 2, 1]);
arr.indexOf(2);             // 1
arr.lastIndexOf(2);         // 3

// includes
arr.includes(3);            // true

// reverse
arr.reverse();              // [1, 2, 3, 2, 1] -> [1, 2, 3, 2, 1]

// sort
let unsorted = new Uint8Array([3, 1, 4, 1, 5]);
unsorted.sort();            // [1, 1, 3, 4, 5]

// With comparator
unsorted.sort((a, b) => b - a);  // [5, 4, 3, 1, 1]

// copyWithin
let arr = new Uint8Array([1, 2, 3, 4, 5]);
arr.copyWithin(0, 3);       // [4, 5, 3, 4, 5]

// fill
arr.fill(0);                // [0, 0, 0, 0, 0]
arr.fill(7, 1, 3);          // [0, 7, 7, 0, 0]

// toLocaleString / toString
let arr = new Uint8Array([1, 2, 3]);
arr.toString();             // '1,2,3'
arr.toLocaleString();       // '1,2,3'
```

---

## 7.6.3 Converting Between Typed Arrays

**Conversion** allows switching between typed array types and regular arrays.

```javascript
// Uint8Array to regular array
let typed = new Uint8Array([1, 2, 3]);
let regular = Array.from(typed);
regular                     // [1, 2, 3]

// Using spread
let regular = [...typed];   // [1, 2, 3]

// Using slice
let regular = Array.prototype.slice.call(typed);

// Regular array to typed array
let regular = [1, 2, 3];
let typed = new Uint8Array(regular);
typed                       // Uint8Array [1, 2, 3]

// Between typed array types
let uint8 = new Uint8Array([1, 2, 3]);
let uint16 = new Uint16Array(uint8);
uint16                      // Uint16Array [1, 2, 3]

// With precision loss
let float32 = new Float32Array([3.14159, 2.71828]);
let uint8 = new Uint8Array(float32);
uint8                       // Uint8Array [3, 2] - truncated

// Type conversion
let uint8 = new Uint8Array([256, 257, 258]);
let int16 = new Int16Array(uint8.buffer);
// Reinterprets bytes as 16-bit signed integers

// Endianness matters
let bytes = new Uint8Array([0x12, 0x34]);
let int16 = new Int16Array(bytes.buffer);
// Little-endian: 0x3412 = 13330
// Big-endian: 0x1234 = 4660

// Safe conversion with Array.from
let mixed = [1, 2, 300, -1, 3.14];
let uint8 = Uint8Array.from(mixed, x => x & 0xFF);  // [1, 2, 44, 255, 3]

// Or with mapping
let uint8 = new Uint8Array(mixed.map(x => Math.min(255, Math.max(0, x))));

// Copy to shared buffer
let buffer = new ArrayBuffer(8);
let uint32_1 = new Uint32Array(buffer, 0, 1);
let uint32_2 = new Uint32Array(buffer, 4, 1);
uint32_1[0] = 0x12345678;
uint32_2[0] = 0x9ABCDEF0;
// buffer now contains both values

// Reading as different type
let buffer = new ArrayBuffer(4);
let uint32 = new Uint32Array(buffer);
let uint8 = new Uint8Array(buffer);
uint32[0] = 0x12345678;
uint8[0];                   // 0x78 (little-endian)
uint8[1];                   // 0x56
uint8[2];                   // 0x34
uint8[3];                   // 0x12

// Float to bytes
let buffer = new ArrayBuffer(4);
let floats = new Float32Array(buffer);
let bytes = new Uint8Array(buffer);
floats[0] = 3.14159;
bytes;                      // Uint8Array [208, 15, 73, 64] (bytes representation)
```

---

## 7.6.4 Uint8ClampedArray

**Uint8ClampedArray** is special: values are clamped to 0-255 range instead of wrapping.

```javascript
// Regular Uint8Array (wraps)
let uint8 = new Uint8Array([256, 257, -1]);
uint8                       // [0, 1, 255]

// Uint8ClampedArray (clamps)
let clamped = new Uint8ClampedArray([256, 257, -1]);
clamped                     // [255, 255, 0]  // 256->255, 257->255, -1->0

// Float values are rounded
let clamped = new Uint8ClampedArray([255.5, 0.5, -0.5]);
clamped                     // [255, 0, 0]  // Rounded to nearest int

// Used for image data
let imageData = {
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([
    255, 0, 0, 255,        // Red pixel (RGBA)
    0, 255, 0, 255,        // Green pixel
    0, 0, 255, 255,        // Blue pixel
    255, 255, 255, 255     // White pixel
  ])
};

// Canvas pixel manipulation
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
let imgData = ctx.createImageData(100, 100);

// Modify pixels with clamping (ensures valid RGB values)
imgData.data[0] = 256;      // Clamped to 255
```

---

## 7.6.5 BigInt64Array and BigUint64Array (ES2020)

**BigInt typed arrays** handle 64-bit integers beyond JavaScript's safe integer range.

```javascript
// BigInt64Array for signed 64-bit integers
let big64 = new BigInt64Array(4);
big64[0] = 123n;
big64[0];                   // 123n

big64[1] = -456n;
big64[1];                   // -456n

// BigUint64Array for unsigned 64-bit integers
let bigUint64 = new BigUint64Array(4);
bigUint64[0] = 9007199254740991n;  // Beyond safe integer
bigUint64[0];               // 9007199254740991n

// Very large numbers
let maxInt64 = 9223372036854775807n;
let big64 = new BigInt64Array([maxInt64]);
big64[0];                   // 9223372036854775807n

// Operations
let big64 = new BigInt64Array([10n, 20n, 30n]);
big64[0] = big64[0] + 5n;
big64[0];                   // 15n

// Cannot mix regular and BigInt
let big64 = new BigInt64Array(1);
big64[0] = 10;              // TypeError: Cannot convert 10 to a BigInt

// Regular integers must convert
big64[0] = BigInt(10);      // OK

// Iteration
let big64 = new BigInt64Array([1n, 2n, 3n]);
big64.forEach(x => console.log(x));  // 1n, 2n, 3n

// Converting BigInt array to regular array
let big64 = new BigInt64Array([10n, 20n, 30n]);
let regular = Array.from(big64);
regular                     // [10n, 20n, 30n]

// Using spread
let regular = [...big64];   // [10n, 20n, 30n]
```

---

## 7.6.6 ArrayBuffer and Binary Data

**ArrayBuffer** represents generic fixed-length binary data. Views interpret the bytes.

```javascript
// Create buffer
let buffer = new ArrayBuffer(16);   // 16 bytes
buffer.byteLength;          // 16

// Create views
let uint8View = new Uint8Array(buffer);
let uint32View = new Uint32Array(buffer);

// Different views of same data
uint8View[0] = 0x12;
uint8View[1] = 0x34;
uint8View[2] = 0x56;
uint8View[3] = 0x78;
uint32View[0];              // Depends on endianness
                            // Little-endian: 0x78563412
                            // Big-endian: 0x12345678

// Slicing buffer (creates new buffer)
let buffer = new ArrayBuffer(16);
let slice = buffer.slice(4, 8);  // Bytes 4-7
slice.byteLength;           // 4

// View with offset
let buffer = new ArrayBuffer(16);
let view1 = new Uint8Array(buffer, 0, 4);    // First 4 bytes
let view2 = new Uint8Array(buffer, 8, 4);    // Next 4 bytes at offset 8

// Detached buffer (after transfer)
let buffer = new ArrayBuffer(16);
let transferred = buffer.transfer?.();  // Not standard yet

// Creating buffer from binary string
function stringToBuffer(str) {
  let buffer = new ArrayBuffer(str.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buffer;
}

let buffer = stringToBuffer('Hello');

// Reading back
function bufferToString(buffer) {
  let view = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]);
  }
  return str;
}

bufferToString(buffer);     // 'Hello'

// Use case: Network packet
let packetBuffer = new ArrayBuffer(20);  // 20-byte packet
let header = new Uint32Array(packetBuffer, 0, 1);
let payload = new Uint8Array(packetBuffer, 4, 16);
header[0] = 0xDEADBEEF;  // Set packet identifier
```

---

## 7.6.7 DataView for Mixed-Type Data

**DataView** allows reading/writing different types from same buffer with explicit endianness control.

```javascript
// Create DataView
let buffer = new ArrayBuffer(16);
let view = new DataView(buffer);

// Writing different types
view.setUint8(0, 0xFF);          // 8-bit unsigned at offset 0
view.setInt16(2, -1000);         // 16-bit signed at offset 2
view.setFloat32(4, 3.14);        // 32-bit float at offset 4
view.setUint32(8, 0xDEADBEEF);   // 32-bit unsigned at offset 8

// Reading back
view.getUint8(0);                // 255
view.getInt16(2);                // -1000
view.getFloat32(4);              // 3.140000104904175
view.getUint32(8);               // 3735928559

// Endianness control
let buffer = new ArrayBuffer(4);
let view = new DataView(buffer);

// Little-endian (default false)
view.setUint32(0, 0x12345678, true);  // true = little-endian
view.getUint8(0);                      // 0x78

// Big-endian (false)
view.setUint32(0, 0x12345678, false); // false = big-endian
view.getUint8(0);                      // 0x12

// Writing bytes directly
let bytes = [0x48, 0x65, 0x6C, 0x6C, 0x6F];  // "Hello"
let buffer = new ArrayBuffer(5);
let view = new DataView(buffer);
bytes.forEach((b, i) => view.setUint8(i, b));

// Or using Uint8Array
let buffer = new ArrayBuffer(5);
new Uint8Array(buffer).set(bytes);

// Complex structures
// Binary format: 1 byte flag, 2 bytes length, N bytes data
function packData(flag, data) {
  let buffer = new ArrayBuffer(3 + data.length);
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  view.setUint8(0, flag);
  view.setUint16(1, data.length);  // Offset 1, uses system endianness
  for (let i = 0; i < data.length; i++) {
    uint8[3 + i] = data[i];
  }
  
  return buffer;
}

function unpackData(buffer) {
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  let flag = view.getUint8(0);
  let length = view.getUint16(1);
  let data = [];
  for (let i = 0; i < length; i++) {
    data.push(uint8[3 + i]);
  }
  
  return { flag, data };
}

let packed = packData(1, [65, 66, 67]);  // A, B, C
let unpacked = unpackData(packed);
unpacked                    // { flag: 1, data: [65, 66, 67] }

// Reading strings from binary
let buffer = new ArrayBuffer(5);
let uint8 = new Uint8Array(buffer);
uint8.set([0x48, 0x65, 0x6C, 0x6C, 0x6F]);  // "Hello"

let str = String.fromCharCode(...uint8);
str                         // "Hello"

// Offset parameter
let buffer = new ArrayBuffer(20);
let view = new DataView(buffer, 5, 10);  // 10 bytes starting at offset 5
view.byteLength;            // 10
view.byteOffset;            // 5
```

---

## 7.6.8 Use Cases

**Common use cases** for typed arrays and binary data.

```javascript
// Image processing with canvas
function processImageData(imageData) {
  let data = imageData.data;  // Uint8ClampedArray
  
  // Grayscale conversion
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let gray = (r + g + b) / 3;
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    // data[i + 3] is alpha, keep unchanged
  }
}

// Audio processing
let audioBuffer = new Float32Array(48000);  // 1 second at 48kHz
audioBuffer[0] = 0.5;  // Set first sample

// Applying gain
for (let i = 0; i < audioBuffer.length; i++) {
  audioBuffer[i] *= 0.5;  // Reduce volume by half
}

// Network protocol parsing
function parseHTTPHeader(buffer) {
  let view = new Uint8Array(buffer);
  let headerEnd = -1;
  
  // Find \r\n\r\n (0x0D, 0x0A, 0x0D, 0x0A)
  for (let i = 0; i < view.length - 3; i++) {
    if (view[i] === 0x0D && view[i+1] === 0x0A &&
        view[i+2] === 0x0D && view[i+3] === 0x0A) {
      headerEnd = i;
      break;
    }
  }
  
  if (headerEnd === -1) return null;
  
  // Convert to string
  let headerBytes = view.subarray(0, headerEnd);
  let header = String.fromCharCode(...headerBytes);
  return header;
}

// File format parsing (PNG header)
function isPNG(buffer) {
  let view = new Uint8Array(buffer);
  // PNG signature: 137 80 78 71 13 10 26 10
  return view[0] === 137 && view[1] === 80 &&
         view[2] === 78 && view[3] === 71 &&
         view[4] === 13 && view[5] === 10 &&
         view[6] === 26 && view[7] === 10;
}

// Compression (simple example)
function compress(data) {
  let uint8 = new Uint8Array(data);
  let result = [];
  
  for (let i = 0; i < uint8.length; i++) {
    let count = 1;
    while (i + count < uint8.length &&
           uint8[i] === uint8[i + count] &&
           count < 255) {
      count++;
    }
    result.push(count);
    result.push(uint8[i]);
    i += count - 1;
  }
  
  return new Uint8Array(result);
}

// Cryptography (mock example)
function simpleXOR(buffer, key) {
  let view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] ^= key[i % key.length];
  }
  return view;
}

let encrypted = simpleXOR(new Uint8Array([1, 2, 3]), [5, 5, 5]);
encrypted                   // Uint8Array [4, 7, 6]

// WebGL vertex data
let positions = new Float32Array([
  -1, -1,  // Vertex 1 (x, y)
   1, -1,  // Vertex 2
   0,  1   // Vertex 3
]);

// Math optimizations
function dot(a, b) {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

let vec1 = new Float32Array([1, 2, 3]);
let vec2 = new Float32Array([4, 5, 6]);
dot(vec1, vec2);            // 32 (1*4 + 2*5 + 3*6)

// Shared memory (Web Workers)
let shared = new SharedArrayBuffer(16);
let view = new Int32Array(shared);
view[0] = 42;  // Can be accessed from multiple workers
```

**Performance Characteristics:**

```javascript
// Typed arrays are more memory-efficient
let regular = [1, 2, 3, 4, 5];  // Each number is object overhead
let typed = new Uint8Array(regular);  // Compact storage

// Typed arrays are faster for numerical operations
let regular = [];
let typed = new Float32Array(1000);

// Filling arrays
console.time('Regular');
for (let i = 0; i < 1000; i++) {
  regular[i] = Math.random();
}
console.timeEnd('Regular');

console.time('Typed');
for (let i = 0; i < typed.length; i++) {
  typed[i] = Math.random();
}
console.timeEnd('Typed');
// Typed is significantly faster for large operations

// SIMD-like operations (mental exercise)
let float32 = new Float32Array([1.0, 2.0, 3.0, 4.0]);
// JIT can optimize operations on typed arrays better
for (let i = 0; i < float32.length; i++) {
  float32[i] *= 2;  // More optimizable than regular array
}
```