# 17.2 Payment Handler API

The Payment Handler API allows web applications to handle payment requests, enabling PWAs to act as payment apps for Payment Request API.

---

## 17.2.1 Overview

### What is Payment Handler?

```javascript
// Payment Handler API enables:
// - PWAs to handle payments
// - Custom payment methods
// - Service Worker integration
// - Native app-like payment experiences

// Use cases:
// - Digital wallets
// - Cryptocurrency payments
// - Bank-specific payment apps
// - Store credit systems
```

---

## 17.2.2 Register Payment Handler

### Service Worker Registration

```javascript
// In main script
async function registerPaymentApp() {
  const registration = await navigator.serviceWorker.register('/sw.js');
  
  // Check for payment support
  if (!registration.paymentManager) {
    console.log('Payment Handler not supported');
    return;
  }
  
  // Set user hint
  registration.paymentManager.userHint = 'My Wallet App';
  
  // Register instruments
  await registration.paymentManager.instruments.set(
    'my-wallet-id',
    {
      name: 'My Digital Wallet',
      icons: [
        { src: '/icons/wallet-96.png', sizes: '96x96', type: 'image/png' }
      ],
      method: 'https://example.com/pay'
    }
  );
}
```

---

## 17.2.3 Web App Manifest

### Payment Handler Manifest

```json
{
  "name": "My Payment App",
  "short_name": "PayApp",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ],
  "serviceworker": {
    "src": "/sw.js",
    "scope": "/",
    "use_cache": false
  },
  "payment": {
    "supported_origins": ["https://merchant.example"]
  }
}
```

---

## 17.2.4 Service Worker Events

### Handle Payment Request

```javascript
// In service worker (sw.js)
self.addEventListener('paymentrequest', (event) => {
  event.respondWith(handlePayment(event));
});

async function handlePayment(event) {
  // Open payment window
  const client = await event.openWindow('/pay');
  
  // Wait for payment completion
  return new Promise((resolve) => {
    self.addEventListener('message', (messageEvent) => {
      if (messageEvent.data.type === 'payment-complete') {
        resolve({
          methodName: 'https://example.com/pay',
          details: messageEvent.data.paymentDetails
        });
      }
    });
  });
}
```

### Payment Event Properties

```javascript
self.addEventListener('paymentrequest', (event) => {
  const { 
    topOrigin,           // Merchant origin
    paymentRequestOrigin, // Payment request origin
    paymentRequestId,     // Unique request ID
    methodData,           // Payment method data
    total,               // Total amount
    modifiers,           // Price modifiers
    instrumentKey        // Selected instrument
  } = event;
  
  console.log('Payment requested from:', topOrigin);
  console.log('Amount:', total.value, total.currency);
});
```

---

## 17.2.5 Payment Window

### Payment UI Page

```html
<!-- /pay.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Complete Payment</title>
</head>
<body>
  <div id="payment-form">
    <h1>Complete Your Payment</h1>
    <p id="amount"></p>
    <button id="confirm">Confirm Payment</button>
    <button id="cancel">Cancel</button>
  </div>
  
  <script>
    // Get payment details from Service Worker
    navigator.serviceWorker.controller.postMessage({
      type: 'get-payment-details'
    });
    
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'payment-details') {
        document.getElementById('amount').textContent = 
          `Amount: ${event.data.total.currency} ${event.data.total.value}`;
      }
    });
    
    document.getElementById('confirm').addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({
        type: 'payment-complete',
        paymentDetails: {
          transactionId: generateTransactionId(),
          status: 'success'
        }
      });
      window.close();
    });
    
    document.getElementById('cancel').addEventListener('click', () => {
      navigator.serviceWorker.controller.postMessage({
        type: 'payment-cancelled'
      });
      window.close();
    });
  </script>
</body>
</html>
```

---

## 17.2.6 Instrument Management

### Add/Update Instruments

```javascript
const registration = await navigator.serviceWorker.ready;
const instruments = registration.paymentManager.instruments;

// Add instrument
await instruments.set('card-1234', {
  name: 'Visa ending in 1234',
  icons: [{ src: '/icons/visa.png', sizes: '32x32' }],
  method: 'basic-card'
});

// Get instrument
const instrument = await instruments.get('card-1234');

// List all instruments
const keys = await instruments.keys();
for (const key of keys) {
  console.log(await instruments.get(key));
}

// Delete instrument
await instruments.delete('card-1234');

// Clear all
await instruments.clear();
```

---

## 17.2.7 Just-in-Time Registration

### Register on First Use

```javascript
// Called when user selects your payment method
self.addEventListener('paymentrequest', async (event) => {
  // Check if instruments exist
  const instruments = await self.registration.paymentManager.instruments.keys();
  
  if (instruments.length === 0) {
    // Show enrollment flow
    event.respondWith(enrollUser(event));
  } else {
    event.respondWith(handlePayment(event));
  }
});

async function enrollUser(event) {
  const client = await event.openWindow('/enroll');
  
  return new Promise((resolve, reject) => {
    // Wait for enrollment completion
    self.addEventListener('message', async (e) => {
      if (e.data.type === 'enrollment-complete') {
        // Now handle the payment
        resolve(await handlePayment(event));
      }
    });
  });
}
```

---

## 17.2.8 Browser Support

### Feature Detection

```javascript
async function isPaymentHandlerSupported() {
  if (!('serviceWorker' in navigator)) return false;
  
  const registration = await navigator.serviceWorker.ready;
  return 'paymentManager' in registration;
}
```

---

## 17.2.9 Summary

### Service Worker Events

| Event | When |
|-------|------|
| `paymentrequest` | Payment requested |

### PaymentManager Methods

| Method | Description |
|--------|-------------|
| `instruments.set(key, details)` | Add/update instrument |
| `instruments.get(key)` | Get instrument |
| `instruments.delete(key)` | Remove instrument |
| `instruments.keys()` | List all keys |
| `instruments.clear()` | Remove all |

### Best Practices

1. **Register instruments** on app install
2. **Handle errors** gracefully
3. **Provide clear UI** in payment window
4. **Validate transactions** server-side
5. **Support JIT registration**
6. **Test thoroughly** with different merchants

---

**End of Chapter 17.2: Payment Handler API**

This completes Group 17 — Payment APIs. Next section: **Group 18 — Credential Management API**.
