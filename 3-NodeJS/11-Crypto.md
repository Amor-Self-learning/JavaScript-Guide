# Module 11: Crypto

The `crypto` module provides cryptographic functionality including hashing, encryption, decryption, signing, and random number generation. It wraps OpenSSL for high-performance, secure operations.

---

## 11.1 Module Import

```javascript
// CommonJS
const crypto = require('crypto');

// ES Modules
import crypto from 'crypto';
import { createHash, createCipheriv, randomBytes } from 'crypto';
```

---

## 11.2 Random Data Generation

### randomBytes()

```javascript
// Synchronous
const bytes = crypto.randomBytes(32);
console.log(bytes.toString('hex'));
// 'a1b2c3d4e5f6...' (64 hex characters)

// Asynchronous
crypto.randomBytes(32, (err, buf) => {
  if (err) throw err;
  console.log(buf.toString('hex'));
});

// Promise wrapper
const { promisify } = require('util');
const randomBytesAsync = promisify(crypto.randomBytes);
const bytes = await randomBytesAsync(32);
```

### randomInt()

```javascript
// Random integer in range [min, max)
const num = crypto.randomInt(100);        // 0-99
const num2 = crypto.randomInt(10, 100);   // 10-99

// Asynchronous
crypto.randomInt(100, (err, n) => {
  console.log(n);
});

// Promise-based
const n = await new Promise((resolve, reject) => {
  crypto.randomInt(100, (err, n) => {
    if (err) reject(err);
    else resolve(n);
  });
});
```

### randomUUID()

```javascript
const uuid = crypto.randomUUID();
console.log(uuid);
// 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
```

### randomFillSync()

```javascript
// Fill buffer with random bytes
const buf = Buffer.alloc(16);
crypto.randomFillSync(buf);
console.log(buf.toString('hex'));

// Fill typed array
const arr = new Uint32Array(4);
crypto.randomFillSync(arr);
console.log(arr);
// Uint32Array(4) [ 3847382910, 1029384756, ... ]
```

---

## 11.3 Hashing

### createHash()

```javascript
// Create hash
const hash = crypto.createHash('sha256');
hash.update('Hello World');
const digest = hash.digest('hex');
console.log(digest);
// 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e'

// One-liner
const hash = crypto.createHash('sha256').update('Hello World').digest('hex');

// Multiple updates
const hash = crypto.createHash('sha256');
hash.update('Hello ');
hash.update('World');
console.log(hash.digest('hex'));
// Same result as above
```

### Available Algorithms

```javascript
console.log(crypto.getHashes());
// ['sha1', 'sha256', 'sha384', 'sha512', 'md5', ...]

// Common algorithms
// md5 - 128 bits (not secure, legacy only)
// sha1 - 160 bits (not secure for signatures)
// sha256 - 256 bits (recommended)
// sha384 - 384 bits
// sha512 - 512 bits
```

### File Hashing

```javascript
const fs = require('fs');

// Stream-based (memory efficient)
function hashFile(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

const fileHash = await hashFile('large-file.zip');
console.log(fileHash);
```

### HMAC (Keyed Hash)

```javascript
const secret = 'my-secret-key';

// Create HMAC
const hmac = crypto.createHmac('sha256', secret);
hmac.update('message');
const signature = hmac.digest('hex');
console.log(signature);

// One-liner
const sig = crypto.createHmac('sha256', secret)
  .update('message')
  .digest('hex');

// Verify HMAC (timing-safe)
function verifyHmac(message, signature, secret) {
  const expected = crypto.createHmac('sha256', secret)
    .update(message)
    .digest('hex');
  
  // Timing-safe comparison
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}
```

---

## 11.4 Symmetric Encryption (AES)

### Encryption with AES-256-GCM (Recommended)

```javascript
function encrypt(plaintext, key) {
  // Generate random IV (12 bytes for GCM)
  const iv = crypto.randomBytes(12);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  // Encrypt
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag (16 bytes)
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + ciphertext
  return iv.toString('hex') + authTag.toString('hex') + encrypted;
}

function decrypt(ciphertext, key) {
  // Extract IV, auth tag, and encrypted data
  const iv = Buffer.from(ciphertext.slice(0, 24), 'hex');
  const authTag = Buffer.from(ciphertext.slice(24, 56), 'hex');
  const encrypted = ciphertext.slice(56);
  
  // Create decipher
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage
const key = crypto.randomBytes(32);  // 256 bits
const encrypted = encrypt('Secret message', key);
const decrypted = decrypt(encrypted, key);
console.log(decrypted);  // 'Secret message'
```

