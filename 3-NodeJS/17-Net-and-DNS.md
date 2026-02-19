# Module 17: Net and DNS

The `net` module provides low-level TCP/IPC networking, while `dns` handles DNS resolution. These modules are the foundation for higher-level networking in Node.js.

---

## 17.1 Module Import

```javascript
// CommonJS
const net = require('net');
const dns = require('dns');

// ES Modules
import net from 'net';
import dns from 'dns';
import { createServer, createConnection } from 'net';
import { lookup, resolve } from 'dns';
```

---

## 17.2 TCP Server

### Creating a Server

```javascript
const net = require('net');

const server = net.createServer(socket => {
  console.log('Client connected:', socket.remoteAddress);
  
  socket.on('data', data => {
    console.log('Received:', data.toString());
    socket.write('Echo: ' + data);
  });
  
  socket.on('end', () => {
    console.log('Client disconnected');
  });
  
  socket.on('error', err => {
    console.error('Socket error:', err.message);
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
```

### Server Events

```javascript
const server = net.createServer();

server.on('connection', socket => {
  console.log('New connection');
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`Listening on ${addr.address}:${addr.port}`);
});

server.on('error', err => {
  if (err.code === 'EADDRINUSE') {
    console.error('Port already in use');
  }
});

server.on('close', () => {
  console.log('Server closed');
});

server.listen(3000);
```

### Server Methods

```javascript
// Get server address
const addr = server.address();
// { address: '::', family: 'IPv6', port: 3000 }

// Number of connections
server.getConnections((err, count) => {
  console.log('Active connections:', count);
});

// Maximum connections
server.maxConnections = 100;

// Close server
server.close(err => {
  if (err) console.error(err);
  console.log('Server closed');
});

// Check if listening
console.log(server.listening);  // true/false
```

---

## 17.3 TCP Client

### Creating Connection

```javascript
const net = require('net');

const client = net.createConnection({ port: 3000 }, () => {
  console.log('Connected to server');
  client.write('Hello, server!');
});

client.on('data', data => {
  console.log('Received:', data.toString());
  client.end();
});

client.on('end', () => {
  console.log('Disconnected');
});

client.on('error', err => {
  console.error('Connection error:', err.message);
});
```

### Connection Options

```javascript
const client = net.createConnection({
  port: 3000,
  host: 'localhost',
  localAddress: '192.168.1.100',  // Local interface
  localPort: 12345,               // Local port
  family: 4,                      // IPv4 (4 or 6)
  timeout: 5000,                  // Connection timeout
  keepAlive: true,                // Enable keep-alive
  keepAliveInitialDelay: 1000     // Delay before first probe
});

// Alternative: host:port string
const client = net.createConnection(3000, 'localhost', () => {
  console.log('Connected');
});
```

### net.connect() Alias

```javascript
// Shorthand for createConnection
const client = net.connect(3000, 'localhost');
const client = net.connect({ port: 3000 });
```

---

## 17.4 Socket Properties and Methods

### Properties

```javascript
socket.remoteAddress;    // Client IP
socket.remotePort;       // Client port
socket.remoteFamily;     // 'IPv4' or 'IPv6'
socket.localAddress;     // Server interface IP
socket.localPort;        // Server port

socket.bytesRead;        // Total bytes received
socket.bytesWritten;     // Total bytes sent

socket.connecting;       // Still connecting?
socket.pending;          // Not yet connected?
socket.readyState;       // 'opening', 'open', 'readOnly', 'writeOnly', 'closed'
```

### Methods

```javascript
// Write data
socket.write('Hello');
socket.write(Buffer.from([0x01, 0x02, 0x03]));
socket.write('text', 'utf8', callback);

// End connection (half-close)
socket.end();
socket.end('Goodbye');

// Destroy immediately
socket.destroy();
socket.destroy(new Error('Force close'));

// Pause/resume
socket.pause();
socket.resume();

// Set encoding
socket.setEncoding('utf8');

// Timeouts
socket.setTimeout(30000);
socket.setKeepAlive(true, 60000);
socket.setNoDelay(true);  // Disable Nagle's algorithm
```

### Socket Events

```javascript
socket.on('connect', () => {});     // Connection established
socket.on('ready', () => {});       // Socket ready to use
socket.on('data', data => {});      // Data received
socket.on('drain', () => {});       // Write buffer emptied
socket.on('end', () => {});         // FIN received
socket.on('close', hadError => {}); // Fully closed
socket.on('error', err => {});      // Error occurred
socket.on('timeout', () => {});     // Inactivity timeout
socket.on('lookup', (err, address, family, host) => {});  // DNS resolved
```

