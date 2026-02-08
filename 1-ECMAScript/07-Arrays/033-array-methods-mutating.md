# 7.2 Array Methods (Mutating)

**Mutating methods** are array methods that modify the original array in place, changing its structure or elements. This section covers the most important mutation methods and their gotchas.

---

## 7.2.1 push() and pop()

**push()** adds one or more elements to the end of an array and returns the new length.

**pop()** removes the last element from an array and returns that element.

```javascript
// push() - add to end
let arr = [1, 2, 3];
let len = arr.push(4);
arr                         // [1, 2, 3, 4]
len                         // 4 (new length)

// push() with multiple elements
arr.push(5, 6, 7);
arr                         // [1, 2, 3, 4, 5, 6, 7]

// push() returns new length
let result = [].push(1);
result                      // 1 (not the value)

// pop() - remove from end
let arr = [1, 2, 3, 4, 5];
let removed = arr.pop();
arr                         // [1, 2, 3, 4]
removed                     // 5

// pop() on empty array
let empty = [];
empty.pop()                 // undefined
empty.length                // 0 (unchanged)

// Using push/pop as stack operations
let stack = [];
stack.push(1, 2, 3);        // [1, 2, 3]
stack.pop();                // 3, stack = [1, 2]
stack.pop();                // 2, stack = [1]
stack.pop();                // 1, stack = []
stack.pop();                // undefined, stack = []

// Performance: push/pop are O(1) operations
// Very efficient for adding/removing from end

// Gotcha: push with spread (not idiomatic)
let arr = [1, 2];
let values = [3, 4, 5];
arr.push(...values);        // Works but unusual
arr                         // [1, 2, 3, 4, 5]

// Better alternatives
arr = [...arr, ...values];  // Spread operator
// or
arr = arr.concat(values);   // concat method
```

**Return Values and Side Effects:**

```javascript
// push() modifies original AND returns length
let arr = [1, 2];
let len = arr.push(3);
len                         // 3
arr                         // [1, 2, 3] - modified

// pop() modifies original AND returns element
let arr = [1, 2, 3];
let last = arr.pop();
last                        // 3
arr                         // [1, 2] - modified

// This matters for functional code
let arr = [1, 2];
// Don't use like this:
if (arr.push(3) > 0) { }    // Works but confusing

// Use like this:
arr.push(3);
if (arr.length > 0) { }     // Clearer intent

// Sparse arrays with push/pop
let sparse = new Array(3);
sparse.push('end');
sparse                      // [empty × 3, 'end']
sparse.length               // 4

// pop() from sparse
let arr = [1, , 3];
arr.pop();                  // 3
arr                         // [1, empty]

// Array-like objects with push
let arrayLike = { length: 0 };
Array.prototype.push.call(arrayLike, 1, 2);
arrayLike                   // { 0: 1, 1: 2, length: 2 }
```

**Performance Characteristics:**

```javascript
// push is O(1) amortized time complexity
let arr = [];
for (let i = 0; i < 1000000; i++) {
  arr.push(i);             // Fast
}

// pop is also O(1)
while (arr.length > 0) {
  arr.pop();               // Fast
}

// Arrays are optimized for push/pop
// This makes them ideal for stack operations
```

**Common Patterns:**

```javascript
// Stack implementation
class Stack {
  constructor() {
    this.items = [];
  }
  
  push(item) {
    this.items.push(item);
  }
  
  pop() {
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// Using stack
let stack = new Stack();
stack.push(1);
stack.push(2);
stack.push(3);
stack.pop();                // 3
stack.peek();               // 2

// Undo/Redo pattern
let history = [];
function doAction(action) {
  history.push(action);
}

function undo() {
  if (history.length > 0) {
    let lastAction = history.pop();
    // Reverse the action
  }
}

// Queue operations (but use unshift/shift)
let queue = [];
queue.push(1, 2, 3);        // [1, 2, 3]
queue.shift();              // 1, queue = [2, 3]
```

