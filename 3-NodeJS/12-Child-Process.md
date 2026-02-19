# Module 12: Child Process

The `child_process` module allows you to spawn child processes, execute shell commands, and communicate with other programs. Essential for running system commands, parallel processing, and integrating with external tools.

---

## 12.1 Module Import

```javascript
// CommonJS
const { spawn, exec, execFile, fork } = require('child_process');

// ES Modules
import { spawn, exec, execFile, fork } from 'child_process';

// Promisified versions
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);
const execFileAsync = promisify(require('child_process').execFile);
```

---

## 12.2 spawn() — Stream-Based Execution

Best for long-running processes or large output.

### Basic Usage

```javascript
const { spawn } = require('child_process');

const ls = spawn('ls', ['-la', '/home']);

ls.stdout.on('data', data => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', data => {
  console.error(`stderr: ${data}`);
});

ls.on('close', code => {
  console.log(`Process exited with code ${code}`);
});

ls.on('error', err => {
  console.error('Failed to start:', err.message);
});
```

### With Options

```javascript
const child = spawn('node', ['script.js'], {
  cwd: '/path/to/directory',      // Working directory
  env: { ...process.env, NODE_ENV: 'production' },  // Environment
  shell: true,                     // Use shell
  detached: true,                  // Detach from parent
  stdio: 'inherit'                 // Inherit stdio from parent
});

// Detach child completely
child.unref();
```

### stdio Options

```javascript
// 'pipe' - create pipe (default)
// 'inherit' - inherit from parent
// 'ignore' - don't create fd
// stream - use existing stream

const child = spawn('grep', ['pattern'], {
  stdio: ['pipe', 'pipe', 'inherit']  // [stdin, stdout, stderr]
});

// Write to child stdin
child.stdin.write('data to search\n');
child.stdin.end();

// Inherit all (good for interactive commands)
spawn('vim', ['file.txt'], { stdio: 'inherit' });
```

### Pipeline with Streams

```javascript
const fs = require('fs');

// cat file | grep pattern | wc -l
const cat = spawn('cat', ['large-file.txt']);
const grep = spawn('grep', ['error']);
const wc = spawn('wc', ['-l']);

cat.stdout.pipe(grep.stdin);
grep.stdout.pipe(wc.stdin);

wc.stdout.on('data', data => {
  console.log(`Count: ${data.toString().trim()}`);
});
```

---

## 12.3 exec() — Buffer-Based Execution

Best for short commands with small output.

### Basic Usage

```javascript
const { exec } = require('child_process');

exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
```

### With Options

```javascript
exec('npm install', {
  cwd: '/project/path',
  env: { ...process.env, NODE_ENV: 'development' },
  timeout: 60000,          // Kill after 60s
  maxBuffer: 1024 * 1024,  // 1MB stdout/stderr buffer
  encoding: 'utf8',
  shell: '/bin/bash'       // Specific shell
}, (error, stdout, stderr) => {
  // Handle result
});
```

### Promise Version

```javascript
const { promisify } = require('util');
const execAsync = promisify(require('child_process').exec);

async function runCommand(cmd) {
  try {
    const { stdout, stderr } = await execAsync(cmd);
    return stdout.trim();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    throw error;
  }
}

const files = await runCommand('ls -la');
const nodeVersion = await runCommand('node --version');
```

### Using exec with util/promisify (Node.js 16+)

```javascript
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const { stdout } = await execPromise('echo "Hello"');
console.log(stdout);  // 'Hello\n'
```

---

## 12.4 execFile() — Execute File Directly

More secure than exec() - no shell involved.

```javascript
const { execFile } = require('child_process');

execFile('node', ['--version'], (error, stdout, stderr) => {
  console.log(stdout);  // 'v20.0.0\n'
});

// With options
execFile('/path/to/script.sh', ['arg1', 'arg2'], {
  cwd: '/working/dir',
  timeout: 5000
}, (error, stdout, stderr) => {
  // Handle result
});

// Promise version
const { promisify } = require('util');
const execFileAsync = promisify(require('child_process').execFile);

const { stdout } = await execFileAsync('git', ['status']);
```

