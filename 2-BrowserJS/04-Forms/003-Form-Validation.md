# 4.3 Form Validation

Form validation ensures user input meets requirements before submission. This chapter covers HTML5 built-in validation, the Constraint Validation API, custom validation logic, and validation UX patterns.

---

## 4.3.1 HTML5 Validation Attributes

### Required

```html
<input type="text" name="username" required>
<select name="country" required>
  <option value="">Select country</option>
  <option value="us">United States</option>
</select>
<textarea name="message" required></textarea>
```

```javascript
const input = document.querySelector('input');

// Check/set required programmatically
console.log(input.required);  // true
input.required = false;

// Validation state
console.log(input.validity.valueMissing);  // true if empty and required
```

### Pattern

```html
<!-- Regular expression validation -->
<input type="text" name="username" pattern="[A-Za-z0-9]{3,16}"
       title="3-16 alphanumeric characters">

<input type="text" name="phone" pattern="\d{3}-\d{3}-\d{4}"
       title="Format: 123-456-7890">
```

```javascript
const input = document.querySelector('input');

// Set pattern programmatically
input.pattern = '^[A-Z]{2}\\d{6}$';  // Note escaped backslash

// Check validation state
console.log(input.validity.patternMismatch);  // true if doesn't match
```

### Length Constraints

```html
<input type="text" name="bio" minlength="10" maxlength="100">
<textarea minlength="50" maxlength="500"></textarea>
```

```javascript
const input = document.querySelector('input');

input.minLength = 5;
input.maxLength = 20;

// Validation states
console.log(input.validity.tooShort);  // true if < minlength
console.log(input.validity.tooLong);   // true if > maxlength (rare, usually prevented)
```

### Number Constraints

```html
<input type="number" min="0" max="100" step="5">
<input type="date" min="2024-01-01" max="2024-12-31">
<input type="time" min="09:00" max="17:00">
```

```javascript
const numberInput = document.querySelector('input[type="number"]');

numberInput.min = '0';
numberInput.max = '100';
numberInput.step = '5';

// Validation states
console.log(numberInput.validity.rangeUnderflow);  // true if < min
console.log(numberInput.validity.rangeOverflow);   // true if > max
console.log(numberInput.validity.stepMismatch);    // true if not multiple of step

// Step up/down methods
numberInput.stepUp();    // Increase by step
numberInput.stepUp(2);   // Increase by step * 2
numberInput.stepDown();
```

### Type Validation

```html
<!-- Built-in type validation -->
<input type="email" name="email">
<input type="url" name="website">
<input type="tel" name="phone">  <!-- Note: tel has no built-in validation -->
```

```javascript
const emailInput = document.querySelector('input[type="email"]');

// Check validation
console.log(emailInput.validity.typeMismatch);  // true if invalid email format

// Type validation is automatic for:
// - email: checks for @ and domain
// - url: checks for protocol and valid format
// - number: checks for numeric value
```

---

## 4.3.2 Constraint Validation API

### ValidityState Object

```javascript
const input = document.querySelector('input');

// Access validity state
const validity = input.validity;

console.log({
  // Overall validity
  valid: validity.valid,
  
  // Specific validity flags
  valueMissing: validity.valueMissing,       // required but empty
  typeMismatch: validity.typeMismatch,       // wrong type (email, url)
  patternMismatch: validity.patternMismatch, // doesn't match pattern
  tooShort: validity.tooShort,               // shorter than minlength
  tooLong: validity.tooLong,                 // longer than maxlength
  rangeUnderflow: validity.rangeUnderflow,   // less than min
  rangeOverflow: validity.rangeOverflow,     // greater than max
  stepMismatch: validity.stepMismatch,       // not multiple of step
  badInput: validity.badInput,               // unparseable (e.g., letters in number)
  customError: validity.customError          // setCustomValidity was called
});
```

### checkValidity() and reportValidity()

