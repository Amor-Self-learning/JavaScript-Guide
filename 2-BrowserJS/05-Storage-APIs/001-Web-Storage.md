# 5.1 Web Storage

Web Storage provides synchronous key-value storage in the browser. This chapter covers localStorage for persistent storage, sessionStorage for session-scoped data, and the storage event for cross-tab synchronization.

---

## 5.1.1 localStorage vs sessionStorage

### localStorage

```javascript
// Persists across browser sessions
// Data survives browser close and reopen

// Set item
localStorage.setItem('username', 'john');

// Get item
const username = localStorage.getItem('username');
console.log(username);  // 'john'

// Remove item
localStorage.removeItem('username');

// Clear all
localStorage.clear();

// Scope: same origin (protocol + domain + port)
// All tabs/windows share localStorage for same origin
```

### sessionStorage

```javascript
// Data persists only for the session (tab lifetime)
// Cleared when tab/window is closed

// Same API as localStorage
sessionStorage.setItem('tempData', 'value');
sessionStorage.getItem('tempData');
sessionStorage.removeItem('tempData');
sessionStorage.clear();

// Scope: same origin AND same tab
// Each tab has its own sessionStorage
// Opening link in new tab copies sessionStorage once, then they're independent
```

### Key Differences

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Persistence | Until manually cleared | Until tab closes |
| Scope | All tabs, same origin | Single tab only |
| Survives browser close | Yes | No |
| Survives page refresh | Yes | Yes |
| Duplicated to new tab | Yes (shared) | Yes (copied once) |

---

## 5.1.2 Basic Operations

### setItem() and getItem()

```javascript
// Set item
localStorage.setItem('key', 'value');

// Get item
const value = localStorage.getItem('key');

// Returns null if key doesn't exist
const missing = localStorage.getItem('nonexistent');
console.log(missing);  // null

// All values are strings!
localStorage.setItem('number', 42);  // Stored as '42'
console.log(localStorage.getItem('number'));  // '42' (string)
console.log(typeof localStorage.getItem('number'));  // 'string'
```

### removeItem()

```javascript
// Remove single item
localStorage.removeItem('key');

// Does nothing if key doesn't exist (no error)
localStorage.removeItem('nonexistent');
```

### clear()

```javascript
// Remove ALL items
localStorage.clear();

// ⚠️ Affects entire origin
// Other scripts/tabs using localStorage will lose data
```

### key() and length

```javascript
// Get number of items
console.log(localStorage.length);  // e.g., 3

// Get key by index
console.log(localStorage.key(0));  // First key
console.log(localStorage.key(1));  // Second key

// Iterate over all items
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}

// Better: use Object.keys()
Object.keys(localStorage).forEach(key => {
  console.log(`${key}: ${localStorage.getItem(key)}`);
});
```

### Direct Property Access

```javascript
// Direct property access (shorthand)
localStorage.username = 'john';
console.log(localStorage.username);
delete localStorage.username;

// ⚠️ Not recommended for several reasons:
// 1. Can't access keys named like built-in properties
// 2. Less explicit
// 3. undefined vs null semantics differ

// ❌ Problem with built-in property names
localStorage.length = '100';  // This won't work as expected!
console.log(localStorage.length);  // Returns count, not '100'

// ✅ Always use setItem/getItem methods
localStorage.setItem('length', '100');
```

---

## 5.1.3 Storing Complex Data

### JSON Serialization

```javascript
// Store objects/arrays as JSON
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Serialize to JSON
localStorage.setItem('user', JSON.stringify(user));

// Parse back to object
const storedUser = JSON.parse(localStorage.getItem('user'));
console.log(storedUser.name);  // 'John'
console.log(storedUser.preferences.theme);  // 'dark'
```

### Handling Parse Errors

```javascript
// Safe parsing function
function getJSON(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error parsing ${key}:`, error);
    return defaultValue;
  }
}

// Safe setting function
function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return false;
  }
}

