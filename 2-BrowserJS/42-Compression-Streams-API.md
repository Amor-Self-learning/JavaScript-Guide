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
# 42.2 DecompressionStream

DecompressionStream decompresses gzip or deflate compressed data.

---

## 42.2.1 Basic Usage

```javascript
const stream = new DecompressionStream('gzip');

const compressed = await fetch('data.gz').then(r => r.body);
const decompressed = compressed.pipeThrough(stream);

const text = await new Response(decompressed).text();
```

---

## 42.2.2 Decompress Blob

```javascript
async function decompress(compressedBlob, format = 'gzip') {
  const stream = new DecompressionStream(format);
  const decompressed = compressedBlob.stream().pipeThrough(stream);
  return new Response(decompressed).blob();
}
```

---

## 42.2.3 Handle Compressed Response

```javascript
async function fetchDecompressed(url) {
  const response = await fetch(url);
  
  const encoding = response.headers.get('Content-Encoding');
  
  if (encoding === 'gzip') {
    const decompressed = response.body
      .pipeThrough(new DecompressionStream('gzip'));
    return new Response(decompressed).text();
  }
  
  return response.text();
}
```

---

## 42.2.4 Summary

| Method | Description |
|--------|-------------|
| `new DecompressionStream(format)` | Create decompressor |
| `.readable` | Readable stream output |
| `.writable` | Writable stream input |
| `pipeThrough()` | Connect streams |

---

**End of Chapter 42.2: DecompressionStream**

This completes Group 42 — Compression Streams API. Next: **Group 43 — Streams API**.
