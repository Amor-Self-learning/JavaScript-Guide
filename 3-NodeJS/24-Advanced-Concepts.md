# Module 24: Advanced Concepts

This module covers essential advanced topics: error handling patterns, debugging techniques, security best practices, performance optimization, and deployment considerations.

---

## 24.1 Error Handling

### Error Types

```javascript
// Built-in error types
new Error('Generic error');
new TypeError('Type error');
new RangeError('Range error');
new ReferenceError('Reference error');
new SyntaxError('Syntax error');

// System errors (from libuv/OS)
// ENOENT, EACCES, ECONNREFUSED, etc.

// Custom errors
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    Error.captureStackTrace(this, ValidationError);
  }
}

class NotFoundError extends Error {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.resource = resource;
    this.id = id;
  }
}
```

### Sync Error Handling

```javascript
// Try-catch for synchronous code
try {
  const data = JSON.parse(invalidJson);
} catch (err) {
  console.error('Parse error:', err.message);
}

// Don't catch what you can't handle
function readConfig(path) {
  try {
    return JSON.parse(fs.readFileSync(path));
  } catch (err) {
    if (err.code === 'ENOENT') {
      return {};  // Return default
    }
    throw err;  // Re-throw unexpected errors
  }
}
```

### Async Error Handling

```javascript
// Promises
fetchData()
  .then(data => process(data))
  .catch(err => {
    console.error('Error:', err.message);
  })
  .finally(() => {
    cleanup();
  });

// Async/await
async function processData() {
  try {
    const data = await fetchData();
    return await transform(data);
  } catch (err) {
    // Handle or rethrow
    if (err instanceof NetworkError) {
      return getCachedData();
    }
    throw err;
  }
}

// Error-first callbacks
fs.readFile('file.txt', (err, data) => {
  if (err) {
    console.error('Read error:', err);
    return;
  }
  console.log(data);
});
```

### Global Error Handlers

```javascript
// Uncaught exceptions (sync errors not caught)
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Origin:', origin);
  
  // Log error, notify monitoring
  logger.fatal(err);
  
  // Exit - state may be corrupted
  process.exit(1);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
  
  // Log but don't exit by default (configurable)
  logger.error(reason);
});

// Make unhandled rejections exit
process.on('unhandledRejection', err => {
  throw err;  // Will trigger uncaughtException
});
```

### Express Error Handling

```javascript
// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      message,
      code: err.code,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Async wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User', req.params.id);
  }
  res.json(user);
}));
```

---

## 24.2 Debugging

### Console Methods

```javascript
console.log('Basic log');
console.error('Error');
console.warn('Warning');
console.info('Info');

// Timing
console.time('operation');
// ... do work
console.timeEnd('operation');  // operation: 123.456ms

// Count
for (let i = 0; i < 3; i++) {
  console.count('loop');
}
// loop: 1, loop: 2, loop: 3

// Table
console.table([{ a: 1, b: 2 }, { a: 3, b: 4 }]);

// Trace
console.trace('Stack trace');

// Group
console.group('Group');
console.log('Grouped content');
console.groupEnd();

// Assert
console.assert(1 === 2, 'This will print');
```

### Node Inspector

```bash
# Start with inspector
node --inspect server.js
node --inspect-brk server.js  # Break at start

# Connect via Chrome
# Open chrome://inspect
# Or visit: http://localhost:9229/json

# Specific port
node --inspect=9230 server.js
```

### debugger Statement

```javascript
function problematicFunction(data) {
  debugger;  // Breakpoint when inspector attached
  return processData(data);
}
```

### Debug Module

```javascript
const debug = require('debug');

const dbDebug = debug('app:db');
const httpDebug = debug('app:http');

dbDebug('Connecting to database...');
httpDebug('Request received: %s %s', req.method, req.url);

// Enable via environment variable
// DEBUG=app:* node server.js
// DEBUG=app:db,app:http node server.js
```

### Memory Debugging

```javascript
// Heap snapshot
const v8 = require('v8');
v8.writeHeapSnapshot();  // Creates .heapsnapshot file

// Memory usage
console.log(process.memoryUsage());
// {
//   rss: 50331648,
//   heapTotal: 10485760,
//   heapUsed: 5242880,
//   external: 262144,
//   arrayBuffers: 131072
// }

// Force garbage collection (requires --expose-gc flag)
if (global.gc) {
  global.gc();
}
```

### CPU Profiling

```javascript
const inspector = require('inspector');
const session = new inspector.Session();
session.connect();

// Start profiling
session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    // Run code to profile
    
    session.post('Profiler.stop', (err, { profile }) => {
      fs.writeFileSync('profile.cpuprofile', JSON.stringify(profile));
    });
  });
});
```

---

## 24.3 Security

### Input Validation

```javascript
// ❌ Never trust user input
const userId = req.params.id;
db.query(`SELECT * FROM users WHERE id = ${userId}`);  // SQL injection!

// ✅ Use parameterized queries
db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ✅ Validate and sanitize
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  name: Joi.string().min(2).max(100).required(),
  age: Joi.number().integer().min(0).max(150)
});

const { error, value } = userSchema.validate(req.body);
if (error) {
  throw new ValidationError(error.message);
}
```

### Path Traversal Prevention

