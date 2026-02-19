# Module 22: Test Runner

Node.js includes a built-in test runner (stable in Node.js 20+) for writing and running tests without external dependencies.

---

## 22.1 Module Import

```javascript
// CommonJS
const { test, describe, it, before, after, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');

// ES Modules
import { test, describe, it, before, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
```

---

## 22.2 Basic Tests

### Simple Test

```javascript
const test = require('node:test');
const assert = require('node:assert');

test('basic addition', () => {
  assert.strictEqual(1 + 1, 2);
});

test('string comparison', () => {
  assert.strictEqual('hello'.toUpperCase(), 'HELLO');
});
```

### Async Tests

```javascript
test('async operation', async () => {
  const result = await Promise.resolve(42);
  assert.strictEqual(result, 42);
});

test('async with timeout', async () => {
  const data = await fetchData();
  assert.ok(data.length > 0);
});
```

### Callback Tests

```javascript
test('callback style', (t, done) => {
  setTimeout(() => {
    assert.ok(true);
    done();
  }, 100);
});
```

---

## 22.3 Test Organization

### describe / it

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

describe('Calculator', () => {
  describe('add', () => {
    it('should add two positive numbers', () => {
      assert.strictEqual(add(2, 3), 5);
    });
    
    it('should handle negative numbers', () => {
      assert.strictEqual(add(-1, 1), 0);
    });
  });
  
  describe('multiply', () => {
    it('should multiply numbers', () => {
      assert.strictEqual(multiply(3, 4), 12);
    });
  });
});
```

### Nested test()

```javascript
test('parent test', async t => {
  await t.test('child test 1', () => {
    assert.ok(true);
  });
  
  await t.test('child test 2', () => {
    assert.ok(true);
  });
});
```

---

## 22.4 Hooks

```javascript
const { describe, it, before, after, beforeEach, afterEach } = require('node:test');

describe('Database tests', () => {
  let db;
  
  before(async () => {
    // Run once before all tests
    db = await connectToDatabase();
  });
  
  after(async () => {
    // Run once after all tests
    await db.close();
  });
  
  beforeEach(async () => {
    // Run before each test
    await db.clear();
  });
  
  afterEach(async () => {
    // Run after each test
    await db.rollback();
  });
  
  it('should insert data', async () => {
    await db.insert({ name: 'test' });
    const count = await db.count();
    assert.strictEqual(count, 1);
  });
});
```

---

## 22.5 Test Options

```javascript
test('test with options', { timeout: 5000 }, async () => {
  // Test must complete within 5 seconds
  await slowOperation();
});

test('skipped test', { skip: true }, () => {
  // This test won't run
});

test('conditionally skipped', { skip: process.env.CI ? 'Skipping in CI' : false }, () => {
  // Skip with reason
});

test('todo test', { todo: true }, () => {
  // Marked as TODO
});

test('todo with description', { todo: 'Need to implement' }, () => {
  // TODO with message
});

test('only this test', { only: true }, () => {
  // Run only this test (when using --test-only flag)
});

test('concurrent test', { concurrency: 4 }, async t => {
  // Run subtests with concurrency
  await t.test('sub1', async () => {});
  await t.test('sub2', async () => {});
});
```

---

## 22.6 Test Context

```javascript
test('using test context', async t => {
  // Diagnostic info
  t.diagnostic('Running important test');
  
  // Skip at runtime
  if (!featureEnabled) {
    t.skip('Feature not enabled');
    return;
  }
  
  // TODO at runtime
  if (notImplemented) {
    t.todo('Not implemented yet');
    return;
  }
  
  // Get test name
  console.log(t.name);
  
  // Abort signal
  const signal = t.signal;
  
  // Nested tests
  await t.test('nested', () => {
    assert.ok(true);
  });
});
```

---

## 22.7 Mocking

### Function Mocking

```javascript
const { test, mock } = require('node:test');
const assert = require('node:assert');

