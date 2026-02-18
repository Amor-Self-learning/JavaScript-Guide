# Browser-JS Section — Writing Reference

> **Purpose:** This file is the single source of truth for creating chapters in `2-BrowserJS/`.  
> Tag it in any new session (`@2-BrowserJS/REFERENCE.md`) and say  
> **"create chapter X.Y"** — the session will have all necessary context.

---

## Quick-Start Prompt (copy into a new session)

```
Read @2-BrowserJS/REFERENCE.md and @2-BrowserJS/01-DOM/001-DOM-Fundamentals.md
as your style reference, then create chapter <X.Y — Name>.
```

---

## 1. Repository Context

| Item | Value |
|---|---|
| Repo root | `/JavaScript-Guide/` |
| Master outline | `README.md` — Section II: Browser JavaScript (p. 928–2107) |
| Quality benchmark | `1-ECMAScript/01-Language-Fundamentals/001-Lexical-Structure.md` (~1700 lines) |
| This section | `2-BrowserJS/` |
| Naming convention | `NN-GroupName/NNN-Chapter-Name.md` (see §4) |

The ECMAScript section (`1-ECMAScript/`) has **25 chapter groups**, each folder  
containing numbered `.md` files. The Browser-JS section mirrors that exact pattern.

---

## 2. Writing Standard

Every chapter **must** match the depth of `001-Lexical-Structure.md`. Checklist:

- [ ] **Opening paragraph** — one concise intro explaining what the topic is and *why* it matters
- [ ] **Numbered sub-sections** matching the README outline (e.g. `## 1.1.1 DOM Tree Structure`)
- [ ] **Deep technical prose** — not bullet dumps; explain *how* and *why*
- [ ] **Extensive code blocks** with inline `// comments` on every non-obvious line
- [ ] **Gotcha/Edge-case sections** for every topic that has surprises
- [ ] **Best-practices list** (numbered, with rationale)
- [ ] **Comparison tables** wherever two alternatives exist (live vs static, etc.)
- [ ] **Performance implications** where relevant
- [ ] **Security implications** where relevant (XSS, CORS, permissions)
- [ ] **Browser compatibility notes** for anything that isn't universal
- [ ] **End-of-chapter summary table** + closing paragraph naming the next chapter
- [ ] Target length: **900–1800 lines** per chapter

### Chapter Template

```markdown
# X.Y Chapter Title

<One-paragraph introduction explaining the topic and why it matters.>

---

## X.Y.1 First Sub-Topic (from README outline)

### What It Is

<Explain.>

### How It Works

```javascript
// heavily commented example
```

### Gotchas

```javascript
// show the wrong way, then the right way
```

### Best Practices

1. …

---

## X.Y.2 Second Sub-Topic

…

---

## X.Y.N Summary

| Concept | Key Points |
|---|---|
| … | … |

---

**End of Chapter X.Y: Title**

<Recap of what was covered. Name of next chapter.>
```

---

## 3. Style Rules

| Rule | Detail |
|---|---|
| Code language tag | Always `javascript` (or `html`, `css` when appropriate) |
| Modern JS | Use ES2020+ syntax unless teaching legacy behaviour |
| Sloppy vs strict | Always note `"use strict"` differences when they exist |
| XSS | Call out any API that can introduce XSS with a ❌ / ✅ pattern |
| Variable names | `camelCase`; descriptive (`userInput`, not `x`) in examples |
| Sub-section IDs | `## X.Y.N Title` where X = group number, Y = chapter number within group, N = section within chapter |
| Cross-references | `(see chapter 1.5)` or `(see ECMAScript §3.5 Closures)` |
| No TOC | Do not add a table of contents; Obsidian generates one |
| No dates/times | Do not reference "as of 2024" etc.; content should be timeless |

---

## 4. Complete Chapter Map

Status key: ✅ Done · ⬜ Pending

### Group 01 — DOM (Document Object Model)

| # | Chapter | File | Status |
|---|---|---|---|
| 1.1 | DOM Fundamentals | `01-DOM/001-DOM-Fundamentals.md` | ✅ |
| 1.2 | Document Interface | `01-DOM/002-Document-Interface.md` | ✅ |
| 1.3 | Selecting Elements | `01-DOM/003-Selecting-Elements.md` | ✅ |
| 1.4 | Creating Elements | `01-DOM/004-Creating-Elements.md` | ✅ |
| 1.5 | Manipulating Elements | `01-DOM/005-Manipulating-Elements.md` | ✅ |
| 1.6 | Element Properties and Methods | `01-DOM/006-Element-Properties-Methods.md` | ✅ |
| 1.7 | DOM Traversal | `01-DOM/007-DOM-Traversal.md` | ✅ |
| 1.8 | ClassList API | `01-DOM/008-ClassList-API.md` | ✅ |

