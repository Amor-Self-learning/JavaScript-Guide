# 18.3 Web Authentication (WebAuthn)

Web Authentication (WebAuthn) enables passwordless authentication using biometrics, security keys, or platform authenticators. This chapter covers registration, authentication, and best practices.

---

## 18.3.1 Overview

### What is WebAuthn?

```javascript
// WebAuthn provides:
// - Passwordless login
// - Two-factor authentication
// - Phishing resistance
// - Biometric authentication

// Check support
if (window.PublicKeyCredential) {
  console.log('WebAuthn supported');
}

// Check platform authenticator
const hasPlatformAuth = await PublicKeyCredential
  .isUserVerifyingPlatformAuthenticatorAvailable();
console.log('Platform authenticator:', hasPlatformAuth);
```

---

## 18.3.2 Registration (Create Credential)

### Basic Registration

```javascript
async function registerWebAuthn(userId, username) {
  // Get challenge from server
  const options = await fetch('/api/webauthn/register/options', {
    method: 'POST',
    body: JSON.stringify({ userId, username }),
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.json());
  
  // Convert base64 to ArrayBuffer
  options.challenge = base64ToBuffer(options.challenge);
  options.user.id = base64ToBuffer(options.user.id);
  
  // Create credential
  const credential = await navigator.credentials.create({
    publicKey: options
  });
  
  // Send to server for verification
  const response = await fetch('/api/webauthn/register/verify', {
    method: 'POST',
    body: JSON.stringify({
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        attestationObject: bufferToBase64(credential.response.attestationObject)
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json();
}
```

### PublicKeyCredentialCreationOptions

```javascript
const creationOptions = {
  // Random challenge from server (prevent replay attacks)
  challenge: new Uint8Array(32),
  
  // Relying Party (your site)
  rp: {
    name: 'Example Site',
    id: 'example.com'  // Must match domain
  },
  
  // User info
  user: {
    id: new Uint8Array(16),  // Unique user ID
    name: 'user@example.com',
    displayName: 'John Doe'
  },
  
  // Supported algorithms
  pubKeyCredParams: [
    { type: 'public-key', alg: -7 },   // ES256
    { type: 'public-key', alg: -257 }  // RS256
  ],
  
  // Authenticator requirements
  authenticatorSelection: {
    authenticatorAttachment: 'platform',  // or 'cross-platform'
    userVerification: 'required',         // or 'preferred', 'discouraged'
    residentKey: 'required'               // for discoverable credentials
  },
  
  // Timeout
  timeout: 60000,
  
  // Attestation
  attestation: 'none'  // or 'indirect', 'direct'
};
```

---

## 18.3.3 Authentication (Get Credential)

### Basic Authentication

```javascript
async function authenticateWebAuthn() {
  // Get challenge from server
  const options = await fetch('/api/webauthn/login/options')
    .then(r => r.json());
  
  // Convert challenge
  options.challenge = base64ToBuffer(options.challenge);
  
  // Convert allowed credentials
  if (options.allowCredentials) {
    options.allowCredentials = options.allowCredentials.map(cred => ({
      ...cred,
      id: base64ToBuffer(cred.id)
    }));
  }
  
  // Get credential
  const credential = await navigator.credentials.get({
    publicKey: options
  });
  
  // Send to server for verification
  const response = await fetch('/api/webauthn/login/verify', {
    method: 'POST',
    body: JSON.stringify({
      id: credential.id,
      rawId: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64(credential.response.clientDataJSON),
        authenticatorData: bufferToBase64(credential.response.authenticatorData),
        signature: bufferToBase64(credential.response.signature),
        userHandle: credential.response.userHandle 
          ? bufferToBase64(credential.response.userHandle) 
          : null
      }
    }),
    headers: { 'Content-Type': 'application/json' }
  });
  
  return response.json();
}
```

### PublicKeyCredentialRequestOptions

```javascript
const requestOptions = {
  // Challenge from server
  challenge: new Uint8Array(32),
  
  // Timeout
  timeout: 60000,
  
  // RP ID (domain)
  rpId: 'example.com',
  
  // Allowed credentials (optional for discoverable)
  allowCredentials: [
    {
      type: 'public-key',
      id: credentialId,  // ArrayBuffer
      transports: ['internal', 'usb', 'ble', 'nfc']
    }
  ],
  
  // User verification
  userVerification: 'required'
};
```

---

## 18.3.4 Authenticator Types

### Platform vs Cross-Platform

```javascript
// Platform authenticator (built-in)
// - Touch ID, Face ID
// - Windows Hello
// - Android fingerprint

const platformOptions = {
  authenticatorSelection: {
    authenticatorAttachment: 'platform',
    userVerification: 'required'
  }
};

// Cross-platform (external)
// - Security keys (YubiKey)
// - USB, NFC, Bluetooth

const crossPlatformOptions = {
  authenticatorSelection: {
    authenticatorAttachment: 'cross-platform'
  }
};

// Any authenticator
const anyOptions = {
  // Don't specify authenticatorAttachment
};
```

