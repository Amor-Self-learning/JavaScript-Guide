# 8.3 Template Literals and Tagged Templates

**Template literals** (backtick strings) revolutionized string handling in JavaScript with expression interpolation, multi-line support, and custom processing via tag functions.

---

## 8.3.1 Basic Template Literals

**Template literals** are delimited by backticks (`) instead of quotes.

```javascript
// Basic template
let str = `Hello World`;
typeof str;                 // 'string' (same type as quoted strings)

// Identical to quoted strings
`hello` === 'hello';        // true
`hello` === "hello";        // true

// Expression interpolation with ${}
let name = 'Alice';
let greeting = `Hello, ${name}!`;
greeting                    // 'Hello, Alice!'

// Expressions (not just variables)
let a = 5, b = 10;
let math = `${a} + ${b} = ${a + b}`;
math                        // '5 + 10 = 15'

// Function calls
function getGreeting() {
  return 'Howdy';
}

let msg = `${getGreeting()}, partner!`;
msg                         // 'Howdy, partner!'

// Method calls
let user = { name: 'Bob', age: 25 };
let info = `User: ${user.name.toUpperCase()}, Age: ${user.age + 1}`;
info                        // 'User: BOB, Age: 26'

// Array access
let colors = ['red', 'green', 'blue'];
let first = `First color: ${colors[0]}`;
first                       // 'First color: red'

// Object properties
let obj = { x: 10, y: 20 };
let point = `Point(${obj.x}, ${obj.y})`;
point                       // 'Point(10, 20)'

// Nested templates
let outer = `outer: ${`inner`}`;
outer                       // 'outer: inner'

// Complex nested expressions
let nested = `Result: ${1 + 2 + `sum${3 + 4}`}`;
nested                      // 'Result: 3sum7'

// Ternary expressions
let age = 25;
let status = `Age is ${age >= 18 ? 'adult' : 'minor'}`;
status                      // 'Age is adult'

// Boolean expressions
let loggedIn = true;
let welcome = `${loggedIn ? 'Welcome back!' : 'Please log in'}`;
welcome                     // 'Welcome back!'

// Logical operators
let value = 42;
let result = `Value: ${value && value * 2}`;
result                      // 'Value: 84'

// Empty expressions (allowed but unusual)
`Empty: ${''}`;             // 'Empty: '

// Expressions with side effects (avoid!)
let counter = 0;
let bad = `Count: ${++counter}`;
bad                         // 'Count: 1'
counter                     // 1 (modified as side effect)

// Multi-line strings
let multiline = `Line 1
Line 2
Line 3`;
multiline                   // 'Line 1\nLine 2\nLine 3'

// Indentation preservation
let indented = `
  This is indented
    This is more indented
  Back to first level
`;
// Includes leading newline and all spaces!

// Better: use trim()
let clean = `
  Clean indentation
  No leading newline
  No extra spaces
`.trim();
// 'Clean indentation\nNo leading newline\nNo extra spaces'

// Join lines for cleaner template
let template = [
  'Line 1',
  'Line 2',
  'Line 3'
].join('\n');
// 'Line 1\nLine 2\nLine 3'

// Escape sequences work in templates
let escaped = `Tab:\tNewline:\nBackslash:\\`;
escaped                     // 'Tab:  Newline:\nBackslash:\'

// Dollar sign escaping
let price = `Price: $100`;
price                       // 'Price: $100' (no interpolation)

let escaped$ = `Escape: \${name}`;
escaped$                    // 'Escape: ${name}' (shows literal ${})

// Backtick escaping
let backtick = `This has a \` backtick`;
backtick                    // 'This has a ` backtick'

// Performance: templates vs concatenation
// Modern engines optimize templates well
let a1 = `Hello ${name}`;         // ✓ Clear and fast
let a2 = 'Hello ' + name;         // ✓ Also fast
let a3 = 'Hello '.concat(name);   // ✓ Also fast

// Complex formatting use case
function formatUserProfile(user) {
  return `
    Name: ${user.name}
    Email: ${user.email}
    Status: ${user.active ? 'Active' : 'Inactive'}
    Created: ${new Date(user.created).toLocaleDateString()}
  `.trim();
}

// For large documents, template is cleaner
let largeTpl = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <h1>${heading}</h1>
    <p>${content}</p>
  </body>
  </html>
`.trim();
```

---

## 8.3.2 Multi-line Strings and Formatting

**Multi-line strings** are a major benefit of template literals.

```javascript
// HTML without concatenation
let html = `
  <div class="card">
    <h1>${title}</h1>
    <p>${description}</p>
  </div>
`;

// SQL queries
let query = `
  SELECT * FROM users
  WHERE age > ${minAge}
  AND status = '${status}'
  ORDER BY created_at DESC
`;

// JSON-like structure
let data = `
{
  "name": "${user.name}",
  "email": "${user.email}",
  "age": ${user.age},
  "active": ${user.active}
}
`;

// API request body
let apiBody = `
{
  "query": "${searchTerm}",
  "limit": ${pageSize},
  "offset": ${offset}
}
`;

// Markdown content
let markdown = `
# ${title}

## Overview
${description}

## Features
- ${features.join('\n- ')}

## Usage
\`\`\`javascript
${codeExample}
\`\`\`
`;

// CSS styling
let styles = `
.button {
  background: ${buttonColor};
  padding: ${padding}px;
  border-radius: ${radius}px;
  font-size: ${fontSize}px;
}
`;

// Console output formatting
let report = `
╔════════════════════════════════╗
║         Test Report            ║
╠════════════════════════════════╣
║ Passed: ${passed.toString().padStart(2)}               ║
║ Failed: ${failed.toString().padStart(2)}               ║
║ Skipped: ${skipped.toString().padStart(2)}              ║
╚════════════════════════════════╝
`;

// Handling indentation properly
function formatTemplate(str) {
  // Remove first and last empty lines
  let lines = str.split('\n').slice(1, -1);
  
  // Find minimum indentation
  let minIndent = lines
    .filter(line => line.trim())
    .reduce((min, line) => {
      let indent = line.match(/^ */)[0].length;
      return Math.min(min, indent);
    }, Infinity);
  
  // Remove minimum indentation from all lines
  return lines
    .map(line => line.slice(minIndent))
    .join('\n');
}

let properlyIndented = formatTemplate(`
  <div>
    <h1>Title</h1>
    <p>Paragraph</p>
  </div>
`);
// '<div>\n  <h1>Title</h1>\n  <p>Paragraph</p>\n</div>'

// Common pattern: array of lines
let lines = [
  'First line',
  'Second line',
  'Third line'
];

let joined = lines.join('\n');
// Often better than template for complex logic

// Multi-line with expressions
let complexHtml = `
  <ul>
    ${items.map(item => `<li>${item}</li>`).join('\n    ')}
  </ul>
`;
```

---

## 8.3.3 Tagged Templates

**Tagged templates** process templates through a function for custom behavior.

```javascript
// Basic tag function
function tag(strings, ...values) {
  console.log(strings);  // Array of string parts
  console.log(values);   // Array of expression values
  return 'result';
}

let name = 'Alice';
let result = tag`Hello ${name}!`;
// strings = ['Hello ', '!']
// values = ['Alice']
// result = 'result'

// Tag function that processes templates
function highlight(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `<mark>${values[i]}</mark>`;
    }
  }
  return result;
}

