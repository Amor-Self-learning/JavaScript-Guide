# 4.3 Object Methods

## Introduction

JavaScript provides many built-in methods on the `Object` constructor for inspecting, manipulating, and controlling objects. Understanding these methods is essential for effective object manipulation.

This chapter covers enumeration methods, copying, immutability controls, prototype manipulation, and comparison utilities.

---

## 4.3.1 Enumeration Methods

### `Object.keys()`

**Returns array of own enumerable property names:**

```javascript
const person = {
  name: "Alice",
  age: 30,
  city: "NYC"
};

console.log(Object.keys(person));  // ["name", "age", "city"]
```

---

#### Own Properties Only

**Does not include inherited properties:**

```javascript
const proto = { inherited: "value" };
const obj = Object.create(proto);
obj.own = "own value";

console.log(Object.keys(obj));  // ["own"]
// "inherited" not included (it's inherited, not own)
```

---

#### Enumerable Only

**Does not include non-enumerable properties:**

```javascript
const obj = { visible: 1 };

Object.defineProperty(obj, "hidden", {
  value: 2,
  enumerable: false
});

console.log(Object.keys(obj));  // ["visible"]
// "hidden" not included (non-enumerable)
```

---

#### Order

**Follows specific order:**

1. Integer keys in ascending order
2. String keys in creation order
3. Symbol keys (not included in `Object.keys`)

```javascript
const obj = {
  b: 2,
  1: "one",
  a: 1,
  3: "three",
  2: "two"
};

console.log(Object.keys(obj));
// ["1", "2", "3", "b", "a"]
// Integers first (sorted), then strings (creation order)
```

---

#### Practical Use

**Iterate object properties:**

```javascript
const scores = { alice: 95, bob: 87, charlie: 92 };

Object.keys(scores).forEach(name => {
  console.log(`${name}: ${scores[name]}`);
});
// alice: 95
// bob: 87
// charlie: 92
```

**Count properties:**

```javascript
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj).length);  // 3
```

---

### `Object.values()`

**Returns array of own enumerable property values:**

```javascript
const person = {
  name: "Alice",
  age: 30,
  city: "NYC"
};

console.log(Object.values(person));  // ["Alice", 30, "NYC"]
```

---

#### Same Rules as `Object.keys()`

**Own, enumerable properties only:**

```javascript
const proto = { inherited: "value" };
const obj = Object.create(proto);
obj.visible = 1;

Object.defineProperty(obj, "hidden", {
  value: 2,
  enumerable: false
});

console.log(Object.values(obj));  // [1]
```

---

#### Practical Use

**Sum values:**

```javascript
const scores = { alice: 95, bob: 87, charlie: 92 };

const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
console.log(total);  // 274

const average = total / Object.values(scores).length;
console.log(average);  // 91.33
```

**Check for value:**

```javascript
const user = { name: "Alice", role: "admin" };

if (Object.values(user).includes("admin")) {
  console.log("User is admin");
}
```

---

### `Object.entries()`

**Returns array of [key, value] pairs:**

```javascript
const person = {
  name: "Alice",
  age: 30,
  city: "NYC"
};

console.log(Object.entries(person));
// [["name", "Alice"], ["age", 30], ["city", "NYC"]]
```

---

#### Destructuring

```javascript
const person = { name: "Alice", age: 30 };

for (const [key, value] of Object.entries(person)) {
  console.log(`${key}: ${value}`);
}
// name: Alice
// age: 30
```

---

#### Convert to Map

```javascript
const obj = { a: 1, b: 2, c: 3 };

const map = new Map(Object.entries(obj));

console.log(map.get("a"));  // 1
console.log(map.size);      // 3
```

---

#### Filter Object

```javascript
const scores = {
  alice: 95,
  bob: 65,
  charlie: 92,
  david: 58
};

const passing = Object.fromEntries(
  Object.entries(scores).filter(([name, score]) => score >= 70)
);

console.log(passing);  // { alice: 95, charlie: 92 }
```

---

