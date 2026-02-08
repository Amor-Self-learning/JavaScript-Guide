# 7.5 Array Destructuring

**Array destructuring** allows extracting values from arrays and assigning them to variables in a concise syntax. It's a powerful ES6 feature that makes code more readable and reduces boilerplate.

---

## 7.5.1 Basic Destructuring

**Basic destructuring** extracts array elements by position and assigns them to variables.

```javascript
// Basic destructuring
let arr = [1, 2, 3];
let [a, b, c] = arr;
a                           // 1
b                           // 2
c                           // 3

// Partial destructuring
let [first, second] = arr;
first                       // 1
second                      // 2
// Third element ignored

// Extra variables
let arr = [1, 2];
let [a, b, c] = arr;
c                           // undefined

// Nested arrays
let nested = [1, [2, 3], 4];
let [a, [b, c], d] = nested;
a                           // 1
b                           // 2
c                           // 3
d                           // 4

// Destructuring strings (strings are iterable)
let str = 'ABC';
let [a, b, c] = str;
a                           // 'A'
b                           // 'B'
c                           // 'C'

// Multiple levels of nesting
let data = [1, [2, [3, 4]]];
let [a, [b, [c, d]]] = data;
c                           // 3
d                           // 4

// Ignoring elements
let arr = [1, 2, 3, 4, 5];
let [first, , third] = arr;
first                       // 1
third                       // 3
// Skips second element

// Destructuring from function return
function getCoordinates() {
  return [10, 20];
}

let [x, y] = getCoordinates();
x                           // 10
y                           // 20

// Simple swap
let a = 1, b = 2;
[a, b] = [b, a];
a                           // 2
b                           // 1

// Unpacking function arguments
function processArray([a, b, c]) {
  return a + b + c;
}

processArray([1, 2, 3]);    // 6

// Extracting from complex nested structure
let response = {
  data: [100, 200, 300],
  status: 'success'
};

let [first, second] = response.data;
first                       // 100
second                      // 200
```

---

## 7.5.2 Skipping Elements

**Skipping elements** allows ignoring specific positions while destructuring.

```javascript
// Skip one element
let arr = ['a', 'b', 'c', 'd'];
let [first, , third] = arr;
first                       // 'a'
third                       // 'c'
// 'b' is skipped

// Skip multiple elements
let [a, , , d] = arr;
a                           // 'a'
d                           // 'd'

// Skip at end
let [first, second] = ['a', 'b', 'c', 'd'];
first                       // 'a'
second                      // 'b'
// Elements after are ignored

// Skip in nested structure
let nested = [1, [2, 3, 4], 5];
let [a, [, b, ], c] = nested;
a                           // 1
b                           // 3 (skips 2)
c                           // 5

// Common pattern: get first and last
let arr = [1, 2, 3, 4, 5];
let [first, , , , last] = arr;
first                       // 1
last                        // 5

// Or use rest (better)
let [first, ...middle, last] = arr;
// Error! Rest must be last element

// Better approach
let [first, ...rest] = arr;
let last = rest[rest.length - 1];
last                        // 5

// Skipping with different values
let arr = [10, 20, 30, 40, 50];
let [, a, , b, ] = arr;
a                           // 20
b                           // 40

// Function parameters - skip unused
function processValues([, , importantValue]) {
  return importantValue * 2;
}

processValues([1, 2, 3]);   // 6 (uses only third value)

// Skip with rest parameter
let [first, , ...rest] = [1, 2, 3, 4, 5];
first                       // 1
rest                        // [3, 4, 5]
```

---

## 7.5.3 Rest in Destructuring

**Rest in destructuring** (using `...`) collects remaining elements into a new array.

```javascript
// Collect remaining elements
let arr = [1, 2, 3, 4, 5];
let [first, ...rest] = arr;
first                       // 1
rest                        // [2, 3, 4, 5]

// Two elements, rest of array
let [a, b, ...others] = [10, 20, 30, 40, 50];
a                           // 10
b                           // 20
others                      // [30, 40, 50]

// Only rest
let [...all] = arr;
all                         // [1, 2, 3, 4, 5]
// Equivalent to [...arr]

// Skip and rest
let [, , ...tail] = [1, 2, 3, 4, 5];
tail                        // [3, 4, 5]

// Rest in nested structure
let [first, [second, ...inner], ...outer] = [1, [2, 3, 4], 5, 6];
first                       // 1
second                      // 2
inner                       // [3, 4]
outer                       // [5, 6]

// Common pattern: separate first and rest
function processItems([first, ...rest]) {
  console.log('First:', first);
  console.log('Rest:', rest);
}

processItems([1, 2, 3, 4]);
// First: 1
// Rest: [2, 3, 4]

// Head and tail
let [head, ...tail] = [1, 2, 3, 4, 5];
head                        // 1
tail                        // [2, 3, 4, 5]

// Last element using rest (workaround)
let arr = [1, 2, 3, 4, 5];
let [...all] = arr;
let last = all[all.length - 1];
// But simpler: arr[arr.length - 1]

// Rest captures empty array
let [first, ...rest] = [1];
first                       // 1
rest                        // []

// Rest is always an array
let [first, ...rest] = [1];
Array.isArray(rest);        // true

// Cannot use rest in middle
let [a, ...middle, b] = [1, 2, 3, 4];
// SyntaxError: rest element must be last element

// Function that takes first param and collects rest
function sum(first, ...rest) {
  return first + rest.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4);            // 10

// Destructuring with rest in function
function printEntries([first, ...rest]) {
  console.log('First entry:', first);
  rest.forEach(entry => console.log('Entry:', entry));
}

// Cloning with spread vs destructuring
let original = [1, 2, 3];
let clone1 = [...original];         // Using spread
let [, ...clone2] = original;       // Using rest destructuring
// Both create new array: [1, 2, 3]

// Prefer spread for clarity
```