let text = 'I like';
let color = 'red';
let tagged = highlight`${text} the color ${color}`;
// '<mark>I like</mark> the color <mark>red</mark>'

// HTML escaping tag
function html(strings, ...values) {
  function escape(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += escape(values[i]);
    }
  }
  return result;
}

let userInput = '<script>alert("XSS")</script>';
let safe = html`<div>${userInput}</div>`;
// '<div>&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;</div>'

// Translation/localization tag
function translate(strings, ...values) {
  let templates = {
    'Hello {0}!': `¡Hola {0}!`,
    'Goodbye {0}': `Adiós {0}`
  };
  
  let template = strings.join('{}');
  let translated = templates[template] || template;
  
  let parts = translated.split('{}');
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    result += parts[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let spanish = translate`Hello ${'Alice'}!`;
// '¡Hola Alice!'

// CSS-in-JS helper
function css(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result.trim();
}

let buttonStyle = css`
  background: ${buttonColor};
  padding: ${padding}px;
  border-radius: ${radius}px;
`;

// SQL query builder with parameterization
function sql(strings, ...values) {
  let params = [];
  let query = '';
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;  // Parameterized
    }
  }
  
  return { query, params };
}

let { query, params } = sql`
  SELECT * FROM users
  WHERE name = ${name}
  AND age > ${age}
`;
// query = 'SELECT * FROM users\nWHERE name = $1\nAND age > $2'
// params = ['Alice', 25]

