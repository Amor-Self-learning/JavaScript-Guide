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
# 16.2 Legacy Clipboard

Before the modern Clipboard API, clipboard operations used `document.execCommand()`. This chapter covers legacy methods for broader compatibility.

---

## 16.2.1 execCommand Basics

### Copy with execCommand

```javascript
function legacyCopy(text) {
  // Create temporary element
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    const success = document.execCommand('copy');
    console.log(success ? 'Copied!' : 'Copy failed');
    return success;
  } catch (error) {
    console.error('Copy error:', error);
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}
```

### Cut and Paste

```javascript
// Cut selected text
document.execCommand('cut');

// Paste (requires permission, rarely works)
document.execCommand('paste');
```

---

## 16.2.2 Copy Selected Text

### Copy Current Selection

```javascript
function copySelection() {
  const selection = window.getSelection().toString();
  
  if (selection) {
    return document.execCommand('copy');
  }
  
  return false;
}
```

### Copy from Input

```javascript
function copyFromInput(input) {
  input.select();
  input.setSelectionRange(0, input.value.length);
  
  const success = document.execCommand('copy');
  
  // Deselect
  input.setSelectionRange(0, 0);
  input.blur();
  
  return success;
}
```

---

## 16.2.3 Copy Specific Element

### Copy Element Content

```javascript
function copyElement(element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  
  const success = document.execCommand('copy');
  
  selection.removeAllRanges();
  
  return success;
}

// Usage
const codeBlock = document.querySelector('pre code');
copyElement(codeBlock);
```

---

## 16.2.4 Clipboard Events (Legacy)

### Intercept Copy

```javascript
document.addEventListener('copy', (e) => {
  const selection = window.getSelection().toString();
  
  // Modify copied text
  e.clipboardData.setData('text/plain', 
    selection + '\n\nCopied from MySite.com'
  );
  
  e.preventDefault();
});
```

### Intercept Paste

```javascript
document.addEventListener('paste', (e) => {
  // Get pasted text
  const text = e.clipboardData.getData('text/plain');
  const html = e.clipboardData.getData('text/html');
  
  // Prevent default and handle manually
  e.preventDefault();
  
  // Insert plain text
  document.execCommand('insertText', false, text);
});
```

### Intercept Cut

```javascript
document.addEventListener('cut', (e) => {
  const selection = window.getSelection().toString();
  
  e.clipboardData.setData('text/plain', selection);
  
  // Delete selection
  document.execCommand('delete');
  
  e.preventDefault();
});
```

---

## 16.2.5 contenteditable Integration

### Copy from Editable

```javascript
const editor = document.querySelector('[contenteditable]');

function copyEditorContent() {
  editor.focus();
  document.execCommand('selectAll');
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
}
```

### Paste into Editable

```javascript
// Paste plain text only
editor.addEventListener('paste', (e) => {
  e.preventDefault();
  
  const text = e.clipboardData.getData('text/plain');
  document.execCommand('insertText', false, text);
});
```

---

## 16.2.6 Cross-Browser Fallback

### Modern + Legacy

```javascript
async function copy(text) {
  // Try modern API first
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('Modern clipboard failed, trying fallback');
    }
  }
  
  // Fallback to execCommand
  return legacyCopy(text);
}

function legacyCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.cssText = 'position:fixed;left:-9999px';
  
  document.body.appendChild(textarea);
  textarea.select();
  
  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (e) {}
  
  document.body.removeChild(textarea);
  return success;
}
```

### Read with Fallback

```javascript
async function paste() {
  // Modern API (requires permission)
  if (navigator.clipboard?.readText) {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Clipboard read failed');
    }
  }
  
  // No reliable legacy fallback for reading
  // Must handle via paste event
  return null;
}
```

---

## 16.2.7 Deprecation Status

### execCommand Status

```javascript
// execCommand is deprecated but still widely used
// Modern browsers still support it

// Check support
if (document.queryCommandSupported('copy')) {
  console.log('execCommand copy supported');
}

// Check if enabled
if (document.queryCommandEnabled('copy')) {
  console.log('execCommand copy enabled');
}
```

### Migration Path

```javascript
// Recommend modern API with fallback
const clipboard = {
  async write(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return legacyCopy(text);
  },
  
  async read() {
    if (navigator.clipboard?.readText) {
      return navigator.clipboard.readText();
    }
    throw new Error('Clipboard read not supported');
  }
};
```

---

## 16.2.8 Summary

### execCommand Methods

| Command | Description |
|---------|-------------|
| `copy` | Copy selection |
| `cut` | Cut selection |
| `paste` | Paste clipboard |
| `selectAll` | Select all content |
| `delete` | Delete selection |
| `insertText` | Insert text |

### Event Methods

| Method | Description |
|--------|-------------|
| `getData(type)` | Get clipboard data |
| `setData(type, data)` | Set clipboard data |
| `clearData(type)` | Clear clipboard |

### Best Practices

1. **Use modern API** when available
2. **Provide legacy fallback** for compatibility
3. **Use textarea** trick for copying text
4. **Handle paste events** for reading
5. **Prevent default** when modifying
6. **Clean up** temporary elements

---

**End of Chapter 16.2: Legacy Clipboard**

This completes Group 16 — Clipboard API. Next section: **Group 17 — Payment APIs**.
