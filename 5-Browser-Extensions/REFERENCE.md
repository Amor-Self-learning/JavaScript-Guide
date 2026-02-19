# Browser Extensions — Reference Guide

This document provides the complete module map, writing standards, and progress
tracking for Section V of the JavaScript Mastery Guide.

---

## 1. Section Overview

Section V covers browser extension development for Chrome, Firefox, and Edge:

- Extension architecture (MV3)
- Manifest file configuration
- Chrome extension APIs
- Firefox WebExtensions
- Cross-browser development
- Distribution and publishing

**Target:** 4 consolidated module files

---

## 2. Writing Standard

### Style Reference

Follow the depth and structure of `1-ECMAScript/01-Language-Fundamentals.md`.

### Required Structure

```markdown
# Module X: Title

Brief introduction explaining what this module covers and why it matters.

---

## X.1 First Topic

### What It Is

Technical explanation with context.

### How It Works

```javascript
// Heavily commented code example
chrome.tabs.query({ active: true }, (tabs) => {
  // Explain the API usage
});
```

### Manifest Configuration

```json
{
  "manifest_version": 3,
  "permissions": ["tabs"]
}
```

### Gotchas

```javascript
// ❌ Wrong way
badPattern();

// ✅ Correct way
goodPattern();
```

### Best Practices

1. Practice one
2. Practice two

---

## X.N Summary

| Concept | Key Points |
|---------|------------|
| ... | ... |

---

**End of Module X: Title**
```

### Rules

- Use ` ```javascript ` for code, ` ```json ` for manifest
- Manifest V3 focus (MV2 for legacy reference only)
- Include both Chrome and Firefox syntax where applicable
- Security implications with ❌/✅ pattern
- Cross-references: `(see Module 5.2 Chrome APIs)`

---

## 3. Module Map

### Module 01 — Extension Fundamentals

| Section | Topic | Status |
|---------|-------|--------|
| 1.1 | Extension Architecture | ✅ |
| 1.2 | Manifest File | ✅ |
| 1.3 | Content Scripts | ✅ |
| 1.4 | Background Service Workers | ✅ |
| 1.5 | Popup and Options Pages | ✅ |

**Coverage:**
- Background scripts/service workers
- Content scripts injection
- Popup pages, options pages
- Manifest V3 structure
- Permissions model

---

### Module 02 — Chrome Extension APIs

| Section | Topic | Status |
|---------|-------|--------|
| 2.1 | chrome.action | ✅ |
| 2.2 | chrome.tabs | ✅ |
| 2.3 | chrome.runtime | ✅ |
| 2.4 | chrome.storage | ✅ |
| 2.5 | chrome.scripting | ✅ |
| 2.6 | chrome.alarms | ✅ |
| 2.7 | chrome.notifications | ✅ |
| 2.8 | chrome.contextMenus | ✅ |
| 2.9 | chrome.webRequest | ✅ |

**Coverage:**
- Action API (toolbar icon, badge, popup)
- Tab management and events
- Runtime messaging and lifecycle
- Storage (local, sync, session)
- Scripting API (MV3)
- Alarms, notifications, context menus
- Web request interception

---

### Module 03 — Firefox WebExtensions

| Section | Topic | Status |
|---------|-------|--------|
| 3.1 | Differences from Chrome | ✅ |
| 3.2 | Firefox-specific APIs | ✅ |

**Coverage:**
- browser namespace vs chrome
- Promise-based APIs
- Manifest differences
- Sidebar API, Theme API

---

### Module 04 — Extension Development

| Section | Topic | Status |
|---------|-------|--------|
| 4.1 | Development Workflow | ✅ |
| 4.2 | Debugging Extensions | ✅ |
| 4.3 | Cross-browser Compatibility | ✅ |
| 4.4 | Distribution | ✅ |

**Coverage:**
- Loading unpacked extensions
- Chrome/Firefox debugging tools
- webextension-polyfill
- Chrome Web Store, Firefox Add-ons, Edge Add-ons
- Review process and best practices

---

## 4. Module Progress Tracker

| # | Module | Status | Lines |
|---|--------|--------|-------|
| 01 | Extension Fundamentals | ✅ | ~500 |
| 02 | Chrome Extension APIs | ✅ | ~690 |
| 03 | Firefox WebExtensions | ✅ | ~530 |
| 04 | Extension Development | ✅ | ~620 |

---

## 5. File Paths

```
5-Browser-Extensions/
├── REFERENCE.md
├── 01-Extension-Fundamentals.md
├── 02-Chrome-Extension-APIs.md
├── 03-Firefox-WebExtensions.md
└── 04-Extension-Development.md
```

---

**End of Reference Guide**
