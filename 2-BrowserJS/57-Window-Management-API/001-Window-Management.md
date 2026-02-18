# 57.1 Window Management API

The Window Management API enables multi-screen window placement.

---

## 57.1.1 Get Screen Details

```javascript
const screenDetails = await window.getScreenDetails();

console.log('Screens:', screenDetails.screens.length);
console.log('Current:', screenDetails.currentScreen);

for (const screen of screenDetails.screens) {
  console.log(screen.label, screen.width, screen.height);
  console.log('Position:', screen.left, screen.top);
  console.log('Primary:', screen.isPrimary);
}
```

---

## 57.1.2 Monitor Changes

```javascript
screenDetails.addEventListener('screenschange', () => {
  console.log('Screen configuration changed');
});

screenDetails.addEventListener('currentscreenchange', () => {
  console.log('Current screen changed');
});
```

---

## 57.1.3 Position Windows

```javascript
const screens = await window.getScreenDetails();
const secondScreen = screens.screens[1];

if (secondScreen) {
  const popup = window.open('', '', 
    `left=${secondScreen.left},top=${secondScreen.top},width=800,height=600`
  );
}
```

---

## 57.1.4 Fullscreen on Specific Screen

```javascript
const screens = await window.getScreenDetails();
const targetScreen = screens.screens[1];

await document.body.requestFullscreen({
  screen: targetScreen
});
```

---

## 57.1.5 Permission

```javascript
const permission = await navigator.permissions.query({
  name: 'window-management'
});

if (permission.state === 'granted') {
  // Can use window management
}
```

---

## 57.1.6 Summary

| Property | Description |
|----------|-------------|
| `screens` | Array of screens |
| `currentScreen` | Current screen |
| `screen.left/top` | Screen position |
| `screen.width/height` | Screen dimensions |
| `screen.isPrimary` | Is primary display |
| `screen.label` | Screen name |

---

**End of Chapter 57.1: Window Management API**

This completes Group 57 — the final group of the BrowserJS section.
