# 7 Arrays

Arrays are ordered collections with powerful built-in methods. This chapter covers array creation, mutating and non-mutating methods, iteration, typed arrays, and destructuring patterns.

---

## 7.1 Array Basics

### 7.1.1 Array Literals

An **array** is an ordered collection of values. Arrays are the primary data structure for storing sequences of elements in JavaScript.

**Array Literal Syntax:**

```javascript
// Empty array
[]

// Array with elements
[1, 2, 3, 4, 5]
['a', 'b', 'c']
[true, false, null, undefined]

// Mixed type arrays (valid, but use cautiously)
[1, 'two', true, null, { key: 'value' }, [1, 2]]

// Nested arrays
[[1, 2], [3, 4], [5, 6]]
[[['a', 'b'], ['c', 'd']], [['e', 'f']]]

// Sparse arrays (holes in array - elements missing)
[1, , 3]            // [1, empty, 3]
[1, , , 4]          // [1, empty, empty, 4]
[, , ,]             // [empty × 3]
[1, 2, 3, ]         // Trailing comma ignored, [1, 2, 3]

// Spread operator in array literals (ES6+)
let arr1 = [1, 2];
let arr2 = [...arr1, 3, 4];  // [1, 2, 3, 4]
let arr3 = [0, ...arr1, 5];  // [0, 1, 2, 5]

// Multiple spreads
let a = [1, 2];
let b = [3, 4];
let c = [...a, ..., b];      // [1, 2, 3, 4]

// Spread with strings
let str = "hi";
[...str]                     // ['h', 'i']

// Spread with iterables
let set = new Set([1, 2, 3]);
[...set]                     // [1, 2, 3]
```

**Key Properties:**

```javascript
// Arrays are objects
typeof [1, 2, 3]            // "object"

// instanceof operator for checking arrays
let arr = [1, 2, 3];
arr instanceof Array        // true

// Array.isArray() - recommended method (ES5+)
Array.isArray([1, 2, 3])    // true
Array.isArray("not array")  // false
Array.isArray({ 0: 1 })     // false

// Array inheritance
let arr = [];
arr instanceof Object       // true (arrays are objects)
```

**Array Literals vs Array Constructor:**

```javascript
// Literal syntax (preferred)
let arr1 = [1, 2, 3];

// Constructor syntax (avoid unless necessary)
let arr2 = new Array(1, 2, 3);  // Same as [1, 2, 3]

// GOTCHA: Single number creates sparse array
new Array(3)        // [empty × 3] - NOT [3]
new Array(5)        // [empty, empty, empty, empty, empty]
[3]                 // [3] - different!

// This confusing behavior is why literals are preferred
```

**Creating Arrays From Iterables:**

```javascript
// String
let arr1 = ['h', 'i'];
let arr2 = [...'hi'];         // ['h', 'i']
let arr3 = Array.from('hi');  // ['h', 'i']

// Set
let set = new Set([1, 2, 3]);
let arr4 = [...set];          // [1, 2, 3]
let arr5 = Array.from(set);   // [1, 2, 3]

// Map
let map = new Map([['a', 1], ['b', 2]]);
let arr6 = [...map];          // [['a', 1], ['b', 2]]

// Array-like objects
let arrayLike = { 0: 'a', 1: 'b', length: 2 };
let arr7 = Array.from(arrayLike);  // ['a', 'b']

// With mapping function
let arr8 = Array.from('hello', char => char.toUpperCase());  // ['H', 'E', 'L', 'L', 'O']
```

**Array Literal Gotchas:**

```javascript
// Trailing commas are ignored
let arr1 = [1, 2, 3,];
arr1.length             // 3 (not 4)

// But consecutive commas create holes
let arr2 = [1, , , 4];
arr2.length             // 4
arr2[1]                 // undefined (hole, not undefined value)
arr2.hasOwnProperty(1)  // false (hole has no property)

// Undefined values are different from holes
let arr3 = [1, undefined, undefined, 4];
arr3[1]                 // undefined
arr3.hasOwnProperty(1)  // true (it's a property with undefined value)

// Methods handle holes differently
let arr4 = [1, , 3];
arr4.map(x => x * 2)    // [2, empty, 6] - skips holes
arr4.forEach(x => console.log(x))  // Logs 1 and 3 (skips holes)

// Array.from converts holes to undefined
Array.from([1, , 3])    // [1, undefined, 3]

// Spread also converts holes to undefined
[...[1, , 3]]           // [1, undefined, 3]

// Direct access to holes
let sparse = [1, , 3];
sparse[0]               // 1
sparse[1]               // undefined (looks like a value, but it's a hole)
```

**Best Practices:**

```javascript
// ✓ Use array literals
let arr = [1, 2, 3];

// ✗ Avoid Array constructor
let arr = new Array(1, 2, 3);  // Confusing with single number behavior

// ✓ Use Array.isArray() for type checking
if (Array.isArray(value)) { }

// ✗ Avoid typeof with arrays (returns "object")
if (typeof value === "object") { }  // Too broad

// ✓ Use spread for copying or combining
let arr2 = [...arr1];
let combined = [...arr1, ...arr2];

// ✗ Avoid sparse arrays unless intentional
let arr = [1, , 3];  // Generally confusing

// ✓ Be explicit about undefined values if needed
let arr = [1, undefined, 3];
```

---

### 7.1.2 Array Constructor

The **Array constructor** is a function that creates new arrays. However, it has unintuitive behavior and should be used sparingly.

**Array Constructor Syntax:**

```javascript
// With multiple arguments - creates array with those elements
new Array(1, 2, 3)          // [1, 2, 3]
new Array('a', 'b', 'c')    // ['a', 'b', 'c']
new Array(true, false)      // [true, false]

// With single numeric argument - creates sparse array of that length!
new Array(5)                // [empty × 5]
new Array(0)                // []
new Array(100)              // Array with 100 empty slots

// Without new keyword - same result (new is optional)
Array(1, 2, 3)              // [1, 2, 3]
Array(5)                    // [empty × 5]

// With non-numeric argument - creates array with that element
new Array('5')              // ['5'] - not sparse array!
new Array(true)             // [true]
new Array(null)             // [null]
```

**The Single-Argument Problem (Why Array Constructor Is Confusing):**

```javascript
// WRONG INTERPRETATION
new Array(3)                // Expected: [3]
                            // Actual: [empty × 3] - SPARSE ARRAY!

// This is the primary reason to avoid Array constructor

// Compare with spread
[3]                         // [3] - creates array with element 3
new Array(3)                // [empty × 3] - creates array of length 3

// What if you want to create an array with single number?
new Array(5)                // [empty × 5] - NO!
[5]                         // [5] - YES!
```

**When to Use Array Constructor (Rarely):**

```javascript
// Creating a pre-sized array (sparse)
let arr = new Array(1000);  // Allocate space for 1000 elements
arr[500] = 'value';         // Only this is populated

// Then fill it programmatically
for (let i = 0; i < arr.length; i++) {
  if (arr[i] === undefined) {
    arr[i] = computeValue(i);
  }
}

// But even this is better done with Array.from or map
let arr = Array.from({ length: 1000 }, (_, i) => computeValue(i));
```

**Creating Arrays of Specific Length:**

```javascript
// Sparse array (empty slots)
new Array(5)                // [empty × 5]

// Fill with undefined
Array(5).fill(undefined)    // [undefined, undefined, undefined, undefined, undefined]

// Fill with specific value
Array(5).fill(0)            // [0, 0, 0, 0, 0]
Array(3).fill('x')          // ['x', 'x', 'x']

// Create and initialize with values
Array.from({ length: 5 }, (_, i) => i)           // [0, 1, 2, 3, 4]
Array.from({ length: 5 }, (_, i) => i * 2)       // [0, 2, 4, 6, 8]
Array.from({ length: 3 }, () => Math.random())   // [random, random, random]

// Using map on sparse array
new Array(5).map((_, i) => i)           // [empty × 5] - map skips holes!
Array.from({ length: 5 }, (_, i) => i)  // [0, 1, 2, 3, 4] - works correctly
```

**Constructor Gotchas:**

```javascript
// Single float argument
new Array(3.5)              // RangeError: Invalid array length
new Array(Infinity)         // RangeError: Invalid array length
new Array(-1)               // RangeError: Invalid array length

// String that looks numeric
new Array('5')              // ['5'] - array with string, not length 5
new Array('abc')            // ['abc']

// Multiple numbers
new Array(1, 2, 3)          // [1, 2, 3] - creates array, not sparse

// Empty constructor
new Array()                 // [] - empty array
Array()                     // [] - same

// Behavior comparison
let a1 = [5];               // [5]
let a2 = new Array(5);      // [empty × 5]
let a3 = new Array('5');    // ['5']

a1[0]                       // 5
a2[0]                       // undefined (hole)
a3[0]                       // '5'

a1.length                   // 1
a2.length                   // 5
a3.length                   // 1
```

**Using Array.of() Instead (ES6+):**

```javascript
// Array.of creates array from arguments (no length confusion)
Array.of(1, 2, 3)           // [1, 2, 3]
Array.of(5)                 // [5] - NOT sparse array!
Array.of('5')               // ['5']
Array.of()                  // []

// Array.of is the "corrected" Array constructor
// Always creates array from arguments, never interprets single number as length

// Polyfill for Array.of
if (!Array.of) {
  Array.of = function(...args) {
    return args;
  };
}
```

**Best Practices:**

```javascript
// ✓ Use array literals for most cases
let arr = [1, 2, 3];

// ✓ Use Array.of() if you must use a constructor
let arr = Array.of(5);  // [5]

// ✓ Use Array.from() to create initialized arrays
let arr = Array.from({ length: 5 }, (_, i) => i);

// ✗ Avoid Array constructor
let arr = new Array(5);  // Confusing!

// ✓ If you need specific length, be explicit
let arr = new Array(5).fill(null);  // Make it clear it's sparse, then fill

// ✗ Never rely on Array() with single number
new Array(3)            // NO! Confusing
```

---

### 7.1.3 Array length Property

The **length property** represents the number of elements in an array. It has special behavior in JavaScript.

**The length Property:**

```javascript
// Getting length
let arr = [1, 2, 3];
arr.length              // 3

let empty = [];
empty.length            // 0

let sparse = [1, , , 4];
sparse.length           // 4 (includes holes!)

// All indexes exist
[1, 2, 3, 4, 5].length  // 5
[].length               // 0
```

**Setting length Property:**

```javascript
// Increasing length creates sparse array (with holes)
let arr = [1, 2, 3];
arr.length = 5;
arr                     // [1, 2, 3, empty × 2]
arr.length              // 5

// Decreasing length truncates array
let arr = [1, 2, 3, 4, 5];
arr.length = 3;
arr                     // [1, 2, 3]
arr.length              // 3

// Setting length to 0 empties array
let arr = [1, 2, 3];
arr.length = 0;
arr                     // []
arr                     // Still same reference, just empty

// Setting length to same value does nothing
let arr = [1, 2, 3];
arr.length = 3;
arr                     // [1, 2, 3] - unchanged
```

