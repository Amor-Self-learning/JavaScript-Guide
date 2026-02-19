# Module 7: Streams

Streams are one of Node.js's most powerful features. They allow you to process data piece by piece, without loading everything into memory. This is essential for handling large files, network data, and real-time processing.

---

## 7.1 Module Import

```javascript
// CommonJS
const stream = require('stream');
const { Readable, Writable, Transform, Duplex, pipeline, finished } = require('stream');

// ES Modules
import stream from 'stream';
import { Readable, Writable, Transform, pipeline } from 'stream';

// Promisified versions
const { pipeline, finished } = require('stream/promises');
```

---

## 7.2 Stream Types

Node.js has four types of streams:

| Type | Description | Examples |
|------|-------------|----------|
| Readable | Source of data | `fs.createReadStream`, `http.IncomingMessage`, `process.stdin` |
| Writable | Destination for data | `fs.createWriteStream`, `http.ServerResponse`, `process.stdout` |
| Duplex | Both readable and writable | `net.Socket`, TCP connections |
| Transform | Duplex that modifies data | `zlib.createGzip`, `crypto.createCipher` |

---

## 7.3 Readable Streams

### Consuming Readable Streams

#### 'data' Event (Flowing Mode)

```javascript
const fs = require('fs');

const readable = fs.createReadStream('large-file.txt');

readable.on('data', chunk => {
  console.log(`Received ${chunk.length} bytes`);
});

readable.on('end', () => {
  console.log('No more data');
});

readable.on('error', err => {
  console.error('Error:', err.message);
});
```

#### read() Method (Paused Mode)

```javascript
const readable = fs.createReadStream('file.txt');

readable.on('readable', () => {
  let chunk;
  while ((chunk = readable.read()) !== null) {
    console.log(`Read ${chunk.length} bytes`);
  }
});
```

#### Async Iteration (Modern Approach)

```javascript
const fs = require('fs');

async function processFile() {
  const readable = fs.createReadStream('file.txt', { encoding: 'utf8' });
  
  for await (const chunk of readable) {
    console.log(chunk);
  }
}
```

### Creating Custom Readable

```javascript
const { Readable } = require('stream');

// Simple implementation
const readable = new Readable({
  read(size) {
    this.push('Hello ');
    this.push('World!');
    this.push(null);  // Signal end
  }
});

readable.on('data', chunk => console.log(chunk.toString()));
// Hello World!
```

### Readable from Array

```javascript
const { Readable } = require('stream');

function readableFromArray(array) {
  let index = 0;
  return new Readable({
    objectMode: true,
    read() {
      if (index < array.length) {
        this.push(array[index++]);
      } else {
        this.push(null);
      }
    }
  });
}

const stream = readableFromArray([1, 2, 3, 4, 5]);
stream.on('data', num => console.log(num));
// 1, 2, 3, 4, 5
```

### Readable from Async Generator

```javascript
const { Readable } = require('stream');

async function* generateNumbers() {
  for (let i = 1; i <= 5; i++) {
    await new Promise(r => setTimeout(r, 100));
    yield i;
  }
}

const stream = Readable.from(generateNumbers());

for await (const num of stream) {
  console.log(num);
}
```

---

## 7.4 Writable Streams

### Writing to Writable Streams

```javascript
const fs = require('fs');

const writable = fs.createWriteStream('output.txt');

writable.write('Hello\n');
writable.write('World\n');
writable.end('Goodbye\n');  // Final write and close

writable.on('finish', () => {
  console.log('All data written');
});

writable.on('error', err => {
  console.error('Write error:', err.message);
});
```

### Handling Backpressure

```javascript
const writable = fs.createWriteStream('output.txt');

function writeData(data) {
  // write() returns false if internal buffer is full
  const canContinue = writable.write(data);
  
  if (!canContinue) {
    console.log('Backpressure! Waiting for drain...');
    writable.once('drain', () => {
      console.log('Drained, continuing...');
    });
  }
}

// Properly handle backpressure
async function writeAll(dataArray) {
  for (const data of dataArray) {
    const ok = writable.write(data);
    if (!ok) {
      await new Promise(resolve => writable.once('drain', resolve));
    }
  }
  writable.end();
}
```

### Creating Custom Writable

```javascript
const { Writable } = require('stream');

const writable = new Writable({
  write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    // Call callback when done (with error if any)
    callback();
  }
});

writable.write('Hello');
writable.write('World');
writable.end();
```

### Object Mode Writable

```javascript
const { Writable } = require('stream');

const writable = new Writable({
  objectMode: true,
  write(object, encoding, callback) {
    console.log('Object:', JSON.stringify(object));
    callback();
  }
});

writable.write({ name: 'Alice' });
writable.write({ name: 'Bob' });
writable.end();
```

---

## 7.5 Transform Streams

Transform streams modify data as it passes through.

### Creating Transform Stream