test('mock function', () => {
  const fn = mock.fn();
  
  fn('hello');
  fn('world');
  
  assert.strictEqual(fn.mock.callCount(), 2);
  assert.deepStrictEqual(fn.mock.calls[0].arguments, ['hello']);
  assert.deepStrictEqual(fn.mock.calls[1].arguments, ['world']);
});

test('mock with implementation', () => {
  const fn = mock.fn(x => x * 2);
  
  assert.strictEqual(fn(5), 10);
  assert.strictEqual(fn.mock.callCount(), 1);
});

test('mock return values', () => {
  const fn = mock.fn();
  
  fn.mock.mockImplementation(() => 42);
  assert.strictEqual(fn(), 42);
  
  fn.mock.mockImplementationOnce(() => 100);
  assert.strictEqual(fn(), 100);  // Once
  assert.strictEqual(fn(), 42);   // Back to default
});
```

### Spying on Methods

```javascript
const { test, mock } = require('node:test');

test('spy on method', () => {
  const obj = {
    method(x) { return x + 1; }
  };
  
  const spy = mock.method(obj, 'method');
  
  obj.method(5);
  
  assert.strictEqual(spy.mock.callCount(), 1);
  assert.deepStrictEqual(spy.mock.calls[0].arguments, [5]);
});

test('mock method implementation', () => {
  const obj = {
    getData() { return 'real data'; }
  };
  
  mock.method(obj, 'getData', () => 'mocked data');
  
  assert.strictEqual(obj.getData(), 'mocked data');
});
```

### Mocking Timers

```javascript
const { test, mock } = require('node:test');

test('mock timers', () => {
  mock.timers.enable(['setTimeout']);
  
  let called = false;
  setTimeout(() => { called = true; }, 1000);
  
  assert.strictEqual(called, false);
  
  mock.timers.tick(500);
  assert.strictEqual(called, false);
  
  mock.timers.tick(500);
  assert.strictEqual(called, true);
  
  mock.timers.reset();
});

test('mock Date', () => {
  mock.timers.enable({ apis: ['Date'], now: new Date('2024-01-01') });
  
  assert.strictEqual(new Date().getFullYear(), 2024);
  
  mock.timers.reset();
});
```

### Module Mocking

```javascript
const { test, mock } = require('node:test');

test('mock module', async t => {
  // Mock before importing
  mock.module('fs', {
    namedExports: {
      readFile: mock.fn(() => Promise.resolve('mocked content'))
    }
  });
  
  const fs = require('fs');
  const content = await fs.readFile('test.txt');
  
  assert.strictEqual(content, 'mocked content');
  
  mock.reset();
});
```

---

## 22.8 Snapshots

```javascript
const { test, snapshot } = require('node:test');

test('snapshot testing', t => {
  const data = {
    users: ['Alice', 'Bob'],
    count: 2
  };
  
  // First run: creates snapshot
  // Subsequent runs: compares against snapshot
  t.assert.snapshot(data);
});

// Update snapshots with --test-update-snapshots flag
```

---

## 22.9 Code Coverage

```bash
# Run tests with coverage
node --test --experimental-test-coverage

# Output coverage to file
node --test --experimental-test-coverage --test-reporter=lcov --test-reporter-destination=coverage.lcov
```

```javascript
// Access coverage in test
test('check coverage', async t => {
  // Coverage info available after tests complete
});
```

---

## 22.10 Running Tests

### CLI

```bash
# Run all tests
node --test

# Run specific file
node --test test/unit.test.js

# Run with glob pattern
node --test 'test/**/*.test.js'

# Watch mode
node --test --watch

# Concurrent tests
node --test --test-concurrency=4

# Run only tests marked with { only: true }
node --test --test-only

# Test sharding
node --test --test-shard=1/3   # Run 1st of 3 shards
node --test --test-shard=2/3   # Run 2nd of 3 shards

# Timeout
node --test --test-timeout=5000

