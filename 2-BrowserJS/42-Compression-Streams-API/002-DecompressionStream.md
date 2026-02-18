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
