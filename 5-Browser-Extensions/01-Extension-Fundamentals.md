# Module 1: Extension Fundamentals

Browser extensions extend browser functionality with custom features. This module covers the core architecture and components of modern Manifest V3 extensions.

---

## 1.1 Extension Architecture

### What It Is

Browser extensions are small programs that modify and enhance browser functionality. They consist of several components that work together:

```
Extension Architecture
┌─────────────────────────────────────────────────────────┐
│                    Extension Package                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  manifest   │  │  Background │  │ Content Scripts │  │
│  │   .json     │  │   Service   │  │ (injected into  │  │
│  │             │  │   Worker    │  │   web pages)    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   Popup     │  │   Options   │  │   Extension     │  │
│  │   Page      │  │   Page      │  │   Pages         │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Components Overview

| Component | Purpose | Execution Context |
|-----------|---------|-------------------|
| Manifest | Configuration and metadata | N/A (JSON) |
| Service Worker | Background processing, event handling | Extension context |
| Content Scripts | Interact with web pages | Web page context (isolated) |
| Popup | User interface from toolbar | Extension context |
| Options Page | Settings UI | Extension context |

### Communication Flow

```javascript
// Message passing between components
// Content Script → Background
chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
  console.log('Received:', response);
});

// Background → Content Script
chrome.tabs.sendMessage(tabId, { action: 'updateUI' }, (response) => {
  console.log('Content script responded:', response);
});

// Popup → Background
chrome.runtime.sendMessage({ action: 'getState' });

// Long-lived connections
const port = chrome.runtime.connect({ name: 'myChannel' });
port.postMessage({ greeting: 'hello' });
port.onMessage.addListener((msg) => {
  console.log('Received:', msg);
});
```

---

## 1.2 Manifest File

### What It Is

The `manifest.json` file is the heart of every extension. It declares metadata, permissions, and components.

### Manifest V3 Structure

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "A helpful browser extension",
  
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  
  "action": {
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png"
    },
    "default_title": "Click to open",
    "default_popup": "popup.html"
  },
  
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*"],
      "js": ["content.js"],
      "css": ["content.css"],
      "run_at": "document_idle"
    }
  ],
  
  "permissions": [
    "storage",
    "activeTab",
    "alarms"
  ],
  
  "host_permissions": [
    "https://*.example.com/*"
  ],
  
  "optional_permissions": [
    "tabs",
    "bookmarks"
  ],
  
  "optional_host_permissions": [
    "https://*.other-site.com/*"
  ],
  
  "web_accessible_resources": [
    {
      "resources": ["images/*", "styles/*"],
      "matches": ["https://*.example.com/*"]
    }
  ],
  
  "options_page": "options.html",
  
  "options_ui": {
    "page": "options.html",
    "open_in_tab": false
  },
  
  "commands": {
    "_execute_action": {
      "suggested_key": {
        "default": "Ctrl+Shift+Y",
        "mac": "Command+Shift+Y"
      },
      "description": "Open the popup"
    },
    "toggle-feature": {
      "suggested_key": {
        "default": "Ctrl+Shift+F"
      },
      "description": "Toggle feature"
    }
  },
  
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'"
  }
}
```

### Key Differences: MV3 vs MV2

| Feature | Manifest V3 | Manifest V2 (Deprecated) |
|---------|-------------|--------------------------|
| Background | Service worker | Background page/scripts |
| Script injection | `chrome.scripting` | `chrome.tabs.executeScript` |
| Permissions | Split host_permissions | Combined permissions |
| Web request | `declarativeNetRequest` | `webRequest` (blocking) |
| Remote code | Not allowed | Allowed |
| CSP | More restrictive | More flexible |

### Permissions

```json
// Commonly used permissions
{
  "permissions": [
    // Storage access
    "storage",           // chrome.storage API
    
    // Tab-related
    "activeTab",         // Access to current tab when user invokes extension
    "tabs",              // Full tab access (URL, title, etc.)
    
    // UI features
    "notifications",     // chrome.notifications API
    "contextMenus",      // chrome.contextMenus API
    "alarms",            // chrome.alarms API
    
    // System access
    "cookies",           // chrome.cookies API
    "downloads",         // chrome.downloads API
    "history",           // chrome.history API
    "bookmarks",         // chrome.bookmarks API
    
    // Network
    "declarativeNetRequest"  // Network request modification
  ],
  
  "host_permissions": [
    // Access to specific sites
    "https://*.google.com/*",
    "https://api.example.com/*",
    
    // All URLs (requires justification)
    "<all_urls>"
  ]
}
```

### Gotchas

```json
// ❌ Wrong: Using MV2 syntax in MV3
{
  "background": {
    "scripts": ["background.js"],  // MV2 syntax
    "persistent": false
  }
}

// ✅ Correct: MV3 service worker
{
  "background": {
    "service_worker": "background.js"
  }
}

// ❌ Wrong: Overly broad permissions
{
  "permissions": ["<all_urls>", "tabs", "history", "cookies"]
}

// ✅ Correct: Minimal permissions with optional
{
  "permissions": ["storage", "activeTab"],
  "optional_permissions": ["tabs"],
  "host_permissions": ["https://specific-site.com/*"]
}
```

