# 3.12 Custom Events

Custom events enable components to communicate without tight coupling. This chapter covers creating events with CustomEvent, dispatching them, passing data, and building event-driven architectures.

---

## 3.12.1 Creating Custom Events

### CustomEvent Constructor

```javascript
// Basic custom event
const event = new CustomEvent('myevent');

// Custom event with data
const eventWithData = new CustomEvent('userlogin', {
  detail: {
    userId: 123,
    username: 'alice',
    timestamp: Date.now()
  }
});

// Full options
const fullEvent = new CustomEvent('notification', {
  detail: { message: 'Hello!' },
  bubbles: true,       // Event bubbles up the DOM
  cancelable: true,    // Can be prevented with preventDefault()
  composed: true       // Crosses shadow DOM boundaries
});
```

### Event Constructor (Generic)

```javascript
// Basic Event (no detail property)
const event = new Event('customevent');

const bubblingEvent = new Event('customevent', {
  bubbles: true,
  cancelable: true
});

// Use CustomEvent when you need to pass data
// Use Event for simple notifications
```

---

## 3.12.2 Dispatching Events

### dispatchEvent

```javascript
// Dispatch on any element
const element = document.querySelector('#myComponent');

element.addEventListener('myevent', (e) => {
  console.log('Event received!');
});

element.dispatchEvent(new CustomEvent('myevent'));

// Dispatch with data
element.dispatchEvent(new CustomEvent('datachange', {
  detail: { newValue: 42 }
}));

// Dispatch returns false if event was cancelled
const event = new CustomEvent('action', { cancelable: true });
const wasNotCancelled = element.dispatchEvent(event);

if (!wasNotCancelled) {
  console.log('Event was cancelled');
}
```

### Dispatching on Document or Window

```javascript
// Global events often dispatch on document or window
document.dispatchEvent(new CustomEvent('app:ready', {
  detail: { version: '1.0.0' }
}));

window.dispatchEvent(new CustomEvent('theme:change', {
  detail: { theme: 'dark' }
}));

// Listeners
document.addEventListener('app:ready', (e) => {
  console.log('App version:', e.detail.version);
});
```

---

## 3.12.3 Accessing Event Data

### The detail Property

```javascript
// Sender
element.dispatchEvent(new CustomEvent('productselected', {
  detail: {
    product: {
      id: 'prod-123',
      name: 'Widget',
      price: 29.99
    },
    quantity: 2
  },
  bubbles: true
}));

// Receiver
document.addEventListener('productselected', (e) => {
  const { product, quantity } = e.detail;
  
  console.log(`Selected: ${quantity}x ${product.name}`);
  console.log(`Total: $${product.price * quantity}`);
});
```

### Event Properties

```javascript
element.addEventListener('myevent', (e) => {
  // Standard event properties
  console.log('Type:', e.type);
  console.log('Target:', e.target);
  console.log('Current Target:', e.currentTarget);
  console.log('Bubbles:', e.bubbles);
  console.log('Cancelable:', e.cancelable);
  console.log('Timestamp:', e.timeStamp);
  
  // Custom data
  console.log('Detail:', e.detail);
});
```

---

## 3.12.4 Bubbling and Propagation

### Bubbling Custom Events

```javascript
// Child dispatches event
child.dispatchEvent(new CustomEvent('itemclick', {
  bubbles: true,
  detail: { itemId: 42 }
}));

// Parent can listen
parent.addEventListener('itemclick', (e) => {
  console.log('Item clicked:', e.detail.itemId);
  console.log('Event came from:', e.target);
});

// This is event delegation with custom events
```

### Stopping Propagation

```javascript
// Stop bubbling
element.addEventListener('myevent', (e) => {
  e.stopPropagation();
  // Event won't reach parent listeners
});

// Stop all handlers
element.addEventListener('myevent', (e) => {
  e.stopImmediatePropagation();
  // No more handlers, including on same element
});
```

### Cancelable Events

