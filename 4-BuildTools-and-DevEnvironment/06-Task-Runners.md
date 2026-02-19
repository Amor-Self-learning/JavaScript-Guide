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
