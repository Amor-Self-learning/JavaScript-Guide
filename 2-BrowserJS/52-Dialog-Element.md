# 52.1 Dialog Element

The `<dialog>` element provides native modal and non-modal dialog support.

---

## 52.1.1 Basic Dialog

```html
<dialog id="my-dialog">
  <h2>Dialog Title</h2>
  <p>Dialog content here.</p>
  <button onclick="this.closest('dialog').close()">Close</button>
</dialog>

<button onclick="document.getElementById('my-dialog').showModal()">
  Open Dialog
</button>
```

---

## 52.1.2 Modal vs Non-Modal

```javascript
const dialog = document.getElementById('my-dialog');

// Modal (with backdrop, traps focus)
dialog.showModal();

// Non-modal (no backdrop)
dialog.show();

// Close
dialog.close();
dialog.close('return-value');  // With return value
```

---

## 52.1.3 Return Value

```javascript
dialog.addEventListener('close', () => {
  console.log('Return value:', dialog.returnValue);
});

// Set via close()
dialog.close('submitted');

// Or via form
<form method="dialog">
  <button value="cancel">Cancel</button>
  <button value="confirm">Confirm</button>
</form>
```

---

## 52.1.4 Events

```javascript
dialog.addEventListener('close', () => {
  console.log('Dialog closed');
});

dialog.addEventListener('cancel', (event) => {
  // Escape key pressed
  event.preventDefault();  // Optional: prevent closing
});
```

---

## 52.1.5 Styling

```css
dialog {
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 400px;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

dialog[open] {
  animation: fade-in 0.3s;
}
```

---

## 52.1.6 Summary

| Method | Description |
|--------|-------------|
| `show()` | Open non-modal |
| `showModal()` | Open modal |
| `close(value?)` | Close dialog |
| `returnValue` | Get return value |

---

**End of Chapter 52.1: Dialog Element**

This completes Group 52. Next: **Group 53 — Content Security Policy API**.