### AES-256-CBC (Legacy)

```javascript
function encryptCBC(plaintext, key) {
  const iv = crypto.randomBytes(16);  // 16 bytes for CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + encrypted;
}

function decryptCBC(ciphertext, key) {
  const iv = Buffer.from(ciphertext.slice(0, 32), 'hex');
  const encrypted = ciphertext.slice(32);
  
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Key Derivation (PBKDF2)

```javascript
// Derive key from password
function deriveKey(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve({ key, salt });
    });
  });
}

// Synchronous version
const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
```

### Scrypt (More Secure Key Derivation)

```javascript
function deriveKeyScrypt(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, key) => {
      if (err) reject(err);
      else resolve({ key, salt });
    });
  });
}

// Synchronous
const key = crypto.scryptSync(password, salt, 32);
```

---

## 11.5 Asymmetric Encryption (RSA)

### Generate Key Pair

```javascript
const { generateKeyPairSync, generateKeyPair } = crypto;

// Synchronous
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Asynchronous
generateKeyPair('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
}, (err, publicKey, privateKey) => {
  console.log(publicKey);
  console.log(privateKey);
});
```

### Encrypt/Decrypt with RSA

```javascript
// Encrypt with public key
function rsaEncrypt(plaintext, publicKey) {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(plaintext)
  ).toString('base64');
}

// Decrypt with private key
function rsaDecrypt(ciphertext, privateKey) {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    Buffer.from(ciphertext, 'base64')
  ).toString('utf8');
}

// Usage
const encrypted = rsaEncrypt('Secret message', publicKey);
const decrypted = rsaDecrypt(encrypted, privateKey);
```

---

## 11.6 Digital Signatures

### Sign and Verify

```javascript
const { createSign, createVerify } = crypto;

// Sign data
function sign(data, privateKey) {
  const signer = createSign('sha256');
  signer.update(data);
  return signer.sign(privateKey, 'hex');
}

// Verify signature
function verify(data, signature, publicKey) {
  const verifier = createVerify('sha256');
  verifier.update(data);
  return verifier.verify(publicKey, signature, 'hex');
}

// Usage
const signature = sign('Hello World', privateKey);
const isValid = verify('Hello World', signature, publicKey);
console.log(isValid);  // true
```

### Ed25519 Signatures (Faster)

```javascript
// Generate Ed25519 key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

// Sign
const signature = crypto.sign(null, Buffer.from('data'), privateKey);

// Verify
const isValid = crypto.verify(null, Buffer.from('data'), publicKey, signature);
```

---

## 11.7 Diffie-Hellman Key Exchange

```javascript
const { createDiffieHellman, createECDH } = crypto;

// Classic DH
const alice = createDiffieHellman(2048);
alice.generateKeys();

const bob = createDiffieHellman(alice.getPrime(), alice.getGenerator());
bob.generateKeys();

// Exchange public keys and compute shared secret
const aliceSecret = alice.computeSecret(bob.getPublicKey());
const bobSecret = bob.computeSecret(alice.getPublicKey());

console.log(aliceSecret.equals(bobSecret));  // true
```

### ECDH (Elliptic Curve DH)

```javascript
// Create ECDH instances
const alice = createECDH('secp256k1');
alice.generateKeys();

const bob = createECDH('secp256k1');
bob.generateKeys();

// Exchange and compute
const aliceSecret = alice.computeSecret(bob.getPublicKey());
const bobSecret = bob.computeSecret(alice.getPublicKey());

console.log(aliceSecret.equals(bobSecret));  // true

// Use shared secret as encryption key
const key = crypto.createHash('sha256').update(aliceSecret).digest();
```

---

## 11.8 Password Hashing

### Using scrypt (Recommended)

```javascript
async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  return salt.toString('hex') + ':' + hash.toString('hex');
}

async function verifyPassword(password, storedHash) {
  const [saltHex, hashHex] = storedHash.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(hashHex, 'hex');
  
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  
  return crypto.timingSafeEqual(derivedKey, storedKey);
}

// Usage
const hash = await hashPassword('mypassword123');
const isValid = await verifyPassword('mypassword123', hash);
console.log(isValid);  // true
```

---

## 11.9 Timing-Safe Comparison

```javascript
// ❌ Vulnerable to timing attacks
function unsafeCompare(a, b) {
  return a === b;
}

