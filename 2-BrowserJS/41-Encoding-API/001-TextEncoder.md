# 41.1 TextEncoder

TextEncoder converts strings to UTF-8 encoded bytes.

---

## 41.1.1 Basic Usage

```javascript
const encoder = new TextEncoder();

const bytes = encoder.encode('Hello, 世界');
console.log(bytes);  // Uint8Array

console.log(encoder.encoding);  // 'utf-8'
```

---

## 41.1.2 Encode Into Buffer

```javascript
const encoder = new TextEncoder();
const buffer = new Uint8Array(100);

const { read, written } = encoder.encodeInto('Hello', buffer);
console.log('Characters read:', read);
console.log('Bytes written:', written);
```

---

## 41.1.3 Use Cases

### Prepare for Crypto

```javascript
async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return hash;
}
```

### Write to Stream

```javascript
const encoder = new TextEncoder();
const writer = writableStream.getWriter();

await writer.write(encoder.encode('data'));
```

---

## 41.1.4 Summary

| Method | Description |
|--------|-------------|
| `encode(string)` | Returns Uint8Array |
| `encodeInto(string, buffer)` | Encode into existing buffer |

---

**End of Chapter 41.1: TextEncoder**

Next: **41.2 TextDecoder**.
