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
