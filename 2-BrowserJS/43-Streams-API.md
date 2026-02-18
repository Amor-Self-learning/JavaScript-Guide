# 43.1 ReadableStream

ReadableStream represents a source of data that can be read chunk by chunk.

---

## 43.1.1 Create ReadableStream

```javascript
const stream = new ReadableStream({
  start(controller) {
    controller.enqueue('chunk 1');
    controller.enqueue('chunk 2');
    controller.close();
  }
});
```

---

## 43.1.2 Pull-Based Stream

```javascript
let i = 0;
const stream = new ReadableStream({
  pull(controller) {
    if (i < 10) {
      controller.enqueue(`chunk ${i++}`);
    } else {
      controller.close();
    }
  }
});
```

---

## 43.1.3 Reading Data

### Using Reader

```javascript
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}

reader.releaseLock();
```

### Using for-await

```javascript
for await (const chunk of stream) {
  console.log(chunk);
}
```

---

## 43.1.4 Tee (Fork)

```javascript
const [stream1, stream2] = stream.tee();
// Both streams receive same data
```

---

## 43.1.5 Piping

```javascript
// Pipe through transform
const result = readable
  .pipeThrough(transformStream)
  .pipeTo(writableStream);
```

---

## 43.1.6 Summary

| Method | Description |
|--------|-------------|
| `getReader()` | Get reader |
| `tee()` | Fork stream |
| `pipeThrough()` | Transform |
| `pipeTo()` | Write to dest |
| `cancel()` | Cancel stream |

---

**End of Chapter 43.1: ReadableStream**

Next: **43.2 WritableStream**.
# 43.2 WritableStream

WritableStream represents a destination for data.

---

## 43.2.1 Create WritableStream

```javascript
const stream = new WritableStream({
  write(chunk) {
    console.log('Received:', chunk);
  },
  close() {
    console.log('Stream closed');
  },
  abort(reason) {
    console.error('Aborted:', reason);
  }
});
```

---

## 43.2.2 Write Data

### Using Writer

```javascript
const writer = stream.getWriter();

await writer.write('chunk 1');
await writer.write('chunk 2');
await writer.close();
```

---

## 43.2.3 Backpressure

```javascript
const writer = stream.getWriter();

// Wait for ready signal
await writer.ready;
await writer.write(data);

// Check desired size
console.log(writer.desiredSize);
```

---

## 43.2.4 Abort Stream

```javascript
const writer = stream.getWriter();

// Abort with reason
await writer.abort(new Error('Cancelled'));
```

---

## 43.2.5 With Queuing Strategy

```javascript
const stream = new WritableStream({
  write(chunk) { /* ... */ }
}, new CountQueuingStrategy({ highWaterMark: 10 }));
```

---

## 43.2.6 Summary

| Method | Description |
|--------|-------------|
| `getWriter()` | Get writer |
| `writer.write()` | Write chunk |
| `writer.close()` | Close stream |
| `writer.abort()` | Abort stream |
| `writer.ready` | Ready promise |

---

**End of Chapter 43.2: WritableStream**

Next: **43.3 TransformStream**.
# 43.3 TransformStream

TransformStream transforms data as it passes through.

---

## 43.3.1 Create TransformStream

```javascript
const transform = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});
```

---

## 43.3.2 Using TransformStream

```javascript
const uppercase = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

const result = await readableStream
  .pipeThrough(uppercase)
  .pipeTo(writableStream);
```

---

## 43.3.3 Async Transform

```javascript
const asyncTransform = new TransformStream({
  async transform(chunk, controller) {
    const processed = await processAsync(chunk);
    controller.enqueue(processed);
  }
});
```

---

## 43.3.4 Flush on Close

```javascript
const transform = new TransformStream({
  buffer: [],
  
  transform(chunk, controller) {
    this.buffer.push(chunk);
    if (this.buffer.length >= 10) {
      controller.enqueue(this.buffer);
      this.buffer = [];
    }
  },
  
  flush(controller) {
    if (this.buffer.length > 0) {
      controller.enqueue(this.buffer);
    }
  }
});
```

---

## 43.3.5 Access Sides

```javascript
const { readable, writable } = transform;

// Use readable and writable separately
writer = writable.getWriter();
reader = readable.getReader();
```

---

## 43.3.6 Summary

| Property | Description |
|----------|-------------|
| `readable` | Output stream |
| `writable` | Input stream |

| Callback | Description |
|----------|-------------|
| `transform()` | Process chunk |
| `flush()` | Final processing |

---

**End of Chapter 43.3: TransformStream**

Next: **43.4 Byte Streams**.
# 43.4 Byte Streams

Byte streams handle binary data efficiently with BYOB (Bring Your Own Buffer) readers.

---

## 43.4.1 Create Byte Stream

```javascript
const stream = new ReadableStream({
  type: 'bytes',
  
  pull(controller) {
    // Create view into controller's buffer
    const view = controller.byobRequest?.view;
    
    if (view) {
      // Fill provided buffer
      const bytesRead = fillBuffer(view);
      controller.byobRequest.respond(bytesRead);
    } else {
      // Fallback to enqueue
      controller.enqueue(new Uint8Array([1, 2, 3]));
    }
  }
});
```

---

## 43.4.2 BYOB Reader

```javascript
const reader = stream.getReader({ mode: 'byob' });

const buffer = new ArrayBuffer(1024);
let view = new Uint8Array(buffer);

while (true) {
  const { done, value } = await reader.read(view);
  if (done) break;
  
  console.log('Read', value.byteLength, 'bytes');
  view = new Uint8Array(value.buffer);  // Reuse buffer
}
```

---

## 43.4.3 Benefits

- Zero-copy reads
- Memory efficient
- Better for large binary data

---

## 43.4.4 Summary

| Feature | Description |
|---------|-------------|
| `type: 'bytes'` | Enable byte stream |
| `getReader({ mode: 'byob' })` | BYOB reader |
| `byobRequest` | Buffer request |

---

**End of Chapter 43.4: Byte Streams**

This completes Group 43 — Streams API. Next: **Group 44 — Web Cryptography API**.
