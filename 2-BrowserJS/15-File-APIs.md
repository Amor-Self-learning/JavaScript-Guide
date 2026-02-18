# 15.1 File API

The File API provides access to file information and content selected by users through file inputs or drag-and-drop. This chapter covers File objects, FileList, and file metadata.

---

## 15.1.1 File Input

### Basic File Selection

```html
<input type="file" id="fileInput">
<input type="file" id="multiInput" multiple>
```

```javascript
const input = document.getElementById('fileInput');

input.addEventListener('change', (event) => {
  const file = event.target.files[0];
  
  if (file) {
    console.log('Name:', file.name);
    console.log('Size:', file.size, 'bytes');
    console.log('Type:', file.type);
    console.log('Last Modified:', new Date(file.lastModified));
  }
});
```

### Multiple Files

```javascript
const multiInput = document.getElementById('multiInput');

multiInput.addEventListener('change', (event) => {
  const files = event.target.files;  // FileList
  
  for (const file of files) {
    console.log(file.name);
  }
  
  // Or convert to array
  const fileArray = Array.from(files);
  fileArray.forEach(file => processFile(file));
});
```

---

## 15.1.2 File Object Properties

### Available Properties

```javascript
const file = input.files[0];

file.name;          // String - filename with extension
file.size;          // Number - size in bytes
file.type;          // String - MIME type (e.g., 'image/png')
file.lastModified;  // Number - timestamp
file.webkitRelativePath;  // String - path (for directories)
```

### Checking File Type

```javascript
function isImage(file) {
  return file.type.startsWith('image/');
}

function isPDF(file) {
  return file.type === 'application/pdf';
}

function isValidType(file, allowedTypes) {
  return allowedTypes.includes(file.type);
}

// Usage
if (isImage(file)) {
  displayImage(file);
}
```

### File Size Validation

```javascript
const MAX_SIZE = 5 * 1024 * 1024;  // 5MB

function validateFileSize(file, maxSize = MAX_SIZE) {
  if (file.size > maxSize) {
    throw new Error(`File too large. Max size: ${formatBytes(maxSize)}`);
  }
  return true;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
```

---

## 15.1.3 FileList

### Working with FileList

```javascript
const files = input.files;  // FileList object

// Properties
files.length;  // Number of files

// Access by index
const firstFile = files[0];
const secondFile = files[1];

// Iterate
for (let i = 0; i < files.length; i++) {
  console.log(files[i].name);
}

// ❌ FileList is not an array
files.forEach(f => {});  // Error!

// ✅ Convert to array
Array.from(files).forEach(f => console.log(f.name));
[...files].forEach(f => console.log(f.name));
```

### Filter Files

```javascript
function filterImageFiles(fileList) {
  return Array.from(fileList).filter(file => 
    file.type.startsWith('image/')
  );
}

function filterByExtension(fileList, extensions) {
  return Array.from(fileList).filter(file => {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    return extensions.includes(ext);
  });
}

// Usage
const images = filterImageFiles(input.files);
const docs = filterByExtension(input.files, ['.pdf', '.doc', '.docx']);
```

---

## 15.1.4 Accept Attribute

### Restrict File Types

```html
<!-- Accept specific MIME types -->
<input type="file" accept="image/png, image/jpeg">

<!-- Accept by extension -->
<input type="file" accept=".pdf,.doc,.docx">

<!-- Accept categories -->
<input type="file" accept="image/*">
<input type="file" accept="audio/*">
<input type="file" accept="video/*">

<!-- Combine -->
<input type="file" accept="image/*,.pdf">
```

### Programmatic Accept

```javascript
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.click();
```

---

## 15.1.5 Directory Selection

### webkitdirectory

```html
<input type="file" webkitdirectory>
```

```javascript
input.addEventListener('change', (event) => {
  const files = event.target.files;
  
  for (const file of files) {
    console.log('Path:', file.webkitRelativePath);
    console.log('Name:', file.name);
  }
});
```

---

## 15.1.6 Programmatic File Selection

### Create File Input

```javascript
function selectFile(accept = '*') {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    
    input.addEventListener('change', () => {
      if (input.files.length > 0) {
        resolve(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
    });
    
    input.addEventListener('cancel', () => {
      reject(new Error('Selection cancelled'));
    });
    
    input.click();
  });
}

// Usage
try {
  const file = await selectFile('image/*');
  console.log('Selected:', file.name);
} catch (error) {
  console.log('Cancelled');
}
```