**README coverage (§II.1):**
- 1.1: DOM tree structure, Node types, Node relationships, NodeList vs HTMLCollection, Live vs static collections
- 1.2: `document` object, `documentElement`, `head`/`body`, `title`, `URL`/`domain`, `readyState`, `cookie`, `referrer`
- 1.3: `getElementById`, `getElementsByClassName`, `getElementsByTagName`, `getElementsByName`, `querySelector`, `querySelectorAll`, `closest`, `matches`
- 1.4: `createElement`, `createTextNode`, `createDocumentFragment`, `cloneNode`, `importNode`
- 1.5: `appendChild`, `insertBefore`, `replaceChild`, `removeChild`, `remove`, `append`/`prepend`, `before`/`after`, `replaceWith`
- 1.6: `innerHTML`/`outerHTML`, `textContent`/`innerText`, `id`/`className`/`classList`, `getAttribute`/`setAttribute`/`removeAttribute`/`hasAttribute`, `dataset`, `style`, `getComputedStyle`, `getBoundingClientRect`, `scrollIntoView`
- 1.7: `parentNode`/`parentElement`, `childNodes`/`children`, `firstChild`/`lastChild`, `firstElementChild`/`lastElementChild`, `nextSibling`/`previousSibling`, `nextElementSibling`/`previousElementSibling`
- 1.8: `add`/`remove`/`toggle`, `contains`/`replace`

---

### Group 02 — BOM (Browser Object Model)

| # | Chapter | File | Status |
|---|---|---|---|
| 2.1 | Window Object | `02-BOM/001-Window-Object.md` | ✅ |
| 2.2 | Location Object | `02-BOM/002-Location-Object.md` | ✅ |
| 2.3 | History Object | `02-BOM/003-History-Object.md` | ✅ |
| 2.4 | Navigator Object | `02-BOM/004-Navigator-Object.md` | ✅ |
| 2.5 | Screen Object | `02-BOM/005-Screen-Object.md` | ✅ |

**README coverage (§II.2):**
- 2.1: Global object, `innerWidth`/`innerHeight`, `outerWidth`/`outerHeight`, `scrollX`/`scrollY`, `pageXOffset`/`pageYOffset`, `open`/`close`, `moveTo`/`resizeTo`, `scrollTo`/`scrollBy`, `print`, `focus`/`blur`, `getSelection`, `matchMedia`
- 2.2: `href`, `protocol`/`host`/`hostname`, `port`/`pathname`/`search`/`hash`, `origin`, `assign`/`replace`/`reload`
- 2.3: `length`, `state`, `back`/`forward`/`go`, `pushState`/`replaceState`, `popstate` event
- 2.4: `userAgent`, `language`/`languages`, `platform`, `onLine`, `cookieEnabled`, `geolocation`, `mediaDevices`, `clipboard`, `credentials`, `permissions`, `serviceWorker`, `getBattery`, `share`, `vibrate`
- 2.5: `width`/`height`, `availWidth`/`availHeight`, `colorDepth`/`pixelDepth`, `orientation`

---

### Group 03 — Events

| # | Chapter | File | Status |
|---|---|---|---|
| 3.1 | Event Fundamentals | `03-Events/001-Event-Fundamentals.md` | ✅ |
| 3.2 | Event Handling | `03-Events/002-Event-Handling.md` | ✅ |
| 3.3 | Event Object | `03-Events/003-Event-Object.md` | ✅ |
| 3.4 | Mouse Events | `03-Events/004-Mouse-Events.md` | ✅ |
| 3.5 | Keyboard Events | `03-Events/005-Keyboard-Events.md` | ✅ |
| 3.6 | Form Events | `03-Events/006-Form-Events.md` | ✅ |
| 3.7 | Touch Events | `03-Events/007-Touch-Events.md` | ✅ |
| 3.8 | Pointer Events | `03-Events/008-Pointer-Events.md` | ✅ |
| 3.9 | Drag and Drop Events | `03-Events/009-Drag-Drop-Events.md` | ✅ |
| 3.10 | Window Events | `03-Events/010-Window-Events.md` | ✅ |
| 3.11 | Document Events | `03-Events/011-Document-Events.md` | ✅ |
| 3.12 | Custom Events | `03-Events/012-Custom-Events.md` | ✅ |
| 3.13 | Event Delegation | `03-Events/013-Event-Delegation.md` | ✅ |

**README coverage (§II.3):**
- 3.1: Event flow (capture → target → bubble), event object, event types
- 3.2: `addEventListener`, `removeEventListener`, options (capture, once, passive, signal), inline handlers, handler properties
- 3.3: `type`, `target`/`currentTarget`, `preventDefault`, `stopPropagation`/`stopImmediatePropagation`, `bubbles`/`cancelable`, `eventPhase`, `timeStamp`, `isTrusted`
- 3.4: `click`/`dblclick`/`contextmenu`, `mousedown`/`mouseup`/`mousemove`, `mouseenter`/`mouseleave`/`mouseover`/`mouseout`, `wheel`; clientX/pageX/screenX/button/buttons
- 3.5: `keydown`/`keyup`/`keypress`(deprecated); key/code/keyCode/altKey/ctrlKey/shiftKey/metaKey
- 3.6: `submit`/`reset`, `input`/`change`, `focus`/`blur`/`focusin`/`focusout`, `invalid`
- 3.7: `touchstart`/`touchend`/`touchmove`/`touchcancel`; touches/targetTouches/changedTouches
- 3.8: `pointerdown`/`pointerup`/`pointermove`/`pointercancel`, `pointerenter`/`pointerleave`; pointerId/pointerType/pressure/tiltX/tiltY
- 3.9: `drag`/`dragstart`/`dragend`, `dragenter`/`dragleave`/`dragover`/`drop`; DataTransfer/effectAllowed/dropEffect
- 3.10: `load`/`unload`/`beforeunload`, `resize`/`scroll`, `hashchange`/`popstate`, `online`/`offline`, `pagehide`/`pageshow`
- 3.11: `DOMContentLoaded`, `readystatechange`, `visibilitychange`
- 3.12: `CustomEvent` constructor, `dispatchEvent`, detail property
- 3.13: Pattern and benefits, performance considerations

