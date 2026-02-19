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
# Module 2: Chrome Extension APIs

Chrome provides extensive APIs for extensions to interact with the browser. This module covers the most commonly used APIs for building powerful extensions.

---

## 2.1 chrome.action

### What It Is

The Action API controls the extension's toolbar icon, including its appearance, badge, and popup behavior.

### Basic Usage

```javascript
// Set icon dynamically
chrome.action.setIcon({
  path: {
    16: 'icons/active-16.png',
    32: 'icons/active-32.png'
  },
  tabId: tabId  // Optional: per-tab icon
});

// Set badge text
chrome.action.setBadgeText({
  text: '5',
  tabId: tabId  // Optional
});

// Set badge color
chrome.action.setBadgeBackgroundColor({
  color: '#FF0000'  // or [255, 0, 0, 255]
});

// Set tooltip
chrome.action.setTitle({
  title: 'Click to activate (5 items)',
  tabId: tabId
});

// Enable/disable the action
chrome.action.enable(tabId);
chrome.action.disable(tabId);

// Get current state
const title = await chrome.action.getTitle({ tabId });
const popup = await chrome.action.getPopup({ tabId });
const badgeText = await chrome.action.getBadgeText({ tabId });
```

### Click Handler (No Popup)

```javascript
// If no popup is set, handle clicks in service worker
chrome.action.onClicked.addListener((tab) => {
  // Toggle extension state
  chrome.storage.local.get(['enabled'], (result) => {
    const newState = !result.enabled;
    chrome.storage.local.set({ enabled: newState });
    
    // Update icon
    chrome.action.setIcon({
      path: newState ? 'icons/on.png' : 'icons/off.png',
      tabId: tab.id
    });
    
    // Execute content script
    if (newState) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    }
  });
});
```

---

## 2.2 chrome.tabs

### What It Is

The Tabs API provides methods to create, modify, and query browser tabs.

### Querying Tabs

```javascript
// Get current active tab
const [tab] = await chrome.tabs.query({
  active: true,
  currentWindow: true
});
console.log(tab.url, tab.title);

// Get all tabs in current window
const tabs = await chrome.tabs.query({
  currentWindow: true
});

// Query by URL pattern
const googleTabs = await chrome.tabs.query({
  url: '*://*.google.com/*'
});

// Query options
const tabs = await chrome.tabs.query({
  active: true,           // Currently focused
  currentWindow: true,    // In current window
  lastFocusedWindow: true,// In last focused window
  pinned: false,          // Not pinned
  audible: true,          // Playing audio
  muted: false,           // Not muted
  status: 'complete',     // Loading status
  windowType: 'normal',   // Window type
  url: '<pattern>'        // URL match pattern
});
```

### Managing Tabs

```javascript
// Create new tab
const newTab = await chrome.tabs.create({
  url: 'https://example.com',
  active: true,
  index: 0,  // Position
  pinned: false,
  openerTabId: currentTab.id  // Group with opener
});

// Update tab
await chrome.tabs.update(tabId, {
  url: 'https://new-url.com',
  active: true,
  pinned: true,
  muted: true
});

// Move tab
await chrome.tabs.move(tabId, {
  index: 0,
  windowId: targetWindow.id
});

// Duplicate tab
const duplicate = await chrome.tabs.duplicate(tabId);

// Remove tabs
await chrome.tabs.remove(tabId);
await chrome.tabs.remove([tabId1, tabId2, tabId3]);

// Reload tab
await chrome.tabs.reload(tabId, { bypassCache: true });

// Get tab by ID
const tab = await chrome.tabs.get(tabId);

// Capture visible tab (screenshot)
const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
  format: 'png',  // or 'jpeg'
  quality: 90     // for jpeg
});
```

### Tab Events

```javascript
// Tab created
chrome.tabs.onCreated.addListener((tab) => {
  console.log('New tab:', tab.id);
});

// Tab updated (URL change, loading state, etc.)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab loaded:', tab.url);
  }
  if (changeInfo.url) {
    console.log('URL changed to:', changeInfo.url);
  }
});

// Tab activated (user switched to tab)
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log('Switched to tab:', activeInfo.tabId);
});

// Tab removed
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log('Tab closed:', tabId);
  if (removeInfo.isWindowClosing) {
    console.log('Window is closing');
  }
});

// Tab moved
chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
  console.log(`Tab ${tabId} moved from ${moveInfo.fromIndex} to ${moveInfo.toIndex}`);
});

// Tab detached/attached (moved between windows)
chrome.tabs.onDetached.addListener((tabId, detachInfo) => {
  console.log('Tab detached from window:', detachInfo.oldWindowId);
});

chrome.tabs.onAttached.addListener((tabId, attachInfo) => {
  console.log('Tab attached to window:', attachInfo.newWindowId);
});
```

### Messaging to Tabs

