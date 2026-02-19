# Module 1: Build Tools and Bundlers

Modern JavaScript development relies on build tools to transform, bundle, and optimize code for production. This module covers the major bundlers and their use cases.

---

## 1.1 Webpack

### What It Is

Webpack is the most mature and configurable JavaScript bundler. It treats every file as a module—JavaScript, CSS, images, fonts—and builds a dependency graph to bundle them efficiently.

### Core Concepts

```javascript
// webpack.config.js - Basic configuration
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  // Entry: Starting point(s) for dependency graph
  entry: {
    main: './src/index.js',
    admin: './src/admin.js'  // Multiple entry points
  },
  
  // Output: Where to emit bundles
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',  // Cache busting
    clean: true,  // Clean dist folder before build
    publicPath: '/'  // Base path for assets
  },
  
  // Mode: 'development' | 'production' | 'none'
  mode: process.env.NODE_ENV || 'development',
  
  // Loaders: Transform non-JavaScript files
  module: {
    rules: [
      // JavaScript/JSX with Babel
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      // TypeScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      // CSS with extraction for production
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV === 'production' 
            ? MiniCssExtractPlugin.loader 
            : 'style-loader',
          'css-loader',
          'postcss-loader'
        ]
      },
      // SCSS/Sass
      {
        test: /\.s[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader'
        ]
      },
      // Images
      {
        test: /\.(png|jpg|gif|svg|webp)$/,
        type: 'asset',  // Webpack 5 asset modules
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024  // Inline if < 8KB
          }
        },
        generator: {
          filename: 'images/[hash][ext]'
        }
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext]'
        }
      }
    ]
  },
  
  // Plugins: Perform wider range of tasks
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      chunks: ['main']  // Include only main bundle
    }),
    new MiniCssExtractPlugin({
      filename: 'styles/[name].[contenthash].css'
    })
  ],
  
  // Resolve: How modules are resolved
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  },
  
  // DevServer: Development server configuration
  devServer: {
    static: './dist',
    port: 3000,
    hot: true,  // Hot Module Replacement
    historyApiFallback: true,  // SPA routing
    proxy: {
      '/api': 'http://localhost:8080'  // API proxy
    }
  }
};
```

### Code Splitting

```javascript
// webpack.config.js - Advanced code splitting
module.exports = {
  optimization: {
    // Split vendor chunks
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor bundle for node_modules
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: -10,
          reuseExistingChunk: true
        },
        // Separate React bundle
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          priority: 10
        },
        // Common chunks between entry points
        common: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    },
    // Runtime chunk for better caching
    runtimeChunk: 'single'
  }
};

// Dynamic imports for lazy loading
// In your application code:
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Or with webpack magic comments:
import(
  /* webpackChunkName: "dashboard" */
  /* webpackPrefetch: true */
  './Dashboard'
).then(module => {
  // Use the module
});
```

### Production Optimization

```javascript
// webpack.prod.js
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  mode: 'production',
  devtool: 'source-map',  // Full source maps for production debugging
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,  // Multi-process parallel running
        terserOptions: {
          compress: {
            drop_console: true,  // Remove console.log
            drop_debugger: true
          },
          format: {
            comments: false  // Remove comments
          }
        },
        extractComments: false
      }),
      new CssMinimizerPlugin()
    ],
    // Tree shaking works automatically in production mode
    usedExports: true,
    sideEffects: true  // Respect package.json sideEffects field
  },
  
  plugins: [
    // Analyze bundle size
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',  // Generate HTML report
      openAnalyzer: false
    })
  ]
};
```

### Hot Module Replacement (HMR)

```javascript
// In development, Webpack can hot-reload modules without full page refresh
// webpack.config.js
module.exports = {
  devServer: {
    hot: true  // Enable HMR
  }
};

// In your code, accept HMR for specific modules:
if (module.hot) {
  module.hot.accept('./App', () => {
    // Re-render your app with updated component
    const NextApp = require('./App').default;
    render(NextApp);
  });
}

// React Fast Refresh (for React apps):
// Use @pmmmwh/react-refresh-webpack-plugin
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = {
  plugins: [
    new ReactRefreshWebpackPlugin()
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      use: [{
        loader: 'babel-loader',
        options: {
          plugins: ['react-refresh/babel']
        }
      }]
    }]
  }
};
```

### Gotchas

```javascript
// ❌ Wrong: Importing entire library
import _ from 'lodash';  // Bundles entire 70KB library

// ✅ Correct: Import only what you need
import debounce from 'lodash/debounce';  // ~2KB

// ❌ Wrong: Not using contenthash for cache busting
output: { filename: 'bundle.js' }  // Users get stale cached version

// ✅ Correct: Use contenthash
output: { filename: '[name].[contenthash].js' }  // New hash on content change

// ❌ Wrong: eval source maps in production
devtool: 'eval-source-map'  // Exposes source code

// ✅ Correct: Hidden source maps for production
devtool: 'source-map'  // Separate .map files, don't expose in browser

// ❌ Wrong: Processing node_modules with Babel
{
  test: /\.js$/,
  use: 'babel-loader'  // Processes everything, very slow
}

// ✅ Correct: Exclude node_modules
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: 'babel-loader'
}
```

---

## 1.2 Vite

### What It Is

Vite is a next-generation build tool that leverages native ES modules for lightning-fast development. It uses Rollup for production builds and provides an exceptional developer experience.

### How It Works

```bash
# Create new project
npm create vite@latest my-app -- --template react-ts

# Project structure
my-app/
├── index.html          # Entry point (not in public/)
├── vite.config.ts      # Configuration
├── src/
│   ├── main.tsx        # JavaScript entry
│   └── App.tsx
└── public/             # Static assets (copied as-is)
```

```typescript
// vite.config.ts - Configuration
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // Plugins
  plugins: [react()],
  
  // Development server
  server: {
    port: 3000,
    open: true,  // Open browser on start
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    // Enable HTTPS
    https: {
      key: './key.pem',
      cert: './cert.pem'
    }
  },
  
  // Build options (Rollup-based)
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash-es', 'date-fns']
        }
      }
    },
    // Target browsers
    target: 'es2020',
    // CSS code splitting
    cssCodeSplit: true,
    // Minification
    minify: 'esbuild'  // or 'terser' for more options
  },
  
  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },
  
  // CSS options
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  },
  
  // Environment variables
  envPrefix: 'APP_',  // Only expose APP_* env vars to client
  
  // Dependency optimization
  optimizeDeps: {
    include: ['lodash-es'],  // Pre-bundle these
    exclude: ['your-local-package']  // Don't pre-bundle
  }
});
```

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:3000
VITE_APP_TITLE=My App

# .env.production
VITE_API_URL=https://api.production.com
```

```typescript
// Access in code (only VITE_* vars exposed)
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.MODE);  // 'development' | 'production'
console.log(import.meta.env.DEV);   // true in dev
console.log(import.meta.env.PROD);  // true in prod

// Type definitions for env vars
// env.d.ts
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_TITLE: string;
}
```

### Vite vs Webpack

| Feature | Vite | Webpack |
|---------|------|---------|
| Dev Server Start | ~300ms | ~10-30s |
| HMR Speed | Instant | Varies |
| Config Complexity | Simple | Complex |
| Plugin Ecosystem | Growing | Mature |
| Production Build | Rollup | Webpack |
| ESM Native | Yes | Partial |
| Legacy Browser | Plugin needed | Built-in |

### Gotchas

```typescript
// ❌ Wrong: Using require() in Vite
const config = require('./config.json');  // Fails in ESM

// ✅ Correct: Use import
import config from './config.json';

// ❌ Wrong: Expecting __dirname in Vite
const filePath = path.join(__dirname, 'file.txt');  // undefined

// ✅ Correct: Use import.meta.url
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ❌ Wrong: Dynamic imports with variables
const module = await import(`./modules/${name}.js`);  // May not work

// ✅ Correct: Use glob import
const modules = import.meta.glob('./modules/*.js');
const module = await modules[`./modules/${name}.js`]();
```

---

## 1.3 Rollup

### What It Is

Rollup is an ES module bundler optimized for libraries. It produces smaller, more efficient bundles than Webpack for libraries due to superior tree shaking.

### Configuration

```javascript
// rollup.config.js
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

// For library publishing
export default [
  // Main build (ESM + CJS)
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
        sourcemap: true
      },
      {
        file: 'dist/index.umd.js',
        format: 'umd',
        name: 'MyLibrary',  // Global variable name
        sourcemap: true,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    ],
    plugins: [
      peerDepsExternal(),  // Exclude peer deps from bundle
      resolve(),           // Resolve node_modules
      commonjs(),          // Convert CJS to ESM
      typescript({ tsconfig: './tsconfig.json' }),
      terser()             // Minify
    ],
    external: ['react', 'react-dom']  // Don't bundle these
  },
  // Type definitions
  {
    input: 'dist/types/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'esm' }],
    plugins: [dts()]
  }
];
```

### Tree Shaking

```javascript
// Rollup has excellent tree shaking for ES modules

// math.js
export function add(a, b) { return a + b; }
export function subtract(a, b) { return a - b; }
export function multiply(a, b) { return a * b; }
export function divide(a, b) { return a / b; }