---

## 7.2.2 shift() and unshift()

**shift()** removes and returns the first element of an array.

**unshift()** adds one or more elements to the beginning of an array and returns the new length.

```javascript
// shift() - remove from beginning
let arr = [1, 2, 3, 4, 5];
let first = arr.shift();
arr                         // [2, 3, 4, 5]
first                       // 1

// shift() on empty array
let empty = [];
empty.shift()               // undefined
empty.length                // 0

// unshift() - add to beginning
let arr = [2, 3, 4];
let len = arr.unshift(1);
arr                         // [1, 2, 3, 4]
len                         // 4 (new length)

// unshift() with multiple elements
arr.unshift(-2, -1);
arr                         // [-2, -1, 1, 2, 3, 4]

// unshift() returns new length
let result = [].unshift(1);
result                      // 1

// Queue operations using push/shift
let queue = [];
queue.push(1, 2, 3);        // [1, 2, 3]
queue.shift();              // 1, queue = [2, 3]
queue.shift();              // 2, queue = [3]
queue.shift();              // 3, queue = []
queue.shift();              // undefined

// Performance: shift/unshift are O(n)
// Because all remaining elements must shift position
// For large arrays, this can be slow

// GOTCHA: shift/unshift are MUCH SLOWER than push/pop
let arr = [];
for (let i = 0; i < 10000; i++) {
  arr.push(i);              // O(1) - fast
}
for (let i = 0; i < 10000; i++) {
  arr.shift();              // O(n) - slow! All elements shift
}

// Better: pop from end
for (let i = 0; i < 10000; i++) {
  arr.pop();                // O(1) - fast
}

// Sparse arrays with shift/unshift
let sparse = [, , 3];       // [empty × 2, 3]
sparse.shift();             // undefined (first hole)
sparse                      // [empty, 3]

// unshift with holes
let arr = [3, 4];
arr.unshift(1, 2);
arr                         // [1, 2, 3, 4]
```

**Return Values:**

```javascript
// shift() returns removed element
let arr = ['a', 'b', 'c'];
let first = arr.shift();
first                       // 'a'
arr                         // ['b', 'c']

// unshift() returns new length
let arr = [2, 3];
let len = arr.unshift(1);
len                         // 3
arr                         // [1, 2, 3]

// Both modify the original array
let arr = [1, 2, 3];
let len = arr.unshift(0);
arr                         // [0, 1, 2, 3] - modified
len                         // 4

let removed = arr.shift();
arr                         // [1, 2, 3] - modified
removed                     // 0
```

**Common Patterns:**

```javascript
// Queue implementation
class Queue {
  constructor() {
    this.items = [];
  }
  
  enqueue(item) {
    this.items.push(item);
  }
  
  dequeue() {
    return this.items.shift();
  }
  
  peek() {
    return this.items[0];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
  
  size() {
    return this.items.length;
  }
}

// Using queue (FIFO - First In First Out)
let queue = new Queue();
queue.enqueue('first');
queue.enqueue('second');
queue.enqueue('third');
queue.dequeue();            // 'first'
queue.dequeue();            // 'second'
queue.peek();               // 'third'

// Processing items in order
let tasks = [];
function addTask(task) {
  tasks.push(task);
}

function processNextTask() {
  if (tasks.length > 0) {
    let task = tasks.shift();  // Get first task
    // Process task
  }
}

// Rotate array
function rotateLeft(arr) {
  arr.push(arr.shift());    // Move first to end
}

function rotateRight(arr) {
  arr.unshift(arr.pop());   // Move last to beginning
}

let arr = [1, 2, 3, 4, 5];
rotateLeft(arr);            // [2, 3, 4, 5, 1]
rotateRight(arr);           // [1, 2, 3, 4, 5] - back to original

// Repeatedly shifting (inefficient for large arrays)
let arr = [1, 2, 3, 4, 5];
while (arr.length > 0) {
  let item = arr.shift();   // O(n) each time
  console.log(item);
}

// Better: use index instead of shifting
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);      // O(1) each time
}
```

