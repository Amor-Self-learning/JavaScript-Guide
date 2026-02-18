# 4.2 Form API

The Form API provides methods and properties for programmatic form control, submission handling, and element management. This chapter covers form methods, programmatic submission, reset functionality, and focus management.

---

## 4.2.1 Accessing Form Elements

### form.elements

```javascript
const form = document.querySelector('form');

// HTMLFormControlsCollection of all controls
const elements = form.elements;

console.log(elements.length);           // Number of controls
console.log(elements[0]);               // First element
console.log(elements['username']);      // By name
console.log(elements.username);         // Same thing
console.log(elements.namedItem('email')); // Explicit method

// Iterate over elements
for (const element of elements) {
  if (element.name) {
    console.log(`${element.name}: ${element.value}`);
  }
}

// Filter to specific types
const inputs = Array.from(elements).filter(
  el => el.tagName === 'INPUT'
);
```

### Named Elements

```javascript
// Access elements by name attribute
const form = document.querySelector('form');

// Single element with unique name
const username = form.elements['username'];

// Multiple elements with same name (radios)
const genderRadios = form.elements['gender'];
// Returns RadioNodeList

console.log(genderRadios.value);  // Value of selected radio

// Iterate over radio group
for (const radio of genderRadios) {
  console.log(radio.value, radio.checked);
}
```

---

## 4.2.2 Form Submission

### submit() Method

```javascript
const form = document.querySelector('form');

// Programmatic submission
form.submit();

// ⚠️ submit() does NOT trigger 'submit' event
// ⚠️ submit() does NOT run HTML5 validation

// Use case: submitting after async validation
async function handleSubmit() {
  const isValid = await validateOnServer();
  if (isValid) {
    form.submit();  // Direct submission
  }
}
```

### requestSubmit() Method

```javascript
const form = document.querySelector('form');

// Triggers submit event and validation
form.requestSubmit();

// Optionally specify submitter button
const submitBtn = form.querySelector('button[type="submit"]');
form.requestSubmit(submitBtn);

// ✅ requestSubmit() DOES trigger 'submit' event
// ✅ requestSubmit() DOES run HTML5 validation
form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Submit event fired');
});

// Difference summary:
// submit() - bypasses events and validation
// requestSubmit() - triggers events and validation
```

### Handling Submission

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();  // Prevent page reload
  
  const formData = new FormData(form);
  const submitButton = e.submitter;  // Which button was clicked
  
  // Disable form during submission
  const elements = form.elements;
  for (const el of elements) {
    el.disabled = true;
  }
  
  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: formData
    });
    
    if (response.ok) {
      showSuccess();
    } else {
      showError('Submission failed');
    }
  } catch (error) {
    showError(error.message);
  } finally {
    // Re-enable form
    for (const el of elements) {
      el.disabled = false;
    }
  }
});
```

### The submitter Property

```javascript
// HTML
// <form>
//   <button type="submit" name="action" value="save">Save</button>
//   <button type="submit" name="action" value="publish">Publish</button>
// </form>

form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Which button triggered submission?
  const submitter = e.submitter;
  
  if (submitter) {
    console.log('Submitter:', submitter.name, submitter.value);
    // 'action', 'save' or 'action', 'publish'
  }
  
  // Include submitter value in FormData
  const formData = new FormData(form, submitter);
});
```

---

## 4.2.3 Form Reset

### reset() Method

```javascript
const form = document.querySelector('form');

// Reset all fields to default values
form.reset();

// ⚠️ Resets to defaultValue/defaultChecked, not empty

// Listen for reset
form.addEventListener('reset', (e) => {
  console.log('Form was reset');
  
  // Optionally prevent
  if (!confirm('Clear all fields?')) {
    e.preventDefault();
  }
});
```

### Custom Reset

```javascript
// Clear all values (not just reset to defaults)
function clearForm(form) {
  for (const element of form.elements) {
    switch (element.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'textarea':
      case 'tel':
      case 'url':
      case 'search':
      case 'number':
        element.value = '';
        break;
        
      case 'checkbox':
      case 'radio':
        element.checked = false;
        break;
        
      case 'select-one':
      case 'select-multiple':
        element.selectedIndex = -1;
        break;
        
      case 'file':
        element.value = '';
        break;
    }
  }
}

// Restore form to server state
async function resetToServerState(form) {
  const response = await fetch(`/api/forms/${form.dataset.id}`);
  const data = await response.json();
  
  for (const [name, value] of Object.entries(data)) {
    const element = form.elements[name];
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = value;
      } else {
        element.value = value;
      }
    }
  }
}
```

---

## 4.2.4 Focus Management

### focus() and blur()

```javascript
const input = document.querySelector('input');

// Give focus
input.focus();

// Focus with options
input.focus({
  preventScroll: true  // Don't scroll to element
});

// Remove focus
input.blur();

// Check focus state
console.log(document.activeElement);  // Currently focused element
console.log(document.activeElement === input);  // Is this focused?
```

### Focus Events

```javascript
const input = document.querySelector('input');

