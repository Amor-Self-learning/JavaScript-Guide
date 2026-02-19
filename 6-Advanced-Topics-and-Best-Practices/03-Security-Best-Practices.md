# Module 3: Security Best Practices

Web security vulnerabilities can lead to data breaches, account takeovers, and reputational damage. This module covers essential security practices for JavaScript developers.

---

## 3.1 Common Vulnerabilities

### OWASP Top 10 (Web Applications)

| Rank | Vulnerability | JavaScript Relevance |
|------|---------------|---------------------|
| 1 | Broken Access Control | Authorization checks |
| 2 | Cryptographic Failures | Token handling, HTTPS |
| 3 | Injection | XSS, SQL injection |
| 4 | Insecure Design | Architecture flaws |
| 5 | Security Misconfiguration | CORS, headers |
| 6 | Vulnerable Components | npm dependencies |
| 7 | Authentication Failures | Session, JWT |
| 8 | Data Integrity Failures | Unsigned updates |
| 9 | Logging Failures | Missing audit trails |
| 10 | SSRF | Server-side requests |

### Attack Vectors in JavaScript

```javascript
// Client-side attacks:
// - XSS (Cross-Site Scripting)
// - Prototype pollution
// - Open redirects
// - Clickjacking
// - DOM clobbering

// Server-side attacks (Node.js):
// - SQL/NoSQL injection
// - Command injection
// - Path traversal
// - SSRF
// - ReDoS
```

---

## 3.2 XSS Prevention

### Types of XSS

```javascript
// 1. Reflected XSS - Malicious input reflected immediately
// URL: https://site.com/search?q=<script>alert('XSS')</script>
const query = new URLSearchParams(location.search).get('q');
document.body.innerHTML = `Results for: ${query}`;  // ❌ Vulnerable

// 2. Stored XSS - Malicious content stored in database
// Comment: <script>document.cookie</script>
comments.forEach(c => {
  div.innerHTML = c.text;  // ❌ Vulnerable
});

// 3. DOM-based XSS - Client-side manipulation
// URL: https://site.com/#<img onerror=alert(1) src=x>
const hash = location.hash.slice(1);
document.getElementById('content').innerHTML = hash;  // ❌ Vulnerable
```

### Prevention Techniques

```javascript
// ✅ Use textContent instead of innerHTML
element.textContent = userInput;  // Safe - treats as text

// ✅ Sanitize HTML if needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ Escape HTML entities
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ✅ Use template literals safely
const template = document.createElement('template');
template.innerHTML = DOMPurify.sanitize(`<div>${userInput}</div>`);
document.body.appendChild(template.content.cloneNode(true));

// ✅ Safe DOM methods
const link = document.createElement('a');
link.href = url;
link.textContent = label;  // Not innerHTML

// ❌ Dangerous patterns to avoid
element.innerHTML = userInput;
element.outerHTML = userInput;
document.write(userInput);
eval(userInput);
new Function(userInput);
setTimeout(userInput, 0);  // String form
location.href = userInput;  // Open redirect
```

### URL Validation

```javascript
// ❌ Vulnerable to javascript: URLs
link.href = userProvidedUrl;

// ✅ Validate URL scheme
function isSafeUrl(url) {
  try {
    const parsed = new URL(url, location.origin);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

if (isSafeUrl(userUrl)) {
  link.href = userUrl;
}

// ❌ Open redirect vulnerability
location.href = params.get('redirect');

// ✅ Whitelist allowed redirects
const allowedRedirects = ['/dashboard', '/profile', '/settings'];
const redirect = params.get('redirect');
if (allowedRedirects.includes(redirect)) {
  location.href = redirect;
}
```

---

## 3.3 CSRF Protection

### What Is CSRF?

```html
<!-- Attacker's page -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">

<!-- Or hidden form -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit()</script>
```

### Prevention Techniques

```javascript
// ✅ CSRF Token
// Server generates token per session
const csrfToken = 'random-secure-token';

// Include in forms
<form>
  <input type="hidden" name="_csrf" value="${csrfToken}">
</form>

// Include in AJAX requests
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

// Server validates token
app.post('/api/transfer', (req, res) => {
  if (req.headers['x-csrf-token'] !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  // Process request
});

// ✅ SameSite Cookies
// Set-Cookie: session=abc; SameSite=Strict
// Set-Cookie: session=abc; SameSite=Lax (default in modern browsers)

// ✅ Check Origin/Referer headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://mysite.com'];
  
  if (req.method !== 'GET' && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  next();
});
```

