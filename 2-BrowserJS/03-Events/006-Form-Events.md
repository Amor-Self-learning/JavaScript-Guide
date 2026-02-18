# 3.6 Form Events

Form events enable you to respond to user input, validate data, and control form submission. This chapter covers all form-related events, from input changes to submission handling.

---

## 3.6.1 Input Events

### input Event

```javascript
// Fires immediately on every change
const input = document.querySelector('input');

input.addEventListener('input', (e) => {
  console.log('Current value:', e.target.value);
});

// Works on:
// - <input> (text, number, email, etc.)
// - <textarea>
// - <select>
// - contenteditable elements

// Fires for:
// - Typing characters
// - Pasting text
// - Cutting text
// - Speech input
// - Autocomplete
// - Drag and drop text
```

### change Event

```javascript
// Fires when element loses focus AND value changed
// Or immediately for checkboxes/radios/selects

// Text input: fires on blur if value changed
textInput.addEventListener('change', (e) => {
  console.log('Final value:', e.target.value);
});

// Checkbox: fires immediately on change
checkbox.addEventListener('change', (e) => {
  console.log('Checked:', e.target.checked);
});

// Select: fires immediately on selection change
select.addEventListener('change', (e) => {
  console.log('Selected:', e.target.value);
});

// Radio: fires when selection changes
radio.addEventListener('change', (e) => {
  console.log('Selected option:', e.target.value);
});
```

### input vs change

```javascript
// input: real-time updates
// change: committed value

const input = document.querySelector('#search');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');

// Real-time preview
input.addEventListener('input', (e) => {
  preview.textContent = e.target.value;
});

// Save when done
input.addEventListener('change', (e) => {
  status.textContent = `Saved: "${e.target.value}"`;
  saveToServer(e.target.value);
});
```

### beforeinput Event

```javascript
// Fires before input is modified (can be canceled)
input.addEventListener('beforeinput', (e) => {
  console.log('Input type:', e.inputType);
  console.log('Data to insert:', e.data);
  
  // Prevent certain input
  if (e.inputType === 'insertFromPaste') {
    e.preventDefault();
    // Handle paste manually
    const cleaned = cleanPastedContent(e.data);
    document.execCommand('insertText', false, cleaned);
  }
});

// Common inputType values:
// insertText, insertFromPaste, insertFromDrop
// deleteContentBackward, deleteContentForward
// insertParagraph, insertLineBreak
```

---

## 3.6.2 Focus Events

### focus and blur

```javascript
// focus: element receives focus
input.addEventListener('focus', (e) => {
  e.target.parentElement.classList.add('focused');
});

// blur: element loses focus
input.addEventListener('blur', (e) => {
  e.target.parentElement.classList.remove('focused');
  validateField(e.target);
});

// ⚠️ focus and blur do NOT bubble
// Use focusin/focusout for event delegation
```

### focusin and focusout

```javascript
// These events bubble (unlike focus/blur)
form.addEventListener('focusin', (e) => {
  console.log('Focus moved to:', e.target.name);
  highlightField(e.target);
});

form.addEventListener('focusout', (e) => {
  console.log('Focus left:', e.target.name);
  validateField(e.target);
});

// Use for event delegation
document.addEventListener('focusin', (e) => {
  if (e.target.matches('.validate-on-focus')) {
    showFieldHelp(e.target);
  }
});
```

### relatedTarget

```javascript
// relatedTarget tells you where focus came from/goes to
input.addEventListener('focus', (e) => {
  console.log('Focus came from:', e.relatedTarget);
});

input.addEventListener('blur', (e) => {
  console.log('Focus going to:', e.relatedTarget);
  
  // Check if focus is leaving the form entirely
  if (!form.contains(e.relatedTarget)) {
    validateForm();
  }
});
```

### Controlling Focus

```javascript
// Set focus programmatically
input.focus();

// Remove focus
input.blur();

// Focus with scroll control
input.focus({ preventScroll: true });

// Check if element is focused
const isFocused = document.activeElement === input;

// Get currently focused element
console.log('Active element:', document.activeElement);
```

---

## 3.6.3 Form Submission

### submit Event

