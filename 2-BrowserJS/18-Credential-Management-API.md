# 18.1 Credentials

The Credential Management API provides a programmatic interface for storing and retrieving user credentials. This chapter covers credential types and the CredentialsContainer interface.

---

## 18.1.1 Overview

### Credential Types

```javascript
// Available credential types:
// - PasswordCredential: username/password pairs
// - FederatedCredential: third-party identity providers
// - PublicKeyCredential: WebAuthn (biometrics, security keys)

// Check support
if ('credentials' in navigator) {
  console.log('Credentials API supported');
}
```

---

## 18.1.2 PasswordCredential

### Create Password Credential

```javascript
const credential = new PasswordCredential({
  id: 'user@example.com',
  password: 'secretPassword123',
  name: 'John Doe',
  iconURL: '/avatars/john.png'
});

console.log(credential.id);    // 'user@example.com'
console.log(credential.name);  // 'John Doe'
console.log(credential.type);  // 'password'
// password property not accessible for security
```

### From Form

```javascript
const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Create from form data
  const credential = new PasswordCredential(form);
  
  // Store for future use
  await navigator.credentials.store(credential);
  
  // Submit login
  await login(credential);
});
```

### Form Requirements

```html
<form id="loginForm">
  <input type="text" name="username" autocomplete="username">
  <input type="password" name="password" autocomplete="current-password">
  <input type="text" name="name" autocomplete="name">
  <button type="submit">Login</button>
</form>
```

---

## 18.1.3 FederatedCredential

### Create Federated Credential

```javascript
const credential = new FederatedCredential({
  id: 'user@example.com',
  provider: 'https://accounts.google.com',
  name: 'John Doe',
  iconURL: '/avatars/john.png'
});

console.log(credential.provider);  // 'https://accounts.google.com'
console.log(credential.type);      // 'federated'
```

### Common Providers

```javascript
// Google
const googleCredential = new FederatedCredential({
  id: 'user@gmail.com',
  provider: 'https://accounts.google.com'
});

// Facebook
const fbCredential = new FederatedCredential({
  id: '123456789',
  provider: 'https://www.facebook.com'
});
```

---

## 18.1.4 PublicKeyCredential (WebAuthn)

### Overview

```javascript
// PublicKeyCredential is used for:
// - Biometric authentication (fingerprint, face)
// - Hardware security keys (YubiKey)
// - Platform authenticators (Windows Hello, Touch ID)

// Check support
if (window.PublicKeyCredential) {
  console.log('WebAuthn supported');
}

// Check platform authenticator
const available = await PublicKeyCredential
  .isUserVerifyingPlatformAuthenticatorAvailable();
```

---

## 18.1.5 Credential Properties

### Common Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | String | User identifier |
| `type` | String | Credential type |
| `name` | String | Display name |
| `iconURL` | String | User avatar |

### PasswordCredential Specific

| Property | Type | Description |
|----------|------|-------------|
| `password` | String | Password (write-only) |

### FederatedCredential Specific

| Property | Type | Description |
|----------|------|-------------|
| `provider` | String | Identity provider URL |
| `protocol` | String | Federation protocol |

---

## 18.1.6 Summary

### Credential Types

| Type | Use Case |
|------|----------|
| `PasswordCredential` | Username/password login |
| `FederatedCredential` | Social login (Google, Facebook) |
| `PublicKeyCredential` | Biometrics, security keys |

### Constructor Signatures

```javascript
// PasswordCredential
new PasswordCredential({
  id: string,
  password: string,
  name?: string,
  iconURL?: string
})

// FederatedCredential
new FederatedCredential({
  id: string,
  provider: string,
  name?: string,
  iconURL?: string,
  protocol?: string
})
```

### Best Practices

1. **Use autocomplete** attributes on forms
2. **Store credentials** after successful login
3. **Support multiple types** for flexibility
4. **Handle missing support** gracefully
5. **Validate server-side** always

---

**End of Chapter 18.1: Credentials**

Next chapter: **18.2 Operations** — storing, retrieving, and managing credentials.
# 18.2 Operations

This chapter covers the credential operations: storing, retrieving, creating, and preventing silent access.

---

## 18.2.1 navigator.credentials.get()

### Retrieve Stored Credentials

```javascript
async function getCredentials() {
  try {
    const credential = await navigator.credentials.get({
      password: true,
      federated: {
        providers: ['https://accounts.google.com']
      },
      mediation: 'optional'
    });
    
    if (credential) {
      console.log('Got credential:', credential.id);
      return credential;
    }
    
    console.log('No credential selected');
    return null;
    
  } catch (error) {
    console.error('Get credential failed:', error);
  }
}
```

### Mediation Options

```javascript
// 'silent' - No UI, only if single saved credential
const silentCred = await navigator.credentials.get({
  password: true,
  mediation: 'silent'
});

// 'optional' - Show UI if needed (default)
const optionalCred = await navigator.credentials.get({
  password: true,
  mediation: 'optional'
});

// 'required' - Always show UI
const requiredCred = await navigator.credentials.get({
  password: true,
  mediation: 'required'
});
```

---

## 18.2.2 navigator.credentials.store()

### Save Credentials

```javascript
async function saveCredentials(username, password) {
  const credential = new PasswordCredential({
    id: username,
    password: password
  });
  
  try {
    await navigator.credentials.store(credential);
    console.log('Credentials saved');
  } catch (error) {
    console.error('Store failed:', error);
  }
}
```

### After Login

