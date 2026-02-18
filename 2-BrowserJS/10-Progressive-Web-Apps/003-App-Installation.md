# 10.3 App Installation

Progressive Web Apps can be installed on user devices for a native-like experience. This chapter covers the beforeinstallprompt event, custom install prompts, and installation detection.

---

## 10.3.1 Installation Overview

### PWA Installation Requirements

```javascript
// For a PWA to be installable, it needs:
// 1. Valid Web App Manifest with required fields
// 2. HTTPS (or localhost for development)
// 3. Registered Service Worker
// 4. (Chrome) User engagement heuristic met

// Required manifest fields:
// - name or short_name
// - icons (192px and 512px minimum)
// - start_url
// - display (standalone, fullscreen, or minimal-ui)
// - prefer_related_applications not true
```

### Check Installability

```javascript
// Check if app can be installed
window.addEventListener('beforeinstallprompt', (event) => {
  console.log('App is installable!');
});

// Check if already installed
function isInstalled() {
  // Check display mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // iOS Safari
  if (window.navigator.standalone === true) {
    return true;
  }
  
  return false;
}
```

---

## 10.3.2 beforeinstallprompt Event

### Capturing the Event

```javascript
// Store the event for later use
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (event) => {
  // Prevent automatic prompt
  event.preventDefault();
  
  // Store for later
  deferredPrompt = event;
  
  // Show your custom install button
  showInstallButton();
});

function showInstallButton() {
  const installButton = document.getElementById('install-btn');
  installButton.style.display = 'block';
}
```

### Using the Deferred Prompt

```javascript
const installButton = document.getElementById('install-btn');

installButton.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  
  // Show the browser's install prompt
  deferredPrompt.prompt();
  
  // Wait for user response
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`User choice: ${outcome}`);
  // 'accepted' or 'dismissed'
  
  // Clear the deferred prompt
  deferredPrompt = null;
  
  // Hide install button
  installButton.style.display = 'none';
});
```

### Event Properties

```javascript
window.addEventListener('beforeinstallprompt', (event) => {
  // Available platforms
  console.log('Platforms:', event.platforms);
  // e.g., ['web', 'play'] for Android
  
  // User choice promise
  event.userChoice.then((result) => {
    console.log('Outcome:', result.outcome);
    console.log('Platform:', result.platform);
  });
});
```

---

## 10.3.3 appinstalled Event

### Detecting Installation

```javascript
window.addEventListener('appinstalled', (event) => {
  console.log('App was installed!');
  
  // Track installation
  analytics.track('pwa_installed');
  
  // Hide install UI
  hideInstallPromotion();
  
  // Show welcome message
  showWelcomeMessage();
});
```

### Complete Installation Flow

```javascript
class InstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = this.checkInstalled();
    
    this.setupEventListeners();
  }
  
  checkInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }
  
  setupEventListeners() {
    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallUI();
    });
    
    // Handle installation
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.hideInstallUI();
      this.onInstalled();
    });
    
    // Handle display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        this.isInstalled = true;
        this.hideInstallUI();
      }
    });
  }
  
  showInstallUI() {
    const banner = document.getElementById('install-banner');
    if (banner && !this.isInstalled) {
      banner.classList.add('visible');
    }
  }
  
  hideInstallUI() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.classList.remove('visible');
    }
  }
  
  async promptInstall() {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }
    
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    this.deferredPrompt = null;
    
    return outcome === 'accepted';
  }
  
  onInstalled() {
    console.log('PWA installed successfully');
    // Analytics, welcome message, etc.
  }
}

const installManager = new InstallManager();
```

---

## 10.3.4 Custom Install UI

### Install Banner

```html
<div id="install-banner" class="install-banner">
  <div class="install-content">
    <img src="/icons/icon-48.png" alt="App icon">
    <div class="install-text">
      <h3>Install Our App</h3>
      <p>Get quick access from your home screen</p>
    </div>
  </div>
  <div class="install-actions">
    <button id="install-dismiss">Not now</button>
    <button id="install-accept">Install</button>
  </div>
</div>
```

```css
.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  z-index: 1000;
}

.install-banner.visible {
  transform: translateY(0);
}

.install-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.install-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

#install-accept {
  background: #6200ee;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
```

```javascript
document.getElementById('install-accept').addEventListener('click', async () => {
  const installed = await installManager.promptInstall();
  if (installed) {
    installManager.hideInstallUI();
  }
});

document.getElementById('install-dismiss').addEventListener('click', () => {
  installManager.hideInstallUI();
  // Remember dismissal
  localStorage.setItem('install-dismissed', Date.now());
});
```

### Smart Timing