// main.js
import { add } from './math.js';
console.log(add(1, 2));

// Output: Only 'add' is included, others are tree-shaken

// Mark side effects in package.json for better tree shaking
{
  "name": "my-library",
  "sideEffects": false,  // No side effects, safe to tree shake
  // Or specify files with side effects:
  "sideEffects": ["*.css", "*.scss", "./src/polyfills.js"]
}
```

### Best Practices for Libraries

```javascript
// 1. Always externalize dependencies
external: ['react', 'react-dom', 'lodash'],

// 2. Provide multiple output formats
output: [
  { file: 'dist/index.cjs', format: 'cjs' },
  { file: 'dist/index.mjs', format: 'esm' }
],

// 3. Generate TypeScript declarations
// Use rollup-plugin-dts or tsc --emitDeclarationOnly

// 4. package.json exports field
{
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs"
    }
  }
}
```

---

## 1.4 Parcel

### What It Is

Parcel is a zero-configuration bundler that works out of the box. It automatically detects and configures transformations based on your project files.

### Usage

```bash
# Install
npm install -D parcel

# Add to package.json
{
  "source": "src/index.html",
  "scripts": {
    "start": "parcel",
    "build": "parcel build"
  }
}

# Run
npm start  # Dev server with HMR
npm run build  # Production build
```

```html
<!-- src/index.html - Entry point -->
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="./styles.scss">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

### Configuration (When Needed)

```json
// .parcelrc - Custom configuration
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.svg": ["@parcel/transformer-svg-react"]
  },
  "reporters": ["...", "parcel-reporter-bundle-analyzer"]
}
```

```json
// package.json - Parcel options
{
  "targets": {
    "main": false,
    "default": {
      "distDir": "./dist",
      "sourceMap": true,
      "engines": {
        "browsers": "> 0.5%, last 2 versions, not dead"
      }
    }
  }
}
```

### When to Use Parcel

| Use Case | Recommendation |
|----------|----------------|
| Quick prototypes | ✅ Parcel |
| Simple projects | ✅ Parcel |
| Complex enterprise apps | Webpack/Vite |
| Library publishing | Rollup |
| Need fine-grained control | Webpack |

---

## 1.5 esbuild

### What It Is

esbuild is an extremely fast JavaScript bundler written in Go. It's 10-100x faster than traditional bundlers and is used internally by Vite for development.

### Usage

```bash
# CLI usage
npx esbuild src/index.ts --bundle --outfile=dist/bundle.js

# With more options
npx esbuild src/index.ts \
  --bundle \
  --minify \
  --sourcemap \
  --target=es2020 \
  --outfile=dist/bundle.js

# Watch mode
npx esbuild src/index.ts --bundle --watch --outfile=dist/bundle.js
```

### JavaScript API

```javascript
// build.js
const esbuild = require('esbuild');

// Simple build
await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  outfile: 'dist/bundle.js'
});

// Multiple entry points with splitting
await esbuild.build({
  entryPoints: ['src/index.ts', 'src/worker.ts'],
  bundle: true,
  splitting: true,  // Code splitting (ESM only)
  format: 'esm',
  outdir: 'dist',
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  // External packages (don't bundle)
  external: ['react', 'react-dom'],
  // Plugins
  plugins: [sassPlugin(), envPlugin()]
});

// Watch mode with serve
const ctx = await esbuild.context({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js'
});

await ctx.watch();  // Rebuild on file changes

const { host, port } = await ctx.serve({
  servedir: 'dist',
  port: 3000
});
```

### Limitations

```javascript
// esbuild is fast but has limitations:

// 1. Limited CSS processing (no PostCSS by default)
// 2. No HMR built-in (use plugins or Vite)
// 3. TypeScript: transpiles but doesn't type-check
//    Run tsc --noEmit separately for type checking

// Build script with type checking
// package.json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && node build.js"
  }
}
```

### When to Use esbuild

| Use Case | Recommendation |
|----------|----------------|
| Very fast builds | ✅ esbuild |
| Simple TypeScript | ✅ esbuild |
| Full TypeScript support | tsc + esbuild |
| CSS post-processing | Webpack/Vite |
| Complex plugins | Webpack/Vite |

---

## 1.6 SWC

### What It Is

SWC (Speedy Web Compiler) is a Rust-based JavaScript/TypeScript compiler that's 20x faster than Babel. It can be used standalone or integrated with other bundlers.

### Configuration

```json
// .swcrc
{
  "$schema": "https://json.schemastore.org/swcrc",
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "react": {
        "runtime": "automatic",
        "development": false,
        "refresh": true
      },
      "decoratorMetadata": true,
      "legacyDecorator": true
    },
    "target": "es2020",
    "loose": false,
    "minify": {
      "compress": true,
      "mangle": true
    }
  },
  "module": {
    "type": "es6"
  },
  "minify": true,
  "sourceMaps": true
}
```

### Usage with Webpack

```javascript
// webpack.config.js - Replace babel-loader with swc-loader
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: true
              },
              transform: {
                react: {
                  runtime: 'automatic'
                }
              }
            }
          }
        }
      }
    ]
  }
};
```

### SWC vs Babel

| Feature | SWC | Babel |
|---------|-----|-------|
| Speed | ~20x faster | Baseline |
| Language | Rust | JavaScript |
| Plugin System | Limited | Extensive |
| Ecosystem | Growing | Mature |
| Decorators | Yes | Yes |
| JSX | Yes | Yes |
| TypeScript | Yes (transpile only) | Yes |

---

## 1.7 Choosing a Bundler

### Decision Matrix

| Project Type | Recommended | Reason |
|--------------|-------------|--------|
| New React/Vue app | **Vite** | Fast DX, simple config |
| Enterprise app | **Webpack** | Mature, extensive plugins |
| Library/package | **Rollup** | Optimized output, tree shaking |
| Quick prototype | **Parcel** | Zero config |
| Maximum speed | **esbuild** | Fastest builds |
| Existing Webpack | **Webpack + SWC** | Keep config, speed up |

### Migration Considerations

```javascript
// Migrating from Webpack to Vite
// 1. Move index.html to project root
// 2. Change imports to use ES modules
// 3. Update env variables (VITE_ prefix)
// 4. Replace webpack plugins with Vite plugins
// 5. Update scripts in package.json

// Common Vite equivalents:
// html-webpack-plugin → Built-in (index.html in root)
// DefinePlugin → define option in vite.config
// MiniCssExtractPlugin → Built-in CSS handling
// copy-webpack-plugin → vite-plugin-static-copy
```

---

## 1.8 Summary

| Bundler | Strengths | Weaknesses | Best For |
|---------|-----------|------------|----------|
| Webpack | Mature, flexible, plugins | Complex config, slower | Enterprise apps |
| Vite | Fast dev, simple config | Smaller ecosystem | Modern web apps |
| Rollup | Clean output, tree shaking | Limited DX features | Libraries |
| Parcel | Zero config | Less control | Prototypes |
| esbuild | Extremely fast | Limited features | Simple projects |
| SWC | Fast transpilation | Limited plugins | Babel replacement |

### Best Practices

1. **Start with Vite** for new projects—it's fast and simple
2. **Use Webpack** when you need extensive customization or legacy support
3. **Choose Rollup** for library publishing
4. **Enable source maps** in development, disable in production (or use hidden-source-map)
5. **Implement code splitting** to improve initial load time
6. **Configure caching** with contenthash in filenames
7. **Analyze bundles** regularly to prevent bloat

---

**End of Module 1: Build Tools and Bundlers**

Next: Module 2 — Transpilers and Compilers
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
# Module 3: Linters and Formatters

Linters catch bugs and enforce coding standards, while formatters ensure consistent code style. This module covers ESLint, Prettier, and Stylelint for comprehensive code quality.

---

## 3.1 ESLint

### What It Is

ESLint is a pluggable linting utility for JavaScript and TypeScript. It analyzes code to find problems, enforce conventions, and can automatically fix many issues.

### Installation and Setup

```bash
# Install ESLint
npm install -D eslint

# Initialize configuration (interactive)
npx eslint --init

# Or install with common presets
npm install -D eslint @eslint/js typescript-eslint
```

### Flat Config (ESLint v9+)

```javascript
// eslint.config.js (flat config - recommended)
import js from '@eslint/js';
import typescript from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  // Ignore patterns
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js']
  },
  
  // Base JavaScript rules
  js.configs.recommended,
  
  // TypeScript rules
  ...typescript.configs.recommended,
  ...typescript.configs.strictTypeChecked,
  
  // React rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',  // Not needed with React 17+
      'react/prop-types': 'off'  // Use TypeScript instead
    },
    settings: {
      react: { version: 'detect' }
    }
  },
  
  // Custom rules for all files
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Possible Problems
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'warn',
      'no-duplicate-imports': 'error',
      'no-unused-vars': 'off',  // Use TypeScript version
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // Suggestions
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      
      // TypeScript specific
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error'
    }
  },
  
  // Test files have different rules
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off'
    }
  },
  
  // Disable formatting rules (Prettier handles this)
  prettier
];
```

