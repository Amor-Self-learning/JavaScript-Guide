# 26.1 Bluetooth Device Access

The Web Bluetooth API enables communication with Bluetooth Low Energy (BLE) devices. This chapter covers device discovery, GATT services, and data exchange.

---

## 26.1.1 Basic Usage

### Request Device

```javascript
async function connectBluetooth() {
  if (!('bluetooth' in navigator)) {
    console.log('Web Bluetooth not supported');
    return null;
  }
  
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
    });
    
    console.log('Selected:', device.name);
    
    const server = await device.gatt.connect();
    console.log('Connected');
    
    return { device, server };
    
  } catch (error) {
    console.error('Connection failed:', error);
    return null;
  }
}
```

---

## 26.1.2 Device Filters

### Filter by Service

```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [
    { services: ['heart_rate'] },
    { services: ['battery_service'] }
  ]
});
```

### Filter by Name

```javascript
const device = await navigator.bluetooth.requestDevice({
  filters: [
    { name: 'MyDevice' },
    { namePrefix: 'My' }
  ],
  optionalServices: ['battery_service']
});
```

### Accept All Devices

```javascript
// ⚠️ Shows all Bluetooth devices
const device = await navigator.bluetooth.requestDevice({
  acceptAllDevices: true,
  optionalServices: ['battery_service']
});
```

---

## 26.1.3 GATT Server

### Connect to GATT

```javascript
const server = await device.gatt.connect();

// Check connection
console.log('Connected:', server.connected);

// Disconnect
device.gatt.disconnect();
```

### Handle Disconnection

```javascript
device.addEventListener('gattserverdisconnected', () => {
  console.log('Device disconnected');
  
  // Attempt reconnect
  setTimeout(() => reconnect(device), 1000);
});

async function reconnect(device) {
  try {
    await device.gatt.connect();
    console.log('Reconnected');
  } catch (error) {
    console.log('Reconnect failed');
  }
}
```

---

## 26.1.4 Services and Characteristics

### Get Service

```javascript
const service = await server.getPrimaryService('heart_rate');

// Or by UUID
const service = await server.getPrimaryService(
  '0000180d-0000-1000-8000-00805f9b34fb'
);
```

### Get Characteristic

```javascript
const characteristic = await service.getCharacteristic('heart_rate_measurement');

// Or by UUID
const characteristic = await service.getCharacteristic(
  '00002a37-0000-1000-8000-00805f9b34fb'
);
```

---

## 26.1.5 Reading Values

### Read Characteristic

```javascript
const value = await characteristic.readValue();

// value is DataView
const heartRate = value.getUint8(1);
console.log('Heart Rate:', heartRate);
```

### Read Battery Level

```javascript
async function getBatteryLevel(server) {
  const service = await server.getPrimaryService('battery_service');
  const char = await service.getCharacteristic('battery_level');
  const value = await char.readValue();
  
  return value.getUint8(0);
}
```

---

## 26.1.6 Writing Values

### Write Characteristic

```javascript
// Write with response
await characteristic.writeValueWithResponse(
  new Uint8Array([0x01, 0x02])
);

// Write without response (faster)
await characteristic.writeValueWithoutResponse(
  new Uint8Array([0x01, 0x02])
);
```

---

## 26.1.7 Notifications

### Subscribe to Changes

```javascript
async function subscribeToHeartRate(characteristic) {
  // Start notifications
  await characteristic.startNotifications();
  
  characteristic.addEventListener('characteristicvaluechanged', (event) => {
    const value = event.target.value;
    const heartRate = value.getUint8(1);
    console.log('Heart Rate:', heartRate);
  });
}

// Stop notifications
await characteristic.stopNotifications();
```

---

## 26.1.8 Complete Example

### Heart Rate Monitor

```javascript
class HeartRateMonitor {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
  }
  
  async connect() {
    this.device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
    });
    
    this.device.addEventListener('gattserverdisconnected', 
      () => this.onDisconnect());
    
    this.server = await this.device.gatt.connect();
    
    const service = await this.server.getPrimaryService('heart_rate');
    this.characteristic = await service.getCharacteristic('heart_rate_measurement');
    
    await this.characteristic.startNotifications();
    this.characteristic.addEventListener('characteristicvaluechanged', 
      (e) => this.handleHeartRate(e));
    
    return true;
  }
  
  handleHeartRate(event) {
    const value = event.target.value;
    const flags = value.getUint8(0);
    let heartRate;
    
    if (flags & 0x01) {
      heartRate = value.getUint16(1, true);
    } else {
      heartRate = value.getUint8(1);
    }
    
    this.onHeartRate?.(heartRate);
  }
  
  onDisconnect() {
    console.log('Disconnected');
    this.onDisconnected?.();
  }
  
  disconnect() {
    if (this.characteristic) {
      this.characteristic.stopNotifications();
    }
    if (this.device?.gatt.connected) {
      this.device.gatt.disconnect();
    }
  }
}

// Usage
const monitor = new HeartRateMonitor();
monitor.onHeartRate = (bpm) => console.log('BPM:', bpm);
await monitor.connect();
```

---

## 26.1.9 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.bluetooth.requestDevice(options)` | Select device |
| `device.gatt.connect()` | Connect to GATT |
| `device.gatt.disconnect()` | Disconnect |
| `server.getPrimaryService(name)` | Get service |
| `service.getCharacteristic(name)` | Get characteristic |

### Characteristic Methods

| Method | Description |
|--------|-------------|
| `readValue()` | Read value |
| `writeValueWithResponse(data)` | Write with confirmation |
| `writeValueWithoutResponse(data)` | Write without confirmation |
| `startNotifications()` | Subscribe to changes |
| `stopNotifications()` | Unsubscribe |

### Common Service UUIDs

| Service | UUID/Name |
|---------|-----------|
| Heart Rate | `heart_rate` |
| Battery | `battery_service` |
| Device Info | `device_information` |

### Best Practices

1. **Use filters** to find relevant devices
2. **Handle disconnection** with reconnect logic
3. **Stop notifications** when done
4. **Check characteristic properties** before operations
5. **Parse DataView** correctly based on protocol

---

**End of Chapter 26.1: Bluetooth Device Access**

Next: **27.1 NFC Operations** — Web NFC API.