**Performance Comparison:**

```javascript
// Speed comparison: push/pop vs shift/unshift
let largeArray = Array.from({ length: 100000 }, (_, i) => i);

// Fast: pop (O(1))
let start = performance.now();
while (largeArray.length > 0) {
  largeArray.pop();
}
console.log('pop time:', performance.now() - start);  // Fast

// Slow: shift (O(n))
largeArray = Array.from({ length: 100000 }, (_, i) => i);
start = performance.now();
while (largeArray.length > 0) {
  largeArray.shift();       // Slower - all elements shift
}
console.log('shift time:', performance.now() - start);  // Much slower

// For frequent shifts, consider:
// 1. Using index instead of shifting
// 2. Using deque (double-ended queue) data structure
// 3. Using circular buffer implementation

// Circular buffer alternative (more efficient)
class CircularQueue {
  constructor(maxSize) {
    this.items = new Array(maxSize);
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
  
  enqueue(item) {
    if (this.size === this.items.length) {
      // Queue full, resize
      let newItems = new Array(this.items.length * 2);
      for (let i = 0; i < this.size; i++) {
        newItems[i] = this.items[(this.head + i) % this.items.length];
      }
      this.items = newItems;
      this.head = 0;
      this.tail = this.size;
    }
    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.items.length;
    this.size++;
  }
  
  dequeue() {
    if (this.size === 0) return undefined;
    let item = this.items[this.head];
    this.head = (this.head + 1) % this.items.length;
    this.size--;
    return item;
  }
}
```

---

## 7.2.3 splice()

**splice()** changes the contents of an array by removing or replacing existing elements and/or adding new elements.

```javascript
// splice(start, deleteCount, item1, item2, ...)

// Remove elements
let arr = [1, 2, 3, 4, 5];
let removed = arr.splice(2, 2);     // Start at 2, remove 2 elements
arr                         // [1, 2, 5]
removed                     // [3, 4]

// Remove without replacement
let arr = ['a', 'b', 'c', 'd'];
arr.splice(1, 2);           // Remove 'b' and 'c'
arr                         // ['a', 'd']

// Insert elements without removing
let arr = [1, 2, 5];
arr.splice(2, 0, 3, 4);     // At index 2, remove 0, add 3 and 4
arr                         // [1, 2, 3, 4, 5]

// Replace elements
let arr = [1, 2, 3, 4, 5];
arr.splice(1, 2, 'a', 'b'); // Replace elements at index 1-2 with 'a', 'b'
arr                         // [1, 'a', 'b', 4, 5]

// Negative start index
let arr = [1, 2, 3, 4, 5];
arr.splice(-2, 1);          // Start from -2 (third from end)
arr                         // [1, 2, 3, 5]

// Start beyond array length
let arr = [1, 2, 3];
arr.splice(10, 1);          // No effect (index beyond length)
arr                         // [1, 2, 3]

// deleteCount omitted
let arr = [1, 2, 3, 4, 5];
arr.splice(2);              // Remove from index 2 to end
arr                         // [1, 2]

// deleteCount 0
let arr = [1, 2, 3];
arr.splice(1, 0, 'a');      // Insert without removing
arr                         // [1, 'a', 2, 3]

// Returns removed elements
let arr = ['a', 'b', 'c', 'd'];
let removed = arr.splice(1, 2);
removed                     // ['b', 'c']
arr                         // ['a', 'd']

// Modifies original array
let arr = [1, 2, 3];
let result = arr.splice(1, 1, 99);
arr                         // [1, 99, 3] - MODIFIED
result                      // [2] - removed elements

// Sparse arrays with splice
let sparse = [1, , 3];
sparse.splice(1, 1, 2);
sparse                      // [1, 2, 3]

// Multiple changes
let arr = [1, 2, 3, 4, 5];
arr.splice(2, 0, 'a', 'b', 'c');  // Insert 3 elements at index 2
arr                         // [1, 2, 'a', 'b', 'c', 3, 4, 5]
```