---

## 7.5.4 Default Values

**Default values** are assigned when destructured element is `undefined`.

```javascript
// Simple default
let [a = 1, b = 2] = [5];
a                           // 5 (uses destructured value)
b                           // 2 (uses default)

// Multiple defaults
let [x = 10, y = 20, z = 30] = [1];
x                           // 1
y                           // 20
z                           // 30

// Default expressions
let arr = [1];
let [a = 10 * 2, b = 20 + 5] = arr;
a                           // 1
b                           // 25 (20 + 5)

// Defaults with null vs undefined
let [a = 10] = [null];
a                           // null (null is not undefined)

let [b = 10] = [undefined];
b                           // 10 (undefined triggers default)

// Defaults in nested destructuring
let [a, [b = 20, c = 30] = []] = [1];
a                           // 1
b                           // 20
c                           // 30

// Default using function
function getDefaultUser() {
  return { id: 999, name: 'Anonymous' };
}

let [user = getDefaultUser()] = [];
user                        // { id: 999, name: 'Anonymous' }
// Function only called if value is undefined

// Using previous element in default
let [a = 1, b = a * 2] = [5];
a                           // 5
b                           // 10 (uses a)

// Chained defaults
let [a = 1, b = a + 1, c = b + 1] = [];
a                           // 1
b                           // 2 (1 + 1)
c                           // 3 (2 + 1)

// Complex default value
let [data = { id: 0, values: [] }] = [];
data                        // { id: 0, values: [] }

// Skipping with defaults
let [, , c = 3] = [1, 2];
c                           // 3

// Function parameter defaults
function process([a = 10, b = 20] = []) {
  return a + b;
}

process();                  // 30 (uses all defaults)
process([5]);               // 25 (a=5, b=20)
process([5, 15]);           // 20 (a=5, b=15)

// Empty array gets all defaults
let [a = 1, b = 2] = [];
a                           // 1
b                           // 2

// Mixed with skipping
let [a = 10, , c = 30] = [1, 2];
a                           // 1
c                           // 30
// Second element skipped regardless of default
```

---

## 7.5.5 Swapping Variables

**Swapping variables** is one of the most elegant uses of destructuring.

```javascript
// Simple swap
let a = 1, b = 2;
[a, b] = [b, a];
a                           // 2
b                           // 1

// Swap three variables
let x = 'a', y = 'b', z = 'c';
[x, y, z] = [z, x, y];
x                           // 'c'
y                           // 'a'
z                           // 'b'

// Swap array elements
let arr = [1, 2, 3];
[arr[0], arr[2]] = [arr[2], arr[0]];
arr                         // [3, 2, 1]

// Before ES6 (required temp variable)
let a = 1, b = 2;
let temp = a;
a = b;
b = temp;
// Now: a=2, b=1 (more code!)

// Rotate values
let a = 1, b = 2, c = 3;
[a, b, c] = [b, c, a];
a                           // 2
b                           // 3
c                           // 1

// Swap with array methods
let arr = [1, 2, 3, 4, 5];
// Swap first and last
[arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
arr                         // [5, 2, 3, 4, 1]

// Swap adjacent elements
function swapAdjacent(arr, i) {
  [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
}

let arr = [1, 2, 3, 4];
swapAdjacent(arr, 1);
arr                         // [1, 3, 2, 4]

// Practical: sorting by swapping
let arr = [3, 1, 2];
for (let i = 0; i < arr.length; i++) {
  for (let j = i + 1; j < arr.length; j++) {
    if (arr[i] > arr[j]) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}
arr                         // [1, 2, 3]

// Without destructuring (bubble sort)
arr = [3, 1, 2];
for (let i = 0; i < arr.length - 1; i++) {
  for (let j = 0; j < arr.length - i - 1; j++) {
    if (arr[j] > arr[j + 1]) {
      let temp = arr[j];
      arr[j] = arr[j + 1];
      arr[j + 1] = temp;
    }
  }
}
// Much more verbose!

// Swap with computed indices
let data = { values: [10, 20, 30] };
let i = 0, j = 2;
[data.values[i], data.values[j]] = [data.values[j], data.values[i]];
data.values                 // [30, 20, 10]

// Multiple swaps in one line
let a = 1, b = 2, c = 3;
[a, b, c] = [c, b, a];
a                           // 3
b                           // 2
c                           // 1

// Swap doesn't require temp variable anymore
let x = 'hello';
let y = 'world';
[x, y] = [y, x];
x                           // 'world'
y                           // 'hello'
```

