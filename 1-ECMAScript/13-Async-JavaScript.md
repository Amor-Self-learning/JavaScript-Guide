# 13 Asynchronous JavaScript

### Why Async Matters

JavaScript runs on a **single thread** — it can only do one thing at a time. Without async patterns, any slow operation (network requests, file reads, timers) would freeze the entire program.

Async JavaScript solves this through:

- **Event Loop** — Orchestrates non-blocking execution
- **Callbacks** — Functions called when operations complete
- **Promises** — Objects representing future values
- **async/await** — Clean syntax for promise-based code

Understanding async is essential because:
- Nearly all real-world JS involves async (APIs, user events, timers)
- Async bugs are hard to debug without understanding the event loop
- Performance depends on proper async patterns (parallel vs sequential)

---

## 13.1 Event Loop

The event loop is JavaScript's mechanism for handling async operations while remaining single-threaded.

### Call Stack

The **Call Stack** is a data structure that tracks function calls and their execution context.

```javascript
// ✅ Call stack in action
function a() {
  console.log('A: start');
  b();
  console.log('A: end');
}

function b() {
  console.log('B: start');
  c();
  console.log('B: end');
}

function c() {
  console.log('C: start');
  console.log('C: end');
}

a();

// Output:
// A: start
// B: start
// C: start
// C: end
// B: end
// A: end
```

### Call Stack Overflow

```javascript
// ❌ Stack overflow - infinite recursion
function recursive() {
  recursive();  // Keeps calling itself
}

// recursive();  // RangeError: Maximum call stack size exceeded

// ✅ Proper recursion with base case
function factorial(n) {
  if (n <= 1) return 1;  // Base case
  return n * factorial(n - 1);
}

console.log(factorial(5));  // 120
```

### Stack Trace

```javascript
// ✅ Stack trace shows call sequence
function outer() {
  middle();
}

function middle() {
  inner();
}

function inner() {
  throw new Error('Something went wrong');
}

try {
  outer();
} catch (error) {
  // Stack trace shows: inner → middle → outer
  console.log(error.stack);
}
```

---

## Task Queue (Macrotasks)

### What is a Macrotask?

**Macrotasks** include:
- `setTimeout()`
- `setInterval()`
- `setImmediate()` (Node.js)
- UI rendering
- I/O operations
- `requestAnimationFrame()` (browser)

```javascript
// ✅ Macrotasks are queued for later execution
console.log('Start');

setTimeout(() => {
  console.log('Macrotask 1');
}, 0);

setTimeout(() => {
  console.log('Macrotask 2');
}, 0);

console.log('End');

// Output:
// Start
// End
// Macrotask 1
// Macrotask 2
```

### Processing Macrotasks

```javascript
// ✅ One macrotask processed at a time
setTimeout(() => {
  console.log('Task 1');
}, 0);

setTimeout(() => {
  console.log('Task 2');
}, 0);

setTimeout(() => {
  console.log('Task 3');
}, 0);

// Output: Task 1, Task 2, Task 3
// (Each task fully completes before next begins)
```

### Macrotask Order

```javascript
// ✅ Multiple macrotasks execute in FIFO order
for (let i = 1; i <= 3; i++) {
  setTimeout(() => {
    console.log(`Timeout ${i}`);
  }, 0);
}

console.log('Sync code');

// Output:
// Sync code
// Timeout 1
// Timeout 2
// Timeout 3
```

---

## Microtask Queue

### What is a Microtask?

**Microtasks** include:
- `Promise.then()`, `Promise.catch()`, `Promise.finally()`
- `queueMicrotask()`
- `MutationObserver` (browser)
- `process.nextTick()` (Node.js)

```javascript
// ✅ Microtasks execute BEFORE macrotasks
console.log('Start');

Promise.resolve()
  .then(() => {
    console.log('Microtask');
  });

setTimeout(() => {
  console.log('Macrotask');
}, 0);

console.log('End');

// Output:
// Start
// End
// Microtask
// Macrotask
```

### Microtask Priority

```javascript
// ✅ ALL microtasks run before ANY macrotask
console.log('1. Sync');

setTimeout(() => {
  console.log('2. Macrotask 1');
}, 0);

Promise.resolve()
  .then(() => {
    console.log('3. Microtask 1');
  })
  .then(() => {
    console.log('4. Microtask 2');
  });

setTimeout(() => {
  console.log('5. Macrotask 2');
}, 0);

queueMicrotask(() => {
  console.log('6. Microtask 3');
});

console.log('7. Sync');

// Output:
// 1. Sync
// 7. Sync
// 3. Microtask 1
// 4. Microtask 2
// 6. Microtask 3
// 2. Macrotask 1
// 5. Macrotask 2
```

---

## Event Loop Phases

### The Event Loop Algorithm

```
1. Execute all synchronous code (call stack)
2. When call stack is empty:
   a. Execute ALL microtasks (microtask queue)
   b. Execute ONE macrotask (task queue)
   c. Execute ALL microtasks again (after each macrotask)
   d. Optionally render UI
   e. Repeat from step 2b
```

### Phase Breakdown

```javascript
// ✅ Phase 1: Synchronous code
console.log('Phase 1: Sync');

// ✅ Queue macrotask
setTimeout(() => {
  console.log('Phase 2: Macrotask');
}, 0);

// ✅ Queue microtask
Promise.resolve()
  .then(() => {
    console.log('Phase 3: Microtask (after macrotask)');
  });

console.log('Phase 1: Sync end');

// Output:
// Phase 1: Sync
// Phase 1: Sync end
// Phase 3: Microtask (after macrotask)
// Phase 2: Macrotask
```

### Multiple Macrotasks and Microtasks

```javascript
// ✅ Complete event loop cycle
console.log('1. Start');

setTimeout(() => {
  console.log('2. Macrotask 1');
  
  Promise.resolve()
    .then(() => {
      console.log('3. Microtask created in Macrotask 1');
    });
}, 0);

Promise.resolve()
  .then(() => {
    console.log('4. Microtask 1');
    
    setTimeout(() => {
      console.log('5. Macrotask created in Microtask 1');
    }, 0);
  });

console.log('6. End');

// Output:
// 1. Start
// 6. End
// 4. Microtask 1
// 2. Macrotask 1
// 3. Microtask created in Macrotask 1
// 5. Macrotask created in Microtask 1
```

---

## setTimeout and setInterval Timing

### How setTimeout Works

```javascript
// ✅ setTimeout queues a macrotask
const start = Date.now();

setTimeout(() => {
  console.log(`Executed after ${Date.now() - start}ms`);
}, 100);

// Note: May execute slightly later due to event loop
// Actual delay depends on what's in call stack
```

### setTimeout(0) ≠ Immediate Execution

```javascript
// ✅ setTimeout(0) still queues to task queue
console.log('Start');

setTimeout(() => {
  console.log('setTimeout(0)');
}, 0);

console.log('End');

// Output:
// Start
// End
// setTimeout(0)

// setTimeout(0) is NOT immediate!
// It's queued after current script finishes
```

### Blocking Delays

```javascript
// ✅ Blocking code delays all timers
const start = Date.now();

setTimeout(() => {
  console.log(`Executed after ${Date.now() - start}ms`);
}, 100);

// Block for 200ms
let blocked = false;
while (Date.now() - start < 200) {
  blocked = true;
}

// Output: "Executed after 200ms" (not 100ms!)
// The timer must wait for blocking code to finish
```

### setInterval Behavior

```javascript
// ✅ setInterval queues repeatedly
let count = 0;
const interval = setInterval(() => {
  console.log(`Interval: ${++count}`);
  
  if (count >= 3) {
    clearInterval(interval);
  }
}, 100);

// Each callback is queued as separate macrotask
```

### Nested Timers

```javascript
// ✅ Nested timers have minimum delay
setTimeout(() => {
  console.log('Outer timeout');
  
  setTimeout(() => {
    console.log('Inner timeout');
  }, 0);
}, 0);

// Output: Outer timeout, then Inner timeout
```

---

## queueMicrotask()

### Basic Usage

```javascript
// ✅ Queue a microtask explicitly
console.log('Start');

queueMicrotask(() => {
  console.log('Microtask');
});

console.log('End');

// Output:
// Start
// End
// Microtask
```

### Comparison with Promise.then()

```javascript
// ✅ Both queue microtasks (behave the same)
console.log('Start');

Promise.resolve().then(() => {
  console.log('Promise');
});

queueMicrotask(() => {
  console.log('queueMicrotask');
});

console.log('End');

// Output:
// Start
// End
// Promise (or queueMicrotask, order may vary)
// queueMicrotask (or Promise)
```

### Nested Microtasks

```javascript
// ✅ Microtasks can queue more microtasks
console.log('1');

queueMicrotask(() => {
  console.log('2');
  
  queueMicrotask(() => {
    console.log('3');
  });
});

queueMicrotask(() => {
  console.log('4');
});

console.log('5');

// Output: 1, 5, 2, 4, 3
// All original microtasks before newly queued ones
```

### Use Cases

```javascript
// ✅ Execute code after current event but before rendering
queueMicrotask(() => {
  // Update data
  data.update();
  
  // Will execute before next render
  // Can be used for batch updates
});

// ✅ Create custom async behavior
function promisify(callback) {
  return new Promise((resolve) => {
    queueMicrotask(() => {
      callback();
      resolve();
    });
  });
}

promisify(() => {
  console.log('Executed as microtask');
});
```

---

## Execution Order

### Complete Example

```javascript
console.log('Script start');

// Macrotask
setTimeout(() => {
  console.log('setTimeout 1');
}, 0);

// Microtask via Promise
Promise.resolve()
  .then(() => {
    console.log('Promise 1');
    
    // Microtask inside microtask
    queueMicrotask(() => {
      console.log('queueMicrotask inside Promise');
    });
  })
  .then(() => {
    console.log('Promise 2');
  });

// Microtask
queueMicrotask(() => {
  console.log('queueMicrotask 1');
  
  // Macrotask inside microtask
  setTimeout(() => {
    console.log('setTimeout inside queueMicrotask');
  }, 0);
});

// Macrotask
setTimeout(() => {
  console.log('setTimeout 2');
}, 0);

console.log('Script end');

// Output order:
// Script start
// Script end
// Promise 1
// queueMicrotask 1
// Promise 2
// queueMicrotask inside Promise
// setTimeout 1
// setTimeout 2
// setTimeout inside queueMicrotask
```

### Execution Timeline

