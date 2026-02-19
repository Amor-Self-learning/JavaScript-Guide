# Module 3: Firefox WebExtensions

Firefox implements the WebExtensions API, which is largely compatible with Chrome's extension APIs. This module covers Firefox-specific features, differences, and APIs.

---

## 3.1 The `browser` Namespace

### Promise-Based API

Firefox uses the `browser` namespace with native Promise support, while Chrome uses `chrome` with callbacks.

```javascript
// Firefox (native Promises)
const tabs = await browser.tabs.query({ active: true });
const data = await browser.storage.local.get('key');

// Chrome (callbacks, or chrome.* with Promises in MV3)
chrome.tabs.query({ active: true }, (tabs) => {
  // callback style
});

// Or with Promises (MV3)
const tabs = await chrome.tabs.query({ active: true });
```

### Polyfill for Cross-Browser

```javascript
// webextension-polyfill provides browser.* for Chrome
// Install: npm install webextension-polyfill

// In your code:
import browser from 'webextension-polyfill';

// Now use browser.* everywhere
const tabs = await browser.tabs.query({ active: true });
await browser.storage.local.set({ key: 'value' });
```

```json
// manifest.json (include polyfill)
{
  "background": {
    "scripts": ["browser-polyfill.min.js", "background.js"]
  },
  "content_scripts": [{
    "js": ["browser-polyfill.min.js", "content.js"],
    "matches": ["<all_urls>"]
  }]
}
```

---

## 3.2 Manifest Differences

### Firefox-Specific Keys

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0",
  
  // Firefox-specific
  "browser_specific_settings": {
    "gecko": {
      "id": "my-extension@example.com",
      "strict_min_version": "109.0",
      "strict_max_version": "120.*"
    }
  },
  
  // Firefox Android support
  "browser_specific_settings": {
    "gecko": {
      "id": "my-extension@example.com"
    },
    "gecko_android": {
      "strict_min_version": "113.0"
    }
  }
}
```

### Background Scripts (MV3)

```json
// Firefox supports both service_worker and scripts
{
  // Option 1: Service worker (Chrome-compatible)
  "background": {
    "service_worker": "background.js",
    "type": "module"  // ES modules supported
  },
  
  // Option 2: Event pages (Firefox also supports)
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  }
}
```

### Host Permissions

```json
{
  // MV3: Split from permissions
  "host_permissions": [
    "https://*.example.com/*",
    "*://localhost/*"
  ],
  
  // Optional host permissions (user grants on demand)
  "optional_host_permissions": [
    "<all_urls>"
  ]
}
```

---

## 3.3 Firefox-Specific APIs

### browser.sidebarAction

```javascript
// Firefox supports sidebar panels
// manifest.json
{
  "sidebar_action": {
    "default_title": "My Sidebar",
    "default_panel": "sidebar.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    }
  },
  "permissions": ["sidebarAction"]
}

// Toggle sidebar
browser.sidebarAction.toggle();

// Set/get panel
await browser.sidebarAction.setPanel({ panel: 'sidebar2.html' });
const panel = await browser.sidebarAction.getPanel({});

// Set/get title
await browser.sidebarAction.setTitle({ title: 'New Title' });

// Open/close
await browser.sidebarAction.open();
await browser.sidebarAction.close();

// Check if open
const isOpen = await browser.sidebarAction.isOpen({});
```

### browser.browserSettings

```javascript
// Control browser-wide settings (with permissions)
{
  "permissions": ["browserSettings"]
}

// Homepage
const homepage = await browser.browserSettings.homepageOverride.get({});
await browser.browserSettings.homepageOverride.set({ value: 'https://example.com' });

// New tab page
await browser.browserSettings.newTabPageOverride.set({ value: 'newtab.html' });

// Cache
await browser.browserSettings.cacheEnabled.set({ value: false });

// Images
await browser.browserSettings.imageAnimationBehavior.get({});
// Returns: 'normal', 'none', or 'once'

// Pop-up blocking
await browser.browserSettings.allowPopupsForUserEvents.set({ value: true });
```

### browser.pkcs11 (Smart Cards/HSM)

```javascript
// Install PKCS#11 module
await browser.pkcs11.installModule('moduleName', 0);

// Check if installed
const isInstalled = await browser.pkcs11.isModuleInstalled('moduleName');

// Get module info
const slots = await browser.pkcs11.getModuleSlots('moduleName');
```

### browser.find

```javascript
// Find-in-page API
{
  "permissions": ["find"]
}

// Search current tab
const results = await browser.find.find('search term', {
  caseSensitive: false,
  entireWord: true,
  includeRangeData: true,
  includeRectData: true
});

