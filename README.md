# JavaScript Mastery Guide

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Markdown](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white)

![Modules](https://img.shields.io/badge/Modules-125+-blue?style=flat-square)
![Lines](https://img.shields.io/badge/Lines-169K+-green?style=flat-square)
![Size](https://img.shields.io/badge/Size-3.7MB-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A comprehensive, in-depth JavaScript reference covering everything from core language fundamentals to advanced browser APIs, Node.js, build tools, browser extensions, and professional best practices. Organized as an Obsidian-friendly vault with 125+ modules.

---

## 🌐 Live Site

<p align="center">
  <a href="https://amor-self-learning.github.io/JavaScript-Guide/">
    <img src="https://img.shields.io/badge/📖_Read_Online-JavaScript_Guide-4CAF50?style=for-the-badge" alt="Read Online">
  </a>
</p>

---

## 📚 Table of Contents

> 📋 For the complete detailed outline, see **[Table_of_contents.md](Table_of_contents.md)**

### Section I: ECMAScript (Core JavaScript)
![ECMAScript](https://img.shields.io/badge/ECMAScript-ES2024-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
*25 modules covering the language specification*

| # | Module | Topics |
|---|--------|--------|
| 01 | [Language Fundamentals](1-ECMAScript/01-Language-Fundamentals.md) | Lexical structure, variables, data types, operators |
| 02 | [Control Flow](1-ECMAScript/02-Control-Flow.md) | Conditionals, loops, iteration |
| 03 | [Functions](1-ECMAScript/03-Functions.md) | Declarations, expressions, arrows, closures |
| 04 | [Objects](1-ECMAScript/04-Objects.md) | Creation, properties, methods, descriptors |
| 05 | [Prototype](1-ECMAScript/05-Prototype.md) | Prototype chain, inheritance, delegation |
| 06 | [Classes](1-ECMAScript/06-Classes.md) | ES6 classes, static members, private fields |
| 07 | [Arrays](1-ECMAScript/07-Arrays.md) | Methods, iteration, typed arrays |
| 08 | [Strings](1-ECMAScript/08-Strings.md) | Methods, template literals, Unicode |
| 09 | [RegExp](1-ECMAScript/09-RegExp.md) | Patterns, flags, methods |
| 10 | [Symbols](1-ECMAScript/10-Symbols.md) | Symbol creation, well-known symbols |
| 11 | [Iterators and Generators](1-ECMAScript/11-Iterators-and-Generators.md) | Iteration protocols, generator functions |
| 12 | [Collections](1-ECMAScript/12-Collections.md) | Map, Set, WeakMap, WeakSet |
| 13 | [Async JavaScript](1-ECMAScript/13-Async-JavaScript.md) | Event loop, promises, async/await |
| 14 | [Modules](1-ECMAScript/14-Modules.md) | ES modules, import/export |
| 15 | [Proxy and Reflection](1-ECMAScript/15-Proxy-and-Reflection.md) | Proxy traps, Reflect API |
| 16 | [Meta Programming](1-ECMAScript/16-Meta-Programming.md) | eval, with, metaprogramming patterns |
| 17 | [Memory Management](1-ECMAScript/17-Memory-Management.md) | Garbage collection, WeakRef, FinalizationRegistry |
| 18 | [Internationalization](1-ECMAScript/18-Internationalization.md) | Intl API, localization |
| 19 | [Atomics and SharedArrayBuffer](1-ECMAScript/19-Atomics-and-SharedArrayBuffer.md) | Shared memory, atomic operations |
| 20 | [Temporal API](1-ECMAScript/20-Temporal-API-S3.md) | Modern date/time handling (Stage 3) |
| 21 | [Decorators](1-ECMAScript/21-Decorators-S3.md) | Class decorators (Stage 3) |
| 22 | [Design Patterns](1-ECMAScript/22-Design-Patterns.md) | Creational, structural, behavioral patterns |
| 23 | [Performance Optimization](1-ECMAScript/23-Performance-Optimization.md) | V8 internals, optimization techniques |
| 24 | [Security Best Practices](1-ECMAScript/24-Security-Best-Practices.md) | XSS, injection, secure coding |
| 25 | [Future Features](1-ECMAScript/25-Other-Proposals-and-Future-Features.md) | TC39 proposals, upcoming features |

---

### Section II: Browser JavaScript
![Browser](https://img.shields.io/badge/Web_APIs-Modern_Browser-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
*58 modules covering Web Platform APIs*

| # | Module | Topics |
|---|--------|--------|
| 01 | [DOM](2-BrowserJS/01-DOM.md) | Document Object Model, traversal, manipulation |
| 02 | [BOM](2-BrowserJS/02-BOM.md) | Window, Navigator, Location, History |
| 03 | [Events](2-BrowserJS/03-Events.md) | Event handling, propagation, delegation |
| 04 | [Forms](2-BrowserJS/04-Forms.md) | Form handling, validation |
| 05 | [Storage APIs](2-BrowserJS/05-Storage-APIs.md) | localStorage, sessionStorage, IndexedDB |
| 06 | [Fetch and AJAX](2-BrowserJS/06-Fetch-and-AJAX.md) | Fetch API, XMLHttpRequest |
| 07 | [Multimedia APIs](2-BrowserJS/07-Multimedia-APIs.md) | Audio, Video, MediaRecorder |
| 08 | [Graphics and Visualization](2-BrowserJS/08-Graphics-and-Visualization.md) | Canvas 2D, SVG |
| 09 | [Web Workers](2-BrowserJS/09-Web-Workers.md) | Dedicated, Shared, Service Workers |
| 10 | [Progressive Web Apps](2-BrowserJS/10-Progressive-Web-Apps.md) | Manifest, caching, offline |
| 11 | [Notifications and Messaging](2-BrowserJS/11-Notifications-and-Messaging.md) | Push, Notifications |
| 12 | [Device APIs](2-BrowserJS/12-Device-APIs.md) | Geolocation, Camera, Vibration |
| 13–36 | Device & Sensor APIs | Sensors, Bluetooth, NFC, MIDI, Serial, USB |
| 37–46 | Performance & Graphics | Observers, WebGL, WebGPU, WebXR |
| 47–58 | Advanced Browser APIs | View Transitions, CSP, Trusted Types, Accessibility |

---

### Section III: Node.js
![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=nodedotjs&logoColor=white)
*25 modules covering server-side JavaScript*

| # | Module | Topics |
|---|--------|--------|
| 01 | [Fundamentals](3-NodeJS/01-Fundamentals.md) | Architecture, global objects, event loop |
| 02 | [Module Systems](3-NodeJS/02-Module-Systems.md) | CommonJS, ES modules, resolution |
| 03 | [File System](3-NodeJS/03-File-System.md) | Reading, writing, watching files |
| 04 | [Path](3-NodeJS/04-Path.md) | Path manipulation utilities |
| 05 | [HTTP and HTTPS](3-NodeJS/05-HTTP-and-HTTPS.md) | Servers, requests, routing |
| 06 | [Events](3-NodeJS/06-Events.md) | EventEmitter patterns |
| 07 | [Streams](3-NodeJS/07-Streams.md) | Readable, Writable, Transform |
| 08 | [Buffer](3-NodeJS/08-Buffer.md) | Binary data handling |
| 09 | [URL and QueryString](3-NodeJS/09-URL-and-QueryString.md) | URL parsing and manipulation |
| 10 | [OS](3-NodeJS/10-OS.md) | System information |
| 11 | [Crypto](3-NodeJS/11-Crypto.md) | Encryption, hashing, signatures |
| 12 | [Child Process](3-NodeJS/12-Child-Process.md) | spawn, exec, fork |
| 13 | [Cluster](3-NodeJS/13-Cluster.md) | Multi-process scaling |
| 14 | [Process](3-NodeJS/14-Process.md) | Process information and control |
| 15 | [Timers](3-NodeJS/15-Timers.md) | setTimeout, setInterval, setImmediate |
| 16 | [Utilities](3-NodeJS/16-Utilities.md) | util module helpers |
| 17 | [Net and DNS](3-NodeJS/17-Net-and-DNS.md) | TCP/IPC networking |
| 18 | [Readline](3-NodeJS/18-Readline.md) | Interactive CLI input |
| 19 | [Compression](3-NodeJS/19-Compression.md) | zlib, gzip, brotli |
| 20 | [Advanced Core Modules](3-NodeJS/20-Advanced-Core-Modules.md) | assert, perf_hooks, async_hooks |
| 21 | [Worker Threads](3-NodeJS/21-Worker-Threads.md) | Multi-threading |
| 22 | [Test Runner](3-NodeJS/22-Test-Runner.md) | Built-in testing |
| 23 | [NPM and Package Management](3-NodeJS/23-NPM-and-Package-Management.md) | npm workflows |
| 24 | [Advanced Concepts](3-NodeJS/24-Advanced-Concepts.md) | Error handling, debugging, security |
| 25 | [Ecosystem](3-NodeJS/25-Ecosystem.md) | Frameworks, databases, tools |

---

### Section IV: Build Tools & Development Environment
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Webpack](https://img.shields.io/badge/Webpack-8DD6F9?style=flat-square&logo=webpack&logoColor=black)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)
*8 modules covering modern JS tooling*

| # | Module | Topics |
|---|--------|--------|
| 01 | [Build Tools and Bundlers](4-BuildTools-and-DevEnvironment/01-Build-Tools-and-Bundlers.md) | Webpack, Vite, Rollup, Parcel, esbuild, SWC |
| 02 | [Transpilers and Compilers](4-BuildTools-and-DevEnvironment/02-Transpilers-and-Compilers.md) | Babel, TypeScript |
| 03 | [Linters and Formatters](4-BuildTools-and-DevEnvironment/03-Linters-and-Formatters.md) | ESLint, Prettier, Stylelint |
| 04 | [Testing Frameworks](4-BuildTools-and-DevEnvironment/04-Testing-Frameworks.md) | Jest, Vitest, Mocha, Cypress, Playwright |
| 05 | [Version Control and Git](4-BuildTools-and-DevEnvironment/05-Version-Control-and-Git.md) | Git fundamentals, workflows, best practices |
| 06 | [Task Runners](4-BuildTools-and-DevEnvironment/06-Task-Runners.md) | npm scripts, Gulp |
| 07 | [Development Tools](4-BuildTools-and-DevEnvironment/07-Development-Tools.md) | VS Code, Chrome DevTools |
| 08 | [Package Publishing](4-BuildTools-and-DevEnvironment/08-Package-Publishing.md) | npm publishing, CI/CD, versioning |

---

### Section V: Browser Extensions
![Chrome](https://img.shields.io/badge/Chrome-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Firefox](https://img.shields.io/badge/Firefox-FF7139?style=flat-square&logo=firefox&logoColor=white)
*4 modules covering cross-browser extension development*

| # | Module | Topics |
|---|--------|--------|
| 01 | [Extension Fundamentals](5-Browser-Extensions/01-Extension-Fundamentals.md) | Architecture, manifest V3, content scripts, service workers |
| 02 | [Chrome Extension APIs](5-Browser-Extensions/02-Chrome-Extension-APIs.md) | action, tabs, runtime, storage, scripting, alarms, notifications |
| 03 | [Firefox WebExtensions](5-Browser-Extensions/03-Firefox-WebExtensions.md) | browser namespace, Firefox-specific APIs, containers, themes |
| 04 | [Extension Development](5-Browser-Extensions/04-Extension-Development.md) | Build setup, testing, debugging, security, publishing |

---

### Section VI: Advanced Topics & Best Practices
![Architecture](https://img.shields.io/badge/Architecture-Design_Patterns-9B59B6?style=flat-square)
![Security](https://img.shields.io/badge/Security-OWASP-E34F26?style=flat-square)
![DevOps](https://img.shields.io/badge/DevOps-CI%2FCD-2088FF?style=flat-square)
*5 modules covering professional JavaScript development*

| # | Module | Topics |
|---|--------|--------|
| 01 | [Architecture and Design Patterns](6-Advanced-Topics-and-Best-Practices/01-Architecture-and-Design-Patterns.md) | Creational, structural, behavioral patterns, MVC, Flux |
| 02 | [Performance Optimization](6-Advanced-Topics-and-Best-Practices/02-Performance-Optimization.md) | V8 internals, memory, rendering, network, profiling |
| 03 | [Security Best Practices](6-Advanced-Topics-and-Best-Practices/03-Security-Best-Practices.md) | XSS, CSRF, auth, input validation, CSP, dependencies |
| 04 | [Deployment and DevOps](6-Advanced-Topics-and-Best-Practices/04-Deployment-and-DevOps.md) | CI/CD, Docker, Kubernetes, cloud platforms, monitoring |
| 05 | [Career Development](6-Advanced-Topics-and-Best-Practices/05-Career-Development.md) | Learning path, interviews, code quality, leadership, OSS |

---

## 📊 Statistics

| Section | Modules | Lines | Size |
|---------|---------|-------|------|
| ECMAScript | 25 | 84,296 | 1.8 MB |
| Browser JS | 58 | 55,520 | 1.2 MB |
| Node.js | 25 | 15,828 | 336 KB |
| Build Tools | 8 | 5,595 | 124 KB |
| Browser Extensions | 4 | 3,225 | 76 KB |
| Advanced Topics | 5 | 4,732 | 108 KB |
| **Total** | **125** | **169,196** | **~3.7 MB** |

---

## 🚀 Quick Start

### Read Online
Visit the [live documentation site](https://amor-self-learning.github.io/JavaScript-Guide/)

### Clone Locally
```bash
git clone https://github.com/Amor-Self-learning/JavaScript-Guide.git
cd JavaScript-Guide
```

### Open in Obsidian
1. Open Obsidian
2. "Open folder as vault"
3. Select the cloned `JavaScript-Guide` folder

---

## 📖 How to Use This Guide

**Linear Learning:** Start with Section I (ECMAScript) and progress through sections in order.

**Reference:** Jump directly to any module when you need to look up a specific topic.

**Deep Dives:** Each module includes:
- Technical explanations
- Heavily commented code examples
- Common gotchas with ❌/✅ patterns
- Best practices lists
- Summary tables

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Follow the existing content structure
4. Submit a pull request

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with 💚 for the JavaScript community**
