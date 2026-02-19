# Module 14: Process

The global `process` object provides information about the current Node.js process and methods to control it. No import is required—it's available everywhere.

---

## 14.1 Process Information

### Basic Info

```javascript
// Process ID
console.log(process.pid);
// 12345

// Parent process ID
console.log(process.ppid);
// 12340

// Node.js version
console.log(process.version);
// 'v20.0.0'

// V8, libuv, OpenSSL versions
console.log(process.versions);
// { node: '20.0.0', v8: '11.3...', uv: '1.44...', ... }

// Platform
console.log(process.platform);
// 'linux', 'darwin', 'win32'

// Architecture
console.log(process.arch);
// 'x64', 'arm64'

// Executable path
console.log(process.execPath);
// '/usr/local/bin/node'

// Current working directory
console.log(process.cwd());
// '/home/user/project'

// Title (shows in ps)
console.log(process.title);
process.title = 'my-app';
```

---

## 14.2 Command Line Arguments

### process.argv

```javascript
// node script.js --port 3000 --env production

console.log(process.argv);
// [
//   '/usr/local/bin/node',
//   '/path/to/script.js',
//   '--port',
//   '3000',
//   '--env',
//   'production'
// ]

// Skip node and script path
const args = process.argv.slice(2);
// ['--port', '3000', '--env', 'production']
```

### Simple Argument Parser

```javascript
function parseArgs(args) {
  const result = { _: [] };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      
      if (next && !next.startsWith('-')) {
        result[key] = next;
        i++;
      } else {
        result[key] = true;
      }
    } else if (arg.startsWith('-')) {
      result[arg.slice(1)] = true;
    } else {
      result._.push(arg);
    }
  }
  
  return result;
}

const options = parseArgs(process.argv.slice(2));
// { _: [], port: '3000', env: 'production' }
```

### process.execArgv

```javascript
// node --inspect --max-old-space-size=4096 script.js --port 3000

console.log(process.execArgv);
// ['--inspect', '--max-old-space-size=4096']

// These are Node.js flags, not passed to script
```

---

## 14.3 Environment Variables

### Reading Environment

```javascript
// All environment variables
console.log(process.env);
// { PATH: '...', HOME: '...', NODE_ENV: 'development', ... }

// Specific variable
console.log(process.env.NODE_ENV);
// 'development'

// With default
const port = process.env.PORT || 3000;
const debug = process.env.DEBUG === 'true';
```

### Setting Environment

```javascript
// Set (affects current process only)
process.env.MY_VAR = 'value';

// Delete
delete process.env.MY_VAR;

// Note: values are always strings
process.env.PORT = 3000;
console.log(typeof process.env.PORT);  // 'string'
console.log(process.env.PORT);         // '3000'
```

---

## 14.4 Standard I/O

### stdin, stdout, stderr

```javascript
// stdout (writable stream)
process.stdout.write('Hello\n');

// stderr (writable stream)
process.stderr.write('Error message\n');

// console uses these
console.log('...');   // stdout
console.error('...');  // stderr

// stdin (readable stream)
process.stdin.setEncoding('utf8');

process.stdin.on('data', data => {
  console.log('Received:', data.trim());
});

// Read all stdin
let input = '';
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  console.log('Input:', input);
});
```

### TTY Detection

```javascript
// Is stdin a terminal?
console.log(process.stdin.isTTY);   // true or undefined

// Is stdout a terminal?
console.log(process.stdout.isTTY);  // true or undefined

// Terminal size
if (process.stdout.isTTY) {
  console.log(process.stdout.columns);  // Width
  console.log(process.stdout.rows);     // Height
}

// Detect piped input
if (!process.stdin.isTTY) {
  // Reading from pipe or file
}
```

---

## 14.5 Process Exit

### exit()

```javascript
// Exit with success
process.exit(0);

// Exit with error
process.exit(1);

// Exit codes convention:
// 0 - Success
// 1 - General error
// 2 - Misuse of command
// 126 - Command not executable
// 127 - Command not found
// 128+n - Fatal error signal n
```

### exitCode