### Select Multiple Files

```javascript
function selectFiles(accept = '*') {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = true;
    
    input.addEventListener('change', () => {
      resolve(Array.from(input.files));
    });
    
    input.click();
  });
}
```

---

## 15.1.7 File Validation

### Comprehensive Validator

```javascript
class FileValidator {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024;  // 10MB
    this.allowedTypes = options.allowedTypes || [];
    this.allowedExtensions = options.allowedExtensions || [];
  }
  
  validate(file) {
    const errors = [];
    
    // Size check
    if (file.size > this.maxSize) {
      errors.push(`File too large (${formatBytes(file.size)}). Max: ${formatBytes(this.maxSize)}`);
    }
    
    // Type check
    if (this.allowedTypes.length > 0 && !this.allowedTypes.includes(file.type)) {
      errors.push(`Invalid file type: ${file.type}`);
    }
    
    // Extension check
    if (this.allowedExtensions.length > 0) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!this.allowedExtensions.includes(ext)) {
        errors.push(`Invalid extension: ${ext}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  validateAll(files) {
    return Array.from(files).map(file => ({
      file,
      ...this.validate(file)
    }));
  }
}

// Usage
const validator = new FileValidator({
  maxSize: 5 * 1024 * 1024,
  allowedTypes: ['image/jpeg', 'image/png'],
  allowedExtensions: ['.jpg', '.jpeg', '.png']
});

const result = validator.validate(file);
if (!result.valid) {
  console.log('Errors:', result.errors);
}
```

---

## 15.1.8 Summary

### File Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Filename |
| `size` | Number | Size in bytes |
| `type` | String | MIME type |
| `lastModified` | Number | Timestamp |
| `webkitRelativePath` | String | Directory path |

### FileList Methods

| Method/Property | Description |
|----------------|-------------|
| `length` | Number of files |
| `[index]` | Access by index |
| `item(index)` | Access by index |

### Input Attributes

| Attribute | Purpose |
|-----------|---------|
| `accept` | Filter file types |
| `multiple` | Allow multiple files |
| `webkitdirectory` | Select directory |

### Best Practices

1. **Validate file type** on both client and server
2. **Check file size** before upload
3. **Convert FileList** to array for array methods
4. **Use accept** to guide users
5. **Provide feedback** on invalid files
6. **Handle cancel** gracefully

---

**End of Chapter 15.1: File API**

Next chapter: **15.2 FileReader** — reading file contents.
# 15.2 FileReader

FileReader provides asynchronous methods to read the contents of files or blobs. This chapter covers reading files as text, data URLs, and binary data.

---

## 15.2.1 Basic Usage

### Create FileReader

```javascript
const reader = new FileReader();

reader.addEventListener('load', (event) => {
  console.log('Result:', event.target.result);
});

reader.addEventListener('error', (event) => {
  console.error('Error:', event.target.error);
});

// Start reading
reader.readAsText(file);
```

---

## 15.2.2 Reading Methods

### readAsText

```javascript
const reader = new FileReader();

reader.onload = () => {
  const text = reader.result;
  console.log('Content:', text);
};

reader.readAsText(file);
reader.readAsText(file, 'UTF-8');  // With encoding
```

### readAsDataURL

```javascript
// For images, PDFs, etc.
const reader = new FileReader();

reader.onload = () => {
  const dataUrl = reader.result;
  // Example: "data:image/png;base64,iVBORw0KGgoAAAA..."
  
  const img = new Image();
  img.src = dataUrl;
  document.body.appendChild(img);
};

reader.readAsDataURL(imageFile);
```

### readAsArrayBuffer

```javascript
// For binary processing
const reader = new FileReader();

reader.onload = () => {
  const buffer = reader.result;  // ArrayBuffer
  const view = new Uint8Array(buffer);
  
  console.log('First byte:', view[0]);
  console.log('Size:', buffer.byteLength);
};

reader.readAsArrayBuffer(file);
```

### readAsBinaryString (Deprecated)

```javascript
// ❌ Deprecated - use readAsArrayBuffer instead
reader.readAsBinaryString(file);
```

---

## 15.2.3 Events

### All Events

```javascript
const reader = new FileReader();

// Reading started
reader.addEventListener('loadstart', () => {
  console.log('Started');
});

