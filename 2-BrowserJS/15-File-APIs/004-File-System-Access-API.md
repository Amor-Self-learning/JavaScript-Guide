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