```javascript
// Set exit code without immediate exit
process.exitCode = 1;

// Will exit with this code when event loop empties
```

### 'exit' Event

```javascript
process.on('exit', code => {
  console.log(`Exiting with code ${code}`);
  
  // Only synchronous code works here!
  // Async operations won't complete
});
```

### 'beforeExit' Event

```javascript
// Fires when event loop is empty but before exit
// Async operations ARE possible here

process.on('beforeExit', code => {
  console.log('Before exit');
  
  // Can schedule more work
  setTimeout(() => {
    console.log('Scheduled work');
  }, 100);
});

// Note: Does NOT fire on explicit exit() or uncaught exception
```

---

## 14.6 Signals

### Handling Signals

```javascript
// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Received SIGINT');
  process.exit(0);
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('Received SIGTERM');
  // Cleanup...
  process.exit(0);
});

// Handle SIGHUP (terminal closed)
process.on('SIGHUP', () => {
  console.log('Terminal closed');
});
```

### Graceful Shutdown

```javascript
async function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  
  try {
    // Close server
    await new Promise(resolve => server.close(resolve));
    
    // Close database connections
    await db.close();
    
    // Cleanup
    await cleanup();
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (err) {
    console.error('Shutdown error:', err);
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
```

### Sending Signals

```javascript
// Send signal to process
process.kill(pid, 'SIGTERM');

// Kill current process
process.kill(process.pid, 'SIGKILL');

// Note: kill() doesn't always kill - it sends a signal
process.kill(pid, 0);  // Check if process exists (no signal sent)
```

---

## 14.7 Error Handling

### Uncaught Exceptions

```javascript
process.on('uncaughtException', (err, origin) => {
  console.error('Uncaught Exception:', err);
  console.error('Origin:', origin);
  
  // Log, notify, then exit
  process.exit(1);
});

// Example trigger
setTimeout(() => {
  throw new Error('Uncaught!');
}, 100);
```

### Unhandled Promise Rejections

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
});

// Example trigger
Promise.reject(new Error('Unhandled!'));

// Make unhandled rejections throw
process.on('unhandledRejection', err => {
  throw err;  // Will trigger uncaughtException
});
```

### Warning Event

```javascript
process.on('warning', warning => {
  console.warn('Warning:', warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

// Emit warning
process.emitWarning('Something deprecated', 'DeprecationWarning');

// Emit with code
process.emitWarning('Resource leak', {
  code: 'MY_WARNING',
  detail: 'Additional info'
});
```

---

## 14.8 Memory Usage

```javascript
// Memory usage in bytes
const usage = process.memoryUsage();

console.log(usage);
// {
//   rss: 50331648,        // Resident Set Size (total allocated)
//   heapTotal: 12345678,  // V8 heap total
//   heapUsed: 8765432,    // V8 heap used
//   external: 123456,     // C++ objects bound to JS
//   arrayBuffers: 654321  // ArrayBuffers and SharedArrayBuffers
// }

// Human-readable
function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
}

console.log('Heap used:', formatBytes(usage.heapUsed));
```

### Memory Monitoring

```javascript
function monitorMemory(interval = 5000) {
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log({
      rss: formatBytes(usage.rss),
      heapUsed: formatBytes(usage.heapUsed),
      heapTotal: formatBytes(usage.heapTotal)
    });
  }, interval);
}
```

---

## 14.9 CPU Usage

```javascript
// CPU usage since process start
const startUsage = process.cpuUsage();

// Do some work
for (let i = 0; i < 1e8; i++) {}

// Get difference
const diff = process.cpuUsage(startUsage);

console.log(diff);
// { user: 123456, system: 12345 }  // microseconds

console.log(`User: ${diff.user / 1000}ms`);
console.log(`System: ${diff.system / 1000}ms`);
```

---

## 14.10 Uptime and Time

```javascript
// Process uptime in seconds
console.log(process.uptime());
// 123.456

// High-resolution time
const start = process.hrtime.bigint();
// ... work ...
const end = process.hrtime.bigint();
console.log(`Took ${end - start} nanoseconds`);