### Legacy Config (.eslintrc)

```json
// .eslintrc.json (legacy format - still works)
{
  "root": true,
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "project": "./tsconfig.json",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks"],
  "settings": {
    "react": {
      "version": "detect"
    }
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-unused-vars": ["error", {
      "argsIgnorePattern": "^_"
    }]
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "rules": {
        "@typescript-eslint/no-explicit-any": "off"
      }
    }
  ]
}
```

### Common Plugins

```bash
# Essential plugins
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-plugin-react eslint-plugin-react-hooks
npm install -D eslint-plugin-import  # Import/export linting
npm install -D eslint-plugin-jsx-a11y  # Accessibility

# Code quality
npm install -D eslint-plugin-unicorn  # Various best practices
npm install -D eslint-plugin-sonarjs  # Bug detection

# Testing
npm install -D eslint-plugin-jest
npm install -D eslint-plugin-testing-library

# Security
npm install -D eslint-plugin-security
```

```javascript
// eslint.config.js - Plugin usage
import importPlugin from 'eslint-plugin-import';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11y
    },
    rules: {
      // Import rules
      'import/order': ['error', {
        'groups': ['builtin', 'external', 'internal', 'parent', 'sibling'],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc' }
      }],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      
      // Accessibility rules
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error'
    }
  }
];
```

### CLI Usage

```bash
# Lint files
npx eslint src/
npx eslint "src/**/*.{ts,tsx}"

# Auto-fix issues
npx eslint src/ --fix

# Specific rules
npx eslint src/ --rule 'no-console: error'

# Output formats
npx eslint src/ --format compact
npx eslint src/ --format json > eslint-report.json

# Cache for faster runs
npx eslint src/ --cache --cache-location .eslintcache

# Debug configuration
npx eslint --print-config src/App.tsx
```

### Editor Integration

```json
// .vscode/settings.json
{
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "eslint.useFlatConfig": true
}
```

### Gotchas

```javascript
// ❌ Wrong: Disabling rules globally
/* eslint-disable */  // Disables ALL rules for entire file

// ✅ Correct: Disable specific rules with reason
/* eslint-disable-next-line no-console -- Debug logging needed */
console.log('debug info');

// Or for a block:
/* eslint-disable @typescript-eslint/no-explicit-any -- Legacy API */
const legacyData: any = oldApi.getData();
/* eslint-enable @typescript-eslint/no-explicit-any */

// ❌ Wrong: Not using type-aware rules
extends: ['plugin:@typescript-eslint/recommended']  // Basic only

// ✅ Correct: Enable type-checked rules for better analysis
extends: [
  'plugin:@typescript-eslint/recommended',
  'plugin:@typescript-eslint/recommended-type-checked'
]
// Requires parserOptions.project pointing to tsconfig.json

// ❌ Wrong: Conflicting with Prettier
rules: {
  'indent': ['error', 2],  // Conflicts with Prettier
  'quotes': ['error', 'single']
}

// ✅ Correct: Use eslint-config-prettier to disable conflicting rules
extends: ['...other configs...', 'prettier']  // Must be last
```

---

## 3.2 Prettier

### What It Is

Prettier is an opinionated code formatter. It enforces consistent style by parsing and re-printing code according to its rules.

### Installation and Setup

```bash
# Install Prettier
npm install -D prettier

# Install ESLint integration
npm install -D eslint-config-prettier
```

### Configuration

```json
// .prettierrc.json
{
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "singleAttributePerLine": false
}
```

```javascript
// prettier.config.js (alternative)
/** @type {import("prettier").Config} */
export default {
  printWidth: 100,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  // Override for specific files
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 4
      }
    },
    {
      files: '*.md',
      options: {
        proseWrap: 'always'
      }
    }
  ]
};
```

### Ignore Files

```gitignore
# .prettierignore
node_modules/
dist/
build/
coverage/
*.min.js
package-lock.json
pnpm-lock.yaml
```

### CLI Usage

```bash
# Format files
npx prettier --write "src/**/*.{js,ts,jsx,tsx}"

# Check if files are formatted
npx prettier --check "src/**/*.{js,ts,jsx,tsx}"

# Format specific file
npx prettier --write src/App.tsx

# Format stdin
echo "const x={a:1,b:2}" | npx prettier --parser babel
```

### Integration with ESLint

```javascript
// eslint.config.js
import prettier from 'eslint-config-prettier';

export default [
  // ... other configs
  prettier  // Must be last - disables ESLint rules that conflict with Prettier
];

// Note: eslint-plugin-prettier is NOT recommended
// It's slower and shows formatting issues as ESLint errors
// Better: Run Prettier separately or use editor integration
```

### Editor Integration

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Pre-commit Hook with Husky

```bash
# Install Husky and lint-staged
npm install -D husky lint-staged

# Initialize Husky
npx husky init
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css,scss}": [
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

---

## 3.3 Stylelint

### What It Is

Stylelint is a CSS linter that helps enforce conventions and catch errors in stylesheets, including CSS, SCSS, Sass, Less, and CSS-in-JS.

### Installation and Setup

```bash
# Install Stylelint
npm install -D stylelint stylelint-config-standard

# For SCSS
npm install -D stylelint-config-standard-scss

# For CSS-in-JS (styled-components, emotion)
npm install -D postcss-styled-syntax
```

### Configuration

```javascript
// stylelint.config.js
/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-standard-scss'  // If using SCSS
  ],
  
  plugins: [
    'stylelint-order'  // Property order rules
  ],
  
  rules: {
    // Possible errors
    'color-no-invalid-hex': true,
    'font-family-no-duplicate-names': true,
    'function-calc-no-unspaced-operator': true,
    'property-no-unknown': true,
    'selector-pseudo-class-no-unknown': [true, {
      ignorePseudoClasses: ['global', 'local']  // CSS Modules
    }],
    
    // Conventions
    'color-hex-length': 'short',
    'declaration-block-no-redundant-longhand-properties': true,
    'shorthand-property-no-redundant-values': true,
    
    // Naming
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',  // camelCase
      { message: 'Use camelCase for class names' }
    ],
    
    // SCSS specific
    'scss/at-rule-no-unknown': true,
    'scss/selector-no-redundant-nesting-selector': true,
    
    // Order (requires stylelint-order plugin)
    'order/properties-alphabetical-order': true
  },
  
  overrides: [
    // CSS Modules
    {
      files: ['*.module.css', '*.module.scss'],
      rules: {
        'selector-class-pattern': null  // Different naming allowed
      }
    },
    // CSS-in-JS
    {
      files: ['*.{js,jsx,ts,tsx}'],
      customSyntax: 'postcss-styled-syntax'
    }
  ],
  
  ignoreFiles: [
    'node_modules/**',
    'dist/**',
    '**/*.min.css'
  ]
};
```

### CLI Usage

```bash
# Lint stylesheets
npx stylelint "src/**/*.{css,scss}"

# Auto-fix issues
npx stylelint "src/**/*.css" --fix

# Specific config
npx stylelint "src/**/*.css" --config custom.stylelint.config.js
```

### Integration with Prettier

```bash
# Install Prettier integration
npm install -D stylelint-config-prettier-scss
```

```javascript
// stylelint.config.js
export default {
  extends: [
    'stylelint-config-standard-scss',
    'stylelint-config-prettier-scss'  // Must be last
  ]
};
```

### Editor Integration

```json
// .vscode/settings.json
{
  "stylelint.validate": ["css", "scss", "postcss"],
  "css.validate": false,  // Disable VS Code built-in CSS validation
  "scss.validate": false
}
```

---

## 3.4 Combined Workflow

### Package.json Scripts

```json
{
  "scripts": {
    "lint": "npm run lint:js && npm run lint:css",
    "lint:js": "eslint src/ --cache",
    "lint:css": "stylelint 'src/**/*.{css,scss}' --cache",
    "lint:fix": "npm run lint:js -- --fix && npm run lint:css -- --fix",
    "format": "prettier --write 'src/**/*.{js,ts,jsx,tsx,json,css,scss,md}'",
    "format:check": "prettier --check 'src/**/*.{js,ts,jsx,tsx,json,css,scss,md}'",
    "check": "npm run lint && npm run format:check && npm run typecheck",
    "typecheck": "tsc --noEmit"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/lint.yml
name: Lint

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint:js
      
      - name: Run Stylelint
        run: npm run lint:css
      
      - name: Check formatting
        run: npm run format:check
      
      - name: Type check
        run: npm run typecheck
```

---

## 3.5 Summary

| Tool | Purpose | Config File | Key Features |
|------|---------|-------------|--------------|
| ESLint | JavaScript/TypeScript linting | `eslint.config.js` | Catch bugs, enforce conventions |
| Prettier | Code formatting | `.prettierrc.json` | Consistent style, zero debate |
| Stylelint | CSS/SCSS linting | `stylelint.config.js` | CSS conventions, error detection |

### Best Practices

1. **Use ESLint for logic, Prettier for formatting** — don't mix concerns
2. **Enable strict TypeScript rules** in ESLint for better code quality
3. **Run linters in CI** — catch issues before merge
4. **Use pre-commit hooks** — prevent bad code from being committed
5. **Cache lint results** — faster subsequent runs
6. **Configure editor integration** — fix issues as you type
7. **Document rule exceptions** — explain why rules are disabled

### Recommended Rule Sets

```javascript
// Minimal but effective ESLint rules
const essentialRules = {
  'no-console': 'warn',
  'no-debugger': 'error',
  'prefer-const': 'error',
  'no-var': 'error',
  'eqeqeq': ['error', 'always'],
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/prefer-optional-chain': 'error',
  '@typescript-eslint/prefer-nullish-coalescing': 'error'
};
```

---

**End of Module 3: Linters and Formatters**

Next: Module 4 — Testing Frameworks
# Module 4: Testing Frameworks

Testing ensures code works correctly and prevents regressions. This module covers the major JavaScript testing tools from unit tests to end-to-end testing.

---

## 4.1 Jest

### What It Is

Jest is a comprehensive testing framework by Meta with built-in assertions, mocking, and code coverage. It's the most popular choice for React projects and general JavaScript testing.

### Installation and Setup

```bash
# Install Jest
npm install -D jest

# For TypeScript
npm install -D jest ts-jest @types/jest

# Initialize configuration
npx jest --init
```

```javascript
// jest.config.js
/** @type {import('jest').Config} */
export default {
  // Test environment
  testEnvironment: 'node',  // or 'jsdom' for browser APIs
  
  // File patterns
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // TypeScript support
  preset: 'ts-jest',
  // Or use babel
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|scss)$': 'identity-obj-proxy'  // Mock CSS modules
  },
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Coverage
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts,jsx,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Performance
  maxWorkers: '50%',
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache'
};
```

### Test Structure

```javascript
// math.test.js
import { add, divide } from './math';