---

## 12.5 fork() — Node.js Child Processes

Creates a new Node.js process with IPC channel.

### Basic Usage

```javascript
// parent.js
const { fork } = require('child_process');

const child = fork('./child.js');

// Send message to child
child.send({ type: 'task', data: [1, 2, 3, 4, 5] });

// Receive message from child
child.on('message', message => {
  console.log('Result from child:', message);
});

child.on('exit', code => {
  console.log(`Child exited with code ${code}`);
});
```

```javascript
// child.js
process.on('message', message => {
  if (message.type === 'task') {
    const result = message.data.reduce((a, b) => a + b, 0);
    process.send({ type: 'result', data: result });
  }
});
```

### Fork Options

```javascript
const child = fork('./worker.js', ['arg1', 'arg2'], {
  cwd: __dirname,
  env: { ...process.env, WORKER_ID: '1' },
  execArgv: ['--inspect'],  // Node.js flags
  silent: true              // Separate stdout/stderr
});

if (child.stdout) {
  child.stdout.on('data', data => console.log(data.toString()));
}
```

---

## 12.6 execSync, spawnSync, execFileSync

Synchronous versions (block event loop).

```javascript
const { execSync, spawnSync, execFileSync } = require('child_process');

// execSync
try {
  const output = execSync('ls -la', { encoding: 'utf8' });
  console.log(output);
} catch (error) {
  console.error('Command failed:', error.message);
}

// spawnSync
const result = spawnSync('ls', ['-la'], { encoding: 'utf8' });
console.log(result.stdout);
console.log(result.status);  // Exit code

// execFileSync
const version = execFileSync('node', ['--version'], { encoding: 'utf8' });
console.log(version.trim());
```

---

## 12.7 Handling Process Events

### Exit and Close

```javascript
const child = spawn('long-running-command');

// 'exit' fires when process exits
child.on('exit', (code, signal) => {
  if (code !== null) {
    console.log(`Exited with code: ${code}`);
  } else {
    console.log(`Killed by signal: ${signal}`);
  }
});

// 'close' fires when stdio streams close
child.on('close', (code, signal) => {
  console.log('All stdio closed');
});

// 'error' fires on spawn failure
child.on('error', err => {
  console.error('Spawn error:', err.message);
});
```

### Killing Child Processes

```javascript
const child = spawn('sleep', ['100']);

// Send SIGTERM
child.kill();
// or
child.kill('SIGTERM');

// Force kill
child.kill('SIGKILL');

// Check if killed
console.log(child.killed);  // true

// Check if running
console.log(child.exitCode);  // null if still running
```

---

## 12.8 Cross-Platform Commands

```javascript
const isWindows = process.platform === 'win32';

// Cross-platform spawn
function crossSpawn(command, args, options = {}) {
  if (isWindows) {
    return spawn('cmd', ['/c', command, ...args], options);
  }
  return spawn(command, args, options);
}

// Or use shell option
spawn('npm', ['install'], {
  shell: true,  // Works cross-platform
  stdio: 'inherit'
});
```

---

## 12.9 Common Patterns

### Run Command and Get Output

```javascript
async function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        error.stderr = stderr;
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

const version = await run('node --version');
const gitBranch = await run('git branch --show-current');
```

### Run with Timeout

```javascript
function runWithTimeout(command, timeout) {
  return new Promise((resolve, reject) => {
    const child = exec(command, { timeout }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          reject(new Error(`Command timed out after ${timeout}ms`));
        } else {
          reject(error);
        }
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

try {
  const result = await runWithTimeout('sleep 10', 5000);
} catch (err) {
  console.error(err.message);  // 'Command timed out after 5000ms'
}
```

### Worker Pool

