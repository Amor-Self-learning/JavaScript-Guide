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
