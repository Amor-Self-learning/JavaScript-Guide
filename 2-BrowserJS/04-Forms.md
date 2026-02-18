# 4.1 Form Elements

HTML form elements provide the foundation for user input in web applications. This chapter covers form controls, their properties, states, and how to interact with them via JavaScript.

---

## 4.1.1 The Form Element

### Basic Form Structure

```html
<!-- HTML form structure -->
<form id="contactForm" action="/submit" method="POST">
  <input type="text" name="username" id="username">
  <input type="email" name="email" id="email">
  <textarea name="message" id="message"></textarea>
  <button type="submit">Send</button>
</form>
```

```javascript
// Accessing forms
const form = document.getElementById('contactForm');
const formByName = document.forms['contactForm'];
const firstForm = document.forms[0];

// Form properties
console.log('Action:', form.action);
console.log('Method:', form.method);
console.log('Encoding:', form.enctype);
console.log('Name:', form.name);

// Modify form properties
form.action = '/new-endpoint';
form.method = 'GET';
```

### Form Attributes

```javascript
// Common form attributes
form.autocomplete = 'on';   // or 'off'
form.noValidate = true;     // Disable HTML5 validation
form.target = '_blank';     // Where to display response

// Check attributes
console.log(form.hasAttribute('novalidate'));
```

---

## 4.1.2 Input Elements

### Input Types

```javascript
// Get input element
const input = document.querySelector('input[name="username"]');

// Common input types and their special properties
const textInput = document.querySelector('input[type="text"]');
textInput.value = 'Hello';
textInput.placeholder = 'Enter your name';
textInput.maxLength = 50;
textInput.minLength = 2;
textInput.pattern = '[A-Za-z]+';

// Number input
const numberInput = document.querySelector('input[type="number"]');
numberInput.value = '42';
numberInput.min = '0';
numberInput.max = '100';
numberInput.step = '1';
console.log(numberInput.valueAsNumber);  // 42 (actual number)

// Date input
const dateInput = document.querySelector('input[type="date"]');
dateInput.value = '2024-01-15';
console.log(dateInput.valueAsDate);  // Date object
dateInput.min = '2024-01-01';
dateInput.max = '2024-12-31';

// Range input
const rangeInput = document.querySelector('input[type="range"]');
rangeInput.value = '50';
rangeInput.min = '0';
rangeInput.max = '100';
console.log(rangeInput.valueAsNumber);

// Color input
const colorInput = document.querySelector('input[type="color"]');
colorInput.value = '#ff0000';

// File input
const fileInput = document.querySelector('input[type="file"]');
console.log(fileInput.files);        // FileList
console.log(fileInput.accept);       // Accepted types
console.log(fileInput.multiple);     // Multiple files allowed?
```

### Checkbox and Radio

```javascript
// Checkbox
const checkbox = document.querySelector('input[type="checkbox"]');
console.log(checkbox.checked);       // true or false
checkbox.checked = true;             // Check it
checkbox.indeterminate = true;       // Set indeterminate state

// Listen for changes
checkbox.addEventListener('change', (e) => {
  console.log('Checked:', e.target.checked);
});

// Radio buttons
const radios = document.querySelectorAll('input[name="option"]');

radios.forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.checked) {
      console.log('Selected:', e.target.value);
    }
  });
});

// Get selected radio value
function getSelectedRadio(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}
```

### Hidden Input

```javascript
// Hidden inputs for form data
const hiddenInput = document.querySelector('input[type="hidden"]');
hiddenInput.value = 'secret-token';

// Create hidden input dynamically
const token = document.createElement('input');
token.type = 'hidden';
token.name = 'csrf_token';
token.value = generateToken();
form.appendChild(token);
```

---

## 4.1.3 Textarea Element

```javascript
// Textarea properties
const textarea = document.querySelector('textarea');

// Value
textarea.value = 'Initial content';
console.log(textarea.value);

// Size
textarea.rows = 10;
textarea.cols = 50;

// Length limits
textarea.maxLength = 1000;
textarea.minLength = 10;

// Wrapping
textarea.wrap = 'soft';  // or 'hard', 'off'

// Placeholder
textarea.placeholder = 'Enter your message...';

// Selection
console.log(textarea.selectionStart);
console.log(textarea.selectionEnd);
textarea.setSelectionRange(0, 5);  // Select first 5 chars

// Text manipulation
textarea.select();  // Select all
```

