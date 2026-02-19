# Node.js Section — Reference Guide

This document provides the complete chapter map, writing standards, and progress
tracking for Section III of the JavaScript Mastery Guide.

---

## 1. Section Overview

The Node.js section covers server-side JavaScript runtime, covering:

- Node.js architecture and fundamentals
- Module systems (CommonJS, ESM)
- Core modules (31 modules)
- NPM and package management
- Advanced concepts (error handling, debugging, security)
- Ecosystem (frameworks, databases, authentication, etc.)

**Target:** ~25 consolidated module files

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
const example = require('module');

// Explain every non-obvious line
example.method();
```

### Gotchas

```javascript
// ❌ Wrong way
doSomethingWrong();

// ✅ Correct way  
doSomethingRight();
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

- Use ````javascript` for all code blocks
- Modern Node.js (v18+) unless teaching legacy
- Include both callback and Promise/async-await patterns where applicable
- Security implications with ❌/✅ pattern
- Cross-references: `(see Module 3.5 Streams)`

---

## 3. Module Map

### Module 01 — Node.js Fundamentals

| Section | Topic | Status |
|---------|-------|--------|
| 1.1 | Node.js Architecture | ⬜ |
| 1.2 | Global Objects | ⬜ |
| 1.3 | Node.js vs Browser | ⬜ |

**Coverage:**
- V8 engine, event-driven architecture, single-threaded event loop
- Non-blocking I/O, libuv
- `global`, `process`, `console`, `__dirname`, `__filename`
- `Buffer`, timers (`setTimeout`, `setInterval`, `setImmediate`)
- API differences, module systems, file system access

---

### Module 02 — Module Systems

| Section | Topic | Status |
|---------|-------|--------|
| 2.1 | CommonJS | ⬜ |
| 2.2 | ES Modules in Node | ⬜ |
| 2.3 | Module Resolution | ⬜ |

**Coverage:**
- `require()` / `module.exports`, module caching, circular dependencies
- `.mjs` extension, `"type": "module"`, `import`/`export`
- Interop with CommonJS, Node resolution algorithm, `node_modules`

---

### Module 03 — File System (fs)

| Section | Topic | Status |
|---------|-------|--------|
| 3.1 | Reading Files | ⬜ |
| 3.2 | Writing Files | ⬜ |
| 3.3 | Directory Operations | ⬜ |
| 3.4 | File Stats and Watching | ⬜ |
| 3.5 | fs.promises API | ⬜ |

**Coverage:**
- Sync vs async methods, reading/writing/appending
- File stats, directory operations, watch files
- `fs.promises` API for async/await

---

### Module 04 — Path

| Section | Topic | Status |
|---------|-------|--------|
| 4.1 | Path Operations | ⬜ |

**Coverage:**
- `path.join()`, `path.resolve()`, `path.basename()`, `path.dirname()`
- `path.extname()`, `path.normalize()`, `path.relative()`, `path.isAbsolute()`
- Platform differences (POSIX vs Windows)

---

### Module 05 — HTTP and HTTPS

| Section | Topic | Status |
|---------|-------|--------|
| 5.1 | Creating HTTP Server | ⬜ |
| 5.2 | Handling Requests/Responses | ⬜ |
| 5.3 | Making HTTP Requests | ⬜ |
| 5.4 | HTTPS Server | ⬜ |

**Coverage:**
- Creating server, request/response objects
- Headers, status codes, streaming responses
- Making outbound requests, HTTPS with certificates

---

### Module 06 — Events

| Section | Topic | Status |
|---------|-------|--------|
| 6.1 | EventEmitter | ⬜ |
| 6.2 | Event Patterns | ⬜ |

**Coverage:**
- EventEmitter class, `on()`, `once()`, `off()`, `emit()`
- Error events, custom event emitters, listener patterns

---

### Module 07 — Streams

| Section | Topic | Status |
|---------|-------|--------|
| 7.1 | Stream Types | ⬜ |
| 7.2 | Piping and Backpressure | ⬜ |
| 7.3 | Custom Streams | ⬜ |
| 7.4 | Stream Utilities | ⬜ |

**Coverage:**
- Readable, Writable, Duplex, Transform streams
- Piping, backpressure, stream events
- `pipeline()` utility, object mode streams

---

### Module 08 — Buffer

| Section | Topic | Status |
|---------|-------|--------|
| 8.1 | Buffer Operations | ⬜ |

**Coverage:**
- Creating buffers, reading/writing, encoding (utf8, base64, hex)
- Buffer concatenation, performance considerations

---

### Module 09 — URL and Query String

| Section | Topic | Status |
|---------|-------|--------|
| 9.1 | URL Parsing | ⬜ |
| 9.2 | Query Strings | ⬜ |

**Coverage:**
- WHATWG URL API, URLSearchParams
- Legacy URL API, querystring module

---

### Module 10 — OS

| Section | Topic | Status |
|---------|-------|--------|
| 10.1 | System Information | ⬜ |

**Coverage:**
- CPU info, memory info, network interfaces
- Platform detection, system information

---

### Module 11 — Crypto

| Section | Topic | Status |
|---------|-------|--------|
| 11.1 | Hashing | ⬜ |
| 11.2 | Encryption/Decryption | ⬜ |
| 11.3 | Random Generation | ⬜ |

**Coverage:**
- `createHash()`, HMAC, encryption/decryption
- Random bytes, certificates

---

### Module 12 — Child Process

| Section | Topic | Status |
|---------|-------|--------|
| 12.1 | exec and spawn | ⬜ |
| 12.2 | fork and IPC | ⬜ |

**Coverage:**
- `exec()`, `execFile()`, `spawn()`, `fork()`
- IPC, handling child process events

---

### Module 13 — Cluster

| Section | Topic | Status |
|---------|-------|--------|
| 13.1 | Worker Processes | ⬜ |

**Coverage:**
- Creating worker processes, load balancing
- IPC between master and workers, worker management

---

### Module 14 — Process

| Section | Topic | Status |
|---------|-------|--------|
| 14.1 | Process Object | ⬜ |

**Coverage:**
- `process.argv`, `process.env`, exit codes, signals
- `process.nextTick()`, process events

---

### Module 15 — Timers

| Section | Topic | Status |
|---------|-------|--------|
| 15.1 | Timer Functions | ⬜ |
| 15.2 | Timers Promises | ⬜ |

**Coverage:**
- `setTimeout`, `setInterval`, `setImmediate`
- `process.nextTick()` vs `setImmediate()`
- `timers/promises` API

---

### Module 16 — Utilities

| Section | Topic | Status |
|---------|-------|--------|
| 16.1 | Util Module | ⬜ |

**Coverage:**
- `util.promisify()`, `util.callbackify()`
- `util.inspect()`, `util.format()`, `util.types`

---

### Module 17 — Net and DNS

| Section | Topic | Status |
|---------|-------|--------|
| 17.1 | TCP Server/Client | ⬜ |
| 17.2 | DNS Resolution | ⬜ |

**Coverage:**
- TCP server, TCP client, socket programming
- DNS lookup, resolve, reverse DNS

---

### Module 18 — Readline

| Section | Topic | Status |
|---------|-------|--------|
| 18.1 | Interactive Input | ⬜ |

**Coverage:**
- `readline.createInterface()`, reading line by line
- Prompting user input, `readline.promises` API

---

### Module 19 — Compression (zlib)

| Section | Topic | Status |
|---------|-------|--------|
| 19.1 | Compression/Decompression | ⬜ |

**Coverage:**
- Gzip, deflate, brotli
- Streaming compression

---

### Module 20 — Advanced Core Modules

| Section | Topic | Status |
|---------|-------|--------|
| 20.1 | Assert | ⬜ |
| 20.2 | REPL | ⬜ |
| 20.3 | Performance Hooks | ⬜ |
| 20.4 | V8 Module | ⬜ |
| 20.5 | VM Module | ⬜ |
| 20.6 | Async Hooks | ⬜ |
| 20.7 | Diagnostics Channel | ⬜ |
| 20.8 | Inspector | ⬜ |

**Coverage:**
- Assertion testing, custom REPLs
- Performance measurement, heap stats
- VM contexts, async resource tracking
- Diagnostic instrumentation, programmatic debugging

---

### Module 21 — Worker Threads

| Section | Topic | Status |
|---------|-------|--------|
| 21.1 | Creating Workers | ⬜ |
| 21.2 | Message Passing | ⬜ |
| 21.3 | SharedArrayBuffer | ⬜ |

**Coverage:**
- `new Worker()`, `parentPort`, `workerData`
- Message passing, transferable objects
- SharedArrayBuffer with workers

---

### Module 22 — Test Runner

| Section | Topic | Status |
|---------|-------|--------|
| 22.1 | Built-in Test Runner | ⬜ |

**Coverage:**
- `test()` function, `describe()`/`it()` syntax
- Assertions, hooks, test reporting

---

### Module 23 — NPM and Package Management

| Section | Topic | Status |
|---------|-------|--------|
| 23.1 | package.json | ⬜ |
| 23.2 | NPM Commands | ⬜ |
| 23.3 | Package Versioning | ⬜ |
| 23.4 | Publishing Packages | ⬜ |
| 23.5 | Alternative Package Managers | ⬜ |

**Coverage:**
- package.json structure, scripts, dependencies
- npm install/uninstall/update/audit/publish
- Semver, package-lock.json, yarn, pnpm

---

### Module 24 — Advanced Concepts

| Section | Topic | Status |
|---------|-------|--------|
| 24.1 | Error Handling Patterns | ⬜ |
| 24.2 | Debugging | ⬜ |
| 24.3 | Streams Deep Dive | ⬜ |
| 24.4 | Scalability | ⬜ |
| 24.5 | Security | ⬜ |
| 24.6 | Testing | ⬜ |

**Coverage:**
- Error-first callbacks, try-catch, uncaught exceptions
- `node --inspect`, Chrome DevTools, VS Code debugging
- Custom streams, backpressure handling
- Clustering, load balancing, caching
- Input validation, SQL injection, XSS, CSRF, Helmet.js
- Jest, Mocha, Supertest, code coverage

---

### Module 25 — Node.js Ecosystem

| Section | Topic | Status |
|---------|-------|--------|
| 25.1 | Web Frameworks | ⬜ |
| 25.2 | Template Engines | ⬜ |
| 25.3 | Database Integration | ⬜ |
| 25.4 | Authentication | ⬜ |
| 25.5 | Real-time Communication | ⬜ |
| 25.6 | API Development | ⬜ |
| 25.7 | Task Scheduling | ⬜ |
| 25.8 | Email | ⬜ |
| 25.9 | File Upload | ⬜ |
| 25.10 | Logging | ⬜ |
| 25.11 | Environment Management | ⬜ |

**Coverage:**
- Express, Koa, Fastify, NestJS
- EJS, Pug, Handlebars
- MySQL, PostgreSQL, MongoDB, Redis, ORMs
- Passport.js, JWT, OAuth
- Socket.io, WebSocket
- REST, GraphQL, Swagger
- node-cron, Bull, Nodemailer, Multer
- Winston, Pino, Morgan, dotenv

---

## 4. Progress Tracker

| Metric | Value |
|--------|-------|
| Total modules | 25 |
| Completed | 0 |
| Remaining | 25 |
| Next module | **01 — Node.js Fundamentals** |

---

## 5. File Naming Convention

Files use two-digit numbering:

```
3-NodeJS/
├── 01-Fundamentals.md
├── 02-Module-Systems.md
├── 03-File-System.md
├── ...
├── 25-Ecosystem.md
└── REFERENCE.md
```

After all modules are created, consolidate into single `3-NodeJS.md` in root.

---

## 6. Session Prompt

```
Read @3-NodeJS/REFERENCE.md for context and structure.
Read @1-ECMAScript/01-Language-Fundamentals.md as depth/style benchmark.

Create module 01 — Node.js Fundamentals at:
3-NodeJS/01-Fundamentals.md

Follow the REFERENCE writing standard exactly.
```
