# 54.1 Trusted Types API

Trusted Types prevent DOM XSS by requiring safe values for dangerous sinks.

---

## 54.1.1 Enable Trusted Types

```http
Content-Security-Policy: require-trusted-types-for 'script'
```

---

## 54.1.2 Create Policy

```javascript
const policy = trustedTypes.createPolicy('myPolicy', {
  createHTML: (input) => {
    // Sanitize input
    return DOMPurify.sanitize(input);
  },
  createScript: (input) => input,
  createScriptURL: (input) => {
    if (input.startsWith('https://trusted.com/')) {
      return input;
    }
    throw new Error('Untrusted URL');
  }
});
```

---

## 54.1.3 Use Trusted Values

```javascript
// Without Trusted Types (throws error when enforced)
element.innerHTML = userInput;

// With Trusted Types
element.innerHTML = policy.createHTML(userInput);
```

---

## 54.1.4 Default Policy

```javascript
trustedTypes.createPolicy('default', {
  createHTML: (input, sink) => {
    console.warn('Unsafe HTML assignment to', sink);
    return DOMPurify.sanitize(input);
  }
});
```

---

## 54.1.5 Check Support

```javascript
if (window.trustedTypes) {
  // Trusted Types supported
}

// Check if enforced
if (trustedTypes.isHTML) {
  // Can check trusted values
}
```

---

## 54.1.6 Summary

| Method | Creates |
|--------|---------|
| `createHTML()` | TrustedHTML |
| `createScript()` | TrustedScript |
| `createScriptURL()` | TrustedScriptURL |

---

**End of Chapter 54.1: Trusted Types API**

This completes Group 54. Next: **Group 55 — Feature Policy API**.