```javascript
// Make event cancelable
const event = new CustomEvent('beforeaction', {
  cancelable: true,
  detail: { action: 'delete' }
});

// Listener can prevent default
element.addEventListener('beforeaction', (e) => {
  if (!confirm(`Are you sure you want to ${e.detail.action}?`)) {
    e.preventDefault();
  }
});

// Check if cancelled
const result = element.dispatchEvent(event);

if (result) {
  // Event was not cancelled, proceed
  performAction();
} else {
  // Event was cancelled
  console.log('Action cancelled');
}
```

---

## 3.12.5 Common Patterns

### Event Emitter Component

```javascript
class EventEmitter {
  constructor() {
    this.target = document.createDocumentFragment();
  }
  
  on(type, listener) {
    this.target.addEventListener(type, listener);
  }
  
  off(type, listener) {
    this.target.removeEventListener(type, listener);
  }
  
  emit(type, detail = {}) {
    const event = new CustomEvent(type, { detail });
    this.target.dispatchEvent(event);
  }
  
  once(type, listener) {
    this.target.addEventListener(type, listener, { once: true });
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('message', (e) => {
  console.log('Message:', e.detail);
});

emitter.emit('message', { text: 'Hello!' });
```

### Component Communication

```javascript
// Cart Component
class CartComponent {
  constructor(element) {
    this.element = element;
    this.items = [];
  }
  
  addItem(product, quantity = 1) {
    this.items.push({ product, quantity });
    
    // Notify parent/other components
    this.element.dispatchEvent(new CustomEvent('cart:update', {
      bubbles: true,
      detail: {
        action: 'add',
        product,
        quantity,
        total: this.getTotal()
      }
    }));
  }
  
  getTotal() {
    return this.items.reduce((sum, item) => 
      sum + item.product.price * item.quantity, 0
    );
  }
}

// Header Component (listens for cart updates)
class HeaderComponent {
  constructor(element) {
    this.element = element;
    this.cartBadge = element.querySelector('.cart-badge');
    
    // Listen for cart events from anywhere in document
    document.addEventListener('cart:update', (e) => {
      this.updateCartBadge(e.detail);
    });
  }
  
  updateCartBadge({ total }) {
    this.cartBadge.textContent = `$${total.toFixed(2)}`;
  }
}
```

### Before/After Events

```javascript
class DataLoader {
  constructor(element) {
    this.element = element;
  }
  
  async load(url) {
    // Before event (cancelable)
    const beforeEvent = new CustomEvent('load:before', {
      cancelable: true,
      bubbles: true,
      detail: { url }
    });
    
    if (!this.element.dispatchEvent(beforeEvent)) {
      console.log('Load cancelled');
      return null;
    }
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      // Success event
      this.element.dispatchEvent(new CustomEvent('load:success', {
        bubbles: true,
        detail: { url, data }
      }));
      
      return data;
    } catch (error) {
      // Error event
      this.element.dispatchEvent(new CustomEvent('load:error', {
        bubbles: true,
        detail: { url, error }
      }));
      
      throw error;
    } finally {
      // After event (always fires)
      this.element.dispatchEvent(new CustomEvent('load:after', {
        bubbles: true,
        detail: { url }
      }));
    }
  }
}
```

### Pub/Sub System

```javascript
class PubSub {
  constructor() {
    this.channel = new EventTarget();
  }
  
  subscribe(topic, callback) {
    const handler = (e) => callback(e.detail);
    this.channel.addEventListener(topic, handler);
    
    // Return unsubscribe function
    return () => this.channel.removeEventListener(topic, handler);
  }
  
  publish(topic, data) {
    this.channel.dispatchEvent(new CustomEvent(topic, {
      detail: data
    }));
  }
}

// Global pub/sub
const pubsub = new PubSub();

// Subscribe
const unsubscribe = pubsub.subscribe('user:login', (user) => {
  console.log('User logged in:', user.name);
});

// Publish
pubsub.publish('user:login', { id: 1, name: 'Alice' });

// Unsubscribe when done
unsubscribe();
```

### Event-Driven State Management