**length with Non-Integer Values:**

```javascript
// Non-integer converted to integer (truncated)
let arr = [1, 2, 3];
arr.length = 3.9;
arr.length              // 3 (not 3.9)

arr.length = 3.1;
arr.length              // 3

// Invalid values throw error
arr.length = "hello";   // TypeError: Invalid array length
arr.length = -1;        // TypeError: Invalid array length
arr.length = Infinity;  // TypeError: Invalid array length
arr.length = NaN;       // TypeError: Invalid array length

// But strings that convert to numbers work
arr.length = "5";
arr.length              // 5
```

**length and Sparse Arrays:**

```javascript
// Sparse array with gaps
let sparse = [1, , , 4];
sparse.length           // 4

// Manually adding element beyond length increases length
let arr = [1, 2];
arr[5] = 'five';
arr                     // [1, 2, empty × 3, 'five']
arr.length              // 6

// Holes are not counted as "elements"
let sparse = [1, , 3];
sparse.length           // 3 (includes holes!)
// But methods that iterate often skip holes

// Creating holes by increasing length
let arr = [1, 2];
arr.length = 5;
arr                     // [1, 2, empty × 3]
// arr[2], arr[3], arr[4] are holes (not undefined values)

// Checking if index has value
arr.hasOwnProperty(0)   // true
arr.hasOwnProperty(2)   // false (hole)

// But accessing gives undefined either way
arr[0]                  // 1
arr[2]                  // undefined (looks like a value)
```

**length Performance Considerations:**

```javascript
// length is a property, not computed
let arr = [1, 2, 3];
arr.length              // 3 - O(1) operation, constant time

// This is efficient:
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// Even better - cache length
let len = arr.length;
for (let i = 0; i < len; i++) {
  console.log(arr[i]);
}

// Note: modifying array inside loop can change behavior
let arr = [1, 2, 3];
for (let i = 0; i < arr.length; i++) {
  if (i === 1) {
    arr.push(4);  // Modifies array, but length already cached by most loops
  }
  console.log(arr[i]);
}
```

**length vs Counting Elements:**

```javascript
// length counts all indexed positions, including holes
let sparse = [1, , 3];
sparse.length           // 3

// To count actual elements (not holes):
let actualCount = Object.keys(sparse).length;  // 2 (only 1 and 3)

// Or using filter
let actualCount = sparse.filter(x => true).length;  // 2

// Or counting explicitly
let actualCount = 0;
for (let item of sparse) {
  actualCount++;
}
// actualCount = 2
```

**length with Array-like Objects:**

```javascript
// Objects with length property are "array-like"
let arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
arrayLike.length        // 3

// But they're not arrays
Array.isArray(arrayLike)  // false

// Common array-like objects
arguments               // Function's arguments object (old way)
document.querySelectorAll('div')  // NodeList
document.getElementsByTagName('p')  // HTMLCollection
```

**Gotchas with length:**

```javascript
// length is writable (unusual for object properties)
let arr = [1, 2, 3];
arr.length = 5;         // Works
arr.length              // 5

// But you can make it read-only
Object.defineProperty(arr, 'length', { writable: false });
arr.length = 10;        // Fails silently or throws error (strict mode)

// Deleting doesn't affect length
let arr = [1, 2, 3];
delete arr[1];
arr.length              // 3 (unchanged, even though hole created)
arr                     // [1, empty, 3]

// Setting property beyond current length extends array
let arr = [];
arr[10] = 'ten';
arr.length              // 11

// But setting non-integer indices doesn't extend length
let arr = [1, 2, 3];
arr['myKey'] = 'value';
arr.length              // 3 (unchanged)
// myKey is a property, not an element
```

**Best Practices:**

```javascript
// ✓ Use length to iterate
for (let i = 0; i < arr.length; i++) {
  console.log(arr[i]);
}

// ✓ Clear array by setting length to 0
arr.length = 0;

// ✓ Trim array by decreasing length
arr.length = 5;

// ✗ Don't rely on length after modification in loop
for (let i = 0; i < arr.length; i++) {  // Risky if arr modified
  arr.push('item');
}

// ✓ Cache length if modifying
let len = arr.length;
for (let i = 0; i < len; i++) {
  // Now safe to modify arr
}

// ✓ Use length to convert array-like to array
function myFunc() {
  let args = [];
  for (let i = 0; i < arguments.length; i++) {
    args[i] = arguments[i];
  }
  return args;
}

// Or use spread/Array.from (modern)
function myFunc(...args) {  // Already array
  return args;
}
```

---

### 7.1.4 Sparse Arrays

A **sparse array** is an array with "holes" - positions that don't contain values. This is a unique JavaScript feature that can lead to unexpected behavior.

**Creating Sparse Arrays:**

```javascript
// Array literals with missing elements
[1, , 3]                    // [1, empty, 3]
[, , ,]                     // [empty × 3]
[1, 2, 3, ]                 // [1, 2, 3] (trailing comma doesn't create hole)
[1, , , , 5]                // [1, empty × 3, 5]

// Using Array constructor
new Array(5)                // [empty × 5]
new Array(3)                // [empty × 3]

// Increasing length
let arr = [1, 2];
arr.length = 5;
arr                         // [1, 2, empty × 3]

// Deleting elements
let arr = [1, 2, 3, 4, 5];
delete arr[2];
arr                         // [1, 2, empty, 4, 5]
arr.length                  // 5 (unchanged)

// Adding element beyond current indices
let arr = [1, 2];
arr[5] = 'five';
arr                         // [1, 2, empty × 3, 'five']

// Mixed with undefined values
let arr = [1, undefined, 3];  // Has value undefined (not hole)
arr                           // [1, undefined, 3]
```

**Distinguishing Holes from undefined Values:**

```javascript
// Hole vs undefined
let sparse = [1, , 3];              // Hole at index 1
let withUndefined = [1, undefined, 3];  // Value undefined at index 1

// Accessing both looks the same
sparse[1]                   // undefined
withUndefined[1]            // undefined

// But they're different internally
sparse.hasOwnProperty(1)    // false (hole has no property)
withUndefined.hasOwnProperty(1)  // true (has property with undefined value)

// Object.getOwnPropertyDescriptor shows the difference
Object.getOwnPropertyDescriptor(sparse, 1)      // undefined (no descriptor)
Object.getOwnPropertyDescriptor(withUndefined, 1)  // { value: undefined, ... }

// Or checking directly
1 in sparse                 // false (hole)
1 in withUndefined          // true (property exists)

// for...in skips holes
for (let i in sparse) {
  console.log(i);          // Logs 0, 2 (not 1)
}

// for...in also logs non-integer keys
let arr = [1, 2, 3];
arr.myProp = 'value';
for (let i in arr) {
  console.log(i);          // Logs 0, 1, 2, myProp
}
```

**How Methods Handle Sparse Arrays:**

```javascript
// Most iteration methods SKIP holes
let sparse = [1, , 3];

// forEach skips holes
sparse.forEach((x, i) => console.log(i, x));  // Logs: 0 1, 2 3

// map skips holes but preserves them in result
let result = sparse.map(x => x * 2);
result                      // [2, empty, 6] - hole preserved!

// filter skips holes and creates dense array
let result = sparse.filter(x => true);
result                      // [1, 3] - dense

// reduce skips holes
let sum = sparse.reduce((acc, x) => acc + x, 0);  // 1 + 3 = 4 (not 0 + 1 + undefined + 3)

// some/every skip holes
sparse.some(x => x > 2)     // true (3 > 2)
sparse.every(x => x > 0)    // true (only checks 1 and 3)

// find skips holes
sparse.find(x => x > 2)     // 3

// indexOf/lastIndexOf skip holes
sparse.indexOf(undefined)   // -1 (not found because hole, not undefined value)

// for loop includes holes
for (let i = 0; i < sparse.length; i++) {
  console.log(sparse[i]);  // Logs: 1, undefined (hole), 3
}

// for...of skips holes (uses iterator)
for (let x of sparse) {
  console.log(x);         // Logs: 1, 3
}

// Spread converts holes to undefined
[...sparse]               // [1, undefined, 3]

// Array.from converts holes to undefined
Array.from(sparse)        // [1, undefined, 3]

// keys() includes holes
[...sparse.keys()]        // [0, 1, 2]

// values() skips holes
[...sparse.values()]      // [1, 3]

// entries() skips holes
[...sparse.entries()]     // [[0, 1], [2, 3]]
```

**Sparse Array Gotchas:**

```javascript
// Sparse arrays can confuse logic
let arr = [1, , 3];
arr.length                  // 3
arr.filter(x => true).length // 2 (holes removed!)

// Joined string with holes uses empty string
[1, , 3].join(',')          // "1,,3" - hole becomes empty string

// But join with hole in String context
let arr = [1, , 3];
String(arr)                 // "1,,3"
arr.toString()              // "1,,3"

// Comparing arrays with holes
[1, , 3] === [1, undefined, 3]  // false (different arrays)
// But behavior can seem similar in some cases

// slice() preserves holes
let sparse = [1, , 3];
sparse.slice(0, 2)          // [1, empty] - hole preserved

// concat() preserves holes
[].concat(sparse)           // [1, empty, 3]

// flat() removes holes
let arr = [1, , 3];
arr.flat()                  // [1, 3] - hole gone!

// fill() fills holes too
let arr = new Array(3);
arr.fill(0);
arr                         // [0, 0, 0]

// sort() keeps holes
let sparse = [3, , 1];
sparse.sort();
sparse                      // [1, empty, 3] - hole remains

// reverse() keeps holes
let sparse = [3, , 1];
sparse.reverse();
sparse                      // [1, empty, 3] - hole remains
```

**Creating and Removing Sparse Arrays:**

```javascript
// Create sparse array
let sparse = [1, , , 4];

// Convert to dense (remove holes)
let dense1 = sparse.filter(x => true);
let dense2 = sparse.flat();
let dense3 = Array.from(sparse);
let dense4 = [...sparse].map((x, i) => x ?? i);  // Replace holes with index

// Visualizing sparse vs dense
sparse                      // [1, empty × 2, 4]
dense1                      // [1, 4]
dense2                      // [1, 4]

// Create holes intentionally
let arr = [1, 2, 3];
delete arr[1];
arr                         // [1, empty, 3]

// Remove holes by re-assigning
let arr = [1, , 3];
arr = Array.from(arr);  // [1, undefined, 3]
// Or
arr = [...arr];          // [1, undefined, 3]
```

**Performance Implications:**

```javascript
// Sparse arrays can have performance implications
// Engines may optimize dense arrays better

// Dense arrays (better performance)
let dense = [1, 2, 3, 4, 5];

// Sparse arrays (potentially slower)
let sparse = [1, , , , 5];

// For iteration-heavy code, sparse arrays may be slower
// For large arrays with few elements, sparse might save memory
// But modern engines optimize for this

// Rule of thumb: avoid intentional sparse arrays unless you have specific reason
```

