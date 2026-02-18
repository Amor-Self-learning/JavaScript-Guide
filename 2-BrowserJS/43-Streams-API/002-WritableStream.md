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