// ✅ Timing-safe comparison
function safeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

// Always use for comparing secrets, signatures, tokens
```

---

## 11.10 X509 Certificates

```javascript
const { X509Certificate } = crypto;

// Parse certificate
const cert = new X509Certificate(fs.readFileSync('cert.pem'));

console.log(cert.subject);            // Subject DN
console.log(cert.issuer);             // Issuer DN
console.log(cert.validFrom);          // Valid from date
console.log(cert.validTo);            // Valid to date
console.log(cert.serialNumber);       // Serial number
console.log(cert.fingerprint256);     // SHA-256 fingerprint

// Check validity
console.log(cert.checkHost('example.com'));  // Returns subject if valid
console.log(cert.checkEmail('test@example.com'));
console.log(cert.checkIP('192.168.1.1'));

// Verify certificate
console.log(cert.verify(caCert.publicKey));  // true/false
```

---

## 11.11 Common Patterns

### Generate Secure Token

```javascript
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// URL-safe token
function generateUrlSafeToken(length = 32) {
  return crypto.randomBytes(length).toString('base64url');
}

const apiKey = generateToken(24);
const resetToken = generateUrlSafeToken(32);
```

### Hash Verification

```javascript
function createFileChecksum(filePath, algorithm = 'sha256') {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash(algorithm);
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function verifyFileChecksum(filePath, expectedChecksum, algorithm = 'sha256') {
  const actualChecksum = await createFileChecksum(filePath, algorithm);
  return crypto.timingSafeEqual(
    Buffer.from(actualChecksum, 'hex'),
    Buffer.from(expectedChecksum, 'hex')
  );
}
```

### Secure Session ID

```javascript
function generateSessionId() {
  const bytes = crypto.randomBytes(32);
  const timestamp = Date.now().toString(16);
  const random = bytes.toString('base64url');
  return `${timestamp}.${random}`;
}

// Output: '18d5a7b3c00.Ks8Hj_9xMnO3pQ2rS...'
```

---

## 11.12 Security Best Practices

### Do's

```javascript
// ✅ Use authenticated encryption (GCM)
crypto.createCipheriv('aes-256-gcm', key, iv);

// ✅ Use strong key derivation for passwords
crypto.scrypt(password, salt, 64, callback);

// ✅ Use timing-safe comparison
crypto.timingSafeEqual(a, b);

// ✅ Generate cryptographically secure random values
crypto.randomBytes(32);
crypto.randomUUID();

// ✅ Use modern algorithms
crypto.createHash('sha256');  // Not MD5 or SHA1
```

### Don'ts

```javascript
// ❌ Don't use weak algorithms
crypto.createHash('md5');    // Weak
crypto.createHash('sha1');   // Weak for signatures

// ❌ Don't use ECB mode
crypto.createCipheriv('aes-256-ecb', key);  // No IV, patterns visible

// ❌ Don't use hardcoded keys/IVs
const key = Buffer.from('mysecretkey12345');  // Bad!

// ❌ Don't use Math.random() for crypto
Math.random().toString(36);  // Not secure!

// ❌ Don't compare secrets with ===
if (token === expectedToken) { }  // Timing attack vulnerable!
```

---

## 11.13 Summary

| Random | Description |
|--------|-------------|
| `randomBytes(n)` | Cryptographically secure random bytes |
| `randomInt(min, max)` | Secure random integer |
| `randomUUID()` | Generate UUID v4 |

| Hashing | Description |
|---------|-------------|
| `createHash(alg)` | Create hash (sha256, sha512) |
| `createHmac(alg, key)` | Create keyed hash |

| Encryption | Description |
|------------|-------------|
| `createCipheriv()` | Symmetric encryption |
| `createDecipheriv()` | Symmetric decryption |
| `publicEncrypt()` | RSA encryption |
| `privateDecrypt()` | RSA decryption |

| Key Derivation | Description |
|----------------|-------------|
| `scrypt()` | Password-based (recommended) |
| `pbkdf2()` | Password-based (legacy) |

| Signatures | Description |
|------------|-------------|
| `createSign()` | Create signature |
| `createVerify()` | Verify signature |
| `sign()` / `verify()` | One-shot signing |

| Utilities | Description |
|-----------|-------------|
| `timingSafeEqual()` | Constant-time comparison |
| `getHashes()` | List available hash algorithms |
| `getCiphers()` | List available ciphers |

---

**End of Module 11: Crypto**

Next: **Module 12 — Child Process** (Spawning and managing child processes)
