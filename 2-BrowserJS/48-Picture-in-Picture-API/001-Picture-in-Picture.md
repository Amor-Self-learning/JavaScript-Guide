# 48.1 Picture-in-Picture

The Picture-in-Picture API allows video to play in a floating window.

---

## 48.1.1 Check Support

```javascript
if (!document.pictureInPictureEnabled) {
  console.log('PiP not supported');
}

// Check if element supports PiP
if (video.disablePictureInPicture) {
  console.log('PiP disabled for this video');
}
```

---

## 48.1.2 Enter Picture-in-Picture

```javascript
const video = document.getElementById('video');

async function enterPiP() {
  try {
    await video.requestPictureInPicture();
  } catch (error) {
    console.error('Failed to enter PiP:', error);
  }
}
```

---

## 48.1.3 Exit Picture-in-Picture

```javascript
if (document.pictureInPictureElement) {
  await document.exitPictureInPicture();
}
```

---

## 48.1.4 Events

```javascript
video.addEventListener('enterpictureinpicture', (event) => {
  const pipWindow = event.pictureInPictureWindow;
  console.log('PiP size:', pipWindow.width, pipWindow.height);
});

video.addEventListener('leavepictureinpicture', () => {
  console.log('Left PiP');
});

// Window resize
pipWindow.addEventListener('resize', (event) => {
  console.log('New size:', event.target.width, event.target.height);
});
```

---

## 48.1.5 Summary

| Property/Method | Description |
|-----------------|-------------|
| `requestPictureInPicture()` | Enter PiP |
| `exitPictureInPicture()` | Exit PiP |
| `pictureInPictureElement` | Current PiP element |
| `pictureInPictureEnabled` | Is PiP available |

---

**End of Chapter 48.1: Picture-in-Picture**

This completes Group 48. Next: **Group 49 — Document Picture-in-Picture API**.
