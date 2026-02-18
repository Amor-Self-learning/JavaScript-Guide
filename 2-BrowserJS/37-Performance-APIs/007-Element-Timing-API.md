# 37.7 Element Timing API

The Element Timing API measures render timing for specific elements marked with the `elementtiming` attribute.

---

## 37.7.1 Mark Elements

### HTML Attribute

```html
<img src="hero.jpg" elementtiming="hero-image" alt="Hero">
<div elementtiming="main-content">Main content here</div>
```

---

## 37.7.2 Observe Element Timing

### Setup Observer

```javascript
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Element:', entry.identifier);
    console.log('Render time:', entry.renderTime);
    console.log('Load time:', entry.loadTime);
    console.log('Size:', entry.intersectionRect);
  });
});

observer.observe({ type: 'element', buffered: true });
```

---

## 37.7.3 Entry Properties

### Available Data

```javascript
entry.identifier;      // elementtiming attribute value
entry.renderTime;      // When element was painted
entry.loadTime;        // When element finished loading
entry.element;         // The element reference
entry.url;             // Resource URL (for images)
entry.naturalWidth;    // Image natural width
entry.naturalHeight;   // Image natural height
```

---

## 37.7.4 Summary

### Setup Steps

1. Add `elementtiming="name"` to elements
2. Create PerformanceObserver for 'element' type
3. Read timing entries

---

**End of Chapter 37.7: Element Timing API**

Next: **37.8 Event Timing API**.