### `Object.fromEntries()`

**Create object from [key, value] pairs:**

```javascript
const entries = [
  ["name", "Alice"],
  ["age", 30],
  ["city", "NYC"]
];

const person = Object.fromEntries(entries);
console.log(person);
// { name: "Alice", age: 30, city: "NYC" }
```

---

#### Convert Map to Object

```javascript
const map = new Map([
  ["a", 1],
  ["b", 2],
  ["c", 3]
]);

const obj = Object.fromEntries(map);
console.log(obj);  // { a: 1, b: 2, c: 3 }
```

---

#### Transform Object

```javascript
const prices = { apple: 1.5, banana: 0.75, orange: 2.0 };

// Double all prices
const doubledPrices = Object.fromEntries(
  Object.entries(prices).map(([item, price]) => [item, price * 2])
);

console.log(doubledPrices);
// { apple: 3, banana: 1.5, orange: 4 }
```

---

#### Swap Keys and Values

```javascript
const original = { a: "x", b: "y", c: "z" };

const swapped = Object.fromEntries(
  Object.entries(original).map(([key, value]) => [value, key])
);

console.log(swapped);  // { x: "a", y: "b", z: "c" }
```

---

## 4.3.2 Object Copying

### `Object.assign()`

**Copy properties from source(s) to target:**

```javascript
Object.assign(target, source1, source2, ...)
```

---

#### Basic Usage

```javascript
const target = { a: 1 };
const source = { b: 2, c: 3 };

Object.assign(target, source);

console.log(target);  // { a: 1, b: 2, c: 3 }
```

---

#### Shallow Copy

```javascript
const original = {
  name: "Alice",
  address: {
    city: "NYC"
  }
};

const copy = Object.assign({}, original);

copy.name = "Bob";
copy.address.city = "LA";

console.log(original.name);         // "Alice" (not affected)
console.log(original.address.city); // "LA" (shallow copy!)
```

---

#### Multiple Sources

**Later sources override earlier ones:**

```javascript
const defaults = { a: 1, b: 2 };
const overrides = { b: 3, c: 4 };

const result = Object.assign({}, defaults, overrides);

console.log(result);  // { a: 1, b: 3, c: 4 }
// b: 3 from overrides (not b: 2 from defaults)
```

---

#### Returns Target

```javascript
const target = { a: 1 };
const result = Object.assign(target, { b: 2 });

console.log(result === target);  // true (same object)
```

---

#### With Getters/Setters

**Converts accessors to data properties:**

```javascript
const source = {
  get value() {
    return 42;
  }
};

const copy = Object.assign({}, source);

console.log(Object.getOwnPropertyDescriptor(copy, "value"));
// { value: 42, writable: true, enumerable: true, configurable: true }
// Getter became data property!

// To preserve: use Object.defineProperties
const properCopy = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(source)
);

console.log(Object.getOwnPropertyDescriptor(properCopy, "value"));
// { get: [Function: get value], set: undefined, ... }
```

---

#### Practical Patterns

**Cloning:**

```javascript
const original = { a: 1, b: 2 };
const clone = Object.assign({}, original);
```

**Merging:**

```javascript
const merged = Object.assign({}, obj1, obj2, obj3);
```

**Adding properties:**

```javascript
const enhanced = Object.assign({}, original, {
  newProp: "value"
});
```

**Immutable update:**

```javascript
const state = { count: 0, user: "Alice" };

// Don't mutate original
const newState = Object.assign({}, state, { count: 1 });

console.log(state.count);     // 0 (unchanged)
console.log(newState.count);  // 1
```

---

## 4.3.3 Immutability Controls

### `Object.freeze()`

**Make object immutable (cannot add, delete, or modify properties):**

```javascript
const obj = {
  name: "Alice",
  age: 30
};

Object.freeze(obj);

// Cannot modify
obj.name = "Bob";
console.log(obj.name);  // "Alice" (unchanged)

// Cannot add
obj.email = "alice@example.com";
console.log(obj.email);  // undefined

// Cannot delete
delete obj.age;
console.log(obj.age);  // 30 (still there)

// Strict mode throws errors
"use strict";
obj.name = "Bob";  // TypeError
```

