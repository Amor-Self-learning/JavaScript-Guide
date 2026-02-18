# 5.3 IndexedDB

IndexedDB is a low-level API for client-side storage of significant amounts of structured data. This chapter covers databases, object stores, transactions, indexes, and common patterns for working with IndexedDB.

---

## 5.3.1 IndexedDB Overview

### What Is IndexedDB?

```javascript
// IndexedDB is:
// - A transactional database in the browser
// - Key-value store with indexes
// - Supports large amounts of data (no fixed limit)
// - Asynchronous (event-based API)
// - Same-origin policy (data private to origin)

// When to use IndexedDB:
// - Large datasets (>5MB)
// - Structured data with queries
// - Offline-first applications
// - Complex data relationships
```

### IndexedDB vs Other Storage

| Feature | localStorage | IndexedDB |
|---------|-------------|-----------|
| Size limit | ~5MB | No fixed limit |
| Data types | Strings only | Structured data |
| Async | No | Yes |
| Indexes | No | Yes |
| Transactions | No | Yes |
| Queries | No | Yes |

---

## 5.3.2 Opening a Database

### Basic Open

```javascript
// Open database (creates if doesn't exist)
const request = indexedDB.open('myDatabase', 1);

request.onerror = (event) => {
  console.error('Database error:', event.target.error);
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('Database opened:', db.name);
};

// Called when database is created or version increases
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  // Create object stores here
};
```

### Version Management

```javascript
// Version number determines schema
const request = indexedDB.open('myDatabase', 2);  // Version 2

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const oldVersion = event.oldVersion;
  const newVersion = event.newVersion;
  
  console.log(`Upgrading from v${oldVersion} to v${newVersion}`);
  
  // Migration logic
  if (oldVersion < 1) {
    // Initial setup
    db.createObjectStore('users', { keyPath: 'id' });
  }
  
  if (oldVersion < 2) {
    // Add new store or index
    const store = db.createObjectStore('posts', { keyPath: 'id', autoIncrement: true });
    store.createIndex('userId', 'userId', { unique: false });
  }
};
```

---

## 5.3.3 Object Stores

### Creating Object Stores

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // With explicit key path
  const usersStore = db.createObjectStore('users', { 
    keyPath: 'id' 
  });
  
  // With auto-increment key
  const logsStore = db.createObjectStore('logs', { 
    autoIncrement: true 
  });
  
  // With key generator and key path
  const postsStore = db.createObjectStore('posts', { 
    keyPath: 'id', 
    autoIncrement: true 
  });
  
  // Add indexes
  usersStore.createIndex('email', 'email', { unique: true });
  usersStore.createIndex('name', 'name', { unique: false });
  postsStore.createIndex('userId', 'userId', { unique: false });
  postsStore.createIndex('createdAt', 'createdAt', { unique: false });
};
```

### Deleting Object Stores

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // Delete existing store
  if (db.objectStoreNames.contains('oldStore')) {
    db.deleteObjectStore('oldStore');
  }
};
```

---

## 5.3.4 Basic CRUD Operations

### Create (Add/Put)

```javascript
// Add new record (fails if key exists)
function addUser(db, user) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.add(user);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Put record (adds or updates)
function putUser(db, user) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.put(user);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Usage
await addUser(db, { id: 1, name: 'John', email: 'john@example.com' });
await putUser(db, { id: 1, name: 'John Doe', email: 'john@example.com' });
```

### Read (Get/GetAll)