```javascript
// Send message to content script in tab
chrome.tabs.sendMessage(tabId, { action: 'highlight', text: 'search term' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('No content script:', chrome.runtime.lastError.message);
  } else {
    console.log('Response:', response);
  }
});

// Async version
try {
  const response = await chrome.tabs.sendMessage(tabId, { action: 'getData' });
  console.log(response);
} catch (error) {
  console.log('Content script not available');
}
```

---

## 2.3 chrome.runtime

### What It Is

The Runtime API provides methods for extension lifecycle, messaging, and accessing extension resources.

### Extension Information

```javascript
// Get extension info
const manifest = chrome.runtime.getManifest();
console.log(manifest.version);

// Get extension ID
const extensionId = chrome.runtime.id;

// Get URL to extension resource
const imageUrl = chrome.runtime.getURL('images/logo.png');

// Get platform info
const platformInfo = await chrome.runtime.getPlatformInfo();
console.log(platformInfo.os);  // 'win', 'mac', 'linux', 'cros', etc.
```

### Messaging

```javascript
// Send message (from content script or popup)
chrome.runtime.sendMessage({ action: 'getData', id: 123 }, (response) => {
  console.log('Received:', response);
});

// Async version
const response = await chrome.runtime.sendMessage({ action: 'getData' });

// Listen for messages (in service worker)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('From:', sender.tab ? `Tab ${sender.tab.id}` : 'Extension');
  
  if (request.action === 'getData') {
    // Sync response
    sendResponse({ data: 'here is your data' });
  }
  
  if (request.action === 'fetchData') {
    // Async response - return true to keep channel open
    fetch(request.url)
      .then(r => r.json())
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

// Long-lived connections
// Sender side:
const port = chrome.runtime.connect({ name: 'myConnection' });
port.postMessage({ greeting: 'hello' });
port.onMessage.addListener((msg) => {
  console.log('Received:', msg);
});
port.onDisconnect.addListener(() => {
  console.log('Port disconnected');
});

// Receiver side (service worker):
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'myConnection') {
    port.onMessage.addListener((msg) => {
      console.log('Message:', msg);
      port.postMessage({ response: 'hi back' });
    });
  }
});
```

### Lifecycle Events

```javascript
// Extension installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  switch (details.reason) {
    case 'install':
      // First install
      chrome.tabs.create({ url: 'welcome.html' });
      chrome.storage.local.set({ firstRun: true });
      break;
    case 'update':
      // Extension updated
      console.log('Updated from', details.previousVersion);
      // Migrate data if needed
      break;
    case 'chrome_update':
      // Chrome browser updated
      break;
  }
});

// Browser started
chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, extension active');
});

// Extension suspended (service worker about to terminate)
chrome.runtime.onSuspend.addListener(() => {
  console.log('Service worker suspending');
  // Save any pending state
});
```

### Opening Extension Pages

```javascript
// Open options page
chrome.runtime.openOptionsPage();

// Open extension page
chrome.tabs.create({
  url: chrome.runtime.getURL('dashboard.html')
});
```

---

## 2.4 chrome.storage

### What It Is

The Storage API provides persistent storage for extension data, with automatic sync across devices.

### Storage Areas

```javascript
// Local storage (per device, large quota ~10MB)
chrome.storage.local.set({ key: 'value', obj: { nested: 'data' } });
chrome.storage.local.get(['key', 'obj'], (result) => {
  console.log(result.key, result.obj);
});

// Sync storage (synced across devices, ~100KB limit)
chrome.storage.sync.set({ settings: { theme: 'dark' } });
chrome.storage.sync.get(['settings'], (result) => {
  console.log(result.settings);
});

// Session storage (cleared when browser closes, MV3 only)
chrome.storage.session.set({ tempData: 'value' });
chrome.storage.session.get(['tempData']);

// Managed storage (read-only, set by enterprise policy)
chrome.storage.managed.get(['adminSetting']);
```

### CRUD Operations

```javascript
// Set values
await chrome.storage.local.set({
  count: 0,
  items: ['a', 'b', 'c'],
  settings: { enabled: true, theme: 'dark' }
});

// Get values (with defaults)
const result = await chrome.storage.local.get({
  count: 0,        // Default if not set
  items: [],
  settings: { enabled: false, theme: 'light' }
});

// Get all values
const allData = await chrome.storage.local.get(null);

// Remove specific keys
await chrome.storage.local.remove(['tempKey', 'oldData']);

// Clear all
await chrome.storage.local.clear();

// Get bytes in use
const bytesInUse = await chrome.storage.local.getBytesInUse(['items']);
const totalBytes = await chrome.storage.local.getBytesInUse(null);
```

### Storage Events

```javascript
// Listen for changes (works across extension components)
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log(`Storage area ${areaName} changed`);
  
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`${key}: ${oldValue} → ${newValue}`);
  }
});

// Example: React to settings changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.settings) {
    applySettings(changes.settings.newValue);
  }
});
```

