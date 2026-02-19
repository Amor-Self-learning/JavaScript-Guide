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
