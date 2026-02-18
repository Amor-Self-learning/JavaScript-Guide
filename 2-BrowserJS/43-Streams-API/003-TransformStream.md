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