---

## 1.3 Content Scripts

### What It Is

Content scripts are JavaScript files that run in the context of web pages. They can read and modify the DOM but are isolated from the page's JavaScript.

### Injection Methods

```json
// Method 1: Declarative (manifest.json)
{
  "content_scripts": [
    {
      "matches": ["https://*.example.com/*", "https://site.org/*"],
      "exclude_matches": ["*://example.com/admin/*"],
      "js": ["content.js", "helpers.js"],
      "css": ["styles.css"],
      "run_at": "document_idle",
      "all_frames": false,
      "match_about_blank": false
    }
  ]
}
```

```javascript
// Method 2: Programmatic (from service worker)
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content.js']
});

// Or with inline function
chrome.scripting.executeScript({
  target: { tabId: tabId, allFrames: true },
  func: (color) => {
    document.body.style.backgroundColor = color;
  },
  args: ['#ff0000']
});

// Inject CSS programmatically
chrome.scripting.insertCSS({
  target: { tabId: tabId },
  css: 'body { background: yellow !important; }'
});
```

### run_at Options

| Value | When Script Runs |
|-------|------------------|
| `document_start` | Before DOM construction |
| `document_end` | After DOM complete, before images/subresources |
| `document_idle` | After `DOMContentLoaded` or timeout (default) |

### Content Script Example

```javascript
// content.js
(function() {
  'use strict';
  
  // DOM manipulation
  const headlines = document.querySelectorAll('h1, h2, h3');
  headlines.forEach(h => {
    h.style.color = '#4CAF50';
  });
  
  // Listen for messages from background/popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageInfo') {
      sendResponse({
        title: document.title,
        url: window.location.href,
        headlineCount: headlines.length
      });
    }
    
    if (request.action === 'highlightText') {
      highlightText(request.text);
      sendResponse({ success: true });
    }
    
    // Return true for async response
    return true;
  });
  
  function highlightText(text) {
    const regex = new RegExp(`(${text})`, 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    while (walker.nextNode()) {
      if (regex.test(walker.currentNode.textContent)) {
        textNodes.push(walker.currentNode);
      }
    }
    
    textNodes.forEach(node => {
      const span = document.createElement('span');
      span.innerHTML = node.textContent.replace(
        regex,
        '<mark>$1</mark>'
      );
      node.parentNode.replaceChild(span, node);
    });
  }
  
  // Send message to background
  chrome.runtime.sendMessage({
    action: 'pageLoaded',
    url: window.location.href
  });
})();
```

### Isolated World

```javascript
// Content scripts run in an "isolated world"
// They share the DOM but NOT JavaScript variables

// ❌ Cannot access page's JavaScript
console.log(window.pageVariable);  // undefined

// ✅ Can access and modify DOM
document.body.classList.add('extension-active');

// To communicate with page scripts, use custom events:
// In content script:
window.addEventListener('fromPage', (e) => {
  console.log('Page says:', e.detail);
});

// Inject script to run in page context
const script = document.createElement('script');
script.textContent = `
  window.dispatchEvent(new CustomEvent('fromPage', {
    detail: { data: window.somePageVariable }
  }));
`;
document.head.appendChild(script);
script.remove();
```

---

## 1.4 Background Service Workers

### What It Is

The service worker is the extension's event handler. In MV3, it replaces persistent background pages with an event-driven model that terminates when idle.

### Service Worker Lifecycle

```javascript
// background.js (service worker)

// Install event - runs once when extension is installed/updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Extension installed');
    // Set default settings
    chrome.storage.local.set({ enabled: true, theme: 'light' });
  } else if (details.reason === 'update') {
    console.log('Extension updated from', details.previousVersion);
  }
});

// Startup event - runs when browser starts (if extension is enabled)
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started');
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message from:', sender.tab ? sender.tab.url : 'extension');
  
  if (request.action === 'fetchData') {
    // Async operation
    fetchData(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;  // Keep channel open for async response
  }
  
  if (request.action === 'getState') {
    sendResponse({ state: currentState });
  }
});

// External message handling (from web pages or other extensions)
chrome.runtime.onMessageExternal.addListener(
  (request, sender, sendResponse) => {
    // Verify sender
    if (sender.url.startsWith('https://trusted-site.com')) {
      // Handle request
      sendResponse({ allowed: true });
    }
  }
);
```

### Persistence Strategies

```javascript
// Service workers terminate after ~30 seconds of inactivity
// Use these strategies to maintain state:

// 1. Use chrome.storage for persistent data
chrome.storage.local.set({ key: 'value' });
chrome.storage.local.get(['key'], (result) => {
  console.log(result.key);
});

// 2. Use alarms to wake up periodically
chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Perform periodic task
  }
});

// 3. Re-register event listeners on startup
chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

chrome.runtime.onInstalled.addListener(() => {
  initializeExtension();
});

function initializeExtension() {
  // Set up context menus
  chrome.contextMenus.create({
    id: 'myMenu',
    title: 'My Extension Action',
    contexts: ['selection']
  });
  
  // Load state from storage
  chrome.storage.local.get(['settings'], (result) => {
    applySettings(result.settings);
  });
}
```

