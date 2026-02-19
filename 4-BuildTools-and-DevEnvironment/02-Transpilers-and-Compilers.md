# Module 2: Transpilers and Compilers

Transpilers convert modern JavaScript and TypeScript into versions compatible with target environments. This module covers Babel for JavaScript transformation and TypeScript for type-safe development.

---

## 2.1 Babel

### What It Is

Babel is a JavaScript compiler that transforms modern ECMAScript (ES6+) into backwards-compatible JavaScript. It enables using cutting-edge language features while supporting older browsers.

### Core Concepts

```bash
# Install Babel
npm install -D @babel/core @babel/cli @babel/preset-env

# Basic usage
npx babel src --out-dir dist
```

```javascript
// babel.config.js (recommended for monorepos)
module.exports = {
  presets: [
    ['@babel/preset-env', {
      // Target environments
      targets: {
        browsers: ['> 0.5%', 'last 2 versions', 'not dead'],
        node: 'current'
      },
      // Only include polyfills for features used
      useBuiltIns: 'usage',
      corejs: 3,
      // Don't transform ES modules (for tree shaking)
      modules: false,
      // Enable debug to see what's being transformed
      debug: false
    }]
  ],
  plugins: []
};
```

```javascript
// .babelrc.json (for single packages)
{
  "presets": ["@babel/preset-env"],
  "plugins": ["@babel/plugin-transform-runtime"]
}
```

### Presets

```javascript
// babel.config.js - Common presets
module.exports = {
  presets: [
    // Transform modern JavaScript
    '@babel/preset-env',
    
    // Transform React JSX
    ['@babel/preset-react', {
      runtime: 'automatic',  // React 17+ automatic JSX transform
      development: process.env.NODE_ENV === 'development'
    }],
    
    // Transform TypeScript (transpile only, no type checking)
    ['@babel/preset-typescript', {
      isTSX: true,
      allExtensions: true,
      allowDeclareFields: true
    }]
  ]
};
```

### Plugins

```javascript
// babel.config.js - Common plugins
module.exports = {
  plugins: [
    // Runtime helpers to reduce bundle size
    ['@babel/plugin-transform-runtime', {
      corejs: 3,
      helpers: true,
      regenerator: true
    }],
    
    // Class properties (now included in preset-env)
    '@babel/plugin-proposal-class-properties',
    
    // Optional chaining (now in ES2020)
    '@babel/plugin-proposal-optional-chaining',
    
    // Decorators (Stage 3)
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    
    // Environment-specific plugins
    process.env.NODE_ENV === 'development' && 'react-refresh/babel'
  ].filter(Boolean)
};
```

### Polyfills

```javascript
// Modern approach: useBuiltIns with corejs
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      useBuiltIns: 'usage',  // Add polyfills based on usage
      corejs: {
        version: 3,
        proposals: true  // Include polyfills for proposals
      }
    }]
  ]
};

// Entry file approach (useBuiltIns: 'entry')
// index.js
import 'core-js/stable';
import 'regenerator-runtime/runtime';
```

```javascript
// Manual polyfills for specific features
// polyfills.js
import 'core-js/features/promise';
import 'core-js/features/array/flat';
import 'core-js/features/object/from-entries';
```

### JSX Transformation

```javascript
// Input: JSX
function App() {
  return <div className="app">Hello World</div>;
}

// Output: Classic transform (React 16)
function App() {
  return React.createElement('div', { className: 'app' }, 'Hello World');
}

// Output: Automatic transform (React 17+)
import { jsx as _jsx } from 'react/jsx-runtime';
function App() {
  return _jsx('div', { className: 'app', children: 'Hello World' });
}

// Configure automatic runtime
// babel.config.js
{
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic'  // No need to import React
    }]
  ]
}
```

### Environment-Specific Configuration

```javascript
// babel.config.js
module.exports = (api) => {
  // Cache based on NODE_ENV
  api.cache.using(() => process.env.NODE_ENV);
  
  const isProduction = api.env('production');
  const isDevelopment = api.env('development');
  const isTest = api.env('test');
  
  return {
    presets: [
      ['@babel/preset-env', {
        modules: isTest ? 'commonjs' : false,  // Jest needs CJS
        targets: isTest ? { node: 'current' } : undefined
      }]
    ],
    plugins: [
      isDevelopment && 'react-refresh/babel',
      isProduction && 'transform-remove-console'
    ].filter(Boolean)
  };
};
```

### Gotchas