```javascript
// Get single record by key
function getUser(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.get(id);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all records
function getAllUsers(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.getAll();
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get with limit
function getUsers(db, limit) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.getAll(null, limit);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### Update

```javascript
// Update = get + modify + put
async function updateUser(db, id, updates) {
  const user = await getUser(db, id);
  if (!user) throw new Error('User not found');
  
  const updated = { ...user, ...updates };
  await putUser(db, updated);
  
  return updated;
}
```

### Delete

```javascript
// Delete single record
function deleteUser(db, id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.delete(id);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Clear all records
function clearUsers(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    
    const request = store.clear();
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

---

## 5.3.5 Indexes

### Creating Indexes

```javascript
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  const store = db.createObjectStore('products', { keyPath: 'id' });
  
  // Single property index
  store.createIndex('category', 'category', { unique: false });
  
  // Unique index
  store.createIndex('sku', 'sku', { unique: true });
  
  // Compound index
  store.createIndex('category_price', ['category', 'price'], { unique: false });
  
  // Multi-entry index (for arrays)
  store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
};
```

### Querying by Index

```javascript
// Get by index
function getProductsByCategory(db, category) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const index = store.index('category');
    
    const request = index.getAll(category);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get one by index
function getProductBySku(db, sku) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const index = store.index('sku');
    
    const request = index.get(sku);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

---

## 5.3.6 Cursors

### Basic Cursor

```javascript
// Iterate with cursor
function iterateUsers(db, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('users', 'readonly');
    const store = tx.objectStore('users');
    
    const request = store.openCursor();
    
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      
      if (cursor) {
        callback(cursor.value, cursor.key);
        cursor.continue();  // Move to next
      } else {
        resolve();  // No more results
      }
    };
    
    request.onerror = () => reject(request.error);
  });
}

// Usage
await iterateUsers(db, (user, key) => {
  console.log(key, user.name);
});
```

### Cursor Direction

```javascript
// Forward (default)
store.openCursor(null, 'next');

// Backward
store.openCursor(null, 'prev');

// Forward, skip duplicates
store.openCursor(null, 'nextunique');

// Backward, skip duplicates
store.openCursor(null, 'prevunique');
```

### Cursor with Range

```javascript
// Key ranges
const range = IDBKeyRange.bound(1, 100);      // 1 <= key <= 100
const rangeOpen = IDBKeyRange.bound(1, 100, true, true);  // 1 < key < 100
const rangeOnly = IDBKeyRange.only(5);        // key === 5
const rangeLower = IDBKeyRange.lowerBound(10);  // key >= 10
const rangeUpper = IDBKeyRange.upperBound(50);  // key <= 50

// Use with cursor
store.openCursor(IDBKeyRange.lowerBound(10));

// Get all in range
store.getAll(IDBKeyRange.bound(1, 100));
```

---

## 5.3.7 Transactions

### Transaction Modes

```javascript
// Readonly - multiple stores, concurrent
const readTx = db.transaction(['users', 'posts'], 'readonly');

// Readwrite - multiple stores, exclusive
const writeTx = db.transaction(['users', 'posts'], 'readwrite');

// Transaction auto-completes when all requests finish
writeTx.oncomplete = () => console.log('Transaction completed');
writeTx.onerror = (event) => console.error('Transaction failed:', event.target.error);
writeTx.onabort = () => console.log('Transaction aborted');