console.log(`Found ${results.count} matches`);

// Highlight specific result
await browser.find.highlightResults({
  rangeIndex: 0  // Highlight first result
});

// Remove highlighting
await browser.find.removeHighlighting();
```

### browser.dns

```javascript
// DNS resolution
{
  "permissions": ["dns"]
}

const result = await browser.dns.resolve('example.com', ['canonical_name']);
console.log(result.addresses);  // ['93.184.216.34']
console.log(result.canonicalName);  // 'example.com'
console.log(result.isTRR);  // true if resolved over DNS-over-HTTPS
```

### browser.captivePortal

```javascript
// Detect captive portals (hotel WiFi, etc.)
{
  "permissions": ["captivePortal"]
}

const state = await browser.captivePortal.getState();
// 'unknown', 'not_captive', 'unlocked_portal', 'locked_portal'

browser.captivePortal.onStateChanged.addListener((details) => {
  console.log('Portal state:', details.state);
});

browser.captivePortal.onConnectivityAvailable.addListener((status) => {
  console.log('Connectivity:', status);  // 'captive' or 'clear'
});
```

### browser.userScripts

```javascript
// Register user scripts programmatically
{
  "permissions": ["userScripts"]
}

await browser.userScripts.register([{
  matches: ['*://*.example.com/*'],
  js: [{ file: 'userscript.js' }],
  runAt: 'document_idle',
  cookieStoreId: 'firefox-default'
}]);

// Unregister
await browser.userScripts.unregister();
```

---

## 3.4 Container Tabs (Multi-Account Containers)

```javascript
// Work with container tabs (Firefox feature)
{
  "permissions": ["cookies", "contextualIdentities"]
}

// List containers
const containers = await browser.contextualIdentities.query({});
// Returns: [{ cookieStoreId: 'firefox-container-1', name: 'Personal', color: 'blue', icon: 'fingerprint' }]

// Create container
const container = await browser.contextualIdentities.create({
  name: 'Work',
  color: 'green',
  icon: 'briefcase'
});

// Open tab in container
browser.tabs.create({
  url: 'https://work.example.com',
  cookieStoreId: container.cookieStoreId
});

// Update container
await browser.contextualIdentities.update(container.cookieStoreId, {
  name: 'Work (Main)',
  color: 'orange'
});

// Remove container
await browser.contextualIdentities.remove(container.cookieStoreId);

// Get container for tab
const tab = await browser.tabs.get(tabId);
console.log('Container:', tab.cookieStoreId);

// Events
browser.contextualIdentities.onCreated.addListener((changeInfo) => {
  console.log('Container created:', changeInfo.contextualIdentity);
});

browser.contextualIdentities.onRemoved.addListener((changeInfo) => {
  console.log('Container removed:', changeInfo.contextualIdentity);
});
```

---

## 3.5 Theme API

```javascript
// Dynamic themes
{
  "permissions": ["theme"]
}

// Apply theme
await browser.theme.update({
  colors: {
    frame: '#1c1c22',
    tab_background_text: '#ffffff',
    toolbar: '#2d2d33',
    toolbar_text: '#ffffff',
    toolbar_field: '#42424d',
    toolbar_field_text: '#ffffff',
    tab_line: '#ff6600'
  },
  images: {
    theme_frame: 'images/header.png'
  },
  properties: {
    additional_backgrounds_alignment: ['top'],
    additional_backgrounds_tiling: ['repeat']
  }
});

// Reset to default
await browser.theme.reset();

// Get current theme
const theme = await browser.theme.getCurrent();

// Apply to specific window
await browser.theme.update(windowId, { /* theme */ });

// Theme events
browser.theme.onUpdated.addListener((updateInfo) => {
  console.log('Theme updated:', updateInfo.theme);
  console.log('Window:', updateInfo.windowId);
});
```

### Theme Manifest (Static Theme)

```json
{
  "manifest_version": 3,
  "name": "My Theme",
  "version": "1.0",
  "theme": {
    "colors": {
      "frame": "#1c1c22",
      "tab_background_text": "#fff",
      "toolbar": "#2d2d33",
      "toolbar_text": "#fff"
    },
    "images": {
      "theme_frame": "header.png"
    }
  },
  "theme_experiment": {
    "colors": {
      "popup_highlight": "--arrowpanel-dimmed"
    }
  }
}
```

---

## 3.6 Differences from Chrome

### API Behavior Differences

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Namespace | `chrome.*` | `browser.*` (Promise-based) |
| Promises | MV3 only | Always supported |
| Sidebars | Not supported | `sidebarAction` |
| Container tabs | Not supported | `contextualIdentities` |
| Theme API | Limited | Full dynamic theming |
| User scripts | Limited | `userScripts` API |
| Event pages | Deprecated | Still supported |

### Manifest Differences

```json
// Chrome-only
{
  "minimum_chrome_version": "88"
}