**Best Practices:**

```javascript
// ✗ Don't intentionally create sparse arrays
let sparse = [1, , 3];      // Confusing

// ✓ Use undefined if you need empty values
let arr = [1, undefined, 3];

// ✓ Remove holes when working with sparse arrays
let sparse = [1, , 3];
let dense = Array.from(sparse);  // [1, undefined, 3]

// ✓ Be aware of method behavior with sparse arrays
let sparse = [1, , 3];
sparse.map(x => x * 2)      // [2, empty, 6] - maps preserve holes
Array.from(sparse.map(x => x * 2))  // [2, undefined, 6] - conversion removes holes

// ✓ Use consistent array structure
// Either dense with explicit values
let arr = [1, null, 3];
// Or proper sparse handling
let sparse = new Array(10).fill(null);

// ✗ Don't rely on sparse array behavior for logic
// It's confusing and error-prone
```

---

### 7.1.5 Array-like Objects

An **array-like object** is an object that has some array characteristics but is not actually an Array. It has numeric indices and a `length` property.

**Identifying Array-like Objects:**

```javascript
// Array-like object structure
let arrayLike = {
  0: 'first',
  1: 'second',
  2: 'third',
  length: 3
};

// Not an actual array
Array.isArray(arrayLike)    // false
arrayLike instanceof Array  // false
typeof arrayLike            // "object"

// But has array-like properties
arrayLike[0]                // 'first'
arrayLike[1]                // 'second'
arrayLike.length            // 3

// Can iterate like array
for (let i = 0; i < arrayLike.length; i++) {
  console.log(arrayLike[i]);
}

// Cannot use array methods (they don't exist)
arrayLike.map(x => x.toUpperCase())  // TypeError: arrayLike.map is not a function
arrayLike.filter(x => true)          // TypeError
arrayLike.forEach(x => console.log(x))  // TypeError
```

**Common Array-like Objects:**

```javascript
// 1. Function arguments (before rest parameters)
function myFunc() {
  console.log(arguments);       // Array-like object
  console.log(typeof arguments);  // "object"
  console.log(Array.isArray(arguments));  // false
  console.log(arguments.length);  // Number of arguments
}

myFunc('a', 'b', 'c');
// arguments = { 0: 'a', 1: 'b', 2: 'c', length: 3 }

// 2. DOM NodeList
let nodes = document.querySelectorAll('div');
console.log(nodes.length);  // Number of divs
// nodes[0] is first div
// But querySelector returns NodeList, not Array

// 3. DOM HTMLCollection
let divs = document.getElementsByTagName('div');
// Also array-like

// 4. String (indexed by character)
let str = "hello";
str[0]                      // 'h'
str.length                  // 5
// Strings behave like arrays of characters

// 5. Custom array-like objects
let custom = {
  '0': { name: 'Alice', age: 30 },
  '1': { name: 'Bob', age: 25 },
  length: 2
};

// 6. Typed arrays (actually are arrays though)
let typed = new Uint8Array([1, 2, 3, 4]);
Array.isArray(typed)        // false (not an Array)
typed.length                // 4 (but has array methods)
typed[0]                    // 1
```

**Working with Array-like Objects:**

```javascript
// Using array-like in for loop
let arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };

for (let i = 0; i < arrayLike.length; i++) {
  console.log(arrayLike[i]);  // Works
}

// Using indexed access
arrayLike[0]                // 'a'
arrayLike[1]                // 'b'

// Checking length
if (arrayLike.length > 0) {
  let first = arrayLike[0];
}

// But can't use array methods
arrayLike.slice(0, 2);      // TypeError
arrayLike.map(x => x.toUpperCase());  // TypeError
arrayLike.includes('a');    // TypeError
```

**Converting Array-like to Array:**

```javascript
// Method 1: Array.from() (modern, preferred)
let arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
let arr = Array.from(arrayLike);
// arr = ['a', 'b', 'c']

// Method 2: Spread operator (ES6+)
let arr = [...arrayLike];  // ['a', 'b', 'c']

// Method 3: Array.prototype.slice.call() (old way)
let arr = Array.prototype.slice.call(arrayLike);
// or
let arr = [].slice.call(arrayLike);

// Method 4: Manual loop
let arr = [];
for (let i = 0; i < arrayLike.length; i++) {
  arr.push(arrayLike[i]);
}

// With arguments object
function myFunc(a, b, c) {
  // Old way: convert arguments to array
  let args = Array.from(arguments);
  // or
  let args = [...arguments];
  // or
  let args = Array.prototype.slice.call(arguments);
  
  // Modern way: use rest parameters (no conversion needed)
  // function myFunc(...args) { }
}

// With DOM NodeList
let nodes = document.querySelectorAll('div');
let arr = Array.from(nodes);  // Convert to array
let arr = [...nodes];          // Also works

// With string
let str = "hello";
let chars = Array.from(str);  // ['h', 'e', 'l', 'l', 'o']
let chars = [...str];          // Same
```

**Converting with Mapping:**

```javascript
// Array.from with mapping function
let arrayLike = { 0: 1, 1: 2, 2: 3, length: 3 };
let arr = Array.from(arrayLike, x => x * 2);
// arr = [2, 4, 6]

// With index
let arr = Array.from(arrayLike, (x, i) => `Item ${i}: ${x}`);
// arr = ['Item 0: 1', 'Item 1: 2', 'Item 2: 3']

// String conversion with mapping
let str = "abc";
let arr = Array.from(str, char => char.toUpperCase());
// arr = ['A', 'B', 'C']

// Spread doesn't have mapping, but can combine with map
let arr = [...arrayLike].map(x => x * 2);
// Same result as Array.from with mapper
```

**Function arguments (Old Pattern vs Modern):**

```javascript
// Old pattern: always had to convert arguments
function sum() {
  let args = Array.from(arguments);
  return args.reduce((a, b) => a + b, 0);
}

// Or using the arguments object directly
function sum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// Modern pattern: rest parameters (no conversion)
function sum(...args) {
  return args.reduce((a, b) => a + b, 0);
}

// Rest parameters are actual arrays
sum(1, 2, 3);              // 6
// args = [1, 2, 3] - already an array

// arguments vs rest
function test(a, b) {
  console.log(arguments);    // Arguments object
  console.log(a, b);         // Named parameters
}
// With rest:
function test(...args) {
  console.log(args);         // Array [a, b]
}

// arguments is deprecated in favor of rest parameters
```

**Array-like Gotchas:**

```javascript
// Not all objects with length are array-like for methods
let obj = { 0: 'a', 1: 'b', length: 2 };
Array.from(obj)             // ['a', 'b'] - works

// But Typed arrays have different behavior
let typed = new Uint8Array([1, 2, 3]);
Array.from(typed)           // [1, 2, 3] - works
[...typed]                  // [1, 2, 3] - works
// Typed arrays are iterable and array-like

// String is array-like but immutable
let str = "hello";
str[0]                      // 'h' - can read
str[0] = 'H';               // Doesn't change string
str                         // "hello" - unchanged

// Not all array methods work on array-like even when converted
let arrayLike = { 0: 'a', 1: 'b', length: 2 };
arrayLike.forEach(x => console.log(x));  // Error: not a function

// Must convert first
Array.from(arrayLike).forEach(x => console.log(x));  // Works

// Missing length property breaks conversion
let notArrayLike = { 0: 'a', 1: 'b' };  // No length
Array.from(notArrayLike)    // [] - empty because no length property

// toString on array-like
let arrayLike = { 0: 'a', 1: 'b', length: 2 };
String(arrayLike)           // "[object Object]"
Array.from(arrayLike).toString()  // "a,b"
```

**Best Practices:**

```javascript
// ✓ Use Array.from() to convert array-like
let nodes = document.querySelectorAll('div');
let arr = Array.from(nodes);

// ✓ Use spread operator for converting
let arr = [...nodes];

// ✓ Use rest parameters in functions (modern)
function myFunc(...args) {
  // args is already array
  args.forEach(arg => console.log(arg));
}

// ✗ Avoid the old arguments object
function myFunc() {
  // Don't use arguments, use rest instead
}

// ✓ Map while converting
let nodes = document.querySelectorAll('div');
let texts = Array.from(nodes, div => div.textContent);

// ✗ Don't try to use array methods on array-like
let arrayLike = { 0: 'a', 1: 'b', length: 2 };
arrayLike.map(x => x.toUpperCase());  // Error

// ✓ Always check Array.isArray() if unsure
if (Array.isArray(value)) {
  // Can use array methods
} else if (typeof value === 'object' && typeof value.length === 'number') {
  // Might be array-like
  let arr = Array.from(value);
}
```

---

### 7.1.6 Converting Array-like to Arrays

We've covered the basics, so let's go deeper into practical conversion patterns and edge cases.

**Conversion Methods Comparison:**

```javascript
// Given array-like object
let arrayLike = {
  '0': 'first',
  '1': 'second',
  '2': 'third',
  length: 3
};

// Method 1: Array.from() - modern, recommended
let arr1 = Array.from(arrayLike);
// ['first', 'second', 'third']

// Method 2: Spread operator
let arr2 = [...arrayLike];
// ['first', 'second', 'third']

// Method 3: slice.call()
let arr3 = Array.prototype.slice.call(arrayLike);
// ['first', 'second', 'third']

// Method 4: forEach.call()
let arr4 = [];
Array.prototype.forEach.call(arrayLike, (item, index) => {
  arr4[index] = item;
});
// ['first', 'second', 'third']

// All produce the same result, but different benefits
```

**Performance Comparison:**

```javascript
// Array.from() - modern, optimized in engines
Array.from(arrayLike);      // Good performance

// Spread - syntactic sugar, same as Array.from internally
[...arrayLike];             // Similar performance

// slice.call() - older, still works but less optimized
Array.prototype.slice.call(arrayLike);  // Slightly slower

// Manual loop - explicit, but verbose
let arr = [];
for (let i = 0; i < arrayLike.length; i++) {
  arr[i] = arrayLike[i];
}  // Good performance, but more code

// For large arrays, performance matters little for practical purposes
// Choose for readability first
```

**With arguments Object:**

```javascript
// Convert arguments to array
function process() {
  // Modern way with rest parameters (best)
  // No conversion needed
}

function process(...args) {
  // args is already array
  args.map(x => x.toUpperCase());  // Works
}

// If using arguments object (old code)
function process() {
  let args = Array.from(arguments);
  // or
  let args = [...arguments];
  // or
  let args = Array.prototype.slice.call(arguments);
  
  args.map(x => x.toUpperCase());  // Now works
}

// arguments vs rest detailed
function test(a, b, c) {
  console.log(arguments);    // { 0: a, 1: b, 2: c, length: 3 }
  console.log(arguments[0]); // a
  console.log(arguments.length);  // 3
  
  // arguments also has: callee (function itself - deprecated), caller
}

function test(...args) {
  console.log(args);         // [a, b, c]
  // args is regular array
  // no callee or caller
}

// Mixing rest with regular parameters
function process(first, second, ...rest) {
  console.log(first);        // first arg
  console.log(second);       // second arg
  console.log(rest);         // [remaining args]
}

process(1, 2, 3, 4, 5);
// first = 1, second = 2, rest = [3, 4, 5]
```