---

## 17.5 IPC (Unix Sockets / Named Pipes)

### Unix Socket Server

```javascript
const net = require('net');
const fs = require('fs');

const SOCKET_PATH = '/tmp/app.sock';

// Remove stale socket
if (fs.existsSync(SOCKET_PATH)) {
  fs.unlinkSync(SOCKET_PATH);
}

const server = net.createServer(socket => {
  socket.on('data', data => {
    console.log('IPC data:', data.toString());
    socket.write('ACK');
  });
});

server.listen(SOCKET_PATH, () => {
  console.log('IPC server listening');
});

// Cleanup on exit
process.on('exit', () => {
  if (fs.existsSync(SOCKET_PATH)) {
    fs.unlinkSync(SOCKET_PATH);
  }
});
```

### Unix Socket Client

```javascript
const client = net.createConnection(SOCKET_PATH, () => {
  client.write('Hello via IPC');
});

client.on('data', data => {
  console.log('Response:', data.toString());
  client.end();
});
```

### Windows Named Pipes

```javascript
// Server
const PIPE_PATH = '\\\\.\\pipe\\myapp';

const server = net.createServer(socket => {
  // Handle connection
});

server.listen(PIPE_PATH);

// Client
const client = net.createConnection(PIPE_PATH);
```

---

## 17.6 Chat Server Example

```javascript
const net = require('net');

const clients = new Set();

const server = net.createServer(socket => {
  socket.name = `${socket.remoteAddress}:${socket.remotePort}`;
  clients.add(socket);
  
  broadcast(`${socket.name} joined\n`, socket);
  socket.write('Welcome to the chat!\n');
  
  socket.on('data', data => {
    broadcast(`${socket.name}: ${data}`, socket);
  });
  
  socket.on('end', () => {
    clients.delete(socket);
    broadcast(`${socket.name} left\n`);
  });
  
  socket.on('error', err => {
    console.error(`${socket.name} error:`, err.message);
    clients.delete(socket);
  });
});

function broadcast(message, sender) {
  for (const client of clients) {
    if (client !== sender) {
      client.write(message);
    }
  }
}

server.listen(3000, () => {
  console.log('Chat server on port 3000');
});
```

---

## 17.7 DNS Resolution

### dns.lookup() — OS Resolution

```javascript
const dns = require('dns');

// Uses OS resolver (hosts file, system DNS)
dns.lookup('google.com', (err, address, family) => {
  console.log('Address:', address);  // '142.250.80.46'
  console.log('Family:', family);    // 4 (IPv4) or 6 (IPv6)
});

// Options
dns.lookup('google.com', {
  family: 4,       // Force IPv4
  hints: dns.ADDRCONFIG,
  all: true        // Return all addresses
}, (err, addresses) => {
  console.log(addresses);
  // [{ address: '142.250.80.46', family: 4 }, ...]
});
```

### dns.resolve() — DNS Protocol

```javascript
// Direct DNS query (bypasses OS cache)
dns.resolve('google.com', (err, addresses) => {
  console.log(addresses);  // ['142.250.80.46', ...]
});

// Specific record types
dns.resolve4('google.com', (err, addresses) => {
  console.log('A records:', addresses);
});

dns.resolve6('google.com', (err, addresses) => {
  console.log('AAAA records:', addresses);
});

dns.resolveMx('gmail.com', (err, records) => {
  console.log('MX records:', records);
  // [{ exchange: 'alt1.gmail-smtp-in.l.google.com', priority: 5 }, ...]
});

dns.resolveTxt('google.com', (err, records) => {
  console.log('TXT records:', records);
});

dns.resolveNs('google.com', (err, servers) => {
  console.log('NS records:', servers);
});

dns.resolveCname('www.google.com', (err, addresses) => {
  console.log('CNAME:', addresses);
});

dns.resolveSoa('google.com', (err, record) => {
  console.log('SOA:', record);
});

dns.resolveSrv('_http._tcp.example.com', (err, records) => {
  console.log('SRV:', records);
});

dns.resolvePtr('46.80.250.142.in-addr.arpa', (err, hostnames) => {
  console.log('PTR:', hostnames);
});

dns.resolveCaa('google.com', (err, records) => {
  console.log('CAA:', records);
});
```

### dns.reverse()