// Firefox-only
{
  "browser_specific_settings": {
    "gecko": {
      "id": "addon@example.com",
      "strict_min_version": "109.0"
    }
  }
}
```

### Permission Differences

```javascript
// Firefox requires explicit permission for some APIs
{
  "permissions": [
    "contextualIdentities",  // Container tabs (Firefox)
    "dns",                    // DNS resolution (Firefox)
    "find",                   // Find in page (Firefox)
    "pkcs11",                 // Smart cards (Firefox)
    "browserSettings",        // Browser settings (Firefox)
    "sidebarAction"           // Sidebar (Firefox)
  ]
}
```

### Content Security Policy

```json
// Firefox is stricter with CSP
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}

// Chrome allows 'wasm-unsafe-eval' more permissively
```

---

## 3.7 Firefox for Android

```json
// Enable for Android
{
  "browser_specific_settings": {
    "gecko_android": {
      "strict_min_version": "113.0"
    }
  }
}
```

### Android-Specific Considerations

```javascript
// Check if running on Android
const platformInfo = await browser.runtime.getPlatformInfo();
const isAndroid = platformInfo.os === 'android';

if (isAndroid) {
  // Adapt UI for mobile
  // - No sidebar support
  // - Limited popup size
  // - Touch-friendly interface needed
}

// pageAction preferred over browserAction on Android
{
  "page_action": {
    "default_popup": "popup.html",
    "default_icon": "icons/icon.png"
  }
}
```

---

## 3.8 Debugging Firefox Extensions

### Temporary Installation

1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select any file in your extension directory

### Remote Debugging

```javascript
// Enable in about:config
// devtools.chrome.enabled = true
// devtools.debugger.remote-enabled = true

// Connect to Android device:
// adb forward tcp:6000 localfilesystem:/data/data/org.mozilla.firefox/files/mozilla/debugging-socket
```

### Console Access

```javascript
// Extension console
// about:debugging → Extension → Inspect

// Content script console
// Regular DevTools Console (select correct context)

// Browser console (all extension logs)
// Ctrl+Shift+J or Menu → Developer → Browser Console
```

### Common Debugging Tools

```javascript
// Log to browser console
console.log('[MyExtension]', data);

// Check for errors
browser.runtime.lastError  // In callbacks (rare in Firefox)

// Storage inspector
const data = await browser.storage.local.get(null);
console.table(data);

// Inspect permissions
const permissions = await browser.permissions.getAll();
console.log('Permissions:', permissions);
```

---

## 3.9 Publishing to Firefox Add-ons (AMO)

### Signing Requirements

- All extensions must be signed by Mozilla
- Listed extensions: Submit to AMO for review
- Self-distributed: Use AMO signing API

### web-ext Tool

```bash
# Install
npm install -g web-ext

# Run extension in Firefox
web-ext run

# Run with specific Firefox profile
web-ext run --firefox-profile=my-profile

# Lint extension
web-ext lint

# Build for submission
web-ext build

# Sign extension
web-ext sign --api-key=YOUR_KEY --api-secret=YOUR_SECRET
```

### AMO Submission Checklist

1. **Unique ID**: Set `browser_specific_settings.gecko.id`
2. **Version**: Increment for each upload
3. **Source code**: Provide if using build tools
4. **Permissions**: Justify each permission in notes
5. **Privacy policy**: Required if collecting data

---

## 3.10 Summary

| Feature | Description |
|---------|-------------|
| `browser.*` | Promise-based API namespace |
| Polyfill | Use `webextension-polyfill` for cross-browser |
| Containers | `contextualIdentities` for multi-account |
| Themes | Full dynamic theming API |
| Sidebars | `sidebarAction` for persistent panels |
| User Scripts | `userScripts` API for dynamic script registration |
| Android | Supported with `gecko_android` settings |
| Signing | Required for all extensions |
| `web-ext` | CLI tool for development and publishing |

### Best Practices

1. **Use webextension-polyfill** for Chrome compatibility
2. **Set gecko.id** for consistent extension identity
3. **Test in Firefox Nightly** for upcoming changes
4. **Use web-ext** for development workflow
5. **Handle Promise rejections** properly
6. **Test container tab behavior** if using cookies

---

**End of Module 3: Firefox WebExtensions**

Next: Module 4 — Extension Development Workflow