```
1. Synchronous code executes
   └─ Console: "Script start"
   └─ Console: "Script end"

2. Microtask queue empties
   └─ Promise 1 executes
   └─ queueMicrotask 1 executes
   └─ Promise 2 executes
   └─ queueMicrotask inside Promise executes

3. First macrotask executes
   └─ setTimeout 1 executes

4. Microtask queue empty, next macrotask executes
   └─ setTimeout 2 executes

5. Microtask queue empty, next macrotask executes
   └─ setTimeout inside queueMicrotask executes
```

---

## Visual Mental Models

### Model 1: Stack and Queues

```
┌─────────────────────────────┐
│      CALL STACK             │  ← Executes sync code
│  (LIFO - Last In First Out) │
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  MICROTASK QUEUE            │  ← Promises, queueMicrotask
│  (FIFO - First In First Out)│  Executes BEFORE macrotasks
└─────────────────────────────┘
           ↓
┌─────────────────────────────┐
│  MACROTASK QUEUE            │  ← setTimeout, setInterval
│  (FIFO - First In First Out)│  Executes after microtasks
└─────────────────────────────┘
```

### Model 2: Event Loop Cycle

```
START EVENT LOOP CYCLE
│
├─ 1. Execute all sync code (Call Stack)
│
├─ 2. Microtask queue empty?
│     NO → Execute ONE microtask
│     Loop back to step 2
│
├─ 3. Microtask queue empty?
│     YES → Proceed
│
├─ 4. Render UI (if needed)
│
├─ 5. Execute ONE macrotask
│
├─ 6. Loop to step 2
│
└─ Repeat until all queues empty
```

### Model 3: Priority Levels

```
Level 1 (Highest): Synchronous code
                   ↓
Level 2:           Microtasks (Promises, queueMicrotask)
                   ↓
Level 3:           Macrotasks (setTimeout, setInterval)
                   ↓
Level 4 (Lowest):  UI Rendering (requestAnimationFrame)
```

---

## Common Pitfalls

### Pitfall 1: Confusing setTimeout(0)

```javascript
// ❌ WRONG: Assuming setTimeout(0) runs immediately
console.log('1');

setTimeout(() => {
  console.log('2');  // Does NOT run after console.log('1')
}, 0);

console.log('3');

// Output: 1, 3, 2 (NOT: 1, 2, 3)
```

### Pitfall 2: Promise Timing

```javascript
// ❌ WRONG: Thinking Promise is slower than setTimeout
console.log('1');

setTimeout(() => {
  console.log('2');
}, 0);

Promise.resolve().then(() => {
  console.log('3');
});

console.log('4');

// Output: 1, 4, 3, 2
// Promise runs BEFORE setTimeout!
```

### Pitfall 3: Forgetting Microtasks

```javascript
// ❌ WRONG: Not accounting for microtasks
console.log('1');

setTimeout(() => {
  console.log('2');
}, 10);

Promise.resolve()
  .then(() => {
    console.log('3');
  })
  .then(() => {
    console.log('4');
  });

console.log('5');

// Output: 1, 5, 3, 4, 2
// Promises complete before timer!
```

### Pitfall 4: Race Conditions

```javascript
// ❌ WRONG: Race condition with event loop
let result = null;

Promise.resolve().then(() => {
  result = 'async';
});

console.log(result);  // null (not 'async'!)
// Promise hasn't executed yet

setTimeout(() => {
  console.log(result);  // 'async' (now it's ready)
}, 0);
```

---

## Node.js Event Loop Phases (Deep Dive)

The Node.js event loop is more complex than the browser's, with **6 distinct phases**:

### The Six Phases

```
   ┌───────────────────────────┐
┌─►│         timers            │  ← setTimeout, setInterval callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks deferred from previous loop
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← Internal use only
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← Retrieve new I/O events; execute I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │          check            │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← socket.on('close'), etc.
   └───────────────────────────┘
```

### Phase Details

```javascript
// ✅ Phase 1: TIMERS
// Executes callbacks scheduled by setTimeout() and setInterval()
setTimeout(() => console.log('Timer phase'), 0);

// ✅ Phase 2: PENDING CALLBACKS
// Executes I/O callbacks deferred to the next loop iteration
// (system operations like TCP errors)

// ✅ Phase 3: IDLE, PREPARE
// Internal to Node.js - you can't interact with this phase

// ✅ Phase 4: POLL
// Retrieves new I/O events and executes their callbacks
// Most I/O work happens here (file reads, network requests)
const fs = require('fs');
fs.readFile('file.txt', (err, data) => {
  console.log('Poll phase - file read complete');
});

// ✅ Phase 5: CHECK
// setImmediate() callbacks execute here
setImmediate(() => console.log('Check phase'));

// ✅ Phase 6: CLOSE CALLBACKS
// Close event callbacks (socket.on('close'))
```

### setImmediate vs setTimeout(0)

```javascript
// ⚠️ Order is NOT guaranteed in main module
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// Could output: timeout, immediate
// OR:           immediate, timeout
// (depends on system performance/timing)

// ✅ Inside I/O callback, setImmediate ALWAYS runs first
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});

// ALWAYS outputs:
// immediate
// timeout
// (because we're in poll phase, check phase comes next)
```

### process.nextTick vs setImmediate

```javascript
// ✅ process.nextTick runs BEFORE any event loop phase
// ✅ setImmediate runs in the check phase

console.log('1. Sync');

setImmediate(() => console.log('2. setImmediate'));

process.nextTick(() => console.log('3. process.nextTick'));

Promise.resolve().then(() => console.log('4. Promise'));

console.log('5. Sync end');

// Output:
// 1. Sync
// 5. Sync end
// 3. process.nextTick   ← runs before promises!
// 4. Promise
// 2. setImmediate
```

### Node.js Microtask Priority

```javascript
// Node.js has TWO microtask queues:
// 1. process.nextTick queue (higher priority)
// 2. Promise queue (lower priority)

Promise.resolve().then(() => console.log('1. Promise 1'));
process.nextTick(() => console.log('2. nextTick 1'));
Promise.resolve().then(() => console.log('3. Promise 2'));
process.nextTick(() => console.log('4. nextTick 2'));

// Output:
// 2. nextTick 1
// 4. nextTick 2
// 1. Promise 1
// 3. Promise 2

// ALL nextTicks run before ANY Promises!
```

### Danger: nextTick Starvation

```javascript
// ❌ DANGER: Recursive nextTick blocks the event loop
function recursiveNextTick() {
  process.nextTick(recursiveNextTick);
}
// recursiveNextTick();  // This would starve I/O!

// ✅ Use setImmediate for recursive async work
function recursiveImmediate() {
  setImmediate(recursiveImmediate);
}
// This allows I/O to process between iterations
```

---

## queueMicrotask vs Promise.then

### The Difference

```javascript
// Both create microtasks, but Promise.then has more overhead

// ✅ queueMicrotask: Direct microtask scheduling
queueMicrotask(() => {
  console.log('Direct microtask');
});

// ✅ Promise.then: Creates a Promise, THEN schedules microtask
Promise.resolve().then(() => {
  console.log('Promise microtask');
});
```

### When to Use Each

```javascript
// ✅ Use queueMicrotask for:
// - Pure scheduling needs (no Promise chain)
// - Performance-critical microtask scheduling
// - Custom async primitives

queueMicrotask(() => {
  // Clean up after sync code completes
  cleanup();
});

// ✅ Use Promise.then for:
// - Async operations returning values
// - Error handling with .catch()
// - Chaining async operations

Promise.resolve(data)
  .then(process)
  .then(transform)
  .catch(handleError);
```

### Performance Comparison

```javascript
// Benchmark: 100,000 microtasks

console.time('queueMicrotask');
for (let i = 0; i < 100000; i++) {
  queueMicrotask(() => {});
}
Promise.resolve().then(() => {
  console.timeEnd('queueMicrotask');  // ~15ms
});

console.time('Promise.then');
for (let i = 0; i < 100000; i++) {
  Promise.resolve().then(() => {});
}
Promise.resolve().then(() => {
  console.timeEnd('Promise.then');    // ~25ms (slower)
});
```

### Error Handling Difference

```javascript
// ❌ queueMicrotask: Errors throw globally
queueMicrotask(() => {
  throw new Error('Uncaught!');
});
// This becomes an unhandled error

// ✅ Promise: Errors are catchable
Promise.resolve()
  .then(() => {
    throw new Error('Caught!');
  })
  .catch(err => {
    console.log('Handled:', err.message);
  });
```

---

## Browser Render Pipeline

### Event Loop and Rendering

```
┌─────────────────────────────────────────────────────────┐
│  One Frame (~16.67ms at 60fps)                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. Run one macrotask (or none)                         │
│  2. Run ALL microtasks                                  │
│  3. If it's time to render:                             │
│     a. Run requestAnimationFrame callbacks              │
│     b. Run IntersectionObserver callbacks               │
│     c. Calculate styles                                 │
│     d. Layout (reflow)                                  │
│     e. Paint                                            │
│     f. Composite                                        │
│  4. If idle time remains:                               │
│     - Run requestIdleCallback tasks                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### requestAnimationFrame Timing

```javascript
// ✅ requestAnimationFrame runs BEFORE paint
console.log('1. Sync');

setTimeout(() => console.log('2. setTimeout'), 0);

requestAnimationFrame(() => {
  console.log('3. rAF - before paint');
});

Promise.resolve().then(() => console.log('4. Promise'));

// Typical output:
// 1. Sync
// 4. Promise
// 3. rAF - before paint  ← runs when browser is ready to paint
// 2. setTimeout
```

### Avoiding Layout Thrashing

```javascript
// ❌ BAD: Forced synchronous layout (layout thrashing)
const elements = document.querySelectorAll('.item');
elements.forEach(el => {
  const height = el.offsetHeight;  // FORCES layout read
  el.style.height = height * 2 + 'px';  // Triggers layout
  // Next iteration reads, forces another layout...
});

// ✅ GOOD: Batch reads, then batch writes
const elements = document.querySelectorAll('.item');

// Phase 1: Read all values
const heights = Array.from(elements).map(el => el.offsetHeight);

// Phase 2: Write all values
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2 + 'px';
});
```

### requestIdleCallback for Non-Critical Work

```javascript
// ✅ requestIdleCallback runs during browser idle time
function processBackgroundTasks(deadline) {
  // deadline.timeRemaining() tells us how much time we have
  while (deadline.timeRemaining() > 0 && tasks.length > 0) {
    const task = tasks.shift();
    task();
  }
  
  // If more tasks remain, schedule another idle callback
  if (tasks.length > 0) {
    requestIdleCallback(processBackgroundTasks);
  }
}

