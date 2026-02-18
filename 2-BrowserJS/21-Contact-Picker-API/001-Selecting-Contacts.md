# 21.1 Selecting Contacts

The Contact Picker API allows web applications to access user contacts with explicit permission. This chapter covers contact selection and property retrieval.

---

## 21.1.1 Basic Usage

### Select Contacts

```javascript
async function selectContacts() {
  if (!('contacts' in navigator)) {
    console.log('Contact Picker not supported');
    return null;
  }
  
  try {
    const contacts = await navigator.contacts.select(
      ['name', 'email', 'tel'],
      { multiple: true }
    );
    
    return contacts;
  } catch (error) {
    if (error.name === 'InvalidStateError') {
      console.log('Another picker is open');
    }
    console.error('Contact selection failed:', error);
    return null;
  }
}
```

---

## 21.1.2 Available Properties

### Property Types

```javascript
// Check supported properties
const supportedProps = await navigator.contacts.getProperties();
console.log('Supported:', supportedProps);

// Common properties:
// - 'name'     - Array of names
// - 'email'    - Array of emails
// - 'tel'      - Array of phone numbers
// - 'address'  - Array of addresses
// - 'icon'     - Array of Blob (contact photos)
```

### Request Specific Properties

```javascript
// Select with specific properties
const contacts = await navigator.contacts.select(
  ['name', 'email'],  // Only name and email
  { multiple: false }  // Single contact
);

const contact = contacts[0];
console.log('Name:', contact.name);    // ['John Doe']
console.log('Email:', contact.email);  // ['john@example.com']
```

---

## 21.1.3 Contact Structure

### Contact Object

```javascript
const contacts = await navigator.contacts.select(
  ['name', 'email', 'tel', 'address'],
  { multiple: true }
);

for (const contact of contacts) {
  // All properties are arrays
  console.log('Names:', contact.name);     // ['John Doe']
  console.log('Emails:', contact.email);   // ['john@example.com', 'john2@work.com']
  console.log('Phones:', contact.tel);     // ['+1234567890']
  console.log('Addresses:', contact.address);
}
```

### Address Format

```javascript
// Address is ContactAddress object
const addresses = contact.address;

for (const addr of addresses) {
  console.log(addr.streetAddress);
  console.log(addr.city);
  console.log(addr.region);  // State/Province
  console.log(addr.postalCode);
  console.log(addr.country);
}
```

### Contact Icons

```javascript
const contacts = await navigator.contacts.select(
  ['name', 'icon'],
  { multiple: false }
);

const contact = contacts[0];
if (contact.icon?.length > 0) {
  const iconBlob = contact.icon[0];
  const url = URL.createObjectURL(iconBlob);
  
  const img = document.createElement('img');
  img.src = url;
  img.onload = () => URL.revokeObjectURL(url);
}
```

---

## 21.1.4 Selection Options

### Multiple Selection

```javascript
// Single contact
const [contact] = await navigator.contacts.select(
  ['name', 'email'],
  { multiple: false }
);

// Multiple contacts
const contacts = await navigator.contacts.select(
  ['name', 'email'],
  { multiple: true }
);
```

---

## 21.1.5 Common Use Cases

### Share via Contact

```javascript
async function shareViaContact() {
  const contacts = await navigator.contacts.select(
    ['name', 'email', 'tel'],
    { multiple: true }
  );
  
  for (const contact of contacts) {
    if (contact.email?.length > 0) {
      // Email share
      await sendEmail(contact.email[0], shareContent);
    } else if (contact.tel?.length > 0) {
      // SMS share
      await sendSMS(contact.tel[0], shareContent);
    }
  }
}
```

### Import Contacts

```javascript
async function importContacts() {
  const props = await navigator.contacts.getProperties();
  
  const contacts = await navigator.contacts.select(
    props,  // All available properties
    { multiple: true }
  );
  
  // Save to app database
  for (const contact of contacts) {
    await saveContact({
      name: contact.name?.[0],
      email: contact.email?.[0],
      phone: contact.tel?.[0]
    });
  }
  
  return contacts.length;
}
```

### Contact Autocomplete

```javascript
class ContactAutocomplete {
  constructor(input) {
    this.input = input;
    this.supported = 'contacts' in navigator;
    
    if (this.supported) {
      this.addPickerButton();
    }
  }
  
  addPickerButton() {
    const button = document.createElement('button');
    button.textContent = '📇';
    button.title = 'Select from contacts';
    button.addEventListener('click', () => this.pick());
    
    this.input.parentNode.insertBefore(button, this.input.nextSibling);
  }
  
  async pick() {
    try {
      const [contact] = await navigator.contacts.select(
        ['name', 'email'],
        { multiple: false }
      );
      
      if (contact) {
        this.input.value = contact.email?.[0] || contact.name?.[0] || '';
        this.input.dispatchEvent(new Event('input'));
      }
    } catch (error) {
      console.error('Contact picker error:', error);
    }
  }
}
```

---

## 21.1.6 Privacy Considerations

### User Gesture Required

```javascript
// ❌ This won't work - no user gesture
window.addEventListener('load', async () => {
  await navigator.contacts.select(['name']);  // Fails
});

// ✅ This works - user clicked button
button.addEventListener('click', async () => {
  await navigator.contacts.select(['name']);  // Works
});
```

### Request Minimal Properties

```javascript
// ✅ Good - request only what's needed
const contacts = await navigator.contacts.select(
  ['email'],  // Only email for sharing
  { multiple: true }
);

// ❌ Avoid - requesting unnecessary data
const contacts = await navigator.contacts.select(
  ['name', 'email', 'tel', 'address', 'icon'],
  { multiple: true }
);
```

---

## 21.1.7 Browser Support

### Feature Detection

```javascript
function isContactPickerSupported() {
  return 'contacts' in navigator && 'ContactsManager' in window;
}

async function getSupportedProperties() {
  if (!isContactPickerSupported()) return [];
  return await navigator.contacts.getProperties();
}
```

### Fallback

```javascript
async function getContactInfo() {
  if (isContactPickerSupported()) {
    const [contact] = await navigator.contacts.select(['name', 'email']);
    return {
      name: contact?.name?.[0],
      email: contact?.email?.[0]
    };
  }
  
  // Fallback: manual input
  return {
    name: prompt('Enter name:'),
    email: prompt('Enter email:')
  };
}
```

---

## 21.1.8 Summary

### Methods

| Method | Description |
|--------|-------------|
| `navigator.contacts.select(props, options)` | Open contact picker |
| `navigator.contacts.getProperties()` | Get supported properties |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | String[] | Contact names |
| `email` | String[] | Email addresses |
| `tel` | String[] | Phone numbers |
| `address` | ContactAddress[] | Addresses |
| `icon` | Blob[] | Contact photos |

### Options

| Option | Type | Default |
|--------|------|---------|
| `multiple` | Boolean | false |

### Best Practices

1. **Check support** before showing picker button
2. **Request user gesture** — required by spec
3. **Request minimal properties** for privacy
4. **Handle cancellation** gracefully
5. **Handle empty arrays** — properties can be missing
6. **Clean up blob URLs** from icons

---

**End of Chapter 21.1: Selecting Contacts**

This completes Group 21 — Contact Picker API. Next section: **Group 22 — Screen Wake Lock API**.