// Reading in progress
reader.addEventListener('progress', (event) => {
  if (event.lengthComputable) {
    const percent = (event.loaded / event.total) * 100;
    console.log(`Progress: ${percent.toFixed(2)}%`);
  }
});

// Reading complete
reader.addEventListener('load', () => {
  console.log('Complete');
});

// Reading aborted
reader.addEventListener('abort', () => {
  console.log('Aborted');
});

// Error occurred
reader.addEventListener('error', () => {
  console.error('Error:', reader.error);
});

// Reading finished (success, error, or abort)
reader.addEventListener('loadend', () => {
  console.log('Finished');
});
```

---

## 15.2.4 Properties

### State and Result

```javascript
const reader = new FileReader();

// State
reader.readyState;
// 0 = EMPTY (no data loaded)
// 1 = LOADING (reading in progress)
// 2 = DONE (reading complete)

// Result (after load)
reader.result;  // String, ArrayBuffer, or Data URL

// Error (if any)
reader.error;  // DOMException or null
```

---

## 15.2.5 Abort Reading

### Cancel In Progress

```javascript
const reader = new FileReader();

reader.addEventListener('abort', () => {
  console.log('Reading aborted');
});

reader.readAsText(largeFile);

// Cancel
document.getElementById('cancel').addEventListener('click', () => {
  reader.abort();
});
```

---

## 15.2.6 Progress Tracking

### Upload Progress UI

```javascript
function readWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded, event.total);
      }
    });
    
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    
    reader.readAsArrayBuffer(file);
  });
}

// Usage
const result = await readWithProgress(file, (loaded, total) => {
  const percent = ((loaded / total) * 100).toFixed(1);
  progressBar.style.width = percent + '%';
  progressText.textContent = `${percent}%`;
});
```

---

## 15.2.7 Promise Wrapper

### Promisified FileReader

```javascript
function readFile(file, method = 'readAsText') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    
    reader[method](file);
  });
}

// Usage
const text = await readFile(file, 'readAsText');
const dataUrl = await readFile(file, 'readAsDataURL');
const buffer = await readFile(file, 'readAsArrayBuffer');
```

### Read as JSON

```javascript
async function readJSON(file) {
  const text = await readFile(file, 'readAsText');
  return JSON.parse(text);
}

try {
  const data = await readJSON(jsonFile);
  console.log(data);
} catch (error) {
  console.error('Invalid JSON:', error);
}
```

---

## 15.2.8 Image Preview

### Display Selected Image

```javascript
function previewImage(file, imgElement) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Not an image'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = () => {
      imgElement.src = reader.result;
      resolve();
    };
    
    reader.onerror = () => reject(reader.error);
    
    reader.readAsDataURL(file);
  });
}

// Usage
const input = document.getElementById('imageInput');
const preview = document.getElementById('preview');

input.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file) {
    await previewImage(file, preview);
  }
});
```

### Multiple Image Preview

```javascript
async function previewImages(files, container) {
  container.innerHTML = '';
  
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    
    const img = document.createElement('img');
    img.style.maxWidth = '150px';
    
    await previewImage(file, img);
    container.appendChild(img);
  }
}
```

---

## 15.2.9 CSV Reader

### Parse CSV File

```javascript
async function readCSV(file) {
  const text = await readFile(file, 'readAsText');
  
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim()) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim();
      });
      data.push(row);
    }
  }
  
  return { headers, data };
}
```

---

## 15.2.10 Summary

### Reading Methods

| Method | Returns | Use Case |
|--------|---------|----------|
| `readAsText(file, encoding?)` | String | Text files |
| `readAsDataURL(file)` | Data URL | Images, display |
| `readAsArrayBuffer(file)` | ArrayBuffer | Binary data |

### Events

| Event | When |
|-------|------|
| `loadstart` | Reading started |
| `progress` | Chunk read |
| `load` | Success |
| `error` | Error occurred |
| `abort` | Reading cancelled |
| `loadend` | Finished (any outcome) |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `result` | String/ArrayBuffer | Read data |
| `error` | DOMException | Error info |
| `readyState` | Number | 0, 1, or 2 |

### Best Practices

1. **Use promises** for cleaner code
2. **Track progress** for large files
3. **Handle errors** gracefully
4. **Abort** when component unmounts
5. **Validate** file type before reading
6. **Use ArrayBuffer** for binary processing

---

**End of Chapter 15.2: FileReader**

Next chapter: **15.3 Blob API** — creating and manipulating blobs.
# 15.3 Blob API

Blobs (Binary Large Objects) represent raw immutable data. This chapter covers creating blobs, manipulating them, and creating object URLs.

---

## 15.3.1 Creating Blobs

### From Arrays

```javascript
// From string
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });

// From multiple parts
const multiBlob = new Blob(['Part 1', ' - ', 'Part 2'], { type: 'text/plain' });

// From JSON
const data = { name: 'John', age: 30 };
const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json' });
```

### From TypedArrays

```javascript
// From Uint8Array
const bytes = new Uint8Array([72, 101, 108, 108, 111]);  // "Hello"
const byteBlob = new Blob([bytes], { type: 'application/octet-stream' });

// From ArrayBuffer
const buffer = new ArrayBuffer(8);
const bufferBlob = new Blob([buffer]);
```

### From Existing Blobs

```javascript
const blob1 = new Blob(['Part A']);
const blob2 = new Blob(['Part B']);

const combined = new Blob([blob1, blob2], { type: 'text/plain' });
```

---

## 15.3.2 Blob Properties

### Size and Type

```javascript
const blob = new Blob(['Hello'], { type: 'text/plain' });

blob.size;  // 5 (bytes)
blob.type;  // 'text/plain'
```

---

## 15.3.3 Blob Methods

### slice()

```javascript
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

// Extract portion
const hello = blob.slice(0, 5);
const world = blob.slice(7, 12);

// With content type
const slice = blob.slice(0, 5, 'text/plain');
```

### text()

```javascript
const blob = new Blob(['Hello, World!'], { type: 'text/plain' });

// Returns Promise<string>
const text = await blob.text();
console.log(text);  // 'Hello, World!'
```

### arrayBuffer()

```javascript
const blob = new Blob(['Hello'], { type: 'text/plain' });

// Returns Promise<ArrayBuffer>
const buffer = await blob.arrayBuffer();
const view = new Uint8Array(buffer);
console.log(view);  // Uint8Array([72, 101, 108, 108, 111])
```

### stream()

```javascript
const blob = new Blob(['Large content here...']);

// Returns ReadableStream
const stream = blob.stream();
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log('Chunk:', value);
}
```

---

## 15.3.4 Object URLs

### Create Object URL

```javascript
const blob = new Blob(['Hello'], { type: 'text/plain' });

// Create URL
const url = URL.createObjectURL(blob);
console.log(url);  // 'blob:https://example.com/uuid'
```

### Display Image

```javascript
function displayImage(imageBlob) {
  const url = URL.createObjectURL(imageBlob);
  
  const img = document.createElement('img');
  img.src = url;
  
  // Revoke after load
  img.onload = () => URL.revokeObjectURL(url);
  
  document.body.appendChild(img);
}
```

### Revoke URL

```javascript
// ⚠️ Important: Always revoke to free memory
const url = URL.createObjectURL(blob);

// Use the URL...

// Then revoke
URL.revokeObjectURL(url);
```

---

## 15.3.5 Download Files

### Download Text File

```javascript
function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}

// Usage
downloadText('Hello, World!', 'hello.txt');
```

### Download JSON

```javascript
function downloadJSON(data, filename) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  downloadBlob(blob, filename);
}
```

### Download Canvas

```javascript
async function downloadCanvas(canvas, filename) {
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/png')
  );
  downloadBlob(blob, filename);
}
```

---

## 15.3.6 File from Blob

### Convert Blob to File

```javascript
const blob = new Blob(['File content'], { type: 'text/plain' });

// Create File from Blob
const file = new File([blob], 'document.txt', {
  type: 'text/plain',
  lastModified: Date.now()
});

console.log(file.name);  // 'document.txt'
console.log(file.size);  // 12
```

---

## 15.3.7 Fetch and Blobs

### Get Blob from URL

```javascript
async function fetchBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

const imageBlob = await fetchBlob('/image.png');
```

### Send Blob in Request

```javascript
const blob = new Blob(['data'], { type: 'application/octet-stream' });

fetch('/upload', {
  method: 'POST',
  body: blob
});

// Or with FormData
const formData = new FormData();
formData.append('file', blob, 'filename.txt');

fetch('/upload', {
  method: 'POST',
  body: formData
});
```

---

## 15.3.8 Blob Utilities

### Blob to Base64

```javascript
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