```javascript
class InstallPromotion {
  constructor(options = {}) {
    this.minPageViews = options.minPageViews || 3;
    this.minVisitDuration = options.minVisitDuration || 30000;
    this.dismissCooldown = options.dismissCooldown || 7 * 24 * 60 * 60 * 1000;
    
    this.startTime = Date.now();
    this.incrementPageViews();
  }
  
  incrementPageViews() {
    const views = parseInt(localStorage.getItem('page-views') || '0');
    localStorage.setItem('page-views', views + 1);
  }
  
  shouldShowPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return false;
    }
    
    // Check dismissal cooldown
    const dismissed = parseInt(localStorage.getItem('install-dismissed') || '0');
    if (Date.now() - dismissed < this.dismissCooldown) {
      return false;
    }
    
    // Check minimum page views
    const views = parseInt(localStorage.getItem('page-views') || '0');
    if (views < this.minPageViews) {
      return false;
    }
    
    // Check visit duration
    if (Date.now() - this.startTime < this.minVisitDuration) {
      return false;
    }
    
    return true;
  }
}
```

---

## 10.3.5 iOS Installation

### iOS Safari Limitations

```javascript
// iOS doesn't support beforeinstallprompt
// Must provide manual instructions

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return window.navigator.standalone === true;
}

function showIOSInstallPrompt() {
  if (isIOS() && !isInStandaloneMode()) {
    // Show custom iOS instructions
    const banner = document.getElementById('ios-install-banner');
    banner.style.display = 'block';
  }
}
```

### iOS Install Instructions

```html
<div id="ios-install-banner" class="ios-banner" style="display: none;">
  <button class="close-btn" onclick="this.parentElement.style.display='none'">&times;</button>
  <p>Install this app on your iPhone:</p>
  <ol>
    <li>Tap the Share button <span class="share-icon">⬆️</span></li>
    <li>Scroll down and tap "Add to Home Screen"</li>
    <li>Tap "Add" to confirm</li>
  </ol>
</div>
```

---

## 10.3.6 Installation Analytics

### Tracking Installation

```javascript
let deferredPrompt;
const installSource = new URLSearchParams(window.location.search).get('source');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Track that prompt was available
  analytics.track('pwa_install_available', {
    source: installSource || 'direct'
  });
});

async function triggerInstall(source) {
  if (!deferredPrompt) return;
  
  // Track prompt shown
  analytics.track('pwa_install_prompt_shown', { source });
  
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  
  // Track user choice
  analytics.track('pwa_install_choice', {
    outcome,
    source
  });
  
  deferredPrompt = null;
}

window.addEventListener('appinstalled', () => {
  analytics.track('pwa_installed', {
    source: installSource || 'unknown'
  });
});
```

### Launch Tracking

```javascript
// In manifest.json
// "start_url": "/?source=pwa"

// Track PWA launches
if (window.matchMedia('(display-mode: standalone)').matches) {
  analytics.track('pwa_launch');
}
```

---

## 10.3.7 Related Applications

### Prefer Native App

```json
{
  "prefer_related_applications": true,
  "related_applications": [
    {
      "platform": "play",
      "url": "https://play.google.com/store/apps/details?id=com.example.app",
      "id": "com.example.app"
    }
  ]
}
```

### Check Native App

```javascript
// Check if related native app is installed
if ('getInstalledRelatedApps' in navigator) {
  const relatedApps = await navigator.getInstalledRelatedApps();
  
  if (relatedApps.length > 0) {
    console.log('Native app installed:', relatedApps[0].platform);
    // Hide PWA install prompt
  }
}
```

---

## 10.3.8 Mini Info Bar

### Chrome Mini Info Bar

```javascript
// Chrome shows a mini info bar automatically
// To customize, intercept beforeinstallprompt

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent mini info bar on mobile
  e.preventDefault();
  
  // Show your own UI at the right time
  showInstallPromotionAtRightTime(e);
});
```

---

## 10.3.9 Summary

### Installation Events

| Event | When |
|-------|------|
| `beforeinstallprompt` | App is installable |
| `appinstalled` | App was installed |

### Event Methods

| Method | Description |
|--------|-------------|
| `event.preventDefault()` | Prevent automatic prompt |
| `event.prompt()` | Show install dialog |
| `event.userChoice` | Promise with user decision |

### Best Practices

1. **Don't prompt immediately** — wait for engagement
2. **Provide custom UI** for better conversion
3. **Track installation funnel** with analytics
4. **Handle iOS separately** with manual instructions
5. **Respect user dismissals** — use cooldown period
6. **Test on multiple devices** and browsers

---

**End of Chapter 10.3: App Installation**

This completes the Progressive Web Apps group. Next section: **Group 11 — Notifications and Messaging** — covers browser notifications and cross-context communication.
