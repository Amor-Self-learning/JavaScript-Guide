# Module 3: File System (fs)

The `fs` module provides APIs to interact with the file system. This module covers synchronous, callback-based, and Promise-based methods for reading, writing, and managing files and directories.

---

## 3.1 Module Overview

### Importing fs

```javascript
// CommonJS
const fs = require('fs');
const fsPromises = require('fs/promises');  // Promise-based API

// ES Modules
import fs from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { readFileSync } from 'fs';
```

### Three API Styles

```javascript
// 1. Synchronous (blocks event loop)
const data = fs.readFileSync('file.txt', 'utf8');

// 2. Callback-based (traditional async)
fs.readFile('file.txt', 'utf8', (err, data) => {
  if (err) throw err;
  console.log(data);
});

// 3. Promise-based (modern async)
import { readFile } from 'fs/promises';
const data = await readFile('file.txt', 'utf8');
```

---

## 3.2 Reading Files

### readFile / readFileSync

```javascript
const fs = require('fs');

// Synchronous read
try {
  const data = fs.readFileSync('config.json', 'utf8');
  const config = JSON.parse(data);
  console.log(config);
} catch (err) {
  console.error('Error reading file:', err.message);
}

// Callback-based read
fs.readFile('config.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  const config = JSON.parse(data);
  console.log(config);
});

// Promise-based read
const { readFile } = require('fs/promises');

async function loadConfig() {
  try {
    const data = await readFile('config.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error:', err.message);
    throw err;
  }
}
```

### Encoding Options

```javascript
// Without encoding: returns Buffer
const buffer = fs.readFileSync('file.txt');
console.log(buffer);  // <Buffer 48 65 6c 6c 6f>

// With encoding: returns string
const text = fs.readFileSync('file.txt', 'utf8');
console.log(text);  // 'Hello'

// Common encodings
fs.readFileSync('file.txt', 'utf8');     // Most common
fs.readFileSync('file.txt', 'ascii');    // ASCII
fs.readFileSync('file.txt', 'base64');   // Base64
fs.readFileSync('file.txt', 'hex');      // Hexadecimal
fs.readFileSync('file.txt', 'latin1');   // ISO-8859-1
```

### Read Options Object

```javascript
const options = {
  encoding: 'utf8',
  flag: 'r'  // Read mode
};

const data = fs.readFileSync('file.txt', options);

// Flags:
// 'r'  - Read (default)
// 'r+' - Read and write
// 'w'  - Write (truncate or create)
// 'w+' - Read and write (truncate or create)
// 'a'  - Append (create if not exists)
// 'a+' - Read and append
// 'ax' - Append, fail if exists
```

### Reading Large Files with Streams

```javascript
// For large files, use streams instead of readFile
const readStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB chunks
});

readStream.on('data', (chunk) => {
  console.log(`Received ${chunk.length} bytes`);
});

readStream.on('end', () => {
  console.log('Finished reading');
});

readStream.on('error', (err) => {
  console.error('Error:', err.message);
});
```

---

## 3.3 Writing Files

### writeFile / writeFileSync

```javascript
const fs = require('fs');

// Synchronous write
try {
  fs.writeFileSync('output.txt', 'Hello, World!', 'utf8');
  console.log('File written');
} catch (err) {
  console.error('Error:', err.message);
}

// Callback-based write
fs.writeFile('output.txt', 'Hello, World!', 'utf8', (err) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }
  console.log('File written');
});

// Promise-based write
const { writeFile } = require('fs/promises');

async function saveData(filename, data) {
  try {
    await writeFile(filename, data, 'utf8');
    console.log('File saved');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
```

### Write Options

```javascript
const options = {
  encoding: 'utf8',
  flag: 'w',      // Write mode (default)
  mode: 0o644     // File permissions (Unix)
};

fs.writeFileSync('file.txt', 'content', options);

// Useful flags:
// 'w'  - Overwrite (create if not exists)
// 'wx' - Overwrite, fail if exists (exclusive)
// 'a'  - Append
// 'ax' - Append, fail if exists
```

### appendFile

