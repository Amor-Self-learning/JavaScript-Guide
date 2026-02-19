# Module 23: NPM and Package Management

NPM (Node Package Manager) is the world's largest software registry and the default package manager for Node.js. This module covers package management, publishing, and best practices.

---

## 23.1 NPM Basics

### Initialization

```bash
# Initialize new project
npm init

# Initialize with defaults
npm init -y

# Initialize with scope
npm init --scope=@myorg
```

### Installing Packages

```bash
# Install dependencies from package.json
npm install
npm i

# Install specific package
npm install express

# Install specific version
npm install express@4.18.2
npm install express@^4.0.0  # Compatible with 4.x
npm install express@~4.18.0 # Compatible with 4.18.x

# Install as dev dependency
npm install --save-dev jest
npm install -D jest

# Install globally
npm install -g typescript

# Install from GitHub
npm install github:user/repo
npm install github:user/repo#branch

# Install from URL
npm install https://github.com/user/repo/tarball/master
```

### Uninstalling Packages

```bash
npm uninstall express
npm uninstall -D jest
npm uninstall -g typescript
```

### Updating Packages

```bash
# Check outdated
npm outdated

# Update to latest compatible
npm update
npm update express

# Update to absolute latest (may break)
npm install express@latest

# Interactive update
npx npm-check-updates -i
```

---

## 23.2 package.json

### Essential Fields

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "description": "A sample package",
  "main": "index.js",
  "module": "index.mjs",
  "types": "index.d.ts",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs",
      "types": "./index.d.ts"
    },
    "./utils": {
      "import": "./utils.mjs",
      "require": "./utils.cjs"
    }
  },
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest",
    "build": "tsc",
    "lint": "eslint .",
    "prepare": "husky install"
  },
  "keywords": ["nodejs", "example"],
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/user/repo.git"
  },
  "bugs": {
    "url": "https://github.com/user/repo/issues"
  },
  "homepage": "https://github.com/user/repo#readme",
  "engines": {
    "node": ">=18.0.0"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "optionalDependencies": {
    "fsevents": "^2.3.2"
  }
}
```

### Version Ranges

```json
{
  "dependencies": {
    "exact": "1.2.3",           // Exactly 1.2.3
    "caret": "^1.2.3",          // >=1.2.3 <2.0.0
    "tilde": "~1.2.3",          // >=1.2.3 <1.3.0
    "range": ">=1.0.0 <2.0.0",  // Range
    "or": "1.0.0 || 2.0.0",     // Either version
    "latest": "*",               // Latest (dangerous!)
    "tag": "latest",             // Dist tag
    "git": "github:user/repo",   // Git repo
    "file": "file:../local-pkg"  // Local path
  }
}
```

### Scripts

```json
{
  "scripts": {
    "preinstall": "echo 'Before install'",
    "install": "node-gyp rebuild",
    "postinstall": "echo 'After install'",
    
    "prepublishOnly": "npm test && npm run build",
    "prepare": "husky install",
    
    "pretest": "npm run lint",
    "test": "jest",
    "posttest": "npm run coverage",
    
    "start": "node server.js",
    "dev": "NODE_ENV=development nodemon server.js",
    "build": "npm run clean && tsc",
    "clean": "rm -rf dist",
    
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write ."
  }
}
```

---

## 23.3 NPM Scripts

### Running Scripts

```bash
# Run script
npm run test
npm run build

# Shortcuts
npm test       # npm run test
npm start      # npm run start

# With arguments
npm run build -- --watch

# Run multiple scripts
npm run lint && npm run test

# Silent mode
npm run test -s
npm run test --silent

# Show script output
npm run test --loglevel verbose
```

### Environment Variables

```javascript
// Access npm_package_* variables
console.log(process.env.npm_package_name);
console.log(process.env.npm_package_version);

// Custom env in scripts
// package.json
{
  "scripts": {
    "dev": "NODE_ENV=development node server.js"
  }
}

// Cross-platform (use cross-env package)
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development node server.js"
  }
}
```

---

## 23.4 package-lock.json

### Purpose

```json
// Locks exact versions for reproducible builds
{
  "name": "my-app",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-...",
      "dependencies": {
        "accepts": "~1.3.8",
        "...": "..."
      }
    }
  }
}
```

### Commands

```bash
# Install from lock file (CI)
npm ci

# Update lock file without updating node_modules
npm install --package-lock-only

# Verify integrity
npm audit signatures
```

---

## 23.5 Workspaces (Monorepos)

### Configuration

```json
// root package.json
{
  "name": "monorepo",
  "workspaces": [
    "packages/*",
    "apps/*"
  ]
}
```

### Workspace Commands

```bash
# Install all workspaces
npm install

# Run script in specific workspace
npm run build -w @myorg/package-a
npm run build --workspace=packages/core

