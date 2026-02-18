# 3.9 Drag and Drop Events

The native HTML5 Drag and Drop API enables dragging elements and data between applications. This chapter covers drag events, DataTransfer, drop zones, and common drag and drop patterns.

---

## 3.9.1 Making Elements Draggable

### The draggable Attribute

```html
<!-- Make any element draggable -->
<div draggable="true">Drag me!</div>

<!-- Default draggable elements -->
<img src="photo.jpg">  <!-- Images are draggable by default -->
<a href="/link">Link</a>  <!-- Links are draggable by default -->
<div>Not draggable</div>  <!-- Other elements need draggable="true" -->
```

```javascript
// Enable draggability via JavaScript
element.draggable = true;

// Check if element is draggable
console.log(element.draggable);
```

---

## 3.9.2 Drag Events

### Events on Draggable Elements

```javascript
// dragstart: dragging begins
element.addEventListener('dragstart', (e) => {
  console.log('Started dragging');
  // Set the data being dragged
  e.dataTransfer.setData('text/plain', element.id);
});

// drag: fires continuously while dragging
element.addEventListener('drag', (e) => {
  // ⚠️ Fires frequently - use sparingly
  console.log('Dragging...');
});

// dragend: dragging ends (success or cancel)
element.addEventListener('dragend', (e) => {
  console.log('Drag ended');
  console.log('Drop effect:', e.dataTransfer.dropEffect);
  
  if (e.dataTransfer.dropEffect === 'none') {
    console.log('Drag was cancelled');
  } else {
    console.log('Drop was successful');
  }
});
```

### Events on Drop Targets

```javascript
// dragenter: dragged item enters drop zone
dropZone.addEventListener('dragenter', (e) => {
  e.preventDefault();  // Allow drop
  dropZone.classList.add('drag-over');
});

// dragover: dragged item is over drop zone
// Must call preventDefault() to allow drop!
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();  // REQUIRED to allow drop
  e.dataTransfer.dropEffect = 'move';
});

// dragleave: dragged item leaves drop zone
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('drag-over');
});

// drop: item is dropped
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();  // Prevent default handling
  dropZone.classList.remove('drag-over');
  
  const data = e.dataTransfer.getData('text/plain');
  console.log('Dropped:', data);
});
```

### Event Flow

```javascript
// Complete drag and drop flow:
// 1. User starts dragging → dragstart (on draggable)
// 2. While dragging → drag (on draggable, continuous)
// 3. Enter drop zone → dragenter (on drop zone)
// 4. Over drop zone → dragover (on drop zone, continuous)
// 5. Leave drop zone → dragleave (on drop zone)
// 6. Drop on target → drop (on drop zone)
// 7. End drag → dragend (on draggable)
```

---

## 3.9.3 DataTransfer Object

### Setting Data

```javascript
element.addEventListener('dragstart', (e) => {
  // Set text data
  e.dataTransfer.setData('text/plain', 'Hello World');
  
  // Set HTML data
  e.dataTransfer.setData('text/html', '<b>Hello</b> World');
  
  // Set URL
  e.dataTransfer.setData('text/uri-list', 'https://example.com');
  
  // Set custom data
  e.dataTransfer.setData('application/json', JSON.stringify({
    id: element.id,
    type: 'card',
    data: { title: 'Task 1' }
  }));
  
  // Multiple types can be set
  // Drop target chooses which to use
});
```

### Getting Data

```javascript
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  // Get text data
  const text = e.dataTransfer.getData('text/plain');
  
  // Get HTML
  const html = e.dataTransfer.getData('text/html');
  
  // Get custom data
  const json = e.dataTransfer.getData('application/json');
  if (json) {
    const data = JSON.parse(json);
    console.log('Dropped:', data);
  }
  
  // Check available types
  console.log('Types:', e.dataTransfer.types);
});
```

### Checking Available Types

```javascript
dropZone.addEventListener('dragover', (e) => {
  // Check what types are available
  const types = e.dataTransfer.types;
  
  if (types.includes('application/json')) {
    e.preventDefault();  // Accept this drop
    e.dataTransfer.dropEffect = 'move';
  }
});
```