---

### Group 04 — Forms

| # | Chapter | File | Status |
|---|---|---|---|
| 4.1 | Form Elements | `04-Forms/001-Form-Elements.md` | ✅ |
| 4.2 | Form API | `04-Forms/002-Form-API.md` | ✅ |
| 4.3 | Form Validation | `04-Forms/003-Form-Validation.md` | ✅ |
| 4.4 | FormData API | `04-Forms/004-FormData-API.md` | ✅ |

**README coverage (§II.4):**
- 4.1: `<form>`, `<input>`, `<textarea>`, `<select>`, `<button>`; value/checked/selected/disabled
- 4.2: `form.elements`, `submit`/`reset`, `focus`/`blur`, `select`, `setSelectionRange`
- 4.3: HTML5 validation attributes (required/pattern/min/max/minlength/maxlength); `validity` (ValidityState), `validationMessage`, `checkValidity`/`reportValidity`, `setCustomValidity`, Constraint Validation API
- 4.4: Creating FormData, `append`/`delete`/`get`/`getAll`/`has`/`set`, iterating, sending via fetch

---

### Group 05 — Storage APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 5.1 | Web Storage | `05-Storage-APIs/001-Web-Storage.md` | ✅ |
| 5.2 | Cookies | `05-Storage-APIs/002-Cookies.md` | ✅ |
| 5.3 | IndexedDB | `05-Storage-APIs/003-IndexedDB.md` | ✅ |
| 5.4 | Cache API | `05-Storage-APIs/004-Cache-API.md` | ✅ |
| 5.5 | Storage Manager | `05-Storage-APIs/005-Storage-Manager.md` | ✅ |

**README coverage (§II.5):**
- 5.1: localStorage (persistent) + sessionStorage (session-scoped); `setItem`/`getItem`/`removeItem`/`clear`/`key`; size limits; `storage` event
- 5.2: `document.cookie`; cookie attributes (expires/max-age/domain/path/secure/samesite/httponly); reading/deleting
- 5.3: Object stores, indexes, transactions, `indexedDB.open`, version changes, CRUD, cursors, key ranges, async (promise wrappers)
- 5.4: `caches.open`, `cache.put`/`add`/`addAll`, `cache.match`/`matchAll`, `cache.delete`/`keys`, Service Worker use
- 5.5: `navigator.storage.estimate`, `persist`, `persisted`

---

### Group 06 — Fetch and AJAX

| # | Chapter | File | Status |
|---|---|---|---|
| 6.1 | XMLHttpRequest | `06-Fetch-and-AJAX/001-XMLHttpRequest.md` | ⬜ |
| 6.2 | Fetch API | `06-Fetch-and-AJAX/002-Fetch-API.md` | ⬜ |
| 6.3 | Response Handling | `06-Fetch-and-AJAX/003-Response-Handling.md` | ⬜ |
| 6.4 | Request Cancellation | `06-Fetch-and-AJAX/004-Request-Cancellation.md` | ⬜ |
| 6.5 | CORS | `06-Fetch-and-AJAX/005-CORS.md` | ⬜ |

**README coverage (§II.6):**
- 6.1: Creating XHR, `open`/`send`, `onreadystatechange`, `readyState`/`status`, `responseText`/`responseXML`/`response`, `setRequestHeader`/`getResponseHeader`, `abort`, upload progress
- 6.2: Basic `fetch`, returns Promise; Request/Response/Headers objects; GET/POST/PUT/DELETE; options (method/headers/body/mode/credentials/cache/redirect)
- 6.3: `response.ok`/`status`/`statusText`; `json`/`text`/`blob`/`arrayBuffer`/`formData`; `headers`; `clone`; streaming `response.body` (ReadableStream)
- 6.4: AbortController, AbortSignal, timeout patterns
- 6.5: Same-origin policy, CORS headers, preflight requests, credentials in CORS

---

### Group 07 — Multimedia APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 7.1 | Canvas API | `07-Multimedia-APIs/001-Canvas-API.md` | ⬜ |
| 7.2 | WebGL | `07-Multimedia-APIs/002-WebGL.md` | ⬜ |
| 7.3 | Web Audio API | `07-Multimedia-APIs/003-Web-Audio-API.md` | ⬜ |
| 7.4 | WebRTC | `07-Multimedia-APIs/004-WebRTC.md` | ⬜ |
| 7.5 | Media Capture and Streams | `07-Multimedia-APIs/005-Media-Capture-and-Streams.md` | ⬜ |
| 7.6 | MediaRecorder API | `07-Multimedia-APIs/006-MediaRecorder-API.md` | ⬜ |
| 7.7 | HTMLMediaElement | `07-Multimedia-APIs/007-HTMLMediaElement.md` | ⬜ |
| 7.8 | Picture-in-Picture API | `07-Multimedia-APIs/008-Picture-in-Picture-API.md` | ⬜ |