// Element receives focus
input.addEventListener('focus', (e) => {
  console.log('Input focused');
  e.target.classList.add('focused');
});

// Element loses focus
input.addEventListener('blur', (e) => {
  console.log('Input blurred');
  e.target.classList.remove('focused');
  validateField(e.target);
});

// Bubbling versions (for delegation)
form.addEventListener('focusin', (e) => {
  console.log('Focus moved to:', e.target.name);
});

form.addEventListener('focusout', (e) => {
  console.log('Focus left:', e.target.name);
});
```

### Auto-Focus First Invalid

```javascript
function focusFirstInvalid(form) {
  for (const element of form.elements) {
    if (!element.validity.valid) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return element;
    }
  }
  return null;
}

form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    focusFirstInvalid(form);
  }
});
```

### Tab Order

```javascript
// Control tab order with tabindex
const inputs = document.querySelectorAll('input');

// tabindex="0" - normal order
// tabindex="1+" - before normal elements, lower numbers first
// tabindex="-1" - skip in tab order, but focusable via JS

// Make element focusable but skip tab order
const div = document.querySelector('.custom-widget');
div.tabIndex = -1;
div.focus();  // Works

// Set programmatic tab order
inputs[0].tabIndex = 2;
inputs[1].tabIndex = 1;  // This will be focused first

// Manage focus within custom widget
class FocusTrap {
  constructor(container) {
    this.container = container;
    this.focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    this.first = this.focusable[0];
    this.last = this.focusable[this.focusable.length - 1];
  }
  
  activate() {
    this.container.addEventListener('keydown', this.handleKeydown.bind(this));
    this.first?.focus();
  }
  
  handleKeydown(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey && document.activeElement === this.first) {
      e.preventDefault();
      this.last?.focus();
    } else if (!e.shiftKey && document.activeElement === this.last) {
      e.preventDefault();
      this.first?.focus();
    }
  }
}
```

---

## 4.2.5 Selection Methods

### select()

```javascript
const input = document.querySelector('input[type="text"]');

// Select all text
input.select();

// Triggered on text selection
input.addEventListener('select', (e) => {
  const selected = e.target.value.substring(
    e.target.selectionStart,
    e.target.selectionEnd
  );
  console.log('Selected:', selected);
});
```

### setSelectionRange()

```javascript
const input = document.querySelector('input[type="text"]');
input.value = 'Hello World';

// Select specific range
input.setSelectionRange(0, 5);  // Selects "Hello"
input.focus();  // Must focus to show selection

// Selection properties
console.log(input.selectionStart);      // 0
console.log(input.selectionEnd);        // 5
console.log(input.selectionDirection);  // 'forward' or 'backward'

// Set cursor position (collapsed selection)
input.setSelectionRange(5, 5);  // Cursor after "Hello"

// Select with direction
input.setSelectionRange(0, 5, 'backward');
```

### setRangeText()

```javascript
const input = document.querySelector('input[type="text"]');
input.value = 'Hello World';

// Replace selection (or insert at cursor)
input.setSelectionRange(0, 5);
input.setRangeText('Hi');  // 'Hi World'

// Replace specific range
input.setRangeText('Goodbye', 0, 5);  // 'Goodbye World'

// With selection mode
input.setRangeText('inserted', 6, 6, 'end');
// 'Hello insertedWorld', cursor at end of inserted text

// Selection modes:
// 'select' - select the newly inserted text
// 'start' - cursor at start of inserted text
// 'end' - cursor at end of inserted text
// 'preserve' - attempt to preserve existing selection
```

---

## 4.2.6 Disabled and Readonly States

### Managing Disabled State

```javascript
const input = document.querySelector('input');
const form = document.querySelector('form');

// Disable individual element
input.disabled = true;
console.log(input.disabled);  // true

// Disabled elements:
// - Can't be focused
// - Don't respond to events
// - NOT included in FormData
// - Grayed out appearance

// Enable
input.disabled = false;

// Disable entire fieldset
const fieldset = document.querySelector('fieldset');
fieldset.disabled = true;
// All contained inputs are now disabled

// Disable whole form
function disableForm(form, disabled = true) {
  for (const element of form.elements) {
    element.disabled = disabled;
  }
}
```

### Readonly State

```javascript
const input = document.querySelector('input');

// Readonly
input.readOnly = true;

// Readonly elements:
// - Can be focused
// - Respond to events (but not input)
// - ARE included in FormData
// - No visual change (must style manually)

// Use readonly for:
// - Display-only fields that should submit
// - Computed values

// Use disabled for:
// - Truly inactive fields
// - Fields that shouldn't submit
```

---

## 4.2.7 Form State Management

### Tracking Dirty State

```javascript
class FormState {
  constructor(form) {
    this.form = form;
    this.initialState = this.captureState();
    this.isDirty = false;
    
    form.addEventListener('input', () => this.checkDirty());
    form.addEventListener('change', () => this.checkDirty());
  }
  