**Return Value:**

```javascript
// Always returns array of removed elements
let arr = [1, 2, 3, 4];

// Remove 1 element
let removed = arr.splice(1, 1);
removed                     // [2]

// Remove multiple
let removed = arr.splice(1, 2);
removed                     // [3, 4]

// Remove 0 elements (insertion only)
let arr = [1, 2, 3];
let removed = arr.splice(1, 0, 'a', 'b');
removed                     // [] - nothing removed

// Remove beyond array length
let arr = [1, 2, 3];
let removed = arr.splice(1, 100);  // Only 2 elements after index 1
removed                     // [2, 3]
```

**Common Patterns:**

```javascript
// Remove specific element
function remove(arr, item) {
  let index = arr.indexOf(item);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

remove([1, 2, 3, 2], 2);    // [1, 3, 2]

// Remove all instances
function removeAll(arr, item) {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] === item) {
      arr.splice(i, 1);
    }
  }
  return arr;
}

removeAll([1, 2, 3, 2, 1], 2);  // [1, 3, 1]

// Remove duplicates (destructive)
function removeDuplicates(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        arr.splice(j, 1);
        j--;  // Adjust index since array shrunk
      }
    }
  }
  return arr;
}

removeDuplicates([1, 2, 2, 3, 3, 3]);  // [1, 2, 3]

// Insert at beginning
function insertAtStart(arr, ...items) {
  arr.splice(0, 0, ...items);
  return arr;
}

insertAtStart([2, 3], 0, 1);  // [0, 1, 2, 3]

// Insert at end (but push is better)
function insertAtEnd(arr, ...items) {
  arr.splice(arr.length, 0, ...items);
  return arr;
}

// Insert at specific index
function insertAt(arr, index, ...items) {
  arr.splice(index, 0, ...items);
  return arr;
}

insertAt([1, 4], 1, 2, 3);  // [1, 2, 3, 4]

// Replace all occurrences
function replaceAll(arr, oldValue, newValue) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === oldValue) {
      arr.splice(i, 1, newValue);
    }
  }
}

// Clear array
function clear(arr) {
  arr.splice(0);  // Remove all elements
}

// Copy array section
function extractSection(arr, start, end) {
  return arr.slice(start, end);  // Don't use splice for this!
}

// Move element
function moveElement(arr, fromIndex, toIndex) {
  let removed = arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, ...removed);
  return arr;
}

moveElement([1, 2, 3, 4], 0, 2);  // [2, 3, 1, 4]
```

**Performance Considerations:**

```javascript
// splice has O(n) complexity
// Shifts all elements after the splice point

let largeArray = Array.from({ length: 100000 }, (_, i) => i);

// Removing from beginning is slow
largeArray.splice(0, 1);    // O(n) - all elements shift left

// Removing from end is faster
largeArray.splice(largeArray.length - 1, 1);  // O(1)

// Many small removals are very inefficient
let arr = [1, 2, 3, 4, 5];
for (let i = 0; i < arr.length; i++) {
  arr.splice(i, 1);       // O(n) × length times = O(n²)
}

// Better: filter for removals
let arr = [1, 2, 3, 4, 5];
arr = arr.filter(x => x % 2 === 0);  // Keep only even

// Or reverse iteration
let arr = [1, 2, 3, 4, 5];
for (let i = arr.length - 1; i >= 0; i--) {
  if (someCondition(arr[i])) {
    arr.splice(i, 1);     // Only shifts later elements (fewer shifts)
  }
}
```

---

## 7.2.4 sort()

**sort()** sorts the elements of an array in place using a comparator function.

