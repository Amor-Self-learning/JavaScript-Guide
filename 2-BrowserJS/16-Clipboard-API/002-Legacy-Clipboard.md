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
