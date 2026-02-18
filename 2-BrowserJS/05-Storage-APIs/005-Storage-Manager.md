# 5.5 Storage Manager

The Storage Manager API provides methods to check storage quota, estimate usage, and request persistent storage. This chapter covers querying storage capacity, requesting persistence, and managing storage across different browser storage mechanisms.

---

## 5.5.1 Storage Manager Overview

### What Is Storage Manager?

```javascript
// Storage Manager API (navigator.storage):
// - Estimate storage quota and usage
// - Request persistent storage
// - Check persistence status
// - Unified across all storage types

// Covers all storage:
// - IndexedDB
// - Cache API
// - Service Worker registrations
// - Cookies (conceptually)
// - Web Storage (localStorage/sessionStorage)

// Access the API
const storage = navigator.storage;
```

### Browser Support

```javascript
// Check if Storage Manager is available
if ('storage' in navigator && 'estimate' in navigator.storage) {
  // Use Storage Manager API
  const estimate = await navigator.storage.estimate();
} else {
  // Fallback for older browsers
  console.log('Storage Manager not supported');
}
```

---

## 5.5.2 Estimating Storage

### navigator.storage.estimate()

```javascript
// Get storage quota and usage
const estimate = await navigator.storage.estimate();

console.log('Quota:', estimate.quota);           // Total available bytes
console.log('Usage:', estimate.usage);           // Currently used bytes
console.log('Available:', estimate.quota - estimate.usage);

// Format for display
function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  
  return `${bytes.toFixed(2)} ${units[i]}`;
}

console.log(`Used: ${formatBytes(estimate.usage)} of ${formatBytes(estimate.quota)}`);
// "Used: 15.50 MB of 2.00 GB"
```

### Usage Breakdown

```javascript
// Some browsers provide usage breakdown
const estimate = await navigator.storage.estimate();

if (estimate.usageDetails) {
  console.log('IndexedDB:', formatBytes(estimate.usageDetails.indexedDB || 0));
  console.log('Cache API:', formatBytes(estimate.usageDetails.caches || 0));
  console.log('Service Workers:', formatBytes(estimate.usageDetails.serviceWorkerRegistrations || 0));
}

// Example output:
// IndexedDB: 10.25 MB
// Cache API: 5.10 MB
// Service Workers: 0.15 MB
```

### Usage Percentage

```javascript
async function getStorageUsage() {
  const estimate = await navigator.storage.estimate();
  
  return {
    quota: estimate.quota,
    usage: estimate.usage,
    available: estimate.quota - estimate.usage,
    percentUsed: (estimate.usage / estimate.quota) * 100,
    percentAvailable: ((estimate.quota - estimate.usage) / estimate.quota) * 100
  };
}

const usage = await getStorageUsage();
console.log(`${usage.percentUsed.toFixed(2)}% used`);  // "0.75% used"
```

---

## 5.5.3 Persistent Storage

### Understanding Persistence

```javascript
// Browser storage is by default "best-effort"
// Browser may clear it under storage pressure:
// - Low disk space
// - User hasn't visited in a while
// - Storage quota exceeded

// Persistent storage survives storage pressure
// Only cleared by user action or explicit code

// Benefits of persistence:
// - Data won't be evicted automatically
// - More reliable for important data
// - User has more control
```

### Checking Persistence

```javascript
// Check if storage is persistent
const isPersisted = await navigator.storage.persisted();

if (isPersisted) {
  console.log('Storage is persistent');
} else {
  console.log('Storage may be cleared by browser');
}
```

### Requesting Persistence

```javascript
// Request persistent storage
const granted = await navigator.storage.persist();

if (granted) {
  console.log('Persistence granted!');
} else {
  console.log('Persistence denied');
}
```

### Persistence Criteria

```javascript
// Browsers decide persistence based on various factors:
// Chrome: 
// - Site is bookmarked
// - Has high engagement
// - Has push notifications enabled
// - Added to homescreen

// Firefox:
// - Prompts user

// Safari:
// - Limited persistence support

// Example: Request after user action
async function enablePersistence() {
  // First check if already persisted
  if (await navigator.storage.persisted()) {
    return true;
  }
  
  // Request persistence
  const granted = await navigator.storage.persist();
  
  if (!granted) {
    // Notify user they might lose data
    showWarning('Your data may be cleared by the browser under low storage conditions.');
  }
  
  return granted;
}
```