```javascript
// Append to file (creates if not exists)
fs.appendFileSync('log.txt', 'New log entry\n');

// Callback version
fs.appendFile('log.txt', 'Entry\n', (err) => {
  if (err) throw err;
});

// Promise version
const { appendFile } = require('fs/promises');
await appendFile('log.txt', 'Entry\n');

// Append with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync('app.log', `[${timestamp}] ${message}\n`);
}
```

### Writing JSON

```javascript
const data = {
  name: 'John',
  age: 30,
  active: true
};

// Write JSON (pretty-printed)
fs.writeFileSync(
  'data.json',
  JSON.stringify(data, null, 2),
  'utf8'
);

// Read and update JSON
async function updateJson(file, updates) {
  const content = await readFile(file, 'utf8');
  const data = JSON.parse(content);
  Object.assign(data, updates);
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}
```

### Writing with Streams

```javascript
// For large data, use streams
const writeStream = fs.createWriteStream('large-output.txt');

writeStream.write('First chunk\n');
writeStream.write('Second chunk\n');
writeStream.end('Final chunk\n');

writeStream.on('finish', () => {
  console.log('All data written');
});

writeStream.on('error', (err) => {
  console.error('Error:', err.message);
});

// Pipe from readable to writable
const readStream = fs.createReadStream('input.txt');
readStream.pipe(writeStream);
```

---

## 3.4 Directory Operations

### Creating Directories

```javascript
// mkdir - create directory
fs.mkdirSync('new-folder');

// Create nested directories (recursive)
fs.mkdirSync('path/to/nested/folder', { recursive: true });

// Callback version
fs.mkdir('folder', { recursive: true }, (err) => {
  if (err) throw err;
  console.log('Directory created');
});

// Promise version
const { mkdir } = require('fs/promises');
await mkdir('folder', { recursive: true });
```

### Reading Directories

```javascript
// readdir - list directory contents
const files = fs.readdirSync('.');
console.log(files);  // ['file1.txt', 'folder', 'file2.js']

// With file types
const entries = fs.readdirSync('.', { withFileTypes: true });
entries.forEach(entry => {
  if (entry.isDirectory()) {
    console.log(`Directory: ${entry.name}`);
  } else if (entry.isFile()) {
    console.log(`File: ${entry.name}`);
  }
});

// Callback version
fs.readdir('.', (err, files) => {
  if (err) throw err;
  console.log(files);
});

// Promise version
const { readdir } = require('fs/promises');
const files = await readdir('.', { withFileTypes: true });
```

### Recursive Directory Reading

```javascript
const path = require('path');

// Get all files recursively (Node 18+)
const files = fs.readdirSync('.', { recursive: true });

// Manual recursive function
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log(getAllFiles('./src'));
```

### Removing Directories

```javascript
// rmdir - remove empty directory
fs.rmdirSync('empty-folder');

// rm - remove directory with contents (Node 14.14+)
fs.rmSync('folder-with-files', { recursive: true, force: true });

// Promise version
const { rm } = require('fs/promises');
await rm('folder', { recursive: true, force: true });

// Older alternative: rimraf pattern
function deleteFolderRecursive(dir) {
  if (fs.existsSync(dir)) {
    fs.readdirSync(dir).forEach(file => {
      const curPath = path.join(dir, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
}
```

---

## 3.5 File Stats and Metadata

### stat / lstat

```javascript
// Get file/directory information
const stats = fs.statSync('file.txt');

console.log({
  size: stats.size,           // Size in bytes
  isFile: stats.isFile(),     // true if file
  isDirectory: stats.isDirectory(),  // true if directory
  isSymbolicLink: stats.isSymbolicLink(),
  created: stats.birthtime,   // Creation time
  modified: stats.mtime,      // Last modified
  accessed: stats.atime,      // Last accessed
  changed: stats.ctime,       // Last status change
  mode: stats.mode,           // Permissions
  uid: stats.uid,             // Owner user ID
  gid: stats.gid              // Owner group ID
});

// lstat - doesn't follow symlinks
const linkStats = fs.lstatSync('symlink');
console.log(linkStats.isSymbolicLink());  // true
```

### Check File Existence