// Describe blocks group related tests
describe('Math utilities', () => {
  // Nested describe for subgroups
  describe('add', () => {
    // Individual test cases
    test('adds positive numbers', () => {
      expect(add(1, 2)).toBe(3);
    });
    
    test('adds negative numbers', () => {
      expect(add(-1, -2)).toBe(-3);
    });
    
    // it() is alias for test()
    it('handles zero', () => {
      expect(add(0, 5)).toBe(5);
    });
  });
  
  describe('divide', () => {
    test('divides numbers correctly', () => {
      expect(divide(10, 2)).toBe(5);
    });
    
    test('throws on division by zero', () => {
      expect(() => divide(10, 0)).toThrow('Cannot divide by zero');
    });
  });
});
```

### Assertions (expect)

```javascript
// Equality
expect(value).toBe(3);              // Strict equality (===)
expect(obj).toEqual({ a: 1 });      // Deep equality
expect(value).toStrictEqual(obj);   // Strict deep equality (checks undefined)

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeGreaterThanOrEqual(3);
expect(value).toBeLessThan(5);
expect(value).toBeCloseTo(0.3, 5);  // Floating point comparison

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain('substring');
expect(str).toHaveLength(5);

// Arrays and iterables
expect(arr).toContain('item');
expect(arr).toContainEqual({ a: 1 });  // Deep equality
expect(arr).toHaveLength(3);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toHaveProperty('nested.key', 'value');
expect(obj).toMatchObject({ subset: true });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
expect(() => fn()).toThrow(ErrorClass);

// Promises
await expect(promise).resolves.toBe('value');
await expect(promise).rejects.toThrow('error');

// Negation
expect(value).not.toBe(3);
expect(arr).not.toContain('item');
```

### Mocking

```javascript
// Mock functions
const mockFn = jest.fn();
mockFn('arg1', 'arg2');

expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
expect(mockFn).toHaveBeenLastCalledWith('arg1', 'arg2');

// Mock return values
const mock = jest.fn()
  .mockReturnValue('default')
  .mockReturnValueOnce('first call')
  .mockReturnValueOnce('second call');

// Mock implementation
const mock = jest.fn((x) => x * 2);
const mock = jest.fn().mockImplementation((x) => x * 2);

// Mock modules
jest.mock('./api', () => ({
  fetchUser: jest.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));

// Partial mock (keep original implementation for some exports)
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  specificFn: jest.fn()
}));

// Spy on existing methods
const spy = jest.spyOn(object, 'method');
spy.mockReturnValue('mocked');
// Restore original
spy.mockRestore();

// Mock timers
jest.useFakeTimers();
setTimeout(callback, 1000);
jest.advanceTimersByTime(1000);  // or jest.runAllTimers()
expect(callback).toHaveBeenCalled();
jest.useRealTimers();
```

### Async Testing

```javascript
// Promises
test('async with promises', () => {
  return fetchData().then(data => {
    expect(data).toBe('data');
  });
});

// Async/await
test('async with await', async () => {
  const data = await fetchData();
  expect(data).toBe('data');
});

// Resolves/rejects matchers
test('resolves to value', async () => {
  await expect(fetchData()).resolves.toBe('data');
});

test('rejects with error', async () => {
  await expect(failingFetch()).rejects.toThrow('Network error');
});

// Callbacks (done parameter)
test('callback style', (done) => {
  fetchData((error, data) => {
    try {
      expect(data).toBe('data');
      done();
    } catch (e) {
      done(e);
    }
  });
});
```

### Setup and Teardown

```javascript
describe('Database tests', () => {
  // Run once before all tests in this describe
  beforeAll(async () => {
    await db.connect();
  });
  
  // Run once after all tests
  afterAll(async () => {
    await db.disconnect();
  });
  
  // Run before each test
  beforeEach(async () => {
    await db.clear();
    await db.seed();
  });
  
  // Run after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  test('creates user', async () => {
    // Tests run with fresh database
  });
});
```

### Snapshot Testing

```javascript
// Component snapshot
test('renders correctly', () => {
  const tree = renderer.create(<Button label="Click" />).toJSON();
  expect(tree).toMatchSnapshot();
});

// Inline snapshot
test('user object', () => {
  expect(getUser()).toMatchInlineSnapshot(`
    {
      "id": 1,
      "name": "Test User",
    }
  `);
});

// Update snapshots: jest --updateSnapshot or jest -u
```

---

## 4.2 Vitest

### What It Is

Vitest is a Vite-native testing framework with Jest-compatible API. It's significantly faster due to Vite's ESM-based architecture and is the recommended choice for Vite projects.

### Installation and Setup

```bash
# Install Vitest
npm install -D vitest

# With UI
npm install -D @vitest/ui

# With coverage
npm install -D @vitest/coverage-v8
```

```typescript
// vite.config.ts or vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Environment
    environment: 'jsdom',  // or 'node', 'happy-dom'
    
    // Globals (jest-like global API)
    globals: true,
    
    // Setup files
    setupFiles: ['./tests/setup.ts'],
    
    // Include/exclude patterns
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'dist'],
    
    // Coverage
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts']
    },
    
    // TypeScript
    typecheck: {
      enabled: true
    },
    
    // Watch mode
    watch: true,
    
    // Threads (parallel execution)
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  }
});
```

### Usage

```typescript
// user.test.ts
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { getUser } from './user';

// API is nearly identical to Jest
describe('User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('returns user data', async () => {
    const user = await getUser(1);
    expect(user).toEqual({ id: 1, name: 'Test' });
  });
});

// Mocking with vi (instead of jest)
vi.mock('./api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1 })
}));

// Fake timers
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
vi.useRealTimers();

// Spying
const spy = vi.spyOn(object, 'method');
```

### Vitest vs Jest

| Feature | Vitest | Jest |
|---------|--------|------|
| Speed | Much faster | Baseline |
| ESM Support | Native | Experimental |
| Config | Shares Vite config | Separate |
| Watch Mode | Instant | Slower |
| API | Jest-compatible | Original |
| HMR | Yes | No |

---

## 4.3 Mocha

### What It Is

Mocha is a flexible test framework that doesn't include assertions or mocking—you choose your own libraries. It's been around longer than Jest and remains popular for Node.js testing.

### Installation and Setup

```bash
# Install Mocha with Chai (assertions)
npm install -D mocha chai @types/mocha @types/chai

# For TypeScript
npm install -D ts-node
```

```json
// .mocharc.json
{
  "extension": ["ts"],
  "require": ["ts-node/register"],
  "spec": "test/**/*.test.ts",
  "timeout": 5000,
  "recursive": true,
  "exit": true
}
```

### Test Structure

```javascript
// test/user.test.js
import { expect } from 'chai';
import { User } from '../src/user.js';

describe('User', function() {
  // Hooks
  before(function() {
    // Runs once before all tests
  });
  
  after(function() {
    // Runs once after all tests
  });
  
  beforeEach(function() {
    // Runs before each test
    this.user = new User('Test');
  });
  
  afterEach(function() {
    // Runs after each test
  });
  
  describe('#getName()', function() {
    it('returns the user name', function() {
      expect(this.user.getName()).to.equal('Test');
    });
    
    it('throws if name is empty', function() {
      expect(() => new User('')).to.throw('Name required');
    });
  });
  
  // Async tests
  describe('#fetch()', function() {
    it('fetches user data', async function() {
      const data = await this.user.fetch();
      expect(data).to.have.property('id');
    });
    
    // With done callback
    it('fetches with callback', function(done) {
      this.user.fetch((err, data) => {
        expect(data).to.exist;
        done();
      });
    });
  });
  
  // Skip or only
  it.skip('skipped test', function() {});
  it.only('only this test runs', function() {});
});
```

### Chai Assertions

```javascript
import { expect, assert, should } from 'chai';
should();  // Extends Object.prototype

