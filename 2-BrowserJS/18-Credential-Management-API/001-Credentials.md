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