```javascript
// Fires when form is submitted
form.addEventListener('submit', (e) => {
  e.preventDefault();  // Prevent page reload
  
  const formData = new FormData(form);
  submitToServer(formData);
});

// Triggers for:
// - Clicking submit button
// - Pressing Enter in text input (if form has submit button)
// - form.submit() does NOT trigger this event!

// ⚠️ form.submit() bypasses submit event
form.submit();  // No event fired!

// ✅ Use requestSubmit() to trigger the event
form.requestSubmit();  // Event fires, validation runs
```

### Validation on Submit

```javascript
form.addEventListener('submit', (e) => {
  const isValid = validateAllFields();
  
  if (!isValid) {
    e.preventDefault();
    showErrors();
    return;
  }
  
  // Continue with submission
  handleSubmit(new FormData(form));
});

// Using built-in validation
form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();  // Show validation messages
    return;
  }
  
  handleSubmit(new FormData(form));
});
```

### reset Event

```javascript
// Fires when form is reset
form.addEventListener('reset', (e) => {
  // Optionally prevent
  if (!confirm('Clear all fields?')) {
    e.preventDefault();
    return;
  }
  
  // Clean up any custom state
  clearErrors();
  resetCustomFields();
});

// Triggers for:
// - Clicking reset button
// - form.reset() method
```

### formdata Event

```javascript
// Fires when FormData is constructed from a form
form.addEventListener('formdata', (e) => {
  // Modify FormData before it's used
  e.formData.append('timestamp', Date.now());
  e.formData.append('source', 'web');
  
  // Remove sensitive data
  e.formData.delete('debug-field');
});

// Useful for adding computed fields
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const formData = new FormData(form);  // formdata event fires here
  sendData(formData);
});
```

---

## 3.6.4 Selection Events

### select Event

```javascript
// Fires when text is selected in input/textarea
input.addEventListener('select', (e) => {
  const selected = e.target.value.substring(
    e.target.selectionStart,
    e.target.selectionEnd
  );
  console.log('Selected:', selected);
});

// Selection properties
console.log('Start:', input.selectionStart);
console.log('End:', input.selectionEnd);
console.log('Direction:', input.selectionDirection);

// Set selection programmatically
input.setSelectionRange(0, 5);  // Select first 5 characters
input.select();  // Select all
```

---

## 3.6.5 Form Validation Events

### invalid Event

```javascript
// Fires when validation fails on submit
input.addEventListener('invalid', (e) => {
  e.preventDefault();  // Prevent default error UI
  showCustomError(e.target, e.target.validationMessage);
});

// Customize validation message
input.addEventListener('invalid', (e) => {
  if (e.target.validity.valueMissing) {
    e.target.setCustomValidity('Please fill in this field');
  } else if (e.target.validity.typeMismatch) {
    e.target.setCustomValidity('Please enter a valid email');
  }
});

// Clear custom message on input
input.addEventListener('input', (e) => {
  e.target.setCustomValidity('');
});
```

### Validation API

```javascript
// Check validity
console.log(input.checkValidity());    // Returns boolean
console.log(form.checkValidity());     // Checks all fields

// Show validation UI
input.reportValidity();
form.reportValidity();

// Validity state object
const validity = input.validity;
console.log({
  valid: validity.valid,
  valueMissing: validity.valueMissing,      // required
  typeMismatch: validity.typeMismatch,      // type="email" etc.
  patternMismatch: validity.patternMismatch, // pattern attr
  tooShort: validity.tooShort,              // minlength
  tooLong: validity.tooLong,                // maxlength
  rangeUnderflow: validity.rangeUnderflow,  // min
  rangeOverflow: validity.rangeOverflow,    // max
  stepMismatch: validity.stepMismatch,      // step
  badInput: validity.badInput,              // unparseable input
  customError: validity.customError         // setCustomValidity
});
```

---

## 3.6.6 Common Patterns

### Real-Time Validation

```javascript
// Validate as user types
input.addEventListener('input', (e) => {
  const value = e.target.value;
  const isValid = validateValue(value);
  
  e.target.classList.toggle('valid', isValid);
  e.target.classList.toggle('invalid', !isValid);
  
  // Update error message
  const error = e.target.nextElementSibling;
  error.textContent = isValid ? '' : getErrorMessage(value);
});

// Debounced validation (for expensive checks)
let timeout;
input.addEventListener('input', (e) => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    checkUsernameAvailable(e.target.value);
  }, 300);
});
```