### Gotchas

```javascript
// ❌ Wrong: Using global state that won't persist
let userData = {};  // Lost when service worker terminates

// ✅ Correct: Use storage for persistent state
chrome.storage.session.get(['userData'], (result) => {
  const userData = result.userData || {};
});

// ❌ Wrong: Long-running operations without keepalive
async function processLargeData() {
  // May terminate mid-process
  for (const item of largeArray) {
    await processItem(item);
  }
}

// ✅ Correct: Use chrome.offscreen or break into chunks
chrome.alarms.create('processChunk', { when: Date.now() + 100 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'processChunk') {
    processNextChunk();
  }
});

// ❌ Wrong: DOM APIs in service worker
document.querySelector('#element');  // Error: document is not defined

// ✅ Correct: Service workers have no DOM
// Use chrome.offscreen API for DOM operations
```

---

## 1.5 Popup and Options Pages

### Popup Page

```html
<!-- popup.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      width: 300px;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }
    .btn {
      padding: 8px 16px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn:hover {
      background: #45a049;
    }
    .status {
      margin-top: 16px;
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h2>My Extension</h2>
  <button id="actionBtn" class="btn">Run Action</button>
  <div id="status" class="status">Ready</div>
  <script src="popup.js"></script>
</body>
</html>
```

```javascript
// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const actionBtn = document.getElementById('actionBtn');
  const status = document.getElementById('status');
  
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Load saved state
  const { enabled } = await chrome.storage.local.get(['enabled']);
  updateUI(enabled);
  
  actionBtn.addEventListener('click', async () => {
    try {
      // Send message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getPageInfo'
      });
      
      status.textContent = `Found ${response.headlineCount} headlines`;
    } catch (error) {
      status.textContent = 'Error: ' + error.message;
    }
  });
  
  function updateUI(enabled) {
    actionBtn.textContent = enabled ? 'Disable' : 'Enable';
  }
});
```

### Options Page

```html
<!-- options.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      max-width: 600px;
      margin: 40px auto;
      padding: 20px;
      font-family: system-ui, sans-serif;
    }
    .setting {
      margin: 20px 0;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
    }
    select, input[type="text"] {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .save-btn {
      padding: 12px 24px;
      background: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .saved {
      color: #4CAF50;
      margin-left: 12px;
    }
  </style>
</head>
<body>
  <h1>Extension Settings</h1>
  
  <div class="setting">
    <label>
      <input type="checkbox" id="enabled">
      <span>Enable extension</span>
    </label>
  </div>
  
  <div class="setting">
    <label>
      <span>Theme:</span>
      <select id="theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  </div>
  
  <div class="setting">
    <label>
      <span>API Key:</span>
      <input type="text" id="apiKey" placeholder="Enter API key">
    </label>
  </div>
  
  <button id="saveBtn" class="save-btn">Save Settings</button>
  <span id="savedMsg" class="saved" style="display: none;">✓ Saved</span>
  
  <script src="options.js"></script>
</body>
</html>
```

```javascript
// options.js
document.addEventListener('DOMContentLoaded', async () => {
  const enabledCheckbox = document.getElementById('enabled');
  const themeSelect = document.getElementById('theme');
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const savedMsg = document.getElementById('savedMsg');
  
  // Load current settings
  const settings = await chrome.storage.sync.get({
    enabled: true,
    theme: 'light',
    apiKey: ''
  });
  
  enabledCheckbox.checked = settings.enabled;
  themeSelect.value = settings.theme;
  apiKeyInput.value = settings.apiKey;
  
  // Save settings
  saveBtn.addEventListener('click', async () => {
    await chrome.storage.sync.set({
      enabled: enabledCheckbox.checked,
      theme: themeSelect.value,
      apiKey: apiKeyInput.value
    });
    
    // Show saved message
    savedMsg.style.display = 'inline';
    setTimeout(() => {
      savedMsg.style.display = 'none';
    }, 2000);
    
    // Notify background of settings change
    chrome.runtime.sendMessage({ action: 'settingsUpdated' });
  });
});
```

---

## 1.6 Summary

| Component | Purpose | Key APIs |
|-----------|---------|----------|
| Manifest | Configuration | N/A (JSON file) |
| Service Worker | Event handling, background tasks | `chrome.runtime`, `chrome.alarms` |
| Content Scripts | Web page interaction | DOM APIs, `chrome.runtime.sendMessage` |
| Popup | Toolbar UI | DOM APIs, `chrome.tabs` |
| Options | Settings UI | `chrome.storage` |

### Best Practices

1. **Request minimal permissions** — Only ask for what you need
2. **Use `activeTab`** — Avoids broad host permissions
3. **Persist state properly** — Service workers terminate; use storage
4. **Handle errors gracefully** — Content scripts may fail on restricted pages
5. **Use MV3** — MV2 is deprecated and being phased out
6. **Validate messages** — Check message structure before processing

---

**End of Module 1: Extension Fundamentals**

Next: Module 2 — Chrome Extension APIs
