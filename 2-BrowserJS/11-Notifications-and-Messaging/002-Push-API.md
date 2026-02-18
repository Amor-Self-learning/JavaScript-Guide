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