const base64 = await blobToBase64(blob);
```

### Base64 to Blob

```javascript
function base64ToBlob(base64, contentType = '') {
  const byteChars = atob(base64.split(',')[1]);
  const byteArrays = [];
  
  for (let i = 0; i < byteChars.length; i += 512) {
    const slice = byteChars.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  
  return new Blob(byteArrays, { type: contentType });
}
```

### Resize Image Blob

```javascript
async function resizeImage(blob, maxWidth, maxHeight) {
  const img = await createImageBitmap(blob);
  
  let { width, height } = img;
  
  if (width > maxWidth) {
    height = (height / width) * maxWidth;
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = (width / height) * maxHeight;
    height = maxHeight;
  }
  
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  
  return await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
}
```

---

## 15.3.9 Summary

### Constructor

```javascript
new Blob(blobParts, options)
// blobParts: Array of strings, ArrayBuffers, other Blobs
// options: { type: MIME string, endings: 'native'|'transparent' }
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `size` | Number | Size in bytes |
| `type` | String | MIME type |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `slice(start, end, type)` | Blob | Extract portion |
| `text()` | Promise<String> | Read as text |
| `arrayBuffer()` | Promise<ArrayBuffer> | Read as buffer |
| `stream()` | ReadableStream | Get stream |

### URL Methods

| Method | Description |
|--------|-------------|
| `URL.createObjectURL(blob)` | Create blob URL |
| `URL.revokeObjectURL(url)` | Free memory |

### Best Practices

1. **Revoke URLs** to prevent memory leaks
2. **Use slice** for large blob operations
3. **Set content type** for proper handling
4. **Use stream** for very large blobs
5. **Convert to File** when filename needed

---

**End of Chapter 15.3: Blob API**

Next chapter: **15.4 File System Access API** — read/write local files.
# 15.4 File System Access API

The File System Access API provides read and write access to the user's local file system. This chapter covers file pickers, handles, and file/directory operations.

---

## 15.4.1 File Picker

### Open File

```javascript
async function openFile() {
  try {
    const [fileHandle] = await window.showOpenFilePicker();
    const file = await fileHandle.getFile();
    const contents = await file.text();
    
    return { fileHandle, contents };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('User cancelled');
    }
    throw error;
  }
}
```

### With Options

```javascript
const [fileHandle] = await window.showOpenFilePicker({
  types: [
    {
      description: 'Text Files',
      accept: {
        'text/plain': ['.txt'],
        'text/markdown': ['.md']
      }
    },
    {
      description: 'Images',
      accept: {
        'image/*': ['.png', '.jpg', '.jpeg', '.gif']
      }
    }
  ],
  excludeAcceptAllOption: false,  // Show "All files" option
  multiple: false  // Single file only
});
```

### Open Multiple Files

```javascript
const fileHandles = await window.showOpenFilePicker({
  multiple: true
});

for (const handle of fileHandles) {
  const file = await handle.getFile();
  console.log('File:', file.name);
}
```

---

## 15.4.2 Save File

### Save File Picker

```javascript
async function saveFile(contents) {
  const fileHandle = await window.showSaveFilePicker({
    suggestedName: 'untitled.txt',
    types: [
      {
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] }
      }
    ]
  });
  
  const writable = await fileHandle.createWritable();
  await writable.write(contents);
  await writable.close();
  
  return fileHandle;
}
```

### Write Options

```javascript
const writable = await fileHandle.createWritable({
  keepExistingData: false  // Truncate file
});

// Write string
await writable.write('Hello');

// Write at position
await writable.write({ type: 'write', position: 0, data: 'Hi' });

// Seek then write
await writable.seek(5);
await writable.write('World');

// Truncate
await writable.truncate(10);

await writable.close();
```

---

## 15.4.3 Directory Picker

### Select Directory

```javascript
async function openDirectory() {
  const dirHandle = await window.showDirectoryPicker({
    mode: 'read'  // 'read' or 'readwrite'
  });
  
  console.log('Directory:', dirHandle.name);
  return dirHandle;
}
```

### List Contents

```javascript
async function listDirectory(dirHandle) {
  const entries = [];
  
  for await (const entry of dirHandle.values()) {
    entries.push({
      name: entry.name,
      kind: entry.kind  // 'file' or 'directory'
    });
  }
  
  return entries;
}
```

### Recursive Listing

```javascript
async function listRecursive(dirHandle, path = '') {
  const entries = [];
  
  for await (const entry of dirHandle.values()) {
    const entryPath = path ? `${path}/${entry.name}` : entry.name;
    
    if (entry.kind === 'file') {
      entries.push({ path: entryPath, kind: 'file', handle: entry });
    } else {
      entries.push({ path: entryPath, kind: 'directory', handle: entry });
      const subEntries = await listRecursive(entry, entryPath);
      entries.push(...subEntries);
    }
  }
  
  return entries;
}
```

---

## 15.4.4 File Handles

### Get File from Handle

```javascript
const file = await fileHandle.getFile();

console.log('Name:', file.name);
console.log('Size:', file.size);
console.log('Type:', file.type);
console.log('Modified:', file.lastModified);

const text = await file.text();
```

### Create Writable Stream

```javascript
const writable = await fileHandle.createWritable();

// Write data
await writable.write('Content');

// Must close!
await writable.close();
```

### Query Permission

```javascript
// Check permission
const readPerm = await fileHandle.queryPermission({ mode: 'read' });
const writePerm = await fileHandle.queryPermission({ mode: 'readwrite' });

console.log('Read:', readPerm);    // 'granted', 'denied', or 'prompt'
console.log('Write:', writePerm);
```

### Request Permission

```javascript
async function requestWritePermission(fileHandle) {
  const options = { mode: 'readwrite' };
  
  // Check current permission
  if (await fileHandle.queryPermission(options) === 'granted') {
    return true;
  }
  
  // Request if needed
  if (await fileHandle.requestPermission(options) === 'granted') {
    return true;
  }
  
  return false;
}
```

---

## 15.4.5 Directory Operations

### Get File in Directory

```javascript
// Get existing file
const fileHandle = await dirHandle.getFileHandle('file.txt');

// Create if doesn't exist
const newFileHandle = await dirHandle.getFileHandle('new.txt', {
  create: true
});
```

### Get Subdirectory

```javascript
// Get existing directory
const subDir = await dirHandle.getDirectoryHandle('subdir');

// Create if doesn't exist
const newDir = await dirHandle.getDirectoryHandle('newdir', {
  create: true
});
```

### Remove Entry

```javascript
// Remove file
await dirHandle.removeEntry('file.txt');

// Remove directory (must be empty)
await dirHandle.removeEntry('subdir');

// Remove directory recursively
await dirHandle.removeEntry('subdir', { recursive: true });
```

### Resolve Path

```javascript
// Get path from directory to file
const path = await dirHandle.resolve(fileHandle);
// Returns ['subdir', 'file.txt'] or null if not descendant
```

---

## 15.4.6 Persisting Handles

### Store in IndexedDB

```javascript
// File handles can be stored in IndexedDB
async function saveHandle(name, handle) {
  const db = await openDatabase();
  const tx = db.transaction('handles', 'readwrite');
  await tx.store.put(handle, name);
}

async function getHandle(name) {
  const db = await openDatabase();
  return await db.get('handles', name);
}

// After page reload, re-request permission
const handle = await getHandle('myFile');
if (handle) {
  const permission = await handle.requestPermission({ mode: 'readwrite' });
  if (permission === 'granted') {
    // Use handle
  }
}
```

---

## 15.4.7 Complete Example

### Text Editor

```javascript
class FileEditor {
  constructor() {
    this.fileHandle = null;
    this.textarea = document.getElementById('editor');
  }
  
  async open() {
    const [handle] = await window.showOpenFilePicker({
      types: [{
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] }
      }]
    });
    
    this.fileHandle = handle;
    const file = await handle.getFile();
    this.textarea.value = await file.text();
  }
  
  async save() {
    if (!this.fileHandle) {
      return this.saveAs();
    }
    
    await this.writeFile(this.fileHandle);
  }
  
  async saveAs() {
    const handle = await window.showSaveFilePicker({
      suggestedName: 'document.txt',
      types: [{
        description: 'Text Files',
        accept: { 'text/plain': ['.txt'] }
      }]
    });
    
    this.fileHandle = handle;
    await this.writeFile(handle);
  }
  
  async writeFile(handle) {
    const writable = await handle.createWritable();
    await writable.write(this.textarea.value);
    await writable.close();
  }
}
```

---

## 15.4.8 Feature Detection

### Check Support

```javascript
function isFileSystemAccessSupported() {
  return 'showOpenFilePicker' in window;
}

if (!isFileSystemAccessSupported()) {
  // Fall back to <input type="file">
  showLegacyFilePicker();
}
```

---

## 15.4.9 Summary

### Picker Functions

| Function | Returns | Description |
|----------|---------|-------------|
| `showOpenFilePicker(options)` | FileSystemFileHandle[] | Open files |
| `showSaveFilePicker(options)` | FileSystemFileHandle | Save file |
| `showDirectoryPicker(options)` | FileSystemDirectoryHandle | Select directory |

### FileSystemFileHandle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getFile()` | File | Get file object |
| `createWritable(options)` | WritableStream | Get write stream |
| `queryPermission(descriptor)` | String | Check permission |
| `requestPermission(descriptor)` | String | Request permission |

### FileSystemDirectoryHandle Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getFileHandle(name, options)` | FileHandle | Get/create file |
| `getDirectoryHandle(name, options)` | DirectoryHandle | Get/create directory |
| `removeEntry(name, options)` | void | Remove entry |
| `resolve(handle)` | String[] | Get path |
| `values()` | AsyncIterator | List entries |

### Best Practices

1. **Handle AbortError** when user cancels
2. **Request permission** after page reload
3. **Close writable streams** to save changes
4. **Use recursive option** carefully when deleting
5. **Fall back** to legacy file input when unsupported
6. **Persist handles** in IndexedDB for re-use

---

**End of Chapter 15.4: File System Access API**

Next chapter: **15.5 Drag and Drop Files** — handling file drops.
# 15.5 Drag and Drop Files

This chapter covers handling files dropped into a web page, including drag events, DataTransfer, and file extraction.

---

## 15.5.1 Basic Drop Zone

### HTML Setup

```html
<div id="dropzone">
  Drop files here
</div>

<style>
  #dropzone {
    border: 2px dashed #ccc;
    padding: 50px;
    text-align: center;
  }
  
  #dropzone.dragover {
    border-color: #2196F3;
    background: #e3f2fd;
  }
</style>
```

### Event Handling

```javascript
const dropzone = document.getElementById('dropzone');

// Prevent default to allow drop
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', (e) => {
  dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  handleFiles(files);
});

function handleFiles(files) {
  for (const file of files) {
    console.log('Dropped:', file.name);
  }
}
```

---

## 15.5.2 DataTransfer Object

### Access Files

```javascript
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  // FileList
  const files = e.dataTransfer.files;
  console.log('File count:', files.length);
  
  // Items (for more control)
  const items = e.dataTransfer.items;
  for (const item of items) {
    if (item.kind === 'file') {
      const file = item.getAsFile();
      console.log('File:', file.name);
    }
  }
});
```

### DataTransfer Properties

```javascript
dropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  
  dt.files;       // FileList
  dt.items;       // DataTransferItemList
  dt.types;       // Array of types ('Files', 'text/plain', etc.)
  dt.dropEffect;  // 'copy', 'move', 'link', 'none'
});
```

---

## 15.5.3 Drag Feedback

### Visual Feedback

```javascript
dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';  // Show copy cursor
});

dropzone.addEventListener('dragleave', (e) => {
  // Only remove if leaving the dropzone itself
  if (e.target === dropzone) {
    dropzone.classList.remove('dragover');
  }
});
```

### Better dragenter/dragleave

```javascript
// Counter to handle nested elements
let dragCounter = 0;

dropzone.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragCounter++;
  dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', (e) => {
  dragCounter--;
  if (dragCounter === 0) {
    dropzone.classList.remove('dragover');
  }
});

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dragCounter = 0;
  dropzone.classList.remove('dragover');
  // Handle files...
});
```

---

## 15.5.4 File Type Validation

### Check During Drag

```javascript
dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  
  // Check if files are being dragged
  if (e.dataTransfer.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy';
  } else {
    e.dataTransfer.dropEffect = 'none';
  }
});
```

### Validate on Drop

```javascript
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  const validFiles = [];
  const invalidFiles = [];
  
  for (const file of e.dataTransfer.files) {
    if (allowedTypes.includes(file.type)) {
      validFiles.push(file);
    } else {
      invalidFiles.push(file);
    }
  }
  
  if (invalidFiles.length > 0) {
    alert(`Invalid files: ${invalidFiles.map(f => f.name).join(', ')}`);
  }
  
  handleFiles(validFiles);
});
```

---

## 15.5.5 Directory Drop

### Handle Dropped Directories

```javascript
dropzone.addEventListener('drop', async (e) => {
  e.preventDefault();
  
  const items = e.dataTransfer.items;
  
  for (const item of items) {
    // getAsFileSystemHandle() for File System Access API
    if (item.getAsFileSystemHandle) {
      const handle = await item.getAsFileSystemHandle();
      
      if (handle.kind === 'directory') {
        await processDirectory(handle);
      } else {
        await processFile(handle);
      }
    } else {
      // Fallback for older browsers
      const entry = item.webkitGetAsEntry();
      if (entry) {
        await readEntry(entry);
      }
    }
  }
});

async function processDirectory(dirHandle) {
  for await (const entry of dirHandle.values()) {
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      console.log('File:', file.name);
    } else {
      await processDirectory(entry);
    }
  }
}
```

### Legacy webkitGetAsEntry

```javascript
function readEntry(entry) {
  if (entry.isFile) {
    entry.file(file => {
      console.log('File:', file.name);
    });
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    reader.readEntries(entries => {
      entries.forEach(readEntry);
    });
  }
}
```

---

## 15.5.6 Image Preview

### Preview Dropped Images

```javascript
const preview = document.getElementById('preview');

dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  preview.innerHTML = '';
  
  for (const file of e.dataTransfer.files) {
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      img.onload = () => URL.revokeObjectURL(img.src);
      img.style.maxWidth = '200px';
      preview.appendChild(img);
    }
  }
});
```

---

## 15.5.7 Complete Drop Zone Component

### Reusable Component

```javascript
class DropZone {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      accept: options.accept || '*',
      multiple: options.multiple ?? true,
      onFiles: options.onFiles || (() => {}),
      onError: options.onError || console.error
    };
    
    this.dragCounter = 0;
    this.bindEvents();
  }
  
  bindEvents() {
    this.element.addEventListener('dragenter', this.onDragEnter.bind(this));
    this.element.addEventListener('dragover', this.onDragOver.bind(this));
    this.element.addEventListener('dragleave', this.onDragLeave.bind(this));
    this.element.addEventListener('drop', this.onDrop.bind(this));
  }
  
  onDragEnter(e) {
    e.preventDefault();
    this.dragCounter++;
    this.element.classList.add('dragover');
  }
  
  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }
  
  onDragLeave(e) {
    this.dragCounter--;
    if (this.dragCounter === 0) {
      this.element.classList.remove('dragover');
    }
  }
  
  onDrop(e) {
    e.preventDefault();
    this.dragCounter = 0;
    this.element.classList.remove('dragover');
    
    const files = this.filterFiles([...e.dataTransfer.files]);
    
    if (!this.options.multiple && files.length > 1) {
      files.length = 1;
    }
    
    if (files.length > 0) {
      this.options.onFiles(files);
    }
  }
  
  filterFiles(files) {
    if (this.options.accept === '*') return files;
    
    const types = this.options.accept.split(',').map(t => t.trim());
    
    return files.filter(file => {
      return types.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.replace('/*', '/'));
        }
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type);
        }
        return file.type === type;
      });
    });
  }
}

// Usage
new DropZone(document.getElementById('dropzone'), {
  accept: 'image/*,.pdf',
  multiple: true,
  onFiles: (files) => {
    files.forEach(f => console.log('Received:', f.name));
  }
});
```

---

## 15.5.8 Summary

### Events

| Event | Description |
|-------|-------------|
| `dragenter` | File enters drop zone |
| `dragover` | File is over drop zone |
| `dragleave` | File leaves drop zone |
| `drop` | File is dropped |

### DataTransfer Properties

| Property | Type | Description |
|----------|------|-------------|
| `files` | FileList | Dropped files |
| `items` | DataTransferItemList | All items |
| `types` | Array | Data types |
| `dropEffect` | String | Drop effect |

### Best Practices

1. **Prevent default** on dragover and drop
2. **Use counter** for drag enter/leave
3. **Validate file types** on drop
4. **Provide visual feedback** during drag
5. **Handle directories** when needed
6. **Clean up object URLs** after use

---

**End of Chapter 15.5: Drag and Drop Files**

This completes Group 15 — File APIs. Next section: **Group 16 — Clipboard API**.
