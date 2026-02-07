# 4.2 Properties

## Introduction

JavaScript properties have attributes that control their behavior: writable, enumerable, and configurable. Understanding property descriptors and how to manipulate them is crucial for advanced object manipulation.

---

## 4.2.1 Data Properties

### Definition

**Properties that hold values:**

```javascript
const person = {
  name: "Alice",  // Data property
  age: 30         // Data property
};
```

---

### Default Attributes

**When created via assignment or literal:**

```javascript
const obj = { key: "value" };

// Default attributes:
// - value: "value"
// - writable: true
// - enumerable: true
// - configurable: true
```

---

### Reading and Writing

```javascript
const person = {
  name: "Alice"
};

// Read
console.log(person.name);  // "Alice"

// Write
person.name = "Bob";
console.log(person.name);  // "Bob"

// Add new property
person.age = 30;
console.log(person.age);  // 30
```

---

### Deleting

```javascript
const person = {
  name: "Alice",
  age: 30
};

delete person.age;
console.log(person.age);  // undefined
console.log("age" in person);  // false
```

---

## 4.2.2 Accessor Properties

### Getters and Setters

**Computed properties:**

```javascript
const person = {
  firstName: "Alice",
  lastName: "Smith",
  
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  
  set fullName(value) {
    const parts = value.split(" ");
    this.firstName = parts[0];
    this.lastName = parts[1];
  }
};

// Getter (no parentheses)
console.log(person.fullName);  // "Alice Smith"

// Setter
person.fullName = "Bob Jones";
console.log(person.firstName);  // "Bob"
console.log(person.lastName);   // "Jones"
console.log(person.fullName);   // "Bob Jones"
```

---

### Read-Only Properties (Getter Only)

```javascript
const obj = {
  _value: 42,
  
  get value() {
    return this._value;
  }
  // No setter - read-only
};

console.log(obj.value);  // 42
obj.value = 100;         // Silently fails (strict mode: TypeError)
console.log(obj.value);  // Still 42
```

---

### Write-Only Properties (Setter Only)

```javascript
const logger = {
  _logs: [],
  
  set log(message) {
    this._logs.push(message);
    console.log(`Logged: ${message}`);
  }
  // No getter - write-only
};

logger.log = "Error occurred";  // Logs: "Logged: Error occurred"
console.log(logger.log);        // undefined (no getter)
console.log(logger._logs);      // ["Error occurred"]
```

---

### Validation in Setters

```javascript
const person = {
  _age: 0,
  
  get age() {
    return this._age;
  },
  
  set age(value) {
    if (typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    if (value < 0 || value > 150) {
      throw new RangeError("Age must be between 0 and 150");
    }
    this._age = value;
  }
};

person.age = 30;     // OK
console.log(person.age);  // 30

person.age = -5;     // RangeError
person.age = "30";   // TypeError
```

---

### Computed Getters/Setters

```javascript
const rectangle = {
  width: 10,
  height: 20,
  
  get area() {
    return this.width * this.height;
  },
  
  set area(value) {
    // Maintain aspect ratio
    const ratio = this.width / this.height;
    this.height = Math.sqrt(value / ratio);
    this.width = value / this.height;
  }
};

console.log(rectangle.area);  // 200

rectangle.area = 400;
console.log(rectangle.width);   // ~14.14
console.log(rectangle.height);  // ~28.28
console.log(rectangle.area);    // 400
```

---

## 4.2.3 Property Attributes

### Four Attributes

**Data properties:**

1. **`value`**: The property's value
2. **`writable`**: Can the value be changed?
3. **`enumerable`**: Appears in `for...in`, `Object.keys()`?
4. **`configurable`**: Can attributes be changed? Can property be deleted?

**Accessor properties:**

1. **`get`**: Getter function (or `undefined`)
2. **`set`**: Setter function (or `undefined`)
3. **`enumerable`**: Appears in `for...in`, `Object.keys()`?
4. **`configurable`**: Can attributes be changed? Can property be deleted?

---

### Default Values

**When created via assignment:**

```javascript
const obj = {};
obj.prop = "value";

// Attributes:
// value: "value"
// writable: true
// enumerable: true
// configurable: true
```

**When created via `Object.defineProperty`:**

```javascript
const obj = {};
Object.defineProperty(obj, "prop", {
  value: "value"
});

// Attributes:
// value: "value"
// writable: false     ← defaults to false
// enumerable: false   ← defaults to false
// configurable: false ← defaults to false
```

---

## 4.2.4 Property Descriptors

### Descriptor Objects

**Describe property attributes:**

```javascript
// Data property descriptor
{
  value: "some value",
  writable: true,
  enumerable: true,
  configurable: true
}

// Accessor property descriptor
{
  get: function() { return this._value; },
  set: function(value) { this._value = value; },
  enumerable: true,
  configurable: true
}
```