// Start background processing
requestIdleCallback(processBackgroundTasks);
```

### Animation Frame vs setTimeout for Animation

```javascript
// ❌ BAD: setTimeout-based animation (janky)
function animateWithTimeout(element, targetX) {
  let currentX = 0;
  function step() {
    currentX += 5;
    element.style.transform = `translateX(${currentX}px)`;
    if (currentX < targetX) {
      setTimeout(step, 16);  // Not synced to display
    }
  }
  step();
}

// ✅ GOOD: requestAnimationFrame animation (smooth)
function animateWithRAF(element, targetX) {
  let currentX = 0;
  function step() {
    currentX += 5;
    element.style.transform = `translateX(${currentX}px)`;
    if (currentX < targetX) {
      requestAnimationFrame(step);  // Synced to display refresh
    }
  }
  requestAnimationFrame(step);
}
```

---

## Summary

### Key Concepts

| Concept | Details |
|---------|---------|
| **Call Stack** | Executes synchronous code (LIFO) |
| **Microtask Queue** | Promises, queueMicrotask (high priority) |
| **Macrotask Queue** | setTimeout, setInterval (lower priority) |
| **Event Loop** | Coordinates execution between queues |
| **Priority** | Sync → Microtasks → Macrotasks → Rendering |

### Execution Rules

1. **Execute all synchronous code first**
2. **Then execute ALL microtasks**
3. **Then execute ONE macrotask**
4. **Then execute ALL newly queued microtasks**
5. **Repeat from step 3**

### Quick Reference

```javascript
// ✅ Execution order
console.log('1');                    // Sync: 1

setTimeout(() => {
  console.log('2');                  // Macrotask: 2
}, 0);

Promise.resolve().then(() => {
  console.log('3');                  // Microtask: 3
});

console.log('4');                    // Sync: 4

// Output: 1, 4, 3, 2
```

### Next Steps

- Understand callbacks and their limitations
- Learn how Promises handle the event loop
- Master async/await patterns
- Apply async patterns to real-world scenarios
## Callbacks 



## Callback Pattern

### Basic Callback Pattern

```javascript
// ✅ Standard callback for async operations
function fetchData(url, callback) {
  // Simulate async operation
  setTimeout(() => {
    const data = { id: 1, name: 'User' };
    callback(data);
  }, 100);
}

fetchData('https://api.example.com/user', (data) => {
  console.log('Data received:', data);
});

// Output: Data received: { id: 1, name: 'User' }
```

### Callback with Multiple Parameters

```javascript
// ✅ Callback receiving multiple values
function calculateAsync(a, b, callback) {
  setTimeout(() => {
    const result = a + b;
    callback(result);
  }, 100);
}

calculateAsync(5, 3, (result) => {
  console.log(`Result: ${result}`);
});

// Output: Result: 8
```

### Array Methods with Callbacks

```javascript
// ✅ Array.forEach uses callbacks
const numbers = [1, 2, 3, 4, 5];

numbers.forEach((num) => {
  console.log(num * 2);
});

// ✅ Array.map uses callbacks
const doubled = numbers.map((num) => num * 2);
console.log(doubled);  // [2, 4, 6, 8, 10]

// ✅ Array.filter uses callbacks
const evens = numbers.filter((num) => num % 2 === 0);
console.log(evens);  // [2, 4]

// ✅ Array.reduce uses callbacks
const sum = numbers.reduce((acc, num) => acc + num, 0);
console.log(sum);  // 15
```

### Event Listeners with Callbacks

```javascript
// ✅ Event listeners are callbacks
const button = document.querySelector('button');

button.addEventListener('click', () => {
  console.log('Button clicked!');
});

// ✅ Remove event listener
function handleClick() {
  console.log('Clicked!');
}

button.addEventListener('click', handleClick);
button.removeEventListener('click', handleClick);
```

---

## Error-First Callbacks

### The Error-First Convention

The **error-first callback** (Node.js convention) takes error as the first parameter:

```javascript
// ✅ Error-first callback pattern
function readFile(filename, callback) {
  // Simulated file reading
  setTimeout(() => {
    if (filename === 'nonexistent.txt') {
      // First argument: error
      callback(new Error('File not found'));
    } else {
      // First argument: null (no error)
      // Second argument: data
      callback(null, 'File contents');
    }
  }, 100);
}

readFile('document.txt', (error, data) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Data:', data);
  }
});

// Using with nonexistent file
readFile('nonexistent.txt', (error, data) => {
  if (error) {
    console.error('Error:', error.message);  // Error: File not found
  }
});
```

### Multiple Callbacks for Different States

```javascript
// ✅ Success and error callbacks
function fetchUserData(userId, onSuccess, onError) {
  setTimeout(() => {
    if (userId > 0) {
      onSuccess({ id: userId, name: 'User' });
    } else {
      onError('Invalid user ID');
    }
  }, 100);
}

fetchUserData(
  1,
  (data) => {
    console.log('Success:', data);
  },
  (error) => {
    console.error('Error:', error);
  }
);
```

### Callback with Finally

```javascript
// ✅ Success, error, and finally callbacks
function performOperation(callback) {
  let loading = true;
  
  const onSuccess = (data) => {
    console.log('Success:', data);
    callback();
  };
  
  const onError = (error) => {
    console.error('Error:', error);
    callback();
  };
  
  // Do something
  setTimeout(() => {
    if (Math.random() > 0.5) {
      onSuccess({ result: 42 });
    } else {
      onError('Operation failed');
    }
  }, 100);
}

performOperation(() => {
  console.log('Operation complete');
});
```

---

## Callback Hell

### What is Callback Hell?

**Callback hell** (or "pyramid of doom") occurs when multiple nested callbacks make code hard to read and maintain.

```javascript
// ❌ Callback hell example
function getData(callback) {
  setTimeout(() => {
    callback({ userId: 1 });
  }, 100);
}

function getUser(userId, callback) {
  setTimeout(() => {
    callback({ id: userId, name: 'John' });
  }, 100);
}