---

#### Shallow Freeze

**Only freezes top level:**

```javascript
const obj = {
  name: "Alice",
  address: {
    city: "NYC"
  }
};

Object.freeze(obj);

obj.name = "Bob";  // Fails
console.log(obj.name);  // "Alice"

obj.address.city = "LA";  // Works! (nested object not frozen)
console.log(obj.address.city);  // "LA"
```

---

#### Deep Freeze

**Recursively freeze nested objects:**

```javascript
function deepFreeze(obj) {
  // Freeze object itself
  Object.freeze(obj);
  
  // Freeze all properties
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = obj[prop];
    
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  });
  
  return obj;
}

const obj = {
  name: "Alice",
  address: {
    city: "NYC",
    coords: {
      lat: 40.7128,
      lng: -74.0060
    }
  }
};

deepFreeze(obj);

obj.address.coords.lat = 0;  // Fails
console.log(obj.address.coords.lat);  // 40.7128 (unchanged)
```

---

#### Effects on Property Descriptors

```javascript
const obj = { a: 1 };
Object.freeze(obj);

Object.defineProperty(obj, "a", {
  value: 2  // TypeError: Cannot redefine property
});

Object.defineProperty(obj, "b", {
  value: 2  // TypeError: Cannot add property
});
```

---

### `Object.seal()`

**Prevent adding or deleting properties (but can modify existing):**

```javascript
const obj = {
  name: "Alice",
  age: 30
};

Object.seal(obj);

// Can modify
obj.name = "Bob";
console.log(obj.name);  // "Bob" (changed)

// Cannot add
obj.email = "alice@example.com";
console.log(obj.email);  // undefined

// Cannot delete
delete obj.age;
console.log(obj.age);  // 30 (still there)
```

---

#### Effects on Descriptors

```javascript
const obj = { a: 1 };

Object.seal(obj);

// Can change value
obj.a = 2;
console.log(obj.a);  // 2

// Can change writable
Object.defineProperty(obj, "a", {
  writable: false
});

// Cannot add properties
Object.defineProperty(obj, "b", {
  value: 2  // TypeError
});

// Cannot delete properties
delete obj.a;  // Fails
```

---

### `Object.preventExtensions()`

**Prevent adding new properties (but can modify and delete existing):**

```javascript
const obj = {
  name: "Alice",
  age: 30
};

Object.preventExtensions(obj);

// Can modify
obj.name = "Bob";
console.log(obj.name);  // "Bob"

// Can delete
delete obj.age;
console.log(obj.age);  // undefined

// Cannot add
obj.email = "alice@example.com";
console.log(obj.email);  // undefined
```

---

### Comparison Table

|Operation|Normal|preventExtensions|seal|freeze|
|---|---|---|---|---|
|Add property|✓|✗|✗|✗|
|Delete property|✓|✓|✗|✗|
|Modify value|✓|✓|✓|✗|
|Modify descriptor|✓|✓|Limited*|✗|

*`seal`: Can change `writable` from `true` to `false`

---

### `Object.isFrozen()`

**Check if object is frozen:**

```javascript
const obj = { a: 1 };

console.log(Object.isFrozen(obj));  // false

Object.freeze(obj);

console.log(Object.isFrozen(obj));  // true
```

---

#### Empty Object

```javascript
const obj = {};

console.log(Object.isFrozen(obj));  // false

Object.preventExtensions(obj);

console.log(Object.isFrozen(obj));  // true (empty + non-extensible = frozen)
```

---

### `Object.isSealed()`

**Check if object is sealed:**

```javascript
const obj = { a: 1 };

console.log(Object.isSealed(obj));  // false

Object.seal(obj);

console.log(Object.isSealed(obj));  // true
```

---

#### Frozen is Also Sealed

