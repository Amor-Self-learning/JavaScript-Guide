# Build Tools & Development Environment — Reference Guide

This document provides the complete module map, writing standards, and progress
tracking for Section IV of the JavaScript Mastery Guide.

---

## 1. Section Overview

Section IV covers the JavaScript development toolchain:

- Build tools and bundlers (Webpack, Vite, Rollup, Parcel, esbuild, SWC)
- Transpilers and compilers (Babel, TypeScript)
- Linters and formatters (ESLint, Prettier, Stylelint)
- Testing frameworks (Jest, Vitest, Mocha, Cypress, Playwright)
- Version control and Git workflows
- Task runners (npm scripts, Gulp)
- Development tools (VS Code, Chrome DevTools)
- Package publishing and CI/CD

**Target:** 8 consolidated module files

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
const config = require('config');
```

### Configuration

```javascript
// Example configuration file
module.exports = {
  // Options explained
};
```

### Gotchas

```javascript
// ❌ Wrong way
badConfig();

// ✅ Correct way  
goodConfig();
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

- Use ` ```javascript ` for all code blocks (or `json`, `bash` where appropriate)
- Modern tooling versions (2024+)
- Include configuration file examples
- Show CLI commands with expected output
- Cross-references: `(see Module 4.2 TypeScript)`

---

## 3. Module Map

### Module 01 — Build Tools and Bundlers

| Section | Topic | Status |
|---------|-------|--------|
| 1.1 | Webpack | ⬜ |
| 1.2 | Vite | ⬜ |
| 1.3 | Rollup | ⬜ |
| 1.4 | Parcel | ⬜ |
| 1.5 | esbuild | ⬜ |
| 1.6 | SWC | ⬜ |

**Coverage:**
- Webpack: entry, output, loaders, plugins, code splitting, tree shaking, HMR
- Vite: ESM dev server, Rollup production builds, plugin system
- Rollup: ES module bundling, tree shaking, library bundling
- Parcel: zero-config, automatic transformations
- esbuild: fast bundling, TypeScript compilation, minification
- SWC: Rust-based compiler, fast transpilation

---

### Module 02 — Transpilers and Compilers

| Section | Topic | Status |
|---------|-------|--------|
| 2.1 | Babel | ⬜ |
| 2.2 | TypeScript | ⬜ |

**Coverage:**
- Babel: ES6+ to ES5, presets, plugins, configuration, polyfills, JSX
- TypeScript: type system, tsconfig.json, build tool integration, @types

---

### Module 03 — Linters and Formatters

| Section | Topic | Status |
|---------|-------|--------|
| 3.1 | ESLint | ⬜ |
| 3.2 | Prettier | ⬜ |
| 3.3 | Stylelint | ⬜ |

**Coverage:**
- ESLint: configuration, rules, presets, plugins, auto-fixing, editor integration
- Prettier: code formatting, configuration, ESLint integration
- Stylelint: CSS/SCSS linting, rules, plugins

---

### Module 04 — Testing Frameworks

| Section | Topic | Status |
|---------|-------|--------|
| 4.1 | Jest | ⬜ |
| 4.2 | Vitest | ⬜ |
| 4.3 | Mocha | ⬜ |
| 4.4 | Cypress | ⬜ |
| 4.5 | Playwright | ⬜ |
| 4.6 | Testing Library | ⬜ |

**Coverage:**
- Jest: test structure, assertions, mocking, snapshots, coverage, configuration
- Vitest: Vite-powered, Jest-compatible, ESM support
- Mocha: test structure, Chai assertions, hooks, async testing
- Cypress: E2E testing, component testing, network stubbing
- Playwright: cross-browser, auto-waiting, selectors, test generator
- Testing Library: DOM testing, user-centric queries, best practices

---

### Module 05 — Version Control and Git

| Section | Topic | Status |
|---------|-------|--------|
| 5.1 | Git Fundamentals | ⬜ |
| 5.2 | Git Workflows | ⬜ |
| 5.3 | Git Best Practices | ⬜ |

**Coverage:**
- Fundamentals: repository init, commits, branches, merges, remotes, PRs
- Workflows: feature branch, Gitflow, trunk-based development
- Best practices: commit messages, branch naming, .gitignore, Husky hooks

---

### Module 06 — Task Runners

| Section | Topic | Status |
|---------|-------|--------|
| 6.1 | npm Scripts | ⬜ |
| 6.2 | Gulp | ⬜ |

**Coverage:**
- npm scripts: common patterns, pre/post hooks, running multiple scripts
- Gulp: task definition, streams, plugins

---

### Module 07 — Development Tools

| Section | Topic | Status |
|---------|-------|--------|
| 7.1 | VS Code | ⬜ |
| 7.2 | Chrome DevTools | ⬜ |
| 7.3 | Browser DevTools Extensions | ⬜ |

**Coverage:**
- VS Code: JavaScript extensions, debugging, snippets, settings sync
- Chrome DevTools: Console, Debugger, Network, Performance, Memory, Application
- Extensions: React DevTools, Vue DevTools, Redux DevTools

---

### Module 08 — Package Publishing

| Section | Topic | Status |
|---------|-------|--------|
| 8.1 | Preparing Packages | ⬜ |
| 8.2 | Versioning Strategy | ⬜ |
| 8.3 | CI/CD for Packages | ⬜ |

**Coverage:**
- Preparation: package structure, entry points, dual ESM/CJS, TypeScript declarations
- Versioning: semantic versioning, changelogs, release notes
- CI/CD: automated testing, automated publishing, GitHub Actions, npm provenance

---

## 4. Module Progress Tracker

| # | Module | Status | Lines |
|---|--------|--------|-------|
| 01 | Build Tools and Bundlers | ⬜ | — |
| 02 | Transpilers and Compilers | ⬜ | — |
| 03 | Linters and Formatters | ⬜ | — |
| 04 | Testing Frameworks | ⬜ | — |
| 05 | Version Control and Git | ⬜ | — |
| 06 | Task Runners | ⬜ | — |
| 07 | Development Tools | ⬜ | — |
| 08 | Package Publishing | ⬜ | — |

---

## 5. File Paths

```
4-BuildTools-and-DevEnvironment/
├── REFERENCE.md
├── 01-Build-Tools-and-Bundlers.md
├── 02-Transpilers-and-Compilers.md
├── 03-Linters-and-Formatters.md
├── 04-Testing-Frameworks.md
├── 05-Version-Control-and-Git.md
├── 06-Task-Runners.md
├── 07-Development-Tools.md
└── 08-Package-Publishing.md
```

---

**End of Reference Guide**