---

## 7.5.6 Advanced Destructuring Patterns

**Advanced patterns** combine multiple features for powerful array manipulation.

```javascript
// Destructuring with filtering
let arr = [1, 2, 3, 4, 5];
// Get only even numbers into separate variables
let [a, , b, , c] = arr.filter(x => x % 2 === 0);
a                           // 2
b                           // 4
c                           // undefined (not enough even numbers)

// Conditional destructuring
let data = true ? [1, 2] : [3, 4];
let [a, b] = data;
a                           // 1
b                           // 2

// Destructuring function output
function divmod(dividend, divisor) {
  return [Math.floor(dividend / divisor), dividend % divisor];
}

let [quotient, remainder] = divmod(17, 5);
quotient                    // 3
remainder                   // 2

// Combining with spread operator
let arr = [1, 2, 3, 4, 5];
let [first, second, ...rest] = arr;
first                       // 1
second                      // 2
rest                        // [3, 4, 5]

// Ignoring and spreading
let [a, , ...others] = [1, 2, 3, 4, 5];
a                           // 1
others                      // [3, 4, 5]

// Deep destructuring with defaults
let data = [
  [1, 2],
  [3, 4, 5]
];

let [[a = 0, b = 0], [c = 0, d = 0, e = 0]] = data;
a                           // 1
b                           // 2
c                           // 3
d                           // 4
e                           // 5

// With missing arrays
let [[x = 10, y = 20] = [], [z = 30]] = [];
x                           // 10
y                           // 20
z                           // 30

// Function parameters with multiple destructuring
function process([first, ...rest], [a, b]) {
  return {
    first,
    rest,
    a,
    b
  };
}

process([1, 2, 3], [10, 20]);
// { first: 1, rest: [2, 3], a: 10, b: 20 }

// Combining array and object destructuring
let [x, { y, z }] = [1, { y: 2, z: 3 }];
x                           // 1
y                           // 2
z                           // 3

// Error handling with destructuring
function fetchData() {
  return [null, 'Data loaded'];  // [error, data]
}

let [error, data] = fetchData();
if (!error) {
  console.log(data);        // 'Data loaded'
}

// Destructuring in loops
let matrix = [[1, 2], [3, 4], [5, 6]];
for (let [a, b] of matrix) {
  console.log(a, b);
  // 1, 2
  // 3, 4
  // 5, 6
}

// Transforming during destructuring (with computed property)
let arr = [1, 2, 3];
let [a, b, c] = arr.map(x => x * 2);
a                           // 2
b                           // 4
c                           // 6

// Destructuring with array methods
let [min, max] = (() => {
  let arr = [5, 2, 9, 1];
  return [Math.min(...arr), Math.max(...arr)];
})();
min                         // 1
max                         // 9

// Complex pattern matching
let result = {
  success: true,
  values: [10, 20, 30]
};

let { success, values: [first, second, ...rest] } = result;
success                     // true
first                       // 10
second                      // 20
rest                        // [30]

// Null coalescing with destructuring
let [a = 'default'] = [null];
a                           // null (null is not undefined!)

let [b = 'default'] = [undefined];
b                           // 'default'

// Empty vs undefined
let [] = [];                // Valid
let [] = [1, 2, 3];        // Valid, elements ignored
```

**Best Practices:**

```javascript
// ✓ Use destructuring for clarity
let [x, y] = [1, 2];

// ✓ Use rest for variable-length arrays
let [first, ...rest] = arr;

// ✓ Use defaults for optional values
let [a = 10, b = 20] = arr;

// ✓ Use for function parameters
function process([a, b]) {
  return a + b;
}

// ✗ Don't over-nest (hard to read)
let [a, [b, [c, [d]]]] = data;  // Difficult to follow

// ✓ Extract to variables first
let [[x, y]] = data;
let result = x + y;

// ✓ Use for swapping
[a, b] = [b, a];

// ✗ Avoid ambiguous skipping
let [, , , x] = arr;  // Hard to count positions

// ✓ Be explicit with comments
let [
  firstName,  // Person's first name
  lastName,   // Person's last name
  , // Age skipped
  email       // Email address
] = data;
```