**README coverage (§II.7):**
- 7.1: 2D context; shapes/paths/arcs/curves; fillStyle/strokeStyle/gradients/patterns; text; images/pixels; transformations; compositing; `toDataURL`/`toBlob`; OffscreenCanvas
- 7.2: 3D context; shaders (vertex/fragment); buffers/attributes; textures; extensions; WebGL2
- 7.3: AudioContext; audio nodes (source/gain/filter); connecting nodes; oscillators; buffers; spatial audio; AnalyserNode
- 7.4: RTCPeerConnection; media streams; signaling; ICE candidates; data channels; screen sharing
- 7.5: `getUserMedia`; MediaStream/MediaStreamTrack; constraints; `getDisplayMedia`
- 7.6: Recording streams; `start`/`stop`/`pause`/`resume`; `ondataavailable`; output formats
- 7.7: `<audio>`/`<video>`; currentTime/duration/paused/volume/playbackRate; play/pause/load; events; text tracks
- 7.8: `requestPictureInPicture`; PictureInPictureWindow; events

---

### Group 08 — Graphics and Visualization

| # | Chapter | File | Status |
|---|---|---|---|
| 8.1 | SVG | `08-Graphics-and-Visualization/001-SVG.md` | ⬜ |
| 8.2 | Web Animations API | `08-Graphics-and-Visualization/002-Web-Animations-API.md` | ⬜ |

**README coverage (§II.8):**
- 8.1: Inline SVG; SVG DOM manipulation; animating SVG; SVG paths; SVG filters
- 8.2: `element.animate()`; keyframes; options (duration/delay/easing/iterations); control (play/pause/reverse/cancel); AnimationPlaybackEvent

---

### Group 09 — Web Workers

| # | Chapter | File | Status |
|---|---|---|---|
| 9.1 | Dedicated Workers | `09-Web-Workers/001-Dedicated-Workers.md` | ⬜ |
| 9.2 | Shared Workers | `09-Web-Workers/002-Shared-Workers.md` | ⬜ |
| 9.3 | Service Workers | `09-Web-Workers/003-Service-Workers.md` | ⬜ |
| 9.4 | Worklets | `09-Web-Workers/004-Worklets.md` | ⬜ |

**README coverage (§II.9):**
- 9.1: Creating workers; `postMessage`/`onmessage`; transferable objects; worker scope; importing scripts; termination
- 9.2: Multiple browsing contexts; ports and message channels
- 9.3: Registration; lifecycle (install/activate/fetch); caching strategies; offline; push notifications; background sync; Clients API; skip waiting; update mechanisms
- 9.4: Audio Worklet; Paint Worklet; Animation Worklet; Layout Worklet

---

### Group 10 — Progressive Web Apps

| # | Chapter | File | Status |
|---|---|---|---|
| 10.1 | Web App Manifest | `10-Progressive-Web-Apps/001-Web-App-Manifest.md` | ⬜ |
| 10.2 | Service Worker Strategies | `10-Progressive-Web-Apps/002-Service-Worker-Strategies.md` | ⬜ |
| 10.3 | App Installation | `10-Progressive-Web-Apps/003-App-Installation.md` | ⬜ |

**README coverage (§II.10):**
- 10.1: `manifest.json` structure; icons/colors/display modes; installation
- 10.2: Cache-first; Network-first; Stale-while-revalidate; Network-only; Cache-only
- 10.3: `beforeinstallprompt` event; install prompts; app banners

---

### Group 11 — Notifications and Messaging

| # | Chapter | File | Status |
|---|---|---|---|
| 11.1 | Notifications API | `11-Notifications-and-Messaging/001-Notifications-API.md` | ⬜ |
| 11.2 | Push API | `11-Notifications-and-Messaging/002-Push-API.md` | ⬜ |
| 11.3 | Broadcast Channel API | `11-Notifications-and-Messaging/003-Broadcast-Channel-API.md` | ⬜ |
| 11.4 | Channel Messaging API | `11-Notifications-and-Messaging/004-Channel-Messaging-API.md` | ⬜ |

**README coverage (§II.11):**
- 11.1: Requesting permission; creating notifications; options (body/icon/badge/tag/actions); events (click/close)
- 11.2: Push subscriptions; push messages from server; Service Worker integration; VAPID keys
- 11.3: Cross-tab communication; `postMessage`/`onmessage`
- 11.4: MessageChannel; MessagePort; worker communication

---

### Group 12 — Device APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 12.1 | Geolocation API | `12-Device-APIs/001-Geolocation-API.md` | ⬜ |
| 12.2 | Device Orientation and Motion | `12-Device-APIs/002-Device-Orientation-and-Motion.md` | ⬜ |
| 12.3 | Battery Status API | `12-Device-APIs/003-Battery-Status-API.md` | ⬜ |
| 12.4 | Vibration API | `12-Device-APIs/004-Vibration-API.md` | ⬜ |
| 12.5 | Ambient Light API | `12-Device-APIs/005-Ambient-Light-API.md` | ⬜ |
| 12.6 | Proximity API | `12-Device-APIs/006-Proximity-API.md` | ⬜ |