---

## 5.5.4 Storage Quota Management

### Handling Quota Exceeded

```javascript
async function safeStore(key, data) {
  try {
    await storeData(key, data);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      // Try to free up space
      await cleanupOldData();
      
      // Retry
      try {
        await storeData(key, data);
        return true;
      } catch (retryError) {
        console.error('Still quota exceeded after cleanup');
        return false;
      }
    }
    throw error;
  }
}
```

### Proactive Quota Management

```javascript
async function checkAndManageStorage() {
  const { usage, quota } = await navigator.storage.estimate();
  const percentUsed = (usage / quota) * 100;
  
  if (percentUsed > 80) {
    console.warn('Storage over 80% - consider cleanup');
    await cleanupCaches();
  }
  
  if (percentUsed > 95) {
    console.error('Storage critical - performing emergency cleanup');
    await emergencyCleanup();
  }
}

async function cleanupCaches() {
  const cacheNames = await caches.keys();
  
  // Delete old versioned caches
  for (const name of cacheNames) {
    if (name.includes('-old') || name.includes('-v1')) {
      await caches.delete(name);
    }
  }
}
```

---

## 5.5.5 Storage Buckets API (Emerging)

### Storage Buckets Overview

```javascript
// Storage Buckets API (Chrome 122+)
// Provides more granular storage management

// Check support
if ('storageBuckets' in navigator) {
  // Use Storage Buckets API
}

// Create a bucket
const bucket = await navigator.storageBuckets.open('user-data', {
  persisted: true,  // Request persistence
  durability: 'strict',  // Prioritize durability
  quota: 500 * 1024 * 1024  // Request 500MB
});

// Use bucket's storage
const indexedDB = bucket.indexedDB;
const caches = bucket.caches;
```

### Bucket Properties

```javascript
// Get bucket information
const bucket = await navigator.storageBuckets.open('app-data');

// Check estimated usage
const estimate = await bucket.estimate();
console.log('Bucket usage:', estimate.usage);
console.log('Bucket quota:', estimate.quota);

// Check persistence
const persisted = await bucket.persisted();

// Check durability
const durability = bucket.durability;  // 'strict' or 'relaxed'

// Get expiration
const expiration = await bucket.expires();  // Date or null
```

### Managing Buckets

```javascript
// List all buckets
const buckets = await navigator.storageBuckets.keys();
console.log(buckets);  // ['user-data', 'app-cache', ...]

// Delete a bucket (and all its data!)
await navigator.storageBuckets.delete('old-bucket');

// Set expiration
const bucket = await navigator.storageBuckets.open('session-data', {
  expires: Date.now() + (24 * 60 * 60 * 1000)  // 24 hours
});
```

---

## 5.5.6 Common Patterns

### Storage Status Component

```javascript
class StorageStatus {
  constructor() {
    this.update();
    
    // Update every minute
    setInterval(() => this.update(), 60000);
  }
  
  async update() {
    if (!navigator.storage?.estimate) {
      this.status = { supported: false };
      return;
    }
    
    const estimate = await navigator.storage.estimate();
    const persisted = await navigator.storage.persisted();
    
    this.status = {
      supported: true,
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota - estimate.usage,
      percentUsed: (estimate.usage / estimate.quota) * 100,
      persisted,
      usageDetails: estimate.usageDetails || null
    };
    
    this.render();
  }
  
  render() {
    const el = document.getElementById('storage-status');
    if (!el) return;
    
    const { status } = this;
    if (!status.supported) {
      el.textContent = 'Storage API not supported';
      return;
    }
    
    el.innerHTML = `
      <div>Storage: ${this.formatBytes(status.usage)} / ${this.formatBytes(status.quota)}</div>
      <div>Available: ${this.formatBytes(status.available)}</div>
      <div>Persistent: ${status.persisted ? '✅' : '❌'}</div>
      <progress value="${status.percentUsed}" max="100"></progress>
    `;
  }
  
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let i = 0;
    while (bytes >= 1024 && i < units.length - 1) {
      bytes /= 1024;
      i++;
    }
    return `${bytes.toFixed(1)} ${units[i]}`;
  }
}
```