### Gotchas

```javascript
// ❌ Wrong: Assuming synchronous storage
const value = chrome.storage.local.get('key');  // Returns Promise, not value

// ✅ Correct: Use async/await or callbacks
const { key } = await chrome.storage.local.get(['key']);

// ❌ Wrong: Storing non-serializable data
chrome.storage.local.set({ 
  func: () => {},        // Functions not allowed
  el: document.body,     // DOM elements not allowed
  map: new Map()         // Map/Set not serialized correctly
});

// ✅ Correct: Store serializable data
chrome.storage.local.set({
  config: JSON.stringify(complexObject),
  mapData: Array.from(myMap.entries())
});
```

---

## 2.5 chrome.scripting

### What It Is

The Scripting API (MV3) allows programmatic injection of JavaScript and CSS into web pages.

### Execute Script

```javascript
// Execute script file
await chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content.js']
});

// Execute function
await chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: () => {
    document.body.style.backgroundColor = 'yellow';
    return document.title;
  }
});

// Execute with arguments
await chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: (color, text) => {
    document.body.style.backgroundColor = color;
    alert(text);
  },
  args: ['#ff0000', 'Hello from extension!']
});

// Execute in all frames
await chrome.scripting.executeScript({
  target: { tabId: tabId, allFrames: true },
  files: ['content.js']
});

// Execute in specific frames
await chrome.scripting.executeScript({
  target: { tabId: tabId, frameIds: [0, frameId1, frameId2] },
  files: ['content.js']
});

// Specify world (MAIN or ISOLATED)
await chrome.scripting.executeScript({
  target: { tabId: tabId },
  world: 'MAIN',  // Run in page's context (access page JS)
  func: () => {
    console.log(window.pageVariable);  // Can access page globals
  }
});
```

### Insert CSS

```javascript
// Insert CSS file
await chrome.scripting.insertCSS({
  target: { tabId: tabId },
  files: ['styles.css']
});

// Insert inline CSS
await chrome.scripting.insertCSS({
  target: { tabId: tabId },
  css: `
    body { background: yellow !important; }
    .hidden { display: none !important; }
  `
});

// Remove CSS
await chrome.scripting.removeCSS({
  target: { tabId: tabId },
  files: ['styles.css']
});
```

### Register Content Scripts Dynamically

```javascript
// Register content script
await chrome.scripting.registerContentScripts([{
  id: 'myScript',
  matches: ['https://*.example.com/*'],
  js: ['dynamic-content.js'],
  css: ['dynamic-styles.css'],
  runAt: 'document_idle',
  persistAcrossSessions: true
}]);

// Get registered scripts
const scripts = await chrome.scripting.getRegisteredContentScripts();

// Update registered script
await chrome.scripting.updateContentScripts([{
  id: 'myScript',
  matches: ['https://*.newsite.com/*']
}]);

// Unregister
await chrome.scripting.unregisterContentScripts({
  ids: ['myScript']
});
```

---

## 2.6 chrome.alarms

### What It Is

The Alarms API provides scheduled and recurring tasks, replacing `setInterval` for service workers.

### Creating Alarms

```javascript
// One-time alarm (after delay)
chrome.alarms.create('oneTime', {
  delayInMinutes: 5
});

// Scheduled alarm (at specific time)
chrome.alarms.create('scheduled', {
  when: Date.now() + 60000  // 1 minute from now
});

// Recurring alarm
chrome.alarms.create('recurring', {
  periodInMinutes: 30
});

// Recurring with initial delay
chrome.alarms.create('recurringDelayed', {
  delayInMinutes: 1,
  periodInMinutes: 60
});
```

### Handling Alarms

```javascript
chrome.alarms.onAlarm.addListener((alarm) => {
  switch (alarm.name) {
    case 'checkUpdates':
      checkForUpdates();
      break;
    case 'syncData':
      syncWithServer();
      break;
    case 'cleanup':
      cleanupOldData();
      break;
  }
});

// Get alarm info
const alarm = await chrome.alarms.get('myAlarm');
if (alarm) {
  console.log('Next fire:', new Date(alarm.scheduledTime));
}

// Get all alarms
const allAlarms = await chrome.alarms.getAll();

// Clear specific alarm
await chrome.alarms.clear('myAlarm');

// Clear all alarms
await chrome.alarms.clearAll();
```

---

## 2.7 chrome.notifications

### What It Is

The Notifications API displays system notifications to users.

### Creating Notifications