**README coverage (§II.12):**
- 12.1: `getCurrentPosition`; `watchPosition`/`clearWatch`; Position object; options (enableHighAccuracy/timeout/maximumAge); error handling
- 12.2: `deviceorientation` event; `devicemotion` event; accelerometer/gyroscope data
- 12.3: `navigator.getBattery`; BatteryManager (charging/level/chargingTime/dischargingTime)
- 12.4: `navigator.vibrate`; vibration patterns
- 12.5: `devicelight` event (limited support)
- 12.6: Device proximity events (deprecated/limited)

---

### Group 13 — Sensor APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 13.1 | Generic Sensor API | `13-Sensor-APIs/001-Generic-Sensor-API.md` | ⬜ |
| 13.2 | Specific Sensors | `13-Sensor-APIs/002-Specific-Sensors.md` | ⬜ |

**README coverage (§II.13):**
- 13.1: Sensor base class; reading sensor data; sensor states
- 13.2: Accelerometer; Gyroscope; Magnetometer; AbsoluteOrientationSensor; RelativeOrientationSensor; LinearAccelerationSensor; GravitySensor

---

### Group 14 — Connectivity APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 14.1 | WebSocket | `14-Connectivity-APIs/001-WebSocket.md` | ⬜ |
| 14.2 | Server-Sent Events | `14-Connectivity-APIs/002-Server-Sent-Events.md` | ⬜ |
| 14.3 | Network Information API | `14-Connectivity-APIs/003-Network-Information-API.md` | ⬜ |
| 14.4 | Online/Offline Detection | `14-Connectivity-APIs/004-Online-Offline-Detection.md` | ⬜ |

**README coverage (§II.14):**
- 14.1: Creating WebSocket; `send`; events (open/message/error/close); binary data; subprotocols
- 14.2: EventSource; one-way communication; event types; reconnection
- 14.3: `navigator.connection`; effectiveType/downlink/rtt/saveData; `change` event
- 14.4: `navigator.onLine`; `online`/`offline` events

---

### Group 15 — File APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 15.1 | File API | `15-File-APIs/001-File-API.md` | ⬜ |
| 15.2 | FileReader | `15-File-APIs/002-FileReader.md` | ⬜ |
| 15.3 | Blob API | `15-File-APIs/003-Blob-API.md` | ⬜ |
| 15.4 | File System Access API | `15-File-APIs/004-File-System-Access-API.md` | ⬜ |
| 15.5 | Drag and Drop Files | `15-File-APIs/005-Drag-and-Drop-Files.md` | ⬜ |

**README coverage (§II.15):**
- 15.1: File object; FileList; reading from `<input type="file">`
- 15.2: `readAsText`/`readAsDataURL`/`readAsArrayBuffer`/`readAsBinaryString`; progress events; error handling
- 15.3: Creating Blobs; size/type; `Blob.slice`; Object URLs (`createObjectURL`/`revokeObjectURL`)
- 15.4: `showOpenFilePicker`/`showSaveFilePicker`/`showDirectoryPicker`; FileSystemFileHandle/DirectoryHandle; permission handling; reading/writing
- 15.5: File drops; `DataTransfer.files`

---

### Group 16 — Clipboard API

| # | Chapter | File | Status |
|---|---|---|---|
| 16.1 | Clipboard Operations | `16-Clipboard-API/001-Clipboard-Operations.md` | ⬜ |
| 16.2 | Legacy Clipboard | `16-Clipboard-API/002-Legacy-Clipboard.md` | ⬜ |

**README coverage (§II.16):**
- 16.1: `navigator.clipboard.writeText`/`readText`; `write`/`read` (images/HTML); ClipboardItem; permissions
- 16.2: `document.execCommand('copy')`; `copy`/`cut`/`paste` events

---

### Group 17 — Payment APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 17.1 | Payment Request API | `17-Payment-APIs/001-Payment-Request-API.md` | ⬜ |
| 17.2 | Payment Handler API | `17-Payment-APIs/002-Payment-Handler-API.md` | ⬜ |

**README coverage (§II.17):**
- 17.1: PaymentRequest constructor; payment methods; `show`; payment response; complete/abort
- 17.2: Implementing payment handlers; Service Worker integration

---

### Group 18 — Credential Management API

| # | Chapter | File | Status |
|---|---|---|---|
| 18.1 | Credentials | `18-Credential-Management-API/001-Credentials.md` | ⬜ |
| 18.2 | Operations | `18-Credential-Management-API/002-Operations.md` | ⬜ |
| 18.3 | Web Authentication (WebAuthn) | `18-Credential-Management-API/003-Web-Authentication.md` | ⬜ |

**README coverage (§II.18):**
- 18.1: PasswordCredential; FederatedCredential; PublicKeyCredential (WebAuthn)
- 18.2: `navigator.credentials.get`/`store`/`create`/`preventSilentAccess`
- 18.3: Biometric authentication; authenticator attachment; challenge/response; attestation

---

### Group 19 — Permissions API