```javascript
const obj = { a: 1 };

Object.freeze(obj);

console.log(Object.isSealed(obj));  // true
console.log(Object.isFrozen(obj));  // true

// Frozen ⊆ Sealed ⊆ Non-extensible
```

---

### `Object.isExtensible()`

**Check if properties can be added:**

```javascript
const obj = { a: 1 };

console.log(Object.isExtensible(obj));  // true

Object.preventExtensions(obj);

console.log(Object.isExtensible(obj));  // false
```

---

#### All Immutability Checks

```javascript
const obj = { a: 1 };

Object.freeze(obj);

console.log(Object.isExtensible(obj));  // false
console.log(Object.isSealed(obj));      // true
console.log(Object.isFrozen(obj));      // true
```

---

## 4.3.4 Prototype Methods

### `Object.getPrototypeOf()`

**Get object's prototype:**

```javascript
const proto = { inherited: "value" };
const obj = Object.create(proto);

console.log(Object.getPrototypeOf(obj) === proto);  // true
```

---

#### Built-in Prototypes

```javascript
console.log(Object.getPrototypeOf([]) === Array.prototype);  // true
console.log(Object.getPrototypeOf({}) === Object.prototype); // true

function F() {}
const instance = new F();
console.log(Object.getPrototypeOf(instance) === F.prototype);  // true
```

---

#### `null` Prototype

```javascript
const obj = Object.create(null);

console.log(Object.getPrototypeOf(obj));  // null
```

---

#### Prefer Over `__proto__`

```javascript
// Old way (deprecated)
const proto = obj.__proto__;

// Modern way (recommended)
const proto = Object.getPrototypeOf(obj);
```

---

### `Object.setPrototypeOf()`

**Set object's prototype:**

```javascript
const proto = { inherited: "value" };
const obj = { own: "property" };

Object.setPrototypeOf(obj, proto);

console.log(obj.inherited);  // "value" (from proto)
console.log(obj.own);        // "property" (own)
```

---

#### Performance Warning

**Very slow! Avoid in performance-critical code:**

```javascript
// Slow (changes prototype)
const obj = { a: 1 };
Object.setPrototypeOf(obj, somePrototype);

// Fast (sets prototype at creation)
const obj = Object.create(somePrototype, {
  a: { value: 1 }
});
```

---

#### Replace Prototype

```javascript
const oldProto = { old: "value" };
const newProto = { new: "value" };

const obj = Object.create(oldProto);

console.log(obj.old);  // "value"
console.log(obj.new);  // undefined

Object.setPrototypeOf(obj, newProto);

console.log(obj.old);  // undefined
console.log(obj.new);  // "value"
```

---

#### Set to `null`

```javascript
const obj = { a: 1 };

Object.setPrototypeOf(obj, null);

console.log(obj.toString);  // undefined (no inherited methods)
```

---

## 4.3.5 Comparison

### `Object.is()`

**Same-value equality:**

```javascript
Object.is(value1, value2)
```

---

#### vs `===`

**Differences:**

1. **`NaN` equals `NaN`:**

```javascript
console.log(NaN === NaN);     // false
console.log(Object.is(NaN, NaN));  // true
```

2. **`+0` and `-0` are different:**

```javascript
console.log(0 === -0);        // true
console.log(Object.is(0, -0));     // false
console.log(Object.is(-0, -0));    // true
```

---

#### Otherwise Same as `===`

```javascript
console.log(Object.is(42, 42));    // true
console.log(Object.is(42, "42"));  // false
console.log(Object.is(null, undefined));  // false

const obj = {};
console.log(Object.is(obj, obj));  // true
console.log(Object.is({}, {}));    // false
```

---

#### Use Cases

**Checking for `NaN`:**

```javascript
function isNaN(value) {
  return Object.is(value, NaN);
}

console.log(isNaN(NaN));  // true
console.log(isNaN(5));    // false

// Or use Number.isNaN
console.log(Number.isNaN(NaN));  // true
```

**Distinguishing `+0` and `-0`:**

