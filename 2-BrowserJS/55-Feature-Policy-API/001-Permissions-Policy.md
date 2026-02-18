# 55.1 Permissions Policy

Permissions Policy (formerly Feature Policy) controls browser features.

---

## 55.1.1 HTTP Header

```http
Permissions-Policy: geolocation=(), camera=(self), microphone=(self "https://example.com")
```

---

## 55.1.2 Iframe Allow Attribute

```html
<iframe src="https://example.com" 
        allow="camera; microphone; fullscreen">
</iframe>
```

---

## 55.1.3 Common Features

| Feature | Description |
|---------|-------------|
| `accelerometer` | Motion sensors |
| `camera` | Camera access |
| `geolocation` | Location access |
| `microphone` | Microphone access |
| `fullscreen` | Fullscreen API |
| `payment` | Payment Request API |
| `autoplay` | Media autoplay |

---

## 55.1.4 JavaScript Detection

```javascript
// Check if feature allowed
document.featurePolicy.allowsFeature('geolocation');
// true or false

// Check for specific origin
document.featurePolicy.allowsFeature('camera', 'https://example.com');

// List all features
document.featurePolicy.features();

// List allowed origins for feature
document.featurePolicy.getAllowlistForFeature('microphone');
```

---

## 55.1.5 Policy Values

```http
# Disable for all
Permissions-Policy: camera=()

# Allow for same origin
Permissions-Policy: camera=(self)

# Allow for specific origins
Permissions-Policy: camera=(self "https://example.com")

# Allow for all (wildcard)
Permissions-Policy: camera=*
```

---

## 55.1.6 Summary

| Syntax | Meaning |
|--------|---------|
| `()` | Disabled |
| `(self)` | Same origin |
| `*` | All origins |
| `("url")` | Specific origin |

---

**End of Chapter 55.1: Permissions Policy**

This completes Group 55. Next: **Group 56 — Launch Handler API**.