// Expect style (recommended)
expect(value).to.equal(3);
expect(value).to.deep.equal({ a: 1 });
expect(value).to.be.true;
expect(value).to.be.null;
expect(value).to.exist;
expect(arr).to.include('item');
expect(arr).to.have.lengthOf(3);
expect(obj).to.have.property('key');
expect(fn).to.throw(Error);

// Should style
value.should.equal(3);
arr.should.include('item');

// Assert style
assert.equal(value, 3);
assert.deepEqual(obj, { a: 1 });
assert.isTrue(value);
assert.throws(fn, Error);
```

---

## 4.4 Cypress

### What It Is

Cypress is a modern end-to-end testing framework that runs in the browser. It provides time-travel debugging, automatic waiting, and real-time reloads.

### Installation and Setup

```bash
# Install Cypress
npm install -D cypress

# Open Cypress
npx cypress open
```

```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    
    setupNodeEvents(on, config) {
      // Node event listeners
    }
  },
  
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite'
    }
  }
});
```

### E2E Tests

```javascript
// cypress/e2e/login.cy.js
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  
  it('logs in successfully', () => {
    // Type into inputs
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    
    // Click button
    cy.get('button[type="submit"]').click();
    
    // Assertions
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome back').should('be.visible');
  });
  
  it('shows error on invalid credentials', () => {
    cy.get('[data-testid="email"]').type('wrong@example.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    cy.get('.error-message')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });
});
```

### Commands and Queries

```javascript
// Querying elements
cy.get('.class');              // CSS selector
cy.get('[data-testid="id"]');  // Test ID (recommended)
cy.contains('text');           // By text content
cy.find('.child');             // Within previous subject

// Interactions
cy.click();
cy.dblclick();
cy.type('text');
cy.clear();
cy.check();
cy.uncheck();
cy.select('option');
cy.scrollTo('bottom');

// Assertions
cy.should('exist');
cy.should('be.visible');
cy.should('have.text', 'exact text');
cy.should('contain', 'partial text');
cy.should('have.class', 'active');
cy.should('have.value', 'input value');
cy.should('have.attr', 'href', '/path');

// Chaining
cy.get('input')
  .should('be.visible')
  .type('hello')
  .should('have.value', 'hello');

// Network stubbing
cy.intercept('GET', '/api/users', { fixture: 'users.json' }).as('getUsers');
cy.wait('@getUsers');

cy.intercept('POST', '/api/login', {
  statusCode: 200,
  body: { token: 'abc123' }
});
```

### Custom Commands

```javascript
// cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-testid="email"]').type(email);
  cy.get('[data-testid="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Usage in tests
cy.login('user@example.com', 'password123');
```

---

## 4.5 Playwright

### What It Is

Playwright is a cross-browser testing framework by Microsoft. It supports Chromium, Firefox, and WebKit with a single API and provides powerful auto-waiting and tracing capabilities.

### Installation and Setup

```bash
# Install Playwright
npm init playwright@latest

# Install browsers
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    }
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

### Writing Tests

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });
  
  test('successful login', async ({ page }) => {
    // Fill form
    await page.fill('[data-testid="email"]', 'user@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    
    // Click and wait for navigation
    await page.click('button[type="submit"]');
    
    // Assertions
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Welcome');
  });
  
  test('shows validation errors', async ({ page }) => {
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error')).toBeVisible();
    await expect(page.locator('.error')).toHaveText('Email is required');
  });
});
```

### Locators and Actions

```typescript
// Locators (recommended)
page.getByRole('button', { name: 'Submit' });
page.getByText('Welcome');
page.getByLabel('Email');
page.getByPlaceholder('Enter email');
page.getByTestId('submit-btn');

// CSS and XPath
page.locator('.class');
page.locator('//xpath');

// Actions
await page.click('button');
await page.fill('input', 'text');
await page.type('input', 'text');  // Types char by char
await page.press('input', 'Enter');
await page.selectOption('select', 'value');
await page.check('input[type="checkbox"]');
await page.hover('element');
await page.dragTo(source, target);

// Assertions
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toHaveText('text');
await expect(locator).toHaveValue('value');
await expect(locator).toHaveAttribute('href', '/path');
await expect(locator).toHaveCount(3);
await expect(page).toHaveTitle('Title');
await expect(page).toHaveURL('/path');
```

### Network Interception

```typescript
// Mock API responses
await page.route('**/api/users', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{ id: 1, name: 'Test' }])
  });
});

// Wait for requests
const responsePromise = page.waitForResponse('**/api/users');
await page.click('button');
const response = await responsePromise;
```

---

## 4.6 Testing Library

### What It Is

Testing Library is a family of utilities that encourage testing from the user's perspective. It works with React, Vue, Angular, and plain DOM.

### Installation

```bash
# For React
npm install -D @testing-library/react @testing-library/jest-dom

# For Vue
npm install -D @testing-library/vue

# For DOM
npm install -D @testing-library/dom
```

### React Testing Library

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button', () => {
  test('renders with text', () => {
    render(<Button>Click me</Button>);
    
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });
  
  test('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    
    render(<Button onClick={handleClick}>Click</Button>);
    
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  test('is disabled when loading', () => {
    render(<Button loading>Submit</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Queries

```typescript
// Priority order (accessibility-first)
// 1. Accessible to everyone
screen.getByRole('button', { name: 'Submit' });
screen.getByLabelText('Email');
screen.getByPlaceholderText('Enter email');
screen.getByText('Hello World');
screen.getByDisplayValue('current value');

// 2. Semantic queries
screen.getByAltText('Profile picture');
screen.getByTitle('Close');

// 3. Test IDs (last resort)
screen.getByTestId('submit-btn');

// Query variants
screen.getBy...()      // Throws if not found
screen.queryBy...()    // Returns null if not found
screen.findBy...()     // Returns promise, waits for element

screen.getAllBy...()   // Returns array, throws if empty
screen.queryAllBy...() // Returns array, empty if not found
screen.findAllBy...()  // Returns promise of array
```

### User Events

```typescript
import userEvent from '@testing-library/user-event';

test('form interaction', async () => {
  const user = userEvent.setup();
  render(<Form />);
  
  // Typing
  await user.type(screen.getByLabelText('Name'), 'John Doe');
  
  // Clicking
  await user.click(screen.getByRole('button'));
  
  // Selecting
  await user.selectOptions(screen.getByRole('combobox'), 'option1');
  
  // Keyboard
  await user.keyboard('{Enter}');
  await user.tab();
  
  // Clear and type
  await user.clear(screen.getByLabelText('Name'));
  await user.type(screen.getByLabelText('Name'), 'Jane');
});
```

### Async Utilities

```typescript
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react';

test('loads data', async () => {
  render(<DataComponent />);
  
  // Wait for element to appear
  const item = await screen.findByText('Loaded Data');
  expect(item).toBeInTheDocument();
  
  // Wait for condition
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
  
  // Wait for element to be removed
  await waitForElementToBeRemoved(() => screen.queryByText('Loading...'));
});
```

---

## 4.7 Summary

| Framework | Type | Best For | Key Feature |
|-----------|------|----------|-------------|
| Jest | Unit/Integration | General JS testing | All-in-one, mocking |
| Vitest | Unit/Integration | Vite projects | Speed, ESM |
| Mocha | Unit/Integration | Flexible setup | Choose your tools |
| Cypress | E2E | Browser testing | Time-travel debug |
| Playwright | E2E | Cross-browser | Multi-browser |
| Testing Library | Component | User-centric | Accessibility queries |

### Best Practices

1. **Test behavior, not implementation** — Focus on what users see
2. **Use data-testid sparingly** — Prefer accessible queries
3. **Keep tests isolated** — Each test should work independently
4. **Mock external dependencies** — APIs, databases, timers
5. **Aim for confidence, not coverage** — 100% coverage ≠ quality
6. **Run tests in CI** — Catch issues before merge
7. **Use snapshot tests wisely** — Only for stable output

---

**End of Module 4: Testing Frameworks**

Next: Module 5 — Version Control and Git
# Module 5: Version Control and Git

Git is the standard version control system for software development. This module covers essential Git operations, workflows, and best practices for JavaScript projects.

---

## 5.1 Git Fundamentals

### What It Is

Git is a distributed version control system that tracks changes in source code. Every developer has a complete copy of the repository history, enabling offline work and fast operations.

### Basic Configuration

```bash
# Set identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Set default branch name
git config --global init.defaultBranch main

# Set default editor
git config --global core.editor "code --wait"  # VS Code

# Enable helpful colors
git config --global color.ui auto

# Set pull behavior
git config --global pull.rebase true  # Rebase instead of merge on pull

# View configuration
git config --list
```

### Repository Operations

```bash
# Initialize new repository
git init

