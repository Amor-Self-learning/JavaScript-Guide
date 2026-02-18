# 11.1 Notifications API

The Notifications API displays system-level notifications to users. This chapter covers requesting permission, creating notifications, and handling notification events.

---

## 11.1.1 Notifications Overview

### What Are Web Notifications?

```javascript
// Web Notifications:
// - System-level alerts outside the browser
// - Work even when browser is minimized
// - Require user permission
// - Support icons, badges, and actions
// - Can be triggered from Service Workers
```

### Check Support

```javascript
if ('Notification' in window) {
  console.log('Notifications supported');
}
```

---

## 11.1.2 Requesting Permission

### Permission States

```javascript
// Check current permission
console.log(Notification.permission);
// 'default' - not yet asked
// 'granted' - permission given
// 'denied'  - permission refused
```

### Request Permission

```javascript
async function requestNotificationPermission() {
  // Check if already granted
  if (Notification.permission === 'granted') {
    return true;
  }
  
  // Check if already denied
  if (Notification.permission === 'denied') {
    console.log('Notifications blocked by user');
    return false;
  }
  
  // Request permission
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Best practice: request on user action
document.getElementById('enable-notifications').addEventListener('click', async () => {
  const granted = await requestNotificationPermission();
  if (granted) {
    showNotification('Notifications enabled!');
  }
});
```

---

## 11.1.3 Creating Notifications

### Basic Notification

```javascript
// Simple notification
new Notification('Hello World!');

// With options
new Notification('New Message', {
  body: 'You have a new message from John',
  icon: '/icons/notification.png'
});
```

### Notification Options

```javascript
const notification = new Notification('Notification Title', {
  // Text content
  body: 'This is the notification body text',
  
  // Visual
  icon: '/icons/icon-192.png',      // Main icon
  badge: '/icons/badge-72.png',      // Small icon (Android)
  image: '/images/large-image.jpg',  // Large image
  
  // Behavior
  tag: 'message-group-1',            // Replace same-tag notifications
  renotify: true,                    // Notify even if replacing
  requireInteraction: false,         // Stay until dismissed
  silent: false,                     // Play sound
  
  // Data
  data: { messageId: 123 },          // Custom data
  timestamp: Date.now(),             // When event occurred
  
  // Direction
  dir: 'auto',                       // 'ltr', 'rtl', or 'auto'
  lang: 'en-US'                      // Language
});
```

### Actions (Service Worker only)

```javascript
// In Service Worker
self.registration.showNotification('New Message', {
  body: 'John: Hey, are you free tonight?',
  icon: '/icons/icon.png',
  actions: [
    {
      action: 'reply',
      title: 'Reply',
      icon: '/icons/reply.png'
    },
    {
      action: 'dismiss',
      title: 'Dismiss',
      icon: '/icons/dismiss.png'
    }
  ],
  data: { messageId: 123 }
});
```

---

## 11.1.4 Notification Events

### Event Handlers

```javascript
const notification = new Notification('Click me', {
  body: 'Click to open the app'
});

// Notification clicked
notification.onclick = (event) => {
  event.preventDefault();
  window.focus();
  window.location.href = '/messages';
  notification.close();
};

// Notification closed
notification.onclose = () => {
  console.log('Notification closed');
};

// Notification shown
notification.onshow = () => {
  console.log('Notification displayed');
};

// Error occurred
notification.onerror = (error) => {
  console.error('Notification error:', error);
};
```

### Auto-Close

```javascript
const notification = new Notification('Temporary', {
  body: 'This will close in 5 seconds'
});

// Auto-close after 5 seconds
setTimeout(() => {
  notification.close();
}, 5000);
```

---

## 11.1.5 Service Worker Notifications

### Show from Service Worker

```javascript
// sw.js
self.registration.showNotification('Background Notification', {
  body: 'Sent from Service Worker',
  icon: '/icons/icon.png',
  badge: '/icons/badge.png',
  tag: 'sw-notification',
  data: { url: '/notifications' }
});
```

### Handle Notification Click

```javascript
// sw.js
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle action clicks
  if (event.action === 'reply') {
    // Open reply page
    event.waitUntil(
      clients.openWindow('/reply')
    );
    return;
  }
  
  // Default click - focus or open window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Focus existing window
      for (const client of windowClients) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      return clients.openWindow(event.notification.data?.url || '/');
    })
  );
});
```

### Handle Notification Close

