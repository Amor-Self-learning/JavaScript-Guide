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
# 11.2 Push API

The Push API enables servers to send messages to web applications, even when the app isn't open. This chapter covers push subscriptions, server integration, and handling push events.

---

## 11.2.1 Push API Overview

### How Push Works

```javascript
// Push API flow:
// 1. User grants notification permission
// 2. Browser subscribes to push service
// 3. Server stores subscription endpoint
// 4. Server sends push to browser's push service
// 5. Browser wakes Service Worker
// 6. Service Worker shows notification

// Components:
// - Push Service (browser vendor)
// - Application Server (your backend)
// - Service Worker (client-side)
// - VAPID keys (authentication)
```

### Requirements

```javascript
// Push API requires:
// - HTTPS (except localhost)
// - Service Worker
// - Notification permission
// - VAPID keys for authentication
```

---

## 11.2.2 VAPID Keys

### Generate Keys

```bash
# Using web-push library (Node.js)
npx web-push generate-vapid-keys
```

```javascript
// Output:
// Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
// Private Key: UUxI4O8-FbRouADVXc-hK3ltRAc8yWn4qQb5H5K1C8I
```

### Key Conversion

```javascript
// Convert base64 to Uint8Array for subscribe()
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
```

---

## 11.2.3 Subscribing to Push

### Subscribe User

```javascript
const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-...';

async function subscribeToPush() {
  // Check for Service Worker and Push support
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push not supported');
  }
  
  // Get service worker registration
  const registration = await navigator.serviceWorker.ready;
  
  // Check existing subscription
  let subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    return subscription;
  }
  
  // Subscribe to push
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,  // Must show notification
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  // Send subscription to server
  await sendSubscriptionToServer(subscription);
  
  return subscription;
}

async function sendSubscriptionToServer(subscription) {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  });
}
```

### Subscription Object

```javascript
// PushSubscription object
{
  endpoint: 'https://fcm.googleapis.com/fcm/send/...',
  expirationTime: null,
  keys: {
    p256dh: 'BNcRdreALRFX...',  // Encryption key
    auth: 'tBHItJI5svbpez...'   // Auth secret
  }
}

// Get subscription details
console.log(subscription.endpoint);
console.log(subscription.toJSON());
```

---

## 11.2.4 Server-Side Push

### Node.js with web-push

```javascript
// server.js
const webpush = require('web-push');

// Configure VAPID
webpush.setVapidDetails(
  'mailto:your@email.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Store subscriptions (use database in production)
const subscriptions = [];

// Save subscription endpoint
app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body;
  subscriptions.push(subscription);
  res.status(201).json({ message: 'Subscribed' });
});

// Send push notification
async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid - remove it
      removeSubscription(subscription);
    }
    throw error;
  }
}

// Send to all subscribers
async function broadcast(payload) {
  const results = await Promise.allSettled(
    subscriptions.map(sub => sendPushNotification(sub, payload))
  );
  
  return results;
}
```

### Push Payload

```javascript
// Server sends JSON payload
const payload = {
  title: 'New Message',
  body: 'You have a new message from John',
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72.png',
  url: '/messages/123',
  tag: 'message',
  data: {
    messageId: 123,
    senderId: 'john'
  }
};

await webpush.sendNotification(subscription, JSON.stringify(payload));
```

---

## 11.2.5 Handling Push Events

### Push Event in Service Worker

