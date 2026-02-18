# 27.1 NFC Operations

The Web NFC API enables reading and writing NFC tags on supported devices. This chapter covers NFC tag reading, writing, and NDEF message handling.

---

## 27.1.1 Basic Usage

### Read NFC Tag

```javascript
async function readNFC() {
  if (!('NDEFReader' in window)) {
    console.log('Web NFC not supported');
    return;
  }
  
  const reader = new NDEFReader();
  
  try {
    await reader.scan();
    console.log('Scanning...');
    
    reader.addEventListener('reading', (event) => {
      console.log('Serial:', event.serialNumber);
      
      for (const record of event.message.records) {
        console.log('Type:', record.recordType);
        console.log('Data:', record.data);
      }
    });
    
  } catch (error) {
    console.error('Scan failed:', error);
  }
}
```

---

## 27.1.2 NDEF Records

### Record Types

```javascript
reader.addEventListener('reading', (event) => {
  for (const record of event.message.records) {
    switch (record.recordType) {
      case 'text':
        const decoder = new TextDecoder(record.encoding);
        console.log('Text:', decoder.decode(record.data));
        break;
        
      case 'url':
        console.log('URL:', new TextDecoder().decode(record.data));
        break;
        
      case 'mime':
        console.log('MIME type:', record.mediaType);
        break;
        
      case 'smart-poster':
        // Contains nested records
        break;
    }
  }
});
```

### Read Text Record

```javascript
function readTextRecord(record) {
  const decoder = new TextDecoder(record.encoding);
  return decoder.decode(record.data);
}
```

### Read URL Record

```javascript
function readURLRecord(record) {
  const decoder = new TextDecoder();
  return decoder.decode(record.data);
}
```

---

## 27.1.3 Write NFC Tag

### Write Text

```javascript
async function writeText(text) {
  const writer = new NDEFReader();
  
  try {
    await writer.write({
      records: [{
        recordType: 'text',
        data: text
      }]
    });
    
    console.log('Written successfully');
    
  } catch (error) {
    console.error('Write failed:', error);
  }
}
```

### Write URL

```javascript
async function writeURL(url) {
  const writer = new NDEFReader();
  
  await writer.write({
    records: [{
      recordType: 'url',
      data: url
    }]
  });
}
```

### Write Multiple Records

```javascript
async function writeMultiple() {
  const writer = new NDEFReader();
  
  await writer.write({
    records: [
      {
        recordType: 'url',
        data: 'https://example.com'
      },
      {
        recordType: 'text',
        data: 'Visit our website'
      }
    ]
  });
}
```

---

## 27.1.4 Write Options

### Signal for Abort

```javascript
const controller = new AbortController();

const writer = new NDEFReader();

await writer.write(
  { records: [{ recordType: 'text', data: 'Hello' }] },
  { signal: controller.signal }
);

// Cancel write
controller.abort();
```

### Overwrite Protection

```javascript
await writer.write(
  { records: [{ recordType: 'text', data: 'Hello' }] },
  { overwrite: false }  // Don't overwrite existing data
);
```

---

## 27.1.5 Reading Events

### Handle Multiple Tags

```javascript
const reader = new NDEFReader();

reader.addEventListener('reading', (event) => {
  console.log('Tag serial:', event.serialNumber);
  processTag(event.message);
});

reader.addEventListener('readingerror', (event) => {
  console.error('Read error');
});

await reader.scan();
```

---

## 27.1.6 Permission Handling

### Request Permission

```javascript
async function checkNFCPermission() {
  try {
    const permission = await navigator.permissions.query({ name: 'nfc' });
    return permission.state;
  } catch {
    return 'unsupported';
  }
}
```

---

## 27.1.7 Complete Example

### NFC Card Reader

```javascript
class NFCCardReader {
  constructor() {
    this.reader = null;
    this.controller = null;
  }
  
  async startScanning() {
    if (!('NDEFReader' in window)) {
      throw new Error('NFC not supported');
    }
    
    this.reader = new NDEFReader();
    this.controller = new AbortController();
    
    this.reader.addEventListener('reading', (e) => this.handleRead(e));
    this.reader.addEventListener('readingerror', () => this.onError?.());
    
    await this.reader.scan({ signal: this.controller.signal });
  }
  
  handleRead(event) {
    const data = {
      serialNumber: event.serialNumber,
      records: []
    };
    
    for (const record of event.message.records) {
      const decoder = new TextDecoder(record.encoding || 'utf-8');
      
      data.records.push({
        type: record.recordType,
        data: decoder.decode(record.data)
      });
    }
    
    this.onRead?.(data);
  }
  
  async write(records) {
    const writer = new NDEFReader();
    await writer.write({ records });
  }
  
  stopScanning() {
    this.controller?.abort();
  }
}

// Usage
const nfc = new NFCCardReader();
nfc.onRead = (data) => console.log('Read:', data);
await nfc.startScanning();
```

---

## 27.1.8 Summary

### NDEFReader Methods

| Method | Description |
|--------|-------------|
| `scan(options)` | Start scanning |
| `write(message, options)` | Write to tag |

### Events

| Event | When |
|-------|------|
| `reading` | Tag read successfully |
| `readingerror` | Tag read failed |

### Record Types

| Type | Description |
|------|-------------|
| `text` | Text record |
| `url` | URL record |
| `mime` | MIME type record |
| `smart-poster` | Smart poster |
| `empty` | Empty record |
| `unknown` | Unknown type |

### Best Practices

1. **Check support** before using
2. **Handle permission** gracefully
3. **Use AbortController** to stop scanning
4. **Decode data** with correct encoding
5. **Handle errors** for read failures
6. **Test on real devices** — emulators limited

---

**End of Chapter 27.1: NFC Operations**

Next: **28.1 MIDI Access** — Web MIDI API.
