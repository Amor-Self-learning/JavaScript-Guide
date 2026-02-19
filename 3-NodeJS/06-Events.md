# Module 6: Events

The `events` module is the foundation of Node.js's event-driven architecture. The `EventEmitter` class provides a way to emit and listen for named events, enabling loose coupling between components.

---

## 6.1 Module Import

```javascript
// CommonJS
const EventEmitter = require('events');
const { EventEmitter } = require('events');

// ES Modules
import EventEmitter from 'events';
import { EventEmitter, on, once } from 'events';
```

---

## 6.2 EventEmitter Basics

### Creating an EventEmitter

```javascript
const EventEmitter = require('events');

// Create instance
const emitter = new EventEmitter();

// Register listener
emitter.on('event', () => {
  console.log('Event fired!');
});

// Emit event
emitter.emit('event');
// Output: Event fired!
```

### Passing Data with Events

```javascript
const emitter = new EventEmitter();

// Listener receives arguments
emitter.on('data', (value, timestamp) => {
  console.log(`Received ${value} at ${timestamp}`);
});

// Emit with arguments
emitter.emit('data', 'hello', Date.now());
// Output: Received hello at 1699876543210
```

### The `this` Context

```javascript
const emitter = new EventEmitter();

// Regular function: `this` is the emitter
emitter.on('event', function() {
  console.log(this === emitter);  // true
});

// Arrow function: `this` is lexical scope
emitter.on('event', () => {
  console.log(this === emitter);  // false
});

emitter.emit('event');
```

---

## 6.3 Registration Methods

### on() — Persistent Listener

```javascript
const emitter = new EventEmitter();

emitter.on('data', data => {
  console.log('Received:', data);
});

emitter.emit('data', 1);  // Received: 1
emitter.emit('data', 2);  // Received: 2
emitter.emit('data', 3);  // Received: 3
```

### once() — One-Time Listener

```javascript
const emitter = new EventEmitter();

emitter.once('connect', () => {
  console.log('Connected!');
});

emitter.emit('connect');  // Connected!
emitter.emit('connect');  // (nothing)
emitter.emit('connect');  // (nothing)
```

### prependListener() — Add to Beginning

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => console.log('A'));
emitter.on('event', () => console.log('B'));
emitter.prependListener('event', () => console.log('First'));

emitter.emit('event');
// Output:
// First
// A
// B
```

### prependOnceListener()

```javascript
emitter.prependOnceListener('event', () => {
  console.log('First and only once');
});
```

### addListener() — Alias for on()

```javascript
// These are identical
emitter.on('event', handler);
emitter.addListener('event', handler);
```

---

## 6.4 Removing Listeners

### off() / removeListener()

```javascript
const emitter = new EventEmitter();

function handler(data) {
  console.log(data);
}

emitter.on('event', handler);
emitter.emit('event', 'Hello');  // Hello

// Remove listener (must be same function reference)
emitter.off('event', handler);
// Or: emitter.removeListener('event', handler);

emitter.emit('event', 'World');  // (nothing)
```

### removeAllListeners()

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => console.log('A'));
emitter.on('event', () => console.log('B'));
emitter.on('other', () => console.log('C'));

// Remove all listeners for 'event'
emitter.removeAllListeners('event');

// Remove ALL listeners on ALL events
emitter.removeAllListeners();
```

### Listener Reference Gotcha

```javascript
const emitter = new EventEmitter();

// ❌ Cannot remove - different function references
emitter.on('event', data => console.log(data));
emitter.off('event', data => console.log(data));  // Doesn't work!

// ✅ Store reference
const handler = data => console.log(data);
emitter.on('event', handler);
emitter.off('event', handler);  // Works!
```

---

## 6.5 Introspection Methods

### eventNames()

```javascript
const emitter = new EventEmitter();

emitter.on('connect', () => {});
emitter.on('data', () => {});
emitter.on('error', () => {});

console.log(emitter.eventNames());
// ['connect', 'data', 'error']
```

### listenerCount()

```javascript
const emitter = new EventEmitter();

emitter.on('event', () => {});
emitter.on('event', () => {});
emitter.once('event', () => {});

console.log(emitter.listenerCount('event'));  // 3
```

### listeners()

```javascript
const emitter = new EventEmitter();

function handlerA() {}
function handlerB() {}

emitter.on('event', handlerA);
emitter.on('event', handlerB);

const listeners = emitter.listeners('event');
console.log(listeners);  // [handlerA, handlerB]
console.log(listeners[0] === handlerA);  // true
```

### rawListeners()

```javascript
// Returns wrapper for once() listeners
const emitter = new EventEmitter();

emitter.once('event', () => console.log('Once'));

const raw = emitter.rawListeners('event');
raw[0]();  // Once (manually invoke)
// Now the listener is consumed

emitter.emit('event');  // (nothing)
```

---

## 6.6 Configuration

### maxListeners

