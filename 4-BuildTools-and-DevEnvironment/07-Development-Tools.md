# Module 7: Development Tools

Effective development tools accelerate coding, debugging, and testing. This module covers VS Code setup for JavaScript, Chrome DevTools, and framework-specific browser extensions.

---

## 7.1 VS Code

### What It Is

Visual Studio Code is the most popular editor for JavaScript development. Its extension ecosystem, integrated terminal, and debugging capabilities make it essential for modern JS workflows.

### Essential Extensions

```json
// .vscode/extensions.json - Recommend extensions for your project
{
  "recommendations": [
    // JavaScript/TypeScript
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    
    // React
    "dsznajder.es7-react-js-snippets",
    "burkeholland.simple-react-snippets",
    
    // Testing
    "orta.vscode-jest",
    "vitest.explorer",
    
    // Git
    "eamodio.gitlens",
    "mhutchie.git-graph",
    
    // Productivity
    "christian-kohler.path-intellisense",
    "streetsidesoftware.code-spell-checker",
    "usernamehw.errorlens",
    "wayou.vscode-todo-highlight",
    
    // Appearance
    "PKief.material-icon-theme",
    "sdras.night-owl"
  ]
}
```

### Project Settings

```json
// .vscode/settings.json - Project-specific settings
{
  // Editor behavior
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.rulers": [80, 100],
  
  // File handling
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "node_modules": true,
    "dist": true,
    "coverage": true
  },
  
  // Search exclusions
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/*.min.js": true,
    "**/package-lock.json": true
  },
  
  // TypeScript
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always",
  "typescript.suggest.autoImports": true,
  
  // ESLint
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.useFlatConfig": true,
  
  // Language-specific formatters
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[markdown]": {
    "editor.wordWrap": "on"
  }
}
```

### Debugging Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    // Node.js
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Node App",
      "program": "${workspaceFolder}/src/index.ts",
      "preLaunchTask": "npm: build",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "sourceMaps": true,
      "env": {
        "NODE_ENV": "development"
      }
    },
    
    // Node.js with ts-node
    {
      "type": "node",
      "request": "launch",
      "name": "Debug with ts-node",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["ts-node", "${workspaceFolder}/src/index.ts"],
      "sourceMaps": true
    },
    
    // Jest tests
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Jest Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": [
        "--runInBand",
        "--no-cache",
        "${relativeFile}"
      ],
      "console": "integratedTerminal"
    },
    
    // Chrome debugging
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug in Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src",
      "sourceMaps": true
    },
    
    // Attach to running process
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Process",
      "port": 9229,
      "restart": true
    }
  ],
  
  "compounds": [
    {
      "name": "Debug Full Stack",
      "configurations": ["Debug Node App", "Debug in Chrome"]
    }
  ]
}
```

### Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "npm: build",
      "type": "npm",
      "script": "build",
      "group": "build",
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "npm: dev",
      "type": "npm",
      "script": "dev",
      "isBackground": true,
      "group": "build"
    },
    {
      "label": "npm: test",
      "type": "npm",
      "script": "test",
      "group": "test",
      "problemMatcher": []
    },
    {
      "label": "TypeScript: Watch",
      "type": "typescript",
      "tsconfig": "tsconfig.json",
      "option": "watch",
      "problemMatcher": ["$tsc-watch"],
      "isBackground": true
    }
  ]
}
```

### Useful Shortcuts

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Command Palette | `Ctrl+Shift+P` | `Cmd+Shift+P` |
| Quick Open File | `Ctrl+P` | `Cmd+P` |
| Go to Symbol | `Ctrl+Shift+O` | `Cmd+Shift+O` |
| Go to Definition | `F12` | `F12` |
| Peek Definition | `Alt+F12` | `Option+F12` |
| Find References | `Shift+F12` | `Shift+F12` |
| Rename Symbol | `F2` | `F2` |
| Toggle Terminal | `` Ctrl+` `` | `` Cmd+` `` |
| Split Editor | `Ctrl+\` | `Cmd+\` |
| Toggle Sidebar | `Ctrl+B` | `Cmd+B` |
| Multi-cursor | `Alt+Click` | `Option+Click` |
| Select All Occurrences | `Ctrl+Shift+L` | `Cmd+Shift+L` |

### Snippets

```json
// .vscode/javascript.code-snippets
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:${TM_FILENAME_BASE}}Props {",
      "  $2",
      "}",
      "",
      "export function ${1:${TM_FILENAME_BASE}}({ $3 }: ${1:${TM_FILENAME_BASE}}Props) {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ],
    "description": "React Functional Component with TypeScript"
  },
  
  "Console Log": {
    "prefix": "cl",
    "body": "console.log('$1:', $1);",
    "description": "Console log with label"
  },
  
  "Try Catch": {
    "prefix": "tryc",
    "body": [
      "try {",
      "  $1",
      "} catch (error) {",
      "  console.error(error);",
      "  $0",
      "}"
    ]
  }
}
```

---

## 7.2 Chrome DevTools

### What It Is

Chrome DevTools is a comprehensive suite of web development tools built into Chrome. It's essential for debugging, profiling, and inspecting web applications.

### Console Panel

```javascript
// Basic logging
console.log('Simple message');
console.info('Information');
console.warn('Warning');
console.error('Error');

// Formatted output
console.log('User: %s, Age: %d', 'John', 25);
console.log('%c Styled text', 'color: blue; font-size: 20px');

// Object inspection
console.dir(object);
console.table([{ name: 'John', age: 25 }, { name: 'Jane', age: 30 }]);

// Grouping
console.group('User Details');
console.log('Name: John');
console.log('Age: 25');
console.groupEnd();