// Usage
setJSON('settings', { theme: 'dark' });
const settings = getJSON('settings', { theme: 'light' });
```

### Storage Wrapper

```javascript
class Storage {
  constructor(storage = localStorage) {
    this.storage = storage;
  }
  
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch {
      return defaultValue;
    }
  }
  
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      }
      return false;
    }
  }
  
  remove(key) {
    this.storage.removeItem(key);
  }
  
  clear() {
    this.storage.clear();
  }
  
  has(key) {
    return this.storage.getItem(key) !== null;
  }
  
  keys() {
    return Object.keys(this.storage);
  }
}

// Usage
const store = new Storage(localStorage);
store.set('user', { name: 'John' });
const user = store.get('user');
```

---

## 5.1.4 Storage Event

### Cross-Tab Communication

```javascript
// Fires when localStorage changes in ANOTHER tab/window
window.addEventListener('storage', (e) => {
  console.log('Storage changed!');
  console.log('Key:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
  console.log('URL:', e.url);
  console.log('Storage area:', e.storageArea);
});

// ⚠️ Does NOT fire in the tab that made the change
// Only fires in OTHER tabs/windows with same origin
```

### Event Properties

```javascript
window.addEventListener('storage', (e) => {
  // Key that was changed (null if clear() was called)
  if (e.key === null) {
    console.log('Storage was cleared');
    return;
  }
  
  if (e.key === 'user') {
    const newUser = e.newValue ? JSON.parse(e.newValue) : null;
    updateUserUI(newUser);
  }
});
```

### Syncing State Across Tabs

```javascript
// Update UI when settings change in another tab
window.addEventListener('storage', (e) => {
  if (e.key === 'theme') {
    applyTheme(e.newValue);
  }
  
  if (e.key === 'authToken') {
    if (e.newValue === null) {
      // Logged out in another tab
      redirectToLogin();
    } else if (e.oldValue === null) {
      // Logged in from another tab
      refreshUserState();
    }
  }
});
```

### Broadcasting Messages

```javascript
// Simple cross-tab messaging
function broadcast(type, data) {
  localStorage.setItem('broadcast', JSON.stringify({
    type,
    data,
    timestamp: Date.now()
  }));
  // Remove immediately (the event already fired)
  localStorage.removeItem('broadcast');
}

// Listen for broadcasts
window.addEventListener('storage', (e) => {
  if (e.key === 'broadcast' && e.newValue) {
    const message = JSON.parse(e.newValue);
    handleBroadcast(message);
  }
});

// Usage
broadcast('logout', { userId: 123 });
```

---

## 5.1.5 Storage Limits

### Quota

```javascript
// Typical limits:
// - 5MB per origin (varies by browser)
// - Each character in a string = 2 bytes (UTF-16)

// Check if storage is available
function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (
      e.code === 22 ||
      e.code === 1014 ||
      e.name === 'QuotaExceededError' ||
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    ) && storage && storage.length !== 0;
  }
}

if (storageAvailable('localStorage')) {
  // Use localStorage
} else {
  // Fall back to other storage or warn user
}
```

### Handling QuotaExceededError

```javascript
function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Storage is full
      console.error('Storage quota exceeded');
      
      // Option 1: Clear old items
      cleanupOldItems();
      
      // Option 2: Warn user
      showStorageWarning();
      
      return false;
    }
    throw error;
  }
}

function cleanupOldItems() {
  // Example: remove items with timestamps older than 7 days
  const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
  
  Object.keys(localStorage).forEach(key => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (item.timestamp && item.timestamp < oneWeekAgo) {
        localStorage.removeItem(key);
      }
    } catch {
      // Not JSON, skip
    }
  });
}
```

### Estimating Usage

```javascript
// Rough estimate of storage usage
function getStorageSize(storage = localStorage) {
  let total = 0;
  
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    const value = storage.getItem(key);
    // Each char is 2 bytes in JS strings (UTF-16)
    total += (key.length + value.length) * 2;
  }
  
  return {
    bytes: total,
    kb: (total / 1024).toFixed(2),
    mb: (total / (1024 * 1024)).toFixed(4)
  };
}

console.log(getStorageSize());
// { bytes: 10240, kb: '10.00', mb: '0.0098' }
```

---

## 5.1.6 Common Patterns

### User Preferences

```javascript
const defaults = {
  theme: 'light',
  fontSize: 16,
  notifications: true,
  language: 'en'
};

