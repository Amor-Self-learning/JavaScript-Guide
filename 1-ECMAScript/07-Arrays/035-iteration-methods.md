# 7.4 Iteration Methods

**Iteration methods** execute a function on each array element, enabling powerful functional programming patterns. They're crucial for modern JavaScript development.

---

## 7.4.1 forEach()

**forEach()** executes a provided function once for each array element. It always returns `undefined`.

```javascript
// Basic iteration
let arr = [1, 2, 3];
arr.forEach(element => {
  console.log(element);     // 1, 2, 3
});

// With index
let arr = ['a', 'b', 'c'];
arr.forEach((element, index) => {
  console.log(`${index}: ${element}`);  // 0: a, 1: b, 2: c
});

// With array reference
let arr = [1, 2, 3];
arr.forEach((element, index, array) => {
  console.log(array);       // Prints the whole array each time
});

// Accumulating side effects
let sum = 0;
[1, 2, 3, 4, 5].forEach(x => {
  sum += x;
});
sum                         // 15

// Building a string
let result = '';
['a', 'b', 'c'].forEach(letter => {
  result += letter;
});
result                      // 'abc'

// Modifying objects in array
let items = [
  { id: 1, done: false },
  { id: 2, done: false }
];

items.forEach(item => {
  item.done = true;  // Mutates items
});

// items[0].done = true

// Return value ignored
let arr = [1, 2, 3];
let result = arr.forEach(x => x * 2);
result                      // undefined (always)

// Break not possible (unlike for loop)
let arr = [1, 2, 3, 4, 5];
arr.forEach(x => {
  if (x === 3) {
    // break;  // SyntaxError - forEach doesn't support break
    return;   // Skips current iteration, continues loop
  }
  console.log(x);           // 1, 2, 4, 5
});

// To break early, use some() or every()
arr.some(x => {
  console.log(x);
  return x === 3;           // Stops when true
});

// This binding
let obj = { multiplier: 2 };
let arr = [1, 2, 3];
arr.forEach(function(x) {
  console.log(x * this.multiplier);
}, obj);                    // 2, 4, 6

// Arrow function captures outer this
let obj = { multiplier: 2 };
arr.forEach(x => {
  console.log(x * obj.multiplier);  // 2, 4, 6
});

// Sparse arrays skip holes
let sparse = [1, , 3];
sparse.forEach(x => {
  console.log(x);           // 1, 3 (hole skipped)
});

// forEach on array-like objects
let arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
Array.prototype.forEach.call(arrayLike, (x, i) => {
  console.log(i, x);
});

// Converting NodeList to array using forEach
let elements = document.querySelectorAll('.item');
elements.forEach(el => {
  console.log(el);
});

// Chaining with map/filter (but prefer chaining)
let arr = [1, 2, 3, 4, 5];
arr
  .filter(x => x % 2 === 0)
  .forEach(x => {
    console.log(x * 2);      // 4, 8
  });

// Better to use map for transformation
arr
  .filter(x => x % 2 === 0)
  .map(x => x * 2);         // [4, 8]

// Common pattern: updating DOM
let items = [{ text: 'Item 1' }, { text: 'Item 2' }];
let ul = document.querySelector('ul');
ul.innerHTML = '';
items.forEach(item => {
  let li = document.createElement('li');
  li.textContent = item.text;
  ul.appendChild(li);
});

// Event listeners
let buttons = document.querySelectorAll('button');
buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    console.log('Clicked:', btn.textContent);
  });
});

// Timeout/Interval with forEach
let tasks = ['task1', 'task2', 'task3'];
tasks.forEach((task, index) => {
  setTimeout(() => {
    console.log(task);
  }, (index + 1) * 1000);
});
```

**forEach vs for loop:**

