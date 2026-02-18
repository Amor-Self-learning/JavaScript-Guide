# 4.4 FormData API

The FormData API provides a way to construct and manipulate form data for submission. This chapter covers creating FormData, modifying entries, handling files, and sending data with fetch.

---

## 4.4.1 Creating FormData

### From a Form Element

```javascript
const form = document.querySelector('form');

// Create FormData from form
const formData = new FormData(form);

// Automatically includes all named form controls:
// - Input values (text, number, etc.)
// - Textarea values
// - Select values
// - Checked checkboxes/radios
// - File inputs

// Does NOT include:
// - Disabled elements
// - Elements without name attribute
// - Unchecked checkboxes/radios
// - Submit buttons (unless specified)
```

### With Submitter

```javascript
// Include submit button value
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // e.submitter is the button that was clicked
  const formData = new FormData(form, e.submitter);
  
  // If submitter has name/value, it's included
  // <button type="submit" name="action" value="save">Save</button>
  console.log(formData.get('action'));  // 'save'
});
```

### Empty FormData

```javascript
// Create empty FormData
const formData = new FormData();

// Add entries manually
formData.append('username', 'john');
formData.append('email', 'john@example.com');
```

---

## 4.4.2 Reading FormData

### get() and getAll()

```javascript
const formData = new FormData(form);

// Get single value
const username = formData.get('username');
console.log(username);  // 'john' or null if not present

// Get all values (for multi-value fields)
const interests = formData.getAll('interests');
console.log(interests);  // ['sports', 'music', 'travel']

// Useful for:
// - Multiple checkboxes with same name
// - Multiple file inputs
// - Select multiple
```

### has()

```javascript
const formData = new FormData(form);

// Check if field exists
if (formData.has('username')) {
  console.log('Username provided');
}

if (formData.has('newsletter')) {
  console.log('Newsletter checkbox was checked');
}
```

### Iterating

```javascript
const formData = new FormData(form);

// Iterate over entries
for (const [key, value] of formData) {
  console.log(`${key}: ${value}`);
}

// Using entries()
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

// Keys only
for (const key of formData.keys()) {
  console.log(key);
}

// Values only
for (const value of formData.values()) {
  console.log(value);
}

// forEach
formData.forEach((value, key) => {
  console.log(key, value);
});
```

### Converting to Object

```javascript
const formData = new FormData(form);

// Simple conversion (loses multiple values)
const obj = Object.fromEntries(formData);

// Handle multiple values
function formDataToObject(formData) {
  const obj = {};
  
  for (const [key, value] of formData) {
    if (obj[key] !== undefined) {
      // Convert to array if multiple values
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

// Or use getAll for known multi-value fields
const data = {
  ...Object.fromEntries(formData),
  interests: formData.getAll('interests')
};
```

---

## 4.4.3 Modifying FormData

### append()

```javascript
const formData = new FormData();

// Add string value
formData.append('username', 'john');

// Add number (converted to string)
formData.append('age', 25);

// Append another value with same key
formData.append('tag', 'javascript');
formData.append('tag', 'web');
console.log(formData.getAll('tag'));  // ['javascript', 'web']

// Append file
const fileInput = document.querySelector('input[type="file"]');
formData.append('avatar', fileInput.files[0]);

// Append Blob with filename
const blob = new Blob(['Hello'], { type: 'text/plain' });
formData.append('file', blob, 'hello.txt');
```

### set()

```javascript
const formData = new FormData();

// Set value (replaces if exists)
formData.set('username', 'john');
formData.set('username', 'jane');  // Replaces 'john'

console.log(formData.get('username'));  // 'jane'
console.log(formData.getAll('username'));  // ['jane']

// Difference from append:
// append() adds, even if key exists (creates array)
// set() replaces any existing values
```

### delete()

```javascript
const formData = new FormData(form);

// Remove field
formData.delete('password');

// Removes ALL values for that key
formData.append('tag', 'js');
formData.append('tag', 'web');
formData.delete('tag');
console.log(formData.has('tag'));  // false
```

---

## 4.4.4 Working with Files

### File Inputs

```javascript
// HTML: <input type="file" name="avatar">
const formData = new FormData(form);

// Single file
const file = formData.get('avatar');
console.log(file.name);
console.log(file.size);
console.log(file.type);

// Multiple files: <input type="file" name="photos" multiple>
const files = formData.getAll('photos');
files.forEach(file => {
  console.log(file.name);
});
```

### Appending Files Manually

```javascript
const formData = new FormData();

// From file input
const fileInput = document.querySelector('input[type="file"]');
for (const file of fileInput.files) {
  formData.append('files', file);
}

// From drag and drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  for (const file of e.dataTransfer.files) {
    formData.append('uploads', file);
  }
  
  uploadFiles(formData);
});

// From clipboard
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  const formData = new FormData();
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      formData.append('image', file, `paste-${Date.now()}.png`);
    }
  }
});
```

### Creating Files from Blobs

```javascript
const formData = new FormData();

// Text file from string
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
formData.append('textFile', textBlob, 'hello.txt');

// JSON file
const jsonData = JSON.stringify({ name: 'John', age: 30 });
const jsonBlob = new Blob([jsonData], { type: 'application/json' });
formData.append('data', jsonBlob, 'data.json');

// Canvas to file
const canvas = document.querySelector('canvas');
canvas.toBlob((blob) => {
  formData.append('drawing', blob, 'drawing.png');
});

// Or with async/await
const blob = await new Promise(resolve => canvas.toBlob(resolve));
formData.append('image', blob, 'canvas.png');
```

