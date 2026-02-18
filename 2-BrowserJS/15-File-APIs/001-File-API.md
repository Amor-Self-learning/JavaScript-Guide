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