```javascript
// forEach
arr.forEach(x => console.log(x));

// for loop
for (let x of arr) {
  console.log(x);
}

// for loop advantages:
// - Can break/continue
// - Can return from outer function
// - More control

// forEach advantages:
// - Cleaner, more functional
// - Built-in, no iterator protocol needed
// - Immutable iteration pattern

// Key difference: break/continue
let arr = [1, 2, 3, 4, 5];

// Works with for
for (let x of arr) {
  if (x === 3) break;       // Exits loop
  console.log(x);           // 1, 2
}

// Doesn't work with forEach
arr.forEach(x => {
  if (x === 3) return;      // Skips iteration, loop continues
  console.log(x);           // 1, 2, 4, 5
});
```

---

## 7.4.2 map()

**map()** transforms each element using a callback function and returns a new array with the results.

```javascript
// Basic transformation
let arr = [1, 2, 3];
let doubled = arr.map(x => x * 2);
doubled                     // [2, 4, 6]

// With index
let arr = ['a', 'b', 'c'];
let indexed = arr.map((x, i) => `${i}: ${x}`);
indexed                     // ['0: a', '1: b', '2: c']

// Object transformation
let users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

let names = users.map(u => u.name);
names                       // ['Alice', 'Bob']

// Extracting property (common pattern)
let ages = users.map(u => u.age);
ages                        // [30, 25]

// Type conversion
let strings = ['1', '2', '3'];
let numbers = strings.map(Number);
numbers                     // [1, 2, 3]

// Chaining maps
let result = [1, 2, 3]
  .map(x => x * 2)          // [2, 4, 6]
  .map(x => x + 1);         // [3, 5, 7]
result                      // [3, 5, 7]

// Creating arrays
let result = [1, 2, 3].map(x => [x, x * 2]);
result                      // [[1, 2], [2, 4], [3, 6]]

// With array method
let numbers = ['1', '2', '3'];
let parsed = numbers.map(Number.parseInt);  // Careful! parseInt(string, radix)
// Actually gives [1, NaN, NaN] due to index parameter

// Better
let parsed = numbers.map(x => Number.parseInt(x, 10));
parsed                      // [1, 2, 3]

// String operations
let words = ['hello', 'world'];
let upper = words.map(w => w.toUpperCase());
upper                       // ['HELLO', 'WORLD']

// Math operations
let values = [1, 2, 3, 4, 5];
let squared = values.map(x => x ** 2);
squared                     // [1, 4, 9, 16, 25]

// Conditional mapping (use filter instead)
let arr = [1, 2, 3, 4, 5];
let result = arr.map(x => x % 2 === 0 ? x * 2 : null);
result                      // [null, 4, null, 8, null]

// Better
let result = arr
  .filter(x => x % 2 === 0)
  .map(x => x * 2);
result                      // [4, 8]

// This binding
let context = { multiplier: 3 };
let result = [1, 2, 3].map(function(x) {
  return x * this.multiplier;
}, context);
result                      // [3, 6, 9]

// Sparse arrays - holes preserved
let sparse = [1, , 3];
let result = sparse.map(x => x * 2);
result                      // [2, empty, 6] - hole preserved!

// Transforming dates
let dates = ['2024-01-15', '2024-02-20'];
let dateObjects = dates.map(d => new Date(d));
dateObjects[0].getFullYear(); // 2024

// HTML generation
let items = ['Apple', 'Banana', 'Cherry'];
let html = items.map(item => `<li>${item}</li>`).join('');
html                        // '<li>Apple</li><li>Banana</li><li>Cherry</li>'

// Creating objects
let ids = [1, 2, 3];
let objects = ids.map(id => ({ id, value: id * 10 }));
objects                     // [{id:1,value:10}, {id:2,value:20}, ...]

// With array reference
let arr = [1, 2, 3];
let result = arr.map((x, i, array) => {
  return x + (array[i + 1] || 0);
});
result                      // [3, 5, 3] - each + next

// Common pattern: transforming response
async function fetchUsers() {
  let response = await fetch('/api/users');
  let users = await response.json();
  return users.map(u => ({
    id: u.id,
    displayName: u.first_name + ' ' + u.last_name
  }));
}

// Using with other methods
let numbers = [1, 2, 3, 4, 5];
let result = numbers
  .filter(x => x > 2)       // [3, 4, 5]
  .map(x => x * 2)          // [6, 8, 10]
  .reduce((a, b) => a + b); // 24
```