### Character Counter

```javascript
const textarea = document.querySelector('textarea');
const counter = document.querySelector('.char-count');
const maxLength = 280;

textarea.maxLength = maxLength;

textarea.addEventListener('input', (e) => {
  const remaining = maxLength - e.target.value.length;
  counter.textContent = `${remaining} characters remaining`;
  counter.classList.toggle('warning', remaining < 20);
});
```

---

## 4.1.4 Select Element

### Basic Select

```javascript
const select = document.querySelector('select');

// Access selected value
console.log(select.value);                  // Value of selected option
console.log(select.selectedIndex);          // Index of selected option
console.log(select.selectedOptions);        // HTMLCollection of selected

// Change selection
select.value = 'option2';
select.selectedIndex = 1;

// Access options
console.log(select.options);                // HTMLCollection of all options
console.log(select.options.length);
console.log(select.options[0].value);
console.log(select.options[0].text);
console.log(select.options[0].selected);

// Listen for changes
select.addEventListener('change', (e) => {
  console.log('Selected:', e.target.value);
});
```

### Multiple Select

```html
<select id="fruits" multiple>
  <option value="apple">Apple</option>
  <option value="banana">Banana</option>
  <option value="cherry">Cherry</option>
</select>
```

```javascript
const multiSelect = document.querySelector('#fruits');

// Get all selected values
function getSelectedValues(select) {
  return Array.from(select.selectedOptions).map(opt => opt.value);
}

multiSelect.addEventListener('change', (e) => {
  const selected = getSelectedValues(e.target);
  console.log('Selected:', selected);  // ['apple', 'cherry']
});

// Set multiple selections
function setSelectedValues(select, values) {
  Array.from(select.options).forEach(opt => {
    opt.selected = values.includes(opt.value);
  });
}
```

### Managing Options

```javascript
const select = document.querySelector('select');

// Add option
const newOption = document.createElement('option');
newOption.value = 'new';
newOption.text = 'New Option';
select.add(newOption);

// Or using Option constructor
select.add(new Option('Another Option', 'another'));

// Add at specific index
select.add(new Option('First', 'first'), 0);

// Remove option
select.remove(0);  // Remove first option

// Remove all options
select.length = 0;
// Or
while (select.options.length > 0) {
  select.remove(0);
}

// Populate from array
const data = [
  { value: 'us', text: 'United States' },
  { value: 'uk', text: 'United Kingdom' },
  { value: 'ca', text: 'Canada' }
];

data.forEach(item => {
  select.add(new Option(item.text, item.value));
});
```

### Optgroup

```html
<select id="car">
  <optgroup label="Swedish Cars">
    <option value="volvo">Volvo</option>
    <option value="saab">Saab</option>
  </optgroup>
  <optgroup label="German Cars">
    <option value="mercedes">Mercedes</option>
    <option value="audi">Audi</option>
  </optgroup>
</select>
```

```javascript
// Access optgroups
const select = document.querySelector('#car');

Array.from(select.options).forEach(opt => {
  if (opt.parentElement.tagName === 'OPTGROUP') {
    console.log(`${opt.text} (${opt.parentElement.label})`);
  }
});

// Create optgroup programmatically
const group = document.createElement('optgroup');
group.label = 'Japanese Cars';
group.appendChild(new Option('Toyota', 'toyota'));
group.appendChild(new Option('Honda', 'honda'));
select.appendChild(group);
```

---

## 4.1.5 Button Elements

### Button Types

```html
<button type="submit">Submit</button>
<button type="reset">Reset</button>
<button type="button">Click Me</button>
```

```javascript
// Submit button - triggers form submission
const submitBtn = document.querySelector('button[type="submit"]');

// Reset button - resets form to initial values
const resetBtn = document.querySelector('button[type="reset"]');

// Button - no default behavior
const btn = document.querySelector('button[type="button"]');

// Check button type
console.log(submitBtn.type);  // 'submit'

// Associated form
console.log(submitBtn.form);  // Parent form element

// Disable button
submitBtn.disabled = true;
```

### Button with Form Attribute