---

## 3.4 Authentication Security

### Password Handling

```javascript
// ❌ Never store plain passwords
const user = { password: req.body.password };  // Never!

// ✅ Hash with bcrypt (Node.js)
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Registration
const hashedPassword = await bcrypt.hash(password, saltRounds);
await db.users.insert({ email, password: hashedPassword });

// Login
const user = await db.users.findOne({ email });
const valid = await bcrypt.compare(inputPassword, user.password);

// ✅ Use argon2 for new projects
const argon2 = require('argon2');
const hash = await argon2.hash(password);
const valid = await argon2.verify(hash, password);
```

### JWT Security

```javascript
// ❌ Weak JWT practices
const token = jwt.sign(payload, 'secret123');  // Weak secret
const token = jwt.sign(payload, secret, { algorithm: 'none' });  // No algorithm

// ✅ Secure JWT practices
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;  // Strong, from environment

const token = jwt.sign(
  { userId: user.id, role: user.role },
  secret,
  {
    algorithm: 'HS256',  // Or RS256 for asymmetric
    expiresIn: '15m',    // Short expiry
    issuer: 'myapp.com',
    audience: 'myapp.com'
  }
);

// Verify with options
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],  // Whitelist algorithms
  issuer: 'myapp.com',
  audience: 'myapp.com'
});

// ✅ Use refresh tokens
// Access token: Short-lived (15m), in memory
// Refresh token: Long-lived (7d), httpOnly cookie

// ❌ Don't store tokens in localStorage (XSS vulnerable)
localStorage.setItem('token', token);

// ✅ Store in httpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000  // 15 minutes
});
```

### Session Security

```javascript
// Express session configuration
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JS access
    sameSite: 'strict',
    maxAge: 3600000    // 1 hour
  }
}));

// Regenerate session on login (prevent fixation)
req.session.regenerate((err) => {
  req.session.userId = user.id;
});

// Destroy session on logout
req.session.destroy((err) => {
  res.clearCookie('sessionId');
  res.redirect('/login');
});
```

---

## 3.5 Input Validation

### Server-Side Validation

```javascript
// ❌ Trust client input
app.post('/api/user', (req, res) => {
  db.users.insert(req.body);  // Never trust client data
});

// ✅ Validate and sanitize
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
  role: Joi.string().valid('user', 'admin').default('user')
});

app.post('/api/user', async (req, res) => {
  try {
    const validated = await userSchema.validateAsync(req.body);
    await db.users.insert(validated);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### SQL Injection Prevention

```javascript
// ❌ String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
// userId = "1; DROP TABLE users;"

// ✅ Parameterized queries
const [rows] = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// ✅ ORM/Query builders
const user = await User.findOne({ where: { id: userId } });

// ✅ PostgreSQL with pg
const { rows } = await client.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### NoSQL Injection Prevention

```javascript
// ❌ Vulnerable to operator injection
const user = await db.users.findOne({
  username: req.body.username,
  password: req.body.password
});
// password = { "$gt": "" } bypasses check

// ✅ Validate type
if (typeof req.body.password !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}

// ✅ Use mongo-sanitize
const sanitize = require('mongo-sanitize');
const clean = sanitize(req.body);

// ✅ Schema validation
const Joi = require('joi');
const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});
```

### Command Injection Prevention

```javascript
// ❌ Vulnerable
const { exec } = require('child_process');
exec(`convert ${userFile} output.png`);  // userFile = "; rm -rf /"

// ✅ Use execFile with arguments array
const { execFile } = require('child_process');
execFile('convert', [userFile, 'output.png']);

// ✅ Validate/sanitize filename
const path = require('path');
const safeName = path.basename(userFile).replace(/[^a-zA-Z0-9.-]/g, '');
execFile('convert', [safeName, 'output.png']);
```

### Path Traversal Prevention

```javascript
// ❌ Vulnerable
app.get('/files/:name', (req, res) => {
  res.sendFile(`/uploads/${req.params.name}`);
});
// name = "../../../etc/passwd"

// ✅ Validate path
const path = require('path');

app.get('/files/:name', (req, res) => {
  const safePath = path.join('/uploads', path.basename(req.params.name));
  
  // Ensure it's still within uploads
  if (!safePath.startsWith('/uploads/')) {
    return res.status(400).send('Invalid path');
  }
  
  res.sendFile(safePath);
});
```

