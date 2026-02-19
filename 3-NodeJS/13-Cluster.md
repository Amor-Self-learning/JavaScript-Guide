# Module 13: Cluster

The `cluster` module enables you to create child processes that share server ports. This allows Node.js applications to take advantage of multi-core systems for improved performance and reliability.

---

## 13.1 Module Import

```javascript
// CommonJS
const cluster = require('cluster');

// ES Modules
import cluster from 'cluster';
import { isPrimary, fork, workers } from 'cluster';
```

---

## 13.2 Cluster Basics

### Primary and Worker

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  // Primary process: fork workers
  const numCPUs = os.cpus().length;
  
  console.log(`Primary ${process.pid} is running`);
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
  
} else {
  // Worker process: run server
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Hello from worker ${process.pid}\n`);
  }).listen(8000);
  
  console.log(`Worker ${process.pid} started`);
}
```

### isMaster vs isPrimary

```javascript
// Node.js 16+: Use isPrimary (isMaster is deprecated)
if (cluster.isPrimary) {
  // Main process
}

// For backward compatibility
const isPrimary = cluster.isPrimary ?? cluster.isMaster;
```

---

## 13.3 Worker Properties

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();
  
  // Worker properties
  console.log(worker.id);            // Worker ID (1, 2, 3, ...)
  console.log(worker.process.pid);   // Process ID
  console.log(worker.isConnected()); // IPC connection status
  console.log(worker.isDead());      // Process ended?
  
  // All workers
  console.log(cluster.workers);      // { '1': Worker, '2': Worker, ... }
  
  // Get worker by ID
  const worker1 = cluster.workers[1];
}

// In worker
if (cluster.isWorker) {
  console.log(cluster.worker.id);    // This worker's ID
  console.log(process.pid);          // This process's PID
}
```

---

## 13.4 Worker Communication

### Primary to Worker

```javascript
if (cluster.isPrimary) {
  const worker = cluster.fork();
  
  // Send message to worker
  worker.send({ type: 'config', data: { port: 3000 } });
  
  // Receive from worker
  worker.on('message', message => {
    console.log('From worker:', message);
  });
}

if (cluster.isWorker) {
  // Receive from primary
  process.on('message', message => {
    console.log('From primary:', message);
    
    // Send response
    process.send({ type: 'ready', pid: process.pid });
  });
}
```

### Broadcast to All Workers

```javascript
function broadcast(message) {
  for (const id in cluster.workers) {
    cluster.workers[id].send(message);
  }
}

// Usage
broadcast({ type: 'shutdown' });
```

### Worker to Worker (via Primary)

```javascript
// Primary acts as message broker
if (cluster.isPrimary) {
  cluster.on('message', (worker, message) => {
    if (message.type === 'broadcast') {
      // Send to all other workers
      for (const id in cluster.workers) {
        if (Number(id) !== worker.id) {
          cluster.workers[id].send(message.data);
        }
      }
    }
  });
}

// Worker sends broadcast request
process.send({ type: 'broadcast', data: { event: 'update' } });
```

---

## 13.5 Graceful Shutdown

### Disconnect Workers

```javascript
if (cluster.isPrimary) {
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('Primary received SIGTERM');
    
    for (const id in cluster.workers) {
      cluster.workers[id].disconnect();
    }
  });
  
  cluster.on('disconnect', worker => {
    console.log(`Worker ${worker.id} disconnected`);
  });
  
  cluster.on('exit', worker => {
    console.log(`Worker ${worker.id} exited`);
  });
}

if (cluster.isWorker) {
  const server = http.createServer(handler).listen(8000);
  
  cluster.worker.on('disconnect', () => {
    console.log('Worker disconnecting...');
    
    // Stop accepting new connections
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force exit after timeout
    setTimeout(() => {
      console.log('Force exit');
      process.exit(1);
    }, 5000);
  });
}
```

### Kill Workers

```javascript
// Immediate kill
worker.kill('SIGTERM');

// Or
worker.process.kill('SIGKILL');
```

---

## 13.6 Auto-Restart Workers

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Restart dead workers
  cluster.on('exit', (worker, code, signal) => {
    if (!worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.id} died unexpectedly. Restarting...`);
      cluster.fork();
    }
  });
}
```

---

## 13.7 Zero-Downtime Restart

```javascript
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // Handle restart signal
  process.on('SIGUSR2', () => {
    console.log('Received SIGUSR2. Restarting workers...');
    restartWorkers();
  });
  
  function restartWorkers() {
    const workers = Object.values(cluster.workers);
    
    const restartWorker = (index) => {
      if (index >= workers.length) return;
      
      const worker = workers[index];
      console.log(`Restarting worker ${worker.id}`);
      
      // Fork new worker first
      const newWorker = cluster.fork();
      
      newWorker.on('listening', () => {
        // New worker is ready, kill old one
        worker.disconnect();
        
        worker.on('exit', () => {
          if (!worker.exitedAfterDisconnect) return;
          restartWorker(index + 1);
        });
      });
    };
    
    restartWorker(0);
  }
}
```

---

## 13.8 Scheduling Policy

```javascript
// Round-robin (default on non-Windows)
cluster.schedulingPolicy = cluster.SCHED_RR;

// OS-based (default on Windows)
cluster.schedulingPolicy = cluster.SCHED_NONE;

