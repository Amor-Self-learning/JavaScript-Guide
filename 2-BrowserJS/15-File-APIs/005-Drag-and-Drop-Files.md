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
