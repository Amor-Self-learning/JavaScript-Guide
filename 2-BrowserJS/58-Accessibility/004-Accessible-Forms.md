# 58.4 Accessible Forms

Forms must be usable by all users including those with assistive technologies.

---

## 58.4.1 Labels

### Explicit Labels

```html
<label for="name">Name</label>
<input id="name" type="text">
```

### Implicit Labels

```html
<label>
  Name
  <input type="text">
</label>
```

---

## 58.4.2 Required Fields

```html
<label for="email">
  Email <span aria-hidden="true">*</span>
</label>
<input id="email" type="email" aria-required="true" required>
```

---

## 58.4.3 Error Messages

### Associate Errors

```html
<label for="email">Email</label>
<input 
  id="email" 
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
>
<p id="email-error" role="alert">
  Please enter a valid email address
</p>
```

### Error Summary

```html
<div role="alert" aria-labelledby="error-heading">
  <h2 id="error-heading">Please fix the following errors:</h2>
  <ul>
    <li><a href="#email">Email is required</a></li>
    <li><a href="#password">Password too short</a></li>
  </ul>
</div>
```

---

## 58.4.4 Field Groups

```html
<fieldset>
  <legend>Shipping Address</legend>
  <label for="street">Street</label>
  <input id="street" type="text">
  <!-- More fields -->
</fieldset>

<!-- Radio/Checkbox groups -->
<fieldset>
  <legend>Payment Method</legend>
  <input type="radio" id="card" name="payment">
  <label for="card">Credit Card</label>
  <input type="radio" id="paypal" name="payment">
  <label for="paypal">PayPal</label>
</fieldset>
```

---

## 58.4.5 Input Hints

```html
<label for="dob">Date of Birth</label>
<input 
  id="dob" 
  type="text"
  aria-describedby="dob-format"
  placeholder="MM/DD/YYYY"
>
<p id="dob-format">Format: MM/DD/YYYY</p>
```

---

## 58.4.6 Summary

| Requirement | Implementation |
|-------------|----------------|
| Labels | `<label>` with `for` attribute |
| Required fields | `aria-required` + `required` |
| Errors | `aria-invalid` + `aria-describedby` |
| Groups | `<fieldset>` + `<legend>` |
| Hints | `aria-describedby` |

---

**End of Chapter 58.4: Accessible Forms**

Next: **58.5 Accessible Components**.