```javascript
// Basic notification
chrome.notifications.create('myNotification', {
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: 'Extension Alert',
  message: 'Something important happened!',
  priority: 2  // -2 to 2
});

// With buttons
chrome.notifications.create('withButtons', {
  type: 'basic',
  iconUrl: 'icons/icon128.png',
  title: 'Action Required',
  message: 'Do you want to proceed?',
  buttons: [
    { title: 'Yes' },
    { title: 'No' }
  ]
});

// List notification
chrome.notifications.create('listNotif', {
  type: 'list',
  iconUrl: 'icons/icon128.png',
  title: 'Tasks Completed',
  message: 'Summary of completed tasks',
  items: [
    { title: 'Task 1', message: 'Completed at 2:00 PM' },
    { title: 'Task 2', message: 'Completed at 2:30 PM' },
    { title: 'Task 3', message: 'Completed at 3:00 PM' }
  ]
});

// Progress notification
chrome.notifications.create('progress', {
  type: 'progress',
  iconUrl: 'icons/icon128.png',
  title: 'Downloading...',
  message: 'file.zip',
  progress: 45
});

// Update notification
chrome.notifications.update('progress', {
  progress: 75
});

// Clear notification
chrome.notifications.clear('myNotification');
```

### Notification Events

```javascript
// Notification clicked
chrome.notifications.onClicked.addListener((notificationId) => {
  console.log('Notification clicked:', notificationId);
  // Open related page
  chrome.tabs.create({ url: 'details.html' });
  chrome.notifications.clear(notificationId);
});

// Button clicked
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (notificationId === 'withButtons') {
    if (buttonIndex === 0) {
      console.log('User clicked Yes');
    } else {
      console.log('User clicked No');
    }
  }
  chrome.notifications.clear(notificationId);
});

// Notification closed
chrome.notifications.onClosed.addListener((notificationId, byUser) => {
  console.log(`Notification ${notificationId} closed ${byUser ? 'by user' : 'programmatically'}`);
});
```

---

## 2.8 chrome.contextMenus

### What It Is

The Context Menus API adds items to the browser's right-click context menu.

### Creating Menus

```javascript
// Create menu items (typically in onInstalled)
chrome.runtime.onInstalled.addListener(() => {
  // Simple menu item
  chrome.contextMenus.create({
    id: 'searchText',
    title: 'Search "%s"',  // %s = selected text
    contexts: ['selection']
  });
  
  // Parent menu with children
  chrome.contextMenus.create({
    id: 'parent',
    title: 'My Extension',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'action1',
    parentId: 'parent',
    title: 'Action 1',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'action2',
    parentId: 'parent',
    title: 'Action 2',
    contexts: ['all']
  });
  
  // Separator
  chrome.contextMenus.create({
    id: 'separator',
    parentId: 'parent',
    type: 'separator',
    contexts: ['all']
  });
  
  // Checkbox item
  chrome.contextMenus.create({
    id: 'toggle',
    parentId: 'parent',
    title: 'Enable Feature',
    type: 'checkbox',
    checked: true,
    contexts: ['all']
  });
  
  // Radio items
  chrome.contextMenus.create({
    id: 'mode1',
    parentId: 'parent',
    title: 'Mode 1',
    type: 'radio',
    contexts: ['all']
  });
  
  chrome.contextMenus.create({
    id: 'mode2',
    parentId: 'parent',
    title: 'Mode 2',
    type: 'radio',
    contexts: ['all']
  });
  
  // Only on specific URLs
  chrome.contextMenus.create({
    id: 'siteSpecific',
    title: 'Only on GitHub',
    contexts: ['page'],
    documentUrlPatterns: ['https://github.com/*']
  });
  
  // Only on images
  chrome.contextMenus.create({
    id: 'downloadImage',
    title: 'Download with Extension',
    contexts: ['image']
  });
  
  // Only on links
  chrome.contextMenus.create({
    id: 'openLink',
    title: 'Open in Background',
    contexts: ['link']
  });
});
```

### Context Types

| Context | When Shown |
|---------|------------|
| `all` | Always |
| `page` | On page background |
| `selection` | When text is selected |
| `link` | On links |
| `image` | On images |
| `video` | On videos |
| `audio` | On audio elements |
| `frame` | On iframes |
| `editable` | On text inputs |
| `action` | On extension icon |

### Handling Clicks