```javascript
const form = document.querySelector('form');
const input = document.querySelector('input');

// Check validity silently
const inputValid = input.checkValidity();   // Returns boolean
const formValid = form.checkValidity();     // Checks all fields

// Check validity and show browser UI
const inputShown = input.reportValidity();  // Shows error if invalid
const formShown = form.reportValidity();    // Shows first error

// Difference:
// checkValidity() - just returns true/false
// reportValidity() - returns true/false AND shows browser validation message
```

### validationMessage

```javascript
const input = document.querySelector('input');

// Get browser's validation message
console.log(input.validationMessage);
// e.g., "Please fill out this field."
// e.g., "Please enter an email address."

// Message is empty string if valid
if (input.validationMessage) {
  console.log('Invalid:', input.validationMessage);
}
```

### setCustomValidity()

```javascript
const input = document.querySelector('input');

// Set custom error message
input.setCustomValidity('Username is already taken');
console.log(input.validity.customError);  // true
console.log(input.validationMessage);     // 'Username is already taken'

// Clear custom error (IMPORTANT!)
input.setCustomValidity('');
console.log(input.validity.valid);  // Now checks other constraints

// Pattern: validate on input
input.addEventListener('input', async (e) => {
  const value = e.target.value;
  
  // Clear any previous custom error
  e.target.setCustomValidity('');
  
  // Check custom validation
  if (value && !isValidUsername(value)) {
    e.target.setCustomValidity('Username must start with a letter');
  } else if (value && await isUsernameTaken(value)) {
    e.target.setCustomValidity('This username is already taken');
  }
});
```

---

## 4.3.3 Handling Validation Events

### invalid Event

```javascript
const input = document.querySelector('input');

// Fires when validation fails
input.addEventListener('invalid', (e) => {
  console.log('Input is invalid:', e.target.validationMessage);
  
  // Prevent browser's default error UI
  e.preventDefault();
  
  // Show custom error UI
  showCustomError(e.target);
});

// invalid fires when:
// - form.submit() or form.requestSubmit() is called
// - form.checkValidity() or form.reportValidity() is called
// - input.checkValidity() or input.reportValidity() is called
```

### Form-Level Validation

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
  // Prevent if invalid
  if (!form.checkValidity()) {
    e.preventDefault();
    
    // Handle invalid fields
    const firstInvalid = form.querySelector(':invalid');
    firstInvalid.focus();
    
    return;
  }
  
  // Form is valid, proceed
  handleSubmit();
});

// Custom validation before submit
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Run async validations
  const errors = await validateAsync(form);
  
  if (errors.length > 0) {
    displayErrors(errors);
    return;
  }
  
  // Submit
  form.submit();
});
```

### Disabling Browser Validation

```html
<!-- Disable validation on form -->
<form novalidate>
  <input type="email" name="email">
  <button type="submit">Submit</button>
</form>
```

```javascript
const form = document.querySelector('form');

// Disable validation programmatically
form.noValidate = true;

// Re-enable
form.noValidate = false;

// With novalidate, browser won't:
// - Show validation messages
// - Prevent invalid submission
// You handle everything manually
```

---

## 4.3.4 Custom Validation

### Synchronous Validation

```javascript
function validatePassword(input) {
  const value = input.value;
  
  if (value.length < 8) {
    input.setCustomValidity('Password must be at least 8 characters');
    return false;
  }
  
  if (!/[A-Z]/.test(value)) {
    input.setCustomValidity('Password must contain uppercase letter');
    return false;
  }
  
  if (!/[a-z]/.test(value)) {
    input.setCustomValidity('Password must contain lowercase letter');
    return false;
  }
  
  if (!/[0-9]/.test(value)) {
    input.setCustomValidity('Password must contain number');
    return false;
  }
  
  // Clear error
  input.setCustomValidity('');
  return true;
}

password.addEventListener('input', (e) => {
  validatePassword(e.target);
});
```

### Asynchronous Validation

```javascript
const usernameInput = document.querySelector('#username');
let validationTimeout;

