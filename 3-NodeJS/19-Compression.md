# Module 19: Compression (zlib)

The `zlib` module provides compression and decompression functionality using Gzip, Deflate, and Brotli algorithms. Essential for reducing data size in storage and network transfers.

---

## 19.1 Module Import

```javascript
// CommonJS
const zlib = require('zlib');

// ES Modules
import zlib from 'zlib';
import { gzip, gunzip, createGzip, createGunzip } from 'zlib';

// Promisified versions
const { promisify } = require('util');
const gzipAsync = promisify(zlib.gzip);
const gunzipAsync = promisify(zlib.gunzip);
```

---

## 19.2 Compression Methods

### Gzip (Most Common)

```javascript
const zlib = require('zlib');

// Callback style
zlib.gzip('Hello World', (err, buffer) => {
  if (err) throw err;
  console.log('Compressed:', buffer);
  
  zlib.gunzip(buffer, (err, result) => {
    if (err) throw err;
    console.log('Decompressed:', result.toString());
  });
});

// Promise style
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

const compressed = await gzip('Hello World');
const decompressed = await gunzip(compressed);
console.log(decompressed.toString());

// Sync (blocks event loop)
const compressed = zlib.gzipSync('Hello World');
const decompressed = zlib.gunzipSync(compressed);
```

### Deflate

```javascript
// With zlib header (RFC 1950)
const compressed = zlib.deflateSync('data');
const decompressed = zlib.inflateSync(compressed);

// Raw deflate, no header (RFC 1951)
const rawCompressed = zlib.deflateRawSync('data');
const rawDecompressed = zlib.inflateRawSync(rawCompressed);
```

### Brotli (Better Compression)

```javascript
// Brotli compression (Node.js 11.7+)
const compressed = zlib.brotliCompressSync('Hello World');
const decompressed = zlib.brotliDecompressSync(compressed);

// Async
zlib.brotliCompress('data', (err, result) => {
  console.log('Brotli compressed:', result);
});
```

---

## 19.3 Stream-Based Compression

### Gzip Streams

```javascript
const fs = require('fs');
const zlib = require('zlib');

// Compress file
const input = fs.createReadStream('file.txt');
const output = fs.createWriteStream('file.txt.gz');
const gzip = zlib.createGzip();

input.pipe(gzip).pipe(output);

// Decompress file
const compressedInput = fs.createReadStream('file.txt.gz');
const decompressedOutput = fs.createWriteStream('file.txt');
const gunzip = zlib.createGunzip();

compressedInput.pipe(gunzip).pipe(decompressedOutput);
```

### Using pipeline()

```javascript
const { pipeline } = require('stream/promises');
const fs = require('fs');
const zlib = require('zlib');

// Compress with proper error handling
await pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz')
);
console.log('Compression complete');

// Decompress
await pipeline(
  fs.createReadStream('input.txt.gz'),
  zlib.createGunzip(),
  fs.createWriteStream('output.txt')
);
console.log('Decompression complete');
```

### Transform Classes

```javascript
// Available transform streams
zlib.createGzip()           // Gzip compression
zlib.createGunzip()         // Gzip decompression
zlib.createDeflate()        // Deflate compression
zlib.createInflate()        // Deflate decompression
zlib.createDeflateRaw()     // Raw deflate
zlib.createInflateRaw()     // Raw inflate
zlib.createBrotliCompress() // Brotli compression
zlib.createBrotliDecompress() // Brotli decompression
```

---

## 19.4 Compression Options

### Gzip/Deflate Options

```javascript
const options = {
  level: zlib.constants.Z_BEST_COMPRESSION,  // 0-9, default 6
  memLevel: 8,        // 1-9, memory usage
  strategy: zlib.constants.Z_DEFAULT_STRATEGY,
  windowBits: 15,     // 8-15, or negative for raw
  chunkSize: 16 * 1024,  // Internal buffer size
  dictionary: buffer  // Preset dictionary
};

const gzip = zlib.createGzip(options);
const compressed = zlib.gzipSync(data, options);
```

### Compression Levels

```javascript
zlib.constants.Z_NO_COMPRESSION      // 0
zlib.constants.Z_BEST_SPEED          // 1
zlib.constants.Z_BEST_COMPRESSION    // 9
zlib.constants.Z_DEFAULT_COMPRESSION // 6

// Trade-off: speed vs size
const fast = zlib.gzipSync(data, { level: 1 });
const small = zlib.gzipSync(data, { level: 9 });
```