```javascript
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'searchText':
      const searchUrl = `https://google.com/search?q=${encodeURIComponent(info.selectionText)}`;
      chrome.tabs.create({ url: searchUrl });
      break;
      
    case 'downloadImage':
      chrome.downloads.download({ url: info.srcUrl });
      break;
      
    case 'openLink':
      chrome.tabs.create({ url: info.linkUrl, active: false });
      break;
      
    case 'toggle':
      console.log('Toggle is now:', info.checked);
      break;
  }
});
```

---

## 2.9 chrome.webRequest / declarativeNetRequest

### declarativeNetRequest (MV3 Recommended)

```javascript
// Static rules in manifest.json
{
  "declarative_net_request": {
    "rule_resources": [{
      "id": "ruleset_1",
      "enabled": true,
      "path": "rules.json"
    }]
  },
  "permissions": ["declarativeNetRequest"]
}
```

```json
// rules.json
[
  {
    "id": 1,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "||ads.example.com",
      "resourceTypes": ["script", "image"]
    }
  },
  {
    "id": 2,
    "priority": 1,
    "action": {
      "type": "redirect",
      "redirect": { "url": "https://safe.example.com" }
    },
    "condition": {
      "urlFilter": "||unsafe.com",
      "resourceTypes": ["main_frame"]
    }
  },
  {
    "id": 3,
    "priority": 1,
    "action": {
      "type": "modifyHeaders",
      "requestHeaders": [
        { "header": "User-Agent", "operation": "set", "value": "Custom UA" }
      ]
    },
    "condition": {
      "urlFilter": "||api.example.com",
      "resourceTypes": ["xmlhttprequest"]
    }
  }
]
```

```javascript
// Dynamic rules
await chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: 100,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '*://blocked-site.com/*',
      resourceTypes: ['main_frame']
    }
  }],
  removeRuleIds: [99]  // Remove old rule
});

// Get current rules
const rules = await chrome.declarativeNetRequest.getDynamicRules();
```

---

## 2.10 Summary

| API | Purpose | Common Use |
|-----|---------|------------|
| `chrome.action` | Toolbar icon | Badge, popup, icon changes |
| `chrome.tabs` | Tab management | Query, create, update tabs |
| `chrome.runtime` | Extension lifecycle | Messaging, install events |
| `chrome.storage` | Data persistence | Settings, user data |
| `chrome.scripting` | Script injection | Execute JS/CSS in pages |
| `chrome.alarms` | Scheduled tasks | Periodic background work |
| `chrome.notifications` | System notifications | User alerts |
| `chrome.contextMenus` | Right-click menus | Custom menu actions |
| `chrome.declarativeNetRequest` | Network rules | Ad blocking, redirects |

### Best Practices

1. **Use `chrome.storage.sync`** for settings that should sync across devices
2. **Handle `chrome.runtime.lastError`** when using callbacks
3. **Prefer `declarativeNetRequest`** over `webRequest` for MV3
4. **Use alarms instead of `setInterval`** in service workers
5. **Request `activeTab`** instead of broad host permissions
6. **Check tab existence** before sending messages

---

**End of Module 2: Chrome Extension APIs**

Next: Module 3 — Firefox WebExtensions
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
# Module 4: Extension Development Workflow

Building production-ready extensions requires proper tooling, testing, and deployment strategies. This module covers the complete development lifecycle.

---

## 4.1 Project Structure

### Recommended Layout

```
my-extension/
├── src/
│   ├── background/
│   │   └── service-worker.js
│   ├── content/
│   │   └── content-script.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/
│   │   ├── options.html
│   │   └── options.js
│   └── shared/
│       └── utils.js
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── icon128.png
│   └── manifest.json
├── dist/                  # Built extension
├── test/
│   ├── unit/
│   └── e2e/
├── package.json
├── webpack.config.js      # or vite.config.js
└── README.md
```

### Package.json

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "scripts": {
    "dev": "webpack --watch --mode development",
    "build": "webpack --mode production",
    "build:chrome": "npm run build && web-ext build -s dist -a artifacts",
    "build:firefox": "npm run build && web-ext build -s dist -a artifacts",
    "test": "jest",
    "test:e2e": "playwright test",
    "lint": "eslint src/",
    "start:chrome": "npm run build && web-ext run -s dist -t chromium",
    "start:firefox": "npm run build && web-ext run -s dist -t firefox-desktop"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "copy-webpack-plugin": "^11.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.0.0",
    "web-ext": "^7.0.0",
    "webextension-polyfill": "^0.10.0",
    "webpack": "^5.0.0",
    "webpack-cli": "^5.0.0"
  }
}
```

---

## 4.2 Build Configuration

### Webpack Setup

```javascript
// webpack.config.js
const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'background/service-worker': './src/background/service-worker.js',
    'content/content-script': './src/content/content-script.js',
    'popup/popup': './src/popup/popup.js',
    'options/options': './src/options/options.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'public' },
        { from: 'src/popup/popup.html', to: 'popup/popup.html' },
        { from: 'src/popup/popup.css', to: 'popup/popup.css' },
        { from: 'src/options/options.html', to: 'options/options.html' }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  devtool: 'source-map'
};
```