```javascript
// Modern way: use access()
const { access, constants } = require('fs/promises');

async function fileExists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Check permissions
async function isReadable(path) {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

// Sync version
function existsSync(path) {
  try {
    fs.accessSync(path);
    return true;
  } catch {
    return false;
  }
}

// Or use fs.existsSync (deprecated but still works)
if (fs.existsSync('file.txt')) {
  console.log('File exists');
}
```

---

## 3.6 File Operations

### Copy Files

```javascript
// copyFile (Node 8.5+)
fs.copyFileSync('source.txt', 'destination.txt');

// With flags
const { COPYFILE_EXCL } = fs.constants;
fs.copyFileSync('source.txt', 'dest.txt', COPYFILE_EXCL);  // Fail if exists

// Promise version
const { copyFile } = require('fs/promises');
await copyFile('source.txt', 'destination.txt');

// Copy directory (Node 16.7+)
fs.cpSync('src-folder', 'dest-folder', { recursive: true });

// Promise version
const { cp } = require('fs/promises');
await cp('src', 'dest', { recursive: true });
```

### Rename / Move Files

```javascript
// rename works for both rename and move
fs.renameSync('old-name.txt', 'new-name.txt');
fs.renameSync('file.txt', 'subfolder/file.txt');  // Move

// Promise version
const { rename } = require('fs/promises');
await rename('old.txt', 'new.txt');
```

### Delete Files

```javascript
// unlink - delete file
fs.unlinkSync('file.txt');

// rm - delete file or directory
fs.rmSync('file.txt');
fs.rmSync('folder', { recursive: true });

// Promise versions
const { unlink, rm } = require('fs/promises');
await unlink('file.txt');
await rm('folder', { recursive: true, force: true });
```

### Symbolic Links

```javascript
// Create symbolic link
fs.symlinkSync('target.txt', 'link.txt');

// Read link target
const target = fs.readlinkSync('link.txt');
console.log(target);  // 'target.txt'

// Create hard link
fs.linkSync('target.txt', 'hardlink.txt');
```

---

## 3.7 Watching Files

### fs.watch

```javascript
// Watch file or directory for changes
const watcher = fs.watch('file.txt', (eventType, filename) => {
  console.log(`Event: ${eventType}, File: ${filename}`);
});

// Watch directory
fs.watch('./src', { recursive: true }, (event, filename) => {
  console.log(`${filename} changed`);
});

// Stop watching
watcher.close();

// With error handling
const watcher = fs.watch('file.txt');
watcher.on('change', (event, filename) => {
  console.log(`${event}: ${filename}`);
});
watcher.on('error', (err) => {
  console.error('Watch error:', err);
});
```

### fs.watchFile (Polling)

```javascript
// Uses polling (less efficient but more reliable)
fs.watchFile('file.txt', { interval: 1000 }, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    console.log('File modified');
  }
});

// Stop watching
fs.unwatchFile('file.txt');
```

### Practical Watcher

```javascript
// Debounced file watcher
function watchFile(filepath, callback, debounceMs = 100) {
  let timeout;
  
  const watcher = fs.watch(filepath, (event) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback(event);
    }, debounceMs);
  });
  
  return () => watcher.close();
}

const stop = watchFile('config.json', (event) => {
  console.log('Config changed, reloading...');
  reloadConfig();
});

// Later: stop watching
stop();
```

---

## 3.8 fs.promises API

### Using Promises

```javascript
const fs = require('fs/promises');

// All methods return Promises
async function fileOperations() {
  // Read
  const content = await fs.readFile('input.txt', 'utf8');
  
  // Write
  await fs.writeFile('output.txt', content.toUpperCase());
  
  // Append
  await fs.appendFile('log.txt', 'Entry\n');
  
  // Stats
  const stats = await fs.stat('file.txt');
  
  // Directory operations
  await fs.mkdir('new-folder', { recursive: true });
  const files = await fs.readdir('.');
  await fs.rm('folder', { recursive: true });
  
  // File operations
  await fs.copyFile('src.txt', 'dest.txt');
  await fs.rename('old.txt', 'new.txt');
  await fs.unlink('file.txt');
}

// Error handling
async function safeRead(file) {
  try {
    return await fs.readFile(file, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return null;  // File doesn't exist
    }
    throw err;
  }
}
```