---

## 7.4.3 filter()

**filter()** returns a new array with elements that pass a test function.

```javascript
// Basic filtering
let arr = [1, 2, 3, 4, 5];
let evens = arr.filter(x => x % 2 === 0);
evens                       // [2, 4]

// String filtering
let words = ['apple', 'ant', 'banana', 'apricot'];
let aWords = words.filter(w => w.startsWith('a'));
aWords                      // ['apple', 'ant', 'apricot']

// Object filtering
let users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

let adults = users.filter(u => u.age >= 30);
adults                      // [Alice, Charlie]

// Remove nullish
let arr = [1, null, 2, undefined, 3, '', 0];
let clean = arr.filter(Boolean);  // Remove falsy: null, undefined, '', 0, false
clean                       // [1, 2, 3]

// Remove duplicates
let arr = [1, 2, 2, 3, 3, 3, 4];
let unique = arr.filter((x, i, a) => a.indexOf(x) === i);
unique                      // [1, 2, 3, 4]

// Or with Set
let unique = [...new Set(arr)];

// With index
let arr = ['a', 'b', 'c', 'd'];
let result = arr.filter((x, i) => i % 2 === 0);
result                      // ['a', 'c'] - even indices

// Complex conditions
let products = [
  { name: 'Laptop', price: 1000, inStock: true },
  { name: 'Mouse', price: 50, inStock: false },
  { name: 'Keyboard', price: 100, inStock: true }
];

let available = products.filter(p => p.inStock && p.price < 500);
available                   // [Keyboard]

// Chaining filters
let arr = [1, 2, 3, 4, 5, 6];
let result = arr
  .filter(x => x > 2)       // [3, 4, 5, 6]
  .filter(x => x % 2 === 0);
result                      // [4, 6]

// Better combined
let result = arr.filter(x => x > 2 && x % 2 === 0);
result                      // [4, 6]

// Filter + map
let products = [
  { name: 'Laptop', price: 1000, inStock: true },
  { name: 'Mouse', price: 50, inStock: false },
  { name: 'Keyboard', price: 100, inStock: true }
];

let available = products
  .filter(p => p.inStock)
  .map(p => p.name);
available                   // ['Laptop', 'Keyboard']

// Exclude pattern
let arr = [1, 2, 3, 4, 5];
let exclude3 = arr.filter(x => x !== 3);
exclude3                    // [1, 2, 4, 5]

// Or exclude array
let exclude = [2, 4];
let result = arr.filter(x => !exclude.includes(x));
result                      // [1, 3, 5]

// This binding
let context = { min: 30 };
let result = [20, 30, 40].filter(function(x) {
  return x >= this.min;
}, context);
result                      // [30, 40]

// Sparse arrays - holes excluded
let sparse = [1, , 3, , 5];
let result = sparse.filter(x => x > 2);
result                      // [3, 5] - holes not included

// Type checking
let mixed = [1, 'hello', true, null, 3.14, undefined];
let numbers = mixed.filter(x => typeof x === 'number');
numbers                     // [1, 3.14]

// Array validation
let items = [
  { id: 1 },
  { id: 2, name: 'Item' },
  { name: 'No ID' },
  { id: 3 }
];

let valid = items.filter(item => item.hasOwnProperty('id'));
valid                       // [Item 1, Item 2, Item 3]

// Searching in nested arrays
let comments = [
  { id: 1, replies: ['Good!', 'Nice'] },
  { id: 2, replies: [] },
  { id: 3, replies: ['Thanks'] }
];

let withReplies = comments.filter(c => c.replies.length > 0);
withReplies                 // [comment 1, comment 3]

// Performance note: filter + length > 0
let hasEven = arr.some(x => x % 2 === 0);  // Better
let hasEven = arr.filter(x => x % 2 === 0).length > 0;  // Unnecessary array creation

// Search implementation
function search(items, query) {
  let lowerQuery = query.toLowerCase();
  return items.filter(item =>
    item.name.toLowerCase().includes(lowerQuery)
  );
}

search(['Apple', 'Banana', 'Cherry'], 'app');  // ['Apple']
```