```javascript
// ❌ Wrong: Not using plugin-transform-runtime
// Every file gets its own copy of helper functions
class MyClass {}  // _classCallCheck duplicated in every file

// ✅ Correct: Use plugin-transform-runtime
// Helpers imported from shared module
plugins: ['@babel/plugin-transform-runtime']

// ❌ Wrong: Using useBuiltIns without specifying corejs
useBuiltIns: 'usage'  // Warns about missing corejs version

// ✅ Correct: Specify corejs version
useBuiltIns: 'usage',
corejs: 3

// ❌ Wrong: Transforming node_modules
// Babel should not process pre-compiled packages
exclude: undefined  // Processes everything

// ✅ Correct: Exclude node_modules (with exceptions)
exclude: /node_modules/
// Or include specific packages that need transpilation:
include: [/node_modules\/some-es6-package/]

// ❌ Wrong: Mixing preset orders incorrectly
presets: ['@babel/preset-react', '@babel/preset-env']  // Wrong order

// ✅ Correct: Presets run last to first
presets: ['@babel/preset-env', '@babel/preset-react']  // React first, then env
```

---

## 2.2 TypeScript

### What It Is

TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. It adds static type checking, interfaces, enums, and other features for large-scale application development.

### TypeScript Compiler (tsc)

```bash
# Install TypeScript
npm install -D typescript

# Initialize tsconfig.json
npx tsc --init

# Compile
npx tsc                  # Compile entire project
npx tsc --watch          # Watch mode
npx tsc --noEmit         # Type check only (no output)
npx tsc --project tsconfig.build.json  # Use specific config
```

### Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    // Target JavaScript version
    "target": "ES2020",
    
    // Module system
    "module": "ESNext",
    "moduleResolution": "bundler",  // For Vite/modern bundlers
    
    // Output
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,        // Generate .d.ts files
    "declarationDir": "./dist/types",
    "sourceMap": true,
    
    // Strict mode (recommended)
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    
    // Additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    // Module interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    // JSX (for React)
    "jsx": "react-jsx",
    
    // Path aliases
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"]
    },
    
    // Libraries
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    
    // Skip type checking node_modules
    "skipLibCheck": true,
    
    // Decorators (for frameworks like Angular, NestJS)
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Project References (Monorepos)

```json
// tsconfig.base.json - Shared config
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "strict": true,
    "declaration": true,
    "composite": true  // Required for project references
  }
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}

// packages/app/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../core" }  // Depends on core package
  ]
}

// Root tsconfig.json
{
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/app" }
  ]
}

// Build with references
npx tsc --build            // Build all projects
npx tsc --build --watch    // Watch mode
npx tsc --build --clean    // Clean build artifacts
```

### Type Definitions (@types)

```bash
# Install type definitions for libraries
npm install -D @types/node
npm install -D @types/react @types/react-dom
npm install -D @types/lodash

# Check if types exist
npm search @types/package-name
```

```typescript
// For packages without @types, create declarations
// src/types/untyped-package.d.ts
declare module 'untyped-package' {
  export function someFunction(arg: string): number;
  export interface SomeInterface {
    property: string;
  }
  const defaultExport: {
    method(): void;
  };
  export default defaultExport;
}

// Global type augmentation
// src/types/global.d.ts
declare global {
  interface Window {
    myCustomProperty: string;
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
    }
  }
}

export {};  // Make it a module
```

### Integration with Build Tools

```javascript
// Webpack with ts-loader
module.exports = {
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'ts-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};

// Webpack with babel-loader (faster, no type checking)
module.exports = {
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-typescript']
        }
      }
    }]
  }
};

// Run type checking separately
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "build": "npm run typecheck && webpack"
  }
}
```

```typescript
// Vite (built-in TypeScript support)
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  // Vite transpiles TypeScript but doesn't type check
  // Run tsc --noEmit separately for type checking
});
```

### Strict Mode Deep Dive

```typescript
// strictNullChecks: null and undefined are distinct types
let name: string;
name = null;  // Error: Type 'null' is not assignable to type 'string'

let nullableName: string | null = null;  // OK

// noImplicitAny: Must explicitly type when inference fails
function parse(input) {}  // Error: Parameter 'input' implicitly has an 'any' type
function parse(input: unknown) {}  // OK

// strictFunctionTypes: Contravariant parameter types
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

type AnimalFn = (animal: Animal) => void;
type DogFn = (dog: Dog) => void;

const animalFn: AnimalFn = (animal) => console.log(animal.name);
const dogFn: DogFn = animalFn;  // Error with strictFunctionTypes

// noUncheckedIndexedAccess: Index access returns T | undefined
const arr: string[] = ['a', 'b', 'c'];
const item = arr[5];  // Type: string | undefined (not string)
if (item) {
  console.log(item.toUpperCase());  // Narrowed to string
}

// useUnknownInCatchVariables: catch errors are unknown
try {
  throw new Error('oops');
} catch (error) {
  // error is unknown, not any
  if (error instanceof Error) {
    console.log(error.message);  // Narrowed to Error
  }
}
```

### Common Patterns