```html
<!-- Button outside form can target it -->
<form id="myForm">
  <input type="text" name="data">
</form>
<button type="submit" form="myForm">Submit</button>
```

```javascript
// Override form attributes
const submitBtn = document.querySelector('button[type="submit"]');
submitBtn.formAction = '/different-endpoint';
submitBtn.formMethod = 'GET';
submitBtn.formNoValidate = true;
submitBtn.formTarget = '_blank';
```

---

## 4.1.6 Common Element Properties

### Value Property

```javascript
// Getting and setting values
const input = document.querySelector('input');
const currentValue = input.value;
input.value = 'New value';

// Clear value
input.value = '';

// Default value (from HTML)
console.log(input.defaultValue);
input.value = input.defaultValue;  // Reset to default
```

### Disabled and Readonly

```javascript
const input = document.querySelector('input');

// Disabled - can't interact or submit
input.disabled = true;
console.log(input.disabled);  // true

// Readonly - can't edit but submits
input.readOnly = true;
console.log(input.readOnly);  // true

// Disable entire fieldset
const fieldset = document.querySelector('fieldset');
fieldset.disabled = true;  // Disables all contained elements
```

### Required and Autofocus

```javascript
const input = document.querySelector('input');

// Required
input.required = true;
console.log(input.required);

// Autofocus
input.autofocus = true;

// Programmatic focus
input.focus();
input.blur();

// Focus options
input.focus({ preventScroll: true });
```

### Name and ID

```javascript
const input = document.querySelector('input');

// Name (for form submission)
console.log(input.name);
input.name = 'newName';

// ID (for DOM access)
console.log(input.id);
input.id = 'newId';

// Access by name via form
const form = document.querySelector('form');
console.log(form.elements['username']);
console.log(form.elements.username);  // Same thing
```

---

## 4.1.7 Label Association

```html
<!-- Explicit association -->
<label for="email">Email:</label>
<input type="email" id="email">

<!-- Implicit association -->
<label>
  <input type="checkbox"> Remember me
</label>
```

```javascript
const input = document.querySelector('#email');

// Get associated labels
const labels = input.labels;  // NodeList of labels
console.log(labels[0].textContent);

// Get input from label
const label = document.querySelector('label[for="email"]');
const control = label.control;  // Associated input

// Create association programmatically
const newLabel = document.createElement('label');
newLabel.htmlFor = 'email';
newLabel.textContent = 'Email Address:';
```

---

## 4.1.8 Form Element Collection

### Accessing Form Elements

```javascript
const form = document.querySelector('form');

// All form elements
const elements = form.elements;  // HTMLFormControlsCollection
console.log(elements.length);

// Access by index
console.log(elements[0]);

// Access by name or id
console.log(elements['username']);
console.log(elements.username);

// Iterate
for (const element of elements) {
  console.log(element.name, element.value);
}

// Convert to array
const elementsArray = Array.from(elements);
const inputsOnly = elementsArray.filter(el => el.tagName === 'INPUT');
```

### Named Access

```javascript
const form = document.querySelector('form');

// When multiple elements have same name (radios)
const radios = form.elements['gender'];  // RadioNodeList

// RadioNodeList has .value property
console.log(radios.value);  // Value of selected radio

// Set by value
radios.value = 'female';  // Selects the radio with this value
```

---

## 4.1.9 Gotchas

```javascript
// ❌ Using innerHTML to change input value
input.innerHTML = 'New value';  // Wrong!

// ✅ Use value property
input.value = 'New value';

// ❌ Confusing value and defaultValue
input.value = 'Changed';
console.log(input.value);         // 'Changed'
console.log(input.defaultValue);  // Still original from HTML

// ❌ Checkbox checked vs value
const checkbox = document.querySelector('input[type="checkbox"]');
console.log(checkbox.value);    // Always returns 'on' or custom value
console.log(checkbox.checked);  // true/false - what you usually want

// ❌ Select value when no option selected
const select = document.querySelector('select');
// If no option is selected, value is empty string

// ✅ Handle empty case
const value = select.value || select.options[0]?.value;

// ❌ Forgetting form doesn't include disabled elements
const formData = new FormData(form);
// Disabled inputs are NOT included!

// ✅ Use readonly if you want value included but not editable
input.readOnly = true;  // Value will be in FormData
```