---

## 7.4.4 reduce() and reduceRight()

**reduce()** executes a reducer function on each element, resulting in a single value.

**reduceRight()** is like reduce() but processes elements from right to left.

```javascript
// Sum array
let arr = [1, 2, 3, 4, 5];
let sum = arr.reduce((acc, x) => acc + x, 0);
sum                         // 15

// Without initial value (starts with first element)
let arr = [1, 2, 3, 4, 5];
let sum = arr.reduce((acc, x) => acc + x);
sum                         // 15 (acc starts at 1)

// Product
let arr = [2, 3, 4];
let product = arr.reduce((acc, x) => acc * x, 1);
product                     // 24

// Building object
let items = ['apple', 'banana', 'cherry'];
let counts = items.reduce((acc, fruit) => {
  acc[fruit] = (acc[fruit] || 0) + 1;
  return acc;
}, {});
counts                      // { apple: 1, banana: 1, cherry: 1 }

// Grouping
let data = [
  { category: 'fruit', name: 'apple' },
  { category: 'fruit', name: 'banana' },
  { category: 'vegetable', name: 'carrot' }
];

let grouped = data.reduce((acc, item) => {
  let cat = item.category;
  acc[cat] = acc[cat] || [];
  acc[cat].push(item.name);
  return acc;
}, {});
// { fruit: ['apple', 'banana'], vegetable: ['carrot'] }

// Finding max value
let arr = [5, 2, 9, 1, 7];
let max = arr.reduce((acc, x) => x > acc ? x : acc);
max                         // 9

// Finding max object
let users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
];

let oldest = users.reduce((oldest, user) =>
  user.age > oldest.age ? user : oldest
);
oldest                      // { name: 'Charlie', age: 35 }

// Flattening
let nested = [[1, 2], [3, 4], [5, 6]];
let flat = nested.reduce((acc, arr) => acc.concat(arr), []);
flat                        // [1, 2, 3, 4, 5, 6]

// Better: use flat()
let flat = nested.flat();   // [1, 2, 3, 4, 5, 6]

// Unique elements
let arr = [1, 2, 2, 3, 3, 3, 4];
let unique = arr.reduce((acc, x) => {
  if (!acc.includes(x)) acc.push(x);
  return acc;
}, []);
unique                      // [1, 2, 3, 4]

// Better: use Set
let unique = [...new Set(arr)];

// Array from string (frequency)
let str = 'hello';
let freq = str.split('').reduce((acc, char) => {
  acc[char] = (acc[char] || 0) + 1;
  return acc;
}, {});
freq                        // { h: 1, e: 1, l: 2, o: 1 }

// With index and array
let arr = [1, 2, 3, 4, 5];
let result = arr.reduce((acc, x, i, a) => {
  if (i === a.length - 1) {
    return acc + x;         // Last element, add
  }
  return acc + x * 0.5;     // Others, half
}, 0);
// 0.5 + 1 + 1.5 + 2 + 5 = 10

// reduceRight() - right to left
let arr = [1, 2, 3, 4, 5];
let result = arr.reduceRight((acc, x) => {
  acc.push(x);
  return acc;
}, []);
result                      // [5, 4, 3, 2, 1] - reversed

// String reverse
let str = 'hello';
let reversed = str.split('').reduceRight((acc, c) => acc + c);
reversed                    // 'olleh'

// But simpler
let reversed = str.split('').reverse().join('');

// Running through array from right
let arr = [1, 2, 3, 4, 5];
let result = arr.reduceRight((acc, x) => {
  return acc + x;           // Same as reduce
}, 0);
result                      // 15 (same result)

// Type conversions
let mixed = [1, 'hello', true, { x: 1 }];
let result = mixed.reduce((acc, x) => {
  switch(typeof x) {
    case 'number': return acc + x;
    case 'string': return acc + x.length;
    case 'boolean': return acc + (x ? 1 : 0);
    default: return acc;
  }
}, 0);
result                      // 7 (1 + 5 + 1)

// Pipeline/composition
let fns = [
  x => x * 2,
  x => x + 1,
  x => x ** 2
];

let compose = (value, functions) =>
  functions.reduce((acc, fn) => fn(acc), value);

compose(3, fns);            // ((3*2)+1)^2 = 49

// Common pattern: sum/average
let arr = [1, 2, 3, 4, 5];
let sum = arr.reduce((a, b) => a + b, 0);
let avg = sum / arr.length;
avg                         // 3

// Or in one reduce
let result = arr.reduce((acc, x, i, a) => {
  acc.sum += x;
  acc.avg = acc.sum / (i + 1);
  return acc;
}, { sum: 0, avg: 0 });
result.avg                  // 3

// Chaining transforms
let data = [1, 2, 3, 4, 5];
let result = data
  .filter(x => x > 2)
  .map(x => x * 2)
  .reduce((a, b) => a + b, 0);
result                      // 24 (3*2 + 4*2 + 5*2 = 6 + 8 + 10)
```

