# 10.1 Web App Manifest

The Web App Manifest is a JSON file that defines how a Progressive Web App (PWA) appears when installed on a user's device. This chapter covers manifest structure, icons, display modes, and installation configuration.

---

## 10.1.1 Manifest Overview

### What Is a Web App Manifest?

```javascript
// The manifest.json file:
// - Defines app name, icons, colors
// - Controls how app appears when installed
// - Enables "Add to Home Screen"
// - Makes app installable
// - Provides native-like experience
```

### Basic Manifest

```json
{
  "name": "My Progressive Web App",
  "short_name": "MyPWA",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3f51b5",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Linking Manifest

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Link manifest in HTML head -->
  <link rel="manifest" href="/manifest.json">
  
  <!-- Also set theme color for browsers -->
  <meta name="theme-color" content="#3f51b5">
</head>
</html>
```

---

## 10.1.2 Core Properties

### Name Properties

```json
{
  "name": "My Progressive Web Application",
  "short_name": "MyPWA"
}
```

```javascript
// name: Full application name
// - Used on install prompts
// - Used on splash screens
// - Maximum ~45 characters recommended

// short_name: Abbreviated name
// - Used on home screen
// - Used where space is limited
// - Maximum ~12 characters recommended
```

### Start URL

```json
{
  "start_url": "/",
  "scope": "/"
}
```

```javascript
// start_url: URL opened when app launches
// - Can include query parameters for analytics
// - Example: "/?utm_source=homescreen"

// scope: Defines navigation scope
// - URLs outside scope open in browser
// - Defaults to start_url directory
```

### Description

```json
{
  "description": "A progressive web app for managing tasks efficiently.",
  "categories": ["productivity", "utilities"]
}
```

---

## 10.1.3 Icons

### Required Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon-72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Maskable Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-any.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-both.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

```javascript
// purpose values:
// - "any": Default, used anywhere
// - "maskable": Safe zone icon for adaptive icons
// - "monochrome": Single-color icon

// Maskable icons should have important content
// within the center 80% (safe zone)
```

### SVG Icons

```json
{
  "icons": [
    {
      "src": "/icons/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## 10.1.4 Display Modes

### Available Modes

```json
{
  "display": "standalone"
}
```

| Mode | Description |
|------|-------------|
| `fullscreen` | No browser UI, fills entire screen |
| `standalone` | App-like window, no browser chrome |
| `minimal-ui` | Minimal navigation controls |
| `browser` | Standard browser tab |

### Display Mode Detection

```css
/* CSS media queries for display mode */
@media (display-mode: standalone) {
  /* Styles for installed PWA */
  .browser-only {
    display: none;
  }
}

@media (display-mode: browser) {
  /* Styles for browser tab */
  .install-prompt {
    display: block;
  }
}
```

```javascript
// JavaScript detection
function isInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;  // iOS Safari
}
```

### Display Override

```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"]
}
```

---

## 10.1.5 Colors

### Theme and Background

```json
{
  "theme_color": "#3f51b5",
  "background_color": "#ffffff"
}
```

```javascript
// theme_color:
// - Browser toolbar color
// - Task switcher color
// - Status bar color

// background_color:
// - Splash screen background
// - Loading screen before CSS loads
// - Should match app background
```

### Dynamic Theme Color

```html
<!-- Can be changed per page -->
<meta name="theme-color" content="#3f51b5">

<!-- With media queries -->
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
```

---

## 10.1.6 Orientation

### Screen Orientation

```json
{
  "orientation": "portrait"
}
```

| Value | Description |
|-------|-------------|
| `any` | Any orientation |
| `natural` | Natural for device |
| `portrait` | Portrait only |
| `portrait-primary` | Primary portrait |
| `portrait-secondary` | Upside-down portrait |
| `landscape` | Landscape only |
| `landscape-primary` | Primary landscape |
| `landscape-secondary` | Secondary landscape |

---

## 10.1.7 Shortcuts

### App Shortcuts

```json
{
  "shortcuts": [
    {
      "name": "New Task",
      "short_name": "New",
      "description": "Create a new task",
      "url": "/tasks/new",
      "icons": [
        {
          "src": "/icons/new-task.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Today's Tasks",
      "short_name": "Today",
      "description": "View today's tasks",
      "url": "/tasks/today",
      "icons": [
        {
          "src": "/icons/today.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

```javascript
// Shortcuts appear on:
// - Long press on Android
// - Right-click on desktop
// - Jump lists on Windows
```

---

## 10.1.8 Screenshots

### App Screenshots

```json
{
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Home screen showing task list"
    },
    {
      "src": "/screenshots/mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile view of tasks"
    }
  ]
}
```

---

## 10.1.9 Related Applications

### Native App Links

```json
{
  "prefer_related_applications": false,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    },
    {
      "platform": "itunes",
      "url": "https://apps.apple.com/app/example-app/id123456789"
    }
  ]
}
```

---

## 10.1.10 Advanced Features

### Share Target

```json
{
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### Protocol Handlers

```json
{
  "protocol_handlers": [
    {
      "protocol": "web+myapp",
      "url": "/open?url=%s"
    }
  ]
}
```

### File Handlers

```json
{
  "file_handlers": [
    {
      "action": "/open-file",
      "accept": {
        "text/plain": [".txt"],
        "application/json": [".json"]
      }
    }
  ]
}
```

---

## 10.1.11 Complete Example

### Full Manifest

```json
{
  "name": "Task Manager PWA",
  "short_name": "Tasks",
  "description": "A progressive web app for managing tasks",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "#6200ee",
  "background_color": "#ffffff",
  "lang": "en",
  "dir": "ltr",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "New Task",
      "url": "/new",
      "icons": [{ "src": "/icons/new.png", "sizes": "192x192" }]
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/wide.png",
      "sizes": "1280x720",
      "form_factor": "wide"
    }
  ],
  "categories": ["productivity"]
}
```

---

## 10.1.12 Summary

### Required Fields

| Field | Purpose |
|-------|---------|
| `name` | App name |
| `icons` | App icons (192x192, 512x512 minimum) |
| `start_url` | Launch URL |
| `display` | Display mode |

### Recommended Fields

| Field | Purpose |
|-------|---------|
| `short_name` | Abbreviated name |
| `theme_color` | Browser chrome color |
| `background_color` | Splash screen background |
| `description` | App description |

### Best Practices

1. **Provide multiple icon sizes** for all devices
2. **Include maskable icons** for adaptive icon shapes
3. **Set theme_color** matching your app's brand
4. **Test on multiple devices** and browsers
5. **Validate manifest** using Chrome DevTools
6. **Use absolute URLs** when possible

---

**End of Chapter 10.1: Web App Manifest**

Next chapter: **10.2 Service Worker Strategies** — covers caching strategies for PWAs.