### FileHandle API

```javascript
const fs = require('fs/promises');

// Open file and get handle (like file descriptors)
async function useFileHandle() {
  const handle = await fs.open('file.txt', 'r+');
  
  try {
    // Read using handle
    const buffer = Buffer.alloc(1024);
    const { bytesRead } = await handle.read(buffer, 0, 1024, 0);
    
    // Write using handle
    await handle.write('New content', 0);
    
    // Get stats
    const stats = await handle.stat();
    
    // Truncate
    await handle.truncate(100);
    
    // Sync to disk
    await handle.sync();
    
  } finally {
    // Always close the handle
    await handle.close();
  }
}

// Shorter: read entire file
async function readWithHandle() {
  const handle = await fs.open('file.txt', 'r');
  try {
    return await handle.readFile('utf8');
  } finally {
    await handle.close();
  }
}
```

---

## 3.9 Common Patterns

### Read JSON File

```javascript
async function readJSON(filepath) {
  const content = await fs.readFile(filepath, 'utf8');
  return JSON.parse(content);
}

// With error handling
async function safeReadJSON(filepath, defaultValue = null) {
  try {
    const content = await fs.readFile(filepath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return defaultValue;
    }
    throw err;
  }
}
```

### Write JSON Atomically

```javascript
const path = require('path');

// Atomic write prevents corruption on crash
async function writeJSONAtomic(filepath, data) {
  const tempPath = `${filepath}.${process.pid}.tmp`;
  
  try {
    await fs.writeFile(
      tempPath,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    await fs.rename(tempPath, filepath);
  } catch (err) {
    // Clean up temp file on error
    try {
      await fs.unlink(tempPath);
    } catch {}
    throw err;
  }
}
```

### Ensure Directory Exists

```javascript
async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

// Write file with directory creation
async function writeFileSafe(filepath, content) {
  await ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, content);
}
```

---

## 3.10 Gotchas

```javascript
// ❌ Using sync methods in server
app.get('/file', (req, res) => {
  const data = fs.readFileSync('file.txt');  // Blocks all requests!
  res.send(data);
});

// ✅ Use async methods
app.get('/file', async (req, res) => {
  const data = await fs.readFile('file.txt');
  res.send(data);
});

// ❌ Not handling errors
fs.readFile('file.txt', (err, data) => {
  console.log(data);  // May be undefined if error!
});

// ✅ Always handle errors
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});

// ❌ Race condition with exists + read
if (fs.existsSync('file.txt')) {
  const data = fs.readFileSync('file.txt');  // File may be deleted!
}

// ✅ Just try to read and handle error
try {
  const data = fs.readFileSync('file.txt');
} catch (err) {
  if (err.code === 'ENOENT') {
    console.log('File not found');
  }
}
```

---

## 3.11 Summary

| Operation | Sync | Callback | Promise |
|-----------|------|----------|---------|
| Read file | `readFileSync` | `readFile` | `fs.promises.readFile` |
| Write file | `writeFileSync` | `writeFile` | `fs.promises.writeFile` |
| Append | `appendFileSync` | `appendFile` | `fs.promises.appendFile` |
| Delete file | `unlinkSync` | `unlink` | `fs.promises.unlink` |
| Copy | `copyFileSync` | `copyFile` | `fs.promises.copyFile` |
| Rename/Move | `renameSync` | `rename` | `fs.promises.rename` |
| Make dir | `mkdirSync` | `mkdir` | `fs.promises.mkdir` |
| Read dir | `readdirSync` | `readdir` | `fs.promises.readdir` |
| Remove dir | `rmSync` | `rm` | `fs.promises.rm` |
| File stats | `statSync` | `stat` | `fs.promises.stat` |

| Error Code | Meaning |
|------------|---------|
| `ENOENT` | File/directory not found |
| `EEXIST` | File/directory already exists |
| `EACCES` | Permission denied |
| `EISDIR` | Expected file, got directory |
| `ENOTDIR` | Expected directory, got file |
| `ENOTEMPTY` | Directory not empty |

---

**End of Module 3: File System (fs)**

Next: **Module 4 — Path** (Path manipulation and resolution)