// Timing
console.time('Operation');
heavyOperation();
console.timeEnd('Operation');  // Output: Operation: 123.45ms

// Counting
console.count('Click');  // Click: 1
console.count('Click');  // Click: 2
console.countReset('Click');

// Stack trace
console.trace('Trace point');

// Assertions
console.assert(value > 0, 'Value must be positive');

// Clear console
console.clear();
```

### Sources Panel (Debugger)

```javascript
// Breakpoints in code
debugger;  // Pauses execution when DevTools is open

// Conditional breakpoints
// Right-click line number → Add conditional breakpoint
// Expression: user.role === 'admin'

// Logpoints (log without pausing)
// Right-click line number → Add logpoint
// Message: 'User logged in:', user.name
```

**Debugger Controls:**
- **Resume (F8)**: Continue execution
- **Step Over (F10)**: Execute line, skip function internals
- **Step Into (F11)**: Go into function call
- **Step Out (Shift+F11)**: Exit current function
- **Step (F9)**: Next statement

**Watch Expressions:**
- Add variables to watch panel
- Evaluate expressions during debugging

### Network Panel

```javascript
// Key features:
// - Filter by type (XHR, JS, CSS, Img, etc.)
// - Throttle network speed
// - Block requests
// - Export HAR files

// Useful filters:
// -method:OPTIONS              Hide OPTIONS requests
// larger-than:100kb            Large files only
// domain:api.example.com       Specific domain
// status-code:500              Failed requests

// Preserve log across page loads
// Check "Preserve log" checkbox

// Disable cache
// Check "Disable cache" checkbox
```

### Performance Panel

```javascript
// Recording performance:
// 1. Click Record
// 2. Perform actions
// 3. Click Stop
// 4. Analyze timeline

// Key metrics:
// - FPS (frames per second)
// - CPU usage
// - Network activity
// - Main thread activity

// Flame chart shows:
// - JavaScript execution
// - Style calculations
// - Layout
// - Paint operations

// Performance API in code
performance.mark('start-operation');
doExpensiveOperation();
performance.mark('end-operation');
performance.measure('Operation', 'start-operation', 'end-operation');

const measures = performance.getEntriesByName('Operation');
console.log(measures[0].duration);
```

### Memory Panel

```javascript
// Heap snapshots:
// 1. Take Heap Snapshot
// 2. Perform operations
// 3. Take another snapshot
// 4. Compare to find leaks

// Allocation timeline:
// Records memory allocations over time
// Shows what's creating garbage

// Common memory leaks:
// - Detached DOM nodes
// - Event listeners not removed
// - Closures holding references
// - Timers not cleared

// Force garbage collection
// Click trash can icon in Memory panel
```

### Application Panel

```javascript
// Storage inspection:
// - localStorage
// - sessionStorage
// - IndexedDB
// - Cookies

// Service Workers:
// - View registered workers
// - Unregister workers
// - Simulate offline

// Cache Storage:
// - View cached assets
// - Delete cache

// Manipulate storage in Console:
localStorage.setItem('key', 'value');
localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// View as JSON
JSON.parse(localStorage.getItem('userData'));
```

### Elements Panel

```javascript
// Inspect and modify DOM in real-time
// Edit HTML, CSS, attributes

// Useful features:
// - $0: Currently selected element
// - $1, $2: Previously selected
// - Copy element: Right-click → Copy
// - Break on: DOM modification, attribute, node removal

// Console shortcuts for elements:
$('selector');      // document.querySelector
$$('selector');     // document.querySelectorAll
$x('//xpath');      // XPath query

// Force element state
// Right-click element → Force state → :hover, :active, :focus
```

---

## 7.3 Browser DevTools Extensions

### React Developer Tools

```javascript
// Installation: Chrome/Firefox extension

// Components tab:
// - View component tree
// - Inspect props and state
// - Edit props/state live
// - See render count

// Profiler tab:
// - Record renders
// - Identify unnecessary re-renders
// - View render timing

// Useful features:
// - Highlight components on update
// - Filter by component name
// - Search component tree
// - Copy component data as JSON
```

### Vue DevTools

```javascript
// Installation: Chrome/Firefox extension or standalone app

// Features:
// - Component inspector
// - Vuex state viewer
// - Event timeline
// - Router inspection
// - Performance profiling

// Pinia integration:
// - View all stores
// - Time-travel debugging
// - State editing
```

### Redux DevTools

```javascript
// Installation: Chrome/Firefox extension

// Configuration in app:
import { configureStore } from '@reduxjs/toolkit';

const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== 'production'
});

// Features:
// - Action history
// - State diff
// - Time-travel debugging
// - Action dispatch
// - State import/export
// - Jump to specific state

// Skip certain actions
configureStore({
  devTools: {
    actionsDenylist: ['persist/PERSIST']
  }
});
```

---

## 7.4 Summary

| Tool | Purpose | Key Feature |
|------|---------|-------------|
| VS Code | Code editor | Extensions, debugging |
| Chrome DevTools | Browser debugging | Performance, memory |
| React DevTools | React inspection | Component tree, profiler |
| Vue DevTools | Vue inspection | State, events |
| Redux DevTools | State management | Time-travel debugging |

### Best Practices

1. **Configure VS Code per-project** — Use `.vscode/` folder
2. **Learn keyboard shortcuts** — Significantly faster workflow
3. **Use debugger, not console.log** — Better debugging experience
4. **Profile before optimizing** — Data-driven improvements
5. **Install minimal extensions** — Keep editor fast
6. **Share settings with team** — Consistent development environment

---

**End of Module 7: Development Tools**

Next: Module 8 — Package Publishing