# Run script in all workspaces
npm run test --workspaces
npm run test -ws

# Add dependency to workspace
npm install lodash -w @myorg/package-a

# List workspaces
npm query .workspace
```

---

## 23.6 Publishing Packages

### Prepare for Publishing

```json
{
  "name": "@myorg/my-package",
  "version": "1.0.0",
  "files": [
    "dist",
    "README.md"
  ],
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "publishConfig": {
    "access": "public",
    "registry": "https://registry.npmjs.org/"
  }
}
```

### Publishing Commands

```bash
# Login to npm
npm login

# Check what will be published
npm pack --dry-run

# Publish
npm publish

# Publish scoped package publicly
npm publish --access public

# Publish with tag
npm publish --tag beta

# Version bump
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Deprecate version
npm deprecate my-package@1.0.0 "Use v2 instead"

# Unpublish (within 72 hours)
npm unpublish my-package@1.0.0
```

---

## 23.7 Security

### Audit

```bash
# Check for vulnerabilities
npm audit

# Get JSON output
npm audit --json

# Fix automatically
npm audit fix

# Force fix (may break)
npm audit fix --force

# Audit with production only
npm audit --omit=dev
```

### Best Practices

```json
{
  "scripts": {
    "preinstall": "npx only-allow npm",
    "prepare": "husky install"
  },
  "overrides": {
    "vulnerable-package": "^2.0.0"
  }
}
```

---

## 23.8 Private Registry

### .npmrc Configuration

```ini
# ~/.npmrc or project .npmrc

# Default registry
registry=https://registry.npmjs.org/

# Scoped registry
@myorg:registry=https://npm.pkg.github.com/

# Auth token
//npm.pkg.github.com/:_authToken=${NPM_TOKEN}

# Always authenticate
always-auth=true

# Other settings
save-exact=true
package-lock=true
engine-strict=true
```

### GitHub Packages

```json
{
  "name": "@username/package",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com/"
  }
}
```

---

## 23.9 Useful Commands

```bash
# Info about package
npm info express
npm view express versions

# Search packages
npm search express

# List installed packages
npm list
npm list --depth=0
npm list -g --depth=0

# Why is package installed
npm explain express
npm why express

# Link local package
npm link ../my-local-package
npm link my-local-package

# Unlink
npm unlink my-local-package

# Clean cache
npm cache clean --force

# Check npm config
npm config list
npm config get registry

# Run package without installing
npx create-react-app my-app
npx cowsay "Hello"

# Open package page
npm home express
npm repo express
npm docs express
```

---

## 23.10 Alternative Package Managers

### Yarn

```bash
yarn init
yarn add express
yarn add -D jest
yarn remove express
yarn
yarn install --frozen-lockfile  # Like npm ci
```

### pnpm

```bash
pnpm init
pnpm add express
pnpm add -D jest
pnpm remove express
pnpm install
pnpm install --frozen-lockfile
```

### Comparison

| Feature | npm | Yarn | pnpm |
|---------|-----|------|------|
| Lock file | package-lock.json | yarn.lock | pnpm-lock.yaml |
| Speed | Moderate | Fast | Fastest |
| Disk usage | High | High | Low (links) |
| Workspaces | Yes | Yes | Yes |
| PnP | No | Yes | No |

---

## 23.11 Common Issues

### Peer Dependency Conflicts

```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Force install
npm install --force

# Override in package.json
{
  "overrides": {
    "react": "^18.0.0"
  }
}
```

### Permission Errors

```bash
# Fix npm permissions (Linux/Mac)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Or use nvm for Node version management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

### Cache Issues

```bash
# Clean cache
npm cache clean --force

# Verify cache
npm cache verify

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 23.12 Summary

| Command | Description |
|---------|-------------|
| `npm init` | Initialize project |
| `npm install` | Install dependencies |
| `npm install pkg` | Install package |
| `npm install -D pkg` | Install as devDependency |
| `npm install -g pkg` | Install globally |
| `npm uninstall pkg` | Remove package |
| `npm update` | Update packages |
| `npm outdated` | Check for updates |
| `npm run script` | Run script |
| `npm test` | Run test script |
| `npm start` | Run start script |
| `npm publish` | Publish package |
| `npm version` | Bump version |
| `npm audit` | Security audit |
| `npm ci` | Clean install (CI) |
| `npx` | Run package without install |

| package.json Field | Description |
|--------------------|-------------|
| `dependencies` | Production dependencies |
| `devDependencies` | Development only |
| `peerDependencies` | Required by consumer |
| `optionalDependencies` | Optional packages |
| `scripts` | NPM scripts |
| `engines` | Node version requirement |
| `workspaces` | Monorepo packages |
| `files` | Files to publish |

---

**End of Module 23: NPM and Package Management**

Next: **Module 24 — Advanced Concepts** (Error handling, debugging, security)