```javascript
// sw.js
self.addEventListener('push', (event) => {
  console.log('Push received');
  
  // Get payload
  let data = { title: 'Notification' };
  
  if (event.data) {
    data = event.data.json();
  }
  
  // Show notification
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    tag: data.tag,
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

### Handle Notification Click

```javascript
// sw.js
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const data = notification.data;
  const action = event.action;
  
  notification.close();
  
  // Handle action buttons
  if (action === 'view') {
    event.waitUntil(clients.openWindow(data.url));
    return;
  }
  
  if (action === 'dismiss') {
    return;
  }
  
  // Default click - open URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window
        for (const client of clientList) {
          if (client.url.includes(data.url) && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        return clients.openWindow(data.url || '/');
      })
  );
});
```

---

## 11.2.6 Subscription Management

### Unsubscribe

```javascript
async function unsubscribeFromPush() {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Unsubscribe from browser
    await subscription.unsubscribe();
    
    // Remove from server
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  }
}
```

### Check Subscription Status

```javascript
async function getPushSubscription() {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

async function isPushEnabled() {
  const subscription = await getPushSubscription();
  return subscription !== null;
}
```

### Subscription Refresh

```javascript
// Subscriptions can expire - handle refreshing
async function refreshSubscription() {
  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  
  if (subscription) {
    // Check if expired or about to expire
    if (subscription.expirationTime && 
        subscription.expirationTime < Date.now() + 86400000) {
      await subscription.unsubscribe();
      subscription = null;
    }
  }
  
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    
    await sendSubscriptionToServer(subscription);
  }
  
  return subscription;
}
```

---

## 11.2.7 Permission State

### Check Permission

```javascript
async function checkPushPermission() {
  const registration = await navigator.serviceWorker.ready;
  const permissionState = await registration.pushManager.permissionState({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });
  
  return permissionState;  // 'granted', 'denied', or 'prompt'
}
```

---

## 11.2.8 Complete Example

### Full Push Implementation

```javascript
// push-manager.js
class PushManager {
  constructor(vapidPublicKey) {
    this.vapidKey = vapidPublicKey;
  }
  
  async isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }
  
  async getSubscription() {
    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }
  
  async subscribe() {
    if (!(await this.isSupported())) {
      throw new Error('Push not supported');
    }
    
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
    
    const registration = await navigator.serviceWorker.ready;
    
    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
    });
    
    // Send to server
    await this.saveSubscription(subscription);
    
    return subscription;
  }
  
  async unsubscribe() {
    const subscription = await this.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      await this.removeSubscription(subscription);
    }
  }
  
  async saveSubscription(subscription) {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription.toJSON())
    });
  }
  
  async removeSubscription(subscription) {
    await fetch('/api/push/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint })
    });
  }
  
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }
}

// Usage
const pushManager = new PushManager(VAPID_PUBLIC_KEY);

document.getElementById('enable-push').addEventListener('click', async () => {
  try {
    await pushManager.subscribe();
    console.log('Push enabled');
  } catch (error) {
    console.error('Failed to enable push:', error);
  }
});
```

---

## 11.2.9 Summary

### Push Flow

| Step | Component | Action |
|------|-----------|--------|
| 1 | Client | Request permission |
| 2 | Client | Subscribe to push |
| 3 | Server | Store subscription |
| 4 | Server | Send push message |
| 5 | SW | Handle push event |
| 6 | SW | Show notification |

### Key Methods

| Method | Description |
|--------|-------------|
| `pushManager.subscribe()` | Subscribe to push |
| `pushManager.getSubscription()` | Get current subscription |
| `subscription.unsubscribe()` | Unsubscribe |

### Server Libraries

| Language | Library |
|----------|---------|
| Node.js | web-push |
| Python | pywebpush |
| PHP | web-push-php |
| Ruby | webpush |

### Best Practices

1. **Use VAPID keys** for authentication
2. **Handle subscription expiration** and refresh
3. **Remove invalid subscriptions** (410/404 errors)
4. **Keep payloads small** (< 4KB)
5. **Always show notification** (userVisibleOnly)
6. **Handle offline** — queue and retry

---

**End of Chapter 11.2: Push API**

Next chapter: **11.3 Broadcast Channel API** — covers cross-tab communication.
# 11.3 Broadcast Channel API

The Broadcast Channel API enables simple communication between browsing contexts (tabs, windows, iframes) of the same origin. This chapter covers channel creation, messaging, and common patterns.

---

## 11.3.1 Broadcast Channel Overview

### What Is Broadcast Channel?

```javascript
// Broadcast Channel:
// - Simple cross-tab communication
// - Same-origin only
// - Broadcast to all listeners (no targeting)
// - Works with tabs, windows, iframes, workers
// - Messages are cloned (structured clone)
```

### Check Support

```javascript
if ('BroadcastChannel' in window) {
  console.log('Broadcast Channel supported');
}
```

---

## 11.3.2 Creating Channels

### Basic Channel

```javascript
// Create channel (same name = same channel)
const channel = new BroadcastChannel('my-channel');