# Reporter
node --test --test-reporter=spec
node --test --test-reporter=tap
node --test --test-reporter=dot
```

### File Naming

Test files are auto-discovered:
- `**/*.test.{js,mjs,cjs}`
- `**/*-test.{js,mjs,cjs}`
- `**/*_test.{js,mjs,cjs}`
- `**/test-*.{js,mjs,cjs}`
- `**/test/*.{js,mjs,cjs}`
- `**/tests/*.{js,mjs,cjs}`

---

## 22.11 Reporters

### Built-in Reporters

```bash
node --test --test-reporter=spec     # Hierarchical output
node --test --test-reporter=tap      # TAP format
node --test --test-reporter=dot      # Dot output
node --test --test-reporter=junit    # JUnit XML
node --test --test-reporter=lcov     # Coverage LCOV
```

### Custom Reporter

```javascript
// custom-reporter.js
module.exports = async function* customReporter(source) {
  for await (const event of source) {
    switch (event.type) {
      case 'test:start':
        yield `Starting: ${event.data.name}\n`;
        break;
      case 'test:pass':
        yield `✓ ${event.data.name}\n`;
        break;
      case 'test:fail':
        yield `✗ ${event.data.name}\n`;
        yield `  ${event.data.details.error.message}\n`;
        break;
    }
  }
};
```

```bash
node --test --test-reporter=./custom-reporter.js
```

---

## 22.12 Common Patterns

### Testing Async Functions

```javascript
test('async function success', async () => {
  const result = await asyncFunction();
  assert.strictEqual(result, 'expected');
});

test('async function throws', async () => {
  await assert.rejects(
    async () => await failingAsyncFunction(),
    { name: 'Error', message: 'Expected error' }
  );
});
```

### Testing Events

```javascript
const { test, mock } = require('node:test');
const EventEmitter = require('events');

test('event emission', () => {
  const emitter = new EventEmitter();
  const handler = mock.fn();
  
  emitter.on('data', handler);
  emitter.emit('data', { value: 42 });
  
  assert.strictEqual(handler.mock.callCount(), 1);
  assert.deepStrictEqual(handler.mock.calls[0].arguments, [{ value: 42 }]);
});
```

### Testing with Cleanup

```javascript
test('test with cleanup', async t => {
  const resource = await acquireResource();
  
  t.after(async () => {
    await resource.release();
  });
  
  // Test using resource
  assert.ok(resource.isActive);
});
```

### Testing HTTP Server

```javascript
const http = require('http');
const { test, describe, before, after } = require('node:test');

describe('HTTP Server', () => {
  let server;
  let baseUrl;
  
  before(async () => {
    server = http.createServer((req, res) => {
      res.end('OK');
    });
    
    await new Promise(resolve => {
      server.listen(0, () => {
        baseUrl = `http://localhost:${server.address().port}`;
        resolve();
      });
    });
  });
  
  after(() => server.close());
  
  test('GET /', async () => {
    const response = await fetch(baseUrl);
    assert.strictEqual(response.status, 200);
    assert.strictEqual(await response.text(), 'OK');
  });
});
```

---

## 22.13 Summary

| Function | Description |
|----------|-------------|
| `test(name, fn)` | Create test |
| `describe(name, fn)` | Group tests |
| `it(name, fn)` | Alias for test in describe |
| `before(fn)` | Run once before tests |
| `after(fn)` | Run once after tests |
| `beforeEach(fn)` | Run before each test |
| `afterEach(fn)` | Run after each test |

| Test Options | Description |
|--------------|-------------|
| `timeout` | Max test duration |
| `skip` | Skip test |
| `todo` | Mark as TODO |
| `only` | Run only this test |
| `concurrency` | Parallel subtests |

| Mock API | Description |
|----------|-------------|
| `mock.fn()` | Create mock function |
| `mock.method()` | Mock object method |
| `mock.module()` | Mock module |
| `mock.timers.enable()` | Mock timers |
| `mock.reset()` | Reset all mocks |

| CLI Flags | Description |
|-----------|-------------|
| `--test` | Run tests |
| `--test-only` | Run only { only: true } |
| `--test-watch` | Watch mode |
| `--test-reporter` | Output format |
| `--experimental-test-coverage` | Enable coverage |

---

**End of Module 22: Test Runner**

Next: **Module 23 — NPM and Package Management**
