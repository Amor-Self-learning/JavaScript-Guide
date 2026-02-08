# 7.1 Array Basics

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