  captureState() {
    const state = {};
    
    for (const element of this.form.elements) {
      if (!element.name) continue;
      
      if (element.type === 'checkbox') {
        state[element.name] = element.checked;
      } else if (element.type === 'radio') {
        if (element.checked) {
          state[element.name] = element.value;
        }
      } else {
        state[element.name] = element.value;
      }
    }
    
    return state;
  }
  
  checkDirty() {
    const currentState = this.captureState();
    this.isDirty = JSON.stringify(currentState) !== JSON.stringify(this.initialState);
    
    // Optionally warn before leaving
    if (this.isDirty) {
      window.onbeforeunload = () => '';
    } else {
      window.onbeforeunload = null;
    }
  }
  
  reset() {
    this.form.reset();
    this.isDirty = false;
  }
  
  markClean() {
    this.initialState = this.captureState();
    this.isDirty = false;
    window.onbeforeunload = null;
  }
}

// Usage
const formState = new FormState(form);

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await submitForm();
  formState.markClean();
});
```

---

## 4.2.8 Common Patterns

### Dynamic Form Fields

```javascript
class DynamicFieldList {
  constructor(container, template) {
    this.container = container;
    this.template = template;
    this.fieldCount = 0;
    
    this.addButton = container.querySelector('.add-field');
    this.addButton.addEventListener('click', () => this.addField());
    
    container.addEventListener('click', (e) => {
      if (e.target.matches('.remove-field')) {
        this.removeField(e.target.closest('.field-row'));
      }
    });
  }
  
  addField() {
    const field = this.template.cloneNode(true);
    const index = this.fieldCount++;
    
    // Update names with index
    field.querySelectorAll('[name]').forEach(el => {
      el.name = el.name.replace('[]', `[${index}]`);
    });
    
    this.container.insertBefore(field, this.addButton);
  }
  
  removeField(row) {
    row.remove();
  }
}
```

### Conditional Fields

```javascript
// Show/hide fields based on selection
const typeSelect = document.querySelector('#type');
const conditionalSections = {
  business: document.querySelector('.business-fields'),
  personal: document.querySelector('.personal-fields')
};

typeSelect.addEventListener('change', (e) => {
  const selectedType = e.target.value;
  
  Object.entries(conditionalSections).forEach(([type, section]) => {
    const shouldShow = type === selectedType;
    section.hidden = !shouldShow;
    
    // Disable hidden fields so they don't submit
    section.querySelectorAll('input, select, textarea').forEach(field => {
      field.disabled = !shouldShow;
    });
  });
});
```

---

## 4.2.9 Gotchas

```javascript
// ❌ submit() triggers submit event
form.submit();  // Event NOT fired, validation NOT run

// ✅ Use requestSubmit() to trigger event and validation
form.requestSubmit();

// ❌ Expecting reset() to clear fields
form.reset();  // Resets to DEFAULT values, not empty

// ✅ Clear manually if needed
for (const el of form.elements) {
  if (el.type !== 'submit') el.value = '';
}

// ❌ Disabled elements in FormData
input.disabled = true;
const data = new FormData(form);
// disabled input NOT in data!

// ✅ Use readonly if value must submit
input.readOnly = true;
// Value IS in FormData

// ❌ Missing focus() after setSelectionRange()
input.setSelectionRange(0, 5);  // Selection set but not visible

// ✅ Focus to show selection
input.setSelectionRange(0, 5);
input.focus();

// ❌ Relying on form.elements index order
const first = form.elements[0];  // Might change with DOM changes

// ✅ Use name access
const username = form.elements['username'];
```

---

## 4.2.10 Summary

### Form Methods

| Method | Description |
|--------|-------------|
| `submit()` | Submit without event/validation |
| `requestSubmit()` | Submit with event/validation |
| `reset()` | Reset to default values |
| `checkValidity()` | Check all fields valid |
| `reportValidity()` | Check and show validation UI |

### Element Methods

| Method | Description |
|--------|-------------|
| `focus()` | Give focus to element |
| `blur()` | Remove focus |
| `select()` | Select all text |
| `setSelectionRange()` | Select specific range |
| `setRangeText()` | Replace text range |

### Properties

| Property | Description |
|----------|-------------|
| `form.elements` | All form controls |
| `element.form` | Parent form |
| `element.disabled` | Can't interact, won't submit |
| `element.readOnly` | Can't edit, will submit |
| `e.submitter` | Button that triggered submit |

### Best Practices

1. **Use `requestSubmit()` over `submit()`** for proper events
2. **Handle both `disabled` and `readonly`** appropriately
3. **Track dirty state** for unsaved changes warning
4. **Focus first invalid field** on validation failure
5. **Disable form during async submission**
6. **Use `focusin`/`focusout`** for event delegation

---

**End of Chapter 4.2: Form API**

Next chapter: **4.3 Form Validation** — covers HTML5 validation, Constraint Validation API, and custom validation.