**With DOM Objects:**

```javascript
// NodeList from querySelectorAll
let nodes = document.querySelectorAll('div');
let arr1 = Array.from(nodes);  // Convert to array
let arr2 = [...nodes];          // Also works

// HTMLCollection from getElementsByTagName
let divs = document.getElementsByTagName('div');
let arr3 = Array.from(divs);   // Convert

// Why convert?
// NodeList: forEach works, but not map, filter, reduce
// Converting to array: all methods work

// With conversion
let arr = Array.from(document.querySelectorAll('.item'));
let texts = arr.map(el => el.textContent);
let filtered = arr.filter(el => el.classList.contains('active'));

// Without conversion (requires Array methods called on NodeList's prototype)
let nodes = document.querySelectorAll('.item');
let texts = Array.from(nodes).map(el => el.textContent);  // Must convert first

// Practical example
// Get all paragraphs and convert their text to uppercase
let paragraphs = document.querySelectorAll('p');
let texts = Array.from(paragraphs).map(p => p.textContent.toUpperCase());

// Get all inputs and get their values
let inputs = document.querySelectorAll('input');
let values = Array.from(inputs).map(input => input.value);

// Get all elements with data-id and convert to object
let elements = document.querySelectorAll('[data-id]');
let ids = Array.from(elements).map(el => ({
  id: el.dataset.id,
  text: el.textContent
}));
```

**String Conversion:**

```javascript
// String is iterable, can convert to array of characters
let str = "hello";

// Spread operator
let arr1 = [...str];         // ['h', 'e', 'l', 'l', 'o']

// Array.from
let arr2 = Array.from(str);  // ['h', 'e', 'l', 'l', 'o']

// split (specific for strings)
let arr3 = str.split('');    // ['h', 'e', 'l', 'l', 'o']

// With Unicode (code point handling)
let emoji = '😀';
emoji.split('');            // ['\\uD83D', '\\uDE00'] - splits surrogates wrong
[...emoji];                 // ['😀'] - correct!
Array.from(emoji);          // ['😀'] - correct!

// Getting unique characters
let chars = [...new Set('hello world')];  // ['h', 'e', 'l', 'o', ' ', 'w', 'r', 'd']

// Converting with map
let str = 'abc';
let upper = Array.from(str, c => c.toUpperCase());  // ['A', 'B', 'C']

// Or with spread and map
let upper = [...str].map(c => c.toUpperCase());     // ['A', 'B', 'C']
```

**Set and Map Conversion:**

```javascript
// Set to array
let set = new Set([1, 2, 3, 2, 1]);
let arr1 = Array.from(set);  // [1, 2, 3]
let arr2 = [...set];         // [1, 2, 3]

// Map to array of entries
let map = new Map([['a', 1], ['b', 2]]);
let arr3 = Array.from(map);  // [['a', 1], ['b', 2]]
let arr4 = [...map];         // [['a', 1], ['b', 2]]

// Map keys to array
let keys = Array.from(map.keys());  // ['a', 'b']
let keys = [...map.keys()];         // ['a', 'b']

// Map values to array
let values = Array.from(map.values());  // [1, 2]
let values = [...map.values()];         // [1, 2]

// Practical example: deduplicate array
let arr = [1, 2, 2, 3, 3, 3];
let unique = [...new Set(arr)];  // [1, 2, 3]
```

**Custom Iterable Objects:**

```javascript
// Create array-like but iterable object
let custom = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  
  // Make it iterable (optional)
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.length) {
          return { value: this[index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

// Convert to array
let arr1 = Array.from(custom);  // ['a', 'b', 'c']
let arr2 = [...custom];         // ['a', 'b', 'c'] - requires [Symbol.iterator]

// Typed array conversion
let typed = new Uint8Array([1, 2, 3, 4]);
let arr3 = Array.from(typed);   // [1, 2, 3, 4]
let arr4 = [...typed];          // [1, 2, 3, 4]

// Converting typed array with mapping
let arr5 = Array.from(typed, x => x * 2);  // [2, 4, 6, 8]
```

**Conversion with Transformation:**

```javascript
// Array.from with mapping function (most efficient)
let arrayLike = { 0: 1, 1: 2, 2: 3, length: 3 };
let doubled = Array.from(arrayLike, x => x * 2);  // [2, 4, 6]

// Spreads don't have mapping, but can chain
let doubled = [...arrayLike].map(x => x * 2);     // [2, 4, 6]

// With index and thisArg
let mapped = Array.from(
  arrayLike,
  function(value, index) {
    return value + this.offset;
  },
  { offset: 10 }
);
// [11, 12, 13]

// Complex example: NodeList to specific data
let nodes = document.querySelectorAll('[data-id]');
let data = Array.from(nodes, node => ({
  id: node.dataset.id,
  text: node.textContent,
  className: node.className
}));
```

**Edge Cases:**

```javascript
// Sparse arrays in array-like
let sparse = new Array(5);
sparse[0] = 'a';
sparse[2] = 'c';
// sparse = [a, empty, c, empty, empty]

let arr = Array.from(sparse);
// [a, undefined, c, undefined, undefined] - holes become undefined

let arr = [...sparse];
// [a, undefined, c, undefined, undefined] - same

// Holes in nested structures
let nested = {
  0: { value: 1 },
  2: { value: 3 },
  length: 3
};

let arr = Array.from(nested);
// [{ value: 1 }, undefined, { value: 3 }]

// Negative indices (not treated as array indices)
let obj = {
  '0': 'a',
  '1': 'b',
  '-1': 'negative',
  length: 2
};

let arr = Array.from(obj);
// ['a', 'b'] - negative index ignored
obj['-1']  // 'negative' exists as property but not used
```

**Best Practices:**

```javascript
// ✓ Use Array.from() for conversions
let arr = Array.from(arrayLike);

// ✓ Use spread when convenient
let arr = [...arrayLike];

// ✓ Use rest parameters in functions
function process(...args) { }

// ✓ Include mapping if available
let doubled = Array.from(arrayLike, x => x * 2);

// ✗ Avoid old Array.prototype.slice.call()
let arr = Array.prototype.slice.call(arrayLike);

// ✗ Avoid complex arguments object code
function process() {
  let args = Array.from(arguments);  // Instead use rest
}

// ✓ Be aware of hole conversion
let arr = Array.from(sparse);  // Holes become undefined

// ✓ Use appropriate method based on source
// - Strings: [...str] or Array.from()
// - DOM: Array.from(nodes)
// - Iterables: [...iterable]
// - Arguments: rest parameters
```
## 7.2 Array Methods (Mutating)

**Mutating methods** are array methods that modify the original array in place, changing its structure or elements. This section covers the most important mutation methods and their gotchas.

---

### 7.2.1 push() and pop()

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

### 7.2.2 shift() and unshift()

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

### 7.2.3 splice()

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

### 7.2.4 sort()

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

### 7.2.5 reverse()

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

### 7.2.6 fill()

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

### 7.2.7 copyWithin()

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
## 7.3 Array Methods (Non-mutating)

**Non-mutating methods** return a new array or value without modifying the original array. This is a fundamental principle of functional programming and makes code more predictable.

---

### 7.3.1 concat()

**concat()** returns a new array by merging multiple arrays or values with the original array.

```javascript
// Basic concatenation
let arr1 = [1, 2];
let arr2 = [3, 4];
let result = arr1.concat(arr2);
result                      // [1, 2, 3, 4]
arr1                        // [1, 2] - unchanged
arr2                        // [3, 4] - unchanged

// Multiple arrays
let result = [1, 2].concat([3, 4], [5, 6]);
result                      // [1, 2, 3, 4, 5, 6]

// Mix arrays and values
let result = [1, 2].concat(3, 4, [5, 6]);
result                      // [1, 2, 3, 4, 5, 6]

// No arguments
let arr = [1, 2, 3];
let copy = arr.concat();    // [1, 2, 3] - shallow copy

// Flattening one level
let nested = [[1, 2], [3, 4]];
let flat = [].concat(...nested);  // [1, 2, 3, 4]

// Sparse arrays preserved (as holes)
let sparse = [1, , 3];
let result = sparse.concat([4, 5]);
result                      // [1, empty, 3, 4, 5]

// Strings are NOT spread
let result = [1, 2].concat('abc');
result                      // [1, 2, 'abc'] - not [1, 2, 'a', 'b', 'c']

// Objects with array-like structure
let arrayLike = { 0: 'a', 1: 'b', length: 2 };
let result = [].concat(arrayLike);
result                      // [{ 0: 'a', 1: 'b', length: 2 }] - not spread!

// Objects with [Symbol.isConcatSpreadable]
let obj = {
  [Symbol.isConcatSpreadable]: true,
  0: 'a',
  1: 'b',
  length: 2
};
let result = [].concat(obj);
result                      // ['a', 'b'] - spread because of symbol

// Shallow copy behavior
let arr = [{ name: 'Alice' }, { name: 'Bob' }];
let copy = arr.concat();
copy[0].name = 'Charlie';
arr[0].name                 // 'Charlie' - objects still referenced!

// Check if something concatenates
let arr1 = [1, 2];
arr1 = arr1.concat(3);      // [1, 2, 3]
arr1 = arr1.concat([4, 5]); // [1, 2, 3, 4, 5]
```

**Spread vs concat():**

```javascript
// Spread operator (modern, preferred)
let result = [...arr1, ...arr2];

// concat (older)
let result = arr1.concat(arr2);

// concat can mix values and arrays
let result = [1, 2].concat(3, [4, 5], 6);  // [1, 2, 3, 4, 5, 6]

// With spread, must group
let result = [1, 2, 3, ...[4, 5], 6];      // [1, 2, 3, 4, 5, 6]

// Functional composition
let joinArrays = (a, b) => a.concat(b);
let arr1 = [1, 2];
let arr2 = [3, 4];
let result = [arr1, arr2].reduce(joinArrays);  // [1, 2, 3, 4]

// Or with spread
let result = [arr1, arr2].reduce((a, b) => [...a, ...b]);
```

---

### 7.3.2 slice()

**slice()** returns a shallow copy of a portion of an array as a new array object.