# Clone existing repository
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git  # SSH

# Clone specific branch
git clone -b develop https://github.com/user/repo.git

# Shallow clone (faster, less history)
git clone --depth 1 https://github.com/user/repo.git
```

### Staging and Committing

```bash
# Check status
git status
git status -s  # Short format

# Stage files
git add file.js           # Single file
git add src/              # Directory
git add .                 # All changes
git add -p                # Interactive staging (patch mode)

# Unstage files
git restore --staged file.js
git reset HEAD file.js    # Older syntax

# Commit
git commit -m "Add feature"
git commit                # Opens editor for message
git commit -am "Message"  # Stage tracked files and commit

# Amend last commit
git commit --amend -m "New message"
git commit --amend --no-edit  # Keep message, add staged changes

# View commit history
git log
git log --oneline
git log --oneline --graph --all
git log -n 5              # Last 5 commits
git log --author="Name"
git log --since="2024-01-01"
git log -- file.js        # History of specific file
```

### Branching

```bash
# List branches
git branch                # Local branches
git branch -r             # Remote branches
git branch -a             # All branches

# Create branch
git branch feature/login
git checkout -b feature/login  # Create and switch
git switch -c feature/login    # Modern syntax

# Switch branches
git checkout main
git switch main           # Modern syntax

# Rename branch
git branch -m old-name new-name
git branch -m new-name    # Rename current branch

# Delete branch
git branch -d feature/login     # Safe delete (merged only)
git branch -D feature/login     # Force delete

# Delete remote branch
git push origin --delete feature/login
```

### Merging and Rebasing

```bash
# Merge branch into current
git merge feature/login

# Merge with no fast-forward (always create merge commit)
git merge --no-ff feature/login

# Abort merge conflict
git merge --abort

# Rebase current branch onto main
git rebase main

# Interactive rebase (edit, squash, reorder commits)
git rebase -i HEAD~3      # Last 3 commits
git rebase -i main        # All commits since main

# Continue rebase after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

### Remote Operations

```bash
# List remotes
git remote -v

# Add remote
git remote add origin https://github.com/user/repo.git

# Fetch updates (without merging)
git fetch origin
git fetch --all           # All remotes

# Pull (fetch + merge/rebase)
git pull origin main
git pull --rebase origin main

# Push
git push origin main
git push -u origin main   # Set upstream
git push --force-with-lease  # Safe force push
git push --tags           # Push tags

# Track remote branch
git branch --set-upstream-to=origin/main main
```

### Undoing Changes

```bash
# Discard working directory changes
git restore file.js
git checkout -- file.js   # Older syntax

# Unstage file
git restore --staged file.js

# Reset to previous commit
git reset --soft HEAD~1   # Keep changes staged
git reset --mixed HEAD~1  # Keep changes unstaged (default)
git reset --hard HEAD~1   # Discard changes (DANGEROUS)

# Revert commit (creates new commit)
git revert abc123
git revert HEAD           # Revert last commit

# Recover deleted commits
git reflog
git reset --hard abc123   # Go back to specific state
```

### Stashing

```bash
# Stash changes
git stash
git stash push -m "Work in progress"

# Include untracked files
git stash -u

# List stashes
git stash list

# Apply stash
git stash apply           # Keep stash
git stash pop             # Apply and remove stash

# Apply specific stash
git stash apply stash@{2}

# Drop stash
git stash drop stash@{0}
git stash clear           # Remove all stashes
```

---

## 5.2 Git Workflows

### Feature Branch Workflow

The most common workflow for teams. Each feature gets its own branch.

```bash
# 1. Start from updated main
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/user-auth

# 3. Work on feature (multiple commits)
git add .
git commit -m "Add login form"
git commit -m "Add form validation"
git commit -m "Connect to auth API"

# 4. Push branch and create PR
git push -u origin feature/user-auth

# 5. After PR review and merge, clean up
git checkout main
git pull origin main
git branch -d feature/user-auth
```

### Gitflow Workflow

Structured workflow with specific branch types for larger projects.

```
main          ─────●─────────────────────●─────────────
                   │                     │
release       ─────│───────●─────●───────│─────────────
                   │       │     │       │
develop       ─────●───●───●─────●───●───●─────────────
                       │             │
feature       ─────────●─────────────●─────────────────
```

```bash
# Branch types:
# - main: Production-ready code
# - develop: Integration branch
# - feature/*: New features
# - release/*: Release preparation
# - hotfix/*: Production fixes

# Start feature
git checkout develop
git checkout -b feature/new-feature

# Finish feature
git checkout develop
git merge --no-ff feature/new-feature
git branch -d feature/new-feature

# Start release
git checkout develop
git checkout -b release/1.0.0

# Finish release
git checkout main
git merge --no-ff release/1.0.0
git tag -a v1.0.0 -m "Version 1.0.0"
git checkout develop
git merge --no-ff release/1.0.0
```

### Trunk-Based Development

Fast-moving workflow where developers commit directly to main (or short-lived branches).

```bash
# Work directly on main with small, frequent commits
git checkout main
git pull origin main

# Make small change
git add .
git commit -m "Add input validation"
git push origin main

# Or use very short-lived branches (< 1 day)
git checkout -b fix/typo
# Fix the issue
git checkout main
git merge fix/typo
git push origin main
git branch -d fix/typo
```

### Workflow Comparison

| Aspect | Feature Branch | Gitflow | Trunk-Based |
|--------|---------------|---------|-------------|
| Complexity | Medium | High | Low |
| Release Cadence | Any | Scheduled | Continuous |
| Branch Lifetime | Days-weeks | Varies | Hours-1 day |
| Best For | Most teams | Enterprise | CI/CD heavy |

---

## 5.3 Git Best Practices

### Commit Messages

```bash
# Good commit message format
<type>(<scope>): <subject>

<body>

<footer>
```

```bash
# Examples
feat(auth): add OAuth2 login support

Implement Google and GitHub OAuth providers.
Add token refresh logic and secure storage.

Closes #123

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation only
style:    Formatting (no code change)
refactor: Code change (no feature/fix)
perf:     Performance improvement
test:     Adding tests
chore:    Build process, dependencies
ci:       CI configuration
```

```bash
# ❌ Bad commit messages
"fix"
"WIP"
"asdf"
"changes"

# ✅ Good commit messages
"fix(cart): prevent negative quantities"
"feat(api): add pagination to /users endpoint"
"docs: update README installation steps"
```

### Branch Naming

```bash
# Format: type/description
feature/user-authentication
feature/shopping-cart
fix/login-redirect-loop
hotfix/security-patch
refactor/api-client
docs/contributing-guide

# Include ticket number when applicable
feature/PROJ-123-user-authentication
fix/PROJ-456-cart-total
```

### .gitignore

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build output
dist/
build/
.next/
.nuxt/

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log
npm-debug.log*

# Testing
coverage/
.nyc_output/

# Cache
.cache/
.eslintcache
.parcel-cache/

# TypeScript
*.tsbuildinfo
```

### Git Hooks with Husky

```bash
# Install Husky
npm install -D husky
npx husky init
```

```bash
# .husky/pre-commit
npm run lint-staged
```

```bash
# .husky/commit-msg
npx commitlint --edit $1
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

```javascript
// commitlint.config.js
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'chore', 'ci', 'revert'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 72]
  }
};
```

### Keeping History Clean

```bash
# Squash commits before merging
git rebase -i main

# In interactive rebase editor:
pick abc123 Add feature base
squash def456 Fix typo
squash ghi789 Address review feedback

# Result: Single clean commit

# Pull with rebase to avoid merge commits
git pull --rebase origin main

# Set as default
git config --global pull.rebase true
```

---

## 5.4 Advanced Git

### Cherry-Pick

```bash
# Apply specific commit to current branch
git cherry-pick abc123

# Cherry-pick without committing
git cherry-pick -n abc123

# Cherry-pick range
git cherry-pick abc123..def456
```

### Bisect

```bash
# Find commit that introduced a bug
git bisect start
git bisect bad                # Current version is bad
git bisect good v1.0.0        # This version was good

# Git checks out middle commit
# Test it, then:
git bisect good  # or
git bisect bad

# Repeat until Git finds the culprit
# When done:
git bisect reset
```

### Submodules

```bash
# Add submodule
git submodule add https://github.com/user/lib.git libs/lib

# Clone repo with submodules
git clone --recurse-submodules https://github.com/user/repo.git

# Initialize submodules after clone
git submodule update --init --recursive

# Update submodules
git submodule update --remote
```

### Worktrees

```bash
# Work on multiple branches simultaneously
git worktree add ../project-hotfix hotfix/urgent-fix

# List worktrees
git worktree list

# Remove worktree
git worktree remove ../project-hotfix
```

---

## 5.5 Summary

| Command | Purpose |
|---------|---------|
| `git init` | Initialize repository |
| `git clone` | Copy repository |
| `git add` | Stage changes |
| `git commit` | Save changes |
| `git push` | Upload to remote |
| `git pull` | Download from remote |
| `git branch` | Manage branches |
| `git merge` | Combine branches |
| `git rebase` | Reapply commits |
| `git stash` | Temporarily store changes |