function getPreferences() {
  const stored = localStorage.getItem('preferences');
  if (stored) {
    return { ...defaults, ...JSON.parse(stored) };
  }
  return defaults;
}

function setPreference(key, value) {
  const prefs = getPreferences();
  prefs[key] = value;
  localStorage.setItem('preferences', JSON.stringify(prefs));
}

// Usage
const prefs = getPreferences();
setPreference('theme', 'dark');
```

### Draft Auto-Save

```javascript
const form = document.querySelector('form');
const storageKey = `draft-${form.id}`;

// Save draft on input
form.addEventListener('input', () => {
  const data = Object.fromEntries(new FormData(form));
  localStorage.setItem(storageKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
});

// Restore draft on load
function restoreDraft() {
  const draft = localStorage.getItem(storageKey);
  if (!draft) return;
  
  const { data, timestamp } = JSON.parse(draft);
  
  // Check if draft is recent (within 24 hours)
  if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
    localStorage.removeItem(storageKey);
    return;
  }
  
  // Restore values
  Object.entries(data).forEach(([name, value]) => {
    const field = form.elements[name];
    if (field) field.value = value;
  });
}

// Clear draft on submit
form.addEventListener('submit', () => {
  localStorage.removeItem(storageKey);
});
```

### Cache with Expiry

```javascript
function setWithExpiry(key, value, ttlMs) {
  const item = {
    value,
    expiry: Date.now() + ttlMs
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key) {
  const item = localStorage.getItem(key);
  if (!item) return null;
  
  const { value, expiry } = JSON.parse(item);
  
  if (Date.now() > expiry) {
    localStorage.removeItem(key);
    return null;
  }
  
  return value;
}

// Usage
setWithExpiry('cache:api-data', apiResponse, 5 * 60 * 1000);  // 5 minutes
const cached = getWithExpiry('cache:api-data');
```

---

## 5.1.7 Gotchas

```javascript
// ❌ Storing non-strings directly
localStorage.setItem('obj', { a: 1 });
console.log(localStorage.getItem('obj'));  // "[object Object]"

// ✅ Use JSON.stringify
localStorage.setItem('obj', JSON.stringify({ a: 1 }));

// ❌ Not handling null for missing keys
const value = localStorage.getItem('missing').toLowerCase();
// TypeError: Cannot read property 'toLowerCase' of null

// ✅ Check for null
const value = localStorage.getItem('missing');
if (value !== null) {
  console.log(value.toLowerCase());
}

// ❌ Storing sensitive data
localStorage.setItem('password', 'secret123');
// Accessible via DevTools, XSS attacks, extensions

// ✅ Never store sensitive data in localStorage
// Use secure, httpOnly cookies for tokens

// ❌ Relying on localStorage in private/incognito mode
// Some browsers: localStorage throws in private mode
// Safari: localStorage works but is cleared on exit

// ✅ Always check availability
if (typeof localStorage !== 'undefined') {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    // localStorage is available
  } catch (e) {
    // localStorage not available
  }
}
```

---

## 5.1.8 Summary

### Methods

| Method | Description |
|--------|-------------|
| `setItem(key, value)` | Store value |
| `getItem(key)` | Retrieve value (or null) |
| `removeItem(key)` | Delete key |
| `clear()` | Delete all keys |
| `key(index)` | Get key by index |
| `length` | Number of items |

### localStorage vs sessionStorage

| Feature | localStorage | sessionStorage |
|---------|-------------|----------------|
| Lifetime | Permanent | Session (tab) |
| Scope | All tabs | Single tab |
| Storage event | Yes | Yes |

### Storage Event Properties

| Property | Description |
|----------|-------------|
| `key` | Changed key (null if clear) |
| `oldValue` | Previous value |
| `newValue` | New value |
| `url` | Page URL |
| `storageArea` | Storage object |

### Best Practices

1. **Always use JSON** for objects/arrays
2. **Handle QuotaExceededError** for large data
3. **Never store sensitive data** (passwords, tokens)
4. **Check availability** before using
5. **Use storage event** for cross-tab sync
6. **Implement expiry** for cached data

---

**End of Chapter 5.1: Web Storage**

Next chapter: **5.2 Cookies** — covers reading, writing, and managing cookies with JavaScript.