---

### Cannot Mix Data and Accessor

```javascript
// Invalid: mixing value and get
{
  value: 42,        // Data attribute
  get: function() { return 42; }  // Accessor attribute
}
// TypeError: Invalid property descriptor
```

---

## 4.2.5 `Object.defineProperty()`

### Basic Syntax

```javascript
Object.defineProperty(obj, propName, descriptor)
```

---

### Defining Data Property

```javascript
const person = {};

Object.defineProperty(person, "name", {
  value: "Alice",
  writable: true,
  enumerable: true,
  configurable: true
});

console.log(person.name);  // "Alice"
```

---

### Read-Only Property

```javascript
const obj = {};

Object.defineProperty(obj, "constant", {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: false
});

console.log(obj.constant);  // 42

obj.constant = 100;  // Silently fails (strict mode: TypeError)
console.log(obj.constant);  // Still 42

delete obj.constant;  // Silently fails (strict mode: TypeError)
console.log(obj.constant);  // Still 42
```

---

### Non-Enumerable Property

```javascript
const obj = {
  public: "visible"
};

Object.defineProperty(obj, "hidden", {
  value: "secret",
  writable: true,
  enumerable: false,  // Hidden from enumeration
  configurable: true
});

console.log(obj.hidden);  // "secret" (accessible)

console.log(Object.keys(obj));  // ["public"] (hidden not shown)

for (let key in obj) {
  console.log(key);  // Only "public"
}

// But visible in getOwnPropertyNames
console.log(Object.getOwnPropertyNames(obj));
// ["public", "hidden"]
```

---

### Non-Configurable Property

```javascript
const obj = {};

Object.defineProperty(obj, "permanent", {
  value: "cannot change attributes",
  writable: true,
  enumerable: true,
  configurable: false
});

// Cannot change attributes
Object.defineProperty(obj, "permanent", {
  enumerable: false  // TypeError: Cannot redefine property
});

// Cannot delete
delete obj.permanent;  // Silently fails (strict mode: TypeError)

// Can still change value (writable: true)
obj.permanent = "new value";  // OK
```

---

### Defining Accessor Property

```javascript
const obj = {
  _value: 0
};

Object.defineProperty(obj, "value", {
  get() {
    console.log("Getting value");
    return this._value;
  },
  set(newValue) {
    console.log("Setting value");
    this._value = newValue;
  },
  enumerable: true,
  configurable: true
});

obj.value = 42;      // Logs "Setting value"
console.log(obj.value);  // Logs "Getting value", then 42
```

---

### Modifying Existing Property

```javascript
const obj = {
  name: "Alice"
};

// Make read-only
Object.defineProperty(obj, "name", {
  writable: false
});

obj.name = "Bob";  // Silently fails
console.log(obj.name);  // Still "Alice"
```

---

## 4.2.6 `Object.defineProperties()`

### Define Multiple Properties

```javascript
const obj = {};

Object.defineProperties(obj, {
  name: {
    value: "Alice",
    writable: true,
    enumerable: true,
    configurable: true
  },
  
  age: {
    value: 30,
    writable: false,  // Read-only
    enumerable: true,
    configurable: false
  },
  
  email: {
    get() {
      return this._email;
    },
    set(value) {
      this._email = value.toLowerCase();
    },
    enumerable: true,
    configurable: true
  }
});

console.log(obj.name);  // "Alice"
console.log(obj.age);   // 30

obj.email = "ALICE@EXAMPLE.COM";
console.log(obj.email);  // "alice@example.com"
```

---

### Creating Immutable Objects

```javascript
const constants = {};

Object.defineProperties(constants, {
  PI: {
    value: 3.14159,
    writable: false,
    enumerable: true,
    configurable: false
  },
  
  E: {
    value: 2.71828,
    writable: false,
    enumerable: true,
    configurable: false
  }
});

constants.PI = 3;  // Silently fails
console.log(constants.PI);  // Still 3.14159
```

---

## 4.2.7 `Object.getOwnPropertyDescriptor()`

### Get Single Property Descriptor

```javascript
const person = {
  name: "Alice",
  age: 30
};

const nameDesc = Object.getOwnPropertyDescriptor(person, "name");

console.log(nameDesc);
// {
//   value: "Alice",
//   writable: true,
//   enumerable: true,
//   configurable: true
// }
```

---

### Inspecting Accessor Properties

```javascript
const obj = {
  _value: 42,
  
  get value() {
    return this._value;
  },
  
  set value(newValue) {
    this._value = newValue;
  }
};

const desc = Object.getOwnPropertyDescriptor(obj, "value");

console.log(desc);
// {
//   get: [Function: get value],
//   set: [Function: set value],
//   enumerable: true,
//   configurable: true
// }
```