```javascript
// Default sort - converts to strings and sorts lexicographically
let arr = [3, 1, 4, 1, 5, 9, 2, 6];
arr.sort();
arr                         // [1, 1, 2, 3, 4, 5, 6, 9]

// String sort
let fruits = ['banana', 'apple', 'cherry'];
fruits.sort();
fruits                      // ['apple', 'banana', 'cherry']

// GOTCHA: Numbers sort as strings!
let nums = [30, 1, 4, 10];
nums.sort();
nums                        // [1, 10, 30, 4] - WRONG order!
// "10" < "30" < "4" lexicographically

// Numeric sort with comparator
let nums = [30, 1, 4, 10];
nums.sort((a, b) => a - b);
nums                        // [1, 4, 10, 30] - correct numeric order

// Descending sort
let nums = [3, 1, 4, 1, 5];
nums.sort((a, b) => b - a);
nums                        // [5, 4, 3, 1, 1]

// Object array sort
let people = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

// Sort by age
people.sort((a, b) => a.age - b.age);
// [{ Bob, 25 }, { Alice, 30 }, { Charlie, 35 }]

// Sort by name
people.sort((a, b) => a.name.localeCompare(b.name));
// [{ Alice, 30 }, { Bob, 25 }, { Charlie, 35 }]

// Case-insensitive string sort
let words = ['Apple', 'banana', 'Cherry'];
words.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
// ['Apple', 'banana', 'Cherry']

// Comparator function return values
// Negative: a comes before b
// Zero: a and b same order
// Positive: b comes before a

// Sort stability (ES2019+)
let data = [
  { key: 1, index: 0 },
  { key: 2, index: 1 },
  { key: 1, index: 2 }
];

// Sort by key (stable sort preserves original order for equal elements)
data.sort((a, b) => a.key - b.key);
// [
//   { key: 1, index: 0 },  // Kept original position
//   { key: 1, index: 2 },
//   { key: 2, index: 1 }
// ]
```

**Return Value and Side Effects:**

```javascript
// sort() returns the sorted array (same reference)
let arr = [3, 1, 2];
let result = arr.sort();
result                      // [1, 2, 3]
arr                         // [1, 2, 3] - same array, modified

result === arr              // true - same reference

// Multiple sorts - first sort wins
let arr = [3, 1, 2];
arr.sort().sort().sort();   // Multiple sort calls on same array

// Sparse arrays with sort
let sparse = [3, , 1];
sparse.sort();
sparse                      // [1, empty, 3] - hole moved

// Comparator this binding
let comparator = function(a, b) {
  return a - b;
};

let arr = [3, 1, 2];
arr.sort(comparator);       // Works, 'this' is undefined (or window)

// No ability to pass context to sort in ES5
// In ES6+, use arrow function to capture context
let context = { multiplier: -1 };
let arr = [3, 1, 2];
arr.sort((a, b) => (a - b) * context.multiplier);  // Descending
```

**Common Patterns:**