function getPosts(userId, callback) {
  setTimeout(() => {
    callback([{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]);
  }, 100);
}

function getComments(postId, callback) {
  setTimeout(() => {
    callback([{ id: 1, text: 'Comment 1' }]);
  }, 100);
}

// Callback hell!
getData((data) => {
  getUser(data.userId, (user) => {
    getPosts(user.id, (posts) => {
      getComments(posts[0].id, (comments) => {
        console.log('Finally got comments:', comments);
      });
    });
  });
});
```

### Problems with Callback Hell

1. **Difficult to read** - Code flows right, not down
2. **Hard to maintain** - Changes require deep nesting edits
3. **Error handling is complex** - Need try-catch at each level
4. **Testing is harder** - Hard to isolate functionality

### Solutions to Callback Hell

**Solution 1: Named Functions**

```javascript
// ✅ Using named functions instead of nested callbacks
function handleData(data) {
  getUser(data.userId, handleUser);
}

function handleUser(user) {
  getPosts(user.id, handlePosts);
}

function handlePosts(posts) {
  getComments(posts[0].id, handleComments);
}

function handleComments(comments) {
  console.log('Finally got comments:', comments);
}

getData(handleData);
```

**Solution 2: Promises**

```javascript
// ✅ Using Promises (chain with .then())
getData()
  .then((data) => getUser(data.userId))
  .then((user) => getPosts(user.id))
  .then((posts) => getComments(posts[0].id))
  .then((comments) => {
    console.log('Finally got comments:', comments);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
```

**Solution 3: Async/Await**

```javascript
// ✅ Using async/await (looks like sync code)
async function fetchComments() {
  try {
    const data = await getData();
    const user = await getUser(data.userId);
    const posts = await getPosts(user.id);
    const comments = await getComments(posts[0].id);
    console.log('Finally got comments:', comments);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchComments();
```

---

## Inversion of Control

### What is Inversion of Control?

**Inversion of Control (IoC)** means you lose control of when and how your callback is executed. You must trust the library/function to call it correctly.

```javascript
// ❌ Loss of control
function saveUserData(user, callback) {
  // You pass your callback but don't control:
  // - When it's called
  // - How many times it's called
  // - With what arguments
  // - In what context (this value)
  
  setTimeout(() => {
    callback(user);  // Hope they call it right!
  }, 100);
}

saveUserData({ name: 'John' }, (result) => {
  console.log('Saved:', result);
});
```

### Risks of IoC with Callbacks

```javascript
// ❌ Risk 1: Callback called multiple times
function buggyOperation(callback) {
  callback('first');
  callback('second');  // Called twice!
  callback('third');   // Called three times!
}

buggyOperation((result) => {
  console.log('Result:', result);  // Logs three times
});

// ❌ Risk 2: Callback never called
function forgotCallback(callback) {
  setTimeout(() => {
    // Oops, forgot to call callback!
    console.log('Operation complete');
  }, 100);
}

forgotCallback((result) => {
  console.log('Never executes');
});

// ❌ Risk 3: Callback called with wrong arguments
function wrongArguments(callback) {
  callback({ id: 1, wrong: 'data' });
}

wrongArguments((expectedData) => {
  // expectedData is not what we expected
  console.log(expectedData.name);  // undefined
});

// ❌ Risk 4: Callback called with wrong context
function wrongContext(callback) {
  callback.call({ wrongThis: true });
}

wrongContext(function() {
  // this might not be what we expected
  console.log(this);  // { wrongThis: true }
});
```

### IoC Solutions with Promises

```javascript
// ✅ Promises solve IoC problems
const promise = new Promise((resolve, reject) => {
  // - Can only be called once
  // - Either resolve() or reject()
  // - Cannot be called with wrong context
  
  resolve('success');
  
  // These have no effect (already settled)
  resolve('ignored');
  reject('ignored');
});

promise
  .then((result) => {
    console.log('Called exactly once:', result);
  })
  .catch((error) => {
    // Won't execute (promise resolved)
  });
```

---

## Advanced Callback Patterns

### Continuation-Passing Style (CPS)

```javascript
// ✅ Continuation-passing style
function add(a, b, continuation) {
  // Continue with the result
  continuation(a + b);
}

function multiply(a, b, continuation) {
  continuation(a * b);
}

// Chaining operations
add(2, 3, (result1) => {
  console.log('Add result:', result1);
  
  multiply(result1, 2, (result2) => {
    console.log('Multiply result:', result2);
  });
});
```

### Transforming Callbacks to Promises (Promisification)

```javascript
// ❌ Callback-based function
function readFileCallback(filename, callback) {
  setTimeout(() => {
    callback(null, `Contents of ${filename}`);
  }, 100);
}

// ✅ Convert to Promise
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFileCallback(filename, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

// Now usable with async/await
async function readFiles() {
  const data1 = await readFilePromise('file1.txt');
  const data2 = await readFilePromise('file2.txt');
  console.log(data1, data2);
}

readFiles();
```

### Callback Composition

```javascript
// ✅ Compose multiple callbacks
function compose(...fns) {
  return (value, callback) => {
    let index = 0;
    
    const next = (err, result) => {
      if (err) return callback(err);
      if (index >= fns.length) return callback(null, result);
      
      fns[index++](result, next);
    };
    
    next(null, value);
  };
}

function step1(value, next) {
  console.log('Step 1:', value);
  next(null, value * 2);
}

function step2(value, next) {
  console.log('Step 2:', value);
  next(null, value + 10);
}

function step3(value, next) {
  console.log('Step 3:', value);
  next(null, value * 3);
}

const pipeline = compose(step1, step2, step3);

pipeline(5, (error, result) => {
  console.log('Final result:', result);  // ((5 * 2) + 10) * 3 = 60
});
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use error-first callbacks
function operation(callback) {
  setTimeout(() => {
    const success = true;
    if (success) {
      callback(null, { data: 'success' });
    } else {
      callback(new Error('Failed'));
    }
  }, 100);
}

operation((error, result) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', result);
  }
});

// ✅ Document callback expectations
/**
 * Fetches user data
 * @param {number} userId - The user ID
 * @param {Function} callback - Called with (error, user)
 */
function getUser(userId, callback) {
  // Implementation
}

// ✅ Validate callbacks
function executeCallback(callback) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback must be a function');
  }
  callback();
}

// ✅ Consider using Promises for new code
function newFeature(input) {
  return new Promise((resolve, reject) => {
    if (input) {
      resolve({ data: 'success' });
    } else {
      reject(new Error('Invalid input'));
    }
  });
}
```

### ❌ DON'T

```javascript
// ❌ Don't nest callbacks unnecessarily
operation1((result1) => {
  operation2((result2) => {
    operation3((result3) => {
      console.log(result3);
    });
  });
});

// ❌ Don't forget error handling
function buggyOperation(callback) {
  callback(null, someUndefinedVariable);  // Will error
}

// ❌ Don't call callback multiple times (if you only meant to call once)
function buggy(callback) {
  callback('first');
  callback('second');  // Unexpected
}

// ❌ Don't assume callback will be called
function forgetful(callback) {
  // Forgot to call callback!
  console.log('Done');
}

// ❌ Don't use callbacks for synchronous operations
function sync(callback) {
  const result = 2 + 2;
  callback(result);  // Unnecessary
}

sync((result) => {
  console.log(result);
});
```

---

## Summary

### Callback Key Points

| Concept | Details |
|---------|---------|
| **Definition** | Function passed as argument to another function |
| **Synchronous** | Executes immediately |
| **Asynchronous** | Executes later |
| **Error-first** | Error as first parameter (Node.js convention) |
| **Hell** | Multiple nested callbacks (pyramid of doom) |
| **IoC Problem** | Loss of control over callback execution |
| **Solutions** | Promises, async/await, named functions |

### When to Use Callbacks

✅ **Still useful for:**
- Event listeners (DOM, EventEmitter)
- Array methods (map, filter, reduce, forEach)
- Simple async operations
- Legacy codebases

❌ **Avoid for:**
- Complex async flows
- Multiple sequential operations
- New code (use Promises/async-await)

### Callback vs Promises vs Async/Await

```javascript
// Callbacks
operation((error, result) => {
  if (error) throw error;
  console.log(result);
});

// Promises
operation()
  .then((result) => console.log(result))
  .catch((error) => console.error(error));

// Async/Await
try {
  const result = await operation();
  console.log(result);
} catch (error) {
  console.error(error);
}
```

### Next Steps

- Master Promises and their power
- Learn async/await syntax
- Understand async patterns and antipatterns
- Apply to real-world projects
## Promises 



## Promise States

### The Three States

A Promise is always in one of three states:

1. **Pending** - Initial state, operation hasn't completed yet
2. **Fulfilled** - Operation completed successfully (resolved)
3. **Rejected** - Operation failed with an error

```javascript
// ✅ Promise states
const pending = new Promise(() => {
  // Does nothing, stays pending
});

const fulfilled = new Promise((resolve) => {
  resolve('Success');
  // State changes to fulfilled
});

const rejected = new Promise((resolve, reject) => {
  reject(new Error('Failure'));
  // State changes to rejected
});

// Once a promise settles (fulfilled or rejected), it cannot change
const settled = new Promise((resolve) => {
  resolve('First');
  resolve('Second');  // Ignored
  resolve('Third');   // Ignored
});

settled.then((value) => {
  console.log(value);  // Only logs 'First'
});
```

### State Transitions

```
┌─────────────┐
│   PENDING   │  ← Initial state
└─────────────┘
        │
        ├─ Called resolve(value)
        │  ↓
    ┌─────────────┐
    │ FULFILLED   │  ← Terminal state (immutable)
    └─────────────┘
        │
        ├─ Called reject(error)
        │  ↓
    ┌─────────────┐
    │  REJECTED   │  ← Terminal state (immutable)
    └─────────────┘
```

---

## Creating Promises

### Basic Promise Creation

```javascript
// ✅ Create and resolve immediately
const immediate = new Promise((resolve) => {
  resolve('Value');
});

// ✅ Create and reject immediately
const error = new Promise((resolve, reject) => {
  reject(new Error('Oops'));
});

// ✅ Asynchronous operation
const delayed = new Promise((resolve) => {
  setTimeout(() => {
    resolve('Done after 1 second');
  }, 1000);
});

// ✅ Conditional resolution/rejection
const conditional = new Promise((resolve, reject) => {
  const randomValue = Math.random();
  
  if (randomValue > 0.5) {
    resolve('Success');
  } else {
    reject(new Error('Unlucky'));
  }
});
```

### Promise Executor Function

```javascript
// ✅ Executor runs immediately
console.log('1');

const promise = new Promise((resolve, reject) => {
  console.log('2');  // Runs immediately
  resolve('3');
});

console.log('4');

// Output: 1, 2, 4
// Then: 3 (async handler)

promise.then((value) => {
  console.log(value);
});
```

### Common Promise Patterns

```javascript
// ✅ Timeout pattern
function timeoutPromise(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Timeout completed');
    }, ms);
  });
}

// ✅ Rejection pattern
function rejectAfter(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, ms);
  });
}

// ✅ Immediate resolution
function resolved(value) {
  return Promise.resolve(value);
}

// ✅ Immediate rejection
function rejected(error) {
  return Promise.reject(error);
}

// Usage
timeoutPromise(100).then((msg) => console.log(msg));
```

---

## then(), catch(), finally()

### then() - Handle Fulfilled State

```javascript
// ✅ Basic then()
const promise = Promise.resolve('Success');

promise.then((value) => {
  console.log('Fulfilled:', value);
});

// ✅ then() returns a new promise
const chain = promise
  .then((value) => {
    console.log('First then:', value);
    return value.toUpperCase();
  })
  .then((uppercased) => {
    console.log('Second then:', uppercased);
  });

// ✅ then() with transformation
Promise.resolve(5)
  .then((num) => num * 2)
  .then((doubled) => doubled + 10)
  .then((result) => console.log(result));  // 20
```

### catch() - Handle Rejected State

```javascript
// ✅ Basic catch()
const failed = Promise.reject(new Error('Oops'));

failed.catch((error) => {
  console.error('Caught error:', error.message);
});

// ✅ catch() returns a new promise
Promise.reject(new Error('First error'))
  .catch((error) => {
    console.error('Handling:', error.message);
    return 'Recovered';  // Returns resolved promise
  })
  .then((result) => {
    console.log('After recovery:', result);
  });

// ✅ Multiple catch handlers
Promise.reject(new Error('Error 1'))
  .catch((error) => {
    throw new Error('Error 2');  // Convert to different error
  })
  .catch((error) => {
    console.error('Final catch:', error.message);
  });
```

### finally() - Always Execute

```javascript
// ✅ finally() runs regardless of state
let cleanup = false;

Promise.resolve('Success')
  .finally(() => {
    cleanup = true;
    console.log('Cleaning up...');
  })
  .then(() => {
    console.log('Cleanup done:', cleanup);  // true
  });

// ✅ finally() with rejection
Promise.reject(new Error('Error'))
  .finally(() => {
    console.log('This runs even with error');
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });

// ✅ Common pattern: resource management
function withResource(resourceId) {
  return acquireResource(resourceId)
    .then((resource) => {
      return doWork(resource);
    })
    .finally(() => {
      return releaseResource(resourceId);
    });
}
```

---

## Promise Chaining

### Method Chaining

```javascript
// ✅ Chain multiple operations
function step1() {
  return Promise.resolve('Step 1 complete');
}

function step2(input) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`Step 2: ${input}`);
    }, 100);
  });
}

function step3(input) {
  return Promise.resolve(`Step 3: ${input}`);
}

step1()
  .then((result) => {
    console.log(result);
    return step2(result);
  })
  .then((result) => {
    console.log(result);
    return step3(result);
  })
  .then((result) => {
    console.log(result);
  });
```

### Returning Promises from Handlers

```javascript
// ✅ Return promises to continue chain
Promise.resolve(1)
  .then((value) => {
    console.log('Value:', value);
    
    // Return another promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value * 2);
      }, 100);
    });
  })
  .then((doubled) => {
    console.log('Doubled:', doubled);
    return Promise.resolve(doubled + 10);
  })
  .then((final) => {
    console.log('Final:', final);
  });

// Output: Value: 1, Doubled: 2, Final: 12
```

### Flattening Chains

```javascript
// ✅ Promises automatically flatten nested promises
const nested = Promise.resolve(
  Promise.resolve(
    Promise.resolve('Deeply nested')
  )
);

nested.then((value) => {
  console.log(value);  // 'Deeply nested' (automatically unwrapped)
});
```

---

## Error Propagation

### Error Handling in Chains

```javascript
// ✅ Error propagates through chain
Promise.resolve(1)
  .then((value) => {
    throw new Error('Error in first then');
  })
  .then((value) => {
    // This is skipped due to error
    console.log('Never executes');
  })
  .catch((error) => {
    console.error('Caught:', error.message);
  });