```javascript
const { Transform } = require('stream');

const uppercase = new Transform({
  transform(chunk, encoding, callback) {
    // Push transformed data
    this.push(chunk.toString().toUpperCase());
    callback();
  }
});

process.stdin.pipe(uppercase).pipe(process.stdout);
// Input: hello
// Output: HELLO
```

### JSON Line Parser

```javascript
const { Transform } = require('stream');

const jsonParser = new Transform({
  objectMode: true,
  transform(chunk, encoding, callback) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) {
        try {
          this.push(JSON.parse(line));
        } catch (e) {
          return callback(new Error(`Invalid JSON: ${line}`));
        }
      }
    }
    callback();
  }
});
```

### Chunked Data Aggregator

```javascript
const { Transform } = require('stream');

function createLineStream() {
  let buffer = '';
  
  return new Transform({
    transform(chunk, encoding, callback) {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();  // Keep incomplete line
      
      for (const line of lines) {
        this.push(line + '\n');
      }
      callback();
    },
    flush(callback) {
      // Handle remaining data
      if (buffer) {
        this.push(buffer);
      }
      callback();
    }
  });
}
```

---

## 7.6 Duplex Streams

Duplex streams are both readable and writable (independently).

```javascript
const { Duplex } = require('stream');

const duplex = new Duplex({
  read(size) {
    this.push('data from read\n');
    this.push(null);
  },
  write(chunk, encoding, callback) {
    console.log('Received:', chunk.toString());
    callback();
  }
});

duplex.on('data', chunk => console.log('Read:', chunk.toString()));
duplex.write('Hello');
duplex.end();
```

### PassThrough Stream

A special Transform that passes data through unchanged:

```javascript
const { PassThrough } = require('stream');

const pass = new PassThrough();

// Useful for monitoring or tapping streams
let bytes = 0;
pass.on('data', chunk => {
  bytes += chunk.length;
});
pass.on('end', () => {
  console.log(`Total bytes: ${bytes}`);
});

fs.createReadStream('file.txt').pipe(pass).pipe(fs.createWriteStream('copy.txt'));
```

---

## 7.7 Piping Streams

### Basic pipe()

```javascript
const fs = require('fs');

// Copy file
fs.createReadStream('source.txt')
  .pipe(fs.createWriteStream('dest.txt'));
```

### Chain of Pipes

```javascript
const zlib = require('zlib');

// Compress file
fs.createReadStream('file.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('file.txt.gz'));

// Decompress file
fs.createReadStream('file.txt.gz')
  .pipe(zlib.createGunzip())
  .pipe(fs.createWriteStream('file.txt'));
```

### pipe() with Error Handling

```javascript
const source = fs.createReadStream('source.txt');
const dest = fs.createWriteStream('dest.txt');

source.pipe(dest);

// ❌ Error in source doesn't close dest
source.on('error', err => {
  console.error('Read error:', err);
  dest.close();
});

dest.on('error', err => {
  console.error('Write error:', err);
});
```

---

## 7.8 stream.pipeline()

Modern approach with proper error handling and cleanup:

```javascript
const { pipeline } = require('stream');
const { promisify } = require('util');
const pipelineAsync = promisify(pipeline);

// Callback version
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('input.txt.gz'),
  err => {
    if (err) {
      console.error('Pipeline failed:', err);
    } else {
      console.log('Pipeline succeeded');
    }
  }
);

// Promise version
const { pipeline } = require('stream/promises');

async function compressFile(input, output) {
  try {
    await pipeline(
      fs.createReadStream(input),
      zlib.createGzip(),
      fs.createWriteStream(output)
    );
    console.log('Compression complete');
  } catch (err) {
    console.error('Compression failed:', err);
  }
}
```

### Pipeline with Abort

```javascript
const { pipeline } = require('stream/promises');

const controller = new AbortController();

// Abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  await pipeline(
    fs.createReadStream('large-file.txt'),
    transform,
    fs.createWriteStream('output.txt'),
    { signal: controller.signal }
  );
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Pipeline aborted');
  }
}
```

---

## 7.9 stream.finished()

Wait for stream to finish or error:

```javascript
const { finished } = require('stream/promises');

const readable = fs.createReadStream('file.txt');

readable.on('data', chunk => {
  console.log(chunk);
});

try {
  await finished(readable);
  console.log('Stream finished');
} catch (err) {
  console.error('Stream error:', err);
}
```

---

## 7.10 Readable.toWeb() / from()

Convert between Node.js streams and Web Streams:

```javascript
const { Readable } = require('stream');

// Node stream to Web ReadableStream
const nodeStream = fs.createReadStream('file.txt');
const webStream = Readable.toWeb(nodeStream);

// Web ReadableStream to Node stream
const nodeStream2 = Readable.fromWeb(webStream);
```

---

## 7.11 Common Patterns

### Process Large File Line by Line