```javascript
const emitter = new EventEmitter();

// Default is 10 - warning if exceeded
emitter.on('event', () => {});
// ... add 11 listeners
// Warning: MaxListenersExceededWarning

// Increase limit
emitter.setMaxListeners(20);

// Get current limit
console.log(emitter.getMaxListeners());  // 20

// Remove limit entirely
emitter.setMaxListeners(0);  // No limit
emitter.setMaxListeners(Infinity);  // No limit
```

### Default Max Listeners

```javascript
// Change default for all new emitters
EventEmitter.defaultMaxListeners = 20;

const emitter = new EventEmitter();
console.log(emitter.getMaxListeners());  // 20
```

### captureRejections

```javascript
// Enable automatic error handling for async listeners
const emitter = new EventEmitter({ captureRejections: true });

emitter.on('event', async () => {
  throw new Error('Async error');
});

emitter.on('error', err => {
  console.log('Caught:', err.message);
});

emitter.emit('event');
// Output: Caught: Async error
```

---

## 6.7 Error Handling

### The 'error' Event

```javascript
const emitter = new EventEmitter();

// ❌ Without error handler - crashes!
emitter.emit('error', new Error('Something went wrong'));
// Throws: Error: Something went wrong

// ✅ With error handler
emitter.on('error', err => {
  console.error('Error handled:', err.message);
});

emitter.emit('error', new Error('Something went wrong'));
// Output: Error handled: Something went wrong
```

### Error Handling Pattern

```javascript
class SafeEmitter extends EventEmitter {
  constructor() {
    super();
    // Always have error handler
    this.on('error', err => {
      console.error('SafeEmitter error:', err.message);
    });
  }
  
  safeEmit(event, ...args) {
    try {
      this.emit(event, ...args);
    } catch (err) {
      this.emit('error', err);
    }
  }
}
```

### errorMonitor Symbol

```javascript
const { errorMonitor } = require('events');

const emitter = new EventEmitter();

// Listen to errors without consuming them
emitter.on(errorMonitor, err => {
  console.log('Error observed:', err.message);
  // Error still propagates to 'error' listener
});

emitter.on('error', err => {
  console.log('Error handled:', err.message);
});

emitter.emit('error', new Error('Test'));
// Output:
// Error observed: Test
// Error handled: Test
```

---

## 6.8 Static Methods

### events.once() — Promise-based

```javascript
const { once } = require('events');

const emitter = new EventEmitter();

async function waitForEvent() {
  // Returns array of arguments
  const [data] = await once(emitter, 'data');
  console.log('Got data:', data);
}

waitForEvent();
emitter.emit('data', 'Hello');
// Output: Got data: Hello
```

### events.on() — Async Iterator

```javascript
const { on } = require('events');

const emitter = new EventEmitter();

async function processEvents() {
  for await (const [value] of on(emitter, 'data')) {
    console.log('Value:', value);
    if (value === 'stop') break;
  }
  console.log('Done');
}

processEvents();

emitter.emit('data', 1);     // Value: 1
emitter.emit('data', 2);     // Value: 2
emitter.emit('data', 'stop');// Value: stop
                             // Done
```

### with AbortSignal

```javascript
const { on, once } = require('events');

async function waitWithTimeout() {
  const ac = new AbortController();
  
  // Timeout after 5 seconds
  const timeout = setTimeout(() => ac.abort(), 5000);
  
  try {
    const [data] = await once(emitter, 'data', { signal: ac.signal });
    clearTimeout(timeout);
    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Timeout waiting for data');
    }
    throw err;
  }
}
```

### events.getEventListeners()

```javascript
const { getEventListeners } = require('events');

// Works with EventEmitter and EventTarget
const emitter = new EventEmitter();
emitter.on('event', () => {});
emitter.on('event', () => {});

console.log(getEventListeners(emitter, 'event').length);  // 2
```

---

## 6.9 Extending EventEmitter

### Class-Based Extension

```javascript
const EventEmitter = require('events');

class User extends EventEmitter {
  constructor(name) {
    super();
    this.name = name;
  }
  
  login() {
    // Perform login
    this.emit('login', { user: this.name, timestamp: Date.now() });
  }
  
  logout() {
    this.emit('logout', { user: this.name });
  }
}

const user = new User('Alice');

user.on('login', data => {
  console.log(`${data.user} logged in at ${data.timestamp}`);
});

user.on('logout', data => {
  console.log(`${data.user} logged out`);
});

user.login();   // Alice logged in at 1699876543210
user.logout();  // Alice logged out
```

### Composition Pattern

```javascript
class Database {
  constructor() {
    this.events = new EventEmitter();
    this.connected = false;
  }
  
  connect() {
    // Simulate connection
    setTimeout(() => {
      this.connected = true;
      this.events.emit('connected');
    }, 100);
  }
  
  query(sql) {
    if (!this.connected) {
      this.events.emit('error', new Error('Not connected'));
      return;
    }
    // Execute query
    this.events.emit('query', { sql, timestamp: Date.now() });
  }
  
  // Delegate event methods
  on(event, listener) {
    this.events.on(event, listener);
    return this;
  }
  
  off(event, listener) {
    this.events.off(event, listener);
    return this;
  }
}

const db = new Database();
db.on('connected', () => console.log('Connected!'));
db.on('error', err => console.error('Error:', err.message));

db.connect();
```