// ✅ Recovery from error
Promise.reject(new Error('Initial error'))
  .catch((error) => {
    console.error('Caught:', error.message);
    return 'Recovered';  // Recovers from error
  })
  .then((value) => {
    console.log('After recovery:', value);
  });
```

### Re-throwing Errors

```javascript
// ✅ Re-throw to propagate error
Promise.reject(new Error('Original error'))
  .catch((error) => {
    console.error('Caught:', error.message);
    
    if (error.message.includes('Original')) {
      throw error;  // Re-throw
    }
    
    return 'Handled';
  })
  .catch((error) => {
    console.error('Final catch:', error.message);
  });

// ✅ Convert error type
Promise.reject(new Error('Network error'))
  .catch((error) => {
    throw new Error(`Wrapped: ${error.message}`);
  })
  .catch((error) => {
    console.error(error.message);  // Wrapped: Network error
  });
```

---

## Promise.resolve() and Promise.reject()

### Promise.resolve()

```javascript
// ✅ Resolve with value
Promise.resolve('Value')
  .then((value) => {
    console.log(value);  // Value
  });

// ✅ Resolve with another promise
const original = Promise.resolve('Original');
const wrapped = Promise.resolve(original);

wrapped.then((value) => {
  console.log(value);  // Original
});

// ✅ Resolve with thenable (object with .then())
const thenable = {
  then(onFulfill) {
    onFulfill('Thenable value');
  }
};

Promise.resolve(thenable)
  .then((value) => {
    console.log(value);  // Thenable value
  });

// ✅ Convert values to promises
const promises = [1, 2, 3]
  .map(num => Promise.resolve(num * 2));

// All are now promises
```

### Promise.reject()

```javascript
// ✅ Create rejected promise
Promise.reject(new Error('Rejected'))
  .catch((error) => {
    console.error(error.message);
  });

// ✅ Reject with any value
Promise.reject('Rejection reason')
  .catch((reason) => {
    console.error(reason);
  });
```

---

## Promise.all()

### Execute Multiple Promises in Parallel

```javascript
// ✅ Wait for all promises to resolve
const p1 = Promise.resolve(1);
const p2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then((results) => {
    console.log(results);  // [1, 2, 3]
  });

// ✅ Fails if any promise rejects
Promise.all([
  Promise.resolve('a'),
  Promise.reject(new Error('Error')),
  Promise.resolve('c')
])
  .catch((error) => {
    console.error('Error caught:', error.message);
    // Results b and c are ignored
  });
```

### Practical Promise.all() Examples

```javascript
// ✅ Fetch multiple resources
function fetchUsers() {
  return Promise.all([
    fetch('/api/user/1'),
    fetch('/api/user/2'),
    fetch('/api/user/3')
  ])
  .then((responses) => Promise.all(responses.map(r => r.json())))
  .then((users) => {
    console.log('All users:', users);
    return users;
  });
}

// ✅ Parallel image loading
const imageUrls = [
  'image1.jpg',
  'image2.jpg',
  'image3.jpg'
];

const loadImages = imageUrls.map(url => 
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(url);
    img.onerror = () => reject(new Error(`Failed: ${url}`));
    img.src = url;
  })
);

Promise.all(loadImages)
  .then(() => {
    console.log('All images loaded');
  })
  .catch((error) => {
    console.error('Image loading failed:', error);
  });
```

---

## Promise.race()

### First Promise to Settle Wins

```javascript
// ✅ Promise.race returns first settled promise
const fast = Promise.resolve('Fast');
const slow = new Promise(resolve => setTimeout(() => resolve('Slow'), 1000));

Promise.race([fast, slow])
  .then((result) => {
    console.log(result);  // Fast
  });

// ✅ First rejection also wins
Promise.race([
  Promise.reject(new Error('First error')),
  Promise.resolve('Success'),
  new Promise(resolve => setTimeout(() => resolve('Slow'), 1000))
])
  .catch((error) => {
    console.error(error.message);  // First error
  });
```

### Practical Race Examples

```javascript
// ✅ Timeout pattern
function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Timeout'));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// ✅ Usage
withTimeout(
  fetch('/api/data'),
  5000
)
  .then(response => response.json())
  .catch(error => console.error('Failed or timed out:', error));

// ✅ First successful fetch wins
const fetchFromMirrors = Promise.race([
  fetch('https://server1.com/data'),
  fetch('https://server2.com/data'),
  fetch('https://server3.com/data')
]);
```

---

## Promise.allSettled()

### Wait for All Promises Regardless of Outcome

```javascript
// ✅ Promise.allSettled waits for all, regardless of rejection
Promise.allSettled([
  Promise.resolve('a'),
  Promise.reject(new Error('b')),
  Promise.resolve('c')
])
  .then((results) => {
    console.log(results);
    // [
    //   { status: 'fulfilled', value: 'a' },
    //   { status: 'rejected', reason: Error('b') },
    //   { status: 'fulfilled', value: 'c' }
    // ]
  });

// ✅ Never rejects (always resolves)
Promise.allSettled([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2'))
])
  .then((results) => {
    // This executes (no error thrown)
    results.forEach(result => {
      if (result.status === 'rejected') {
        console.error('Failed:', result.reason);
      }
    });
  });
```

### Use Cases

```javascript
// ✅ Batch operations where partial failure is acceptable
function processItems(items) {
  const promises = items.map(item => processItem(item));
  
  return Promise.allSettled(promises)
    .then((results) => {
      const successes = results.filter(r => r.status === 'fulfilled');
      const failures = results.filter(r => r.status === 'rejected');
      
      console.log(`Processed ${successes.length}/${results.length}`);
      
      return {
        successes: successes.map(r => r.value),
        failures: failures.map(r => r.reason)
      };
    });
}

// ✅ Don't fail entire operation if one resource fails
Promise.allSettled([
  fetchUserProfile(),
  fetchUserPosts(),
  fetchUserComments()
])
  .then((results) => {
    const profile = results[0].status === 'fulfilled' ? results[0].value : null;
    const posts = results[1].status === 'fulfilled' ? results[1].value : [];
    const comments = results[2].status === 'fulfilled' ? results[2].value : [];
    
    renderPage({ profile, posts, comments });
  });
```

---

## Promise.any()

### First Fulfilled Promise Wins

```javascript
// ✅ Promise.any returns first fulfilled (ignores rejections)
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.resolve('Success')
])
  .then((result) => {
    console.log(result);  // Success
  });

// ✅ Rejects only if ALL reject
Promise.any([
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.reject(new Error('Error 3'))
])
  .catch((error) => {
    console.error(error.message);  // All promises were rejected
    console.error(error.errors);   // Array of all rejection reasons
  });
```

### Practical Examples

```javascript
// ✅ Try multiple sources, use first success
function fetchFromSources(url) {
  return Promise.any([
    fetch(`https://source1.com${url}`),
    fetch(`https://source2.com${url}`),
    fetch(`https://source3.com${url}`)
  ])
  .then(response => response.json())
  .catch(error => {
    console.error('All sources failed');
    throw error;
  });
}
```

---

## Promise.try() (Proposal)

### Wrapping Sync and Async Code

```javascript
// ✅ Promise.try() handles both sync and async errors
// (This is a Stage 3 proposal, not yet standard)

// Simulated implementation
function promiseTry(fn) {
  return Promise.resolve().then(fn);
}

// Usage
promiseTry(() => {
  throw new Error('Sync error');
})
  .catch((error) => {
    console.error('Caught:', error.message);
  });

// vs without Promise.try (must handle sync errors)
try {
  const result = (async () => {
    throw new Error('Error');
  })();
  
  result.catch(error => console.error(error));
} catch (error) {
  console.error(error);
}
```

---

## Practical Examples

### Example 1: Sequential Fetch

```javascript
// ✅ Fetch user, then posts, then comments
function loadUserData(userId) {
  return fetch(`/api/users/${userId}`)
    .then(response => response.json())
    .then((user) => {
      return fetch(`/api/users/${userId}/posts`)
        .then(response => response.json())
        .then((posts) => ({ user, posts }));
    })
    .then(({ user, posts }) => {
      return fetch(`/api/posts/${posts[0].id}/comments`)
        .then(response => response.json())
        .then((comments) => ({ user, posts, comments }));
    })
    .catch((error) => {
      console.error('Failed to load user data:', error);
    });
}

loadUserData(1).then(data => console.log(data));
```

### Example 2: Parallel Requests with Fallback

```javascript
// ✅ Try primary then fallback
function loadWithFallback() {
  return Promise.any([
    fetch('/api/primary/data'),
    new Promise(resolve => 
      setTimeout(() => resolve(fetch('/api/fallback/data')), 1000)
    )
  ])
  .then(response => response.json());
}
```

### Example 3: Retry Logic

```javascript
// ✅ Retry with exponential backoff
function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  return fn().catch((error) => {
    if (maxRetries === 0) throw error;
    
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(retryWithBackoff(fn, maxRetries - 1, delay * 2));
      }, delay);
    });
  });
}

retryWithBackoff(() => fetch('/api/data'), 3)
  .then(response => response.json())
  .catch(error => console.error('Failed after retries'));
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Promise.all for parallel operations
Promise.all([
  fetch('/api/1'),
  fetch('/api/2'),
  fetch('/api/3')
]);

// ✅ Chain promises for sequential operations
Promise.resolve(1)
  .then(x => x * 2)
  .then(x => x + 10);

// ✅ Use catch to handle errors
promise
  .then(success)
  .catch(error);

// ✅ Use finally for cleanup
promise
  .finally(() => {
    cleanup();
  });

// ✅ Return promises from handlers
.then(result => {
  return anotherPromise(result);
});
```

### ❌ DON'T

```javascript
// ❌ Don't create "promise inside promise"
new Promise((resolve) => {
  new Promise((innerResolve) => {
    innerResolve('value');
  }).then(v => resolve(v));
});

// ❌ Don't forget to return in chain
promise
  .then(result => {
    anotherPromise(result);  // Forgot to return!
  });

// ❌ Don't use .then() for sync operations
Promise.resolve()
  .then(() => {
    const x = 2 + 2;  // Should just do this directly
  });

// ❌ Don't catch and re-throw without handling
promise
  .catch(error => {
    throw error;  // Just let it propagate
  });
