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