// Or with hrtime()
const [seconds, nanoseconds] = process.hrtime();
const [diffS, diffNs] = process.hrtime([seconds, nanoseconds]);
```

---

## 14.11 Working Directory

```javascript
// Get current directory
console.log(process.cwd());
// '/home/user/project'

// Change directory
process.chdir('/tmp');
console.log(process.cwd());
// '/tmp'

// Note: Affects file operations
const fs = require('fs');
fs.readFileSync('file.txt');  // Reads /tmp/file.txt
```

---

## 14.12 User Info

```javascript
// User and group IDs (Unix only)
console.log(process.getuid());  // User ID
console.log(process.getgid());  // Group ID
console.log(process.geteuid()); // Effective user ID
console.log(process.getegid()); // Effective group ID

// Get/set groups
console.log(process.getgroups());

// Set user (requires root)
process.setuid(1000);
process.setgid(1000);

// umask
const oldMask = process.umask(0o022);
console.log(`Old mask: ${oldMask.toString(8)}`);
```

---

## 14.13 Resource Limits

```javascript
// Get resource usage (Unix only)
const usage = process.resourceUsage();

console.log(usage);
// {
//   userCPUTime: 12345,
//   systemCPUTime: 1234,
//   maxRSS: 50000,
//   ...
// }
```

---

## 14.14 Next Tick

```javascript
// Execute after current operation, before I/O
process.nextTick(() => {
  console.log('Next tick');
});

// Higher priority than setImmediate
setImmediate(() => console.log('Immediate'));
process.nextTick(() => console.log('Next tick'));

// Output:
// Next tick
// Immediate

// Passing arguments
process.nextTick((a, b) => {
  console.log(a, b);
}, 'arg1', 'arg2');
```

### nextTick vs setImmediate

```javascript
// nextTick: Before I/O callbacks
// setImmediate: After I/O callbacks

fs.readFile('file.txt', () => {
  process.nextTick(() => console.log('nextTick in I/O'));
  setImmediate(() => console.log('setImmediate in I/O'));
});

// Output:
// nextTick in I/O
// setImmediate in I/O
```

---

## 14.15 Common Patterns

### Config from Environment

```javascript
const config = {
  port: parseInt(process.env.PORT) || 3000,
  host: process.env.HOST || 'localhost',
  debug: process.env.DEBUG === 'true',
  nodeEnv: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL || 'localhost/db'
};

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const apiKey = requireEnv('API_KEY');
```

### Health Check

```javascript
function getHealthStatus() {
  const mem = process.memoryUsage();
  
  return {
    status: 'ok',
    uptime: process.uptime(),
    memory: {
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      rss: mem.rss
    },
    pid: process.pid,
    version: process.version
  };
}
```

### Crash Handler

```javascript
function setupCrashHandlers() {
  process.on('uncaughtException', err => {
    console.error('Uncaught Exception:', err);
    // Log to external service
    logToService(err).finally(() => {
      process.exit(1);
    });
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    // Log and continue, or exit
  });
}
```

---

## 14.16 Summary

| Property | Description |
|----------|-------------|
| `pid` | Process ID |
| `ppid` | Parent process ID |
| `platform` | OS platform |
| `arch` | CPU architecture |
| `version` | Node.js version |
| `argv` | Command line arguments |
| `execArgv` | Node.js flags |
| `env` | Environment variables |
| `cwd()` | Current directory |

| Method | Description |
|--------|-------------|
| `exit(code)` | Exit immediately |
| `chdir(dir)` | Change directory |
| `kill(pid, signal)` | Send signal |
| `nextTick(fn)` | Schedule micro task |
| `memoryUsage()` | Get memory stats |
| `cpuUsage()` | Get CPU usage |
| `uptime()` | Process uptime |

| Event | Description |
|-------|-------------|
| `exit` | Before exit (sync only) |
| `beforeExit` | Event loop empty |
| `uncaughtException` | Uncaught error |
| `unhandledRejection` | Unhandled promise |
| `warning` | Process warning |
| `SIGINT`, `SIGTERM` | OS signals |

---

**End of Module 14: Process**

Next: **Module 15 — Timers** (setTimeout, setInterval, setImmediate)