---

## 4.1.10 Summary

### Element Types

| Element | Key Properties |
|---------|---------------|
| `<form>` | `action`, `method`, `elements`, `submit()`, `reset()` |
| `<input>` | `type`, `value`, `checked`, `files`, `valueAsNumber` |
| `<textarea>` | `value`, `rows`, `cols`, `selectionStart/End` |
| `<select>` | `value`, `selectedIndex`, `options`, `selectedOptions` |
| `<button>` | `type`, `form`, `disabled`, `formAction` |

### State Properties

| Property | Description |
|----------|-------------|
| `value` | Current value |
| `defaultValue` | Initial value from HTML |
| `checked` | Checkbox/radio state |
| `selected` | Option selection state |
| `disabled` | Can't interact or submit |
| `readOnly` | Can't edit but submits |
| `required` | Must have value |

### Best Practices

1. **Use `.value` for input values**, not innerHTML
2. **Use `.checked` for checkboxes/radios**, not value
3. **Use `readonly` over `disabled`** if value should submit
4. **Use labels** with `for` attribute for accessibility
5. **Use `form.elements`** to access form controls by name
6. **Handle multiple select** with `selectedOptions`

---

**End of Chapter 4.1: Form Elements**

Next chapter: **4.2 Form API** — covers form methods, submission, reset, and focus management.
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
# 4.4 FormData API

The FormData API provides a way to construct and manipulate form data for submission. This chapter covers creating FormData, modifying entries, handling files, and sending data with fetch.

---

## 4.4.1 Creating FormData

### From a Form Element

```javascript
const form = document.querySelector('form');

// Create FormData from form
const formData = new FormData(form);

// Automatically includes all named form controls:
// - Input values (text, number, etc.)
// - Textarea values
// - Select values
// - Checked checkboxes/radios
// - File inputs

// Does NOT include:
// - Disabled elements
// - Elements without name attribute
// - Unchecked checkboxes/radios
// - Submit buttons (unless specified)
```

### With Submitter

```javascript
// Include submit button value
form.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // e.submitter is the button that was clicked
  const formData = new FormData(form, e.submitter);
  
  // If submitter has name/value, it's included
  // <button type="submit" name="action" value="save">Save</button>
  console.log(formData.get('action'));  // 'save'
});
```

### Empty FormData

```javascript
// Create empty FormData
const formData = new FormData();

// Add entries manually
formData.append('username', 'john');
formData.append('email', 'john@example.com');
```

---

## 4.4.2 Reading FormData

### get() and getAll()

```javascript
const formData = new FormData(form);

// Get single value
const username = formData.get('username');
console.log(username);  // 'john' or null if not present

// Get all values (for multi-value fields)
const interests = formData.getAll('interests');
console.log(interests);  // ['sports', 'music', 'travel']

// Useful for:
// - Multiple checkboxes with same name
// - Multiple file inputs
// - Select multiple
```

### has()

```javascript
const formData = new FormData(form);

// Check if field exists
if (formData.has('username')) {
  console.log('Username provided');
}

if (formData.has('newsletter')) {
  console.log('Newsletter checkbox was checked');
}
```

### Iterating

```javascript
const formData = new FormData(form);

// Iterate over entries
for (const [key, value] of formData) {
  console.log(`${key}: ${value}`);
}

// Using entries()
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

// Keys only
for (const key of formData.keys()) {
  console.log(key);
}

// Values only
for (const value of formData.values()) {
  console.log(value);
}

// forEach
formData.forEach((value, key) => {
  console.log(key, value);
});
```

### Converting to Object

```javascript
const formData = new FormData(form);

// Simple conversion (loses multiple values)
const obj = Object.fromEntries(formData);

// Handle multiple values
function formDataToObject(formData) {
  const obj = {};
  
  for (const [key, value] of formData) {
    if (obj[key] !== undefined) {
      // Convert to array if multiple values
      if (!Array.isArray(obj[key])) {
        obj[key] = [obj[key]];
      }
      obj[key].push(value);
    } else {
      obj[key] = value;
    }
  }
  
  return obj;
}

// Or use getAll for known multi-value fields
const data = {
  ...Object.fromEntries(formData),
  interests: formData.getAll('interests')
};
```