### Vite Setup

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        background: resolve(__dirname, 'src/background/service-worker.js'),
        content: resolve(__dirname, 'src/content/content-script.js'),
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html')
      },
      output: {
        entryFileNames: '[name]/[name].js'
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'public/*', dest: '.' }
      ]
    })
  ]
});
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["chrome"],
    "lib": ["ES2020", "DOM"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

```bash
# Install Chrome types
npm install --save-dev @types/chrome
```

---

## 4.3 Cross-Browser Development

### Browser Detection

```javascript
// src/shared/browser-api.js
const isFirefox = typeof browser !== 'undefined';
const isChrome = typeof chrome !== 'undefined' && !isFirefox;

// Use polyfill for consistent API
import browser from 'webextension-polyfill';

export { browser, isFirefox, isChrome };
```

### Manifest Generation

```javascript
// scripts/generate-manifest.js
const baseManifest = require('../public/manifest.base.json');

const chromeManifest = {
  ...baseManifest,
  minimum_chrome_version: '88'
};

const firefoxManifest = {
  ...baseManifest,
  browser_specific_settings: {
    gecko: {
      id: 'addon@example.com',
      strict_min_version: '109.0'
    }
  }
};

// Write to appropriate directory based on target
```

### Conditional Features

```javascript
// Feature detection instead of browser detection
const supportsSidebarAction = typeof browser?.sidebarAction !== 'undefined';
const supportsContainers = typeof browser?.contextualIdentities !== 'undefined';

if (supportsSidebarAction) {
  browser.sidebarAction.open();
}

// Runtime permission checking
const hasPermission = await browser.permissions.contains({
  permissions: ['tabs'],
  origins: ['https://*.google.com/*']
});
```

---

## 4.4 Testing Extensions

### Unit Testing with Jest

```javascript
// test/unit/utils.test.js
import { formatUrl, parseQuery } from '../../src/shared/utils.js';

describe('formatUrl', () => {
  test('adds https if missing', () => {
    expect(formatUrl('example.com')).toBe('https://example.com');
  });
  
  test('preserves existing protocol', () => {
    expect(formatUrl('http://example.com')).toBe('http://example.com');
  });
});
```

### Mocking Chrome APIs

```javascript
// test/setup.js
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn()
    },
    lastError: null,
    id: 'test-extension-id',
    getManifest: jest.fn(() => ({ version: '1.0.0' }))
  },
  storage: {
    local: {
      get: jest.fn((keys) => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve())
    },
    sync: {
      get: jest.fn((keys) => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve())
    }
  },
  tabs: {
    query: jest.fn(() => Promise.resolve([])),
    create: jest.fn(),
    update: jest.fn(),
    sendMessage: jest.fn()
  }
};
```

```javascript
// test/unit/background.test.js
import { handleMessage } from '../../src/background/message-handler.js';

describe('Message Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('returns data on getData action', async () => {
    chrome.storage.local.get.mockResolvedValue({ items: ['a', 'b'] });
    
    const response = await handleMessage({ action: 'getData' });
    
    expect(response.items).toEqual(['a', 'b']);
  });
  
  test('saves data on saveData action', async () => {
    await handleMessage({ action: 'saveData', data: { key: 'value' } });
    
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ key: 'value' });
  });
});
```

### E2E Testing with Playwright

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  use: {
    browserName: 'chromium',
    headless: false,
    // Load extension
    launchOptions: {
      args: [
        `--disable-extensions-except=${process.cwd()}/dist`,
        `--load-extension=${process.cwd()}/dist`
      ]
    }
  }
});
```

```javascript
// test/e2e/popup.test.js
import { test, expect, chromium } from '@playwright/test';
import path from 'path';

test.describe('Extension Popup', () => {
  let context;
  let extensionId;
  
  test.beforeAll(async () => {
    const pathToExtension = path.join(__dirname, '../../dist');
    
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    });
    
    // Get extension ID
    let [background] = context.serviceWorkers();
    if (!background) {
      background = await context.waitForEvent('serviceworker');
    }
    extensionId = background.url().split('/')[2];
  });
  
  test.afterAll(async () => {
    await context.close();
  });
  
  test('popup displays correctly', async () => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    
    await expect(popupPage.locator('h1')).toHaveText('My Extension');
    await expect(popupPage.locator('#status')).toBeVisible();
  });
  
  test('clicking button triggers action', async () => {
    const popupPage = await context.newPage();
    await popupPage.goto(`chrome-extension://${extensionId}/popup/popup.html`);
    
    await popupPage.click('#actionButton');
    
    await expect(popupPage.locator('#result')).toHaveText('Action completed');
  });
});
```

---

## 4.5 Debugging

### Chrome Debugging

1. **Load extension**: `chrome://extensions` → Enable Developer Mode → Load Unpacked
2. **Service worker console**: Click "Inspect views: service worker"
3. **Popup DevTools**: Right-click popup → Inspect
4. **Content script DevTools**: Normal page DevTools, select content script context

### Firefox Debugging

1. **Load extension**: `about:debugging#/runtime/this-firefox` → Load Temporary Add-on
2. **Extension DevTools**: Click "Inspect" on extension card
3. **Browser Console**: Ctrl+Shift+J for all extension logs

### Debug Logging