// GraphQL query builder
function gql(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let query2 = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      name
      email
    }
  }
`;

// Dedent tag (removes common leading whitespace)
function dedent(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += values[i];
    }
  }
  
  let lines = result.split('\n');
  let minIndent = lines
    .filter(line => line.trim())
    .reduce((min, line) => {
      let indent = line.match(/^ */)[0].length;
      return Math.min(min, indent);
    }, Infinity);
  
  return lines
    .map(line => line.slice(minIndent))
    .join('\n')
    .trim();
}

let code = dedent`
  function add(a, b) {
    return a + b;
  }
`;

// Terminal colors tag
function color(strings, ...values) {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    reset: '\x1b[0m'
  };
  
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += `${colors.red}${values[i]}${colors.reset}`;
    }
  }
  return result;
}

console.log(color`Error: ${'file not found'}`);
// Outputs with red colored error message

// Custom formatters
function table(strings, ...values) {
  let headers = strings[0].trim().split('\n');
  let rows = values.map((val, i) => {
    let content = Array.isArray(val) ? val.join(' | ') : val;
    return `${content}`;
  });
  return [headers, ...rows].join('\n');
}

// Multiple template expressions
let a = 'hello', b = 'world';
let both = dedent`
  First: ${a}
  Second: ${b}
`;
```

---

## 8.3.4 String.raw and Raw Strings

**String.raw** preserves escape sequences without processing them.

```javascript
// Regular string: escape sequences are processed
let regular = `Line 1\nLine 2`;
regular                    // 'Line 1\nLine 2' (newline)
regular.length;            // 13

// Raw string: escape sequences are literal
let raw = String.raw`Line 1\nLine 2`;
raw                        // 'Line 1\\nLine 2' (backslash-n)
raw.length;                // 14

// Difference visualized
console.log(regular);      // Line 1
                           // Line 2

console.log(raw);          // Line 1\nLine 2

// Backslash preservation
let path1 = `C:\Users\Documents`;   // 'C:UsersDocuments' (wrong!)
let path2 = String.raw`C:\Users\Documents`;  // 'C:\Users\Documents' (correct!)

// Windows paths
let winPath = String.raw`C:\Program Files\App\config.ini`;
winPath                    // 'C:\Program Files\App\config.ini'

// Regex patterns (raw is clearer)
let regex1 = /\d+\.\d+/;   // Already escaped
let regex2 = String.raw`\d+\.\d+`;  // String representation
String(regex2);            // '\\d+\\.\\d+'

// With template expressions
let dir = 'Users';
let raw2 = String.raw`C:\${dir}\Documents`;
raw2                       // 'C:\Users\Documents'

// In tagged templates
function raw(strings, ...values) {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings.raw[i];  // Access raw strings
    if (i < values.length) {
      result += values[i];
    }
  }
  return result;
}

let latex = raw`\frac{${numerator}}{${denominator}}`;
latex                      // Preserves LaTeX backslashes

// File paths across platforms
let linuxPath = String.raw`/home/user/documents`;
let mixedPath = String.raw`\\server\share\file`;

// LaTeX/Math strings
let math = String.raw`E = mc^2`;
// Or: `E = mc^2` (both work, raw is explicit)

// JSON strings that contain backslashes
let jsonRaw = String.raw`{"regex": "\d+", "path": "C:\Users"}`;
jsonRaw                    // Preserves backslashes for valid JSON

// URL patterns (avoid double-escaping)
let urlPattern = String.raw`^https?://[\w\-\.]+\.\w+$`;
urlPattern                 // Clean regex pattern
```

---

## 8.3.5 Practical Use Cases

**Real-world applications** of template literals.

```javascript
// HTML rendering with data
function renderCard(data) {
  return `
    <div class="card">
      <h2>${data.title}</h2>
      <p>${data.description}</p>
      <footer>${new Date(data.date).toLocaleDateString()}</footer>
    </div>
  `;
}