```

---

## Summary

### Promise Methods Overview

| Method | Purpose | Returns |
|--------|---------|---------|
| **then()** | Handle fulfilled value | New promise |
| **catch()** | Handle rejection | New promise |
| **finally()** | Always execute | New promise |
| **Promise.resolve()** | Create fulfilled promise | Promise |
| **Promise.reject()** | Create rejected promise | Promise |
| **Promise.all()** | All must succeed | Promise |
| **Promise.race()** | First to settle | Promise |
| **Promise.allSettled()** | Wait for all | Promise |
| **Promise.any()** | First fulfilled | Promise |

### When to Use Each Combinator

```javascript
// All must succeed
Promise.all([p1, p2, p3])

// First to settle wins
Promise.race([p1, p2, p3])

// All complete, partial failures OK
Promise.allSettled([p1, p2, p3])

// First success wins (skip failures)
Promise.any([p1, p2, p3])
```

### Next Steps

- Master async/await for cleaner syntax
- Learn async patterns and best practices
- Understand concurrency patterns
- Apply to real-world scenarios
## Async/Await 



## async Functions

### Declaring async Functions

```javascript
// ✅ Function declaration
async function fetchData() {
  return 'data';
}

// ✅ Function expression
const fetchData = async function() {
  return 'data';
};

// ✅ Arrow function
const fetchData = async () => {
  return 'data';
};

// ✅ Method in class
class DataFetcher {
  async getData() {
    return 'data';
  }
}

// ✅ Method in object
const fetcher = {
  async getData() {
    return 'data';
  }
};
```

### What async Does

```javascript
// ✅ async function always returns a promise
async function example() {
  return 'value';
}

const result = example();
console.log(result instanceof Promise);  // true

result.then(value => {
  console.log(value);  // 'value'
});

// ✅ Even if you return synchronously
async function immediate() {
  return 42;
}

immediate().then(value => {
  console.log(value);  // 42 (wrapped in promise)
});

// ✅ Thrown errors become rejections
async function error() {
  throw new Error('Oops');
}

error().catch(err => {
  console.error(err.message);  // Oops
});
```

### Async Function Scope

```javascript
// ✅ async function creates its own scope
async function outer() {
  const outerVar = 'outer';
  
  async function inner() {
    console.log(outerVar);  // Can access outer scope
  }
  
  await inner();
}

// ✅ Variables are isolated
async function isolatedScope() {
  const data = 'local';
}

// console.log(data);  // ReferenceError: data is not defined
```

---

## await Expression

### Basic await

```javascript
// ✅ await pauses execution until promise settles
async function example() {
  console.log('1. Start');
  
  const result = await Promise.resolve('2. Middle');
  console.log(result);
  
  console.log('3. End');
}

example();

// Output:
// 1. Start
// 2. Middle
// 3. End
```

### await with Different Promise States

```javascript
// ✅ await with fulfilled promise
async function withSuccess() {
  const value = await Promise.resolve('Success');
  console.log(value);  // Success
}

// ✅ await with rejected promise (throws error)
async function withError() {
  try {
    const value = await Promise.reject(new Error('Oops'));
  } catch (error) {
    console.error(error.message);  // Oops
  }
}

// ✅ await with delayed promise
async function withDelay() {
  console.log('Waiting...');
  const result = await new Promise(resolve => {
    setTimeout(() => resolve('Done'), 1000);
  });
  console.log(result);  // Done (after 1 second)
}
```

### await with Non-Promise Values

```javascript
// ✅ await works with non-promise values (wraps them)
async function withValue() {
  const num = await 42;
  console.log(num);  // 42
  
  const str = await 'hello';
  console.log(str);  // hello
}

// ✅ await with thenable
const thenable = {
  then(resolve) {
    resolve('Thenable value');
  }
};

async function withThenable() {
  const value = await thenable;
  console.log(value);  // Thenable value
}
```

### Multiple Awaits

```javascript
// ✅ Sequential awaits
async function sequential() {
  console.log('1');
  await delay(100);
  console.log('2');
  await delay(100);
  console.log('3');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Takes 200ms total
sequential();
```

---

## Error Handling with try/catch

### Basic try/catch

```javascript
// ✅ Catch errors from await
async function withErrorHandling() {
  try {
    const result = await Promise.reject(new Error('Failed'));
  } catch (error) {
    console.error('Caught:', error.message);
  }
}

// ✅ Multiple awaits with shared error handling
async function multipleAwaits() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchPosts(user.id);
    const comments = await fetchComments(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('Operation failed:', error.message);
    throw error;  // Re-throw if needed
  }
}
```

### Error Propagation

```javascript
// ✅ Error in await stops execution
async function errorStops() {
  console.log('1');
  
  try {
    await Promise.reject(new Error('Error'));
    console.log('2');  // Never executes
  } catch (error) {
    console.log('3');  // Executes
  }
  
  console.log('4');  // Continues after catch
}