---

## 7.4.5 find() and findIndex()

**find()** returns the first element that passes a test function (or undefined if none found).

**findIndex()** returns the index of the first element that passes the test.

```javascript
// Finding first element
let arr = [1, 2, 3, 4, 5];
let found = arr.find(x => x > 3);
found                       // 4

// Not found
let found = arr.find(x => x > 10);
found                       // undefined

// Finding object
let users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
];

let user = users.find(u => u.id === 2);
user                        // { id: 2, name: 'Bob' }

// findIndex - get position
let index = users.findIndex(u => u.id === 2);
index                       // 1

// Complex condition
let products = [
  { id: 1, name: 'Laptop', price: 1000 },
  { id: 2, name: 'Mouse', price: 50 },
  { id: 3, name: 'Keyboard', price: 100 }
];

let expensive = products.find(p => p.price > 500);
expensive                   // { Laptop object }

// First even number
let arr = [1, 3, 5, 4, 6];
let firstEven = arr.find(x => x % 2 === 0);
firstEven                   // 4

// findIndex for inserting
let arr = [10, 20, 30, 40];
let index = arr.findIndex(x => x > 25);
index                       // 2 - insert at this position

// String search
let strings = ['apple', 'apricot', 'banana', 'avocado'];
let aString = strings.find(s => s.startsWith('ap'));
aString                     // 'apple'

let aIndex = strings.findIndex(s => s.startsWith('ap'));
aIndex                      // 0

// With index parameter
let arr = [10, 20, 30, 40];
let result = arr.find((x, i) => x > i * 10);
result                      // 20 (at index 1, 20 > 10)

// Complex object matching
let user = users.find(u =>
  u.name.length > 3 && u.id !== 1
);
user                        // Alice, Bob, or Charlie (first match)

// Debugging with find
let arr = [1, 2, 3, 4, 5];
let found = arr.find(x => {
  console.log(`Checking ${x}`);
  return x > 3;             // Logs: 1, 2, 3, 4, then returns 4
});

// This binding
let obj = { threshold: 3 };
let arr = [1, 2, 3, 4, 5];
let result = arr.find(function(x) {
  return x > this.threshold;
}, obj);
result                      // 4

// Sparse arrays - holes skipped
let sparse = [1, , 3, , 5];
let found = sparse.find(x => x > 2);
found                       // 3

// Common use: getting ID by property
function getUserById(users, id) {
  return users.find(u => u.id === id);
}

// Database-like query
let records = [
  { id: 1, status: 'active' },
  { id: 2, status: 'inactive' },
  { id: 3, status: 'active' }
];

let activeRecord = records.find(r => r.status === 'active');
activeRecord                // { id: 1, status: 'active' }

let activeIndex = records.findIndex(r => r.status === 'active');
activeIndex                 // 0

// Cache pattern
let cache = [
  { key: 'user', value: { name: 'Alice' } },
  { key: 'settings', value: { theme: 'dark' } }
];

let cached = cache.find(c => c.key === 'user');
cached                      // { key: 'user', value: {...} }
```