```typescript
// 1. Exhaustive type checking
type Status = 'pending' | 'active' | 'completed';

function handleStatus(status: Status): string {
  switch (status) {
    case 'pending': return 'Waiting...';
    case 'active': return 'In progress';
    case 'completed': return 'Done';
    default:
      // TypeScript error if a case is missing
      const _exhaustive: never = status;
      return _exhaustive;
  }
}

// 2. Type-safe event handlers
interface EventMap {
  click: MouseEvent;
  keydown: KeyboardEvent;
  submit: SubmitEvent;
}

function on<K extends keyof EventMap>(
  type: K,
  handler: (event: EventMap[K]) => void
): void {
  document.addEventListener(type, handler as EventListener);
}

on('click', (event) => {
  // event is MouseEvent
  console.log(event.clientX);
});

// 3. Builder pattern with type inference
class QueryBuilder<T = unknown> {
  private conditions: string[] = [];
  
  where<K extends keyof T>(field: K, value: T[K]): this {
    this.conditions.push(`${String(field)} = ${value}`);
    return this;
  }
  
  build(): string {
    return this.conditions.join(' AND ');
  }
}

interface User {
  id: number;
  name: string;
  active: boolean;
}

new QueryBuilder<User>()
  .where('id', 1)
  .where('name', 'John')
  .where('active', true)  // Type-safe: active must be boolean
  .build();
```

### Gotchas

```typescript
// ❌ Wrong: Using any everywhere
function process(data: any) {
  return data.something.nested;  // No type safety
}

// ✅ Correct: Use unknown and narrow
function process(data: unknown): string {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  return 'default';
}

// ❌ Wrong: Type assertion without validation
const user = JSON.parse(response) as User;  // May crash at runtime

// ✅ Correct: Validate at runtime
import { z } from 'zod';
const UserSchema = z.object({
  id: z.number(),
  name: z.string()
});
const user = UserSchema.parse(JSON.parse(response));

// ❌ Wrong: Ignoring index signature implications
interface Config {
  [key: string]: string;
  port: number;  // Error: number not assignable to string
}

// ✅ Correct: Use union type or separate known properties
interface Config {
  port: number;
  extra?: Record<string, string>;
}

// ❌ Wrong: Relying on enum at runtime
enum Status { Active, Inactive }
const status = 'Active' as unknown as Status;  // Dangerous

// ✅ Correct: Use const assertion or union types
const Status = {
  Active: 'active',
  Inactive: 'inactive'
} as const;
type Status = typeof Status[keyof typeof Status];
```

---

## 2.3 Babel vs TypeScript vs SWC

### Comparison

| Feature | Babel | TypeScript (tsc) | SWC |
|---------|-------|------------------|-----|
| Speed | Moderate | Slow | Fast |
| Type Checking | No | Yes | No |
| JSX | Yes | Yes | Yes |
| Plugins | Extensive | Limited | Limited |
| Decorators | Yes | Yes | Yes |
| Output Quality | Good | Good | Good |

### Recommended Workflows

```javascript
// Option 1: TypeScript only (small projects)
// tsconfig.json handles everything
// package.json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch"
  }
}

// Option 2: TypeScript for type checking, Babel for transform
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "babel src --out-dir dist --extensions '.ts,.tsx'",
    "dev": "npm run typecheck & babel src --watch --out-dir dist"
  }
}

// Option 3: TypeScript for type checking, esbuild/SWC for transform
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "esbuild src/index.ts --bundle --outfile=dist/bundle.js",
    "dev": "concurrently 'tsc --noEmit --watch' 'esbuild src/index.ts --watch'"
  }
}

// Option 4: Vite (recommended for web apps)
// Vite uses esbuild for dev, Rollup for prod
// Type checking runs separately
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build"
  }
}
```

---

## 2.4 Summary

| Tool | Use Case | Strengths | Considerations |
|------|----------|-----------|----------------|
| Babel | JavaScript transformation | Extensive plugins, polyfills | Slower, no type checking |
| TypeScript | Type safety + compilation | Static analysis, IDE support | Slower compilation |
| SWC | Fast transformation | 20x faster than Babel | Fewer plugins |
| esbuild | Fast bundling + transpile | Extremely fast | Limited transforms |

### Best Practices

1. **Enable strict mode** in TypeScript—it catches more bugs
2. **Use `@babel/preset-env`** with `useBuiltIns: 'usage'` for optimal polyfills
3. **Separate type checking** from bundling for faster builds
4. **Keep TypeScript config strict** and avoid `any`
5. **Use project references** for monorepos
6. **Generate source maps** for debugging transpiled code
7. **Prefer const assertions** over enums for better tree shaking

---

**End of Module 2: Transpilers and Compilers**

Next: Module 3 — Linters and Formatters
