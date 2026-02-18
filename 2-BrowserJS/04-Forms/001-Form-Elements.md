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
