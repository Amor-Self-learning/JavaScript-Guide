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