---

## 4.4.3 Modifying FormData

### append()

```javascript
const formData = new FormData();

// Add string value
formData.append('username', 'john');

// Add number (converted to string)
formData.append('age', 25);

// Append another value with same key
formData.append('tag', 'javascript');
formData.append('tag', 'web');
console.log(formData.getAll('tag'));  // ['javascript', 'web']

// Append file
const fileInput = document.querySelector('input[type="file"]');
formData.append('avatar', fileInput.files[0]);

// Append Blob with filename
const blob = new Blob(['Hello'], { type: 'text/plain' });
formData.append('file', blob, 'hello.txt');
```

### set()

```javascript
const formData = new FormData();

// Set value (replaces if exists)
formData.set('username', 'john');
formData.set('username', 'jane');  // Replaces 'john'

console.log(formData.get('username'));  // 'jane'
console.log(formData.getAll('username'));  // ['jane']

// Difference from append:
// append() adds, even if key exists (creates array)
// set() replaces any existing values
```

### delete()

```javascript
const formData = new FormData(form);

// Remove field
formData.delete('password');

// Removes ALL values for that key
formData.append('tag', 'js');
formData.append('tag', 'web');
formData.delete('tag');
console.log(formData.has('tag'));  // false
```

---

## 4.4.4 Working with Files

### File Inputs

```javascript
// HTML: <input type="file" name="avatar">
const formData = new FormData(form);

// Single file
const file = formData.get('avatar');
console.log(file.name);
console.log(file.size);
console.log(file.type);

// Multiple files: <input type="file" name="photos" multiple>
const files = formData.getAll('photos');
files.forEach(file => {
  console.log(file.name);
});
```

### Appending Files Manually

```javascript
const formData = new FormData();

// From file input
const fileInput = document.querySelector('input[type="file"]');
for (const file of fileInput.files) {
  formData.append('files', file);
}

// From drag and drop
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  
  const formData = new FormData();
  for (const file of e.dataTransfer.files) {
    formData.append('uploads', file);
  }
  
  uploadFiles(formData);
});

// From clipboard
document.addEventListener('paste', (e) => {
  const items = e.clipboardData.items;
  const formData = new FormData();
  
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      formData.append('image', file, `paste-${Date.now()}.png`);
    }
  }
});
```

### Creating Files from Blobs

```javascript
const formData = new FormData();

// Text file from string
const textBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
formData.append('textFile', textBlob, 'hello.txt');

// JSON file
const jsonData = JSON.stringify({ name: 'John', age: 30 });
const jsonBlob = new Blob([jsonData], { type: 'application/json' });
formData.append('data', jsonBlob, 'data.json');

// Canvas to file
const canvas = document.querySelector('canvas');
canvas.toBlob((blob) => {
  formData.append('drawing', blob, 'drawing.png');
});

// Or with async/await
const blob = await new Promise(resolve => canvas.toBlob(resolve));
formData.append('image', blob, 'canvas.png');
```

---

## 4.4.5 Sending with Fetch

### Basic POST

```javascript
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = new FormData(form);
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: formData
    // Don't set Content-Type header!
    // Fetch sets it automatically with boundary
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('Success:', result);
  }
});
```

### Why Not Set Content-Type

```javascript
// ❌ Don't do this
fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data'  // Wrong!
  },
  body: formData
});

// ✅ Let browser set it
fetch('/api/upload', {
  method: 'POST',
  body: formData
  // Browser sets: Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...
});

// The boundary is required for parsing
// Browser generates unique boundary automatically
```

### Converting to JSON

```javascript
// If API expects JSON instead of FormData
const formData = new FormData(form);
const jsonData = Object.fromEntries(formData);

fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(jsonData)
});

// ⚠️ This loses files!
// Files cannot be sent as JSON
```

### Sending as URL-Encoded

```javascript
const formData = new FormData(form);

// Convert to URLSearchParams
const params = new URLSearchParams();
for (const [key, value] of formData) {
  if (typeof value === 'string') {
    params.append(key, value);
  }
}

fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: params
});
```

---

## 4.4.6 Upload Progress

