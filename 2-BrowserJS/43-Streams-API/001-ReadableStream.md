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