### Brotli Options

```javascript
const options = {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,  // 0-11
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 1024
  }
};

const compressed = zlib.brotliCompressSync(data, options);

// Quality levels
zlib.constants.BROTLI_MIN_QUALITY  // 0
zlib.constants.BROTLI_MAX_QUALITY  // 11
zlib.constants.BROTLI_DEFAULT_QUALITY  // 11
```

---

## 19.5 HTTP Compression

### Server with Compression

```javascript
const http = require('http');
const zlib = require('zlib');
const fs = require('fs');

const server = http.createServer((req, res) => {
  const raw = fs.createReadStream('large-file.html');
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  if (acceptEncoding.includes('br')) {
    // Brotli (best compression)
    res.writeHead(200, { 'Content-Encoding': 'br' });
    raw.pipe(zlib.createBrotliCompress()).pipe(res);
  } else if (acceptEncoding.includes('gzip')) {
    // Gzip
    res.writeHead(200, { 'Content-Encoding': 'gzip' });
    raw.pipe(zlib.createGzip()).pipe(res);
  } else if (acceptEncoding.includes('deflate')) {
    // Deflate
    res.writeHead(200, { 'Content-Encoding': 'deflate' });
    raw.pipe(zlib.createDeflate()).pipe(res);
  } else {
    // No compression
    res.writeHead(200);
    raw.pipe(res);
  }
});

server.listen(3000);
```

### Client with Decompression

```javascript
const http = require('http');
const zlib = require('zlib');

const options = {
  hostname: 'example.com',
  path: '/',
  headers: {
    'Accept-Encoding': 'gzip, deflate, br'
  }
};

http.get(options, res => {
  let stream = res;
  
  const encoding = res.headers['content-encoding'];
  
  switch (encoding) {
    case 'gzip':
      stream = res.pipe(zlib.createGunzip());
      break;
    case 'br':
      stream = res.pipe(zlib.createBrotliDecompress());
      break;
    case 'deflate':
      stream = res.pipe(zlib.createInflate());
      break;
  }
  
  let data = '';
  stream.on('data', chunk => data += chunk);
  stream.on('end', () => console.log(data));
});
```

---

## 19.6 Common Patterns

### Compress Buffer

```javascript
const { promisify } = require('util');
const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

async function compressBuffer(buffer) {
  return await gzip(buffer);
}

async function decompressBuffer(buffer) {
  return await gunzip(buffer);
}

// Usage
const data = Buffer.from('Hello World'.repeat(1000));
console.log('Original:', data.length);

const compressed = await compressBuffer(data);
console.log('Compressed:', compressed.length);

const decompressed = await decompressBuffer(compressed);
console.log('Decompressed:', decompressed.length);
```

### Compress JSON

```javascript
async function compressJSON(obj) {
  const json = JSON.stringify(obj);
  return await gzip(json);
}

async function decompressJSON(buffer) {
  const json = await gunzip(buffer);
  return JSON.parse(json.toString());
}

// Usage
const data = { users: Array(1000).fill({ name: 'User', active: true }) };
const compressed = await compressJSON(data);
const restored = await decompressJSON(compressed);
```

### Streaming Compression with Progress

```javascript
const fs = require('fs');
const zlib = require('zlib');

function compressWithProgress(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const stat = fs.statSync(inputPath);
    const totalSize = stat.size;
    let processedSize = 0;
    
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    const gzip = zlib.createGzip();
    
    input.on('data', chunk => {
      processedSize += chunk.length;
      const percent = ((processedSize / totalSize) * 100).toFixed(1);
      process.stdout.write(`\rCompressing: ${percent}%`);
    });
    
    input.on('error', reject);
    output.on('error', reject);
    gzip.on('error', reject);
    
    output.on('close', () => {
      console.log('\nDone!');
      const compressed = fs.statSync(outputPath);
      const ratio = ((1 - compressed.size / totalSize) * 100).toFixed(1);
      console.log(`Compression ratio: ${ratio}%`);
      resolve();
    });
    
    input.pipe(gzip).pipe(output);
  });
}

await compressWithProgress('large-file.txt', 'large-file.txt.gz');
```

### Compress Directory (tar.gz)