```javascript
class WorkerPool {
  constructor(workerScript, numWorkers) {
    this.workers = [];
    this.queue = [];
    this.workerScript = workerScript;
    
    for (let i = 0; i < numWorkers; i++) {
      this.createWorker();
    }
  }
  
  createWorker() {
    const worker = fork(this.workerScript);
    worker.busy = false;
    
    worker.on('message', result => {
      worker.busy = false;
      worker.currentResolve(result);
      this.processQueue();
    });
    
    worker.on('exit', () => {
      const index = this.workers.indexOf(worker);
      if (index > -1) {
        this.workers.splice(index, 1);
        this.createWorker();  // Replace dead worker
      }
    });
    
    this.workers.push(worker);
  }
  
  processQueue() {
    const freeWorker = this.workers.find(w => !w.busy);
    if (freeWorker && this.queue.length > 0) {
      const { task, resolve } = this.queue.shift();
      freeWorker.busy = true;
      freeWorker.currentResolve = resolve;
      freeWorker.send(task);
    }
  }
  
  run(task) {
    return new Promise(resolve => {
      this.queue.push({ task, resolve });
      this.processQueue();
    });
  }
  
  terminate() {
    this.workers.forEach(w => w.kill());
  }
}

// Usage
const pool = new WorkerPool('./worker.js', 4);
const results = await Promise.all([
  pool.run({ type: 'compute', data: 1 }),
  pool.run({ type: 'compute', data: 2 }),
  pool.run({ type: 'compute', data: 3 })
]);
pool.terminate();
```

### Interactive CLI

```javascript
const child = spawn('node', [], { stdio: ['pipe', 'pipe', 'inherit'] });

// Send input
child.stdin.write('console.log("Hello");\n');
child.stdin.write('process.exit(0);\n');

// Read output
child.stdout.on('data', data => {
  console.log('Output:', data.toString());
});
```

### Run Shell Script

```javascript
function runScript(scriptPath, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn('bash', [scriptPath, ...args], {
      stdio: 'inherit'
    });
    
    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', reject);
  });
}

await runScript('./deploy.sh', ['production']);
```

---

## 12.10 Security Considerations

### Command Injection

```javascript
// ❌ Vulnerable to injection
const userInput = 'file.txt; rm -rf /';
exec(`cat ${userInput}`, callback);
// Executes: cat file.txt; rm -rf /

// ✅ Use spawn with arguments array
const userInput = 'file.txt';
spawn('cat', [userInput]);  // Arguments are escaped

// ✅ Or use execFile
execFile('cat', [userInput], callback);

// ✅ If you must use exec, validate input
function safeFilename(input) {
  return /^[a-zA-Z0-9._-]+$/.test(input);
}

if (safeFilename(userInput)) {
  exec(`cat ${userInput}`, callback);
}
```

### Environment Variables

```javascript
// ❌ Exposing sensitive env vars
spawn('malicious-script', [], {
  env: process.env  // Includes all env vars including secrets
});

// ✅ Only pass needed vars
spawn('script', [], {
  env: {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    // Explicitly list what's needed
  }
});
```

---

## 12.11 Summary

| Method | Use Case | Output | Shell |
|--------|----------|--------|-------|
| `spawn()` | Long-running, streaming | Streams | Optional |
| `exec()` | Short commands | Buffer | Yes |
| `execFile()` | Execute file directly | Buffer | No |
| `fork()` | Node.js child process | IPC | N/A |

| Event | Description |
|-------|-------------|
| `exit` | Process exited |
| `close` | All stdio streams closed |
| `error` | Spawn failed |
| `message` | IPC message (fork only) |

| Options | Description |
|---------|-------------|
| `cwd` | Working directory |
| `env` | Environment variables |
| `shell` | Use shell |
| `stdio` | Configure stdio streams |
| `timeout` | Kill after milliseconds |
| `detached` | Run independently |

---

**End of Module 12: Child Process**

Next: **Module 13 — Cluster** (Multi-process scaling)