```javascript
// Extract portion
let arr = [1, 2, 3, 4, 5];
let slice1 = arr.slice(1, 3);   // From 1 to before 3
slice1                      // [2, 3]

// From start
let slice2 = arr.slice(2);      // From 2 to end
slice2                      // [3, 4, 5]

// From beginning
let slice3 = arr.slice(0);      // Copy entire array
slice3                      // [1, 2, 3, 4, 5]

// Negative indices
let arr = [1, 2, 3, 4, 5];
let slice1 = arr.slice(-2);     // Last 2 elements
slice1                      // [4, 5]

let slice2 = arr.slice(-3, -1); // From -3 to before -1
slice2                      // [3, 4]

// Slice from end
let slice3 = arr.slice(-1);
slice3                      // [5]

// No arguments
let arr = [1, 2, 3];
let copy = arr.slice();     // [1, 2, 3] - shallow copy

// Start beyond length
let arr = [1, 2, 3];
let slice = arr.slice(10);
slice                       // [] - empty

// Negative start greater than length
let arr = [1, 2, 3];
let slice = arr.slice(-10);
slice                       // [1, 2, 3] - entire array

// Sparse arrays
let sparse = [1, , 3, , 5];
let slice = sparse.slice(1, 4);
slice                       // [empty, 3, empty] - holes preserved

// Shallow copy
let arr = [{ id: 1 }, { id: 2 }];
let copy = arr.slice();
copy[0].id = 99;
arr[0].id                   // 99 - objects shared!

// Convert array-like to array (alternative to Array.from)
function myFunc() {
  let args = Array.prototype.slice.call(arguments);
  return args;
}

myFunc('a', 'b', 'c');      // ['a', 'b', 'c']

// With strings
let str = 'hello';
let arr = str.slice(1, 4);  // 'ell'
// slice works on strings too, but returns string not array

// Get last N elements
function getLastN(arr, n) {
  return arr.slice(-n);
}

getLastN([1, 2, 3, 4, 5], 2);  // [4, 5]

// Get all but last N
function getAllButLastN(arr, n) {
  return arr.slice(0, -n);
}

getAllButLastN([1, 2, 3, 4, 5], 2);  // [1, 2, 3]

// Removing elements without mutation
let arr = [1, 2, 3, 4, 5];
let without3 = arr.slice(0, 2).concat(arr.slice(3));
without3                    // [1, 2, 4, 5]

// Or with spread
let without3 = [...arr.slice(0, 2), ...arr.slice(3)];

// Clone array at point in time
let original = [1, 2, 3];
let snapshot = original.slice();
original.push(4);
snapshot                    // [1, 2, 3] - unchanged
```

---

### 7.3.3 join()

**join()** joins all elements of an array into a single string.

```javascript
// Default separator
let arr = ['a', 'b', 'c'];
let str = arr.join();       // "a,b,c" - default comma

// Custom separator
let arr = ['a', 'b', 'c'];
let str = arr.join('-');    // "a-b-c"

let str = arr.join('');     // "abc"
let str = arr.join(' ');    // "a b c"

// Single element
let arr = ['hello'];
let str = arr.join();       // "hello"

// Empty array
let arr = [];
let str = arr.join();       // ""

// With numbers (converted to strings)
let arr = [1, 2, 3];
let str = arr.join(':');    // "1:2:3"

// With nullish values
let arr = [1, null, 3, undefined, 5];
let str = arr.join('-');    // "1--3--5" - nullish become empty strings

// Sparse arrays (holes become empty string)
let sparse = [1, , 3];
let str = sparse.join('-');
str                         // "1--3" - hole is empty string

// No extra spaces added
let arr = ['a', 'b', 'c'];
let str = arr.join(' , ');  // "a , b , c"

// Template strings (modern alternative)
let arr = [1, 2, 3];
let str = `${arr[0]}-${arr[1]}-${arr[2]}`;  // "1-2-3"
// But not as readable for variable arrays

// CSV format
let records = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 }
];

let csv = [
  'name,age',
  ...records.map(r => `${r.name},${r.age}`)
].join('\n');
// name,age\nAlice,30\nBob,25

// Nested arrays (calls toString on inner arrays)
let nested = [[1, 2], [3, 4]];
let str = nested.join('-');
str                         // "1,2-3,4" - inner arrays joined with comma

// Reversing characters
function reverseString(str) {
  return str.split('').reverse().join('');
}

reverseString('hello');     // 'olleh'

// Palindrome check
function isPalindrome(str) {
  let clean = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  let reversed = clean.split('').reverse().join('');
  return clean === reversed;
}

isPalindrome('racecar');    // true

// HTML generation
let items = ['Apple', 'Banana', 'Cherry'];
let html = '<li>' + items.join('</li><li>') + '</li>';
// <li>Apple</li><li>Banana</li><li>Cherry</li>

// Or better with template
let html = items.map(item => `<li>${item}</li>`).join('');

// Path joining (but use path.join in Node.js)
let parts = ['home', 'user', 'documents'];
let path = parts.join('/');
// '/home/user/documents'

// Custom joining function
function customJoin(arr, separator, transform) {
  return arr.map(x => transform ? transform(x) : x).join(separator);
}

customJoin([1, 2, 3], '-', x => x * 2);  // "2-4-6"
```

---

### 7.3.4 indexOf() and lastIndexOf()

**indexOf()** returns the first index at which an element can be found, or -1 if not present.

**lastIndexOf()** returns the last index of an element.

```javascript
// Find first index
let arr = ['a', 'b', 'c', 'b', 'd'];
let index = arr.indexOf('b');
index                       // 1

// Not found
let index = arr.indexOf('z');
index                       // -1

// Start from index
let arr = [1, 2, 3, 2, 1];
let index = arr.indexOf(2, 2);  // Start searching from index 2
index                       // 3

// Find last index
let arr = ['a', 'b', 'c', 'b', 'd'];
let index = arr.lastIndexOf('b');
index                       // 3

// Last occurrence with start index (search backwards)
let arr = [1, 2, 3, 2, 1];
let index = arr.lastIndexOf(2, 2);  // Search backwards from index 2
index                       // 1

// Strict equality (===)
let arr = [1, '1', 2];
arr.indexOf(1);             // 0
arr.indexOf('1');           // 1
arr.indexOf(true);          // -1 (true != 1 with strict equality)

// With objects (reference equality)
let obj1 = { name: 'Alice' };
let obj2 = { name: 'Alice' };
let arr = [obj1, obj2];
arr.indexOf(obj1);          // 0 - found
arr.indexOf(obj2);          // -1 - not found (different object)
arr.indexOf({ name: 'Alice' });  // -1 - new object

// With NaN (special case!)
let arr = [1, 2, NaN, 4];
arr.indexOf(NaN);           // -1 (NaN !== NaN)
arr.lastIndexOf(NaN);       // -1 (NaN !== NaN)

// Sparse arrays skip holes
let sparse = [1, , 3, , 5];
sparse.indexOf(undefined);  // -1 (holes are not undefined values)

// Conditional search - need filter
let arr = [1, 2, 3, 4, 5];
// Get all indices where element > 2
let indices = arr
  .map((x, i) => x > 2 ? i : -1)
  .filter(i => i >= 0);
indices                     // [2, 3, 4]

// Check if element exists
let arr = ['apple', 'banana', 'cherry'];
if (arr.indexOf('banana') !== -1) {
  console.log('Found');
}

// Or use includes (ES6+)
if (arr.includes('banana')) {
  console.log('Found');
}

// Find index of minimum value
let arr = [3, 1, 4, 1, 5];
let minValue = Math.min(...arr);
let minIndex = arr.indexOf(minValue);
minIndex                    // 1

// Find first even number
let arr = [1, 3, 4, 5, 6];
let firstEvenIndex = arr.findIndex(x => x % 2 === 0);
firstEvenIndex              // 2 (not indexOf)

// Get all indices of value
function getIndices(arr, value) {
  let indices = [];
  let index = arr.indexOf(value);
  while (index !== -1) {
    indices.push(index);
    index = arr.indexOf(value, index + 1);
  }
  return indices;
}

getIndices([1, 2, 3, 2, 1], 2);  // [1, 3]

// Or with map/filter
function getIndices(arr, value) {
  return arr
    .map((x, i) => x === value ? i : -1)
    .filter(i => i !== -1);
}

// Remove all occurrences
function removeAll(arr, value) {
  let index;
  while ((index = arr.indexOf(value)) !== -1) {
    arr.splice(index, 1);
  }
  return arr;
}

removeAll([1, 2, 3, 2, 1], 2);  // [1, 3, 1]

// Or non-mutating
function removeAll(arr, value) {
  return arr.filter(x => x !== value);
}
```

---

### 7.3.5 includes()

**includes()** determines whether an array includes a certain element, returning true or false.

```javascript
// Basic check
let arr = [1, 2, 3, 4, 5];
arr.includes(3);            // true
arr.includes(6);            // false

// With strings
let fruits = ['apple', 'banana', 'cherry'];
fruits.includes('banana');  // true

// Start from index
let arr = [1, 2, 3, 2, 1];
arr.includes(2, 3);         // true (search from index 3)
arr.includes(1, 1);         // true (search from index 1)
arr.includes(3, 3);         // false (3 is not at or after index 3)

// Negative start index
let arr = [1, 2, 3, 4, 5];
arr.includes(4, -2);        // true (search last 2 elements)
arr.includes(1, -2);        // false (1 is not in last 2 elements)

// With NaN (unlike indexOf)
let arr = [1, 2, NaN, 4];
arr.includes(NaN);          // true (NaN === NaN for includes!)

// Note the difference from indexOf
arr.indexOf(NaN);           // -1
arr.includes(NaN);          // true

// Strict equality (===)
let arr = [1, '1', true];
arr.includes(1);            // true
arr.includes('1');          // true
arr.includes(true);         // true (but only because of coercion)
arr.includes(1, 0);         // true (exact match)

// With objects
let obj = { id: 1 };
let arr = [obj];
arr.includes(obj);          // true (same reference)
arr.includes({ id: 1 });    // false (different object)

// Sparse arrays skip holes
let sparse = [1, , 3];
sparse.includes(undefined); // false (holes are not values)

// Checking multiple conditions
let status = 'active';
if (['active', 'pending', 'completed'].includes(status)) {
  console.log('Valid status');
}

// Validating options
const validOptions = ['small', 'medium', 'large'];
function getSize(size) {
  if (validOptions.includes(size)) {
    return size;
  }
  return 'medium';  // default
}

// Checking environment
const isDev = ['development', 'testing'].includes(process.env.NODE_ENV);

// Case-insensitive check
let arr = ['Apple', 'Banana', 'Cherry'];
let search = 'apple';
let found = arr.some(x => x.toLowerCase() === search.toLowerCase());
found                       // true

// Or with includes on lowercase
let lowerArr = arr.map(x => x.toLowerCase());
lowerArr.includes(search.toLowerCase());  // true

// Check if any element matches condition
let arr = [1, 2, 3, 4, 5];
// Check if any element is greater than 3
let hasGreaterThan3 = arr.some(x => x > 3);  // true (better than includes)

// Or with find
let hasGreaterThan3 = arr.find(x => x > 3) !== undefined;  // true

// Tag checking
let tags = ['javascript', 'typescript', 'nodejs'];
function hasTag(article, tag) {
  return article.tags.includes(tag);
}

// Permission checking
let userPermissions = ['read', 'write', 'admin'];
function canDelete(user) {
  return user.permissions.includes('admin') || user.permissions.includes('delete');
}

// Avoiding nested arrays for includes
let arr = [[1, 2], [3, 4]];
arr.includes([1, 2]);       // false (different array objects)

// For nested checks, use some
arr.some(subArr => subArr.includes(1));  // true

// Blacklist checking
const bannedWords = ['badword1', 'badword2'];
function isClean(text) {
  return !bannedWords.some(word => text.toLowerCase().includes(word));
}

// Note: includes vs indexOf
// includes: clearer intent, handles NaN correctly
// indexOf: can get position

// Prefer includes for existence check
arr.includes(value);        // ✓
arr.indexOf(value) !== -1;  // ✗ (verbose)
```