### Best Practices

1. **Commit often** — Small, focused commits are easier to review and revert
2. **Write good commit messages** — Future you will thank present you
3. **Use branches** — Never commit directly to main
4. **Pull before push** — Avoid merge conflicts
5. **Review before committing** — Use `git diff --staged`
6. **Use .gitignore** — Don't commit generated files
7. **Set up hooks** — Automate linting and testing

---

**End of Module 5: Version Control and Git**

Next: Module 6 — Task Runners
# Module 6: Task Runners

Task runners automate repetitive development tasks like building, testing, and deploying. This module covers npm scripts for most use cases and Gulp for complex pipelines.

---

## 6.1 npm Scripts

### What It Is

npm scripts are the simplest and most common way to run tasks in JavaScript projects. They're defined in `package.json` and can run any command-line tool.

### Basic Scripts

```json
{
  "scripts": {
    "start": "node src/index.js",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write 'src/**/*.{js,ts,json}'",
    "typecheck": "tsc --noEmit"
  }
}
```

```bash
# Run scripts
npm run dev
npm run build
npm test          # 'test' can omit 'run'
npm start         # 'start' can omit 'run'

# Pass additional arguments
npm run lint -- --fix
npm test -- --watch
```

### Pre and Post Hooks

```json
{
  "scripts": {
    "prebuild": "npm run clean",
    "build": "vite build",
    "postbuild": "npm run analyze",
    
    "pretest": "npm run lint",
    "test": "vitest run",
    "posttest": "echo 'Tests complete!'",
    
    "clean": "rm -rf dist",
    "analyze": "source-map-explorer dist/*.js"
  }
}
```

```bash
# Running 'npm run build' executes:
# 1. prebuild (clean)
# 2. build (vite build)
# 3. postbuild (analyze)
```

### Running Multiple Scripts

```json
{
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    
    "validate:sequential": "npm run lint && npm run typecheck && npm run test",
    
    "validate:parallel": "npm-run-all --parallel lint typecheck test",
    
    "dev:all": "concurrently \"npm run dev\" \"npm run test:watch\""
  }
}
```

```bash
# Install helper packages
npm install -D npm-run-all    # Sequential and parallel
npm install -D concurrently   # Parallel with output management
```

### Cross-Platform Compatibility

```json
{
  "scripts": {
    "clean:unix": "rm -rf dist",
    "clean:windows": "if exist dist rmdir /s /q dist",
    
    "clean": "rimraf dist",
    
    "copy": "copyfiles -u 1 'src/**/*.json' dist",
    
    "env": "cross-env NODE_ENV=production node build.js"
  }
}
```

```bash
# Install cross-platform tools
npm install -D rimraf        # Cross-platform rm -rf
npm install -D copyfiles     # Cross-platform copy
npm install -D cross-env     # Cross-platform env vars
npm install -D shx           # Shell commands for npm scripts
```

### Environment Variables

```json
{
  "scripts": {
    "dev": "NODE_ENV=development vite",
    "build": "NODE_ENV=production vite build",
    
    "build:staging": "cross-env NODE_ENV=staging VITE_API_URL=https://staging.api.com vite build",
    "build:prod": "cross-env NODE_ENV=production VITE_API_URL=https://api.com vite build"
  }
}
```

```bash
# Using dotenv-cli
npm install -D dotenv-cli

# package.json
{
  "scripts": {
    "dev": "dotenv -e .env.development -- vite",
    "build:staging": "dotenv -e .env.staging -- vite build"
  }
}
```

### Common Script Patterns

```json
{
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "build:watch": "tsc --watch",
    
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    
    "lint": "eslint . --cache",
    "lint:fix": "eslint . --fix --cache",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    
    "check": "npm-run-all --parallel lint typecheck test:run",
    
    "clean": "rimraf dist .cache coverage",
    "prepare": "husky",
    
    "release": "npm run check && npm run build && npm publish",
    "release:patch": "npm version patch && npm run release",
    "release:minor": "npm version minor && npm run release",
    "release:major": "npm version major && npm run release"
  }
}
```

### Script Arguments and Variables

```json
{
  "scripts": {
    "greet": "echo Hello $npm_config_name",
    
    "build:component": "vite build --mode $npm_config_mode",
    
    "test:file": "vitest run"
  }
}
```

```bash
# Pass config values
npm run greet --name=World
# Output: Hello World

npm run build:component --mode=library

# Pass arguments after --
npm run test:file -- src/utils.test.ts
```

### Lifecycle Scripts

```json
{
  "scripts": {
    "prepare": "husky",
    
    "preinstall": "npx only-allow npm",
    "postinstall": "patch-package",
    
    "prepublishOnly": "npm run check && npm run build",
    
    "preversion": "npm run check",
    "version": "npm run build && git add -A dist",
    "postversion": "git push && git push --tags"
  }
}
```

---

## 6.2 Gulp

### What It Is

Gulp is a streaming build system that uses Node.js streams for efficient file processing. It's useful for complex build pipelines with many transformations.

### Installation and Setup

```bash
# Install Gulp
npm install -D gulp gulp-cli
```

```javascript
// gulpfile.js (or gulpfile.mjs for ESM)
import gulp from 'gulp';
import dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import terser from 'gulp-terser';
import imagemin from 'gulp-imagemin';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import browserSync from 'browser-sync';

const sass = gulpSass(dartSass);
const bs = browserSync.create();

// Paths configuration
const paths = {
  styles: {
    src: 'src/styles/**/*.scss',
    dest: 'dist/css'
  },
  scripts: {
    src: 'src/js/**/*.js',
    dest: 'dist/js'
  },
  images: {
    src: 'src/images/**/*',
    dest: 'dist/images'
  },
  html: {
    src: 'src/**/*.html',
    dest: 'dist'
  }
};

// Compile Sass to CSS
export function styles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(bs.stream());
}

// Minify JavaScript
export function scripts() {
  return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(concat('bundle.js'))
    .pipe(terser())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(bs.stream());
}

// Optimize images
export function images() {
  return gulp.src(paths.images.src, { encoding: false })
    .pipe(imagemin())
    .pipe(gulp.dest(paths.images.dest));
}

// Copy HTML
export function html() {
  return gulp.src(paths.html.src)
    .pipe(gulp.dest(paths.html.dest))
    .pipe(bs.stream());
}

// Development server
export function serve() {
  bs.init({
    server: {
      baseDir: 'dist'
    },
    port: 3000
  });
}

// Watch for changes
export function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
  gulp.watch(paths.html.src, html);
  gulp.watch(paths.images.src, images);
}

// Clean dist folder
export async function clean() {
  const { deleteAsync } = await import('del');
  return deleteAsync(['dist']);
}

// Build task
export const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, html)
);

// Development task
export const dev = gulp.series(
  build,
  gulp.parallel(serve, watch)
);

// Default task
export default dev;
```

### Running Gulp

```bash
# Run default task
gulp

# Run specific task
gulp build
gulp styles
gulp clean

# List available tasks
gulp --tasks
```

### Common Gulp Patterns

```javascript
// Conditional processing
import gulpIf from 'gulp-if';

const isProduction = process.env.NODE_ENV === 'production';

export function styles() {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulpIf(isProduction, postcss([cssnano()])))
    .pipe(gulp.dest('dist/css'));
}

// Error handling
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';

export function scripts() {
  return gulp.src('src/js/**/*.js')
    .pipe(plumber({
      errorHandler: notify.onError('Error: <%= error.message %>')
    }))
    .pipe(terser())
    .pipe(gulp.dest('dist/js'));
}

// Caching for incremental builds
import cache from 'gulp-cache';
import newer from 'gulp-newer';

export function images() {
  return gulp.src('src/images/**/*')
    .pipe(newer('dist/images'))  // Only process changed files
    .pipe(cache(imagemin()))
    .pipe(gulp.dest('dist/images'));
}
```

### npm Scripts vs Gulp

| Aspect | npm Scripts | Gulp |
|--------|-------------|------|
| Setup | No setup | Requires gulpfile |
| Learning Curve | Low | Medium |
| File Processing | External tools | Built-in streams |
| Complex Pipelines | Harder | Easier |
| Performance | Depends on tools | Efficient streaming |
| Modern Usage | Most projects | Legacy/complex builds |

---

## 6.3 Summary

| Tool | Best For | Key Feature |
|------|----------|-------------|
| npm scripts | Most projects | Simple, zero config |
| npm-run-all | Sequential/parallel tasks | Multiple script runner |
| concurrently | Dev servers + watchers | Parallel with output |
| Gulp | Complex pipelines | Streaming builds |

### Best Practices

1. **Start with npm scripts** — They handle 90% of use cases
2. **Use cross-platform tools** — rimraf, cross-env, etc.
3. **Document scripts** — Add comments in README
4. **Keep scripts focused** — One task per script
5. **Use pre/post hooks** — For automatic setup/cleanup
6. **Cache when possible** — Speed up repeated runs
7. **Parallelize independent tasks** — Faster builds