```javascript
const tar = require('tar');  // npm install tar
const fs = require('fs');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');

// Create tar.gz
async function createTarGz(sourceDir, outputFile) {
  await pipeline(
    tar.create({ cwd: sourceDir }, ['.']),
    zlib.createGzip(),
    fs.createWriteStream(outputFile)
  );
}

// Extract tar.gz
async function extractTarGz(inputFile, destDir) {
  await pipeline(
    fs.createReadStream(inputFile),
    zlib.createGunzip(),
    tar.extract({ cwd: destDir })
  );
}
```

---

## 19.7 Comparison of Algorithms

| Algorithm | Compression | Speed | Compatibility |
|-----------|-------------|-------|---------------|
| Gzip | Good | Fast | Universal |
| Deflate | Good | Fast | Universal |
| Brotli | Excellent | Slower | Modern browsers |

### Benchmark

```javascript
async function benchmark(data) {
  console.log('Original size:', data.length);
  
  // Gzip
  let start = Date.now();
  const gzipped = zlib.gzipSync(data);
  console.log(`Gzip: ${gzipped.length} bytes, ${Date.now() - start}ms`);
  
  // Deflate
  start = Date.now();
  const deflated = zlib.deflateSync(data);
  console.log(`Deflate: ${deflated.length} bytes, ${Date.now() - start}ms`);
  
  // Brotli
  start = Date.now();
  const brotlied = zlib.brotliCompressSync(data);
  console.log(`Brotli: ${brotlied.length} bytes, ${Date.now() - start}ms`);
}

const testData = Buffer.from('Hello World! '.repeat(10000));
benchmark(testData);
```

---

## 19.8 Error Handling

```javascript
// Async error handling
zlib.gunzip(invalidData, (err, result) => {
  if (err) {
    console.error('Decompression failed:', err.message);
    return;
  }
  console.log(result);
});

// Stream error handling
const gunzip = zlib.createGunzip();

gunzip.on('error', err => {
  console.error('Stream error:', err.message);
});

// Try-catch for sync
try {
  const result = zlib.gunzipSync(invalidData);
} catch (err) {
  console.error('Sync error:', err.message);
}

// Common errors
// Z_DATA_ERROR - Invalid compressed data
// Z_MEM_ERROR - Not enough memory
// Z_BUF_ERROR - Buffer error
```

---

## 19.9 Memory Management

### Flushing

```javascript
const gzip = zlib.createGzip();

// Write some data
gzip.write('partial data');

// Flush to ensure data is written
gzip.flush(zlib.constants.Z_SYNC_FLUSH, () => {
  console.log('Flushed');
});

// Flush types
zlib.constants.Z_NO_FLUSH      // Default, buffer until full
zlib.constants.Z_PARTIAL_FLUSH // Flush some
zlib.constants.Z_SYNC_FLUSH    // Flush all buffered
zlib.constants.Z_FULL_FLUSH    // Flush and reset state
zlib.constants.Z_FINISH        // Final flush
```

### Resetting Stream

```javascript
const deflate = zlib.createDeflate();

// After finishing one compression
deflate.reset();

// Can now reuse for another compression
```

---

## 19.10 Summary

| Method | Description |
|--------|-------------|
| `gzip()` / `gzipSync()` | Gzip compress |
| `gunzip()` / `gunzipSync()` | Gzip decompress |
| `deflate()` / `deflateSync()` | Deflate compress |
| `inflate()` / `inflateSync()` | Deflate decompress |
| `deflateRaw()` / `inflateRaw()` | Raw deflate (no header) |
| `brotliCompress()` | Brotli compress |
| `brotliDecompress()` | Brotli decompress |

| Stream | Description |
|--------|-------------|
| `createGzip()` | Gzip transform stream |
| `createGunzip()` | Gunzip transform stream |
| `createDeflate()` | Deflate transform stream |
| `createInflate()` | Inflate transform stream |
| `createBrotliCompress()` | Brotli compress stream |
| `createBrotliDecompress()` | Brotli decompress stream |

| Constant | Description |
|----------|-------------|
| `Z_BEST_SPEED` | Level 1 (fastest) |
| `Z_BEST_COMPRESSION` | Level 9 (smallest) |
| `Z_DEFAULT_COMPRESSION` | Level 6 (balanced) |

---

**End of Module 19: Compression (zlib)**

Next: **Module 20 — Advanced Core Modules** (Assert, Performance, Diagnostics)