---

## 18.3.5 Discoverable Credentials (Passkeys)

### Passwordless Flow

```javascript
// Registration with discoverable credential
const options = {
  // ... other options
  authenticatorSelection: {
    residentKey: 'required',
    userVerification: 'required'
  }
};

const credential = await navigator.credentials.create({
  publicKey: options
});

// Authentication without specifying credentials
const authOptions = {
  challenge: challenge,
  rpId: 'example.com',
  userVerification: 'required'
  // No allowCredentials - user selects from stored passkeys
};

const assertion = await navigator.credentials.get({
  publicKey: authOptions
});
```

### Conditional UI (Autofill)

```javascript
// Check support
const conditionalSupported = await PublicKeyCredential
  .isConditionalMediationAvailable();

if (conditionalSupported) {
  // Trigger passkey autofill
  const credential = await navigator.credentials.get({
    publicKey: {
      challenge: challenge,
      rpId: 'example.com',
      userVerification: 'preferred'
    },
    mediation: 'conditional'
  });
}
```

```html
<!-- Enable passkey autofill -->
<input type="text" 
       autocomplete="username webauthn"
       placeholder="Username or use passkey">
```

---

## 18.3.6 Helper Functions

### Buffer Conversions

```javascript
function base64ToBuffer(base64) {
  const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}
```

---

## 18.3.7 Error Handling

### Common Errors

```javascript
async function handleWebAuthn() {
  try {
    const credential = await navigator.credentials.create({
      publicKey: options
    });
    return credential;
    
  } catch (error) {
    switch (error.name) {
      case 'NotAllowedError':
        console.log('User cancelled or timeout');
        break;
        
      case 'InvalidStateError':
        console.log('Credential already registered');
        break;
        
      case 'NotSupportedError':
        console.log('Authenticator not supported');
        break;
        
      case 'SecurityError':
        console.log('Domain mismatch or insecure context');
        break;
        
      case 'AbortError':
        console.log('Operation aborted');
        break;
        
      default:
        console.error('WebAuthn error:', error);
    }
    
    throw error;
  }
}
```

---

## 18.3.8 Complete Implementation

### WebAuthn Manager

```javascript
class WebAuthnManager {
  constructor(rpId) {
    this.rpId = rpId;
    this.supported = !!window.PublicKeyCredential;
  }
  
  async isAvailable() {
    if (!this.supported) return false;
    return await PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable();
  }
  
  async register(user) {
    const options = await this.fetchOptions('/api/webauthn/register', user);
    
    const credential = await navigator.credentials.create({
      publicKey: this.prepareCreationOptions(options)
    });
    
    return await this.verifyRegistration(credential);
  }
  
  async authenticate(username = null) {
    const options = await this.fetchOptions('/api/webauthn/login', { username });
    
    const credential = await navigator.credentials.get({
      publicKey: this.prepareRequestOptions(options)
    });
    
    return await this.verifyAuthentication(credential);
  }
  
  prepareCreationOptions(options) {
    return {
      ...options,
      challenge: base64ToBuffer(options.challenge),
      user: {
        ...options.user,
        id: base64ToBuffer(options.user.id)
      }
    };
  }
  
  prepareRequestOptions(options) {
    return {
      ...options,
      challenge: base64ToBuffer(options.challenge),
      allowCredentials: options.allowCredentials?.map(cred => ({
        ...cred,
        id: base64ToBuffer(cred.id)
      }))
    };
  }
  
  // ... fetch and verify methods
}
```

---

## 18.3.9 Summary

### Key Concepts

| Term | Description |
|------|-------------|
| Relying Party (RP) | Your website |
| Authenticator | Device that creates/verifies credentials |
| Discoverable | Credential stored on authenticator |
| User Verification | Biometric/PIN check |
| Attestation | Proof of authenticator type |

### Methods

| Method | Purpose |
|--------|---------|
| `credentials.create()` | Register new credential |
| `credentials.get()` | Authenticate with credential |

### Authenticator Attachment

| Value | Meaning |
|-------|---------|
| `platform` | Built-in (Touch ID, Windows Hello) |
| `cross-platform` | External (USB key, NFC) |

### Best Practices

1. **Always use HTTPS** — required for WebAuthn
2. **Generate challenges server-side** — prevent replay attacks
3. **Verify responses server-side** — never trust client
4. **Support multiple authenticators** per user
5. **Provide fallback** authentication methods
6. **Handle errors** with user-friendly messages

---

**End of Chapter 18.3: Web Authentication**

This completes Group 18 — Credential Management API. Next section: **Group 19 — Permissions API**.
