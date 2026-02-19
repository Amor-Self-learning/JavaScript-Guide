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