```javascript
function isNegativeZero(value) {
  return Object.is(value, -0);
}

console.log(isNegativeZero(0));   // false
console.log(isNegativeZero(-0));  // true
```

---

#### Polyfill

```javascript
if (!Object.is) {
  Object.is = function(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Handle +0 vs -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Handle NaN
      return x !== x && y !== y;
    }
  };
}
```

---

## 4.3.6 Property Existence

### `Object.hasOwn()` (ES2022)

**Check if object has own property:**

```javascript
const obj = { a: 1 };

console.log(Object.hasOwn(obj, "a"));  // true
console.log(Object.hasOwn(obj, "b"));  // false
```

---

#### Vs `hasOwnProperty()`

**Safer than `hasOwnProperty()`:**

```javascript
// Problem: hasOwnProperty can be shadowed
const obj = {
  a: 1,
  hasOwnProperty: function() {
    return false;  // Shadowed!
  }
};

console.log(obj.hasOwnProperty("a"));  // false (wrong!)

// Object.hasOwn is safe
console.log(Object.hasOwn(obj, "a"));  // true (correct)
```

---

#### With `null` Prototype

```javascript
const obj = Object.create(null);
obj.a = 1;

// Error: no hasOwnProperty method
// obj.hasOwnProperty("a");  // TypeError

// Object.hasOwn works
console.log(Object.hasOwn(obj, "a"));  // true
```

---

#### Vs `in` Operator

```javascript
const proto = { inherited: "value" };
const obj = Object.create(proto);
obj.own = "property";

// in: checks own and inherited
console.log("own" in obj);       // true
console.log("inherited" in obj); // true

// Object.hasOwn: checks only own
console.log(Object.hasOwn(obj, "own"));       // true
console.log(Object.hasOwn(obj, "inherited")); // false
```

---

#### Checking Before Access

```javascript
const config = { timeout: 5000 };

if (Object.hasOwn(config, "timeout")) {
  console.log(`Timeout: ${config.timeout}ms`);
}
```

---

#### Polyfill for Older Environments

```javascript
if (!Object.hasOwn) {
  Object.hasOwn = function(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}
```

---

## 4.3.7 Additional Methods

### `Object.getOwnPropertyNames()`

**Get all own property names (including non-enumerable):**

```javascript
const obj = { visible: 1 };

Object.defineProperty(obj, "hidden", {
  value: 2,
  enumerable: false
});

console.log(Object.keys(obj));  // ["visible"]

console.log(Object.getOwnPropertyNames(obj));
// ["visible", "hidden"] (includes non-enumerable)
```

---

### `Object.getOwnPropertySymbols()`

**Get all own symbol properties:**

```javascript
const sym = Symbol("id");

const obj = {
  name: "Alice",
  [sym]: 123
};

console.log(Object.keys(obj));  // ["name"] (no symbols)

console.log(Object.getOwnPropertySymbols(obj));
// [Symbol(id)]
```

---

### All Own Properties

**Combine strings and symbols:**

```javascript
const sym = Symbol("id");

const obj = {
  name: "Alice",
  [sym]: 123
};

Object.defineProperty(obj, "hidden", {
  value: "secret",
  enumerable: false
});

const allProps = [
  ...Object.getOwnPropertyNames(obj),
  ...Object.getOwnPropertySymbols(obj)
];

console.log(allProps);
// ["name", "hidden", Symbol(id)]

// Or use Reflect.ownKeys
console.log(Reflect.ownKeys(obj));
// ["name", "hidden", Symbol(id)]
```

---

## 4.3.8 Practical Patterns

### Cloning Objects

**Shallow clone:**

```javascript
// Method 1: Object.assign
const clone1 = Object.assign({}, original);

// Method 2: Spread
const clone2 = { ...original };

// Method 3: Preserve descriptors
const clone3 = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(original)
);
```

**Deep clone:**

```javascript
// Simple objects only (no functions, dates, etc.)
const deepClone = JSON.parse(JSON.stringify(original));

// Full deep clone (structured clone in modern browsers)
const deepClone = structuredClone(original);

// Manual recursive
function deepClone(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj);
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (let key in obj) {
    if (Object.hasOwn(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}
```