// Channel name identifies the channel
// All contexts with same name are connected
```

### Multiple Channels

```javascript
// Different channels for different purposes
const authChannel = new BroadcastChannel('auth');
const syncChannel = new BroadcastChannel('data-sync');
const uiChannel = new BroadcastChannel('ui-updates');
```

---

## 11.3.3 Sending Messages

### Basic Message

```javascript
const channel = new BroadcastChannel('updates');

// Send string
channel.postMessage('Hello, other tabs!');

// Send object
channel.postMessage({
  type: 'notification',
  text: 'New data available'
});

// Send array
channel.postMessage([1, 2, 3, 4, 5]);
```

### Message Types

```javascript
// Any structured-cloneable data
channel.postMessage('string');
channel.postMessage(123);
channel.postMessage({ key: 'value' });
channel.postMessage([1, 2, 3]);
channel.postMessage(new Date());
channel.postMessage(new Map([['a', 1]]));
channel.postMessage(new Set([1, 2, 3]));
channel.postMessage(new ArrayBuffer(8));

// NOT supported
// channel.postMessage(function() {});  // Functions
// channel.postMessage(document.body);   // DOM nodes
// channel.postMessage(Symbol('x'));     // Symbols
```

---

## 11.3.4 Receiving Messages

### Message Handler

```javascript
const channel = new BroadcastChannel('updates');

// Using onmessage
channel.onmessage = (event) => {
  console.log('Received:', event.data);
  console.log('Origin:', event.origin);
};

// Using addEventListener
channel.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});

// Note: Sender does NOT receive their own message
```

### Message Event Properties

```javascript
channel.onmessage = (event) => {
  event.data;         // The message data
  event.origin;       // Origin of sender
  event.lastEventId;  // Always empty string
  event.source;       // Always null
  event.ports;        // Always empty array
};
```

---

## 11.3.5 Closing Channels

### Close Channel

```javascript
const channel = new BroadcastChannel('updates');

// Close when done
channel.close();

// After closing:
// - Cannot send messages
// - Will not receive messages
// - Channel object is unusable
```

### Cleanup Pattern

```javascript
class TabSync {
  constructor() {
    this.channel = new BroadcastChannel('tab-sync');
    this.setupListeners();
  }
  
  setupListeners() {
    this.channel.onmessage = (e) => this.handleMessage(e);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.channel.close();
    });
  }
  
  handleMessage(event) {
    // Handle message
  }
  
  send(message) {
    this.channel.postMessage(message);
  }
  
  destroy() {
    this.channel.close();
  }
}
```

---

## 11.3.6 Common Patterns

### User Authentication Sync

```javascript
// Sync login/logout across tabs
const authChannel = new BroadcastChannel('auth');

// On login
function onLogin(user) {
  authChannel.postMessage({
    type: 'LOGIN',
    user
  });
}

// On logout
function onLogout() {
  authChannel.postMessage({
    type: 'LOGOUT'
  });
}

