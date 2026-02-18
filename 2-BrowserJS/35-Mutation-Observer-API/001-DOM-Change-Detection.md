# 35.1 DOM Change Detection

The MutationObserver API watches for DOM changes, enabling reactions to dynamic content modifications.

---

## 35.1.1 Basic Usage

### Create Observer

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('Change type:', mutation.type);
    console.log('Target:', mutation.target);
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,    // Child additions/removals
  subtree: true       // Include descendants
});
```

---

## 35.1.2 Observer Options

### Configuration

```javascript
observer.observe(element, {
  // Watch child nodes
  childList: true,
  
  // Include all descendants
  subtree: true,
  
  // Watch attributes
  attributes: true,
  
  // Record old attribute values
  attributeOldValue: true,
  
  // Filter specific attributes
  attributeFilter: ['class', 'style'],
  
  // Watch text content
  characterData: true,
  
  // Record old text values
  characterDataOldValue: true
});
```

---

## 35.1.3 Mutation Records

### Record Properties

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    // Common properties
    mutation.type;          // 'attributes', 'childList', 'characterData'
    mutation.target;        // Element that changed
    
    // For attributes
    mutation.attributeName; // Changed attribute name
    mutation.oldValue;      // Previous value (if recorded)
    
    // For childList
    mutation.addedNodes;    // NodeList of added nodes
    mutation.removedNodes;  // NodeList of removed nodes
    mutation.previousSibling;
    mutation.nextSibling;
  });
});
```

---

## 35.1.4 Stop Observing

### Disconnect

```javascript
// Stop observing
observer.disconnect();

// Get pending mutations
const pendingMutations = observer.takeRecords();
```

---

## 35.1.5 Watch Attribute Changes

### Class Changes

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.attributeName === 'class') {
      console.log('Class changed to:', mutation.target.className);
    }
  });
});

observer.observe(element, {
  attributes: true,
  attributeFilter: ['class']
});
```

---

## 35.1.6 Watch Child Changes

### Added/Removed Nodes

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        console.log('Added:', node.tagName);
      }
    });
    
    mutation.removedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        console.log('Removed:', node.tagName);
      }
    });
  });
});

observer.observe(container, {
  childList: true,
  subtree: true
});
```

---

## 35.1.7 Watch Text Changes

### Character Data

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log('Text changed to:', mutation.target.textContent);
    console.log('Old value:', mutation.oldValue);
  });
});

observer.observe(textNode, {
  characterData: true,
  characterDataOldValue: true
});
```

---

## 35.1.8 Complete Example

### DOM Watcher

```javascript
class DOMWatcher {
  constructor(root = document.body) {
    this.root = root;
    this.callbacks = {
      add: [],
      remove: [],
      attribute: [],
      text: []
    };
    
    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });
  }
  
  handleMutations(mutations) {
    mutations.forEach(mutation => {
      switch (mutation.type) {
        case 'childList':
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.emit('add', node);
            }
          });
          mutation.removedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.emit('remove', node);
            }
          });
          break;
          
        case 'attributes':
          this.emit('attribute', {
            element: mutation.target,
            name: mutation.attributeName,
            oldValue: mutation.oldValue
          });
          break;
          
        case 'characterData':
          this.emit('text', {
            node: mutation.target,
            oldValue: mutation.oldValue
          });
          break;
      }
    });
  }
  
  emit(event, data) {
    this.callbacks[event].forEach(cb => cb(data));
  }
  
  on(event, callback) {
    this.callbacks[event].push(callback);
    return this;
  }
  
  start(options = {}) {
    this.observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      ...options
    });
  }
  
  stop() {
    this.observer.disconnect();
  }
}

// Usage
const watcher = new DOMWatcher();

watcher
  .on('add', (element) => console.log('Added:', element))
  .on('remove', (element) => console.log('Removed:', element))
  .on('attribute', ({ element, name }) => {
    console.log('Attribute changed:', name, 'on', element);
  })
  .start();
```

---

## 35.1.9 Summary

### Constructor

```javascript
new MutationObserver(callback)
```

### Methods

| Method | Description |
|--------|-------------|
| `observe(target, options)` | Start observing |
| `disconnect()` | Stop observing |
| `takeRecords()` | Get pending mutations |

### Options

| Option | Type | Description |
|--------|------|-------------|
| `childList` | Boolean | Watch children |
| `subtree` | Boolean | Include descendants |
| `attributes` | Boolean | Watch attributes |
| `attributeOldValue` | Boolean | Record old values |
| `attributeFilter` | Array | Specific attributes |
| `characterData` | Boolean | Watch text |
| `characterDataOldValue` | Boolean | Record old text |

### Mutation Types

| Type | Description |
|------|-------------|
| `childList` | Child nodes changed |
| `attributes` | Attribute changed |
| `characterData` | Text changed |

### Best Practices

1. **Be specific** — only watch what you need
2. **Use attributeFilter** — limit attribute watching
3. **Avoid infinite loops** — don't mutate observed nodes in callback
4. **Disconnect** — when no longer needed
5. **Batch processing** — handle multiple mutations efficiently

---

**End of Chapter 35.1: DOM Change Detection**

Next: **36.1 Element Size Changes** — Resize Observer API.