---

### Merging Objects

**Shallow merge:**

```javascript
const defaults = { a: 1, b: 2, c: 3 };
const options = { b: 20, d: 4 };

const merged = { ...defaults, ...options };
// { a: 1, b: 20, c: 3, d: 4 }

// Or
const merged = Object.assign({}, defaults, options);
```

**Deep merge:**

```javascript
function deepMerge(target, source) {
  for (let key in source) {
    if (Object.hasOwn(source, key)) {
      if (source[key] && typeof source[key] === "object") {
        target[key] = target[key] || {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}

const obj1 = { a: 1, nested: { x: 1, y: 2 } };
const obj2 = { b: 2, nested: { y: 20, z: 3 } };

const merged = deepMerge({}, obj1);
deepMerge(merged, obj2);

console.log(merged);
// { a: 1, b: 2, nested: { x: 1, y: 20, z: 3 } }
```

---

### Object Comparison

```javascript
function shallowEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) {
    return false;
  }
  
  for (let key of keys1) {
    if (!Object.is(obj1[key], obj2[key])) {
      return false;
    }
  }
  
  return true;
}

console.log(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2 }));  // true
console.log(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 3 }));  // false
```

---

### Pick Properties

```javascript
function pick(obj, keys) {
  return keys.reduce((result, key) => {
    if (Object.hasOwn(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
}

const user = { name: "Alice", age: 30, email: "alice@example.com" };
const subset = pick(user, ["name", "email"]);

console.log(subset);  // { name: "Alice", email: "alice@example.com" }
```

---

### Omit Properties

```javascript
function omit(obj, keys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key))
  );
}

const user = { name: "Alice", age: 30, password: "secret" };
const safe = omit(user, ["password"]);

console.log(safe);  // { name: "Alice", age: 30 }
```

---

### Map Object Values

```javascript
function mapValues(obj, fn) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value, key)])
  );
}

const prices = { apple: 1.5, banana: 0.75, orange: 2.0 };
const doubled = mapValues(prices, price => price * 2);

console.log(doubled);
// { apple: 3, banana: 1.5, orange: 4 }
```

---

## Summary

### Enumeration

- **`Object.keys()`**: Array of own enumerable property names
- **`Object.values()`**: Array of own enumerable property values
- **`Object.entries()`**: Array of [key, value] pairs
- **`Object.fromEntries()`**: Create object from entries

### Copying

- **`Object.assign()`**: Copy properties (shallow, converts getters)
- Spread syntax: `{ ...obj }` (shallow)
- `structuredClone()`: Deep clone (modern browsers)

### Immutability

- **`Object.freeze()`**: Cannot add, delete, or modify (shallow)
- **`Object.seal()`**: Cannot add or delete (can modify)
- **`Object.preventExtensions()`**: Cannot add (can modify and delete)
- **`Object.isFrozen()`**: Check if frozen
- **`Object.isSealed()`**: Check if sealed
- **`Object.isExtensible()`**: Check if extensible

### Prototypes

- **`Object.getPrototypeOf()`**: Get prototype
- **`Object.setPrototypeOf()`**: Set prototype (slow!)
- **`Object.create()`**: Create with specific prototype

### Comparison

- **`Object.is()`**: Same-value equality (handles NaN and ±0)
- **`Object.hasOwn()`**: Check own property (ES2022, safe)

### Property Inspection

- **`Object.getOwnPropertyNames()`**: All own properties (including non-enumerable)
- **`Object.getOwnPropertySymbols()`**: All own symbol properties
- **`Reflect.ownKeys()`**: All own properties (strings + symbols)

### Key Patterns

- Clone: shallow (assign/spread), deep (structuredClone/recursive)
- Merge: shallow (spread), deep (recursive)
- Transform: map values, pick/omit properties
- Compare: shallow equality check
- Immutability: freeze (deep freeze for nested)

---