usernameInput.addEventListener('input', (e) => {
  const input = e.target;
  const value = input.value;
  
  // Clear previous timeout
  clearTimeout(validationTimeout);
  
  // Clear previous error
  input.setCustomValidity('');
  
  // Basic validation first
  if (value.length < 3) {
    input.setCustomValidity('Username must be at least 3 characters');
    return;
  }
  
  // Debounce async check
  validationTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/check-username?username=${value}`);
      const { available } = await response.json();
      
      if (!available) {
        input.setCustomValidity('This username is already taken');
      }
      
      // Optionally update UI
      updateValidationUI(input);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  }, 300);
});
```

### Cross-Field Validation

```javascript
const form = document.querySelector('form');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirmPassword');

// Validate confirm matches password
function validatePasswordMatch() {
  if (confirmPassword.value !== password.value) {
    confirmPassword.setCustomValidity('Passwords do not match');
  } else {
    confirmPassword.setCustomValidity('');
  }
}

password.addEventListener('input', validatePasswordMatch);
confirmPassword.addEventListener('input', validatePasswordMatch);

// Start/end date validation
const startDate = document.querySelector('#startDate');
const endDate = document.querySelector('#endDate');

function validateDates() {
  if (startDate.value && endDate.value) {
    if (new Date(endDate.value) <= new Date(startDate.value)) {
      endDate.setCustomValidity('End date must be after start date');
    } else {
      endDate.setCustomValidity('');
    }
  }
}

startDate.addEventListener('change', validateDates);
endDate.addEventListener('change', validateDates);
```

---

## 4.3.5 Custom Validation UI

### Replacing Browser UI

```javascript
const form = document.querySelector('form');

// Disable browser validation UI
form.noValidate = true;

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Clear previous errors
  clearErrors();
  
  let isValid = true;
  
  for (const element of form.elements) {
    if (!element.name) continue;
    
    if (!element.checkValidity()) {
      isValid = false;
      showError(element, element.validationMessage);
    }
  }
  
  if (isValid) {
    submitForm(form);
  } else {
    // Focus first invalid
    form.querySelector('.error')?.focus();
  }
});

function showError(element, message) {
  element.classList.add('error');
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  errorDiv.id = `${element.name}-error`;
  
  element.setAttribute('aria-describedby', errorDiv.id);
  element.after(errorDiv);
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
    el.removeAttribute('aria-describedby');
  });
  
  document.querySelectorAll('.error-message').forEach(el => {
    el.remove();
  });
}
```

### Real-Time Validation UI

```javascript
class FormValidator {
  constructor(form) {
    this.form = form;
    form.noValidate = true;
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    form.addEventListener('blur', (e) => this.handleBlur(e), true);
    form.addEventListener('input', (e) => this.handleInput(e));
  }
  
  handleSubmit(e) {
    e.preventDefault();
    
    let firstInvalid = null;
    
    for (const element of this.form.elements) {
      if (element.name) {
        const isValid = this.validateElement(element);
        if (!isValid && !firstInvalid) {
          firstInvalid = element;
        }
      }
    }
    
    if (firstInvalid) {
      firstInvalid.focus();
    } else {
      this.submitForm();
    }
  }
  
  handleBlur(e) {
    const element = e.target;
    if (element.name && element.value) {
      this.validateElement(element);
    }
  }
  
  handleInput(e) {
    const element = e.target;
    // Only clear errors on input if already shown
    if (element.classList.contains('invalid')) {
      this.validateElement(element);
    }
  }
  
  validateElement(element) {
    const isValid = element.checkValidity();
    
    element.classList.toggle('invalid', !isValid);
    element.classList.toggle('valid', isValid);
    
    const errorContainer = this.getErrorContainer(element);
    errorContainer.textContent = isValid ? '' : element.validationMessage;
    
    return isValid;
  }
  
  getErrorContainer(element) {
    let container = element.parentElement.querySelector('.error-text');
    if (!container) {
      container = document.createElement('span');
      container.className = 'error-text';
      element.after(container);
    }
    return container;
  }
  
  submitForm() {
    // Submit logic
  }
}
```

---

## 4.3.6 Accessibility

### ARIA Attributes

```javascript
function setFieldError(element, message) {
  const errorId = `${element.id}-error`;
  
  // Mark as invalid
  element.setAttribute('aria-invalid', 'true');
  element.setAttribute('aria-describedby', errorId);
  
  // Create/update error message
  let errorEl = document.getElementById(errorId);
  if (!errorEl) {
    errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'error-message';
    errorEl.setAttribute('aria-live', 'polite');
    element.after(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldError(element) {
  element.removeAttribute('aria-invalid');
  
  const errorId = `${element.id}-error`;
  const errorEl = document.getElementById(errorId);
  
  if (errorEl) {
    errorEl.textContent = '';
  }
}
```

### Form Validation Pattern

```html
<form novalidate>
  <div class="field">
    <label for="email">Email *</label>
    <input type="email" id="email" name="email" required
           aria-describedby="email-hint email-error">
    <span id="email-hint" class="hint">We'll never share your email</span>
    <span id="email-error" class="error" aria-live="polite"></span>
  </div>
</form>
```

---

## 4.3.7 Validation Patterns

### On Submit Only

```javascript
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();
  }
});
```

### On Blur

```javascript
form.addEventListener('blur', (e) => {
  if (e.target.matches('input, textarea, select')) {
    if (e.target.value) {  // Only validate non-empty
      validateField(e.target);
    }
  }
}, true);
```

### On Input (Eager)

```javascript
form.addEventListener('input', (e) => {
  validateField(e.target);
});
```

### Hybrid (Recommended)

```javascript
// Show errors on blur, clear on input
const touchedFields = new Set();

form.addEventListener('blur', (e) => {
  if (e.target.name) {
    touchedFields.add(e.target.name);
    validateField(e.target);
  }
}, true);

form.addEventListener('input', (e) => {
  if (touchedFields.has(e.target.name)) {
    validateField(e.target);
  }
});
```

---

## 4.3.8 Gotchas

```javascript
// ❌ Not clearing custom validity
input.setCustomValidity('Error!');
// Later...
input.value = 'valid value';
// Still shows as invalid! customError is still set

// ✅ Clear on input
input.addEventListener('input', () => {
  input.setCustomValidity('');
});

// ❌ Using only HTML5 validation for security
// Client-side validation can be bypassed!

// ✅ Always validate server-side too
// Client validation is for UX only

// ❌ Checking validity before input
if (input.validity.valueMissing) {
  // True before user touches field
}

// ✅ Only validate after interaction
input.addEventListener('blur', () => {
  if (input.value && !input.validity.valid) {
    showError(input);
  }
});

// ❌ novalidate disables checkValidity()
// Actually it doesn't! It only disables browser UI

form.noValidate = true;
console.log(form.checkValidity());  // Still works!

// ❌ Expecting immediate validity update
input.value = 'invalid email';
// validity.typeMismatch is already true (synchronous)
```

---

## 4.3.9 Summary

### Validation Attributes

| Attribute | Description |
|-----------|-------------|
| `required` | Must have value |
| `pattern` | Must match regex |
| `minlength`/`maxlength` | String length limits |
| `min`/`max` | Number/date range |
| `step` | Number increment |
| `type` | Email, URL validation |

### ValidityState Flags

| Flag | When True |
|------|-----------|
| `valid` | All validations pass |
| `valueMissing` | Required but empty |
| `typeMismatch` | Wrong type (email/url) |
| `patternMismatch` | Doesn't match pattern |
| `tooShort`/`tooLong` | Length constraints |
| `rangeUnderflow`/`rangeOverflow` | Range constraints |
| `stepMismatch` | Not multiple of step |
| `badInput` | Unparseable input |
| `customError` | Custom validation set |

### Methods

| Method | Description |
|--------|-------------|
| `checkValidity()` | Check silently |
| `reportValidity()` | Check and show UI |
| `setCustomValidity()` | Set custom error |

### Best Practices

1. **Always clear custom validity on input**
2. **Use novalidate for custom UI** but still use Constraint API
3. **Validate server-side too** — client validation is UX only
4. **Show errors on blur**, clear on input
5. **Use ARIA attributes** for accessibility
6. **Focus first invalid field** on submit failure

---

**End of Chapter 4.3: Form Validation**

Next chapter: **4.4 FormData API** — covers creating, reading, and sending form data with fetch.
