# 49.1 Document Picture-in-Picture

Document Picture-in-Picture allows any HTML content in a floating window, not just video.

---

## 49.1.1 Check Support

```javascript
if (!('documentPictureInPicture' in window)) {
  console.log('Document PiP not supported');
}
```

---

## 49.1.2 Open Window

```javascript
const pipWindow = await documentPictureInPicture.requestWindow({
  width: 400,
  height: 300
});
```

---

## 49.1.3 Add Content

```javascript
// Add styles
const style = document.createElement('style');
style.textContent = `
  body { font-family: system-ui; padding: 16px; }
`;
pipWindow.document.head.appendChild(style);

// Add content
const content = document.createElement('div');
content.innerHTML = '<h1>Mini Player</h1><button>Play</button>';
pipWindow.document.body.appendChild(content);
```

---

## 49.1.4 Move Existing Element

```javascript
const player = document.getElementById('player');

// Move to PiP window
pipWindow.document.body.appendChild(player);

// Move back on close
pipWindow.addEventListener('pagehide', () => {
  document.body.appendChild(player);
});
```

---

## 49.1.5 Summary

| Method | Description |
|--------|-------------|
| `requestWindow()` | Open PiP window |
| `pipWindow.document` | Window's document |
| `pagehide` event | Window closed |

---

**End of Chapter 49.1: Document Picture-in-Picture**

This completes Group 49. Next: **Group 50 — View Transitions API**.