```javascript
// src/shared/logger.js
const DEBUG = true;  // Set via build environment

export const logger = {
  log: (...args) => DEBUG && console.log('[Extension]', ...args),
  error: (...args) => console.error('[Extension Error]', ...args),
  warn: (...args) => console.warn('[Extension Warning]', ...args),
  
  group: (label) => DEBUG && console.group(`[Extension] ${label}`),
  groupEnd: () => DEBUG && console.groupEnd(),
  
  table: (data) => DEBUG && console.table(data),
  
  time: (label) => DEBUG && console.time(`[Extension] ${label}`),
  timeEnd: (label) => DEBUG && console.timeEnd(`[Extension] ${label}`)
};
```

```javascript
// Usage
import { logger } from '@/shared/logger';

logger.group('Processing tabs');
logger.log('Found tabs:', tabs.length);
logger.table(tabs.map(t => ({ id: t.id, url: t.url })));
logger.groupEnd();
```

### Storage Debugging

```javascript
// Inspect storage
async function debugStorage() {
  const local = await chrome.storage.local.get(null);
  const sync = await chrome.storage.sync.get(null);
  const session = await chrome.storage.session?.get(null) || {};
  
  console.group('Extension Storage');
  console.log('Local:', local);
  console.log('Sync:', sync);
  console.log('Session:', session);
  console.groupEnd();
}

// Clear storage
async function clearStorage() {
  await chrome.storage.local.clear();
  await chrome.storage.sync.clear();
  console.log('Storage cleared');
}
```

---

## 4.6 Performance Optimization

### Service Worker Lifecycle

```javascript
// Service workers terminate after ~30s of inactivity
// Don't rely on in-memory state

// ❌ Bad: In-memory state
let cache = {};

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'get') {
    return cache[msg.key];  // Lost after termination
  }
});

// ✅ Good: Persistent storage
chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
  if (msg.action === 'get') {
    const { [msg.key]: value } = await chrome.storage.local.get(msg.key);
    sendResponse(value);
  }
  return true;
});
```

### Lazy Loading

```javascript
// Load heavy modules only when needed
async function performAnalysis() {
  // Dynamically import heavy analysis module
  const { analyze } = await import('./heavy-analysis.js');
  return analyze(data);
}

// Content script: inject CSS only when needed
if (needsStyling) {
  chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles/heavy-styles.css']
  });
}
```

### Efficient Storage

```javascript
// Batch storage operations
const updates = {};
for (const item of items) {
  updates[item.id] = item;
}
await chrome.storage.local.set(updates);  // One operation

// Use indexed structure for fast lookups
// Instead of: { items: [{ id: 1, ... }, { id: 2, ... }] }
// Use: { item_1: { ... }, item_2: { ... } }
```

### Message Batching

```javascript
// ❌ Bad: Many messages
for (const tab of tabs) {
  chrome.tabs.sendMessage(tab.id, { action: 'update', data: item });
}

// ✅ Good: Single message with batch data
for (const tab of tabs) {
  chrome.tabs.sendMessage(tab.id, { action: 'updateBatch', data: items });
}
```

---

## 4.7 Security Best Practices

### Content Security Policy

```json
// manifest.json - Strict CSP
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'none'; base-uri 'none'"
  }
}
```

### Input Validation

```javascript
// Validate messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Validate sender
  if (!sender.tab && sender.id !== chrome.runtime.id) {
    console.warn('Unexpected sender:', sender);
    return;
  }
  
  // Validate message structure
  if (typeof message !== 'object' || !message.action) {
    console.warn('Invalid message format');
    return;
  }
  
  // Sanitize inputs
  if (message.url) {
    try {
      new URL(message.url);  // Validates URL format
    } catch {
      sendResponse({ error: 'Invalid URL' });
      return;
    }
  }
  
  // Process validated message
  handleValidatedMessage(message, sender, sendResponse);
  return true;
});
```

### Secure Communication

```javascript
// ❌ Don't pass sensitive data to web pages
window.postMessage({ type: 'fromExtension', token: secretToken }, '*');

// ✅ Keep sensitive data in extension context
// Use chrome.storage.session for sensitive temporary data
await chrome.storage.session.set({ token: sensitiveToken });
```

### XSS Prevention

```javascript
// ❌ Dangerous: innerHTML with user content
element.innerHTML = userInput;

// ✅ Safe: textContent or sanitization
element.textContent = userInput;

// If HTML needed, use DOMPurify
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);
```

---

## 4.8 Publishing

### Chrome Web Store

1. **Create developer account**: $5 one-time fee
2. **Prepare assets**:
   - Screenshots (1280x800 or 640x400)
   - Promotional images
   - Privacy policy URL
3. **Build production package**: `npm run build:chrome`
4. **Submit for review**: Upload ZIP to Chrome Web Store

### Firefox Add-ons (AMO)