```javascript
async function login(form) {
  const formData = new FormData(form);
  
  // Send to server
  const response = await fetch('/api/login', {
    method: 'POST',
    body: formData
  });
  
  if (response.ok) {
    // Store credentials on successful login
    const credential = new PasswordCredential(form);
    await navigator.credentials.store(credential);
  }
  
  return response;
}
```

---

## 18.2.3 navigator.credentials.create()

### Create Credentials

```javascript
// For WebAuthn (PublicKeyCredential)
const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array(32),
    rp: { name: 'Example Site' },
    user: {
      id: new Uint8Array(16),
      name: 'user@example.com',
      displayName: 'User'
    },
    pubKeyCredParams: [
      { type: 'public-key', alg: -7 }  // ES256
    ]
  }
});
```

---

## 18.2.4 navigator.credentials.preventSilentAccess()

### Prevent Auto-Login

```javascript
async function logout() {
  // Clear session
  await fetch('/api/logout', { method: 'POST' });
  
  // Prevent silent credential retrieval
  await navigator.credentials.preventSilentAccess();
  
  // Next get() with 'silent' will return null
  // User must interact to select credentials
}
```

### When to Use

```javascript
// Call after:
// - User logs out
// - User switches accounts
// - Session expires

async function handleLogout() {
  // Server logout
  await fetch('/api/logout');
  
  // Prevent auto-login
  if (navigator.credentials?.preventSilentAccess) {
    await navigator.credentials.preventSilentAccess();
  }
  
  // Redirect
  window.location.href = '/login';
}
```

---

## 18.2.5 Auto Sign-In Flow

### Automatic Login

```javascript
async function autoSignIn() {
  // Try silent sign-in first
  const credential = await navigator.credentials.get({
    password: true,
    federated: {
      providers: ['https://accounts.google.com']
    },
    mediation: 'silent'
  });
  
  if (credential) {
    // Auto sign-in
    return await signInWithCredential(credential);
  }
  
  return null;
}

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  const user = await autoSignIn();
  
  if (user) {
    showWelcomeBack(user);
  } else {
    showLoginForm();
  }
});
```

---

## 18.2.6 Account Chooser

### Show Account Selection

```javascript
async function showAccountChooser() {
  const credential = await navigator.credentials.get({
    password: true,
    federated: {
      providers: [
        'https://accounts.google.com',
        'https://www.facebook.com'
      ]
    },
    mediation: 'required'  // Always show UI
  });
  
  if (credential) {
    if (credential.type === 'password') {
      return signInWithPassword(credential);
    } else if (credential.type === 'federated') {
      return signInWithProvider(credential.provider);
    }
  }
}
```

---

## 18.2.7 Handle Credential Type

### Type-Specific Handling

```javascript
async function handleCredential(credential) {
  switch (credential.type) {
    case 'password':
      return await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: credential.id,
          password: credential.password
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
    case 'federated':
      // Redirect to provider
      return signInWithFederated(credential.provider, credential.id);
      
    case 'public-key':
      // WebAuthn assertion
      return verifyAssertion(credential);
      
    default:
      throw new Error('Unknown credential type');
  }
}
```

---

## 18.2.8 Complete Login Flow

### Full Implementation

```javascript
class CredentialManager {
  constructor(providers = []) {
    this.providers = providers;
    this.supported = 'credentials' in navigator;
  }
  
  async autoSignIn() {
    if (!this.supported) return null;
    
    try {
      const credential = await navigator.credentials.get({
        password: true,
        federated: { providers: this.providers },
        mediation: 'silent'
      });
      
      if (credential) {
        return await this.signIn(credential);
      }
    } catch (error) {
      console.error('Auto sign-in failed:', error);
    }
    
    return null;
  }
  
  async promptSignIn() {
    if (!this.supported) {
      return this.fallbackSignIn();
    }
    
    const credential = await navigator.credentials.get({
      password: true,
      federated: { providers: this.providers },
      mediation: 'optional'
    });
    
    if (credential) {
      return await this.signIn(credential);
    }
    
    return null;
  }
  
  async signIn(credential) {
    // Implement based on credential type
    const response = await this.handleCredential(credential);
    
    if (response.ok) {
      return await response.json();
    }
    
    throw new Error('Sign-in failed');
  }
  
  async saveCredentials(username, password) {
    if (!this.supported) return;
    
    const credential = new PasswordCredential({
      id: username,
      password
    });
    
    await navigator.credentials.store(credential);
  }
  
  async signOut() {
    if (this.supported) {
      await navigator.credentials.preventSilentAccess();
    }
  }
}
```

---

## 18.2.9 Summary

### Methods

| Method | Description |
|--------|-------------|
| `get(options)` | Retrieve credentials |
| `store(credential)` | Save credentials |
| `create(options)` | Create new credential |
| `preventSilentAccess()` | Disable silent retrieval |

### Get Options

| Option | Type | Description |
|--------|------|-------------|
| `password` | Boolean | Allow password credentials |
| `federated` | Object | Federated provider config |
| `publicKey` | Object | WebAuthn options |
| `mediation` | String | UI behavior |

### Mediation Values

| Value | Behavior |
|-------|----------|
| `silent` | No UI, auto-select |
| `optional` | Show UI if needed |
| `required` | Always show UI |

### Best Practices

1. **Try silent first** for seamless UX
2. **Fall back to optional** if silent fails
3. **Call preventSilentAccess** on logout
4. **Store after successful login**
5. **Support multiple providers**
6. **Handle errors gracefully**

---

**End of Chapter 18.2: Operations**

Next chapter: **18.3 Web Authentication** — biometric and hardware key authentication.
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
