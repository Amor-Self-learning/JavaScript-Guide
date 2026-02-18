# 44.2 Random Values

The Crypto interface provides cryptographically secure random number generation.

---

## 44.2.1 getRandomValues

```javascript
// Generate random bytes
const array = new Uint8Array(16);
crypto.getRandomValues(array);

// Different typed arrays
const int32 = new Int32Array(4);
crypto.getRandomValues(int32);
```

---

## 44.2.2 Random UUID

```javascript
const uuid = crypto.randomUUID();
// "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d"
```

---

## 44.2.3 Random Integer in Range

```javascript
function randomInt(min, max) {
  const range = max - min;
  const bytesNeeded = Math.ceil(Math.log2(range) / 8);
  const randomBytes = new Uint8Array(bytesNeeded);
  
  let value;
  do {
    crypto.getRandomValues(randomBytes);
    value = randomBytes.reduce((acc, byte) => acc * 256 + byte, 0);
  } while (value >= Math.floor(256 ** bytesNeeded / range) * range);
  
  return min + (value % range);
}
```

---

## 44.2.4 Security Note

```javascript
// ❌ Not cryptographically secure
Math.random();

// ✅ Cryptographically secure
crypto.getRandomValues(new Uint8Array(16));
```

---

## 44.2.5 Summary

| Method | Description |
|--------|-------------|
| `getRandomValues(array)` | Fill with random bytes |
| `randomUUID()` | Generate UUID v4 |

---

**End of Chapter 44.2: Random Values**

This completes Group 44 — Web Cryptography API. Next: **Group 45 — WebGL API**.