```javascript
// sw.js
self.addEventListener('notificationclose', (event) => {
  // Track dismissal
  const data = event.notification.data;
  console.log('Notification dismissed:', data);
  
  // Analytics
  event.waitUntil(
    fetch('/api/analytics/notification-dismissed', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  );
});
```

---

## 11.1.6 Notification Tags

### Replacing Notifications

```javascript
// First notification
new Notification('1 new message', {
  tag: 'messages',
  body: 'John: Hello!'
});

// Later, replace with updated notification
new Notification('2 new messages', {
  tag: 'messages',
  body: 'John: Hello!\nJane: Hi there!',
  renotify: true  // Alert user again
});
```

### Grouping Notifications

```javascript
// Group notifications by tag
function notifyNewMessage(message) {
  const tag = `chat-${message.roomId}`;
  
  new Notification(`New in ${message.roomName}`, {
    tag,
    body: `${message.sender}: ${message.text}`,
    data: { roomId: message.roomId },
    renotify: true
  });
}
```

---

## 11.1.7 Patterns

### Notification Manager

```javascript
class NotificationManager {
  constructor() {
    this.permission = Notification.permission;
  }
  
  async requestPermission() {
    if (this.permission === 'granted') return true;
    if (this.permission === 'denied') return false;
    
    this.permission = await Notification.requestPermission();
    return this.permission === 'granted';
  }
  
  canNotify() {
    return 'Notification' in window && this.permission === 'granted';
  }
  
  show(title, options = {}) {
    if (!this.canNotify()) {
      console.warn('Cannot show notification');
      return null;
    }
    
    const notification = new Notification(title, {
      icon: '/icons/default.png',
      ...options
    });
    
    // Auto-close after timeout
    if (options.timeout) {
      setTimeout(() => notification.close(), options.timeout);
    }
    
    return notification;
  }
  
  async showFromServiceWorker(title, options = {}) {
    if (!('serviceWorker' in navigator)) {
      return this.show(title, options);
    }
    
    const registration = await navigator.serviceWorker.ready;
    return registration.showNotification(title, options);
  }
}

const notifier = new NotificationManager();
```

### Notification Queue

```javascript
class NotificationQueue {
  constructor(maxVisible = 3, delay = 500) {
    this.queue = [];
    this.visible = 0;
    this.maxVisible = maxVisible;
    this.delay = delay;
  }
  
  add(title, options) {
    this.queue.push({ title, options });
    this.process();
  }
  
  process() {
    if (this.visible >= this.maxVisible || this.queue.length === 0) {
      return;
    }
    
    const { title, options } = this.queue.shift();
    this.visible++;
    
    const notification = new Notification(title, options);
    
    notification.onclose = () => {
      this.visible--;
      setTimeout(() => this.process(), this.delay);
    };
    
    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  }
}
```

---

## 11.1.8 Best Practices

### Permission UX

```javascript
// ❌ Bad: Request immediately on page load
Notification.requestPermission();

// ✅ Good: Request after user action with context
const enableBtn = document.getElementById('enable-notifications');
const explainer = document.getElementById('notification-explainer');

enableBtn.addEventListener('click', async () => {
  // Show explainer first
  explainer.textContent = 'We\'ll notify you when you receive new messages';
  
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    enableBtn.textContent = 'Notifications enabled ✓';
    enableBtn.disabled = true;
  } else if (permission === 'denied') {
    explainer.textContent = 'Notifications blocked. Enable in browser settings.';
  }
});
```

---

## 11.1.9 Summary

### Permission States

| State | Meaning |
|-------|---------|
| `default` | Not yet requested |
| `granted` | Permission given |
| `denied` | Permission refused |

### Notification Options

| Option | Description |
|--------|-------------|
| `body` | Message text |
| `icon` | Main icon |
| `badge` | Small badge icon |
| `image` | Large image |
| `tag` | Grouping/replacement |
| `actions` | Action buttons (SW only) |
| `data` | Custom data |

### Events

| Event | When |
|-------|------|
| `click` | Notification clicked |
| `close` | Notification closed |
| `show` | Notification displayed |
| `error` | Error occurred |

### Best Practices

1. **Request permission contextually** after user action
2. **Explain value** before requesting
3. **Use tags** to prevent notification spam
4. **Handle denied** state gracefully
5. **Keep notifications brief** and actionable
6. **Use Service Worker** for background notifications

---

**End of Chapter 11.1: Notifications API**

Next chapter: **11.2 Push API** — covers server-to-browser push messages.