```javascript
const path = require('path');

// ❌ Vulnerable
app.get('/files/:name', (req, res) => {
  res.sendFile(req.params.name);  // Can access ../../../etc/passwd
});

// ✅ Safe
app.get('/files/:name', (req, res) => {
  const baseDir = path.resolve('./uploads');
  const filePath = path.resolve(baseDir, req.params.name);
  
  if (!filePath.startsWith(baseDir)) {
    return res.status(403).send('Forbidden');
  }
  
  res.sendFile(filePath);
});
```

### Command Injection Prevention

```javascript
const { execFile, spawn } = require('child_process');

// ❌ Vulnerable
exec(`convert ${userInput} output.png`);

// ✅ Use execFile or spawn with arguments
execFile('convert', [userInput, 'output.png']);
spawn('convert', [userInput, 'output.png']);
```

### Secure Headers

```javascript
const helmet = require('helmet');
app.use(helmet());

// Or manually
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

### Environment Variables

```javascript
// ❌ Never commit secrets
const password = 'supersecret123';

// ✅ Use environment variables
const password = process.env.DB_PASSWORD;

// ✅ Use .env files (not committed)
require('dotenv').config();

// ✅ Validate required env vars
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const dbPassword = requireEnv('DB_PASSWORD');
```

---

## 24.4 Performance

### Profiling and Monitoring

```javascript
// Performance hooks
const { performance, PerformanceObserver } = require('perf_hooks');

performance.mark('start');
// ... operation
performance.mark('end');
performance.measure('operation', 'start', 'end');

// Event loop monitoring
const { monitorEventLoopDelay } = require('perf_hooks');
const histogram = monitorEventLoopDelay({ resolution: 20 });
histogram.enable();

setInterval(() => {
  console.log(`Event loop delay: min=${histogram.min}, max=${histogram.max}, mean=${histogram.mean}`);
}, 5000);
```

### Caching

```javascript
// In-memory cache
const cache = new Map();

async function getCachedData(key, fetcher, ttl = 60000) {
  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiry) {
    return cached.data;
  }
  
  const data = await fetcher();
  cache.set(key, { data, expiry: Date.now() + ttl });
  return data;
}

// LRU Cache
const LRU = require('lru-cache');
const cache = new LRU({ max: 500, ttl: 1000 * 60 * 5 });
```

### Database Optimization

```javascript
// Connection pooling
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydb'
});

// Query optimization
// ❌ N+1 queries
for (const user of users) {
  const orders = await getOrders(user.id);
}

// ✅ Batch query
const orders = await getOrdersForUsers(users.map(u => u.id));
```

### Clustering

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  require('./server');
}
```

### Compression

```javascript
const compression = require('compression');
app.use(compression());
```

---

## 24.5 Testing

### Unit Testing

```javascript
const { test, describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

describe('Calculator', () => {
  let calc;
  
  beforeEach(() => {
    calc = new Calculator();
  });
  
  it('should add numbers', () => {
    assert.strictEqual(calc.add(2, 3), 5);
  });
  
  it('should throw on invalid input', () => {
    assert.throws(() => calc.add('a', 'b'), TypeError);
  });
});
```

### Integration Testing

```javascript
const request = require('supertest');
const app = require('./app');

describe('API', () => {
  it('GET /users returns users', async () => {
    const res = await request(app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200);
    
    assert(Array.isArray(res.body));
  });
  
  it('POST /users creates user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Test', email: 'test@test.com' })
      .expect(201);
    
    assert.strictEqual(res.body.name, 'Test');
  });
});
```

---

## 24.6 Logging

### Structured Logging

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: 123, ip: req.ip });
logger.error('Database error', { error: err.message, stack: err.stack });
```

### Request Logging

```javascript
const morgan = require('morgan');

// Development
app.use(morgan('dev'));

// Production
app.use(morgan('combined'));

// Custom format
app.use(morgan(':method :url :status :response-time ms - :res[content-length]'));
```

---

## 24.7 Summary

| Error Handling | Description |
|----------------|-------------|
| `try/catch` | Sync error handling |
| `.catch()` | Promise error handling |
| `async/await` + `try/catch` | Async error handling |
| `uncaughtException` | Global sync error handler |
| `unhandledRejection` | Global async error handler |

| Security Practice | Description |
|-------------------|-------------|
| Input validation | Validate all user input |
| Parameterized queries | Prevent SQL injection |
| Path validation | Prevent path traversal |
| Rate limiting | Prevent abuse |
| Secure headers | Use helmet middleware |
| Environment variables | Don't commit secrets |

| Debugging Tool | Usage |
|----------------|-------|
| `--inspect` | Enable inspector |
| `--inspect-brk` | Break at start |
| `debugger` | Breakpoint in code |
| `debug` module | Selective logging |
| Heap snapshot | Memory analysis |
| CPU profiling | Performance analysis |

| Performance | Technique |
|-------------|-----------|
| Clustering | Multi-core utilization |
| Caching | Reduce repeated work |
| Connection pooling | Efficient DB connections |
| Compression | Reduce transfer size |
| Streaming | Handle large data |

---

**End of Module 24: Advanced Concepts**

Next: **Module 25 — Ecosystem** (Frameworks, databases, and tools)
