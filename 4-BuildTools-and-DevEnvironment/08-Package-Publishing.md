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