```javascript
// Numeric sort (most common issue)
let numbers = [10, 5, 40, 25, 1];
numbers.sort((a, b) => a - b);      // Ascending
numbers.sort((a, b) => b - a);      // Descending

// String sort with locale awareness
let names = ['Ö', 'Z', 'A'];
names.sort();                        // Basic sort
names.sort((a, b) => a.localeCompare(b));  // Locale-aware

// Multi-field sort
let people = [
  { lastName: 'Smith', firstName: 'Alice' },
  { lastName: 'Jones', firstName: 'Bob' },
  { lastName: 'Smith', firstName: 'Charlie' }
];

people.sort((a, b) => {
  // Sort by lastName, then firstName
  if (a.lastName !== b.lastName) {
    return a.lastName.localeCompare(b.lastName);
  }
  return a.firstName.localeCompare(b.firstName);
});

// Custom sort object (natural ordering)
const customOrder = { 'high': 1, 'medium': 2, 'low': 3 };

let tasks = [
  { name: 'Task A', priority: 'low' },
  { name: 'Task B', priority: 'high' },
  { name: 'Task C', priority: 'medium' }
];

tasks.sort((a, b) => {
  return customOrder[a.priority] - customOrder[b.priority];
});

// Case-insensitive sort
let words = ['Apple', 'banana', 'Cherry'];
words.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

// Date sort
let dates = [
  new Date('2024-03-15'),
  new Date('2024-01-10'),
  new Date('2024-02-20')
];

dates.sort((a, b) => a.getTime() - b.getTime());

// Version sort (tricky!)
let versions = ['1.10.0', '1.2.0', '1.1.0'];
versions.sort();                    // ['1.1.0', '1.10.0', '1.2.0'] - WRONG

// Better version sort
function versionCompare(a, b) {
  let aParts = a.split('.').map(Number);
  let bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    let aVal = aParts[i] || 0;
    let bVal = bParts[i] || 0;
    if (aVal !== bVal) {
      return aVal - bVal;
    }
  }
  return 0;
}

versions.sort(versionCompare);      // ['1.1.0', '1.2.0', '1.10.0']

// Shuffle array (Fisher-Yates)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Random sort (not recommended - not truly random)
arr.sort(() => Math.random() - 0.5);  // Don't use this!
```

---

## 7.2.5 reverse()

**reverse()** reverses an array in place.

```javascript
// Basic reverse
let arr = [1, 2, 3, 4, 5];
arr.reverse();
arr                         // [5, 4, 3, 2, 1]

// String reversal (convert to array first)
let str = 'hello';
let reversed = str.split('').reverse().join('');
reversed                    // 'olleh'

// Or more modern
let reversed = [...str].reverse().join('');

// With arrays
let arr = ['a', 'b', 'c'];
arr.reverse();
arr                         // ['c', 'b', 'a']

// Returns modified array
let arr = [1, 2, 3];
let result = arr.reverse();
result                      // [3, 2, 1]
arr                         // [3, 2, 1] - same reference
result === arr              // true

// Sparse arrays - holes preserved
let sparse = [1, , 3];
sparse.reverse();
sparse                      // [3, empty, 1]

// Empty array
let empty = [];
empty.reverse();
empty                        // []

// Single element (no effect)
let single = [42];
single.reverse();
single                       // [42]

// Object properties reversed
let obj = { a: 1, b: 2, c: 3 };
let values = Object.values(obj);
values.reverse();
values                      // [3, 2, 1] - values are reversed, not keys
```

**Performance:**

```javascript
// reverse() is O(n) - linear time
// More efficient than manually reversing

// Efficient reversal
arr.reverse();              // O(n)

// Manual reversal (less efficient)
for (let i = 0; i < arr.length / 2; i++) {
  let temp = arr[i];
  arr[i] = arr[arr.length - 1 - i];
  arr[arr.length - 1 - i] = temp;
}  // Also O(n) but more code
```

**Common Patterns:**

```javascript
// Palindrome check
function isPalindrome(str) {
  let cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let reversed = cleaned.split('').reverse().join('');
  return cleaned === reversed;
}

isPalindrome('A man, a plan, a canal: Panama');  // true

// Reverse array without mutation
let arr = [1, 2, 3, 4, 5];
let reversed1 = [...arr].reverse();       // [5, 4, 3, 2, 1]
let reversed2 = arr.slice().reverse();    // [5, 4, 3, 2, 1]

// Original unchanged
arr                         // [1, 2, 3, 4, 5]

// Reverse and process
let data = [1, 2, 3, 4, 5];
let processed = data.slice().reverse().map(x => x * 2);
processed                   // [10, 8, 6, 4, 2]
data                        // [1, 2, 3, 4, 5] - unchanged

// Last N elements
function getLastN(arr, n) {
  return arr.slice(-n);     // Or arr.slice(arr.length - n)
}

getLastN([1, 2, 3, 4, 5], 2);  // [4, 5]

// But reversed
function getLastNReversed(arr, n) {
  return arr.slice(-n).reverse();
}

getLastNReversed([1, 2, 3, 4, 5], 2);  // [5, 4]

// Iterating in reverse
let arr = [1, 2, 3, 4, 5];

// Method 1: with reverse (modifies)
arr.reverse();
for (let item of arr) {
  console.log(item);
}

// Method 2: without modification
for (let i = arr.length - 1; i >= 0; i--) {
  console.log(arr[i]);
}

// Method 3: with slice (no modification)
[...arr].reverse().forEach(item => {
  console.log(item);
});
```