---

## 4.4.5 Sending with Fetch

### Basic POST

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
    // Don't set Content-Type header!
    // Fetch sets it automatically with boundary
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Success:', result);
  }
});
```

### Why Not Set Content-Type

```javascript
// ❌ Don't do this
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'  // Wrong!
  },
  body: formData
});

// ✅ Let browser set it
fetch('/api/upload', {
  method: 'POST',
  body: formData
  // Browser sets: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
});

// The boundary is required for parsing
// Browser generates unique boundary automatically
```

### Converting to JSON

```javascript
// If API expects JSON instead of FormData
const formData = new FormData(form);
const jsonData = Object.fromEntries(formData);

fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonData)
});

// ⚠️ This loses files!
// Files cannot be sent as JSON
```

### Sending as URL-Encoded

```javascript
const formData = new FormData(form);

// Convert to URLSearchParams
const params = new URLSearchParams();
for (const [key, value] of formData) {
  if (typeof value === 'string') {
    params.append(key, value);
  }
}

fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: params
});
```

---

## 4.4.6 Upload Progress

```javascript
// FormData with XMLHttpRequest for progress
function uploadWithProgress(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// Usage
const formData = new FormData(form);

await uploadWithProgress(formData, (percent) => {
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${Math.round(percent)}%`;
});
```

---

## 4.4.7 Common Patterns

### Form Submission Handler

```javascript
class FormHandler {
  constructor(form, options = {}) {
    this.form = form;
    this.url = options.url || form.action;
    this.method = options.method || form.method || 'POST';
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form, e.submitter);
    const submitBtn = e.submitter || this.form.querySelector('[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      const response = await fetch(this.url, {
        method: this.method,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      this.onSuccess(result);
    } catch (error) {
      this.onError(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }
}
```

### Multipart File Upload

```javascript
async function uploadFiles(files, additionalData = {}) {
  const formData = new FormData();
  
  // Add files
  for (const file of files) {
    formData.append('files', file);
  }
  
  // Add other data
  for (const [key, value] of Object.entries(additionalData)) {
    formData.append(key, value);
  }
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// Usage
const result = await uploadFiles(fileInput.files, {
  folder: 'images',
  public: 'true'
});
```

### FormData Event

```javascript
// Modify FormData before submission
form.addEventListener('formdata', (e) => {
  // e.formData is the FormData being constructed
  
  // Add computed fields
  e.formData.append('timestamp', Date.now());
  e.formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Modify existing fields
  const username = e.formData.get('username');
  e.formData.set('username', username.toLowerCase());
  
  // Remove unwanted fields
  e.formData.delete('debug');
});

// formdata event fires when:
// new FormData(form) is called
```

---

## 4.4.8 Gotchas

```javascript
// ❌ Setting Content-Type header manually
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData
});
// Missing boundary! Server can't parse.

// ✅ Let browser set it
fetch(url, {
  method: 'POST',
  body: formData
});

// ❌ Expecting disabled fields in FormData
input.disabled = true;
const formData = new FormData(form);
console.log(formData.has('inputName'));  // false!

// ✅ Use readonly if you need value in FormData
input.readOnly = true;

// ❌ Checking for empty values
if (!formData.get('field')) {
  // Empty string '' is falsy but exists!
}

// ✅ Use has() to check existence
if (!formData.has('field')) {
  // Field truly doesn't exist
}

// ❌ Expecting files to survive JSON conversion
const obj = Object.fromEntries(formData);
// obj.file is "[object File]" string!

// ✅ Handle files separately
const files = formData.getAll('files');
const data = Object.fromEntries(formData);
delete data.files;
```

---

## 4.4.9 Summary

### Creating FormData

| Method | Description |
|--------|-------------|
| `new FormData(form)` | From form element |
| `new FormData(form, submitter)` | Include submit button |
| `new FormData()` | Empty, build manually |

### Reading Methods

| Method | Returns |
|--------|---------|
| `get(name)` | First value or null |
| `getAll(name)` | Array of all values |
| `has(name)` | Boolean |
| `entries()` | Iterator of [key, value] |
| `keys()` | Iterator of keys |
| `values()` | Iterator of values |

### Modifying Methods

| Method | Description |
|--------|-------------|
| `append(name, value)` | Add value (keeps existing) |
| `set(name, value)` | Replace value |
| `delete(name)` | Remove all values for key |

### Sending

| Scenario | Content-Type |
|----------|--------------|
| FormData body | Auto (multipart/form-data) |
| JSON body | application/json |
| URLSearchParams | x-www-form-urlencoded |

### Best Practices

1. **Don't set Content-Type header** — let browser add boundary
2. **Use `has()` to check existence**, not falsy check
3. **Handle disabled vs readonly** — disabled fields excluded
4. **Use `getAll()` for multi-value fields**
5. **Use XHR for upload progress** — fetch doesn't support it
6. **Listen to `formdata` event** for last-minute modifications

---

**End of Chapter 4.4: FormData API**

**End of Group 4: Forms**

Next group: **5. Storage APIs** — covers Web Storage, Cookies, IndexedDB, Cache API, and Storage Manager.