---

## 7.4.6 findLast() and findLastIndex() (ES2023)

**findLast()** returns the last element that passes a test (searches right to left).

**findLastIndex()** returns the index of the last matching element.

```javascript
// Finding last match
let arr = [1, 2, 3, 4, 3, 5];
let last = arr.findLast(x => x > 2);
last                        // 5

let lastIndex = arr.findLastIndex(x => x > 2);
lastIndex                   // 5

// Last occurrence of specific value
let arr = [1, 2, 3, 2, 1];
let last3 = arr.findLast(x => x === 3);
last3                       // 3

let index3 = arr.findLastIndex(x => x === 3);
index3                       // 2

// Objects - last match
let logs = [
  { level: 'info', msg: 'Start' },
  { level: 'error', msg: 'Connection failed' },
  { level: 'info', msg: 'Retry' },
  { level: 'error', msg: 'Retry failed' }
];

let lastError = logs.findLast(l => l.level === 'error');
lastError                   // { level: 'error', msg: 'Retry failed' }

// Search backwards more efficiently
let arr = [1, 2, 3, 4, 5];
let result = arr.findLast(x => x % 2 === 0);
result                      // 4 (last even, from right)

let index = arr.findLastIndex(x => x % 2 === 0);
index                       // 3

// Sparse arrays - holes skipped
let sparse = [1, , 3, , 5];
let last = sparse.findLast(x => x > 2);
last                        // 5

let lastIndex = sparse.findLastIndex(x => x > 2);
lastIndex                   // 4

// With index parameter
let arr = [10, 20, 30, 40, 50];
let result = arr.findLast((x, i) => {
  console.log(`Checking index ${i}: ${x}`);
  return x < 40;
});
// Checks: 4, 3, 2, 1, 0 (right to left)
// Returns 30

// Getting last element matching condition
let tasks = [
  { id: 1, completed: true },
  { id: 2, completed: false },
  { id: 3, completed: true },
  { id: 4, completed: false }
];

let lastComplete = tasks.findLast(t => t.completed);
lastComplete                // { id: 3, completed: true }

// Last index for insertion point
let sorted = [10, 20, 30, 40, 50];
let value = 25;
let insertIndex = sorted.findLastIndex(x => x < value) + 1;
insertIndex                 // 2 (insert at position 2)
```

---

## 7.4.7 some() and every()

**some()** returns true if at least one element passes the test.

**every()** returns true if all elements pass the test.

