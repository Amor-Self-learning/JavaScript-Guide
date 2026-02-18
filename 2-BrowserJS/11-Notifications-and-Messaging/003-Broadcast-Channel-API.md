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
