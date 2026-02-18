# 19.1 Permission Queries

The Permissions API provides a consistent way to query and monitor the status of user permissions. This chapter covers querying permissions and handling permission changes.

---

## 19.1.1 Basic Query

### Check Permission Status

```javascript
async function checkPermission(name) {
  try {
    const result = await navigator.permissions.query({ name });
    console.log(`${name}: ${result.state}`);
    return result.state;
  } catch (error) {
    console.error(`Permission '${name}' not supported:`, error);
    return 'unsupported';
  }
}

// Usage
const status = await checkPermission('geolocation');
// Returns: 'granted', 'denied', or 'prompt'
```

---

## 19.1.2 Permission States

### State Values

```javascript
// 'granted' - Permission has been granted
// 'denied' - Permission has been denied
// 'prompt' - User will be prompted when API is used

const result = await navigator.permissions.query({ name: 'camera' });

switch (result.state) {
  case 'granted':
    startCamera();
    break;
    
  case 'denied':
    showPermissionDeniedMessage();
    break;
    
  case 'prompt':
    showPermissionExplanation();
    break;
}
```

---

## 19.1.3 Available Permissions

### Common Permissions

```javascript
// Geolocation
await navigator.permissions.query({ name: 'geolocation' });

// Notifications
await navigator.permissions.query({ name: 'notifications' });

// Camera
await navigator.permissions.query({ name: 'camera' });

// Microphone
await navigator.permissions.query({ name: 'microphone' });

// Clipboard
await navigator.permissions.query({ name: 'clipboard-read' });
await navigator.permissions.query({ name: 'clipboard-write' });

// Push notifications
await navigator.permissions.query({ name: 'push', userVisibleOnly: true });

// MIDI
await navigator.permissions.query({ name: 'midi', sysex: true });
```

### Check Multiple

```javascript
async function checkAllPermissions() {
  const permissions = [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'clipboard-read'
  ];
  
  const results = {};
  
  for (const name of permissions) {
    try {
      const result = await navigator.permissions.query({ name });
      results[name] = result.state;
    } catch {
      results[name] = 'unsupported';
    }
  }
  
  return results;
}
```

---

## 19.1.4 Permission Change Events

### Monitor Changes

```javascript
async function watchPermission(name, callback) {
  try {
    const permission = await navigator.permissions.query({ name });
    
    // Initial state
    callback(permission.state);
    
    // Watch for changes
    permission.addEventListener('change', () => {
      callback(permission.state);
    });
    
    return permission;
  } catch (error) {
    console.error('Cannot watch permission:', error);
  }
}

// Usage
watchPermission('geolocation', (state) => {
  console.log('Geolocation permission:', state);
  updateUI(state);
});
```

### Update UI on Change

```javascript
const indicator = document.getElementById('location-status');

const permission = await navigator.permissions.query({ name: 'geolocation' });

function updateIndicator() {
  indicator.className = `status-${permission.state}`;
  indicator.textContent = permission.state;
}

permission.addEventListener('change', updateIndicator);
updateIndicator();
```

---

## 19.1.5 Permission with Options

### Device-Specific Permissions

```javascript
// Specific camera
const camera = await navigator.permissions.query({
  name: 'camera',
  // deviceId: 'specific-camera-id'  // If supported
});

// Push with user-visible requirement
const push = await navigator.permissions.query({
  name: 'push',
  userVisibleOnly: true
});

// MIDI with system exclusive
const midi = await navigator.permissions.query({
  name: 'midi',
  sysex: true
});
```

---

## 19.1.6 Permission Manager Class

### Reusable Manager

```javascript
class PermissionManager {
  constructor() {
    this.permissions = new Map();
    this.listeners = new Map();
  }
  
  async check(name, options = {}) {
    try {
      const descriptor = { name, ...options };
      const status = await navigator.permissions.query(descriptor);
      
      this.permissions.set(name, status);
      
      return status.state;
    } catch (error) {
      return 'unsupported';
    }
  }
  
  async watch(name, callback, options = {}) {
    const state = await this.check(name, options);
    callback(state);
    
    const status = this.permissions.get(name);
    if (status) {
      const handler = () => callback(status.state);
      status.addEventListener('change', handler);
      this.listeners.set(name, handler);
    }
  }
  
  unwatch(name) {
    const status = this.permissions.get(name);
    const handler = this.listeners.get(name);
    
    if (status && handler) {
      status.removeEventListener('change', handler);
      this.listeners.delete(name);
    }
  }
  
  async checkMultiple(names) {
    const results = {};
    
    await Promise.all(names.map(async (name) => {
      results[name] = await this.check(name);
    }));
    
    return results;
  }
}

// Usage
const pm = new PermissionManager();

pm.watch('geolocation', (state) => {
  console.log('Location permission:', state);
});

const allPermissions = await pm.checkMultiple([
  'geolocation',
  'notifications',
  'camera'
]);
```

---

## 19.1.7 Request Patterns

### Request After Check

```javascript
async function requestNotificationPermission() {
  // Check first
  const status = await navigator.permissions.query({ name: 'notifications' });
  
  if (status.state === 'granted') {
    return true;
  }
  
  if (status.state === 'denied') {
    showSettingsInstructions();
    return false;
  }
  
  // State is 'prompt' - request permission
  const result = await Notification.requestPermission();
  return result === 'granted';
}
```

### Request with Explanation

```javascript
async function requestCameraWithExplanation() {
  const status = await navigator.permissions.query({ name: 'camera' });
  
  if (status.state === 'prompt') {
    // Show explanation before requesting
    const confirmed = await showModal(
      'Camera Access',
      'We need camera access to enable video calls.',
      ['Allow', 'Cancel']
    );
    
    if (!confirmed) return false;
  }
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return stream;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      showPermissionDeniedMessage();
    }
    return null;
  }
}
```

---

## 19.1.8 Browser Support

### Feature Detection

```javascript
function isPermissionsSupported() {
  return 'permissions' in navigator;
}

async function isPermissionSupported(name) {
  if (!isPermissionsSupported()) return false;
  
  try {
    await navigator.permissions.query({ name });
    return true;
  } catch {
    return false;
  }
}

// Fallback
async function getPermissionState(name) {
  if (await isPermissionSupported(name)) {
    const result = await navigator.permissions.query({ name });
    return result.state;
  }
  
  // Fallback for unsupported browsers
  return 'unknown';
}
```

---

## 19.1.9 Summary

### Query Method

```javascript
navigator.permissions.query(descriptor)
// Returns: Promise<PermissionStatus>
```

### Permission Descriptor

| Property | Type | Description |
|----------|------|-------------|
| `name` | String | Permission name |
| Other | Various | API-specific options |

### PermissionStatus

| Property | Type | Description |
|----------|------|-------------|
| `state` | String | 'granted', 'denied', 'prompt' |
| `name` | String | Permission name |

### Events

| Event | When |
|-------|------|
| `change` | Permission state changes |

### Common Permissions

| Name | API |
|------|-----|
| `geolocation` | Geolocation API |
| `notifications` | Notifications API |
| `camera` | MediaDevices |
| `microphone` | MediaDevices |
| `push` | Push API |
| `clipboard-read` | Clipboard API |
| `clipboard-write` | Clipboard API |

### Best Practices

1. **Check before requesting** to avoid unnecessary prompts
2. **Explain why** you need the permission
3. **Handle denial** gracefully
4. **Watch for changes** to update UI
5. **Feature detect** the Permissions API
6. **Provide fallbacks** for unsupported browsers

---

**End of Chapter 19.1: Permission Queries**

This completes Group 19 — Permissions API. Next section: **Group 20 — Screen APIs**.
