# Event Loop

## Table of Contents
1. [Introduction to the Event Loop](#introduction-to-the-event-loop)
2. [Call Stack](#call-stack)
3. [Task Queue (Macrotasks)](#task-queue-macrotasks)
4. [Microtask Queue](#microtask-queue)
5. [Event Loop Phases](#event-loop-phases)
6. [setTimeout and setInterval Timing](#settimeout-and-setinterval-timing)
7. [queueMicrotask()](#queuemicrotask)
8. [Execution Order](#execution-order)
9. [Visual Mental Models](#visual-mental-models)
10. [Common Pitfalls](#common-pitfalls)
11. [Summary](#summary)

---

## Introduction to the Event Loop

### What is the Event Loop?

The **Event Loop** is the mechanism that allows JavaScript (single-threaded) to handle asynchronous operations by orchestrating the execution of code, collection and processing of events, and execution of queued sub-tasks.

```javascript
// ✅ Synchronous code
console.log('1');  // Executes immediately

// ✅ Asynchronous code
setTimeout(() => {
  console.log('2');  // Queued in task queue
}, 0);

// ✅ Synchronous code
console.log('3');  // Executes immediately

// Output: 1, 3, 2
// NOT: 1, 2, 3
```

### Key Components

1. **Call Stack** - Executes synchronous code
2. **Task Queue (Macrotask Queue)** - Holds macrotasks
3. **Microtask Queue** - Holds microtasks
4. **Event Loop** - Coordinates between them

---

## Call Stack

### What is the Call Stack?

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