```javascript
// Some - at least one
let arr = [1, 2, 3, 4, 5];
let hasEven = arr.some(x => x % 2 === 0);
hasEven                     // true

// Every - all elements
let allEven = arr.every(x => x % 2 === 0);
allEven                     // false

// Validation patterns
let arr = [5, 10, 15, 20];
arr.some(x => x > 12);      // true
arr.every(x => x > 0);      // true

// Breaking from loop (some/every)
let arr = [1, 2, 3, 4, 5];
let found = arr.some(x => {
  console.log(x);
  return x === 3;           // Stops at 3
});
// Logs: 1, 2, 3 (stops early)

// Check all required fields
let form = [
  { name: 'email', value: 'test@example.com' },
  { name: 'password', value: 'secret' },
  { name: 'username', value: 'john' }
];

let allFilled = form.every(field => field.value.length > 0);
allFilled                   // true

// Check if any field empty
let anyEmpty = form.some(field => field.value.length === 0);
anyEmpty                    // false

// Type checking
let mixed = [1, 2, '3', 4];
let allNumbers = mixed.every(x => typeof x === 'number');
allNumbers                  // false

let hasString = mixed.some(x => typeof x === 'string');
hasString                   // true

// Array validation
let arrays = [[1, 2], [3, 4], [5]];
let allNonEmpty = arrays.every(a => a.length > 0);
allNonEmpty                 // true

let hasEmpty = arrays.some(a => a.length === 0);
hasEmpty                    // false

// User permission check
let users = [
  { name: 'Alice', admin: true },
  { name: 'Bob', admin: false },
  { name: 'Charlie', admin: false }
];

let anyAdmin = users.some(u => u.admin);
anyAdmin                    // true

let allAdmin = users.every(u => u.admin);
allAdmin                    // false

// Password strength validation
function isStrongPassword(pwd) {
  return pwd.length >= 8 &&
    /[A-Z]/.test(pwd) &&    // Has uppercase
    /[a-z]/.test(pwd) &&    // Has lowercase
    /[0-9]/.test(pwd) &&    // Has number
    /[!@#$]/.test(pwd);     // Has special char
}

// Game state
let players = [
  { name: 'Alice', score: 100 },
  { name: 'Bob', score: 85 },
  { name: 'Charlie', score: 0 }
];

let gameOver = players.some(p => p.score >= 100);
gameOver                    // true

let allScored = players.every(p => p.score > 0);
allScored                   // false

// Data consistency check
let data = [{ id: 1 }, { id: 2 }, { id: 3 }];
let hasId = data.every(item => item.hasOwnProperty('id'));
hasId                       // true

// Index parameter
let arr = [1, 2, 3, 4, 5];
let result = arr.some((x, i) => x > i * 2);
result                      // true (finds element > index*2)

// Sparse arrays - holes are skipped
let sparse = [1, , 3, , 5];
let allTrue = sparse.every(x => x > 0);
allTrue                     // true (holes skipped)

// Double-check requirement
let items = [
  { name: 'Item 1', verified: true },
  { name: 'Item 2', verified: false }
];

let allVerified = items.every(i => i.verified);
if (!allVerified) {
  console.log('Some items not verified');
}

// Early exit performance
let arr = Array(1000000).fill(1);

// Very fast with some (stops early)
let hasDuplicate = arr.some((x, i) => arr[i + 1] === x);

// Much slower with every on all
let allUnique = arr.every((x, i) => arr[i + 1] !== x);
```

---

## 7.4.8 keys(), values(), and entries()

These methods return iterators for array keys, values, and [key, value] pairs.

```javascript
// keys() - array indices
let arr = ['a', 'b', 'c'];
let keys = arr.keys();
[...keys]                   // [0, 1, 2]

// values() - array elements
let values = arr.values();
[...values]                 // ['a', 'b', 'c']

// entries() - [index, element] pairs
let entries = arr.entries();
[...entries]                // [[0, 'a'], [1, 'b'], [2, 'c']]

// Iterating keys
let arr = ['x', 'y', 'z'];
for (let key of arr.keys()) {
  console.log(key);         // 0, 1, 2
}

// Iterating values
for (let value of arr.values()) {
  console.log(value);       // 'x', 'y', 'z'
}

// Iterating entries
for (let [index, value] of arr.entries()) {
  console.log(`${index}: ${value}`);
  // 0: x, 1: y, 2: z
}

// Sparse arrays - keys includes holes
let sparse = [1, , 3];
[...sparse.keys()]          // [0, 1, 2] - all indices
[...sparse.values()]        // [1, 3] - only values, holes skipped
[...sparse.entries()]       // [[0, 1], [2, 3]] - entries without holes

// Converting to array
let arr = [10, 20, 30];
let keyArray = Array.from(arr.keys());
keyArray                    // [0, 1, 2]

// Finding max index
let arr = [10, 5, 20, 15];
let maxIndex = [...arr.entries()]
  .reduce((max, [i, v]) => v > arr[max] ? i : max);
maxIndex                    // 2 (index of 20)

// Filtering indices
let arr = ['a', 'b', 'c', 'd'];
let evenIndices = [...arr.keys()].filter(i => i % 2 === 0);
evenIndices                 // [0, 2]

// Most use cases are better served by alternatives
// Use for...of with entries() instead of for loop with indices

// ✗ Traditional
for (let i = 0; i < arr.length; i++) {
  console.log(i, arr[i]);
}

// ✓ Better - using entries()
for (let [i, val] of arr.entries()) {
  console.log(i, val);
}

// Or even simpler
arr.forEach((val, i) => {
  console.log(i, val);
});
```