# 53.1 Content Security Policy API

CSP helps prevent XSS attacks by controlling which resources can be loaded.

---

## 53.1.1 HTTP Header

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

---

## 53.1.2 Meta Tag

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; img-src *">
```

---

## 53.1.3 Common Directives

| Directive | Controls |
|-----------|----------|
| `default-src` | Fallback for all |
| `script-src` | Scripts |
| `style-src` | Stylesheets |
| `img-src` | Images |
| `connect-src` | Fetch, WebSocket |
| `font-src` | Fonts |
| `frame-src` | Iframes |
| `media-src` | Audio/Video |

---

## 53.1.4 Source Values

```http
Content-Security-Policy: script-src 'self' 'unsafe-inline' 'unsafe-eval' https: nonce-abc123
```

| Value | Meaning |
|-------|---------|
| `'self'` | Same origin |
| `'none'` | Block all |
| `'unsafe-inline'` | Allow inline |
| `'unsafe-eval'` | Allow eval() |
| `'nonce-xxx'` | Nonce token |
| `'sha256-xxx'` | Hash |

---

## 53.1.5 Violation Reporting

```http
Content-Security-Policy: default-src 'self'; report-uri /csp-report
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report
```

### JavaScript Detection

```javascript
document.addEventListener('securitypolicyviolation', (event) => {
  console.log('CSP violation:', event.violatedDirective);
  console.log('Blocked URI:', event.blockedURI);
});
```

---

## 53.1.6 Summary

| Header | Behavior |
|--------|----------|
| `Content-Security-Policy` | Enforce |
| `Content-Security-Policy-Report-Only` | Report only |

---

**End of Chapter 53.1: Content Security Policy API**

This completes Group 53. Next: **Group 54 — Trusted Types API**.