| # | Chapter | File | Status |
|---|---|---|---|
| 19.1 | Permission Queries | `19-Permissions-API/001-Permission-Queries.md` | ⬜ |
| 19.2 | Permission Events | `19-Permissions-API/002-Permission-Events.md` | ⬜ |

**README coverage (§II.19):**
- 19.1: `navigator.permissions.query`; permission states (granted/denied/prompt); permission descriptors
- 19.2: `change` event on permission status

---

### Group 20 — Web Share API

| # | Chapter | File | Status |
|---|---|---|---|
| 20.1 | Sharing Content | `20-Web-Share-API/001-Sharing-Content.md` | ⬜ |

**README coverage (§II.20):**
- 20.1: `navigator.share`; share data (title/text/url/files); share target API

---

### Groups 21–36 — Specialized APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 21.1 | Selecting Contacts | `21-Contact-Picker-API/001-Selecting-Contacts.md` | ⬜ |
| 22.1 | Preventing Sleep | `22-Screen-Wake-Lock-API/001-Preventing-Sleep.md` | ⬜ |
| 23.1 | User Idle State | `23-Idle-Detection-API/001-User-Idle-State.md` | ⬜ |
| 24.1 | Serial Port Access | `24-Web-Serial-API/001-Serial-Port-Access.md` | ⬜ |
| 25.1 | USB Device Access | `25-Web-USB-API/001-USB-Device-Access.md` | ⬜ |
| 26.1 | Bluetooth Device Access | `26-Web-Bluetooth-API/001-Bluetooth-Device-Access.md` | ⬜ |
| 27.1 | NFC Operations | `27-Web-NFC-API/001-NFC-Operations.md` | ⬜ |
| 28.1 | MIDI Access | `28-Web-MIDI-API/001-MIDI-Access.md` | ⬜ |
| 29.1 | Gamepad Input | `29-Gamepad-API/001-Gamepad-Input.md` | ⬜ |
| 30.1 | Orientation Control | `30-Screen-Orientation-API/001-Orientation-Control.md` | ⬜ |
| 31.1 | Fullscreen Mode | `31-Fullscreen-API/001-Fullscreen-Mode.md` | ⬜ |
| 32.1 | Mouse Lock | `32-Pointer-Lock-API/001-Mouse-Lock.md` | ⬜ |
| 33.1 | Visibility State | `33-Page-Visibility-API/001-Visibility-State.md` | ⬜ |
| 34.1 | Element Visibility Detection | `34-Intersection-Observer-API/001-Element-Visibility-Detection.md` | ⬜ |
| 35.1 | DOM Change Detection | `35-Mutation-Observer-API/001-DOM-Change-Detection.md` | ⬜ |
| 36.1 | Element Size Changes | `36-Resize-Observer-API/001-Element-Size-Changes.md` | ⬜ |

**README coverage (§II.21–36):**
- 21.1: `navigator.contacts.select`; contact properties; privacy
- 22.1: `navigator.wakeLock.request`; WakeLockSentinel; releasing
- 23.1: IdleDetector; `start`; user state (active/idle); screen state (locked/unlocked)
- 24.1: `navigator.serial.requestPort`; reading/writing; port configuration
- 25.1: `navigator.usb.requestDevice`; USB communication; control/bulk transfers
- 26.1: `navigator.bluetooth.requestDevice`; GATT services/characteristics; reading/writing; notifications
- 27.1: NDEFReader; reading/writing NFC tags; record types
- 28.1: `navigator.requestMIDIAccess`; MIDI inputs/outputs; sending/receiving messages
- 29.1: `navigator.getGamepads`; Gamepad object (buttons/axes); events; polling
- 30.1: `screen.orientation`; `lock`/`unlock`; `change` event; types (portrait/landscape)
- 31.1: `element.requestFullscreen`; `document.exitFullscreen`; `fullscreenElement`; events
- 32.1: `element.requestPointerLock`; `document.exitPointerLock`; movementX/Y; use cases
- 33.1: `document.hidden`; `document.visibilityState`; `visibilitychange` event; use cases
- 34.1: Creating observers; callback; intersection ratio; root/root margin; thresholds; use cases (lazy loading/infinite scroll)
- 35.1: Creating observers; callback; mutation records; observing attributes/childList/characterData/subtree; `disconnect`/`takeRecords`
- 36.1: Creating observers; callback; ResizeObserverEntry; content rect vs border box; use cases

---

### Group 37 — Performance APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 37.1 | Performance Object | `37-Performance-APIs/001-Performance-Object.md` | ⬜ |
| 37.2 | Navigation Timing API | `37-Performance-APIs/002-Navigation-Timing-API.md` | ⬜ |
| 37.3 | Resource Timing API | `37-Performance-APIs/003-Resource-Timing-API.md` | ⬜ |
| 37.4 | User Timing API | `37-Performance-APIs/004-User-Timing-API.md` | ⬜ |
| 37.5 | Paint Timing API | `37-Performance-APIs/005-Paint-Timing-API.md` | ⬜ |
| 37.6 | Long Tasks API | `37-Performance-APIs/006-Long-Tasks-API.md` | ⬜ |
| 37.7 | Element Timing API | `37-Performance-APIs/007-Element-Timing-API.md` | ⬜ |
| 37.8 | Event Timing API | `37-Performance-APIs/008-Event-Timing-API.md` | ⬜ |
| 37.9 | Server Timing API | `37-Performance-APIs/009-Server-Timing-API.md` | ⬜ |
| 37.10 | Performance Observer | `37-Performance-APIs/010-Performance-Observer.md` | ⬜ |

