# 42.1 CompressionStream

CompressionStream compresses data using gzip or deflate algorithms.

---

## 42.1.1 Basic Usage

```javascript
const stream = new CompressionStream('gzip');

const input = new Response('Hello, World!').body;
const compressed = input.pipeThrough(stream);

const blob = await new Response(compressed).blob();
```

---

## 42.1.2 Compression Formats

```javascript
// gzip compression
const gzipStream = new CompressionStream('gzip');

// deflate compression
const deflateStream = new CompressionStream('deflate');

// deflate-raw (no header)
const rawStream = new CompressionStream('deflate-raw');
```

---

## 42.1.3 Compress Data

```javascript
async function compress(data) {
  const encoder = new TextEncoder();
  const input = encoder.encode(data);
  
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();
  
  writer.write(input);
  writer.close();
  
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  return new Blob(chunks);
}
```

---

## 42.1.4 With Fetch

```javascript
async function uploadCompressed(url, data) {
  const stream = new Blob([data]).stream()
    .pipeThrough(new CompressionStream('gzip'));
  
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Encoding': 'gzip' },
    body: stream
  });
}
```

---

## 42.1.5 Summary

| Format | Description |
|--------|-------------|
| `gzip` | Gzip compression |
| `deflate` | Deflate with header |
| `deflate-raw` | Raw deflate |

---

**End of Chapter 42.1: CompressionStream**

Next: **42.2 DecompressionStream**.