```javascript
// FormData with XMLHttpRequest for progress
function uploadWithProgress(formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        onProgress(percent);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));
    
    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

// Usage
const formData = new FormData(form);

await uploadWithProgress(formData, (percent) => {
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${Math.round(percent)}%`;
});
```

---

## 4.4.7 Common Patterns

### Form Submission Handler

```javascript
class FormHandler {
  constructor(form, options = {}) {
    this.form = form;
    this.url = options.url || form.action;
    this.method = options.method || form.method || 'POST';
    this.onSuccess = options.onSuccess || (() => {});
    this.onError = options.onError || (() => {});
    
    form.addEventListener('submit', (e) => this.handleSubmit(e));
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(this.form, e.submitter);
    const submitBtn = e.submitter || this.form.querySelector('[type="submit"]');
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      
      const response = await fetch(this.url, {
        method: this.method,
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      this.onSuccess(result);
    } catch (error) {
      this.onError(error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  }
}
```

### Multipart File Upload

```javascript
async function uploadFiles(files, additionalData = {}) {
  const formData = new FormData();
  
  // Add files
  for (const file of files) {
    formData.append('files', file);
  }
  
  // Add other data
  for (const [key, value] of Object.entries(additionalData)) {
    formData.append(key, value);
  }
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
}

// Usage
const result = await uploadFiles(fileInput.files, {
  folder: 'images',
  public: 'true'
});
```

### FormData Event

```javascript
// Modify FormData before submission
form.addEventListener('formdata', (e) => {
  // e.formData is the FormData being constructed
  
  // Add computed fields
  e.formData.append('timestamp', Date.now());
  e.formData.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // Modify existing fields
  const username = e.formData.get('username');
  e.formData.set('username', username.toLowerCase());
  
  // Remove unwanted fields
  e.formData.delete('debug');
});

// formdata event fires when:
// new FormData(form) is called
```

---

## 4.4.8 Gotchas

```javascript
// ❌ Setting Content-Type header manually
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData
});
// Missing boundary! Server can't parse.

// ✅ Let browser set it
fetch(url, {
  method: 'POST',
  body: formData
});

// ❌ Expecting disabled fields in FormData
input.disabled = true;
const formData = new FormData(form);
console.log(formData.has('inputName'));  // false!

// ✅ Use readonly if you need value in FormData
input.readOnly = true;

// ❌ Checking for empty values
if (!formData.get('field')) {
  // Empty string '' is falsy but exists!
}

// ✅ Use has() to check existence
if (!formData.has('field')) {
  // Field truly doesn't exist
}

// ❌ Expecting files to survive JSON conversion
const obj = Object.fromEntries(formData);
// obj.file is "[object File]" string!

// ✅ Handle files separately
const files = formData.getAll('files');
const data = Object.fromEntries(formData);
delete data.files;
```

---

## 4.4.9 Summary

### Creating FormData

| Method | Description |
|--------|-------------|
| `new FormData(form)` | From form element |
| `new FormData(form, submitter)` | Include submit button |
| `new FormData()` | Empty, build manually |

### Reading Methods

| Method | Returns |
|--------|---------|
| `get(name)` | First value or null |
| `getAll(name)` | Array of all values |
| `has(name)` | Boolean |
| `entries()` | Iterator of [key, value] |
| `keys()` | Iterator of keys |
| `values()` | Iterator of values |

### Modifying Methods

| Method | Description |
|--------|-------------|
| `append(name, value)` | Add value (keeps existing) |
| `set(name, value)` | Replace value |
| `delete(name)` | Remove all values for key |

### Sending

| Scenario | Content-Type |
|----------|--------------|
| FormData body | Auto (multipart/form-data) |
| JSON body | application/json |
| URLSearchParams | x-www-form-urlencoded |

### Best Practices

1. **Don't set Content-Type header** — let browser add boundary
2. **Use `has()` to check existence**, not falsy check
3. **Handle disabled vs readonly** — disabled fields excluded
4. **Use `getAll()` for multi-value fields**
5. **Use XHR for upload progress** — fetch doesn't support it
6. **Listen to `formdata` event** for last-minute modifications

---

**End of Chapter 4.4: FormData API**

**End of Group 4: Forms**

Next group: **5. Storage APIs** — covers Web Storage, Cookies, IndexedDB, Cache API, and Storage Manager.
