# 16.1 Clipboard Operations

The modern Clipboard API provides asynchronous read/write access to the system clipboard. This chapter covers text, images, and rich content operations.

---

## 16.1.1 Check Support

### Feature Detection

```javascript
function isClipboardSupported() {
  return navigator.clipboard !== undefined;
}

function canWriteText() {
  return navigator.clipboard?.writeText !== undefined;
}

function canReadText() {
  return navigator.clipboard?.readText !== undefined;
}

function canWrite() {
  return navigator.clipboard?.write !== undefined;
}
```

---

## 16.1.2 Write Text

### Copy Text to Clipboard

```javascript
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    console.log('Copied!');
  } catch (error) {
    console.error('Copy failed:', error);
  }
}

// Usage
await copyText('Hello, World!');
```

### Copy Button Example

```javascript
const copyButton = document.getElementById('copy');
const textInput = document.getElementById('text');

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(textInput.value);
    copyButton.textContent = 'Copied!';
    setTimeout(() => {
      copyButton.textContent = 'Copy';
    }, 2000);
  } catch (error) {
    copyButton.textContent = 'Failed';
  }
});
```

---

## 16.1.3 Read Text

### Paste Text from Clipboard

```javascript
async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    console.log('Pasted:', text);
    return text;
  } catch (error) {
    console.error('Paste failed:', error);
  }
}
```

### Permission Required

```javascript
// Reading requires user permission
// Browser shows permission prompt automatically

async function readWithPermissionCheck() {
  try {
    const permission = await navigator.permissions.query({
      name: 'clipboard-read'
    });
    
    if (permission.state === 'denied') {
      console.log('Clipboard access denied');
      return null;
    }
    
    return await navigator.clipboard.readText();
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 16.1.4 Write Rich Content

### ClipboardItem

```javascript
// Write multiple formats
async function copyRichText(text, html) {
  const item = new ClipboardItem({
    'text/plain': new Blob([text], { type: 'text/plain' }),
    'text/html': new Blob([html], { type: 'text/html' })
  });
  
  await navigator.clipboard.write([item]);
}

// Usage
await copyRichText(
  'Hello World',
  '<b>Hello</b> <i>World</i>'
);
```

### Copy Image

```javascript
async function copyImage(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  const item = new ClipboardItem({
    [blob.type]: blob
  });
  
  await navigator.clipboard.write([item]);
}

// From canvas
async function copyCanvas(canvas) {
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/png')
  );
  
  const item = new ClipboardItem({
    'image/png': blob
  });
  
  await navigator.clipboard.write([item]);
}
```

---

## 16.1.5 Read Rich Content

### Read All Formats

```javascript
async function readClipboard() {
  const items = await navigator.clipboard.read();
  
  for (const item of items) {
    console.log('Types:', item.types);
    
    for (const type of item.types) {
      const blob = await item.getType(type);
      
      if (type === 'text/plain') {
        console.log('Text:', await blob.text());
      } else if (type === 'text/html') {
        console.log('HTML:', await blob.text());
      } else if (type.startsWith('image/')) {
        displayImage(blob);
      }
    }
  }
}
```

### Read Image

```javascript
async function pasteImage() {
  const items = await navigator.clipboard.read();
  
  for (const item of items) {
    for (const type of item.types) {
      if (type.startsWith('image/')) {
        const blob = await item.getType(type);
        return URL.createObjectURL(blob);
      }
    }
  }
  
  return null;
}
```

---

## 16.1.6 Clipboard Events

### Listen for Copy/Paste

```javascript
document.addEventListener('copy', (e) => {
  console.log('Copy event');
  
  // Modify copied content
  const selection = window.getSelection().toString();
  e.clipboardData.setData('text/plain', selection.toUpperCase());
  e.preventDefault();
});

document.addEventListener('paste', (e) => {
  console.log('Paste event');
  
  const text = e.clipboardData.getData('text/plain');
  console.log('Pasted:', text);
  
  // Prevent default paste
  e.preventDefault();
  // Insert modified content
  document.execCommand('insertText', false, text.trim());
});

document.addEventListener('cut', (e) => {
  console.log('Cut event');
});
```

### Clipboard Event Data

```javascript
document.addEventListener('paste', (e) => {
  const clipboardData = e.clipboardData;
  
  // Available types
  console.log('Types:', clipboardData.types);
  
  // Get specific type
  const text = clipboardData.getData('text/plain');
  const html = clipboardData.getData('text/html');
  
  // Files (for images)
  if (clipboardData.files.length > 0) {
    const file = clipboardData.files[0];
    handlePastedFile(file);
  }
});
```

---

## 16.1.7 Paste Image from Clipboard

### Handle Pasted Images

```javascript
document.addEventListener('paste', async (e) => {
  const items = e.clipboardData.items;
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      displayPastedImage(file);
      e.preventDefault();
      break;
    }
  }
});

function displayPastedImage(file) {
  const url = URL.createObjectURL(file);
  const img = document.createElement('img');
  img.src = url;
  img.onload = () => URL.revokeObjectURL(url);
  document.body.appendChild(img);
}
```

---

## 16.1.8 Security Considerations

### HTTPS Required

```javascript
// Clipboard API requires secure context (HTTPS)
if (!window.isSecureContext) {
  console.warn('Clipboard API requires HTTPS');
}
```

### User Gesture Required

```javascript
// Write operations need user gesture
// ❌ This won't work on page load
window.addEventListener('load', async () => {
  await navigator.clipboard.writeText('Hello');  // May fail
});

// ✅ This works - triggered by user action
button.addEventListener('click', async () => {
  await navigator.clipboard.writeText('Hello');  // Works
});
```

### Permission Best Practices

```javascript
async function safeCopy(text) {
  // Check if we have permission first
  try {
    const permission = await navigator.permissions.query({
      name: 'clipboard-write'
    });
    
    if (permission.state === 'denied') {
      showManualCopyDialog(text);
      return false;
    }
    
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fall back to legacy method
    return legacyCopy(text);
  }
}
```

---

## 16.1.9 Summary

### Write Methods

| Method | Description |
|--------|-------------|
| `writeText(text)` | Copy text |
| `write(items)` | Copy rich content |

### Read Methods

| Method | Description |
|--------|-------------|
| `readText()` | Paste text |
| `read()` | Paste rich content |

### ClipboardItem

```javascript
new ClipboardItem({
  'text/plain': blob,
  'text/html': blob,
  'image/png': blob
});
```

### Events

| Event | When |
|-------|------|
| `copy` | User copies |
| `cut` | User cuts |
| `paste` | User pastes |

### Best Practices

1. **Check support** before using
2. **Handle errors** gracefully
3. **Require user gesture** for writes
4. **Use HTTPS** in production
5. **Provide fallback** for unsupported browsers
6. **Request permission** when needed

---

**End of Chapter 16.1: Clipboard Operations**

Next chapter: **16.2 Legacy Clipboard** — execCommand and older approaches.