// Abort transaction manually
writeTx.abort();
```

### Multi-Store Transaction

```javascript
async function transferPost(db, postId, fromUserId, toUserId) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['users', 'posts'], 'readwrite');
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    
    const usersStore = tx.objectStore('users');
    const postsStore = tx.objectStore('posts');
    
    // Get post
    const getPost = postsStore.get(postId);
    getPost.onsuccess = () => {
      const post = getPost.result;
      
      if (post.userId !== fromUserId) {
        tx.abort();
        return;
      }
      
      // Update post
      post.userId = toUserId;
      postsStore.put(post);
    };
  });
}
```

---

## 5.3.8 Promise Wrapper

```javascript
class IndexedDBStore {
  constructor(dbName, version, onUpgrade) {
    this.dbName = dbName;
    this.version = version;
    this.onUpgrade = onUpgrade;
    this.db = null;
  }
  
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        this.onUpgrade(event.target.result, event);
      };
    });
  }
  
  async get(storeName, key) {
    return this._request(storeName, 'readonly', store => store.get(key));
  }
  
  async getAll(storeName, query, count) {
    return this._request(storeName, 'readonly', store => store.getAll(query, count));
  }
  
  async add(storeName, value) {
    return this._request(storeName, 'readwrite', store => store.add(value));
  }
  
  async put(storeName, value) {
    return this._request(storeName, 'readwrite', store => store.put(value));
  }
  
  async delete(storeName, key) {
    return this._request(storeName, 'readwrite', store => store.delete(key));
  }
  
  async clear(storeName) {
    return this._request(storeName, 'readwrite', store => store.clear());
  }
  
  async getByIndex(storeName, indexName, value) {
    return this._request(storeName, 'readonly', store => 
      store.index(indexName).getAll(value)
    );
  }
  
  async _request(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = operation(store);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Usage
const store = new IndexedDBStore('myApp', 1, (db) => {
  db.createObjectStore('users', { keyPath: 'id' });
});

await store.open();
await store.add('users', { id: 1, name: 'John' });
const users = await store.getAll('users');
```

---

## 5.3.9 Common Patterns

### Offline Data Sync

```javascript
class OfflineSync {
  constructor(db, storeName) {
    this.db = db;
    this.storeName = storeName;
    this.pendingStore = `${storeName}_pending`;
  }
  
  async save(item) {
    // Save locally
    await this.db.put(this.storeName, item);
    
    // Queue for sync
    await this.db.add(this.pendingStore, {
      id: Date.now(),
      action: 'update',
      item
    });
    
    // Try to sync
    this.sync();
  }
  
  async sync() {
    if (!navigator.onLine) return;
    
    const pending = await this.db.getAll(this.pendingStore);
    
    for (const action of pending) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          body: JSON.stringify(action)
        });
        
        await this.db.delete(this.pendingStore, action.id);
      } catch (error) {
        // Will retry on next sync
        console.error('Sync failed:', error);
      }
    }
  }
}
```

---

## 5.3.10 Gotchas

```javascript
// ❌ Forgetting onupgradeneeded for new stores
// Stores can only be created in onupgradeneeded

// ❌ Using transaction after it completes
const tx = db.transaction('users', 'readwrite');
const store = tx.objectStore('users');
await someAsyncOperation();  // Transaction is now complete!
store.add(user);  // Error: transaction inactive

// ✅ Keep transaction active or create new one
const tx = db.transaction('users', 'readwrite');
store.add(user);
// All operations must be synchronous within transaction

// ❌ Not handling version conflicts
// If another tab has DB open at old version, upgrade blocks

// ✅ Handle blocked event
request.onblocked = () => {
  alert('Please close other tabs with this app');
};

// ❌ Storing non-cloneable objects
store.add({ fn: () => {} });  // Error: functions can't be cloned

// ✅ Only store cloneable data
store.add({ data: 'serializable' });
```

---

## 5.3.11 Summary

### Key Concepts

| Concept | Description |
|---------|-------------|
| Database | Container for object stores |
| Object Store | Table-like collection |
| Index | Secondary lookup key |
| Transaction | Atomic operation group |
| Cursor | Iterator for records |

### Transaction Modes

| Mode | Description |
|------|-------------|
| `readonly` | Read-only, allows concurrency |
| `readwrite` | Read/write, exclusive access |

### Key Range Methods

| Method | Range |
|--------|-------|
| `only(value)` | Exact match |
| `lowerBound(x)` | `>= x` |
| `upperBound(x)` | `<= x` |
| `bound(x, y)` | `x <= key <= y` |

### Best Practices

1. **Always handle errors** on requests and transactions
2. **Use version numbers** for schema migrations
3. **Keep transactions short** - they auto-complete
4. **Use indexes** for querying non-key properties
5. **Wrap in Promises** for easier async/await usage
6. **Handle `blocked` event** for multi-tab scenarios

---

**End of Chapter 5.3: IndexedDB**

Next chapter: **5.4 Cache API** — covers the Cache API for storing request/response pairs.
