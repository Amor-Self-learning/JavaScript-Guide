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