**README coverage (§II.37):**
- 37.1: `performance.now()`; high-resolution timestamps
- 37.2: `performance.getEntriesByType('navigation')`; navigation timing metrics
- 37.3: `performance.getEntriesByType('resource')`; load metrics for scripts/stylesheets/images
- 37.4: `performance.mark`/`measure`; custom metrics
- 37.5: First Paint (FP); First Contentful Paint (FCP); `getEntriesByType('paint')`
- 37.6: Detecting long tasks (>50ms); `getEntriesByType('longtask')`; PerformanceObserver
- 37.7: Measuring specific element render times; `elementtiming` attribute
- 37.8: Input delay measurement; First Input Delay (FID)
- 37.9: Server-Timing header; backend performance metrics
- 37.10: Observing performance entries; entry types and buffering

---

### Group 38 — Reporting API

| # | Chapter | File | Status |
|---|---|---|---|
| 38.1 | Deprecation Reports | `38-Reporting-API/001-Deprecation-Reports.md` | ⬜ |
| 38.2 | Intervention Reports | `38-Reporting-API/002-Intervention-Reports.md` | ⬜ |
| 38.3 | Crash Reports | `38-Reporting-API/003-Crash-Reports.md` | ⬜ |
| 38.4 | ReportingObserver | `38-Reporting-API/004-ReportingObserver.md` | ⬜ |

---

### Group 39 — Web Speech API

| # | Chapter | File | Status |
|---|---|---|---|
| 39.1 | Speech Recognition | `39-Web-Speech-API/001-Speech-Recognition.md` | ⬜ |
| 39.2 | Speech Synthesis | `39-Web-Speech-API/002-Speech-Synthesis.md` | ⬜ |

**README coverage (§II.39):**
- 39.1: SpeechRecognition; starting/stopping; results; language; continuous vs single
- 39.2: SpeechSynthesis; `speak`; SpeechSynthesisUtterance; voices; pitch/rate/volume

---

### Group 40 — Web Components

| # | Chapter | File | Status |
|---|---|---|---|
| 40.1 | Custom Elements | `40-Web-Components/001-Custom-Elements.md` | ⬜ |
| 40.2 | Shadow DOM | `40-Web-Components/002-Shadow-DOM.md` | ⬜ |
| 40.3 | HTML Templates | `40-Web-Components/003-HTML-Templates.md` | ⬜ |

**README coverage (§II.40):**
- 40.1: `customElements.define`; autonomous/customized built-in elements; lifecycle callbacks (connected/disconnected/attributeChanged/adopted); `observedAttributes`
- 40.2: `attachShadow`; encapsulation; slots; `::slotted`; open/closed modes; event retargeting
- 40.3: `<template>`/`<slot>`; content cloning; template instantiation

---

### Groups 41–57 — Platform APIs

| # | Chapter | File | Status |
|---|---|---|---|
| 41.1 | TextEncoder | `41-Encoding-API/001-TextEncoder.md` | ⬜ |
| 41.2 | TextDecoder | `41-Encoding-API/002-TextDecoder.md` | ⬜ |
| 42.1 | CompressionStream | `42-Compression-Streams-API/001-CompressionStream.md` | ⬜ |
| 42.2 | DecompressionStream | `42-Compression-Streams-API/002-DecompressionStream.md` | ⬜ |
| 43.1 | ReadableStream | `43-Streams-API/001-ReadableStream.md` | ⬜ |
| 43.2 | WritableStream | `43-Streams-API/002-WritableStream.md` | ⬜ |
| 43.3 | TransformStream | `43-Streams-API/003-TransformStream.md` | ⬜ |
| 43.4 | Byte Streams | `43-Streams-API/004-Byte-Streams.md` | ⬜ |
| 44.1 | SubtleCrypto | `44-Web-Cryptography-API/001-SubtleCrypto.md` | ⬜ |
| 44.2 | Cryptographic Operations | `44-Web-Cryptography-API/002-Cryptographic-Operations.md` | ⬜ |
| 44.3 | Random Values | `44-Web-Cryptography-API/003-Random-Values.md` | ⬜ |
| 45.1 | WebAssembly Object | `45-WebAssembly/001-WebAssembly-Object.md` | ⬜ |
| 45.2 | Module and Instance | `45-WebAssembly/002-Module-and-Instance.md` | ⬜ |
| 45.3 | JavaScript Interop | `45-WebAssembly/003-JavaScript-Interop.md` | ⬜ |
| 46.1 | XR Session | `46-Web-XR/001-XR-Session.md` | ⬜ |
| 46.2 | XR Frame Loop | `46-Web-XR/002-XR-Frame-Loop.md` | ⬜ |
| 46.3 | Input Sources | `46-Web-XR/003-Input-Sources.md` | ⬜ |
| 46.4 | Hit Testing | `46-Web-XR/004-Hit-Testing.md` | ⬜ |
| 47.1 | Text Selection | `47-Selection-API/001-Text-Selection.md` | ⬜ |
| 47.2 | Range API | `47-Selection-API/002-Range-API.md` | ⬜ |
| 48.1 | Color Picking | `48-Eye-Dropper-API/001-Color-Picking.md` | ⬜ |
| 49.1 | App Badge | `49-Badging-API/001-App-Badge.md` | ⬜ |
| 50.1 | Offline Content | `50-Content-Index-API/001-Offline-Content.md` | ⬜ |
| 51.1 | Lock Management | `51-Web-Locks-API/001-Lock-Management.md` | ⬜ |
| 52.1 | Keyboard Layout | `52-Keyboard-API/001-Keyboard-Layout.md` | ⬜ |
| 53.1 | Async Cookie Access | `53-Cookie-Store-API/001-Async-Cookie-Access.md` | ⬜ |
| 54.1 | HTML Sanitization | `54-Sanitizer-API/001-HTML-Sanitization.md` | ⬜ |
| 55.1 | System Pressure | `55-Compute-Pressure-API/001-System-Pressure.md` | ⬜ |
| 56.1 | Federated Login | `56-FedCM/001-Federated-Login.md` | ⬜ |
| 57.1 | Page Transitions | `57-View-Transitions-API/001-Page-Transitions.md` | ⬜ |

