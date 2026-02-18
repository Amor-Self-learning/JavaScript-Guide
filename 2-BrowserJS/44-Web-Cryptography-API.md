# 44.1 SubtleCrypto

The SubtleCrypto interface provides low-level cryptographic operations.

---

## 44.1.1 Access SubtleCrypto

```javascript
const subtle = crypto.subtle;
// Or: window.crypto.subtle
```

---

## 44.1.2 Hashing

```javascript
async function hash(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  
  const hash = await crypto.subtle.digest('SHA-256', data);
  
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

await hash('Hello');  // 64-char hex string
```

---

## 44.1.3 Generate Keys

```javascript
// Symmetric key (AES)
const aesKey = await crypto.subtle.generateKey(
  { name: 'AES-GCM', length: 256 },
  true,  // extractable
  ['encrypt', 'decrypt']
);

// Asymmetric keys (RSA)
const rsaKeys = await crypto.subtle.generateKey(
  {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256'
  },
  true,
  ['encrypt', 'decrypt']
);
```

---

## 44.1.4 Encrypt/Decrypt

### AES-GCM

```javascript
const iv = crypto.getRandomValues(new Uint8Array(12));

// Encrypt
const ciphertext = await crypto.subtle.encrypt(
  { name: 'AES-GCM', iv },
  key,
  data
);

// Decrypt
const plaintext = await crypto.subtle.decrypt(
  { name: 'AES-GCM', iv },
  key,
  ciphertext
);
```

---

## 44.1.5 Sign/Verify

```javascript
// Sign
const signature = await crypto.subtle.sign(
  { name: 'RSASSA-PKCS1-v1_5' },
  privateKey,
  data
);

// Verify
const valid = await crypto.subtle.verify(
  { name: 'RSASSA-PKCS1-v1_5' },
  publicKey,
  signature,
  data
);
```

---

## 44.1.6 Export/Import Keys

```javascript
// Export
const exported = await crypto.subtle.exportKey('jwk', key);

// Import
const imported = await crypto.subtle.importKey(
  'jwk',
  jwkData,
  { name: 'AES-GCM' },
  true,
  ['encrypt', 'decrypt']
);
```

---

## 44.1.7 Summary

| Method | Description |
|--------|-------------|
| `digest()` | Hash data |
| `generateKey()` | Create keys |
| `encrypt()/decrypt()` | Symmetric encryption |
| `sign()/verify()` | Digital signatures |
| `importKey()/exportKey()` | Key management |

---

**End of Chapter 44.1: SubtleCrypto**

Next: **44.2 Random Values**.
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