---

### 7.3.6 flat() and flatMap()

**flat()** creates a new array with all sub-array elements concatenated into it recursively up to the specified depth.

**flatMap()** maps each element using a mapping function, then flattens the result by one level.

```javascript
// Flatten one level
let nested = [[1, 2], [3, 4]];
let flat = nested.flat();
flat                        // [1, 2, 3, 4]

// Flatten multiple levels
let deep = [1, [2, [3, [4, 5]]]];
let flat1 = deep.flat();
flat1                       // [1, 2, [3, [4, 5]]]

let flat2 = deep.flat(2);
flat2                       // [1, 2, 3, [4, 5]]

let flat3 = deep.flat(3);
flat3                       // [1, 2, 3, 4, 5]

// Flatten completely
let flat = deep.flat(Infinity);
flat                        // [1, 2, 3, 4, 5]

// Removing holes
let sparse = [1, , 3, , [5, , 7]];
let flat = sparse.flat();
flat                        // [1, 3, 5, 7] - holes removed!

// flatMap - map then flatten by one level
let arr = [1, 2, 3];
let result = arr.flatMap(x => [x, x * 2]);
result                      // [1, 2, 2, 4, 3, 6]

// Single level flattening
let arr = [[1, 2], [3, 4]];
let result = arr.flatMap(x => x);
result                      // [1, 2, 3, 4]
// Same as flat(1)

// With conditional mapping
let arr = [1, 2, 3, 4, 5];
let result = arr.flatMap(x => x % 2 === 0 ? [x, x * 2] : []);
result                      // [2, 4, 4, 8] - only even numbers, with doubled

// Transforming then flattening
let people = [
  { name: 'Alice', hobbies: ['reading', 'coding'] },
  { name: 'Bob', hobbies: ['gaming', 'sports'] }
];

let allHobbies = people.flatMap(p => p.hobbies);
allHobbies                  // ['reading', 'coding', 'gaming', 'sports']

// Generating sequences
let ranges = [[1, 3], [5, 6], [8, 10]];
let expanded = ranges.flatMap(([start, end]) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});
expanded                    // [1, 2, 3, 5, 6, 8, 9, 10]

// Index in flatMap
let arr = ['a', 'b', 'c'];
let result = arr.flatMap((x, i) => [i, x]);
result                      // [0, 'a', 1, 'b', 2, 'c']

// This binding in flatMap
let result = arr.flatMap(function(x, i) {
  return [this.prefix + x];
}, { prefix: '> ' });
result                      // ['> a', '> b', '> c']

// Combining flat and map
let data = [
  { items: [1, 2, 3] },
  { items: [4, 5] },
  { items: [6] }
];

// Approach 1: flatMap
let all = data.flatMap(d => d.items);

// Approach 2: map then flat
let all = data.map(d => d.items).flat();

// Both give [1, 2, 3, 4, 5, 6]

// Complex transformations
let matrix = [[1, 2], [3, 4]];
let transposed = matrix[0].map((_, colIndex) =>
  matrix.flatMap(row => row[colIndex])
);
// [[1, 3], [2, 4]]

// Grouping then flattening
let items = [1, 2, 3, 4, 5];
let grouped = items.reduce((acc, x) => {
  let group = Math.floor(x / 2);
  if (!acc[group]) acc[group] = [];
  acc[group].push(x);
  return acc;
}, []);

let result = grouped.flatMap(g => g);
// [1, 2], [3, 4], [5]

// Depth example
let arr = [1, [2, [3, [4]]]];
arr.flat(0);                // [1, [2, [3, [4]]]] - no flattening
arr.flat(1);                // [1, 2, [3, [4]]]
arr.flat(2);                // [1, 2, 3, [4]]
arr.flat(3);                // [1, 2, 3, 4]
arr.flat(Infinity);         // [1, 2, 3, 4]

// Performance note
// flat() creates new arrays, O(n) complexity
// For frequently used data, consider storage format
```

---

### 7.3.7 toReversed(), toSorted(), toSpliced() (ES2023)

These are non-mutating versions of reverse(), sort(), and splice(). They were added in ES2023.

```javascript
// toReversed() - non-mutating reverse
let arr = [1, 2, 3, 4, 5];
let reversed = arr.toReversed();
reversed                    // [5, 4, 3, 2, 1]
arr                         // [1, 2, 3, 4, 5] - unchanged

// Original reverse() mutates
arr.reverse();              // arr is now [5, 4, 3, 2, 1]

// toSorted() - non-mutating sort
let arr = [3, 1, 4, 1, 5];
let sorted = arr.toSorted();
sorted                      // [1, 1, 3, 4, 5]
arr                         // [3, 1, 4, 1, 5] - unchanged

// With comparator
let arr = [30, 1, 4, 10];
let sorted = arr.toSorted((a, b) => a - b);
sorted                      // [1, 4, 10, 30]
arr                         // [30, 1, 4, 10] - unchanged

// toSpliced() - non-mutating splice
let arr = [1, 2, 3, 4, 5];
let result = arr.toSpliced(2, 2, 'a', 'b');
result                      // [1, 2, 'a', 'b', 5]
arr                         // [1, 2, 3, 4, 5] - unchanged

// toSpliced with removal only
let arr = [1, 2, 3, 4, 5];
let result = arr.toSpliced(1, 2);
result                      // [1, 4, 5]
arr                         // [1, 2, 3, 4, 5] - unchanged

// toSpliced with insertion only
let arr = [1, 2, 5];
let result = arr.toSpliced(2, 0, 3, 4);
result                      // [1, 2, 3, 4, 5]
arr                         // [1, 2, 5] - unchanged

// Functional programming benefit
let arr = [3, 1, 4];
let sorted1 = arr.toSorted();
let sorted2 = arr.toSorted((a, b) => b - a);
// arr unchanged, multiple sorted versions created

// Chaining operations
let arr = [3, 1, 4, 1, 5];
let result = arr
  .toSorted((a, b) => a - b)
  .toReversed()
  .toSpliced(0, 1);  // Remove first element
result                      // [5, 4, 3, 1] - after sort desc, remove 1

// Immutable data patterns
let state = [3, 1, 4];
let newState = state.toSorted();
// oldState === state, newState !== state

// Sparse arrays
let sparse = [3, , 1];
let sorted = sparse.toSorted();
sorted                      // [1, 3] - sparse becomes dense with toReversed

let reversed = sparse.toReversed();
reversed                    // [1, empty, 3]

let spliced = sparse.toSpliced(0, 1, 0);
spliced                     // [0, empty, 1]
```

---

### 7.3.8 with() (ES2023)

**with()** returns a new array with the element at the specified index replaced with the given value.

```javascript
// Replace element at index
let arr = [1, 2, 3, 4, 5];
let newArr = arr.with(2, 99);
newArr                      // [1, 2, 99, 4, 5]
arr                         // [1, 2, 3, 4, 5] - unchanged

// Negative index
let arr = [1, 2, 3, 4, 5];
let newArr = arr.with(-1, 99);  // Replace last element
newArr                      // [1, 2, 3, 4, 99]
arr                         // [1, 2, 3, 4, 5] - unchanged

// with() out of range throws error
let arr = [1, 2, 3];
let newArr = arr.with(10, 99);  // RangeError

// Using with to update immutably
let data = [
  { id: 1, value: 10 },
  { id: 2, value: 20 },
  { id: 3, value: 30 }
];

let updated = data.with(1, { ...data[1], value: 99 });
updated[1].value            // 99
data[1].value               // 20 - unchanged

// with vs direct assignment
let arr = [1, 2, 3];

// Mutating (avoid)
arr[1] = 99;
arr                         // [1, 99, 3]

// Non-mutating
let arr2 = arr.with(1, 99);
arr                         // [1, 2, 3] - still original
arr2                        // [1, 99, 3]

// with() with transformation
let arr = [1, 2, 3, 4, 5];
let doubled = arr.with(2, arr[2] * 2);
doubled                     // [1, 2, 6, 4, 5]

// Multiple updates (requires multiple with() calls or spread)
let arr = [1, 2, 3, 4, 5];
let modified = arr.with(1, 99).with(3, 88);
modified                    // [1, 99, 3, 88, 5]

// Or with spread (better for multiple)
let modified = [...arr];
modified[1] = 99;
modified[3] = 88;

// Sparse arrays
let sparse = [1, , 3];
let dense = sparse.with(1, 2);
dense                       // [1, 2, 3] - hole becomes element

// with in state management
let state = { items: [1, 2, 3] };
let newState = {
  ...state,
  items: state.items.with(0, 99)
};
newState.items              // [99, 2, 3]
state.items                 // [1, 2, 3] - unchanged
```

**Best Practices:**

```javascript
// ✓ Use non-mutating methods for immutable patterns
let arr = [1, 2, 3];
let result = arr.toSorted();  // Non-mutating

// ✗ Avoid mutation when immutability matters
arr.sort();                 // Mutates original

// ✓ Use with() for single element updates in immutable contexts
let newArr = arr.with(0, 99);

// ✓ Spread is still useful for multiple updates
let modified = [
  99,
  arr[1],
  arr[2],
  88
];

// ✓ ES2023 methods are great for functional code
let sorted = items
  .toSorted((a, b) => a.priority - b.priority)
  .toReversed()
  .map(item => item.name);
```
## 7.4 Iteration Methods

**Iteration methods** execute a function on each array element, enabling powerful functional programming patterns. They're crucial for modern JavaScript development.

---

### 7.4.1 forEach()

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

### 7.4.2 map()

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

### 7.4.3 filter()

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

### 7.4.4 reduce() and reduceRight()

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

### 7.4.5 find() and findIndex()

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

### 7.4.6 findLast() and findLastIndex() (ES2023)

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

### 7.4.7 some() and every()

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

### 7.4.8 keys(), values(), and entries()

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
## 7.5 Array Destructuring

**Array destructuring** allows extracting values from arrays and assigning them to variables in a concise syntax. It's a powerful ES6 feature that makes code more readable and reduces boilerplate.

---