```bash
# Sign and submit
web-ext sign --api-key=$AMO_JWT_ISSUER --api-secret=$AMO_JWT_SECRET

# Self-distribution (signed but not listed)
web-ext sign --channel=unlisted --api-key=$KEY --api-secret=$SECRET
```

### Versioning

```javascript
// Semantic versioning
// manifest.json version must be X.Y.Z or X.Y.Z.W

// Automate version bump
const manifest = require('./public/manifest.json');
const [major, minor, patch] = manifest.version.split('.').map(Number);

// Increment for releases
manifest.version = `${major}.${minor}.${patch + 1}`;
```

### CI/CD Pipeline

```yaml
# .github/workflows/release.yml
name: Release Extension

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build extension
        run: npm run build
        
      - name: Package for Chrome
        run: web-ext build -s dist -a artifacts
        
      - name: Upload to Chrome Web Store
        uses: mnao305/chrome-extension-upload@v4
        with:
          extension-id: ${{ secrets.CHROME_EXTENSION_ID }}
          client-id: ${{ secrets.CHROME_CLIENT_ID }}
          client-secret: ${{ secrets.CHROME_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CHROME_REFRESH_TOKEN }}
          file-path: artifacts/*.zip
          
      - name: Sign for Firefox
        run: |
          web-ext sign \
            --api-key=${{ secrets.AMO_JWT_ISSUER }} \
            --api-secret=${{ secrets.AMO_JWT_SECRET }} \
            -s dist
```

---

## 4.9 Common Patterns

### State Management

```javascript
// Simple reactive state
class ExtensionState {
  constructor() {
    this.listeners = new Set();
    this.state = {};
  }
  
  async init() {
    this.state = await chrome.storage.local.get(null);
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }
  
  handleStorageChange(changes, area) {
    if (area !== 'local') return;
    
    for (const [key, { newValue }] of Object.entries(changes)) {
      this.state[key] = newValue;
    }
    
    this.notify();
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  notify() {
    this.listeners.forEach(fn => fn(this.state));
  }
  
  async set(updates) {
    await chrome.storage.local.set(updates);
  }
  
  get(key) {
    return this.state[key];
  }
}

export const state = new ExtensionState();
```

### Tab Communication

```javascript
// Broadcast to all tabs
async function broadcastToTabs(message) {
  const tabs = await chrome.tabs.query({});
  
  return Promise.allSettled(
    tabs.map(tab => 
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Content script not loaded
      })
    )
  );
}

// Wait for content script to be ready
async function sendWhenReady(tabId, message, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await chrome.tabs.sendMessage(tabId, message);
    } catch {
      await new Promise(r => setTimeout(r, 100 * (i + 1)));
    }
  }
  throw new Error('Content script not responding');
}
```

### Settings Management

```javascript
// settings.js
const defaults = {
  theme: 'auto',
  notifications: true,
  syncEnabled: false,
  shortcuts: { toggle: 'Ctrl+Shift+E' }
};

export async function getSettings() {
  const stored = await chrome.storage.sync.get(defaults);
  return { ...defaults, ...stored };
}

export async function updateSettings(updates) {
  const current = await getSettings();
  const newSettings = { ...current, ...updates };
  await chrome.storage.sync.set(newSettings);
  return newSettings;
}

export function onSettingsChange(callback) {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync') {
      const updates = {};
      for (const [key, { newValue }] of Object.entries(changes)) {
        if (key in defaults) {
          updates[key] = newValue;
        }
      }
      if (Object.keys(updates).length > 0) {
        callback(updates);
      }
    }
  });
}
```

---

## 4.10 Summary

| Stage | Tools & Practices |
|-------|-------------------|
| **Project Setup** | Webpack/Vite, TypeScript, ESLint |
| **Cross-Browser** | webextension-polyfill, manifest generation |
| **Testing** | Jest (unit), Playwright (E2E), Chrome API mocks |
| **Debugging** | DevTools, about:debugging, browser console |
| **Performance** | Lazy loading, storage batching, efficient messaging |
| **Security** | CSP, input validation, XSS prevention |
| **Publishing** | web-ext, Chrome Web Store, AMO |
| **CI/CD** | GitHub Actions, automated signing |

### Development Checklist

- [ ] Set up build tooling (Webpack/Vite)
- [ ] Configure TypeScript with Chrome types
- [ ] Add webextension-polyfill for cross-browser
- [ ] Write unit tests with mocked Chrome APIs
- [ ] Set up E2E tests with Playwright
- [ ] Implement proper error handling
- [ ] Add logging for debugging
- [ ] Validate all external inputs
- [ ] Test in both Chrome and Firefox
- [ ] Configure CI/CD pipeline
- [ ] Prepare store assets (screenshots, descriptions)
- [ ] Submit for review

---

**End of Module 4: Extension Development Workflow**

This completes Section V: Browser Extensions.
