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
