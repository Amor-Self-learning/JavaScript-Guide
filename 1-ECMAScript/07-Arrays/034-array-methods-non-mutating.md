# 7.3 Array Methods (Non-mutating)

**Non-mutating methods** return a new array or value without modifying the original array. This is a fundamental principle of functional programming and makes code more predictable.

---

## 7.3.1 concat()

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

## 7.3.2 slice()

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

## 7.3.3 join()

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

## 7.3.4 indexOf() and lastIndexOf()

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

## 7.3.5 includes()

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

## 7.3.6 flat() and flatMap()

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

## 7.3.7 toReversed(), toSorted(), toSpliced() (ES2023)

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

## 7.3.8 with() (ES2023)

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