**README coverage (§II.41–57):**
- 41.1/41.2: TextEncoder (strings → Uint8Array, UTF-8); TextDecoder (Uint8Array → strings, multiple encodings, streaming)
- 42: CompressionStream/DecompressionStream (gzip/deflate/deflate-raw); streaming compression
- 43: ReadableStream (create/read/pipe/tee); WritableStream (create/write); TransformStream; BYOB readers
- 44: `crypto.subtle` (SHA/AES/RSA/ECDSA); hashing/encrypt/decrypt/sign/verify; key generation/derivation/import/export; `crypto.getRandomValues`/`randomUUID`
- 45: `WebAssembly.compile`/`instantiate`/`validate`; Module/Instance; Memory/Table; JS↔Wasm interop
- 46: XR sessions (immersive-vr/ar/inline); XR frame loop; controllers/hand tracking; hit testing
- 47: `window.getSelection`; Selection object; Range API (boundaries/cloneContents/deleteContents)
- 48: EyeDropper; `open()`; color selection from screen
- 49: `navigator.setAppBadge`/`clearAppBadge`; badge counts
- 50: Adding content to offline index (PWA)
- 51: `navigator.locks.request`; exclusive/shared locks
- 52: `navigator.keyboard.getLayoutMap`; physical key mapping
- 53: `cookieStore.get`/`getAll`/`set`/`delete`; cookie change events
- 54: Sanitizer constructor; `sanitize`; config; XSS prevention
- 55: PressureObserver; CPU/thermal pressure; adaptive performance
- 56: Identity provider integration; `navigator.credentials.get` with identity
- 57: `document.startViewTransition`; cross-document transitions; custom animation

---

### Group 58 — Accessibility (a11y)

| # | Chapter | File | Status |
|---|---|---|---|
| 58.1 | ARIA Fundamentals | `58-Accessibility/001-ARIA-Fundamentals.md` | ⬜ |
| 58.2 | Keyboard Navigation | `58-Accessibility/002-Keyboard-Navigation.md` | ⬜ |
| 58.3 | Screen Reader Support | `58-Accessibility/003-Screen-Reader-Support.md` | ⬜ |
| 58.4 | Accessible Forms | `58-Accessibility/004-Accessible-Forms.md` | ⬜ |
| 58.5 | Accessible Components | `58-Accessibility/005-Accessible-Components.md` | ⬜ |
| 58.6 | Testing for Accessibility | `58-Accessibility/006-Testing-for-Accessibility.md` | ⬜ |

**README coverage (§II.58):**
- 58.1: ARIA roles/states/properties; semantic HTML; landmark roles
- 58.2: Tab order; focus management; keyboard shortcuts; focus indicators
- 58.3: ARIA labels/descriptions; live regions; hidden content
- 58.4: Label associations; error messaging; required fields; input hints
- 58.5: Modals/dialogs; menus/dropdowns; carousels/sliders; tables
- 58.6: Automated tools; manual techniques; screen reader testing; color contrast

---

## 5. Progress Tracker

| Metric | Value |
|---|---|
| Total chapter files | ~160 |
| Completed | 1 |
| Remaining | ~159 |
| Next chapter | **1.2 Document Interface** → `01-DOM/002-Document-Interface.md` |

---

## 6. Recommended Session Prompt

Paste this at the start of any new session:

```
Read @2-BrowserJS/REFERENCE.md to understand the project context, style
standard, and file naming convention.

Then read @2-BrowserJS/01-DOM/001-DOM-Fundamentals.md as the style
benchmark.

Create chapter 1.2 — Document Interface at:
2-BrowserJS/01-DOM/002-Document-Interface.md

Follow every rule in the REFERENCE writing standard exactly.
```

Replace `1.2 — Document Interface` and the file path with the next
pending chapter from the chapter map (§4 above).
