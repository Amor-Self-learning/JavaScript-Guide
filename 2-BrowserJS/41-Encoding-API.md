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
# 41.2 TextDecoder

TextDecoder converts encoded bytes to strings.

---

## 41.2.1 Basic Usage

```javascript
const decoder = new TextDecoder();

const bytes = new Uint8Array([72, 101, 108, 108, 111]);
const text = decoder.decode(bytes);
console.log(text);  // 'Hello'
```

---

## 41.2.2 Specify Encoding

```javascript
// UTF-8 (default)
const utf8Decoder = new TextDecoder('utf-8');

// UTF-16
const utf16Decoder = new TextDecoder('utf-16le');

// ISO-8859-1
const latinDecoder = new TextDecoder('iso-8859-1');

// Check encoding
console.log(utf8Decoder.encoding);  // 'utf-8'
```

---

## 41.2.3 Options

```javascript
const decoder = new TextDecoder('utf-8', {
  fatal: true,    // Throw on invalid sequences
  ignoreBOM: true // Ignore byte order mark
});
```

---

## 41.2.4 Streaming Decode

```javascript
const decoder = new TextDecoder();

// First chunk (incomplete)
let text = decoder.decode(chunk1, { stream: true });

// Subsequent chunks
text += decoder.decode(chunk2, { stream: true });

// Final chunk
text += decoder.decode(chunk3);  // stream: false (default)
```

---

## 41.2.5 Summary

| Option | Description |
|--------|-------------|
| `fatal` | Throw on invalid bytes |
| `ignoreBOM` | Ignore BOM |
| `stream` | Streaming mode |

### Supported Encodings

UTF-8, UTF-16, ISO-8859-1 through 16, Windows-1250 through 1258, and more.

---

**End of Chapter 41.2: TextDecoder**

This completes Group 41 — Encoding API. Next: **Group 42 — Compression Streams API**.