### Recommended npm Scripts Template

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --cache",
    "lint:fix": "eslint . --fix --cache",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "check": "npm-run-all --parallel lint typecheck && npm test",
    "prepare": "husky"
  }
}
```

---

**End of Module 6: Task Runners**

Next: Module 7 — Development Tools
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
# Module 8: Package Publishing

Publishing packages to npm shares your code with the JavaScript community. This module covers package preparation, versioning, and automated publishing with CI/CD.

---

## 8.1 Preparing Packages

### Package Structure

```
my-package/
├── src/
│   ├── index.ts           # Main entry
│   ├── utils.ts           # Utilities
│   └── types.ts           # TypeScript types
├── dist/                  # Built output
│   ├── index.js           # CommonJS
│   ├── index.mjs          # ES modules
│   ├── index.d.ts         # Type declarations
│   └── index.d.mts        # ESM type declarations
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### package.json for Publishing

```json
{
  "name": "@scope/my-package",
  "version": "1.0.0",
  "description": "A useful JavaScript utility library",
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/my-package.git"
  },
  "homepage": "https://github.com/user/my-package#readme",
  "bugs": {
    "url": "https://github.com/user/my-package/issues"
  },
  "keywords": ["utility", "javascript", "typescript"],
  
  "type": "module",
  
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    },
    "./package.json": "./package.json"
  },
  
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  
  "sideEffects": false,
  
  "engines": {
    "node": ">=18"
  },
  
  "scripts": {
    "build": "tsup",
    "prepublishOnly": "npm run build && npm test",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": {
      "optional": true
    }
  },
  
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

### Entry Points Explained

```javascript
// Main fields (legacy):
"main": "./dist/index.cjs"      // CommonJS entry (require)
"module": "./dist/index.js"     // ESM entry for bundlers
"types": "./dist/index.d.ts"    // TypeScript types

// Exports field (modern, recommended):
"exports": {
  // Package root import
  ".": {
    "types": "./dist/index.d.ts",  // TypeScript (must be first!)
    "import": "./dist/index.js",   // import { } from 'pkg'
    "require": "./dist/index.cjs"  // require('pkg')
  },
  // Subpath exports
  "./utils": {
    "types": "./dist/utils.d.ts",
    "import": "./dist/utils.js",
    "require": "./dist/utils.cjs"
  },
  // Pattern exports
  "./*": {
    "types": "./dist/*.d.ts",
    "import": "./dist/*.js",
    "require": "./dist/*.cjs"
  }
}
```

### Building with tsup

```bash
npm install -D tsup typescript
```

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  // Entry points
  entry: ['src/index.ts', 'src/utils.ts'],
  
  // Output formats
  format: ['cjs', 'esm'],
  
  // TypeScript declarations
  dts: true,
  
  // Source maps
  sourcemap: true,
  
  // Clean output directory
  clean: true,
  
  // Minify
  minify: true,
  
  // External packages (don't bundle)
  external: ['react', 'react-dom'],
  
  // Target environment
  target: 'es2020',
  
  // Split chunks
  splitting: true,
  
  // Tree shaking
  treeshake: true
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
    "lib": ["ES2020", "DOM"],
    
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### What to Include

```json
// package.json - files field
{
  "files": [
    "dist",        // Built code
    "README.md",   // Documentation
    "LICENSE"      // License file
    // package.json is always included
  ]
}
```

```bash
# Preview what will be published
npm pack --dry-run

# Create tarball to inspect
npm pack
tar -tzf my-package-1.0.0.tgz
```

---

## 8.2 Versioning Strategy

### Semantic Versioning (SemVer)

```
MAJOR.MINOR.PATCH
  │     │     └── Bug fixes (backwards compatible)
  │     └──────── New features (backwards compatible)
  └────────────── Breaking changes

Examples:
1.0.0 → 1.0.1  Patch: Bug fix
1.0.0 → 1.1.0  Minor: New feature
1.0.0 → 2.0.0  Major: Breaking change
```

### Pre-release Versions

```bash
# Alpha (early testing)
1.0.0-alpha.0
1.0.0-alpha.1

# Beta (feature complete, testing)
1.0.0-beta.0
1.0.0-beta.1

# Release candidate (final testing)
1.0.0-rc.0
1.0.0-rc.1

# Version commands
npm version premajor --preid=alpha  # 2.0.0-alpha.0
npm version prerelease              # 2.0.0-alpha.1
npm version prerelease              # 2.0.0-alpha.2
npm version minor                   # 2.0.0 (removes prerelease)
```

### Version Bumping

```bash
# Manual version bump
npm version patch   # 1.0.0 → 1.0.1
npm version minor   # 1.0.0 → 1.1.0
npm version major   # 1.0.0 → 2.0.0

# With message
npm version patch -m "Release v%s"

# Without git tag
npm version patch --no-git-tag-version
```

### Changelogs

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- New `transform` utility function

### Changed
- Improved TypeScript types for `parse` function

### Fixed
- Fixed edge case in date parsing

## [1.1.0] - 2024-03-15

### Added
- Support for custom formatters
- New `format` export

### Deprecated
- `formatDate` will be removed in v2.0.0, use `format` instead

## [1.0.1] - 2024-03-01

### Fixed
- Fixed incorrect timezone handling

## [1.0.0] - 2024-02-15

### Added
- Initial release
- Core parsing functionality
- TypeScript support
```

### Automated Changelogs

```bash
# Install conventional-changelog
npm install -D conventional-changelog-cli

# Generate changelog
npx conventional-changelog -p angular -i CHANGELOG.md -s

# Add to package.json
{
  "scripts": {
    "changelog": "conventional-changelog -p angular -i CHANGELOG.md -s",
    "version": "npm run changelog && git add CHANGELOG.md"
  }
}
```

### Conventional Commits

```bash
# Format: type(scope): description

feat(auth): add OAuth2 support
fix(parser): handle edge case in date parsing
docs(readme): update installation instructions
chore(deps): bump typescript to 5.0
refactor(core): improve performance of parse function
test(utils): add missing tests for format function
ci(github): add automated release workflow

# Breaking change
feat(api)!: change return type of parse function

# With body and footer
fix(parser): handle null input

Previously, null input would throw an undefined error.
Now it returns an empty result.

Closes #123
```

---

## 8.3 CI/CD for Packages

### GitHub Actions Release Workflow

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: write
  id-token: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Test
        run: npm test
      
      - name: Build
        run: npm run build

  publish:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for changelog
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Publish to npm
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### Automated Version Bumping

```yaml
# .github/workflows/version-bump.yml
name: Version Bump

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version bump type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major
          - prerelease

jobs:
  bump:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      
      - name: Bump version
        run: npm version ${{ inputs.version }} -m "chore(release): v%s"
      
      - name: Push changes
        run: git push --follow-tags
```

### Semantic Release (Automated)

```bash
npm install -D semantic-release @semantic-release/changelog @semantic-release/git
```

```json
// package.json
{
  "release": {
    "branches": ["main"],
    "plugins": [
      "@semantic-release/commit-analyzer",
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      "@semantic-release/npm",
      "@semantic-release/github",
      ["@semantic-release/git", {
        "assets": ["package.json", "CHANGELOG.md"],
        "message": "chore(release): ${nextRelease.version}"
      }]
    ]
  }
}
```

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      - run: npm test
      
      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: npx semantic-release
```

### npm Provenance

```bash
# Publish with provenance (proves package came from CI)
npm publish --provenance

# Requires:
# 1. GitHub Actions or GitLab CI
# 2. id-token: write permission
# 3. Registry support (npm supports it)

# Check provenance
npm audit signatures
```

### Publishing Checklist

```bash
# Before first publish:
1. ✅ npm login
2. ✅ Verify package name availability
3. ✅ Set up NPM_TOKEN secret in GitHub
4. ✅ Add README.md and LICENSE
5. ✅ Configure package.json exports
6. ✅ Test build locally

# Before each release:
1. ✅ Run tests
2. ✅ Update CHANGELOG.md
3. ✅ Bump version
4. ✅ Build
5. ✅ npm pack --dry-run (verify contents)
6. ✅ Publish
```

---

## 8.4 Summary

| Stage | Key Tasks |
|-------|-----------|
| Preparation | Configure exports, build setup, TypeScript declarations |
| Versioning | SemVer, changelogs, conventional commits |
| Publishing | npm publish, provenance, CI/CD automation |

### Best Practices

1. **Use exports field** — Modern way to define entry points
2. **Generate TypeScript declarations** — Essential for TypeScript users
3. **Minimize published files** — Use `files` field
4. **Follow SemVer strictly** — Breaking changes = major version
5. **Write good README** — First thing users see
6. **Automate releases** — Semantic release or GitHub Actions
7. **Enable provenance** — Proves authenticity
8. **Test before publish** — Use `prepublishOnly` script

### Quick Reference

```bash
# Login to npm
npm login

# Publish public package
npm publish --access public

# Publish scoped package
npm publish --access public  # For @scope/package

# View published package
npm info package-name

# Deprecate version
npm deprecate package-name@1.0.0 "Use v2 instead"

# Unpublish (within 72 hours)
npm unpublish package-name@1.0.0
```

---

**End of Module 8: Package Publishing**

This concludes Section IV: Build Tools & Development Environment.
