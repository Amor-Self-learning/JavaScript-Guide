# 25.1 USB Device Access

The WebUSB API provides access to USB devices from web pages. This chapter covers device selection, communication, and data transfer.

---

## 25.1.1 Basic Usage

### Request Device

```javascript
async function connectUSB() {
  if (!('usb' in navigator)) {
    console.log('WebUSB not supported');
    return null;
  }
  
  try {
    const device = await navigator.usb.requestDevice({
      filters: [
        { vendorId: 0x1234 }  // Filter by vendor
      ]
    });
    
    await device.open();
    console.log('Connected:', device.productName);
    
    return device;
    
  } catch (error) {
    console.error('Connection failed:', error);
    return null;
  }
}
```

---

## 25.1.2 Device Filters

### Filter Options

```javascript
// Filter by vendor
const device = await navigator.usb.requestDevice({
  filters: [{ vendorId: 0x1234 }]
});

// Filter by vendor and product
const device = await navigator.usb.requestDevice({
  filters: [{
    vendorId: 0x1234,
    productId: 0x5678
  }]
});

// Multiple filters (OR logic)
const device = await navigator.usb.requestDevice({
  filters: [
    { vendorId: 0x1234 },
    { vendorId: 0x5678 }
  ]
});

// Filter by class
const device = await navigator.usb.requestDevice({
  filters: [{
    classCode: 0xFF  // Vendor-specific
  }]
});
```

---

## 25.1.3 Device Setup

### Open and Configure

```javascript
async function setupDevice(device) {
  // Open device
  await device.open();
  
  // Select configuration
  if (device.configuration === null) {
    await device.selectConfiguration(1);
  }
  
  // Claim interface
  await device.claimInterface(0);
  
  console.log('Device ready');
}
```

---

## 25.1.4 Control Transfers

### Send Control Command

```javascript
async function controlOut(device, request, value, data) {
  const result = await device.controlTransferOut({
    requestType: 'vendor',
    recipient: 'device',
    request,
    value,
    index: 0
  }, data);
  
  return result.status === 'ok';
}

// Read control response
async function controlIn(device, request, value, length) {
  const result = await device.controlTransferIn({
    requestType: 'vendor',
    recipient: 'device',
    request,
    value,
    index: 0
  }, length);
  
  if (result.status === 'ok') {
    return result.data;  // DataView
  }
  
  throw new Error('Control transfer failed');
}
```

---

## 25.1.5 Bulk Transfers

### Send Data

```javascript
async function bulkOut(device, endpoint, data) {
  const result = await device.transferOut(endpoint, data);
  
  if (result.status !== 'ok') {
    throw new Error(`Transfer failed: ${result.status}`);
  }
  
  return result.bytesWritten;
}

// Usage
const encoder = new TextEncoder();
await bulkOut(device, 1, encoder.encode('Hello'));
```

### Receive Data

```javascript
async function bulkIn(device, endpoint, length) {
  const result = await device.transferIn(endpoint, length);
  
  if (result.status === 'ok') {
    return new Uint8Array(result.data.buffer);
  }
  
  throw new Error(`Transfer failed: ${result.status}`);
}

// Usage
const data = await bulkIn(device, 1, 64);
```

---

## 25.1.6 Close Device

### Clean Disconnect

```javascript
async function disconnectUSB(device) {
  try {
    await device.releaseInterface(0);
    await device.close();
    console.log('Disconnected');
  } catch (error) {
    console.error('Disconnect error:', error);
  }
}
```

---

## 25.1.7 Device Events

### Connection Events

```javascript
navigator.usb.addEventListener('connect', (event) => {
  console.log('Device connected:', event.device.productName);
});

navigator.usb.addEventListener('disconnect', (event) => {
  console.log('Device disconnected:', event.device.productName);
});
```

---

## 25.1.8 Get Authorized Devices

### Previously Connected

```javascript
async function getKnownDevices() {
  const devices = await navigator.usb.getDevices();
  
  for (const device of devices) {
    console.log('Known device:', device.productName);
  }
  
  return devices;
}
```

---

## 25.1.9 Complete Example

### USB Device Class

```javascript
class USBDevice {
  constructor() {
    this.device = null;
  }
  
  async connect(vendorId) {
    this.device = await navigator.usb.requestDevice({
      filters: [{ vendorId }]
    });
    
    await this.device.open();
    await this.device.selectConfiguration(1);
    await this.device.claimInterface(0);
    
    return true;
  }
  
  async send(endpoint, data) {
    if (!this.device) throw new Error('Not connected');
    
    const result = await this.device.transferOut(endpoint, data);
    return result.status === 'ok';
  }
  
  async receive(endpoint, length) {
    if (!this.device) throw new Error('Not connected');
    
    const result = await this.device.transferIn(endpoint, length);
    
    if (result.status === 'ok') {
      return new Uint8Array(result.data.buffer);
    }
    
    return null;
  }
  
  async disconnect() {
    if (this.device) {
      await this.device.releaseInterface(0);
      await this.device.close();
      this.device = null;
    }
  }
}
```

---

## 25.1.10 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.usb.requestDevice(options)` | User selects device |
| `navigator.usb.getDevices()` | Get authorized devices |
| `device.open()` | Open device |
| `device.close()` | Close device |
| `device.selectConfiguration(n)` | Select config |
| `device.claimInterface(n)` | Claim interface |
| `device.releaseInterface(n)` | Release interface |

### Transfer Methods

| Method | Description |
|--------|-------------|
| `controlTransferIn(setup, length)` | Read control |
| `controlTransferOut(setup, data)` | Write control |
| `transferIn(endpoint, length)` | Read bulk |
| `transferOut(endpoint, data)` | Write bulk |

### Best Practices

1. **Filter by vendor ID** when possible
2. **Select configuration** before claiming interface
3. **Release interface** before closing
4. **Handle disconnect** events
5. **Use appropriate transfer type** for data

---

**End of Chapter 25.1: USB Device Access**

Next: **26.1 Bluetooth Device Access** — Web Bluetooth API.