// ✅ Specific error handling
async function specificHandling() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      console.error('Network error:', error);
    } else if (error instanceof SyntaxError) {
      console.error('Invalid JSON:', error);
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

### finally Block

```javascript
// ✅ finally runs regardless of outcome
async function withFinally() {
  const resource = await acquireResource();
  
  try {
    console.log('Using resource');
    await doWork(resource);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    console.log('Cleaning up');
    releaseResource(resource);
  }
}

// ✅ finally for logging/metrics
async function withMetrics() {
  const start = Date.now();
  
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed');
    throw error;
  } finally {
    console.log(`Operation took ${Date.now() - start}ms`);
  }
}
```

---

## Parallel Execution

### Running Awaits in Parallel

```javascript
// ❌ WRONG: Sequential (takes longer)
async function sequential() {
  const user = await fetchUser(1);     // 100ms
  const posts = await fetchPosts(1);   // 100ms
  const comments = await fetchComments(1);  // 100ms
  
  // Total: 300ms
  return { user, posts, comments };
}

// ✅ CORRECT: Parallel (faster!)
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),       // Starts immediately
    fetchPosts(1),      // Starts immediately
    fetchComments(1)    // Starts immediately
  ]);
  
  // Total: 100ms (all run in parallel)
  return { user, posts, comments };
}

// ✅ Alternative with Promise.all
async function parallelAlternative() {
  const promises = [
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ];
  
  const results = await Promise.all(promises);
  return results;
}
```

### Partial Parallelization

```javascript
// ✅ Some operations depend on others
async function partialParallel() {
  // Get user first (needed for other fetches)
  const user = await fetchUser(1);
  
  // These can run in parallel
  const [posts, settings, recommendations] = await Promise.all([
    fetchPosts(user.id),
    fetchSettings(user.id),
    fetchRecommendations(user.id)
  ]);
  
  return { user, posts, settings, recommendations };
}
```

---

## Sequential vs Concurrent Patterns

### Sequential Pattern (Dependent Operations)

```javascript
// ✅ Each operation depends on the previous
async function sequential() {
  const user = await getUser(userId);
  
  const userPosts = await getPosts(user.id);
  
  const firstPostComments = await getComments(userPosts[0].id);
  
  return { user, posts: userPosts, comments: firstPostComments };
}

// Don't do this in parallel:
// ❌ const [user, posts] = await Promise.all([getUser(userId), getPosts(userId)]);
// Because getPosts needs user.id which we get from getUser
```

### Concurrent Pattern (Independent Operations)

```javascript
// ✅ Operations don't depend on each other
async function concurrent() {
  // All can start immediately
  const [weather, news, stocks] = await Promise.all([
    fetchWeather(),
    fetchNews(),
    fetchStocks()
  ]);
  
  return { weather, news, stocks };
}
```

### Mixed Pattern (Some Dependent, Some Independent)

```javascript
// ✅ Smart combination
async function mixed() {
  // Step 1: Get independent data in parallel
  const [weather, news] = await Promise.all([
    fetchWeather(),
    fetchNews()
  ]);
  
  // Step 2: Get data that depends on Step 1
  const [forecast, headlines] = await Promise.all([
    getForecast(weather.location),
    getHeadlines(news.category)
  ]);
  
  return { weather, news, forecast, headlines };
}
```

---

## Top-Level await

### Using await Outside async Function

```javascript
// ✅ Top-level await (ES2022, modules only)
// In a .mjs file or type: module in package.json

const response = await fetch('/api/data');
const data = await response.json();

console.log('Data loaded:', data);

// Must be in module context, not global scope
```

### Use Cases

```javascript
// ✅ Initialize module
const config = await loadConfig();
const db = await connectDatabase(config);

export { db, config };

// ✅ Conditional imports
const API_URL = await getApiUrl();

const client = API_URL.includes('localhost')
  ? await import('./mockClient.js')
  : await import('./realClient.js');

export { client };

// ✅ Running code at module load
await migrateDatabase();
console.log('Database ready');
```

### Browser Support

```javascript
// ✅ Top-level await in module script
// <script type="module">
//   const data = await fetch('/api/data').then(r => r.json());
//   console.log(data);
// </script>

// Note: Only in modules (type="module")
// NOT in regular scripts or IIFE
```

---

## Async Function Return Values

### Return Types

```javascript
// ✅ Explicit return
async function withReturn() {
  return { data: 'value' };
}

withReturn().then(result => {
  console.log(result);  // { data: 'value' }
});

// ✅ No explicit return (returns undefined)
async function noReturn() {
  console.log('doing work');
}

noReturn().then(result => {
  console.log(result);  // undefined
});

// ✅ Conditional returns
async function conditional(success) {
  if (success) {
    return 'Success value';
  } else {
    throw new Error('Failed');
  }
}

// ✅ Returning another promise
async function chainedPromises() {
  return await new Promise(resolve => {
    setTimeout(() => resolve('value'), 100);
  });
}
```

### Type Inference

```javascript
// ✅ Return type is Promise<T>
async function returns(): Promise<string> {
  return 'value';
}

// ✅ Can't return Promise<Promise<T>>
// (gets flattened automatically)
async function flat() {
  return Promise.resolve(Promise.resolve('value'));
  // Returns Promise<string>, not Promise<Promise<string>>
}
```

---

## Common Patterns

### Pattern 1: Retry with Exponential Backoff

```javascript
// ✅ Automatic retry
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  delay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      const waitTime = delay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      console.log(`Retry ${i + 1}...`);
    }
  }
}

// Usage
const data = await retryWithBackoff(
  () => fetch('/api/data').then(r => r.json()),
  3,
  1000
);
```

### Pattern 2: Timeout

```javascript
// ✅ Promise with timeout
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Operation timed out'));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// Usage
try {
  const result = await withTimeout(
    fetch('/api/slow-endpoint'),
    5000
  );
} catch (error) {
  console.error(error.message);  // Operation timed out
}
```

### Pattern 3: Batch Processing

```javascript
// ✅ Process items in batches
async function processBatch(items, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processItem(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}

// Usage
const allResults = await processBatch(hugeArray, 10);
```

### Pattern 4: Sequential Operations

```javascript
// ✅ Array of async operations
async function sequentialOperations(items) {
  const results = [];
  
  for (const item of items) {
    const result = await process(item);
    results.push(result);
  }
  
  return results;
}

// Usage
const results = await sequentialOperations([1, 2, 3, 4, 5]);
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use async for functions that need to await
async function fetchData() {
  const response = await fetch('/api/data');
  return response.json();
}

// ✅ Use try-catch for error handling
async function safeOperation() {
  try {
    const result = await operation();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;  // Or handle appropriately
  }
}

// ✅ Use Promise.all for parallel operations
async function parallel() {
  const [a, b, c] = await Promise.all([
    fetchA(),
    fetchB(),
    fetchC()
  ]);
  return { a, b, c };
}

// ✅ Return promises from async functions
async function returnsPromise() {
  return await somePromise;
  // Or: return somePromise;
}

// ✅ Use finally for cleanup
async function withCleanup() {
  try {
    return await operation();
  } finally {
    cleanup();
  }
}
```

### ❌ DON'T

```javascript
// ❌ Don't use async if you don't need await
// Use regular function instead
async function unnecessary() {
  return { data: 'value' };
}

// ✅ Should be:
function unnecessary() {
  return { data: 'value' };
}

// ❌ Don't await non-promises unnecessarily
async function pointless() {
  const x = await 42;  // Unnecessary await
  return x;
}

// ❌ Don't use await in loops when parallel is possible
async function slowLoop() {
  const results = [];
  for (const item of items) {
    results.push(await process(item));  // Sequential!
  }
  return results;
}

// ✅ Should be:
async function fastParallel() {
  return Promise.all(items.map(item => process(item)));
}

// ❌ Don't swallow errors silently
async function swallowErrors() {
  try {
    await operation();
    // Error silently ignored!
  } catch (error) {
    // Should at least log
  }
}

// ❌ Don't forget to return from async
async function forgetsReturn() {
  await operation();
  // Forgot return!
}

// ✅ Should be:
async function properReturn() {
  return await operation();
}
```

---

## Summary

### Async/Await Key Points

| Concept | Details |
|---------|---------|
| **async** | Declares async function, returns Promise |
| **await** | Pauses execution, waits for promise |
| **Try/catch** | Error handling for await |
| **Finally** | Cleanup code |
| **Parallel** | Use Promise.all for independent operations |
| **Sequential** | Use await in sequence for dependent operations |
| **Top-level await** | ES2022, modules only |

### Execution Flow

```javascript
async function example() {
  console.log('1');           // Executes immediately
  
  await delay(100);           // Pauses here
  
  console.log('2');           // Resumes after delay
}

example();
console.log('3');             // Executes before '2'

// Output: 1, 3, 2
```

### Quick Comparison

```javascript
// Promise-based
promise
  .then(handleSuccess)
  .catch(handleError)
  .finally(cleanup);

// Async/await
try {
  const result = await promise;
  handleSuccess(result);
} catch (error) {
  handleError(error);
} finally {
  cleanup();
}
```

### Next Steps

- Master async patterns
- Learn concurrent patterns
- Understand error handling strategies
- Apply to production code
## Async Patterns



## Promisification

### Converting Callbacks to Promises

```javascript
// ❌ Callback-based (Node.js style)
function readFile(filename, callback) {
  // Simulated async operation
  setTimeout(() => {
    if (filename) {
      callback(null, `Contents of ${filename}`);
    } else {
      callback(new Error('No filename'));
    }
  }, 100);
}

// ✅ Convert to promise
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

// Now usable with async/await
async function loadFiles() {
  try {
    const file1 = await readFilePromise('file1.txt');
    const file2 = await readFilePromise('file2.txt');
    console.log(file1, file2);
  } catch (error) {
    console.error('Error:', error);
  }
}

loadFiles();
```

### Generic Promisification Helper

```javascript
// ✅ Convert any callback-based function
function promisify(fn) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Usage
const readFileAsync = promisify(readFile);
const data = await readFileAsync('file.txt');

// ✅ Multiple arguments
function add(a, b, callback) {
  setTimeout(() => {
    callback(null, a + b);
  }, 100);
}

const addAsync = promisify(add);
const result = await addAsync(5, 3);  // 8
```

### Built-in Promisification

```javascript
// ✅ Node.js util.promisify
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

// Now it returns a promise
async function loadFile() {
  const content = await readFile('data.txt', 'utf-8');
  console.log(content);
}

loadFile();
```

---

## Throttling

### What is Throttling?

**Throttling** ensures a function is called at most once per specified time interval, even if events fire repeatedly.

```javascript
// ✅ Basic throttle implementation
function throttle(fn, delay) {
  let lastCall = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn(...args);
    }
  };
}

// Usage: Window resize
window.addEventListener(
  'resize',
  throttle(() => {
    console.log('Window resized');
  }, 1000)  // Max once per second
);
```

### Advanced Throttle with Trailing Call

```javascript
// ✅ Throttle with leading and trailing calls
function throttle(fn, delay, { leading = true, trailing = false } = {}) {
  let lastCall = 0;
  let timeoutId = null;
  
  return function(...args) {
    const now = Date.now();
    
    if (!lastCall && !leading) {
      lastCall = now;
    }
    
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else if (trailing && !timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = leading ? Date.now() : 0;
        timeoutId = null;
        fn(...args);
      }, delay - (now - lastCall));
    }
  };
}

// Usage
const onMouseMove = throttle(
  (event) => console.log('Mouse moved'),
  300,
  { leading: true, trailing: true }
);

document.addEventListener('mousemove', onMouseMove);
```

### Use Cases

```javascript
// ✅ Scroll event throttling
const handleScroll = throttle(() => {
  console.log('Scroll position:', window.scrollY);
}, 500);

window.addEventListener('scroll', handleScroll);

// ✅ API call throttling
const apiCall = throttle(() => {
  fetch('/api/search?q=' + query);
}, 1000);

// User types, but API called at most once per second
input.addEventListener('input', apiCall);
```

---

## Debouncing

### What is Debouncing?

**Debouncing** ensures a function is only called after it stops being invoked for a specified time interval.

```javascript
// ✅ Basic debounce implementation
function debounce(fn, delay) {
  let timeoutId = null;
  
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

// Usage: Search input
const handleSearch = debounce((query) => {
  console.log('Searching for:', query);
  fetch(`/api/search?q=${query}`);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

### Advanced Debounce with Immediate Option

```javascript
// ✅ Debounce with immediate execution
function debounce(fn, delay, { immediate = false } = {}) {
  let timeoutId = null;
  
  return function(...args) {
    const shouldCallNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    if (shouldCallNow) {
      fn(...args);
    }
    
    timeoutId = setTimeout(() => {
      if (!immediate) {
        fn(...args);
      }
      timeoutId = null;
    }, delay);
  };
}

// Usage: Button click (immediate)
const onClick = debounce(
  () => console.log('Clicked'),
  300,
  { immediate: true }
);

button.addEventListener('click', onClick);
```

### Debounce vs Throttle

```javascript
// ✅ Debounce: Wait until activity stops
const debouncedSearch = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 500);

// Fire once 500ms after user stops typing
input.addEventListener('input', (e) => {
  debouncedSearch(e.target.value);
});

// ✅ Throttle: Fire regularly
const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);

// Fire at most every 100ms while scrolling
window.addEventListener('scroll', throttledScroll);
```

---

## Retry Logic

### Simple Retry

```javascript
// ✅ Retry N times
async function retryAsync(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;  // All retries failed
      }
      console.log(`Attempt ${i + 1} failed, retrying...`);
    }
  }
}

