# 17.1 Payment Request API

The Payment Request API provides a standardized way to collect payment information, integrating with browsers' stored payment methods and digital wallets.

---

## 17.1.1 Basic Usage

### Create Payment Request

```javascript
// Check support
if (!window.PaymentRequest) {
  console.log('Payment Request API not supported');
  showFallbackCheckout();
}

// Define payment methods
const methods = [{
  supportedMethods: 'basic-card',
  data: {
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    supportedTypes: ['credit', 'debit']
  }
}];

// Define payment details
const details = {
  total: {
    label: 'Total',
    amount: { currency: 'USD', value: '99.99' }
  }
};

// Create request
const request = new PaymentRequest(methods, details);
```

---

## 17.1.2 Show Payment UI

### Display and Process

```javascript
async function processPayment() {
  const methods = [{ supportedMethods: 'basic-card' }];
  
  const details = {
    total: {
      label: 'Total',
      amount: { currency: 'USD', value: '49.99' }
    }
  };
  
  try {
    const request = new PaymentRequest(methods, details);
    const response = await request.show();
    
    // Process payment
    const result = await submitToServer(response);
    
    if (result.success) {
      await response.complete('success');
    } else {
      await response.complete('fail');
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('User cancelled payment');
    } else {
      console.error('Payment error:', error);
    }
  }
}
```

---

## 17.1.3 Payment Details

### Line Items

```javascript
const details = {
  displayItems: [
    {
      label: 'Product',
      amount: { currency: 'USD', value: '89.99' }
    },
    {
      label: 'Shipping',
      amount: { currency: 'USD', value: '10.00' }
    },
    {
      label: 'Discount',
      amount: { currency: 'USD', value: '-10.00' }
    }
  ],
  total: {
    label: 'Total',
    amount: { currency: 'USD', value: '89.99' }
  }
};
```

### Shipping Options

```javascript
const details = {
  total: {
    label: 'Total',
    amount: { currency: 'USD', value: '99.99' }
  },
  shippingOptions: [
    {
      id: 'standard',
      label: 'Standard Shipping (5-7 days)',
      amount: { currency: 'USD', value: '5.00' },
      selected: true
    },
    {
      id: 'express',
      label: 'Express Shipping (2-3 days)',
      amount: { currency: 'USD', value: '15.00' }
    }
  ]
};
```

---

## 17.1.4 Request Options

### Collect Additional Info

```javascript
const options = {
  requestPayerName: true,
  requestPayerEmail: true,
  requestPayerPhone: true,
  requestShipping: true,
  shippingType: 'shipping'  // 'shipping', 'delivery', or 'pickup'
};

const request = new PaymentRequest(methods, details, options);
```

---

## 17.1.5 Handle Events

### Shipping Address Change

```javascript
const request = new PaymentRequest(methods, details, {
  requestShipping: true
});

request.addEventListener('shippingaddresschange', async (event) => {
  const address = request.shippingAddress;
  
  // Calculate shipping based on address
  event.updateWith(
    calculateShipping(address).then(updatedDetails => updatedDetails)
  );
});

async function calculateShipping(address) {
  // API call to calculate shipping
  const shipping = await fetch('/api/shipping', {
    method: 'POST',
    body: JSON.stringify({ country: address.country })
  }).then(r => r.json());
  
  return {
    ...details,
    shippingOptions: shipping.options,
    total: {
      label: 'Total',
      amount: { currency: 'USD', value: shipping.total }
    }
  };
}
```

### Shipping Option Change

```javascript
request.addEventListener('shippingoptionchange', (event) => {
  const selectedId = request.shippingOption;
  
  event.updateWith(
    updateTotal(selectedId).then(updatedDetails => updatedDetails)
  );
});
```

---

## 17.1.6 Payment Response

### Access Response Data

```javascript
const response = await request.show();

// Card details
response.methodName;           // 'basic-card'
response.details.cardNumber;   // '4111111111111111'
response.details.expiryMonth;  // '12'
response.details.expiryYear;   // '2025'
response.details.cardSecurityCode;  // '123'
response.details.billingAddress;

// Payer info
response.payerName;
response.payerEmail;
response.payerPhone;

// Shipping
response.shippingAddress;
response.shippingOption;

// Complete the payment
await response.complete('success');
```

---

## 17.1.7 Can Make Payment

### Check Before Showing

```javascript
async function checkout() {
  const request = new PaymentRequest(methods, details);
  
  // Check if payment can be made
  const canPay = await request.canMakePayment();
  
  if (canPay) {
    const response = await request.show();
    // Process...
  } else {
    // Show fallback checkout
    showManualCheckout();
  }
}
```

---

## 17.1.8 Abort Payment

### Cancel Request

```javascript
const request = new PaymentRequest(methods, details);

// Store request for later cancellation
let paymentPromise;

function startPayment() {
  paymentPromise = request.show();
}

function cancelPayment() {
  request.abort();
}

// Handle abort
try {
  await paymentPromise;
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Payment was aborted');
  }
}
```

---

## 17.1.9 Complete Example

### E-Commerce Checkout

```javascript
class PaymentHandler {
  constructor() {
    this.request = null;
  }
  
  createRequest(cart) {
    const methods = [
      { supportedMethods: 'basic-card' }
    ];
    
    const details = {
      displayItems: cart.items.map(item => ({
        label: item.name,
        amount: { currency: 'USD', value: item.price.toFixed(2) }
      })),
      total: {
        label: 'Total',
        amount: { currency: 'USD', value: cart.total.toFixed(2) }
      }
    };
    
    const options = {
      requestPayerEmail: true,
      requestShipping: true
    };
    
    this.request = new PaymentRequest(methods, details, options);
    
    this.request.addEventListener('shippingaddresschange', 
      this.onAddressChange.bind(this));
    
    return this.request;
  }
  
  async onAddressChange(event) {
    const address = this.request.shippingAddress;
    
    event.updateWith(
      this.calculateUpdatedDetails(address)
    );
  }
  
  async checkout(cart) {
    if (!window.PaymentRequest) {
      return this.fallbackCheckout(cart);
    }
    
    try {
      this.createRequest(cart);
      
      if (!await this.request.canMakePayment()) {
        return this.fallbackCheckout(cart);
      }
      
      const response = await this.request.show();
      const result = await this.processPayment(response);
      
      await response.complete(result.success ? 'success' : 'fail');
      
      return result;
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Payment failed:', error);
      }
      return { success: false, error };
    }
  }
}
```

---

## 17.1.10 Summary

### Constructor

```javascript
new PaymentRequest(methodData, details, options)
```

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `show()` | Promise<PaymentResponse> | Display UI |
| `abort()` | Promise | Cancel request |
| `canMakePayment()` | Promise<boolean> | Check availability |

### Events

| Event | When |
|-------|------|
| `shippingaddresschange` | Address changed |
| `shippingoptionchange` | Shipping option changed |

### Response Properties

| Property | Type | Description |
|----------|------|-------------|
| `methodName` | String | Payment method |
| `details` | Object | Payment details |
| `payerName` | String | Payer name |
| `payerEmail` | String | Payer email |
| `shippingAddress` | Object | Shipping address |

### Best Practices

1. **Check canMakePayment** before showing
2. **Provide fallback** checkout
3. **Handle abort** gracefully
4. **Complete response** with success/fail
5. **Validate on server** — never trust client data
6. **Update details** on shipping changes

---

**End of Chapter 17.1: Payment Request API**

Next chapter: **17.2 Payment Handler API** — implementing payment handlers.
