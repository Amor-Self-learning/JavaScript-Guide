# Module 18: Readline

The `readline` module provides an interface for reading input line-by-line from readable streams. It's essential for building interactive CLI applications.

---

## 18.1 Module Import

```javascript
// CommonJS
const readline = require('readline');
const { createInterface } = require('readline');

// ES Modules
import readline from 'readline';
import { createInterface } from 'readline';

// Promise-based (Node.js 17+)
import * as readline from 'readline/promises';
```

---

## 18.2 Creating Interface

### Basic Setup

```javascript
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('What is your name? ', answer => {
  console.log(`Hello, ${answer}!`);
  rl.close();
});
```

### Interface Options

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '> ',              // Default prompt
  terminal: true,            // Is TTY terminal
  history: [],               // Initial history
  historySize: 100,          // Max history entries
  removeHistoryDuplicates: true,
  completer: tabCompleter,   // Tab completion function
  crlfDelay: Infinity        // Treat \r\n as single line break
});
```

---

## 18.3 Basic Methods

### question()

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask single question
rl.question('Enter your name: ', name => {
  rl.question('Enter your age: ', age => {
    console.log(`${name} is ${age} years old`);
    rl.close();
  });
});
```

### prompt()

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'app> '
});

rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  
  switch (input) {
    case 'hello':
      console.log('Hello!');
      break;
    case 'exit':
      rl.close();
      return;
    default:
      console.log(`Unknown: ${input}`);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
```

### write()

```javascript
// Write to output without waiting for input
rl.write('Initial text');

// Simulate keystrokes
rl.write(null, { ctrl: true, name: 'u' });  // Clear line
rl.write(null, { ctrl: true, name: 'c' });  // Simulate Ctrl+C
```

---

## 18.4 Promise-Based API

```javascript
const readline = require('readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  const name = await rl.question('Name: ');
  const age = await rl.question('Age: ');
  
  console.log(`${name} is ${age}`);
  rl.close();
}

main();
```

### With AbortController

```javascript
const readline = require('readline/promises');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const controller = new AbortController();

// Timeout after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
  const answer = await rl.question('Quick! Enter something: ', {
    signal: controller.signal
  });
  console.log(`You entered: ${answer}`);
} catch (err) {
  if (err.name === 'AbortError') {
    console.log('Too slow!');
  }
} finally {
  rl.close();
}
```

---

## 18.5 Events

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Line entered
rl.on('line', line => {
  console.log(`Received: ${line}`);
});

// Interface closed
rl.on('close', () => {
  console.log('Interface closed');
});

// History event (when history changes)
rl.on('history', history => {
  console.log('History:', history);
});

// SIGINT (Ctrl+C)
rl.on('SIGINT', () => {
  rl.question('Really quit? (y/n) ', answer => {
    if (answer.toLowerCase() === 'y') {
      process.exit(0);
    } else {
      rl.prompt();
    }
  });
});

// SIGTSTP (Ctrl+Z)
rl.on('SIGTSTP', () => {
  console.log('Caught SIGTSTP');
});

// SIGCONT (resume from background)
rl.on('SIGCONT', () => {
  rl.prompt();
});

// Pause/resume
rl.on('pause', () => console.log('Paused'));
rl.on('resume', () => console.log('Resumed'));
```

---

## 18.6 Tab Completion

```javascript
const commands = ['help', 'quit', 'list', 'load', 'save'];

function completer(line) {
  const hits = commands.filter(c => c.startsWith(line));
  return [hits.length ? hits : commands, line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer
});

rl.prompt();

rl.on('line', line => {
  console.log(`Command: ${line}`);
  rl.prompt();
});
```

### Async Completer

```javascript
async function asyncCompleter(line) {
  // Simulate async lookup
  await new Promise(r => setTimeout(r, 100));
  
  const hits = commands.filter(c => c.startsWith(line));
  return [hits, line];
}

// Must wrap for callback style
function completer(line, callback) {
  asyncCompleter(line)
    .then(result => callback(null, result))
    .catch(err => callback(err));
}
```

---

## 18.7 Reading Files Line by Line

```javascript
const fs = require('fs');
const readline = require('readline');

async function processFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity  // Treat \r\n as single newline
  });
  
  let lineNumber = 0;
  
  for await (const line of rl) {
    lineNumber++;
    console.log(`Line ${lineNumber}: ${line}`);
  }
  
  console.log(`Total lines: ${lineNumber}`);
}

processFile('data.txt');
```

### With Line Event

```javascript
const rl = readline.createInterface({
  input: fs.createReadStream('file.txt'),
  crlfDelay: Infinity
});

rl.on('line', line => {
  console.log(line);
});

rl.on('close', () => {
  console.log('Done reading');
});
```

---

## 18.8 Cursor and Screen Control

### Cursor Movement

