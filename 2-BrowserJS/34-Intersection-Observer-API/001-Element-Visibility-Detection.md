# 34.1 Element Visibility Detection

The Intersection Observer API detects when elements enter or exit the viewport, enabling lazy loading and infinite scroll.

---

## 34.1.1 Basic Usage

### Create Observer

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element is visible:', entry.target);
    } else {
      console.log('Element is hidden:', entry.target);
    }
  });
});

// Observe element
observer.observe(document.querySelector('.target'));
```

---

## 34.1.2 Observer Options

### Configure Observer

```javascript
const observer = new IntersectionObserver(callback, {
  // Root element (default: viewport)
  root: document.querySelector('.scroll-container'),
  
  // Margin around root
  rootMargin: '100px 0px',  // top/bottom left/right
  
  // Visibility thresholds (0-1)
  threshold: [0, 0.5, 1]  // Callback at 0%, 50%, 100% visible
});
```

---

## 34.1.3 Intersection Entry

### Entry Properties

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    entry.target;              // Observed element
    entry.isIntersecting;      // Is visible
    entry.intersectionRatio;   // 0-1 visibility ratio
    entry.boundingClientRect;  // Element bounds
    entry.rootBounds;          // Root bounds
    entry.intersectionRect;    // Intersection bounds
    entry.time;                // Timestamp
  });
});
```

---

## 34.1.4 Stop Observing

### Unobserve

```javascript
// Stop observing one element
observer.unobserve(element);

// Stop all observations
observer.disconnect();
```

---

## 34.1.5 Lazy Loading Images

### Image Lazy Load

```javascript
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '100px'  // Load 100px before visible
  });
  
  images.forEach(img => observer.observe(img));
}
```

```html
<img data-src="image.jpg" alt="Lazy loaded">
```

---

## 34.1.6 Infinite Scroll

### Load More on Scroll

```javascript
function setupInfiniteScroll(sentinel, loadMore) {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  });
  
  observer.observe(sentinel);
}

// Usage
const sentinel = document.querySelector('.sentinel');
setupInfiniteScroll(sentinel, async () => {
  const items = await fetchMoreItems();
  appendItems(items);
});
```

---

## 34.1.7 Animate on Scroll

### Trigger Animations

```javascript
function animateOnScroll() {
  const elements = document.querySelectorAll('.animate-on-scroll');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);  // Only once
      }
    });
  }, {
    threshold: 0.2  // 20% visible
  });
  
  elements.forEach(el => observer.observe(el));
}
```

---

## 34.1.8 Track Visibility

### Analytics Tracking

```javascript
function trackVisibility(elements, onVisible) {
  const seen = new Set();
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !seen.has(entry.target)) {
        seen.add(entry.target);
        onVisible(entry.target);
      }
    });
  }, {
    threshold: 0.5  // 50% visible
  });
  
  elements.forEach(el => observer.observe(el));
  
  return observer;
}

// Track ad impressions
trackVisibility(document.querySelectorAll('.ad'), (ad) => {
  sendAnalytics('ad_impression', { id: ad.dataset.adId });
});
```

---

## 34.1.9 Complete Example

### Lazy Load Manager

```javascript
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      root: null,
      rootMargin: '100px',
      threshold: 0,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.options
    );
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.load(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }
  
  load(element) {
    if (element.dataset.src) {
      element.src = element.dataset.src;
    }
    
    if (element.dataset.bgSrc) {
      element.style.backgroundImage = `url(${element.dataset.bgSrc})`;
    }
    
    element.classList.add('loaded');
  }
  
  observe(selector) {
    document.querySelectorAll(selector).forEach(el => {
      this.observer.observe(el);
    });
  }
  
  destroy() {
    this.observer.disconnect();
  }
}

// Usage
const lazy = new LazyLoader({ rootMargin: '200px' });
lazy.observe('[data-src], [data-bg-src]');
```

---

## 34.1.10 Summary

### Constructor

```javascript
new IntersectionObserver(callback, options)
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `root` | Element | viewport | Scroll container |
| `rootMargin` | String | '0px' | Margin around root |
| `threshold` | Number/Array | 0 | Visibility thresholds |

### Methods

| Method | Description |
|--------|-------------|
| `observe(element)` | Start observing |
| `unobserve(element)` | Stop observing |
| `disconnect()` | Stop all |
| `takeRecords()` | Get pending entries |

### Entry Properties

| Property | Type | Description |
|----------|------|-------------|
| `target` | Element | Observed element |
| `isIntersecting` | Boolean | Is visible |
| `intersectionRatio` | Number | 0-1 ratio |

### Best Practices

1. **Unobserve after load** — don't waste resources
2. **Use rootMargin** — preload before visible
3. **Set threshold** — appropriate for use case
4. **Disconnect** — cleanup when done
5. **Batch observations** — single observer for many elements

---

**End of Chapter 34.1: Element Visibility Detection**

Next: **35.1 DOM Change Detection** — Mutation Observer API.