```javascript
dns.reverse('8.8.8.8', (err, hostnames) => {
  console.log('Reverse DNS:', hostnames);
  // ['dns.google']
});
```

### Promise API

```javascript
const dns = require('dns/promises');
// or
const { promises: dnsPromises } = require('dns');

const address = await dns.lookup('google.com');
console.log(address);

const addresses = await dns.resolve4('google.com');
console.log(addresses);

const mx = await dns.resolveMx('gmail.com');
console.log(mx);
```

---

## 17.8 DNS Resolver Class

```javascript
const { Resolver } = require('dns');

const resolver = new Resolver();

// Use custom DNS servers
resolver.setServers(['8.8.8.8', '8.8.4.4']);

// Get current servers
console.log(resolver.getServers());

// Resolve using custom server
resolver.resolve4('google.com', (err, addresses) => {
  console.log(addresses);
});

// Cancel pending queries
resolver.cancel();
```

---

## 17.9 net.isIP()

```javascript
net.isIP('192.168.1.1');    // 4 (IPv4)
net.isIP('::1');            // 6 (IPv6)
net.isIP('invalid');        // 0 (not IP)

net.isIPv4('192.168.1.1');  // true
net.isIPv6('::1');          // true
```

---

## 17.10 Common Patterns

### Simple Request-Response Protocol

```javascript
// Server
const server = net.createServer(socket => {
  let buffer = '';
  
  socket.on('data', data => {
    buffer += data.toString();
    
    // Process complete messages (newline-delimited)
    let index;
    while ((index = buffer.indexOf('\n')) !== -1) {
      const message = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);
      
      try {
        const request = JSON.parse(message);
        const response = processRequest(request);
        socket.write(JSON.stringify(response) + '\n');
      } catch (err) {
        socket.write(JSON.stringify({ error: err.message }) + '\n');
      }
    }
  });
});

function processRequest(req) {
  switch (req.type) {
    case 'ping': return { type: 'pong' };
    case 'echo': return { type: 'echo', data: req.data };
    default: return { error: 'Unknown type' };
  }
}
```

### Connection Pool

```javascript
class ConnectionPool {
  constructor(options) {
    this.options = options;
    this.pool = [];
    this.waiting = [];
    this.maxSize = options.maxSize || 10;
  }
  
  async getConnection() {
    // Return available connection
    const available = this.pool.find(c => !c.inUse);
    if (available) {
      available.inUse = true;
      return available;
    }
    
    // Create new if under limit
    if (this.pool.length < this.maxSize) {
      const conn = await this.createConnection();
      this.pool.push(conn);
      return conn;
    }
    
    // Wait for available
    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }
  
  release(conn) {
    conn.inUse = false;
    
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      conn.inUse = true;
      resolve(conn);
    }
  }
  
  createConnection() {
    return new Promise((resolve, reject) => {
      const socket = net.createConnection(this.options, () => {
        resolve({ socket, inUse: true });
      });
      socket.on('error', reject);
    });
  }
}
```

### Health Check

```javascript
function checkPort(host, port, timeout = 3000) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    
    const timer = setTimeout(() => {
      socket.destroy();
      reject(new Error('Timeout'));
    }, timeout);
    
    socket.on('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
    
    socket.connect(port, host);
  });
}

// Usage
const isUp = await checkPort('localhost', 3000);
```

---

## 17.11 Summary

| net Method | Description |
|------------|-------------|
| `createServer()` | Create TCP/IPC server |
| `createConnection()` | Create TCP/IPC client |
| `connect()` | Alias for createConnection |
| `isIP()` | Check if valid IP (returns 4, 6, or 0) |
| `isIPv4()` / `isIPv6()` | Check specific IP version |

| Socket Events | Description |
|---------------|-------------|
| `connect` | Connection established |
| `data` | Data received |
| `drain` | Write buffer empty |
| `end` | Other side sent FIN |
| `close` | Fully closed |
| `error` | Error occurred |
| `timeout` | Inactivity timeout |

| dns Method | Description |
|------------|-------------|
| `lookup()` | OS-based resolution |
| `resolve()` | DNS protocol query |
| `resolve4()` | Query A records |
| `resolve6()` | Query AAAA records |
| `resolveMx()` | Query MX records |
| `resolveTxt()` | Query TXT records |
| `resolveNs()` | Query NS records |
| `reverse()` | Reverse DNS lookup |

---

**End of Module 17: Net and DNS**

Next: **Module 18 — Readline** (Interactive input)