// Usage
const data = await retryAsync(
  () => fetch('/api/data').then(r => r.json()),
  3
);
```

### Retry with Exponential Backoff

```javascript
// ✅ Exponential backoff: increases delay between retries
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  baseDelay = 1000
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, i);  // 1s, 2s, 4s...
      console.log(`Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Usage: API call with backoff
const response = await retryWithBackoff(
  () => fetch('/api/data'),
  4,
  500
);
```

### Conditional Retry

```javascript
// ✅ Only retry on specific errors
async function retryOnError(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Retry on server errors (5xx) or network errors
      console.log('Retrying...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}
```

---

## Timeout Patterns

### Promise with Timeout

```javascript
// ✅ Race promise against timeout
async function withTimeout(promise, timeoutMs) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeout]);
}

// Usage
try {
  const data = await withTimeout(
    fetch('/api/slow-endpoint').then(r => r.json()),
    5000
  );
} catch (error) {
  console.error(error.message);  // Operation timed out...
}
```

### AbortController for Native Timeouts

```javascript
// ✅ Modern approach using AbortController
async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// Usage
try {
  const response = await fetchWithTimeout('/api/data', 5000);
  const data = await response.json();
} catch (error) {
  console.error(error.message);
}
```

---

## Concurrency Control

### Limit Concurrent Promises

```javascript
// ✅ Execute N promises concurrently
async function concurrentLimit(promises, limit) {
  const results = [];
  const executing = [];
  
  for (const [index, promise] of promises.entries()) {
    const p = Promise.resolve(promise)
      .then(result => {
        results[index] = result;
      });
    
    results[index] = p;
    
    if (promises.length >= limit) {
      executing.push(p);
      
      p.then(() => {
        executing.splice(executing.indexOf(p), 1);
      });
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  
  await Promise.all(results);
  return results;
}

// Usage: Download max 3 files concurrently
const files = ['file1', 'file2', 'file3', 'file4', 'file5'];
await concurrentLimit(
  files.map(file => downloadFile(file)),
  3  // Max 3 concurrent downloads
);
```

### Worker Pool Pattern

```javascript
// ✅ Manage pool of workers
class WorkerPool {
  constructor(size) {
    this.size = size;
    this.queue = [];
    this.active = 0;
  }
  
  async run(fn) {
    while (this.active >= this.size) {
      await new Promise(resolve => this.queue.push(resolve));
    }
    
    this.active++;
    
    try {
      return await fn();
    } finally {
      this.active--;
      const resolve = this.queue.shift();
      if (resolve) resolve();
    }
  }
}

// Usage
const pool = new WorkerPool(3);  // Max 3 concurrent

const tasks = [...].map(task => 
  pool.run(() => processTask(task))
);

await Promise.all(tasks);
```

---

## Queue Management

### Simple Task Queue

```javascript
// ✅ Process tasks one at a time
class Queue {
  constructor() {
    this.tasks = [];
    this.processing = false;
  }
  
  add(task) {
    this.tasks.push(task);
    this.process();
  }
  
  async process() {
    if (this.processing || this.tasks.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.tasks.length > 0) {
      const task = this.tasks.shift();
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new Queue();

queue.add(() => console.log('Task 1'));
queue.add(() => console.log('Task 2'));
queue.add(() => console.log('Task 3'));

// Output: Task 1, Task 2, Task 3 (sequentially)
```

### Priority Queue

```javascript
// ✅ Process tasks by priority
class PriorityQueue {
  constructor() {
    this.tasks = [];
    this.processing = false;
  }
  
  add(task, priority = 0) {
    this.tasks.push({ task, priority });
    this.tasks.sort((a, b) => b.priority - a.priority);
    this.process();
  }
  
  async process() {
    if (this.processing || this.tasks.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.tasks.length > 0) {
      const { task } = this.tasks.shift();
      try {
        await task();
      } catch (error) {
        console.error('Task failed:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new PriorityQueue();

queue.add(() => console.log('Low priority'), 1);
queue.add(() => console.log('High priority'), 10);
queue.add(() => console.log('Medium priority'), 5);

// Executes: High priority, Medium priority, Low priority
```

---

## Race Conditions and Solutions

### Identifying Race Conditions

```javascript
// ❌ Race condition: Multiple parallel requests
let cachedData = null;

async function fetchData() {
  if (cachedData) return cachedData;
  
  // If called twice before first completes,
  // both will fetch (both see null cache)
  const data = await fetch('/api/data').then(r => r.json());
  cachedData = data;
  return data;
}

// Race: fetchData() called twice
Promise.all([fetchData(), fetchData()]);
// Makes 2 requests instead of 1
```

### Solution 1: Deduplication

```javascript
// ✅ Cache the promise itself
let cachedPromise = null;

async function fetchData() {
  if (!cachedPromise) {
    cachedPromise = fetch('/api/data').then(r => r.json());
  }
  
  return cachedPromise;
}

// No matter how many times called, only 1 request
Promise.all([fetchData(), fetchData(), fetchData()]);
// Only 1 request made
```

### Solution 2: Request Deduplication Map

```javascript
// ✅ Deduplicate by key
const pendingRequests = new Map();

async function fetchDataByKey(key) {
  // Return existing promise if already requested
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }
  
  // Create and cache the promise
  const promise = fetch(`/api/data/${key}`)
    .then(r => r.json())
    .finally(() => {
      pendingRequests.delete(key);  // Clean up
    });
  
  pendingRequests.set(key, promise);
  return promise;
}

// Multiple calls with same key use same request
fetchDataByKey('user-1');
fetchDataByKey('user-1');  // Reuses first request
fetchDataByKey('user-2');  // New request
```

### Solution 3: Abort Stale Requests

```javascript
// ✅ Cancel stale requests
class AbortableRequest {
  constructor() {
    this.controller = null;
    this.result = null;
  }
  
  async fetch(url) {
    // Abort previous request
    if (this.controller) {
      this.controller.abort();
    }
    
    this.controller = new AbortController();
    
    try {
      const response = await fetch(url, {
        signal: this.controller.signal
      });
      this.result = await response.json();
      return this.result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Previous request cancelled');
      }
      throw error;
    }
  }
}

// Usage: Search that cancels previous searches
const search = new AbortableRequest();

search.fetch('/api/search?q=a');  // Request 1
search.fetch('/api/search?q=ab'); // Cancels request 1
search.fetch('/api/search?q=abc');// Cancels request 2
// Only last request completes
```

---

## Advanced Patterns

### Pattern: Timeout with Fallback

```javascript
// ✅ Try primary with timeout, fall back to secondary
async function withFallback(primary, fallback, timeoutMs) {
  try {
    return await withTimeout(primary, timeoutMs);
  } catch (error) {
    console.warn('Primary failed, trying fallback:', error.message);
    return await fallback();
  }
}

// Usage
const data = await withFallback(
  fetch('/api/primary'),
  () => fetch('/api/cache'),
  3000
);
```

### Pattern: Circuit Breaker

```javascript
// ✅ Stop making requests after repeated failures
class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetTimeout = 60000 } = {}) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.failures = 0;
    this.state = 'CLOSED';  // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }
  
  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }
  
  onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }
}

// Usage
const breaker = new CircuitBreaker(() => fetch('/api/unreliable'));

try {
  const data = await breaker.call();
} catch (error) {
  console.error(error.message);
}
```

---

## Best Practices

### ✅ DO

```javascript
// ✅ Use Promise.all for parallel operations
const results = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
]);

// ✅ Debounce frequent events
const handleSearch = debounce((query) => {
  search(query);
}, 300);

// ✅ Implement timeout for external calls
const data = await withTimeout(fetch(url), 5000);

// ✅ Deduplicate concurrent requests
const request = pendingRequests.get(key) || fetch(url);

// ✅ Use exponential backoff for retries
await retryWithBackoff(operation, 3, 1000);
```

### ❌ DON'T

```javascript
// ❌ Don't make multiple identical concurrent requests
fetch('/api/data');
fetch('/api/data');  // Duplicate request

// ❌ Don't forget to debounce high-frequency events
input.addEventListener('input', expensiveOperation);

// ❌ Don't await in loops when you can parallelize
for (const item of items) {
  await process(item);  // Too slow!
}

// ❌ Don't ignore timeout scenarios
const data = await fetch(url).then(r => r.json());  // No timeout

// ❌ Don't retry without backoff
for (let i = 0; i < 5; i++) {
  try {
    return await operation();
  } catch (e) {
    // Immediate retry (hammers server)
  }
}
```

---

## Summary

### Async Patterns Overview

| Pattern | Purpose | Key Benefit |
|---------|---------|------------|
| **Promisification** | Convert callbacks to promises | Use async/await |
| **Throttling** | Limit call frequency | Reduce overhead |
| **Debouncing** | Wait until activity stops | Save bandwidth |
| **Retry** | Repeat failed operations | Handle transients |
| **Timeout** | Limit operation duration | Prevent hangs |
| **Concurrency Control** | Limit parallel operations | Manage resources |
| **Queue** | Process sequentially | Order matters |
| **Deduplication** | Avoid duplicate requests | Save bandwidth |
| **Circuit Breaker** | Stop calling failing service | Fail fast |

### Quick Reference

```javascript
// Debounce frequent events
const debounced = debounce(fn, 300);

// Throttle repeated events
const throttled = throttle(fn, 300);

// Retry with backoff
await retryWithBackoff(fn, 3, 1000);

// Timeout protection
await withTimeout(promise, 5000);

// Parallel execution
await Promise.all([p1, p2, p3]);

// Limited concurrency
await concurrentLimit(promises, 3);

// Sequential queue
const queue = new Queue();
queue.add(task);
```

### Next Steps

- Combine patterns for complex scenarios
- Build robust error handling
- Optimize performance with caching
- Monitor and debug async operations

## 13.6 Async Summary

| Concept | Description |
|---------|-------------|
| Event Loop | Processes call stack, microtasks, then macrotasks |
| Callbacks | Functions passed to async operations |
| Promises | Objects representing eventual completion/failure |
| async/await | Syntactic sugar for promise-based code |
| `Promise.all` | Parallel execution, fail-fast |
| `Promise.allSettled` | Parallel, all results (ES2020) |
| `Promise.race` | First to settle wins |

---

## Mastery Check

### Quiz Questions

**Q1:** Predict the output order:
```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
queueMicrotask(() => console.log('4'));
console.log('5');
```

<details>
<summary>Answer</summary>

```
1
5
3
4
2
```
Sync code (1, 5) → Microtasks (3, 4) → Macrotasks (2)
</details>

**Q2:** What's wrong with this code?
```javascript
async function getData() {
  const users = await fetch('/api/users').then(r => r.json());
  const posts = await fetch('/api/posts').then(r => r.json());
  const comments = await fetch('/api/comments').then(r => r.json());
  return { users, posts, comments };
}
```

<details>
<summary>Answer</summary>

Sequential awaits! The three requests run one after another instead of in parallel. Fix with `Promise.all`:

```javascript
async function getData() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  return { users, posts, comments };
}
```
</details>

**Q3:** What happens here?
```javascript
async function test() {
  return 'hello';
}

console.log(test());
console.log(await test());
```

<details>
<summary>Answer</summary>

```javascript
console.log(test());       // Promise { 'hello' } (async always returns Promise)
console.log(await test()); // 'hello' (await unwraps the promise)
```
</details>

**Q4:** Explain the difference:
```javascript
// Version A
for (const item of items) {
  await processItem(item);
}

// Version B
await Promise.all(items.map(item => processItem(item)));
```

<details>
<summary>Answer</summary>

- **Version A**: Sequential — processes one item at a time, in order
- **Version B**: Parallel — processes all items simultaneously

Use A when order matters or resource-constrained. Use B for maximum throughput (but watch out for rate limits).
</details>

### Coding Challenges

**Challenge 1:** Implement `delay(ms)` that returns a promise resolving after ms milliseconds.

<details>
<summary>Solution</summary>

```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Usage
await delay(1000);
console.log('1 second later');
```
</details>

**Challenge 2:** Create `promiseWithTimeout(promise, ms)` that rejects if the promise doesn't resolve within ms.

<details>
<summary>Solution</summary>

```javascript
function promiseWithTimeout(promise, ms) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), ms);
  });
  
  return Promise.race([promise, timeout]);
}

// Usage
const data = await promiseWithTimeout(fetch('/api/slow'), 5000);
```
</details>

**Challenge 3:** Implement `asyncPool(concurrency, items, iteratorFn)` that limits concurrent promises.

<details>
<summary>Solution</summary>

```javascript
async function asyncPool(concurrency, items, iteratorFn) {
  const results = [];
  const executing = new Set();
  
  for (const item of items) {
    const promise = Promise.resolve().then(() => iteratorFn(item));
    results.push(promise);
    executing.add(promise);
    
    const cleanup = () => executing.delete(promise);
    promise.then(cleanup, cleanup);
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
}

// Usage: Process 100 URLs, max 5 at a time
const results = await asyncPool(5, urls, url => fetch(url));
```
</details>

---

**End of Chapter 13: Asynchronous JavaScript**