// Or via environment variable
// NODE_CLUSTER_SCHED_POLICY=rr
// NODE_CLUSTER_SCHED_POLICY=none
```

---

## 13.9 Cluster Events

### Primary Events

```javascript
if (cluster.isPrimary) {
  // Worker forked
  cluster.on('fork', worker => {
    console.log(`Worker ${worker.id} forked`);
  });
  
  // Worker is online (IPC ready)
  cluster.on('online', worker => {
    console.log(`Worker ${worker.id} is online`);
  });
  
  // Worker is listening
  cluster.on('listening', (worker, address) => {
    console.log(`Worker ${worker.id} listening on ${address.port}`);
  });
  
  // Worker disconnected
  cluster.on('disconnect', worker => {
    console.log(`Worker ${worker.id} disconnected`);
  });
  
  // Worker exited
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} exited with code ${code}`);
  });
  
  // Message from any worker
  cluster.on('message', (worker, message) => {
    console.log(`Message from ${worker.id}:`, message);
  });
}
```

### Worker Events

```javascript
if (cluster.isWorker) {
  cluster.worker.on('disconnect', () => {
    console.log('Disconnected from primary');
  });
  
  cluster.worker.on('error', err => {
    console.error('Worker error:', err);
  });
  
  process.on('message', message => {
    console.log('Received:', message);
  });
}
```

---

## 13.10 Cluster Settings

```javascript
// Configure before forking
cluster.setupPrimary({
  exec: 'worker.js',           // Worker file
  args: ['--worker'],          // Arguments
  silent: false,               // Output to primary
  stdio: 'inherit'             // stdio config
});

// Get settings
console.log(cluster.settings);
// { exec: 'worker.js', args: [...], ... }
```

---

## 13.11 Sticky Sessions

For WebSocket or session-based applications:

```javascript
const cluster = require('cluster');
const http = require('http');
const net = require('net');
const os = require('os');

if (cluster.isPrimary) {
  const workers = [];
  const numCPUs = os.cpus().length;
  
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    workers.push(cluster.fork());
  }
  
  // Create TCP server
  const server = net.createServer({ pauseOnConnect: true }, connection => {
    // Get client IP for sticky sessions
    const ip = connection.remoteAddress;
    const hash = hashIP(ip);
    const worker = workers[hash % workers.length];
    
    // Pass connection to worker
    worker.send('sticky-session:connection', connection);
  });
  
  server.listen(8000);
  
  function hashIP(ip) {
    let hash = 0;
    for (const char of ip) {
      hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return Math.abs(hash);
  }
  
} else {
  const server = http.createServer((req, res) => {
    res.end(`Worker ${cluster.worker.id}`);
  });
  
  // Don't listen directly, receive connections from primary
  process.on('message', (message, connection) => {
    if (message === 'sticky-session:connection') {
      server.emit('connection', connection);
      connection.resume();
    }
  });
}
```

---

## 13.12 Load Balancing Example

```javascript
const cluster = require('cluster');
const http = require('http');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  const workers = new Map();
  
  console.log(`Primary ${process.pid} starting ${numCPUs} workers`);
  
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.set(worker.id, { requests: 0 });
  }
  
  // Track requests per worker
  cluster.on('message', (worker, message) => {
    if (message.type === 'request') {
      const stats = workers.get(worker.id);
      stats.requests++;
    }
  });
  
  // Report stats every 10 seconds
  setInterval(() => {
    console.log('\nWorker Stats:');
    for (const [id, stats] of workers) {
      console.log(`  Worker ${id}: ${stats.requests} requests`);
    }
  }, 10000);
  
  // Handle worker death
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.id} died`);
    workers.delete(worker.id);
    
    // Restart
    const newWorker = cluster.fork();
    workers.set(newWorker.id, { requests: 0 });
  });
  
} else {
  http.createServer((req, res) => {
    // Notify primary of request
    process.send({ type: 'request' });
    
    // Simulate work
    let sum = 0;
    for (let i = 0; i < 1e6; i++) sum += i;
    
    res.writeHead(200);
    res.end(`Worker ${cluster.worker.id}: ${sum}\n`);
  }).listen(8000);
  
  console.log(`Worker ${cluster.worker.id} started`);
}
```

---

## 13.13 Cluster vs Worker Threads

| Feature | Cluster | Worker Threads |
|---------|---------|----------------|
| Process | Separate processes | Same process |
| Memory | Isolated | Can share (SharedArrayBuffer) |
| Use Case | HTTP servers, scaling | CPU-intensive tasks |
| Port Sharing | Yes | No |
| Overhead | Higher | Lower |
| Crash Isolation | Full | Partial |

```javascript
// Use cluster for HTTP servers
if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  http.createServer(handler).listen(8000);
}

// Use worker threads for CPU tasks
const { Worker } = require('worker_threads');
const worker = new Worker('./heavy-computation.js');
```

---

## 13.14 Summary

| Property/Method | Description |
|-----------------|-------------|
| `isPrimary` | Is this the primary process? |
| `isWorker` | Is this a worker process? |
| `fork()` | Create new worker |
| `workers` | Object of all workers |
| `worker` | Current worker (in worker) |

| Primary Events | Description |
|----------------|-------------|
| `fork` | Worker forked |
| `online` | Worker IPC ready |
| `listening` | Worker listening |
| `disconnect` | Worker disconnected |
| `exit` | Worker exited |
| `message` | Message from worker |

| Worker Methods | Description |
|----------------|-------------|
| `send(msg)` | Send to worker |
| `disconnect()` | Graceful disconnect |
| `kill()` | Kill worker |
| `isConnected()` | IPC connected? |
| `isDead()` | Process ended? |

---

**End of Module 13: Cluster**

Next: **Module 14 — Process** (Process information and control)