### 7.5.1 Basic Destructuring

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

### 7.5.2 Skipping Elements

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

### 7.5.3 Rest in Destructuring

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

### 7.5.4 Default Values

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

### 7.5.5 Swapping Variables

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

### 7.5.6 Advanced Destructuring Patterns

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
## 7.6 Typed Arrays

**Typed Arrays** provide a mechanism to access raw binary data with fixed data types. They're essential for performance-critical code, binary protocol handling, and low-level data manipulation.

---

### 7.6.1 Typed Array Types and Creation

**Typed Arrays** come in various types for different integer and floating-point sizes.

```javascript
// Integer typed arrays (signed)
let int8 = new Int8Array(4);          // -128 to 127
let int16 = new Int16Array(4);        // -32,768 to 32,767
let int32 = new Int32Array(4);        // -2^31 to 2^31-1

// Unsigned integer typed arrays
let uint8 = new Uint8Array(4);        // 0 to 255
let uint16 = new Uint16Array(4);      // 0 to 65,535
let uint32 = new Uint32Array(4);      // 0 to 2^32-1

// Floating-point typed arrays
let float32 = new Float32Array(4);    // 32-bit float
let float64 = new Float64Array(4);    // 64-bit double

// Big integer typed arrays (ES2020)
let bigInt64 = new BigInt64Array(4);   // -2^63 to 2^63-1
let bigUint64 = new BigUint64Array(4); // 0 to 2^64-1

// Initialization with values
let arr = new Uint8Array([1, 2, 3, 4]);
arr                         // Uint8Array [1, 2, 3, 4]

// From regular array
let regular = [10, 20, 30];
let typed = new Uint8Array(regular);
typed                       // Uint8Array [10, 20, 30]

// From another typed array
let source = new Uint8Array([1, 2, 3]);
let copy = new Uint16Array(source);
copy                        // Uint16Array [1, 2, 3]

// From ArrayBuffer
let buffer = new ArrayBuffer(16);     // 16 bytes
let view = new Uint8Array(buffer);
view.length                 // 16

// With offset and length
let buffer = new ArrayBuffer(16);
let view1 = new Uint8Array(buffer, 0, 4);    // First 4 bytes
let view2 = new Uint8Array(buffer, 4, 4);    // Next 4 bytes
// Different views of same buffer

// Zero-filled array
let arr = new Uint8Array(5);
arr                         // Uint8Array [0, 0, 0, 0, 0]

// Fixed length (cannot change)
let arr = new Uint8Array(5);
arr.push(10);               // TypeError: push is not a function
arr.length = 10;            // Silently ignored

// Type coercion
let arr = new Uint8Array([1.9, 2.5, 3.1]);
arr                         // Uint8Array [1, 2, 3] - truncated!

// Overflow
let arr = new Uint8Array([260]);  // 260 = 0x104
arr                         // Uint8Array [4] - wraps around (260 & 0xFF = 4)

// Negative values (unsigned)
let arr = new Uint8Array([-1, -2, -3]);
arr                         // Uint8Array [255, 254, 253] - wrapped
```

**Key Properties:**

```javascript
// BYTES_PER_ELEMENT
Uint8Array.BYTES_PER_ELEMENT;       // 1
Uint16Array.BYTES_PER_ELEMENT;      // 2
Uint32Array.BYTES_PER_ELEMENT;      // 4
Float32Array.BYTES_PER_ELEMENT;     // 4
Float64Array.BYTES_PER_ELEMENT;     // 8

// Instance properties
let arr = new Uint8Array(10);
arr.byteLength;             // 10 (bytes)
arr.byteOffset;             // 0 (offset in buffer)
arr.buffer;                 // ArrayBuffer

// Length in elements
arr.length;                 // 10 (elements, not bytes)

// For Uint32Array with 4 elements
let arr = new Uint32Array(4);
arr.length;                 // 4 (elements)
arr.byteLength;             // 16 (bytes: 4 * 4)
Uint32Array.BYTES_PER_ELEMENT;  // 4 (bytes per element)
```

---

### 7.6.2 Typed Array Operations

**Operations** on typed arrays include indexing, modification, and copying.

```javascript
// Reading elements
let arr = new Uint8Array([10, 20, 30, 40]);
arr[0];                     // 10
arr[2];                     // 30
arr[10];                    // undefined (out of bounds)

// Writing elements
arr[0] = 99;
arr[0];                     // 99

// Assignment with type conversion
arr[1] = 256;               // Wraps to 0 (256 & 0xFF)
arr[1];                     // 0

// Float truncation
let floats = new Float32Array(2);
floats[0] = 3.14159;
floats[0];                  // 3.1415901660919189 (precision loss)

// Iteration methods (same as regular arrays)
let arr = new Uint8Array([1, 2, 3, 4, 5]);

// forEach
arr.forEach((x, i) => {
  console.log(`${i}: ${x}`);
});

// map
let doubled = arr.map(x => x * 2);  // Returns new typed array

// filter
let evens = arr.filter(x => x % 2 === 0);

// reduce
let sum = arr.reduce((a, b) => a + b, 0);  // 15

// find
let found = arr.find(x => x > 3);   // 4

// some / every
arr.some(x => x > 4);       // true
arr.every(x => x > 0);      // true

// Copying elements
let src = new Uint8Array([1, 2, 3, 4]);
let dst = new Uint8Array(4);

// set() method
dst.set(src);               // [1, 2, 3, 4]

// With offset
let dst2 = new Uint8Array(6);
dst2.set(src, 2);           // [0, 0, 1, 2, 3, 4]

// Subarray (view, not copy)
let arr = new Uint8Array([1, 2, 3, 4, 5]);
let sub = arr.subarray(1, 4);  // [2, 3, 4]

// Modification through subarray affects original
sub[0] = 99;
arr[1];                     // 99 (same buffer!)

// slice (true copy)
let copy = arr.slice(1, 4);  // [2, 3, 4]
copy[0] = 99;
arr[1];                     // Not affected (different buffer)

// indexOf / lastIndexOf
let arr = new Uint8Array([1, 2, 3, 2, 1]);
arr.indexOf(2);             // 1
arr.lastIndexOf(2);         // 3

// includes
arr.includes(3);            // true

// reverse
arr.reverse();              // [1, 2, 3, 2, 1] -> [1, 2, 3, 2, 1]

// sort
let unsorted = new Uint8Array([3, 1, 4, 1, 5]);
unsorted.sort();            // [1, 1, 3, 4, 5]

// With comparator
unsorted.sort((a, b) => b - a);  // [5, 4, 3, 1, 1]

// copyWithin
let arr = new Uint8Array([1, 2, 3, 4, 5]);
arr.copyWithin(0, 3);       // [4, 5, 3, 4, 5]

// fill
arr.fill(0);                // [0, 0, 0, 0, 0]
arr.fill(7, 1, 3);          // [0, 7, 7, 0, 0]

// toLocaleString / toString
let arr = new Uint8Array([1, 2, 3]);
arr.toString();             // '1,2,3'
arr.toLocaleString();       // '1,2,3'
```

---

### 7.6.3 Converting Between Typed Arrays

**Conversion** allows switching between typed array types and regular arrays.

```javascript
// Uint8Array to regular array
let typed = new Uint8Array([1, 2, 3]);
let regular = Array.from(typed);
regular                     // [1, 2, 3]

// Using spread
let regular = [...typed];   // [1, 2, 3]

// Using slice
let regular = Array.prototype.slice.call(typed);

// Regular array to typed array
let regular = [1, 2, 3];
let typed = new Uint8Array(regular);
typed                       // Uint8Array [1, 2, 3]

// Between typed array types
let uint8 = new Uint8Array([1, 2, 3]);
let uint16 = new Uint16Array(uint8);
uint16                      // Uint16Array [1, 2, 3]

// With precision loss
let float32 = new Float32Array([3.14159, 2.71828]);
let uint8 = new Uint8Array(float32);
uint8                       // Uint8Array [3, 2] - truncated

// Type conversion
let uint8 = new Uint8Array([256, 257, 258]);
let int16 = new Int16Array(uint8.buffer);
// Reinterprets bytes as 16-bit signed integers

// Endianness matters
let bytes = new Uint8Array([0x12, 0x34]);
let int16 = new Int16Array(bytes.buffer);
// Little-endian: 0x3412 = 13330
// Big-endian: 0x1234 = 4660

// Safe conversion with Array.from
let mixed = [1, 2, 300, -1, 3.14];
let uint8 = Uint8Array.from(mixed, x => x & 0xFF);  // [1, 2, 44, 255, 3]

// Or with mapping
let uint8 = new Uint8Array(mixed.map(x => Math.min(255, Math.max(0, x))));

// Copy to shared buffer
let buffer = new ArrayBuffer(8);
let uint32_1 = new Uint32Array(buffer, 0, 1);
let uint32_2 = new Uint32Array(buffer, 4, 1);
uint32_1[0] = 0x12345678;
uint32_2[0] = 0x9ABCDEF0;
// buffer now contains both values

// Reading as different type
let buffer = new ArrayBuffer(4);
let uint32 = new Uint32Array(buffer);
let uint8 = new Uint8Array(buffer);
uint32[0] = 0x12345678;
uint8[0];                   // 0x78 (little-endian)
uint8[1];                   // 0x56
uint8[2];                   // 0x34
uint8[3];                   // 0x12

// Float to bytes
let buffer = new ArrayBuffer(4);
let floats = new Float32Array(buffer);
let bytes = new Uint8Array(buffer);
floats[0] = 3.14159;
bytes;                      // Uint8Array [208, 15, 73, 64] (bytes representation)
```

---

### 7.6.4 Uint8ClampedArray

**Uint8ClampedArray** is special: values are clamped to 0-255 range instead of wrapping.

```javascript
// Regular Uint8Array (wraps)
let uint8 = new Uint8Array([256, 257, -1]);
uint8                       // [0, 1, 255]

// Uint8ClampedArray (clamps)
let clamped = new Uint8ClampedArray([256, 257, -1]);
clamped                     // [255, 255, 0]  // 256->255, 257->255, -1->0

// Float values are rounded
let clamped = new Uint8ClampedArray([255.5, 0.5, -0.5]);
clamped                     // [255, 0, 0]  // Rounded to nearest int

// Used for image data
let imageData = {
  width: 2,
  height: 2,
  data: new Uint8ClampedArray([
    255, 0, 0, 255,        // Red pixel (RGBA)
    0, 255, 0, 255,        // Green pixel
    0, 0, 255, 255,        // Blue pixel
    255, 255, 255, 255     // White pixel
  ])
};

// Canvas pixel manipulation
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
let imgData = ctx.createImageData(100, 100);

// Modify pixels with clamping (ensures valid RGB values)
imgData.data[0] = 256;      // Clamped to 255
```

---

### 7.6.5 BigInt64Array and BigUint64Array (ES2020)

**BigInt typed arrays** handle 64-bit integers beyond JavaScript's safe integer range.