```javascript
const readline = require('readline');

// Move cursor up n lines
readline.moveCursor(process.stdout, 0, -1);

// Move cursor to specific column
readline.cursorTo(process.stdout, 10);

// Move cursor to absolute position
readline.cursorTo(process.stdout, 0, 5);  // x=0, y=5

// Clear from cursor to end of line
readline.clearLine(process.stdout, 0);

// Clear line direction: -1 left, 0 entire, 1 right
readline.clearLine(process.stdout, 1);  // Clear right of cursor

// Clear screen from cursor down
readline.clearScreenDown(process.stdout);
```

### Progress Bar Example

```javascript
function progressBar(current, total, width = 40) {
  const percent = current / total;
  const filled = Math.round(width * percent);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percentage = (percent * 100).toFixed(1);
  
  readline.cursorTo(process.stdout, 0);
  process.stdout.write(`Progress: [${bar}] ${percentage}%`);
  
  if (current === total) {
    process.stdout.write('\n');
  }
}

// Usage
for (let i = 0; i <= 100; i++) {
  progressBar(i, 100);
  await new Promise(r => setTimeout(r, 50));
}
```

---

## 18.9 Common Patterns

### Password Input (Hidden)

```javascript
async function readPassword(prompt = 'Password: ') {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Hide input
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    
    let password = '';
    
    process.stdin.on('data', char => {
      const c = char.toString();
      
      switch (c) {
        case '\n':
        case '\r':
        case '\u0004':  // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
          break;
        case '\u0003':  // Ctrl+C
          process.exit();
          break;
        case '\u007F':  // Backspace
          password = password.slice(0, -1);
          break;
        default:
          password += c;
          process.stdout.write('*');
      }
    });
  });
}

const password = await readPassword();
console.log(`Password length: ${password.length}`);
```

### Menu Selection

```javascript
async function selectFromMenu(options, prompt = 'Select an option:') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log(prompt);
  options.forEach((opt, i) => {
    console.log(`  ${i + 1}. ${opt}`);
  });
  
  return new Promise(resolve => {
    rl.question('Enter number: ', answer => {
      rl.close();
      const index = parseInt(answer) - 1;
      
      if (index >= 0 && index < options.length) {
        resolve({ index, value: options[index] });
      } else {
        resolve(null);
      }
    });
  });
}

const choice = await selectFromMenu(['Option A', 'Option B', 'Option C']);
console.log('Selected:', choice);
```

### Confirmation Prompt

```javascript
async function confirm(question, defaultYes = true) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  
  return new Promise(resolve => {
    rl.question(`${question} ${hint} `, answer => {
      rl.close();
      
      const response = answer.toLowerCase().trim();
      
      if (response === '') {
        resolve(defaultYes);
      } else {
        resolve(response === 'y' || response === 'yes');
      }
    });
  });
}

if (await confirm('Continue?')) {
  console.log('Continuing...');
} else {
  console.log('Cancelled');
}
```

### REPL-Style Interface

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '>>> '
});

const context = {};

console.log('JavaScript REPL (type .exit to quit)');
rl.prompt();

rl.on('line', line => {
  const input = line.trim();
  
  if (input === '.exit') {
    rl.close();
    return;
  }
  
  if (input === '.clear') {
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    rl.prompt();
    return;
  }
  
  try {
    const result = eval(input);
    console.log(result);
  } catch (err) {
    console.error(err.message);
  }
  
  rl.prompt();
});

rl.on('close', () => {
  console.log('Goodbye!');
  process.exit(0);
});
```

---

## 18.10 Async Iterator

```javascript
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Use as async iterator
async function processInput() {
  for await (const line of rl) {
    if (line === 'exit') break;
    console.log(`You typed: ${line}`);
  }
  
  rl.close();
}

processInput();
```

---

## 18.11 Summary

| Method | Description |
|--------|-------------|
| `createInterface()` | Create readline interface |
| `question(q, cb)` | Ask question, get answer |
| `prompt()` | Display prompt, wait for input |
| `write(data)` | Write to output |
| `close()` | Close interface |
| `pause()` / `resume()` | Pause/resume input |

| Cursor Functions | Description |
|------------------|-------------|
| `moveCursor(stream, dx, dy)` | Move cursor relative |
| `cursorTo(stream, x, y)` | Move cursor absolute |
| `clearLine(stream, dir)` | Clear current line |
| `clearScreenDown(stream)` | Clear screen below cursor |

| Events | Description |
|--------|-------------|
| `line` | Line entered |
| `close` | Interface closed |
| `pause` / `resume` | Input paused/resumed |
| `SIGINT` | Ctrl+C pressed |
| `history` | History updated |

---

**End of Module 18: Readline**

Next: **Module 19 — Compression (zlib)** (Gzip, Deflate, Brotli)