// Listen for auth changes
authChannel.onmessage = (event) => {
  if (event.data.type === 'LOGIN') {
    // Update UI with logged-in user
    updateUserUI(event.data.user);
  }
  
  if (event.data.type === 'LOGOUT') {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

### Theme Sync

```javascript
// Sync theme preference across tabs
const themeChannel = new BroadcastChannel('theme');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Notify other tabs
  themeChannel.postMessage({ theme });
}

themeChannel.onmessage = (event) => {
  const { theme } = event.data;
  document.documentElement.setAttribute('data-theme', theme);
};
```

### Cart Sync

```javascript
// Sync shopping cart across tabs
class CartSync {
  constructor() {
    this.channel = new BroadcastChannel('cart');
    this.cart = this.loadCart();
    
    this.channel.onmessage = (e) => {
      this.cart = e.data.cart;
      this.updateUI();
    };
  }
  
  loadCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }
  
  addItem(item) {
    this.cart.push(item);
    this.save();
    this.broadcast();
  }
  
  removeItem(id) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.save();
    this.broadcast();
  }
  
  save() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }
  
  broadcast() {
    this.channel.postMessage({ cart: this.cart });
  }
  
  updateUI() {
    // Update cart UI
  }
}
```

### Tab Activity Tracking

```javascript
// Track which tab is active
const activityChannel = new BroadcastChannel('activity');
let tabId = Date.now().toString();

// Announce when becoming active
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    activityChannel.postMessage({
      type: 'TAB_ACTIVE',
      tabId
    });
  }
});

// Listen for other tabs
activityChannel.onmessage = (event) => {
  if (event.data.type === 'TAB_ACTIVE' && event.data.tabId !== tabId) {
    // Another tab became active
    pauseExpensiveOperations();
  }
};
```

---

## 11.3.7 Leader Election

### Simple Leader Election

```javascript
class TabLeader {
  constructor() {
    this.channel = new BroadcastChannel('leader-election');
    this.isLeader = false;
    this.tabId = Math.random().toString(36).substring(2);
    this.leaderId = null;
    
    this.channel.onmessage = (e) => this.handleMessage(e);
    
    // Attempt to become leader
    this.requestLeadership();
    
    // Heartbeat
    setInterval(() => this.heartbeat(), 5000);
  }
  
  requestLeadership() {
    this.channel.postMessage({
      type: 'LEADER_REQUEST',
      tabId: this.tabId
    });
    
    // If no response, become leader
    setTimeout(() => {
      if (!this.leaderId) {
        this.becomeLeader();
      }
    }, 100);
  }
  
  becomeLeader() {
    this.isLeader = true;
    this.leaderId = this.tabId;
    
    this.channel.postMessage({
      type: 'LEADER_ANNOUNCE',
      tabId: this.tabId
    });
    
    console.log('This tab is now the leader');
  }
  
  handleMessage(event) {
    const { type, tabId } = event.data;
    
    if (type === 'LEADER_REQUEST' && this.isLeader) {
      // Already have a leader
      this.channel.postMessage({
        type: 'LEADER_ANNOUNCE',
        tabId: this.tabId
      });
    }
    
    if (type === 'LEADER_ANNOUNCE') {
      this.leaderId = tabId;
      if (tabId !== this.tabId) {
        this.isLeader = false;
      }
    }
    
    if (type === 'LEADER_RESIGN' && tabId === this.leaderId) {
      this.leaderId = null;
      this.requestLeadership();
    }
  }
  
  heartbeat() {
    if (this.isLeader) {
      this.channel.postMessage({
        type: 'LEADER_HEARTBEAT',
        tabId: this.tabId
      });
    }
  }
  
  resign() {
    if (this.isLeader) {
      this.channel.postMessage({
        type: 'LEADER_RESIGN',
        tabId: this.tabId
      });
      this.isLeader = false;
    }
  }
}
```

---

## 11.3.8 Summary

### Key Methods

| Method | Description |
|--------|-------------|
| `new BroadcastChannel(name)` | Create/join channel |
| `channel.postMessage(data)` | Send message |
| `channel.close()` | Close channel |

### Event Properties

| Property | Description |
|----------|-------------|
| `event.data` | Message payload |
| `event.origin` | Sender origin |

### Use Cases

| Use Case | Description |
|----------|-------------|
| Auth sync | Login/logout across tabs |
| Settings sync | Theme, preferences |
| Data sync | Cart, notifications |
| Coordination | Leader election |

### Limitations

- Same origin only
- No targeting (broadcast only)
- No message acknowledgment
- Sender doesn't receive own message

### Best Practices

1. **Use descriptive channel names**
2. **Structure messages** with type field
3. **Close channels** on unload
4. **Handle missing support** gracefully
5. **Don't rely on message order**
6. **Use for sync, not primary storage**

---

**End of Chapter 11.3: Broadcast Channel API**

Next chapter: **11.4 Channel Messaging API** — covers targeted messaging with MessageChannel.
# 11.4 Channel Messaging API

The Channel Messaging API provides a way to create direct communication channels between browsing contexts. Unlike Broadcast Channel, it enables targeted one-to-one messaging via MessageChannel and MessagePort.

---

## 11.4.1 Channel Messaging Overview

### What Is Channel Messaging?

```javascript
// Channel Messaging provides:
// - Direct communication between two contexts
// - Two linked MessagePorts
// - One-to-one messaging (not broadcast)
// - Can be transferred to workers, iframes
// - Bidirectional communication
```

### Components

```javascript
// MessageChannel - creates port pair
const channel = new MessageChannel();

// MessagePort - communication endpoint
channel.port1  // One end
channel.port2  // Other end

// Messages sent on port1 arrive at port2 and vice versa
```

---

## 11.4.2 MessageChannel

### Creating a Channel

```javascript
// Create channel
const channel = new MessageChannel();

// Send port2 somewhere else (iframe, worker)
iframe.contentWindow.postMessage('init', '*', [channel.port2]);

// Use port1 locally
channel.port1.onmessage = (event) => {
  console.log('Received:', event.data);
};

channel.port1.start();
channel.port1.postMessage('Hello from main!');
```

### Port Properties

```javascript
const channel = new MessageChannel();

// port1 and port2 are MessagePort objects
// Messages sent on one arrive at the other
channel.port1.postMessage('Hello');  // Arrives at port2
channel.port2.postMessage('Hi');     // Arrives at port1
```

---

## 11.4.3 MessagePort

### Basic Usage

```javascript
const channel = new MessageChannel();
const port = channel.port1;

// Send message
port.postMessage('Hello');
port.postMessage({ type: 'data', value: 42 });
port.postMessage([1, 2, 3]);

// Receive messages
port.onmessage = (event) => {
  console.log('Received:', event.data);
};

// Or with addEventListener (requires start())
port.addEventListener('message', (event) => {
  console.log('Received:', event.data);
});
port.start();  // Required when using addEventListener
```

### Port Methods

```javascript
// postMessage - send data
port.postMessage(data);
port.postMessage(data, [transferable]);

// start - begin receiving (only needed with addEventListener)
port.start();

// close - close the port
port.close();
```

### Message Error

```javascript
port.onmessageerror = (event) => {
  console.error('Failed to deserialize message');
};
```

---

## 11.4.4 Transferring Ports

### To Iframe

```javascript
// Parent page
const iframe = document.querySelector('iframe');
const channel = new MessageChannel();

// Send port2 to iframe
iframe.contentWindow.postMessage('port', '*', [channel.port2]);

// Use port1 locally
channel.port1.onmessage = (e) => console.log('From iframe:', e.data);
channel.port1.start();
```

```javascript
// Iframe
window.onmessage = (event) => {
  if (event.data === 'port') {
    const port = event.ports[0];
    
    port.onmessage = (e) => console.log('From parent:', e.data);
    port.start();
    
    port.postMessage('Hello from iframe!');
  }
};
```

### To Worker

```javascript
// Main thread
const worker = new Worker('worker.js');
const channel = new MessageChannel();

// Send port2 to worker
worker.postMessage({ type: 'port' }, [channel.port2]);

// Use port1
channel.port1.onmessage = (e) => console.log('From worker:', e.data);
channel.port1.start();
```

```javascript
// worker.js
self.onmessage = (event) => {
  if (event.data.type === 'port') {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      console.log('From main:', e.data);
      port.postMessage('Response from worker');
    };
    port.start();
  }
};
```

---

## 11.4.5 Transferable Objects

### Transferring Data

```javascript
const channel = new MessageChannel();

// Transfer ArrayBuffer (moves, not copies)
const buffer = new ArrayBuffer(1024 * 1024);
channel.port1.postMessage(buffer, [buffer]);
// buffer.byteLength is now 0

// Transfer multiple objects
const buffer1 = new ArrayBuffer(1024);
const buffer2 = new ArrayBuffer(1024);
channel.port1.postMessage(
  { a: buffer1, b: buffer2 },
  [buffer1, buffer2]
);
```

### Transferable Types

```javascript
// Types that can be transferred:
// - ArrayBuffer
// - MessagePort
// - ImageBitmap
// - OffscreenCanvas
// - ReadableStream
// - WritableStream
// - TransformStream

// Transfer port to another context
const newChannel = new MessageChannel();
someOtherPort.postMessage({ port: newChannel.port2 }, [newChannel.port2]);
```

---

## 11.4.6 Common Patterns

### Request-Response

```javascript
// Request-response pattern
class PortRPC {
  constructor(port) {
    this.port = port;
    this.pending = new Map();
    this.nextId = 0;
    
    this.port.onmessage = (e) => this.handleMessage(e);
    this.port.start();
  }
  
  handleMessage(event) {
    const { id, type, result, error } = event.data;
    
    if (type === 'response') {
      const { resolve, reject } = this.pending.get(id);
      this.pending.delete(id);
      
      if (error) reject(new Error(error));
      else resolve(result);
    }
  }
  
  call(method, args) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      
      this.port.postMessage({
        id,
        type: 'request',
        method,
        args
      });
    });
  }
}

// Server side (worker or iframe)
class PortRPCServer {
  constructor(port, handlers) {
    this.port = port;
    this.handlers = handlers;
    
    this.port.onmessage = (e) => this.handleMessage(e);
    this.port.start();
  }
  
  async handleMessage(event) {
    const { id, type, method, args } = event.data;
    
    if (type === 'request') {
      try {
        const handler = this.handlers[method];
        if (!handler) throw new Error(`Unknown method: ${method}`);
        
        const result = await handler(...args);
        this.port.postMessage({ id, type: 'response', result });
      } catch (error) {
        this.port.postMessage({ id, type: 'response', error: error.message });
      }
    }
  }
}
```

### Iframe Communication

```javascript
// Parent page - iframe manager
class IframeBridge {
  constructor(iframe) {
    this.iframe = iframe;
    this.ready = this.init();
  }
  
  async init() {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      this.port = channel.port1;
      
      this.port.onmessage = (e) => this.handleMessage(e);
      this.port.start();
      
      // Wait for iframe to load
      this.iframe.onload = () => {
        this.iframe.contentWindow.postMessage(
          { type: 'connect' },
          '*',
          [channel.port2]
        );
      };
      
      // Wait for ready message
      const originalHandler = this.handleMessage.bind(this);
      this.handleMessage = (e) => {
        if (e.data.type === 'ready') {
          this.handleMessage = originalHandler;
          resolve();
        }
      };
    });
  }
  
  handleMessage(event) {
    console.log('From iframe:', event.data);
  }
  
  send(message) {
    this.port.postMessage(message);
  }
}

// Iframe side
window.addEventListener('message', (event) => {
  if (event.data.type === 'connect' && event.ports[0]) {
    const port = event.ports[0];
    
    port.onmessage = (e) => {
      console.log('From parent:', e.data);
    };
    port.start();
    
    // Signal ready
    port.postMessage({ type: 'ready' });
    
    // Store for later use
    window.parentPort = port;
  }
});
```

### Worker Pool

```javascript
// Worker pool using MessageChannels
class WorkerPool {
  constructor(workerScript, size = 4) {
    this.workers = [];
    this.available = [];
    this.queue = [];
    
    for (let i = 0; i < size; i++) {
      const worker = new Worker(workerScript);
      this.workers.push(worker);
      this.available.push(worker);
    }
  }
  
  execute(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.processQueue();
    });
  }
  
  processQueue() {
    if (this.queue.length === 0 || this.available.length === 0) {
      return;
    }
    
    const worker = this.available.pop();
    const { task, resolve, reject } = this.queue.shift();
    
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (e) => {
      this.available.push(worker);
      
      if (e.data.error) {
        reject(new Error(e.data.error));
      } else {
        resolve(e.data.result);
      }
      
      this.processQueue();
    };
    
    channel.port1.start();
    worker.postMessage({ task }, [channel.port2]);
  }
  
  terminate() {
    this.workers.forEach(w => w.terminate());
  }
}
```

---

## 11.4.7 Summary

### Key Classes

| Class | Description |
|-------|-------------|
| `MessageChannel` | Creates linked port pair |
| `MessagePort` | Communication endpoint |

### MessagePort Methods

| Method | Description |
|--------|-------------|
| `postMessage(data, [transfers])` | Send message |
| `start()` | Begin receiving |
| `close()` | Close port |

### Events

| Event | When |
|-------|------|
| `message` | Message received |
| `messageerror` | Deserialization failed |

### Use Cases

| Scenario | Description |
|----------|-------------|
| Iframe communication | Direct parent-child messaging |
| Worker communication | Dedicated channel to worker |
| RPC patterns | Request-response messaging |
| Port transfer | Moving channels between contexts |

### Best Practices

1. **Use start()** when using addEventListener
2. **Close ports** when done
3. **Transfer large data** instead of copying
4. **Handle messageerror** for robustness
5. **Use RPC patterns** for request-response
6. **Consider Broadcast Channel** for one-to-many

---

**End of Chapter 11.4: Channel Messaging API**

This completes the Notifications and Messaging group. Next section: **Group 12 — Device APIs** — covers device hardware access.