// List rendering
function renderList(items) {
  return `
    <ul>
      ${items.map(item => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

// Conditional rendering
function renderStatus(user) {
  return `
    <div>
      ${user.active ? `<span class="active">Active</span>` : `<span class="inactive">Inactive</span>`}
    </div>
  `;
}

// API call formatting
function buildQuery(filters) {
  return Object.entries(filters)
    .filter(([key, value]) => value !== null)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

// Error message formatting
function errorMessage(error) {
  return `
    ❌ Error: ${error.message}
    Stack: ${error.stack}
    Time: ${new Date().toISOString()}
  `.trim();
}

// Database connection string
function connectionString(config) {
  return `postgresql://${config.user}:${config.password}@${config.host}:${config.port}/${config.database}`;
}

// Email template
function emailTemplate(user, order) {
  return `
    Dear ${user.name},
    
    Thank you for your order #${order.id}
    
    Items:
    ${order.items.map(item => `- ${item.name} x${item.qty}: $${item.price}`).join('\n')}
    
    Total: $${order.total}
    
    Best regards,
    The Store
  `.trim();
}

// Logging with context
function log(level, message, context) {
  let timestamp = new Date().toISOString();
  return `[${timestamp}] ${level}: ${message} ${JSON.stringify(context)}`;
}

// Type definitions (JSDoc)
function calculate(/** @type {number} */ a, /** @type {number} */ b) {
  return `Result: ${a + b}`;
}

// Build configuration
const buildConfig = `
{
  "name": "my-app",
  "version": "${VERSION}",
  "entry": "${ENTRY_POINT}",
  "output": "${OUTPUT_DIR}",
  "mode": "${MODE}",
  "target": "${TARGET}"
}
`;

// Dynamic CSS
const themeCSS = `
:root {
  --primary: ${colors.primary};
  --secondary: ${colors.secondary};
  --font-size: ${fontSizes.base}px;
  --spacing: ${spacing.unit}px;
}
`;

// SQL with safe parameters (real implementation would use prepared statements)
function buildSQL(table, where, values) {
  let conditions = Object.entries(where)
    .map(([key, value]) => `${key} = '${value}'`)
    .join(' AND ');
  return `SELECT * FROM ${table} WHERE ${conditions}`;
}

// Command line interface
function cliOutput(data) {
  return `
    ╔════════════════════════════════╗
    ║  ${data.title.padEnd(28)} ║
    ╠════════════════════════════════╣
    ${data.rows.map(row => `║  ${row.padEnd(28)} ║`).join('\n')}
    ╚════════════════════════════════╝
  `;
}

// Performance comparison
console.time('concatenation');
let result1 = '';
for (let i = 0; i < 1000; i++) {
  result1 = result1 + `Item ${i}, `;
}
console.timeEnd('concatenation');

console.time('template');
let items = [];
for (let i = 0; i < 1000; i++) {
  items.push(`Item ${i}`);
}
let result2 = items.join(', ');
console.timeEnd('template');

// Modern practice: template literals are idiomatic
// Use for clarity, not necessarily performance
// They perform well in modern engines
```