---

## 3.6 Dependency Security

### npm Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix breaking changes (major versions)
npm audit fix --force

# Generate report
npm audit --json > audit-report.json
```

### Package Lock

```javascript
// ✅ Always commit package-lock.json
// Ensures reproducible builds with exact versions

// ✅ Use npm ci in CI/CD (faster, strict)
npm ci

// ❌ Don't use: npm install in CI (can change lock file)
```

### Dependency Monitoring

```javascript
// Tools for continuous monitoring:
// - GitHub Dependabot
// - Snyk
// - npm audit (GitHub Actions)

// GitHub Actions workflow
name: Security
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
```

### Safe Package Selection

```javascript
// Before adding a package, check:
// 1. Maintenance: Last update, open issues
// 2. Popularity: Downloads, stars (not definitive but indicative)
// 3. Security: Known vulnerabilities
// 4. Dependencies: How many sub-dependencies?
// 5. License: Compatible with your project?

// Use npm info
npm info package-name

// Check on Snyk
// https://snyk.io/advisor/npm-package/package-name
```

---

## 3.7 Content Security Policy

### CSP Headers

```javascript
// Express middleware
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Needed for some frameworks
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.example.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: []
  }
}));

// HTML meta tag (limited, no report-uri)
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### CSP Nonces

```javascript
// Generate nonce per request
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
  }
}));

// Use in templates
<script nonce="${nonce}">
  // Inline script allowed
</script>
```

### Reporting

```javascript
// Report-only mode (doesn't block, just reports)
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report

// Collect reports
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);
  res.sendStatus(204);
});
```

---

## 3.8 Secure Headers

```javascript
// Use helmet for all security headers
const helmet = require('helmet');
app.use(helmet());

// Individual headers:

// X-Content-Type-Options: Prevent MIME sniffing
app.use(helmet.noSniff());
// X-Content-Type-Options: nosniff

// X-Frame-Options: Prevent clickjacking
app.use(helmet.frameguard({ action: 'deny' }));
// X-Frame-Options: DENY

// X-XSS-Protection: Legacy XSS filter (deprecated, but doesn't hurt)
app.use(helmet.xssFilter());

// Referrer-Policy: Control referrer information
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// Permissions-Policy: Control browser features
app.use(helmet.permittedCrossDomainPolicies());

// HSTS: Force HTTPS
app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
// Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 3.9 CORS Security

```javascript
// ❌ Too permissive
app.use(cors({ origin: '*' }));

// ❌ Reflecting Origin (vulnerable)
app.use(cors({ 
  origin: req.headers.origin,
  credentials: true 
}));

// ✅ Whitelist origins
const allowedOrigins = [
  'https://myapp.com',
  'https://admin.myapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 3.10 Prototype Pollution

```javascript
// ❌ Vulnerable: Recursive merge
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attack:
const payload = JSON.parse('{"__proto__": {"admin": true}}');
merge({}, payload);
console.log({}.admin);  // true - all objects affected!

// ✅ Safe merge
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    // Block prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ✅ Use Object.create(null) for dictionaries
const dict = Object.create(null);  // No prototype chain

// ✅ Freeze prototype (defense in depth)
Object.freeze(Object.prototype);
```

---

## 3.11 Summary

| Category | Key Practices |
|----------|--------------|
| **XSS** | textContent, DOMPurify, escape HTML |
| **CSRF** | CSRF tokens, SameSite cookies |
| **Auth** | bcrypt/argon2, secure JWT, httpOnly cookies |
| **Input** | Validate all input, parameterized queries |
| **Dependencies** | npm audit, lock files, monitoring |
| **Headers** | CSP, HSTS, X-Frame-Options, helmet |
| **CORS** | Whitelist origins, no credentials with * |

### Security Checklist

- [ ] All user input validated and sanitized
- [ ] CSP headers configured
- [ ] HTTPS enforced (HSTS)
- [ ] Cookies: httpOnly, secure, sameSite
- [ ] CSRF protection on state-changing requests
- [ ] Passwords hashed with bcrypt/argon2
- [ ] JWTs: short expiry, httpOnly, secure
- [ ] SQL/NoSQL injection prevented
- [ ] npm audit clean, Dependabot enabled
- [ ] Security headers via helmet
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on authentication endpoints

---

**End of Module 3: Security Best Practices**

Next: Module 4 — Deployment and DevOps