---

## 7.2.6 fill()

**fill()** fills all array elements from a start index to an end index with a static value.

```javascript
// Fill entire array
let arr = [1, 2, 3, 4, 5];
arr.fill(0);
arr                         // [0, 0, 0, 0, 0]

// Fill with start and end
let arr = [1, 2, 3, 4, 5];
arr.fill(9, 2, 4);          // Start at 2, end before 4
arr                         // [1, 2, 9, 9, 5]

// Just start index (to end)
let arr = [1, 2, 3, 4, 5];
arr.fill(0, 2);             // Start at 2, fill to end
arr                         // [1, 2, 0, 0, 0]

// Negative indices
let arr = [1, 2, 3, 4, 5];
arr.fill(9, -2);            // Start at -2 (from end)
arr                         // [1, 2, 3, 9, 9]

arr.fill(8, -3, -1);        // From -3 to before -1
arr                         // [1, 2, 8, 8, 9]

// Fill range
let arr = [1, 2, 3, 4, 5];
arr.fill(0, 1, 3);
arr                         // [1, 0, 0, 4, 5]

// Create array filled with values
let arr = new Array(5).fill(0);
arr                         // [0, 0, 0, 0, 0]

// Returns the modified array
let arr = [1, 2, 3];
let result = arr.fill(0);
result                      // [0, 0, 0]
arr === result              // true

// Fill sparse array
let sparse = new Array(5);
sparse.fill(1);
sparse                      // [1, 1, 1, 1, 1] - holes filled

// Fill with object reference (not copy!)
let arr = new Array(3).fill({});
arr[0].x = 1;
arr[0]                      // { x: 1 }
arr[1]                      // { x: 1 } - SAME object!
arr[2]                      // { x: 1 } - SAME object!

// All elements reference same object
arr[0] === arr[1]           // true
arr[1] === arr[2]           // true

// If you want separate objects
let arr = Array.from({ length: 3 }, () => ({}));
arr[0].x = 1;
arr[0]                      // { x: 1 }
arr[1]                      // {} - different object
arr[2]                      // {} - different object
```

**Common Patterns:**

```javascript
// Initialize array with value
let arr = new Array(10).fill(null);

// Initialize with objects (wrong way)
let arr = new Array(3).fill({});
arr[0].name = 'Alice';  // All objects affected!

// Initialize with objects (right way)
let arr = Array.from({ length: 3 }, () => ({}));
arr[0].name = 'Alice';  // Only first affected

// Initialize with calculated values
let arr = Array.from({ length: 5 }, (_, i) => i * 2);
arr                     // [0, 2, 4, 6, 8]

// Fill with default value
let arr = new Array(10).fill(undefined);

// Create 2D array
let matrix = Array.from({ length: 3 }, () => new Array(3).fill(0));
matrix[0][0] = 1;
// [[1, 0, 0], [0, 0, 0], [0, 0, 0]]

// Clear array content
let arr = [1, 2, 3, 4, 5];
arr.fill(undefined);
arr                     // [undefined, undefined, undefined, undefined, undefined]

// Or better: use length = 0
arr.length = 0;

// Fill boolean array
let flags = new Array(100).fill(false);
flags[0] = true;
flags                   // [true, false, false, ...]

// Fill with repeated pattern
let arr = new Array(12).fill(0);
arr.forEach((_, i) => arr[i] = (i % 3) + 1);
arr                     // [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
```