```javascript
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.channel = new EventTarget();
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(updates) {
    const prevState = this.state;
    this.state = { ...this.state, ...updates };
    
    // Emit change event with diff
    const changed = Object.keys(updates).filter(
      key => prevState[key] !== this.state[key]
    );
    
    this.channel.dispatchEvent(new CustomEvent('change', {
      detail: {
        state: this.getState(),
        prevState,
        changed
      }
    }));
  }
  
  subscribe(callback) {
    const handler = (e) => callback(e.detail);
    this.channel.addEventListener('change', handler);
    return () => this.channel.removeEventListener('change', handler);
  }
}

// Usage
const store = new Store({ count: 0, user: null });

store.subscribe(({ state, changed }) => {
  console.log('State changed:', changed);
  console.log('New state:', state);
});

store.setState({ count: 1 });
store.setState({ user: { name: 'Alice' } });
```

---

## 3.12.6 Shadow DOM and composed

```javascript
// Events and shadow DOM
class MyComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <button id="inner">Click me</button>
    `;
    
    this.shadowRoot.querySelector('#inner').addEventListener('click', () => {
      // composed: true allows event to cross shadow boundary
      this.dispatchEvent(new CustomEvent('inner-click', {
        bubbles: true,
        composed: true,
        detail: { source: 'inner button' }
      }));
    });
  }
}

customElements.define('my-component', MyComponent);

// External listener can receive the event
document.querySelector('my-component').addEventListener('inner-click', (e) => {
  console.log('Received:', e.detail);
});
```

---

## 3.12.7 Gotchas

```javascript
// ❌ Forgetting to set bubbles: true
element.dispatchEvent(new CustomEvent('myevent', {
  detail: { data: 123 }
}));
// Parent listeners won't receive this!

// ✅ Set bubbles: true for event delegation
element.dispatchEvent(new CustomEvent('myevent', {
  bubbles: true,
  detail: { data: 123 }
}));

// ❌ Modifying detail object after dispatch
const detail = { value: 1 };
element.dispatchEvent(new CustomEvent('event', { detail }));
detail.value = 2;  // Might affect listeners still processing!

// ✅ Consider detail immutable
const detail = Object.freeze({ value: 1 });

// ❌ Using Event instead of CustomEvent for data
const event = new Event('myevent');
event.detail = { data: 123 };  // Won't work as expected

// ✅ Use CustomEvent for detail
const event = new CustomEvent('myevent', {
  detail: { data: 123 }
});

// ❌ Expecting sync behavior with async handlers
element.dispatchEvent(new CustomEvent('fetch', { cancelable: true }));
// If handler is async, dispatchEvent returns before handler completes

// ✅ Use before/after pattern or promises
const event = new CustomEvent('beforefetch', { cancelable: true });
if (element.dispatchEvent(event)) {
  await doFetch();
  element.dispatchEvent(new CustomEvent('afterfetch'));
}
```

---

## 3.12.8 Summary

### CustomEvent Options

| Option | Default | Description |
|--------|---------|-------------|
| `detail` | `null` | Custom data to pass |
| `bubbles` | `false` | Event bubbles up DOM |
| `cancelable` | `false` | Can use `preventDefault()` |
| `composed` | `false` | Crosses shadow DOM |

### Key Methods

| Method | Description |
|--------|-------------|
| `new CustomEvent(type, options)` | Create event |
| `element.dispatchEvent(event)` | Fire event |
| `event.preventDefault()` | Cancel (if cancelable) |
| `event.stopPropagation()` | Stop bubbling |

### Event Data Access

| Property | Description |
|----------|-------------|
| `event.type` | Event name |
| `event.target` | Element that dispatched |
| `event.detail` | Custom data object |

### Best Practices

1. **Use `bubbles: true`** for event delegation
2. **Use `cancelable: true`** for before-action events
3. **Namespace event names** (`app:event`, `cart:update`)
4. **Use CustomEvent for data**, Event for simple signals
5. **Consider detail immutable** after dispatch
6. **Use `composed: true`** for shadow DOM crossing

---

**End of Chapter 3.12: Custom Events**

Next chapter: **3.13 Event Delegation** — covers efficient event handling patterns for dynamic content.