### Character Counter

```javascript
const textarea = document.querySelector('textarea');
const counter = document.querySelector('.counter');
const maxLength = 280;

textarea.addEventListener('input', (e) => {
  const remaining = maxLength - e.target.value.length;
  counter.textContent = remaining;
  counter.classList.toggle('warning', remaining < 20);
  counter.classList.toggle('error', remaining < 0);
});
```

### Auto-Save

```javascript
let saveTimeout;

form.addEventListener('input', (e) => {
  // Debounce saves
  clearTimeout(saveTimeout);
  
  saveTimeout = setTimeout(() => {
    const formData = new FormData(form);
    localStorage.setItem('draft', JSON.stringify(Object.fromEntries(formData)));
    showSaveIndicator();
  }, 1000);
});

// Restore on load
window.addEventListener('load', () => {
  const draft = localStorage.getItem('draft');
  if (draft) {
    const data = JSON.parse(draft);
    Object.entries(data).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field) field.value = value;
    });
  }
});
```

### Multi-Step Form

```javascript
class MultiStepForm {
  constructor(form) {
    this.form = form;
    this.steps = form.querySelectorAll('.step');
    this.currentStep = 0;
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  showStep(index) {
    this.steps.forEach((step, i) => {
      step.classList.toggle('active', i === index);
    });
    this.currentStep = index;
  }
  
  nextStep() {
    const currentFields = this.steps[this.currentStep].querySelectorAll('input');
    const allValid = [...currentFields].every(f => f.checkValidity());
    
    if (!allValid) {
      currentFields.forEach(f => f.reportValidity());
      return;
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }
  
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }
  
  handleSubmit(e) {
    e.preventDefault();
    if (this.currentStep < this.steps.length - 1) {
      this.nextStep();
    } else {
      this.submit();
    }
  }
  
  submit() {
    const formData = new FormData(this.form);
    // Submit logic
  }
}
```

---

## 3.6.7 Gotchas

```javascript
// ❌ form.submit() doesn't trigger submit event
form.submit();

// ✅ Use requestSubmit() to trigger event
form.requestSubmit();

// ❌ Relying on keypress for Enter detection
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') submitForm();  // Deprecated event
});

// ✅ Use keydown or form submit event
form.addEventListener('submit', (e) => {
  e.preventDefault();
  submitForm();
});

// ❌ Not clearing custom validity
input.setCustomValidity('Invalid!');
// Field stays invalid even after correction

// ✅ Clear on input
input.addEventListener('input', () => {
  input.setCustomValidity('');
});

// ❌ focus/blur don't bubble
container.addEventListener('focus', handleFocus);  // Won't work

// ✅ Use focusin/focusout for delegation
container.addEventListener('focusin', handleFocus);
```

---

## 3.6.8 Summary

### Form Events

| Event | When | Bubbles |
|-------|------|---------|
| `input` | Value changes (real-time) | Yes |
| `change` | Value committed (blur or select) | Yes |
| `beforeinput` | Before value changes | Yes |
| `submit` | Form submitted | Yes |
| `reset` | Form reset | Yes |
| `formdata` | FormData constructed | Yes |

### Focus Events

| Event | When | Bubbles |
|-------|------|---------|
| `focus` | Element receives focus | No |
| `blur` | Element loses focus | No |
| `focusin` | Element receives focus | Yes |
| `focusout` | Element loses focus | Yes |

### Validation Events

| Event | When | Use For |
|-------|------|---------|
| `invalid` | Validation fails | Custom error UI |

### Best Practices

1. **Use `input` for real-time feedback**, `change` for commits
2. **Use `focusin`/`focusout` for delegation** (they bubble)
3. **Use `requestSubmit()` instead of `submit()`** to trigger validation
4. **Clear `setCustomValidity('')` on input** to reset validation
5. **Debounce expensive operations** (server validation, auto-save)

---

**End of Chapter 3.6: Form Events**

Next chapter: **3.7 Touch Events** — covers touchstart, touchmove, touchend, touch lists, and gesture handling.