### Request Persistence on Important Action

```javascript
async function saveImportantDocument(doc) {
  // Ensure persistence for important data
  if (navigator.storage) {
    const persisted = await navigator.storage.persisted();
    
    if (!persisted) {
      const granted = await navigator.storage.persist();
      
      if (!granted) {
        // Warn user but don't block
        showToast('Note: Your browser may clear offline data');
      }
    }
  }
  
  // Save the document
  await saveToIndexedDB(doc);
}
```

### Storage Monitor

```javascript
class StorageMonitor {
  constructor(thresholds = { warning: 80, critical: 95 }) {
    this.thresholds = thresholds;
    this.listeners = [];
  }
  
  addListener(callback) {
    this.listeners.push(callback);
  }
  
  async check() {
    const estimate = await navigator.storage.estimate();
    const percent = (estimate.usage / estimate.quota) * 100;
    
    let level = 'ok';
    if (percent >= this.thresholds.critical) {
      level = 'critical';
    } else if (percent >= this.thresholds.warning) {
      level = 'warning';
    }
    
    const event = {
      level,
      percent,
      usage: estimate.usage,
      quota: estimate.quota
    };
    
    this.listeners.forEach(cb => cb(event));
    return event;
  }
  
  startMonitoring(intervalMs = 60000) {
    this.check();  // Initial check
    this.interval = setInterval(() => this.check(), intervalMs);
  }
  
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
}

// Usage
const monitor = new StorageMonitor();
monitor.addListener(event => {
  if (event.level === 'critical') {
    performEmergencyCleanup();
  } else if (event.level === 'warning') {
    showStorageWarning();
  }
});
monitor.startMonitoring();
```

---

## 5.5.7 Gotchas

```javascript
// ❌ Assuming exact quota numbers
// estimate() returns estimates, not exact values
const { quota } = await navigator.storage.estimate();
// Don't rely on this for exact calculations

// ❌ Expecting persistence to always succeed
const granted = await navigator.storage.persist();
// May return false - always have fallback strategy

// ✅ Handle denied persistence gracefully
if (!granted) {
  // Continue but warn user
  // Or store less critical data only
}

// ❌ Not checking browser support
navigator.storage.estimate();  // Might throw

// ✅ Feature detection first
if (navigator.storage && navigator.storage.estimate) {
  // Safe to use
}

// ❌ Blocking on persistence request
// Some browsers prompt user - may take time
await navigator.storage.persist();  // Could wait for user

// ✅ Non-blocking persistence request
navigator.storage.persist().then(granted => {
  // Update UI accordingly
});

// ❌ Assuming usageDetails is always available
const { usageDetails } = await navigator.storage.estimate();
console.log(usageDetails.indexedDB);  // Might be undefined!

// ✅ Check before accessing
if (usageDetails?.indexedDB) {
  console.log(usageDetails.indexedDB);
}
```

---

## 5.5.8 Summary

### Storage Manager Methods

| Method | Description |
|--------|-------------|
| `estimate()` | Get quota and usage |
| `persisted()` | Check persistence status |
| `persist()` | Request persistence |

### estimate() Return Value

| Property | Description |
|----------|-------------|
| `quota` | Total available bytes |
| `usage` | Currently used bytes |
| `usageDetails` | Breakdown by storage type (optional) |

### Persistence Factors (Chrome)

| Factor | Impact |
|--------|--------|
| Site bookmarked | Increases chance |
| High engagement | Increases chance |
| Push notifications | Increases chance |
| Added to homescreen | Increases chance |

### Best Practices

1. **Check quota before large operations**
2. **Request persistence for important data**
3. **Handle persistence denial gracefully**
4. **Monitor storage usage over time**
5. **Implement cleanup strategies**
6. **Feature-detect before using API**

---

**End of Chapter 5.5: Storage Manager**

This completes the Storage APIs group. Next section: **Group 06 — Fetch and AJAX** — covers making HTTP requests from the browser.