```javascript
const readline = require('readline');

async function processLines(filePath) {
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  
  for await (const line of rl) {
    console.log(`Line: ${line}`);
  }
}
```

### Stream to String

```javascript
async function streamToString(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString();
}

const content = await streamToString(fs.createReadStream('file.txt'));
```

### Stream to Buffer

```javascript
async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
```

### Progress Tracking

```javascript
const { Transform } = require('stream');

function createProgressStream(totalSize) {
  let transferred = 0;
  
  return new Transform({
    transform(chunk, encoding, callback) {
      transferred += chunk.length;
      const percent = ((transferred / totalSize) * 100).toFixed(1);
      process.stdout.write(`\rProgress: ${percent}%`);
      this.push(chunk);
      callback();
    },
    flush(callback) {
      console.log('\nComplete!');
      callback();
    }
  });
}

const stat = fs.statSync('large-file.txt');
fs.createReadStream('large-file.txt')
  .pipe(createProgressStream(stat.size))
  .pipe(fs.createWriteStream('copy.txt'));
```

### Rate Limiting Stream

```javascript
const { Transform } = require('stream');

function createThrottle(bytesPerSecond) {
  let lastTime = Date.now();
  let bytesSent = 0;
  
  return new Transform({
    async transform(chunk, encoding, callback) {
      bytesSent += chunk.length;
      const elapsed = (Date.now() - lastTime) / 1000;
      const rate = bytesSent / elapsed;
      
      if (rate > bytesPerSecond) {
        const delay = (bytesSent / bytesPerSecond - elapsed) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
      
      this.push(chunk);
      callback();
    }
  });
}

// Limit to 1MB/s
fs.createReadStream('file.txt')
  .pipe(createThrottle(1024 * 1024))
  .pipe(fs.createWriteStream('output.txt'));
```

---

## 7.12 HTTP Streaming

### Stream Response

```javascript
http.createServer((req, res) => {
  const filePath = './large-video.mp4';
  const stat = fs.statSync(filePath);
  
  res.writeHead(200, {
    'Content-Type': 'video/mp4',
    'Content-Length': stat.size
  });
  
  fs.createReadStream(filePath).pipe(res);
}).listen(3000);
```

### Range Requests (Video Seeking)

```javascript
http.createServer((req, res) => {
  const filePath = './video.mp4';
  const stat = fs.statSync(filePath);
  const range = req.headers.range;
  
  if (range) {
    const [start, end] = range.replace(/bytes=/, '').split('-');
    const startByte = parseInt(start, 10);
    const endByte = end ? parseInt(end, 10) : stat.size - 1;
    const chunkSize = endByte - startByte + 1;
    
    res.writeHead(206, {
      'Content-Range': `bytes ${startByte}-${endByte}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'video/mp4'
    });
    
    fs.createReadStream(filePath, { start: startByte, end: endByte }).pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': stat.size,
      'Content-Type': 'video/mp4'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}).listen(3000);
```

---

## 7.13 Common Gotchas

### Not Handling Errors in Pipe Chain

```javascript
// ❌ Errors in middle streams not caught
source.pipe(transform).pipe(dest);

// ✅ Use pipeline
const { pipeline } = require('stream/promises');
await pipeline(source, transform, dest);
```

### Ignoring Backpressure

```javascript
// ❌ Can cause memory issues
for (const item of largeArray) {
  writable.write(JSON.stringify(item));
}

// ✅ Respect backpressure
for (const item of largeArray) {
  const ok = writable.write(JSON.stringify(item));
  if (!ok) {
    await new Promise(r => writable.once('drain', r));
  }
}
```

### Destroying Streams Properly

```javascript
// ❌ Just setting to null
stream = null;

// ✅ Destroy the stream
stream.destroy();

// With error
stream.destroy(new Error('Connection lost'));
```

### Forgetting Object Mode

```javascript
// ❌ Trying to push object without objectMode
const readable = new Readable({
  read() {
    this.push({ id: 1 });  // Error: Invalid data type
  }
});

// ✅ Enable object mode
const readable = new Readable({
  objectMode: true,
  read() {
    this.push({ id: 1 });  // Works!
  }
});
```

---

## 7.14 Summary

| Stream Type | Direction | Methods |
|-------------|-----------|---------|
| Readable | Data source | `read()`, `pipe()`, `on('data')` |
| Writable | Data destination | `write()`, `end()` |
| Transform | Modify passing data | `transform()`, `flush()` |
| Duplex | Both directions | All of the above |

| Utility | Purpose |
|---------|---------|
| `pipeline()` | Chain streams with error handling |
| `finished()` | Wait for stream completion |
| `Readable.from()` | Create stream from iterable |

| Event | Description |
|-------|-------------|
| `data` | Chunk available |
| `end` | No more data |
| `drain` | Writable buffer empty |
| `finish` | Writable completed |
| `error` | Error occurred |

---

**End of Module 7: Streams**

Next: **Module 8 — Buffer** (Binary data handling)