---

## 6.10 Real-World Patterns

### Observable Data

```javascript
class ObservableValue extends EventEmitter {
  constructor(value) {
    super();
    this._value = value;
  }
  
  get value() {
    return this._value;
  }
  
  set value(newValue) {
    const oldValue = this._value;
    if (oldValue !== newValue) {
      this._value = newValue;
      this.emit('change', newValue, oldValue);
    }
  }
}

const count = new ObservableValue(0);

count.on('change', (newVal, oldVal) => {
  console.log(`Changed from ${oldVal} to ${newVal}`);
});

count.value = 1;  // Changed from 0 to 1
count.value = 5;  // Changed from 1 to 5
count.value = 5;  // (nothing - same value)
```

### Request Queue

```javascript
class RequestQueue extends EventEmitter {
  constructor(concurrency = 5) {
    super();
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(request) {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.process();
    });
  }
  
  async process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      const { request, resolve, reject } = this.queue.shift();
      this.running++;
      
      this.emit('start', request);
      
      try {
        const result = await request();
        this.emit('complete', result);
        resolve(result);
      } catch (err) {
        this.emit('error', err);
        reject(err);
      } finally {
        this.running--;
        this.process();
      }
    }
    
    if (this.running === 0 && this.queue.length === 0) {
      this.emit('drain');
    }
  }
}
```

### Pub/Sub System

```javascript
class PubSub extends EventEmitter {
  constructor() {
    super();
    this.channels = new Map();
  }
  
  subscribe(channel, callback) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel).add(callback);
    
    // Return unsubscribe function
    return () => {
      this.channels.get(channel).delete(callback);
      if (this.channels.get(channel).size === 0) {
        this.channels.delete(channel);
      }
    };
  }
  
  publish(channel, message) {
    if (this.channels.has(channel)) {
      for (const callback of this.channels.get(channel)) {
        try {
          callback(message);
        } catch (err) {
          this.emit('error', err);
        }
      }
    }
    this.emit('publish', { channel, message });
  }
}

const pubsub = new PubSub();

const unsubscribe = pubsub.subscribe('news', msg => {
  console.log('News:', msg);
});

pubsub.publish('news', 'Hello World');
// News: Hello World

unsubscribe();
pubsub.publish('news', 'Another');
// (nothing)
```

---

## 6.11 Common Gotchas

### Memory Leaks

```javascript
// ❌ Listener never removed
function setupConnection(conn) {
  conn.on('data', data => process(data));
  // Connection closes but listener remains
}

// ✅ Remove listener on cleanup
function setupConnection(conn) {
  function handler(data) {
    process(data);
  }
  
  conn.on('data', handler);
  conn.on('close', () => {
    conn.off('data', handler);
  });
}
```

### Forgetting await with once()

```javascript
const { once } = require('events');

// ❌ Missing await
function waitForData(emitter) {
  once(emitter, 'data');  // Promise ignored!
  console.log('Continuing...');
}

// ✅ Await the promise
async function waitForData(emitter) {
  const [data] = await once(emitter, 'data');
  console.log('Got data:', data);
}
```

### Error Event Without Handler

```javascript
// ❌ Crashes the process
emitter.emit('error', new Error('Oops'));

// ✅ Always have error handler
emitter.on('error', err => {
  console.error('Error:', err.message);
});
```

### Synchronous Emission Before Listener

```javascript
const emitter = new EventEmitter();

// ❌ Event emitted before listener attached
emitter.emit('ready');
emitter.on('ready', () => console.log('Ready'));
// (nothing happens)

// ✅ Emit after listener is attached
emitter.on('ready', () => console.log('Ready'));
emitter.emit('ready');
// Ready

// ✅ Or use setImmediate for async emission
class Component extends EventEmitter {
  constructor() {
    super();
    setImmediate(() => this.emit('ready'));
  }
}

const comp = new Component();
comp.on('ready', () => console.log('Ready'));
// Ready
```

---

## 6.12 Summary

| Method | Description |
|--------|-------------|
| `on(event, fn)` | Add persistent listener |
| `once(event, fn)` | Add one-time listener |
| `off(event, fn)` | Remove specific listener |
| `removeAllListeners()` | Remove all listeners |
| `emit(event, ...args)` | Trigger event with data |
| `eventNames()` | Get array of event names |
| `listenerCount(event)` | Count listeners for event |
| `listeners(event)` | Get array of listeners |
| `setMaxListeners(n)` | Set listener limit |

| Static Method | Description |
|---------------|-------------|
| `once(emitter, event)` | Promise for single event |
| `on(emitter, event)` | Async iterator for events |
| `getEventListeners()` | Get listeners array |

| Special Event | Description |
|---------------|-------------|
| `error` | Must be handled or crashes |
| `newListener` | Before listener is added |
| `removeListener` | After listener is removed |

---

**End of Module 6: Events**

Next: **Module 7 — Streams** (Readable, Writable, Transform, piping)