---

### Non-Existent Property

```javascript
const obj = { a: 1 };

const desc = Object.getOwnPropertyDescriptor(obj, "nonexistent");

console.log(desc);  // undefined
```

---

### Inherited Properties

```javascript
const proto = { inherited: "value" };
const obj = Object.create(proto);
obj.own = "own value";

// Only returns descriptor for OWN properties
console.log(Object.getOwnPropertyDescriptor(obj, "own"));
// { value: "own value", writable: true, enumerable: true, configurable: true }

console.log(Object.getOwnPropertyDescriptor(obj, "inherited"));
// undefined (inherited, not own)
```

---

## 4.2.8 `Object.getOwnPropertyDescriptors()`

### Get All Property Descriptors

```javascript
const person = {
  name: "Alice",
  age: 30,
  
  get fullInfo() {
    return `${this.name}, ${this.age}`;
  }
};

const descriptors = Object.getOwnPropertyDescriptors(person);

console.log(descriptors);
// {
//   name: {
//     value: "Alice",
//     writable: true,
//     enumerable: true,
//     configurable: true
//   },
//   age: {
//     value: 30,
//     writable: true,
//     enumerable: true,
//     configurable: true
//   },
//   fullInfo: {
//     get: [Function: get fullInfo],
//     set: undefined,
//     enumerable: true,
//     configurable: true
//   }
// }
```

---

### Cloning Objects with Accessors