---

## 7.2.7 copyWithin()

**copyWithin()** copies part of an array to another location in the same array and returns it, without modifying its length.

```javascript
// Copy within same array
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3);       // Copy from index 3 to beginning
arr                         // [4, 5, 3, 4, 5]

// copyWithin(target, start, end)
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3, 5);    // Copy indices 3-4 to position 0
arr                         // [4, 5, 3, 4, 5]

// Copy to different position
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(2, 0, 2);    // Copy [1, 2] to position 2
arr                         // [1, 2, 1, 2, 5]

// Negative indices
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(-2, -3, -1); // Copy index 2 to positions -2, -1
arr                         // [1, 2, 3, 3, 4]

// Returns modified array
let arr = [1, 2, 3, 4, 5];
let result = arr.copyWithin(0, 3);
result                      // [4, 5, 3, 4, 5]
arr === result              // true

// Copy to same source (overlapping)
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(1, 2, 4);    // Copy [3, 4] to position 1
arr                         // [1, 3, 4, 4, 5]

// With start index only
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3);       // Copy from 3 to end
arr                         // [4, 5, 3, 4, 5]

// Copy entire array to beginning
let arr = ['a', 'b', 'c'];
arr.copyWithin(0, 0);       // No change
arr                         // ['a', 'b', 'c']

// Sparse arrays - holes copied as holes
let sparse = [1, , 3, , 5];
sparse.copyWithin(0, 2);
sparse                      // [3, empty, 5, empty, 5]
```

**When to Use:**

```javascript
// Most common: copy within array (usually with Typed Arrays)
let data = new Int32Array([1, 2, 3, 4, 5]);
data.copyWithin(2, 0, 2);   // [1, 2, 1, 2, 5]

// Rotate array (alternative to pop/shift)
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 1);       // [2, 3, 4, 5, 5] - not quite

// Better to use pop/shift for rotation:
arr = [1, 2, 3, 4, 5];
arr.push(arr.shift());      // [2, 3, 4, 5, 1]

// Array shifting (very inefficient!)
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 1);       // [2, 3, 4, 5, 5]
arr.length = 4;             // [2, 3, 4, 5]

// Move section of array
let arr = ['a', 'b', 'c', 'd', 'e'];
arr.copyWithin(1, 3);       // Move ['d', 'e'] to position 1
arr                         // ['a', 'd', 'e', 'd', 'e']

// Duplicate first half
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(3, 0, 2);    // [1, 2, 3, 1, 2]

// Duplicate entire array if length doubled
let arr = [1, 2, 3];
arr.length = 6;
arr.copyWithin(3, 0, 3);    // [1, 2, 3, 1, 2, 3]

// Mostly used with Typed Arrays
let uint8 = new Uint8Array([1, 2, 3, 4, 5]);
uint8.copyWithin(2, 0, 2);
uint8                       // [1, 2, 1, 2, 5]
```

**Performance Note:**

copyWithin() is rarely used in JavaScript arrays. It's more useful with Typed Arrays for low-level buffer manipulation.

**Best Practices:**

```javascript
// ✓ Use copyWithin with Typed Arrays (performance-critical code)
let buffer = new Int32Array([1, 2, 3, 4, 5]);
buffer.copyWithin(2, 0);

// ✗ Avoid copyWithin with regular arrays (not idiomatic)
let arr = [1, 2, 3, 4, 5];
arr.copyWithin(0, 3);       // Confusing, rarely seen

// ✓ Use clearer methods for regular arrays
let arr = [1, 2, 3, 4, 5];
arr = [...arr.slice(3), ...arr];  // More readable
```