### Drop Effect and Effect Allowed

```javascript
// On dragstart: specify what operations are allowed
element.addEventListener('dragstart', (e) => {
  // Options: "none", "copy", "move", "link", 
  // "copyMove", "copyLink", "linkMove", "all"
  e.dataTransfer.effectAllowed = 'copyMove';
});

// On dragover: specify what will happen
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  // Options: "none", "copy", "move", "link"
  e.dataTransfer.dropEffect = 'move';
  // Cursor changes to indicate effect
});

// On dragend: check what happened
element.addEventListener('dragend', (e) => {
  if (e.dataTransfer.dropEffect === 'move') {
    // Remove element from source
    element.remove();
  }
});
```

---

## 3.9.4 Dragging Files

### Detecting File Drops

```javascript
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  
  // Check for files
  if (e.dataTransfer.types.includes('Files')) {
    e.dataTransfer.dropEffect = 'copy';
  }
});

dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  // Access dropped files
  const files = e.dataTransfer.files;
  
  for (const file of files) {
    console.log('File:', file.name);
    console.log('Type:', file.type);
    console.log('Size:', file.size);
    
    // Process file
    handleFile(file);
  }
});

async function handleFile(file) {
  if (file.type.startsWith('image/')) {
    const url = URL.createObjectURL(file);
    showImage(url);
  } else if (file.type === 'application/json') {
    const text = await file.text();
    const data = JSON.parse(text);
    processData(data);
  }
}
```

### File Drop Zone Pattern

```javascript
class FileDropZone {
  constructor(element, options = {}) {
    this.element = element;
    this.accept = options.accept || '*/*';
    this.onDrop = options.onDrop || (() => {});
    
    this.setup();
  }
  
  setup() {
    // Prevent default drag behavior on document
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
      document.body.addEventListener(event, e => e.preventDefault());
    });
    
    this.element.addEventListener('dragenter', this.highlight.bind(this));
    this.element.addEventListener('dragover', this.highlight.bind(this));
    this.element.addEventListener('dragleave', this.unhighlight.bind(this));
    this.element.addEventListener('drop', this.handleDrop.bind(this));
  }
  
  highlight(e) {
    e.preventDefault();
    this.element.classList.add('drag-active');
  }
  
  unhighlight(e) {
    this.element.classList.remove('drag-active');
  }
  
  handleDrop(e) {
    e.preventDefault();
    this.unhighlight(e);
    
    const files = [...e.dataTransfer.files].filter(file => {
      if (this.accept === '*/*') return true;
      return this.accept.split(',').some(type => {
        type = type.trim();
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });
    });
    
    if (files.length > 0) {
      this.onDrop(files);
    }
  }
}

// Usage
new FileDropZone(document.querySelector('.drop-zone'), {
  accept: 'image/*,application/pdf',
  onDrop: (files) => {
    files.forEach(uploadFile);
  }
});
```

---

## 3.9.5 Custom Drag Image

```javascript
element.addEventListener('dragstart', (e) => {
  // Create custom drag image
  const dragImage = document.createElement('div');
  dragImage.textContent = 'Dragging...';
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    background: #333;
    color: white;
    padding: 8px 16px;
    border-radius: 4px;
  `;
  document.body.appendChild(dragImage);
  
  // Set as drag image (element, offsetX, offsetY)
  e.dataTransfer.setDragImage(dragImage, 50, 25);
  
  // Clean up
  setTimeout(() => dragImage.remove(), 0);
});

// Using an existing image
element.addEventListener('dragstart', (e) => {
  const img = new Image();
  img.src = 'drag-icon.png';
  e.dataTransfer.setDragImage(img, 25, 25);
});
```

---

## 3.9.6 Common Patterns

### Sortable List

```javascript
class SortableList {
  constructor(container) {
    this.container = container;
    this.draggedItem = null;
    
    container.querySelectorAll('.sortable-item').forEach(item => {
      item.draggable = true;
      this.addDragListeners(item);
    });
  }
  