```javascript
// BigInt64Array for signed 64-bit integers
let big64 = new BigInt64Array(4);
big64[0] = 123n;
big64[0];                   // 123n

big64[1] = -456n;
big64[1];                   // -456n

// BigUint64Array for unsigned 64-bit integers
let bigUint64 = new BigUint64Array(4);
bigUint64[0] = 9007199254740991n;  // Beyond safe integer
bigUint64[0];               // 9007199254740991n

// Very large numbers
let maxInt64 = 9223372036854775807n;
let big64 = new BigInt64Array([maxInt64]);
big64[0];                   // 9223372036854775807n

// Operations
let big64 = new BigInt64Array([10n, 20n, 30n]);
big64[0] = big64[0] + 5n;
big64[0];                   // 15n

// Cannot mix regular and BigInt
let big64 = new BigInt64Array(1);
big64[0] = 10;              // TypeError: Cannot convert 10 to a BigInt

// Regular integers must convert
big64[0] = BigInt(10);      // OK

// Iteration
let big64 = new BigInt64Array([1n, 2n, 3n]);
big64.forEach(x => console.log(x));  // 1n, 2n, 3n

// Converting BigInt array to regular array
let big64 = new BigInt64Array([10n, 20n, 30n]);
let regular = Array.from(big64);
regular                     // [10n, 20n, 30n]

// Using spread
let regular = [...big64];   // [10n, 20n, 30n]
```

---

### 7.6.6 ArrayBuffer and Binary Data

**ArrayBuffer** represents generic fixed-length binary data. Views interpret the bytes.

```javascript
// Create buffer
let buffer = new ArrayBuffer(16);   // 16 bytes
buffer.byteLength;          // 16

// Create views
let uint8View = new Uint8Array(buffer);
let uint32View = new Uint32Array(buffer);

// Different views of same data
uint8View[0] = 0x12;
uint8View[1] = 0x34;
uint8View[2] = 0x56;
uint8View[3] = 0x78;
uint32View[0];              // Depends on endianness
                            // Little-endian: 0x78563412
                            // Big-endian: 0x12345678

// Slicing buffer (creates new buffer)
let buffer = new ArrayBuffer(16);
let slice = buffer.slice(4, 8);  // Bytes 4-7
slice.byteLength;           // 4

// View with offset
let buffer = new ArrayBuffer(16);
let view1 = new Uint8Array(buffer, 0, 4);    // First 4 bytes
let view2 = new Uint8Array(buffer, 8, 4);    // Next 4 bytes at offset 8

// Detached buffer (after transfer)
let buffer = new ArrayBuffer(16);
let transferred = buffer.transfer?.();  // Not standard yet

// Creating buffer from binary string
function stringToBuffer(str) {
  let buffer = new ArrayBuffer(str.length);
  let view = new Uint8Array(buffer);
  for (let i = 0; i < str.length; i++) {
    view[i] = str.charCodeAt(i);
  }
  return buffer;
}

let buffer = stringToBuffer('Hello');

// Reading back
function bufferToString(buffer) {
  let view = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < view.length; i++) {
    str += String.fromCharCode(view[i]);
  }
  return str;
}

bufferToString(buffer);     // 'Hello'

// Use case: Network packet
let packetBuffer = new ArrayBuffer(20);  // 20-byte packet
let header = new Uint32Array(packetBuffer, 0, 1);
let payload = new Uint8Array(packetBuffer, 4, 16);
header[0] = 0xDEADBEEF;  // Set packet identifier
```

---

### 7.6.7 DataView for Mixed-Type Data

**DataView** allows reading/writing different types from same buffer with explicit endianness control.

```javascript
// Create DataView
let buffer = new ArrayBuffer(16);
let view = new DataView(buffer);

// Writing different types
view.setUint8(0, 0xFF);          // 8-bit unsigned at offset 0
view.setInt16(2, -1000);         // 16-bit signed at offset 2
view.setFloat32(4, 3.14);        // 32-bit float at offset 4
view.setUint32(8, 0xDEADBEEF);   // 32-bit unsigned at offset 8

// Reading back
view.getUint8(0);                // 255
view.getInt16(2);                // -1000
view.getFloat32(4);              // 3.140000104904175
view.getUint32(8);               // 3735928559

// Endianness control
let buffer = new ArrayBuffer(4);
let view = new DataView(buffer);

// Little-endian (default false)
view.setUint32(0, 0x12345678, true);  // true = little-endian
view.getUint8(0);                      // 0x78

// Big-endian (false)
view.setUint32(0, 0x12345678, false); // false = big-endian
view.getUint8(0);                      // 0x12

// Writing bytes directly
let bytes = [0x48, 0x65, 0x6C, 0x6C, 0x6F];  // "Hello"
let buffer = new ArrayBuffer(5);
let view = new DataView(buffer);
bytes.forEach((b, i) => view.setUint8(i, b));

// Or using Uint8Array
let buffer = new ArrayBuffer(5);
new Uint8Array(buffer).set(bytes);

// Complex structures
// Binary format: 1 byte flag, 2 bytes length, N bytes data
function packData(flag, data) {
  let buffer = new ArrayBuffer(3 + data.length);
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  view.setUint8(0, flag);
  view.setUint16(1, data.length);  // Offset 1, uses system endianness
  for (let i = 0; i < data.length; i++) {
    uint8[3 + i] = data[i];
  }
  
  return buffer;
}

function unpackData(buffer) {
  let view = new DataView(buffer);
  let uint8 = new Uint8Array(buffer);
  
  let flag = view.getUint8(0);
  let length = view.getUint16(1);
  let data = [];
  for (let i = 0; i < length; i++) {
    data.push(uint8[3 + i]);
  }
  
  return { flag, data };
}

let packed = packData(1, [65, 66, 67]);  // A, B, C
let unpacked = unpackData(packed);
unpacked                    // { flag: 1, data: [65, 66, 67] }

// Reading strings from binary
let buffer = new ArrayBuffer(5);
let uint8 = new Uint8Array(buffer);
uint8.set([0x48, 0x65, 0x6C, 0x6C, 0x6F]);  // "Hello"

let str = String.fromCharCode(...uint8);
str                         // "Hello"

// Offset parameter
let buffer = new ArrayBuffer(20);
let view = new DataView(buffer, 5, 10);  // 10 bytes starting at offset 5
view.byteLength;            // 10
view.byteOffset;            // 5
```

---

### 7.6.8 Use Cases

**Common use cases** for typed arrays and binary data.

```javascript
// Image processing with canvas
function processImageData(imageData) {
  let data = imageData.data;  // Uint8ClampedArray
  
  // Grayscale conversion
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    let gray = (r + g + b) / 3;
    
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
    // data[i + 3] is alpha, keep unchanged
  }
}

// Audio processing
let audioBuffer = new Float32Array(48000);  // 1 second at 48kHz
audioBuffer[0] = 0.5;  // Set first sample

// Applying gain
for (let i = 0; i < audioBuffer.length; i++) {
  audioBuffer[i] *= 0.5;  // Reduce volume by half
}

// Network protocol parsing
function parseHTTPHeader(buffer) {
  let view = new Uint8Array(buffer);
  let headerEnd = -1;
  
  // Find \r\n\r\n (0x0D, 0x0A, 0x0D, 0x0A)
  for (let i = 0; i < view.length - 3; i++) {
    if (view[i] === 0x0D && view[i+1] === 0x0A &&
        view[i+2] === 0x0D && view[i+3] === 0x0A) {
      headerEnd = i;
      break;
    }
  }
  
  if (headerEnd === -1) return null;
  
  // Convert to string
  let headerBytes = view.subarray(0, headerEnd);
  let header = String.fromCharCode(...headerBytes);
  return header;
}

// File format parsing (PNG header)
function isPNG(buffer) {
  let view = new Uint8Array(buffer);
  // PNG signature: 137 80 78 71 13 10 26 10
  return view[0] === 137 && view[1] === 80 &&
         view[2] === 78 && view[3] === 71 &&
         view[4] === 13 && view[5] === 10 &&
         view[6] === 26 && view[7] === 10;
}

// Compression (simple example)
function compress(data) {
  let uint8 = new Uint8Array(data);
  let result = [];
  
  for (let i = 0; i < uint8.length; i++) {
    let count = 1;
    while (i + count < uint8.length &&
           uint8[i] === uint8[i + count] &&
           count < 255) {
      count++;
    }
    result.push(count);
    result.push(uint8[i]);
    i += count - 1;
  }
  
  return new Uint8Array(result);
}

// Cryptography (mock example)
function simpleXOR(buffer, key) {
  let view = new Uint8Array(buffer);
  for (let i = 0; i < view.length; i++) {
    view[i] ^= key[i % key.length];
  }
  return view;
}

let encrypted = simpleXOR(new Uint8Array([1, 2, 3]), [5, 5, 5]);
encrypted                   // Uint8Array [4, 7, 6]

// WebGL vertex data
let positions = new Float32Array([
  -1, -1,  // Vertex 1 (x, y)
   1, -1,  // Vertex 2
   0,  1   // Vertex 3
]);

// Math optimizations
function dot(a, b) {
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }
  return result;
}

let vec1 = new Float32Array([1, 2, 3]);
let vec2 = new Float32Array([4, 5, 6]);
dot(vec1, vec2);            // 32 (1*4 + 2*5 + 3*6)

// Shared memory (Web Workers)
let shared = new SharedArrayBuffer(16);
let view = new Int32Array(shared);
view[0] = 42;  // Can be accessed from multiple workers
```

**Performance Characteristics:**

```javascript
// Typed arrays are more memory-efficient
let regular = [1, 2, 3, 4, 5];  // Each number is object overhead
let typed = new Uint8Array(regular);  // Compact storage

// Typed arrays are faster for numerical operations
let regular = [];
let typed = new Float32Array(1000);

// Filling arrays
console.time('Regular');
for (let i = 0; i < 1000; i++) {
  regular[i] = Math.random();
}
console.timeEnd('Regular');

console.time('Typed');
for (let i = 0; i < typed.length; i++) {
  typed[i] = Math.random();
}
console.timeEnd('Typed');
// Typed is significantly faster for large operations

// SIMD-like operations (mental exercise)
let float32 = new Float32Array([1.0, 2.0, 3.0, 4.0]);
// JIT can optimize operations on typed arrays better
for (let i = 0; i < float32.length; i++) {
  float32[i] *= 2;  // More optimizable than regular array
}
```

## 7.9 Arrays Summary

| Category | Methods |
|----------|---------|
| **Mutating** | `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` |
| **Non-mutating** | `slice`, `concat`, `flat`, `flatMap`, `toSorted`, `toReversed`, `toSpliced` |
| **Iteration** | `forEach`, `map`, `filter`, `reduce`, `find`, `some`, `every` |
| **Search** | `indexOf`, `includes`, `find`, `findIndex`, `findLast` |

---

**End of Chapter 7: Arrays**