**Problem with `Object.assign` (doesn't preserve getters/setters):**

```javascript
const source = {
  _value: 42,
  
  get value() {
    return this._value;
  },
  
  set value(newValue) {
    this._value = newValue;
  }
};

// Object.assign converts getter to data property
const clone1 = Object.assign({}, source);
console.log(Object.getOwnPropertyDescriptor(clone1, "value"));
// { value: 42, writable: true, enumerable: true, configurable: true }
// Lost getter/setter!

// Solution: Use descriptors
const clone2 = Object.defineProperties(
  {},
  Object.getOwnPropertyDescriptors(source)
);

console.log(Object.getOwnPropertyDescriptor(clone2, "value"));
// { get: [Function: get value], set: [Function: set value], ... }
// Preserved getter/setter!
```

---

### Shallow Clone Utility

```javascript
function shallowClone(obj) {
  return Object.defineProperties(
    {},
    Object.getOwnPropertyDescriptors(obj)
  );
}

const original = {
  name: "Alice",
  
  get greeting() {
    return `Hello, ${this.name}`;
  }
};

const clone = shallowClone(original);

console.log(clone.greeting);  // "Hello, Alice"
clone.name = "Bob";
console.log(clone.greeting);  // "Hello, Bob"
```

---

## 4.2.9 Property Attribute Interactions

### `writable` and `configurable`

```javascript
const obj = {};

// writable: false, configurable: true
Object.defineProperty(obj, "prop1", {
  value: 1,
  writable: false,
  configurable: true
});

obj.prop1 = 2;  // Silently fails
console.log(obj.prop1);  // Still 1

// But can change via defineProperty
Object.defineProperty(obj, "prop1", {
  value: 2
});
console.log(obj.prop1);  // 2

// And can change writable
Object.defineProperty(obj, "prop1", {
  writable: true
});

obj.prop1 = 3;  // Now works
console.log(obj.prop1);  // 3
```

---

### `configurable: false` Restrictions

**Cannot change most attributes:**

```javascript
const obj = {};

Object.defineProperty(obj, "prop", {
  value: 1,
  writable: true,
  enumerable: true,
  configurable: false
});

// Cannot change enumerable
Object.defineProperty(obj, "prop", {
  enumerable: false  // TypeError
});

// Cannot change configurable back to true
Object.defineProperty(obj, "prop", {
  configurable: true  // TypeError
});

// Cannot delete
delete obj.prop;  // Silently fails (strict mode: TypeError)
```

**Exception: Can change `writable` from `true` to `false`:**

```javascript
const obj = {};

Object.defineProperty(obj, "prop", {
  value: 1,
  writable: true,
  configurable: false
});

// This is allowed
Object.defineProperty(obj, "prop", {
  writable: false
});

// But cannot change back to true
Object.defineProperty(obj, "prop", {
  writable: true  // TypeError
});
```

---

### `enumerable` Effects

```javascript
const obj = {
  visible: 1
};

Object.defineProperty(obj, "hidden", {
  value: 2,
  enumerable: false
});

// for...in
for (let key in obj) {
  console.log(key);  // Only "visible"
}

// Object.keys
console.log(Object.keys(obj));  // ["visible"]

// Object.values
console.log(Object.values(obj));  // [1]

// Object.entries
console.log(Object.entries(obj));  // [["visible", 1]]

// JSON.stringify
console.log(JSON.stringify(obj));  // {"visible":1}

// But still accessible
console.log(obj.hidden);  // 2

// And visible in getOwnPropertyNames
console.log(Object.getOwnPropertyNames(obj));
// ["visible", "hidden"]
```

---

## 4.2.10 Common Patterns

### Private Properties (Convention)

```javascript
const person = {
  _name: "Alice",  // Convention: _ prefix means private
  
  get name() {
    return this._name;
  },
  
  set name(value) {
    if (typeof value === "string") {
      this._name = value;
    }
  }
};

// Users can still access _name, but convention says "don't"
console.log(person._name);  // "Alice" (not truly private)
```

---

### Truly Private with Symbols

```javascript
const _name = Symbol("name");

const person = {
  [_name]: "Alice",
  
  get name() {
    return this[_name];
  },
  
  set name(value) {
    this[_name] = value;
  }
};

console.log(person.name);    // "Alice"
console.log(person[_name]);  // "Alice" (if you have the symbol)

// Symbol not in regular enumeration
console.log(Object.keys(person));  // ["name"]

// But visible in getOwnPropertySymbols
console.log(Object.getOwnPropertySymbols(person));  // [Symbol(name)]
```

---

### Truly Private with WeakMap

```javascript
const privateData = new WeakMap();

class Person {
  constructor(name) {
    privateData.set(this, { name });
  }
  
  get name() {
    return privateData.get(this).name;
  }
  
  set name(value) {
    privateData.get(this).name = value;
  }
}

const person = new Person("Alice");
console.log(person.name);  // "Alice"

// No way to access private data without reference to WeakMap
```

---

### Immutable Properties

```javascript
function createImmutable(obj) {
  const immutable = {};
  
  Object.keys(obj).forEach(key => {
    Object.defineProperty(immutable, key, {
      value: obj[key],
      writable: false,
      enumerable: true,
      configurable: false
    });
  });
  
  return immutable;
}

const config = createImmutable({
  apiUrl: "https://api.example.com",
  timeout: 5000
});

config.apiUrl = "https://hack.com";  // Silently fails
console.log(config.apiUrl);  // Still "https://api.example.com"
```

---

### Lazy Properties

```javascript
const obj = {
  _expensive: undefined,
  
  get expensive() {
    if (this._expensive === undefined) {
      console.log("Computing expensive value...");
      this._expensive = computeExpensiveValue();
    }
    return this._expensive;
  }
};

function computeExpensiveValue() {
  // Simulate expensive computation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += i;
  }
  return result;
}

console.log(obj.expensive);  // Logs "Computing...", then value
console.log(obj.expensive);  // Returns cached value (no log)
```

---

### Self-Defining Properties

```javascript
const obj = {
  get expensive() {
    // Compute value
    const value = computeExpensiveValue();
    
    // Redefine as data property
    Object.defineProperty(this, "expensive", {
      value,
      writable: false,
      enumerable: true,
      configurable: false
    });
    
    return value;
  }
};

// First access: getter runs, converts to data property
console.log(obj.expensive);  // Computes and caches

// Subsequent access: data property (fast)
console.log(obj.expensive);  // Just returns value
```

---

## Summary

### Object Creation

- **Object literals**: `{ key: value }`
- **`new Object()`**: Constructor (rarely used)
- **`Object.create(proto)`**: With specific prototype
- **Constructor functions**: Pre-ES6 pattern

### Property Access

- **Dot notation**: `obj.prop`
- **Bracket notation**: `obj["prop"]`, `obj[variable]`
- **Optional chaining**: `obj?.prop?.nested`
- **Computed names**: `{ [key]: value }`
- **Shorthand**: `{ name, age }`
- **Method shorthand**: `{ method() { } }`

### Property Types

- **Data properties**: Hold values
- **Accessor properties**: Getters/setters

### Property Attributes

- **Data**: `value`, `writable`, `enumerable`, `configurable`
- **Accessor**: `get`, `set`, `enumerable`, `configurable`

### Descriptor Methods

- **`Object.defineProperty()`**: Define single property
- **`Object.defineProperties()`**: Define multiple properties
- **`Object.getOwnPropertyDescriptor()`**: Get single descriptor
- **`Object.getOwnPropertyDescriptors()`**: Get all descriptors

### Key Patterns

- **Private properties**: Symbols, WeakMap, or `#` (classes)
- **Immutable properties**: `writable: false`, `configurable: false`
- **Hidden properties**: `enumerable: false`
- **Lazy evaluation**: Compute on first access
- **Validation**: Setters with type/range checks

---
