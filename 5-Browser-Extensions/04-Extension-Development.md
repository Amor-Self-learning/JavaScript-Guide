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