  addDragListeners(item) {
    item.addEventListener('dragstart', (e) => {
      this.draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    
    item.addEventListener('dragend', () => {
      this.draggedItem = null;
      item.classList.remove('dragging');
    });
    
    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (item === this.draggedItem) return;
      
      const rect = item.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      
      if (e.clientY < midY) {
        item.parentNode.insertBefore(this.draggedItem, item);
      } else {
        item.parentNode.insertBefore(this.draggedItem, item.nextSibling);
      }
    });
  }
}
```

### Kanban Board

```javascript
class KanbanBoard {
  constructor(board) {
    this.board = board;
    this.draggedCard = null;
    
    // Setup columns
    board.querySelectorAll('.column').forEach(column => {
      column.addEventListener('dragover', this.handleDragOver.bind(this));
      column.addEventListener('drop', this.handleDrop.bind(this));
    });
    
    // Setup cards
    board.querySelectorAll('.card').forEach(card => {
      this.setupCard(card);
    });
  }
  
  setupCard(card) {
    card.draggable = true;
    
    card.addEventListener('dragstart', (e) => {
      this.draggedCard = card;
      card.classList.add('dragging');
      e.dataTransfer.setData('application/json', JSON.stringify({
        id: card.dataset.id
      }));
    });
    
    card.addEventListener('dragend', () => {
      this.draggedCard = null;
      card.classList.remove('dragging');
    });
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const column = e.currentTarget;
    const afterCard = this.getCardAfterDrag(column, e.clientY);
    
    if (afterCard) {
      column.insertBefore(this.draggedCard, afterCard);
    } else {
      column.appendChild(this.draggedCard);
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    const cardId = this.draggedCard.dataset.id;
    const newStatus = column.dataset.status;
    
    // Update backend
    this.updateCardStatus(cardId, newStatus);
  }
  
  getCardAfterDrag(column, y) {
    const cards = [...column.querySelectorAll('.card:not(.dragging)')];
    
    return cards.reduce((closest, card) => {
      const rect = card.getBoundingClientRect();
      const offset = y - rect.top - rect.height / 2;
      
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
  
  updateCardStatus(cardId, status) {
    // API call to update card
  }
}
```

### Drag Between Lists

```javascript
class DragBetweenLists {
  constructor(lists) {
    this.lists = lists;
    this.draggedItem = null;
    this.sourceList = null;
    
    lists.forEach(list => this.setupList(list));
  }
  
  setupList(list) {
    list.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      list.classList.add('drop-target');
    });
    
    list.addEventListener('dragleave', () => {
      list.classList.remove('drop-target');
    });
    
    list.addEventListener('drop', (e) => {
      e.preventDefault();
      list.classList.remove('drop-target');
      
      if (this.draggedItem) {
        list.appendChild(this.draggedItem);
        this.onMove(this.draggedItem, this.sourceList, list);
      }
    });
    
    list.querySelectorAll('.item').forEach(item => {
      this.setupItem(item);
    });
  }
  
  setupItem(item) {
    item.draggable = true;
    
    item.addEventListener('dragstart', (e) => {
      this.draggedItem = item;
      this.sourceList = item.parentElement;
      item.classList.add('dragging');
    });
    
    item.addEventListener('dragend', () => {
      this.draggedItem = null;
      this.sourceList = null;
      item.classList.remove('dragging');
    });
  }
  
  onMove(item, from, to) {
    console.log(`Moved ${item.textContent} from ${from.id} to ${to.id}`);
  }
}
```

---

## 3.9.7 Accessibility Considerations

```javascript
// Native drag and drop is NOT keyboard accessible
// Provide keyboard alternatives

class AccessibleDragDrop {
  constructor(container) {
    this.container = container;
    this.selectedItem = null;
    
    container.querySelectorAll('.item').forEach(item => {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-grabbed', 'false');
      
      item.addEventListener('keydown', this.handleKeydown.bind(this));
    });
    
    container.setAttribute('role', 'listbox');
    container.setAttribute('aria-label', 'Sortable list');
  }
  
  handleKeydown(e) {
    const item = e.target;
    
    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        this.toggleSelection(item);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        if (this.selectedItem) {
          this.moveUp(this.selectedItem);
        } else {
          this.focusPrevious(item);
        }
        break;
        
      case 'ArrowDown':
        e.preventDefault();
        if (this.selectedItem) {
          this.moveDown(this.selectedItem);
        } else {
          this.focusNext(item);
        }
        break;
        
      case 'Escape':
        if (this.selectedItem) {
          this.deselect();
        }
        break;
    }
  }
  
  toggleSelection(item) {
    if (this.selectedItem === item) {
      this.deselect();
    } else {
      if (this.selectedItem) {
        this.deselect();
      }
      this.selectedItem = item;
      item.setAttribute('aria-grabbed', 'true');
      item.classList.add('selected');
    }
  }
  
  deselect() {
    if (this.selectedItem) {
      this.selectedItem.setAttribute('aria-grabbed', 'false');
      this.selectedItem.classList.remove('selected');
      this.selectedItem = null;
    }
  }
  
  moveUp(item) {
    const prev = item.previousElementSibling;
    if (prev) {
      item.parentNode.insertBefore(item, prev);
      item.focus();
    }
  }
  
  moveDown(item) {
    const next = item.nextElementSibling;
    if (next) {
      item.parentNode.insertBefore(next, item);
      item.focus();
    }
  }
  
  focusPrevious(item) {
    const prev = item.previousElementSibling;
    if (prev) prev.focus();
  }
  
  focusNext(item) {
    const next = item.nextElementSibling;
    if (next) next.focus();
  }
}
```

---

## 3.9.8 Gotchas

```javascript
// ❌ Forgetting preventDefault on dragover
dropZone.addEventListener('dragover', handler);
// Drop will NOT work without preventDefault!

// ✅ Always prevent default on dragover
dropZone.addEventListener('dragover', (e) => {
  e.preventDefault();
});

// ❌ Trying to access dataTransfer data in dragover
dropZone.addEventListener('dragover', (e) => {
  const data = e.dataTransfer.getData('text');
  // Returns empty string! (security restriction)
});

// ✅ Only access data in drop event
dropZone.addEventListener('drop', (e) => {
  const data = e.dataTransfer.getData('text');
  // Works here
});

// ❌ dragleave fires when entering child elements
dropZone.addEventListener('dragleave', (e) => {
  dropZone.classList.remove('active');
  // Flickers when moving over children!
});

// ✅ Check if actually leaving the drop zone
dropZone.addEventListener('dragleave', (e) => {
  if (!dropZone.contains(e.relatedTarget)) {
    dropZone.classList.remove('active');
  }
});

// ❌ Not preventing default on drop
dropZone.addEventListener('drop', (e) => {
  // Browser may navigate to dropped URL or open file!
});

// ✅ Always prevent default on drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  handleDrop(e);
});
```

---

## 3.9.9 Summary

### Drag Events

| Event | Target | When |
|-------|--------|------|
| `dragstart` | Draggable | Drag begins |
| `drag` | Draggable | While dragging |
| `dragend` | Draggable | Drag ends |
| `dragenter` | Drop zone | Enter drop zone |
| `dragover` | Drop zone | Over drop zone |
| `dragleave` | Drop zone | Leave drop zone |
| `drop` | Drop zone | Item dropped |

### DataTransfer Properties

| Property | Description |
|----------|-------------|
| `setData(type, data)` | Set drag data |
| `getData(type)` | Get drag data (drop only) |
| `types` | Array of data types |
| `files` | FileList for file drops |
| `effectAllowed` | Allowed operations |
| `dropEffect` | Current operation |
| `setDragImage()` | Custom drag image |

### Best Practices

1. **Always `preventDefault` on `dragover`** to enable drops
2. **Always `preventDefault` on `drop`** to prevent browser defaults
3. **Handle `dragleave` carefully** — use `relatedTarget` check
4. **Set data in `dragstart`** — only accessible in `drop`
5. **Provide keyboard alternatives** for accessibility
6. **Use `effectAllowed` and `dropEffect`** for visual feedback

---

**End of Chapter 3.9: Drag and Drop Events**

Next chapter: **3.10 Window Events** — covers load, resize, scroll, beforeunload, and other window-level events.
