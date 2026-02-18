# 4 Objects

Objects are JavaScript's fundamental data structure—collections of key-value pairs that can store data and behavior. This chapter covers object creation, property manipulation, built-in methods, destructuring, spread/rest operations, and the critical `this` keyword.

---

# 4. Objects and Object-Oriented Programming

## 4.1 Object Fundamentals


### 4.1.1 Object Literals

### Basic Syntax

**Most common way to create objects:**

```javascript
const obj = {
  key1: "value1",
  key2: "value2"
};
```

---

### Property Types

**Various value types:**

```javascript
const person = {
  // String
  name: "Alice",
  
  // Number
  age: 30,
  
  // Boolean
  isActive: true,
  
  // Array
  hobbies: ["reading", "coding"],
  
  // Object
  address: {
    city: "NYC",
    country: "USA"
  },
  
  // Function (method)
  greet: function() {
    return `Hello, I'm ${this.name}`;
  },
  
  // Method shorthand (ES6)
  introduce() {
    return `I'm ${this.name}, ${this.age} years old`;
  }
};
```

---

### Property Keys

**Strings and symbols:**

```javascript
const obj = {
  // String key (quotes optional for valid identifiers)
  name: "Alice",
  
  // String key with quotes (required for special characters)
  "full name": "Alice Smith",
  
  // Numeric key (converted to string)
  123: "numeric",
  
  // Symbol key
  [Symbol("id")]: 42
};

console.log(obj.name);           // "Alice"
console.log(obj["full name"]);   // "Alice Smith"
console.log(obj[123]);           // "numeric"
console.log(obj["123"]);         // "numeric" (same)
```

---

### Trailing Commas

**Allowed (and recommended):**

```javascript
const obj = {
  a: 1,
  b: 2,
  c: 3,  // Trailing comma (easier diffs)
};
```

---

### Empty Objects

```javascript
const empty = {};

console.log(Object.keys(empty));  // []
console.log(Object.keys(empty).length);  // 0
```

---

### 4.1.2 Object Creation Methods

### `new Object()`

**Constructor syntax:**

```javascript
const obj = new Object();
obj.name = "Alice";
obj.age = 30;

console.log(obj);  // { name: "Alice", age: 30 }
```

**Rarely used (object literal preferred):**

```javascript
// Instead of:
const obj1 = new Object();
obj1.name = "Alice";

// Prefer:
const obj2 = { name: "Alice" };
```

---

### `Object.create()`

**Create object with specific prototype:**

```javascript
const proto = {
  greet() {
    return "Hello!";
  }
};

const obj = Object.create(proto);
obj.name = "Alice";

console.log(obj.name);     // "Alice" (own property)
console.log(obj.greet());  // "Hello!" (inherited from proto)
```

**`null` prototype (no inheritance):**

```javascript
const obj = Object.create(null);

console.log(obj.toString);  // undefined (no inherited methods)
console.log(obj.__proto__); // undefined
```

---

### `Object.create()` with Property Descriptors

```javascript
const obj = Object.create(Object.prototype, {
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
    configurable: true
  }
});

console.log(obj.name);  // "Alice"
obj.name = "Bob";
console.log(obj.name);  // "Bob" (writable)

obj.age = 31;
console.log(obj.age);   // 30 (not writable, silent failure)
```

---

### Constructor Functions (Pre-ES6)

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

const alice = new Person("Alice", 30);
console.log(alice.greet());  // "Hello, I'm Alice"
```

**Modern equivalent: classes (covered later)**

---

### 4.1.3 Property Access

### Dot Notation

**Standard access for valid identifiers:**

```javascript
const person = {
  name: "Alice",
  age: 30
};

console.log(person.name);  // "Alice"
console.log(person.age);   // 30
```

**Setting properties:**

```javascript
person.email = "alice@example.com";
console.log(person.email);  // "alice@example.com"
```

**Limitations:**

```javascript
const obj = {
  "full name": "Alice Smith",
  "123": "numeric"
};

// Can't use dot notation for these:
// obj.full name  // SyntaxError
// obj.123        // SyntaxError
```

---

### Bracket Notation

**Access any property (even with special characters):**

```javascript
const person = {
  name: "Alice",
  "full name": "Alice Smith",
  123: "numeric"
};

console.log(person["name"]);        // "Alice"
console.log(person["full name"]);   // "Alice Smith"
console.log(person[123]);           // "numeric"
console.log(person["123"]);         // "numeric" (same)
```

**Dynamic property access:**

```javascript
const prop = "name";
console.log(person[prop]);  // "Alice"

function getProp(obj, key) {
  return obj[key];
}

console.log(getProp(person, "age"));  // 30
```

**Computed from expressions:**

```javascript
const prefix = "user";
const id = 123;

const obj = {};
obj[prefix + id] = "Alice";

console.log(obj.user123);   // "Alice"
console.log(obj["user123"]);// "Alice"
```

---

### Optional Chaining (`?.`)

**Safe property access:**

```javascript
const user = {
  name: "Alice",
  address: {
    city: "NYC"
  }
};

// Traditional (verbose)
const country = user && user.address && user.address.country;

// Optional chaining (concise)
const country = user?.address?.country;

console.log(country);  // undefined (not error)
```

**With methods:**

```javascript
const user = {
  greet() {
    return "Hello!";
  }
};

console.log(user.greet?.());     // "Hello!"
console.log(user.farewell?.());  // undefined (method doesn't exist)
```

**With bracket notation:**

```javascript
const key = "address";
console.log(user?.[key]?.city);  // "NYC"
```

**Short-circuits:**

```javascript
let count = 0;

const obj = null;
obj?.[count++];

console.log(count);  // 0 (count++ not evaluated)
```

---

### Nested Property Access

```javascript
const user = {
  profile: {
    personal: {
      name: "Alice",
      age: 30
    },
    settings: {
      theme: "dark"
    }
  }
};

console.log(user.profile.personal.name);  // "Alice"
console.log(user["profile"]["settings"]["theme"]);  // "dark"

// Mixed
console.log(user.profile["personal"].name);  // "Alice"
```

---

### 4.1.4 Computed Property Names

### Basic Syntax

**Compute property names in object literals:**

```javascript
const key = "name";

const obj = {
  [key]: "Alice"
};

console.log(obj.name);  // "Alice"
console.log(obj[key]);  // "Alice"
```

---

### Expressions

**Any expression:**

```javascript
const prefix = "user";
const id = 123;

const obj = {
  [prefix + id]: "Alice",
  ["is" + "Admin"]: true,
  [1 + 2]: "three"
};

console.log(obj.user123);  // "Alice"
console.log(obj.isAdmin);  // true
console.log(obj[3]);       // "three"
```

---

### Function Calls

```javascript
function getKey() {
  return "dynamicKey";
}

const obj = {
  [getKey()]: "value"
};

console.log(obj.dynamicKey);  // "value"
```

---

### Symbol Keys

```javascript
const ID = Symbol("id");

const user = {
  [ID]: 123,
  name: "Alice"
};

console.log(user[ID]);  // 123
console.log(user.name); // "Alice"

// Symbol keys not enumerated
console.log(Object.keys(user));  // ["name"]

// Must use getOwnPropertySymbols
console.log(Object.getOwnPropertySymbols(user));  // [Symbol(id)]
```

---

### Template Literals

```javascript
const type = "user";
const action = "create";

const handlers = {
  [`${type}_${action}`]: function() {
    console.log("Creating user");
  }
};

handlers.user_create();  // "Creating user"
```

---

### Method Names

```javascript
const methodName = "greet";

const person = {
  name: "Alice",
  
  [methodName]() {
    return `Hello, I'm ${this.name}`;
  }
};

console.log(person.greet());  // "Hello, I'm Alice"
```

---

### 4.1.5 Property Shorthand

### Basic Shorthand

**When variable name matches property name:**

```javascript
const name = "Alice";
const age = 30;

// ES5
const person1 = {
  name: name,
  age: age
};

// ES6 shorthand
const person2 = {
  name,
  age
};

console.log(person2);  // { name: "Alice", age: 30 }
```

---

### Mixed Syntax

```javascript
const name = "Alice";

const person = {
  name,              // Shorthand
  age: 30,           // Traditional
  city: "NYC"        // Traditional
};
```

---

### Function Returns

```javascript
function createUser(name, email) {
  return {
    name,
    email,
    createdAt: Date.now()
  };
}

const user = createUser("Alice", "alice@example.com");
console.log(user);
// { name: "Alice", email: "alice@example.com", createdAt: 1234567890 }
```

---

### Destructuring with Shorthand

```javascript
const { name, age } = { name: "Alice", age: 30 };

const person = {
  name,  // Uses destructured value
  age    // Uses destructured value
};
```

---

### 4.1.6 Method Shorthand

### Basic Syntax

**Concise method definition:**

```javascript
// ES5
const obj1 = {
  greet: function() {
    return "Hello!";
  }
};

// ES6 shorthand
const obj2 = {
  greet() {
    return "Hello!";
  }
};
```

---

### `this` Binding

**Method shorthand has normal `this` (not arrow):**

```javascript
const person = {
  name: "Alice",
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
};

console.log(person.greet());  // "Hello, I'm Alice"

const greet = person.greet;
console.log(greet());  // "Hello, I'm undefined" (lost this)
```

---

### Generator Methods

```javascript
const obj = {
  *generator() {
    yield 1;
    yield 2;
    yield 3;
  }
};

const gen = obj.generator();
console.log([...gen]);  // [1, 2, 3]
```

---

### Async Methods

```javascript
const obj = {
  async fetchData() {
    const response = await fetch("/api/data");
    return response.json();
  }
};

obj.fetchData().then(data => console.log(data));
```

---

### Async Generator Methods

```javascript
const obj = {
  async *asyncGenerator() {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  }
};

(async () => {
  for await (let value of obj.asyncGenerator()) {
    console.log(value);
  }
})();
```

---

### Computed Method Names

```javascript
const methodName = "greet";

const person = {
  name: "Alice",
  
  [methodName]() {
    return `Hello, I'm ${this.name}`;
  },
  
  [`${methodName}Formal`]() {
    return `Good day, I am ${this.name}`;
  }
};

console.log(person.greet());        // "Hello, I'm Alice"
console.log(person.greetFormal());  // "Good day, I am Alice"
```

---


## 4.2 Properties


### 4.2.1 Data Properties

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

### 4.2.2 Accessor Properties

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

### 4.2.3 Property Attributes

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

### 4.2.4 Property Descriptors

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

### 4.2.5 `Object.defineProperty()`

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

### 4.2.6 `Object.defineProperties()`

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

### 4.2.7 `Object.getOwnPropertyDescriptor()`

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

### 4.2.8 `Object.getOwnPropertyDescriptors()`

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

### 4.2.9 Property Attribute Interactions

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

### 4.2.10 Common Patterns

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

## 4.3 Object Methods


### 4.3.1 Enumeration Methods

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

### 4.3.2 Object Copying

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

### 4.3.3 Immutability Controls

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

### 4.3.4 Prototype Methods

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

### 4.3.5 Comparison

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

### 4.3.6 Property Existence

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

### 4.3.7 Additional Methods

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

### 4.3.8 Practical Patterns

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

## 4.4 Destructuring

### Why Destructuring Changes How You Write JavaScript

Destructuring is a JavaScript expression that allows you to extract values from arrays or properties from objects into distinct variables. It's not just syntactic sugar—it fundamentally improves code clarity:

```javascript
// ❌ Before: Verbose and repetitive
function processUser(user) {
  const name = user.name;
  const email = user.email;
  const role = user.role;
  // ...
}

// ✅ After: Clean and declarative
function processUser({ name, email, role }) {
  // Variables ready to use immediately
}
```

**Destructuring shines in:**
- **Function parameters** — Extract just what you need, with defaults
- **API responses** — Pull out nested data cleanly
- **React/Vue** — Props and state management
- **Import statements** — `import { useState } from 'react'`

### Object Destructuring

Object destructuring extracts properties from objects and assigns them to variables.

**Basic Syntax:**

```javascript
const person = {
  name: 'Alice',
  age: 30,
  city: 'New York'
};

// Traditional approach
const name = person.name;
const age = person.age;

// Destructuring approach
const { name, age, city } = person;

console.log(name); // 'Alice'
console.log(age);  // 30
console.log(city); // 'New York'
```

**Extracting Specific Properties:**

```javascript
const user = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secret123',
  role: 'admin'
};

// Extract only what you need
const { username, email } = user;

console.log(username); // 'john_doe'
console.log(email);    // 'john@example.com'
// password and role are not extracted
```

### Nested Destructuring

Destructuring can be used with nested objects to extract deeply nested values.

**Single-Level Nesting:**

```javascript
const student = {
  name: 'Emma',
  grades: {
    math: 95,
    science: 88,
    english: 92
  }
};

// Destructure nested object
const { name, grades: { math, science } } = student;

console.log(name);    // 'Emma'
console.log(math);    // 95
console.log(science); // 88
// Note: 'grades' is not assigned as a variable
```

**Multi-Level Nesting:**

```javascript
const company = {
  name: 'Tech Corp',
  location: {
    country: 'USA',
    address: {
      street: '123 Main St',
      city: 'San Francisco',
      zip: '94102'
    }
  }
};

// Deep nested destructuring
const {
  location: {
    country,
    address: { city, zip }
  }
} = company;

console.log(country); // 'USA'
console.log(city);    // 'San Francisco'
console.log(zip);     // '94102'
```

**Complex Nested Structures:**

```javascript
const data = {
  user: {
    profile: {
      personal: {
        firstName: 'John',
        lastName: 'Smith'
      },
      contact: {
        email: 'john.smith@email.com',
        phone: '555-0123'
      }
    },
    settings: {
      theme: 'dark',
      notifications: true
    }
  }
};

// Extract deeply nested values
const {
  user: {
    profile: {
      personal: { firstName, lastName },
      contact: { email }
    },
    settings: { theme }
  }
} = data;

console.log(firstName); // 'John'
console.log(lastName);  // 'Smith'
console.log(email);     // 'john.smith@email.com'
console.log(theme);     // 'dark'
```

### Default Values

Default values can be assigned to variables in case the property doesn't exist in the object.

**Basic Default Values:**

```javascript
const config = {
  host: 'localhost',
  port: 3000
};

// Assign default values
const { host, port, protocol = 'http' } = config;

console.log(host);     // 'localhost'
console.log(port);     // 3000
console.log(protocol); // 'http' (default value used)
```

**Default Values with Nested Objects:**

```javascript
const options = {
  timeout: 5000
};

// Default values for nested properties
const {
  timeout,
  retry = {
    attempts: 3,
    delay: 1000
  }
} = options;

console.log(timeout);        // 5000
console.log(retry.attempts); // 3 (default object used)
console.log(retry.delay);    // 1000
```

**Handling `undefined` vs Missing Properties:**

```javascript
const obj = {
  a: undefined,
  b: null,
  c: 0,
  d: ''
};

const { a = 'default-a', b = 'default-b', c = 'default-c', d = 'default-d', e = 'default-e' } = obj;

console.log(a); // 'default-a' (undefined triggers default)
console.log(b); // null (null doesn't trigger default)
console.log(c); // 0 (0 doesn't trigger default)
console.log(d); // '' (empty string doesn't trigger default)
console.log(e); // 'default-e' (missing property triggers default)
```

### Rest in Destructuring

The rest operator (`...`) collects remaining properties into a new object.

**Basic Rest Pattern:**

```javascript
const person = {
  name: 'Bob',
  age: 25,
  city: 'Boston',
  country: 'USA',
  occupation: 'Engineer'
};

// Extract some properties, collect the rest
const { name, age, ...otherInfo } = person;

console.log(name);      // 'Bob'
console.log(age);       // 25
console.log(otherInfo); // { city: 'Boston', country: 'USA', occupation: 'Engineer' }
```

**Rest with Nested Destructuring:**

```javascript
const product = {
  id: 101,
  name: 'Laptop',
  specs: {
    cpu: 'Intel i7',
    ram: '16GB',
    storage: '512GB SSD',
    display: '15.6 inch',
    weight: '1.8kg'
  },
  price: 1299
};

// Combine nested destructuring with rest
const {
  id,
  specs: { cpu, ram, ...otherSpecs },
  ...productRest
} = product;

console.log(id);         // 101
console.log(cpu);        // 'Intel i7'
console.log(ram);        // '16GB'
console.log(otherSpecs); // { storage: '512GB SSD', display: '15.6 inch', weight: '1.8kg' }
console.log(productRest);// { name: 'Laptop', price: 1299 }
```

**Practical Use Cases:**

```javascript
// Extracting API response data
function processUserData(userData) {
  const { id, username, ...settings } = userData;
  
  console.log(`User ${username} (ID: ${id})`);
  console.log('Settings:', settings);
}

processUserData({
  id: 42,
  username: 'alice',
  theme: 'dark',
  language: 'en',
  notifications: true
});
// User alice (ID: 42)
// Settings: { theme: 'dark', language: 'en', notifications: true }

// Removing sensitive data
function sanitizeUser(user) {
  const { password, ssn, creditCard, ...safeData } = user;
  return safeData;
}

const rawUser = {
  name: 'John',
  email: 'john@example.com',
  password: 'secret123',
  ssn: '123-45-6789',
  age: 30
};

console.log(sanitizeUser(rawUser));
// { name: 'John', email: 'john@example.com', age: 30 }
```

### Renaming During Destructuring

You can assign properties to variables with different names using the colon (`:`) syntax.

**Basic Renaming:**

```javascript
const user = {
  name: 'Alice',
  age: 28,
  email: 'alice@example.com'
};

// Rename variables during destructuring
const { name: userName, age: userAge, email: userEmail } = user;

console.log(userName);  // 'Alice'
console.log(userAge);   // 28
console.log(userEmail); // 'alice@example.com'
// Note: 'name', 'age', 'email' are NOT defined
```

**Renaming with Default Values:**

```javascript
const settings = {
  theme: 'light',
  language: 'en'
};

// Combine renaming and default values
const {
  theme: selectedTheme = 'dark',
  language: lang = 'en',
  fontSize: size = 14
} = settings;

console.log(selectedTheme); // 'light'
console.log(lang);          // 'en'
console.log(size);          // 14 (default used)
```

**Renaming in Nested Destructuring:**

```javascript
const response = {
  status: 200,
  data: {
    user: {
      id: 1,
      info: {
        firstName: 'John',
        lastName: 'Doe'
      }
    }
  }
};

// Rename nested properties
const {
  status: httpStatus,
  data: {
    user: {
      id: userId,
      info: { firstName: first, lastName: last }
    }
  }
} = response;

console.log(httpStatus); // 200
console.log(userId);     // 1
console.log(first);      // 'John'
console.log(last);       // 'Doe'
```

**Practical Example - Avoiding Naming Conflicts:**

```javascript
// When fetching data from multiple sources
const localUser = { name: 'LocalUser', id: 1 };
const remoteUser = { name: 'RemoteUser', id: 2 };

const { name: localName, id: localId } = localUser;
const { name: remoteName, id: remoteId } = remoteUser;

console.log(localName, localId);   // 'LocalUser' 1
console.log(remoteName, remoteId); // 'RemoteUser' 2
```

**Function Parameters with Destructuring:**

```javascript
// Rename and provide defaults in function parameters
function createUser({ 
  name: userName, 
  email: userEmail, 
  role: userRole = 'guest' 
}) {
  return {
    userName,
    userEmail,
    userRole,
    createdAt: new Date()
  };
}

const newUser = createUser({ 
  name: 'Bob', 
  email: 'bob@example.com' 
});

console.log(newUser);
// {
//   userName: 'Bob',
//   userEmail: 'bob@example.com',
//   userRole: 'guest',
//   createdAt: [current date]
// }
```

---

## 4.5 Spread and Rest

The spread (`...`) and rest (`...`) operators use the same syntax but serve opposite purposes. Spread expands elements, while rest collects them.

### Spread Operator with Objects

The spread operator unpacks object properties into a new object or combines multiple objects.

**Basic Object Spreading:**

```javascript
const person = {
  name: 'Alice',
  age: 30
};

// Create a copy
const personCopy = { ...person };

console.log(personCopy); // { name: 'Alice', age: 30 }
console.log(personCopy === person); // false (different objects)
```

**Combining Objects:**

```javascript
const basicInfo = {
  name: 'Bob',
  age: 25
};

const contactInfo = {
  email: 'bob@example.com',
  phone: '555-0123'
};

// Merge objects
const completeProfile = { ...basicInfo, ...contactInfo };

console.log(completeProfile);
// {
//   name: 'Bob',
//   age: 25,
//   email: 'bob@example.com',
//   phone: '555-0123'
// }
```

**Overriding Properties:**

```javascript
const defaults = {
  theme: 'light',
  fontSize: 14,
  language: 'en'
};

const userPreferences = {
  theme: 'dark',
  fontSize: 16
};

// Later properties override earlier ones
const finalSettings = { ...defaults, ...userPreferences };

console.log(finalSettings);
// { theme: 'dark', fontSize: 16, language: 'en' }

// Order matters!
const reversedSettings = { ...userPreferences, ...defaults };
console.log(reversedSettings);
// { theme: 'light', fontSize: 14, language: 'en' }
```

**Adding or Modifying Properties:**

```javascript
const user = {
  id: 1,
  name: 'Charlie',
  email: 'charlie@example.com'
};

// Add new properties
const userWithTimestamp = {
  ...user,
  createdAt: new Date(),
  isActive: true
};

console.log(userWithTimestamp);
// {
//   id: 1,
//   name: 'Charlie',
//   email: 'charlie@example.com',
//   createdAt: [current date],
//   isActive: true
// }

// Modify existing property
const updatedUser = {
  ...user,
  name: 'Charles' // Override name
};

console.log(updatedUser);
// { id: 1, name: 'Charles', email: 'charlie@example.com' }
```

**Conditional Spreading:**

```javascript
const baseConfig = {
  host: 'localhost',
  port: 3000
};

const isProduction = false;

const config = {
  ...baseConfig,
  ...(isProduction && {
    host: 'example.com',
    ssl: true
  })
};

console.log(config);
// { host: 'localhost', port: 3000 }
// (production settings not added because isProduction is false)
```

**Nested Object Spreading:**

```javascript
const user = {
  name: 'Diana',
  address: {
    street: '123 Main St',
    city: 'Boston'
  }
};

// CAREFUL: This is a shallow copy
const userCopy = { ...user };

userCopy.address.city = 'New York';

console.log(user.address.city);     // 'New York' (original modified!)
console.log(userCopy.address.city); // 'New York'

// To properly copy nested objects, use deep spreading
const properCopy = {
  ...user,
  address: { ...user.address }
};

properCopy.address.city = 'Seattle';

console.log(user.address.city);       // 'New York' (unchanged)
console.log(properCopy.address.city); // 'Seattle'
```

### Rest Properties

The rest operator collects remaining properties into a new object. It's the opposite of spread.

**Basic Rest in Objects:**

```javascript
const person = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30,
  city: 'New York',
  country: 'USA'
};

// Destructure some properties, collect the rest
const { firstName, lastName, ...details } = person;

console.log(firstName); // 'John'
console.log(lastName);  // 'Doe'
console.log(details);   // { age: 30, city: 'New York', country: 'USA' }
```

**Rest in Function Parameters:**

```javascript
// Collect all properties except specific ones
function updateUser(userId, { name, email, ...otherUpdates }) {
  console.log(`Updating user ${userId}`);
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Other updates:', otherUpdates);
}

updateUser(123, {
  name: 'Alice',
  email: 'alice@example.com',
  age: 28,
  city: 'Boston',
  preferences: { theme: 'dark' }
});
// Updating user 123
// Name: Alice
// Email: alice@example.com
// Other updates: { age: 28, city: 'Boston', preferences: { theme: 'dark' } }
```

**Filtering Object Properties:**

```javascript
// Remove unwanted properties
function removePrivateFields(obj) {
  const { password, ssn, creditCard, ...publicData } = obj;
  return publicData;
}

const user = {
  name: 'Bob',
  email: 'bob@example.com',
  password: 'secret',
  ssn: '123-45-6789',
  age: 35
};

const safeUser = removePrivateFields(user);
console.log(safeUser); // { name: 'Bob', email: 'bob@example.com', age: 35 }
```

**Combining Spread and Rest:**

```javascript
const original = {
  id: 1,
  name: 'Product',
  price: 99.99,
  category: 'Electronics',
  stock: 50
};

// Extract some fields, modify others, keep the rest
function transformProduct(product) {
  const { id, name, ...rest } = product;
  
  return {
    productId: id,
    productName: name.toUpperCase(),
    ...rest,
    lastModified: new Date()
  };
}

console.log(transformProduct(original));
// {
//   productId: 1,
//   productName: 'PRODUCT',
//   price: 99.99,
//   category: 'Electronics',
//   stock: 50,
//   lastModified: [current date]
// }
```

### Shallow vs Deep Copying

Understanding the difference between shallow and deep copying is crucial when working with objects.

**Shallow Copy Behavior:**

```javascript
const original = {
  name: 'Alice',
  age: 30,
  hobbies: ['reading', 'gaming'],
  address: {
    city: 'New York',
    country: 'USA'
  }
};

// Shallow copy using spread
const shallowCopy = { ...original };

// Modify primitive value (safe)
shallowCopy.name = 'Bob';
console.log(original.name); // 'Alice' (unchanged)
console.log(shallowCopy.name); // 'Bob'

// Modify nested object (NOT safe)
shallowCopy.address.city = 'Boston';
console.log(original.address.city); // 'Boston' (changed!)
console.log(shallowCopy.address.city); // 'Boston'

// Modify array (NOT safe)
shallowCopy.hobbies.push('cooking');
console.log(original.hobbies); // ['reading', 'gaming', 'cooking'] (changed!)
```

**Why Shallow Copy Shares References:**

```javascript
const obj = {
  primitive: 42,
  reference: { nested: 'value' }
};

const copy = { ...obj };

console.log(obj.reference === copy.reference); // true (same reference!)
console.log(obj.primitive === copy.primitive); // true (but this is safe because it's a primitive)
```

**Manual Deep Copy:**

```javascript
const original = {
  name: 'Charlie',
  scores: [85, 90, 78],
  details: {
    age: 25,
    address: {
      city: 'Seattle',
      zip: '98101'
    }
  }
};

// Manual deep copy (one level at a time)
const deepCopy = {
  ...original,
  scores: [...original.scores],
  details: {
    ...original.details,
    address: { ...original.details.address }
  }
};

// Now modifications are safe
deepCopy.scores.push(95);
deepCopy.details.address.city = 'Portland';

console.log(original.scores); // [85, 90, 78] (unchanged)
console.log(original.details.address.city); // 'Seattle' (unchanged)
console.log(deepCopy.scores); // [85, 90, 78, 95]
console.log(deepCopy.details.address.city); // 'Portland'
```

**Using `JSON` for Deep Copy:**

```javascript
const original = {
  name: 'Diana',
  age: 28,
  hobbies: ['painting', 'yoga'],
  address: {
    city: 'Austin',
    state: 'TX'
  }
};

// Quick deep copy using JSON (with limitations)
const deepCopy = JSON.parse(JSON.stringify(original));

deepCopy.address.city = 'Dallas';
deepCopy.hobbies.push('reading');

console.log(original.address.city); // 'Austin' (unchanged)
console.log(original.hobbies); // ['painting', 'yoga'] (unchanged)
console.log(deepCopy.address.city); // 'Dallas'
console.log(deepCopy.hobbies); // ['painting', 'yoga', 'reading']
```

**Limitations of JSON Deep Copy:**

```javascript
const complex = {
  date: new Date(),
  regex: /test/i,
  func: function() { return 'hello'; },
  undef: undefined,
  symbol: Symbol('sym'),
  nan: NaN,
  infinity: Infinity
};

const copied = JSON.parse(JSON.stringify(complex));

console.log(copied);
// {
//   date: '2024-01-15T10:30:00.000Z' (converted to string!)
//   regex: {} (converted to empty object!)
//   // func: missing (functions are not copied!)
//   // undef: missing (undefined is not copied!)
//   // symbol: missing (symbols are not copied!)
//   nan: null (NaN becomes null!)
//   infinity: null (Infinity becomes null!)
// }
```

**Best Practices:**

```javascript
// For simple objects with primitives only: use spread
const simpleObj = { a: 1, b: 2, c: 3 };
const copy1 = { ...simpleObj }; // ✓ Safe

// For objects with one level of nesting: manual deep spread
const oneLevel = { 
  x: 1, 
  nested: { y: 2 } 
};
const copy2 = { 
  ...oneLevel, 
  nested: { ...oneLevel.nested } 
}; // ✓ Safe

// For complex nested objects without special types: JSON method
const complex = {
  a: { b: { c: { d: 1 } } }
};
const copy3 = JSON.parse(JSON.stringify(complex)); // ✓ Works

// For objects with functions, dates, etc.: use a library
// lodash: _.cloneDeep(obj)
// structuredClone (modern browsers): structuredClone(obj)
```

**Modern Alternative - `structuredClone`:**

```javascript
const original = {
  date: new Date(),
  array: [1, 2, 3],
  nested: {
    deep: {
      value: 'test'
    }
  },
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3])
};

// Modern deep clone (Node.js 17+, modern browsers)
const deepCopy = structuredClone(original);

deepCopy.nested.deep.value = 'modified';
deepCopy.array.push(4);

console.log(original.nested.deep.value); // 'test' (unchanged)
console.log(original.array); // [1, 2, 3] (unchanged)
console.log(deepCopy.nested.deep.value); // 'modified'
console.log(deepCopy.array); // [1, 2, 3, 4]
```

---

## 4.6 `this` Keyword

### Why `this` Is Confusing (And Why It Matters)

The `this` keyword is one of JavaScript's most misunderstood features. Unlike most languages where `this` always refers to the current object instance, **JavaScript's `this` is determined at call time, not definition time.**

This matters because:

- **Method borrowing** — You can use one object's method on another object
- **Event handlers** — `this` inside handlers refers to the element, not your object
- **Callbacks** — `this` often gets "lost" when passing methods as callbacks
- **Arrow functions** — They inherit `this` from their enclosing scope, changing the rules

Understanding `this` prevents bugs like "Cannot read property of undefined" when `this` isn't what you expect.

### The Core Rule

The `this` keyword in JavaScript refers to the object that is currently executing the code. **Its value depends on how a function is called, not where it's defined.**

| Call Style | `this` Value |
|------------|--------------|
| `obj.method()` | `obj` |
| `func()` | `globalThis` (sloppy) / `undefined` (strict) |
| `new Func()` | The new instance |
| `func.call(obj)` | `obj` |
| `() => {}` | Inherited from enclosing scope |

### Global Context

In the global execution context, `this` refers to the global object.

**In Browser Environment:**

```javascript
console.log(this); // Window object

this.globalVar = 'I am global';
console.log(window.globalVar); // 'I am global'

var anotherVar = 'Also global';
console.log(this.anotherVar); // 'Also global'
```

**In Node.js Environment:**

```javascript
console.log(this); // {} (empty object in module scope)

// In the global scope (outside module)
// this would refer to the global object
```

**Global Functions:**

```javascript
function showThis() {
  console.log(this);
}

showThis(); // Window object (browser) or global object (Node.js)
```

### Function Context

In regular functions, `this` depends on how the function is called, not where it's defined.

**Simple Function Call:**

```javascript
function regularFunction() {
  console.log(this);
}

regularFunction(); // Window (non-strict) or undefined (strict mode)
```

**Function Call Variations:**

```javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

// Direct call - this is undefined (strict mode) or global (non-strict)
greet('Hello'); // Error in strict mode or "Hello, undefined" in non-strict

// Assigned to variable
const greetFunc = greet;
greetFunc('Hi'); // Same behavior as direct call
```

### Method Context

When a function is called as a method of an object, `this` refers to that object.

**Basic Method Call:**

```javascript
const person = {
  name: 'Alice',
  age: 30,
  greet: function() {
    console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
  }
};

person.greet(); // "Hello, I'm Alice and I'm 30 years old."
// this === person
```

**Method with Nested Properties:**

```javascript
const user = {
  firstName: 'John',
  lastName: 'Doe',
  fullName: function() {
    return this.firstName + ' ' + this.lastName;
  },
  getInfo: function() {
    return {
      name: this.fullName(),
      description: `User: ${this.firstName}`
    };
  }
};

console.log(user.fullName()); // 'John Doe'
console.log(user.getInfo()); // { name: 'John Doe', description: 'User: John' }
```

**Losing `this` Context:**

```javascript
const person = {
  name: 'Bob',
  sayName: function() {
    console.log(this.name);
  }
};

person.sayName(); // 'Bob' (this === person)

// Losing context when assigned to variable
const sayNameFunc = person.sayName;
sayNameFunc(); // undefined (this is global/undefined)

// Losing context in callbacks
setTimeout(person.sayName, 1000); // undefined (after 1 second)
```

**Nested Objects:**

```javascript
const company = {
  name: 'Tech Corp',
  department: {
    name: 'Engineering',
    manager: {
      name: 'Alice',
      introduce: function() {
        console.log(`I'm ${this.name}`);
      }
    }
  }
};

company.department.manager.introduce(); // "I'm Alice"
// this refers to the immediate parent (manager object)
```

### Constructor Context

When a function is used as a constructor with the `new` keyword, `this` refers to the newly created object.

**Basic Constructor:**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    console.log(`Hello, I'm ${this.name}`);
  };
}

const alice = new Person('Alice', 30);
const bob = new Person('Bob', 25);

alice.greet(); // "Hello, I'm Alice"
bob.greet();   // "Hello, I'm Bob"

console.log(alice.name); // 'Alice'
console.log(bob.name);   // 'Bob'
```

**What `new` Does:**

```javascript
function User(username) {
  // 1. new creates empty object: this = {}
  // 2. Sets prototype: this.__proto__ = User.prototype
  // 3. Executes function body
  this.username = username;
  this.isActive = true;
  // 4. Returns this (implicitly)
}

const user1 = new User('john_doe');
console.log(user1); // User { username: 'john_doe', isActive: true }
```

**Forgetting `new` Keyword:**

```javascript
function Person(name) {
  this.name = name;
}

// Without new - this refers to global object
const wrongPerson = Person('Charlie');
console.log(wrongPerson); // undefined (function doesn't return anything)
console.log(window.name); // 'Charlie' (accidentally created global variable!)

// With new - this refers to new object
const correctPerson = new Person('Diana');
console.log(correctPerson); // Person { name: 'Diana' }
```

**Constructor with Return Value:**

```javascript
function CustomObject(value) {
  this.value = value;
  
  // Returning object overrides the default behavior
  return { customValue: value * 2 };
}

const obj = new CustomObject(5);
console.log(obj); // { customValue: 10 } (returned object is used)

function AnotherObject(value) {
  this.value = value;
  
  // Returning primitive doesn't override
  return 42;
}

const obj2 = new AnotherObject(10);
console.log(obj2); // AnotherObject { value: 10 } (primitive return ignored)
```

### Arrow Functions and `this`

Arrow functions don't have their own `this` binding. They inherit `this` from the enclosing lexical context.

**Basic Arrow Function Behavior:**

```javascript
const obj = {
  name: 'Regular Object',
  regularFunc: function() {
    console.log('Regular:', this.name);
  },
  arrowFunc: () => {
    console.log('Arrow:', this.name);
  }
};

obj.regularFunc(); // 'Regular: Regular Object'
obj.arrowFunc();   // 'Arrow: undefined' (inherits global this)
```

**Arrow Functions in Methods:**

```javascript
const person = {
  name: 'Alice',
  hobbies: ['reading', 'gaming', 'cooking'],
  
  showHobbies: function() {
    this.hobbies.forEach(function(hobby) {
      // Regular function - this is undefined/global
      console.log(this.name + ' likes ' + hobby); // Error or wrong output
    });
  },
  
  showHobbiesArrow: function() {
    this.hobbies.forEach((hobby) => {
      // Arrow function - this inherited from showHobbiesArrow
      console.log(this.name + ' likes ' + hobby); // Works correctly!
    });
  }
};

// person.showHobbies(); // Error or "undefined likes reading"
person.showHobbiesArrow();
// Alice likes reading
// Alice likes gaming
// Alice likes cooking
```

**Common Use Case - Callbacks:**

```javascript
const counter = {
  count: 0,
  
  // Using regular function (problematic)
  startRegular: function() {
    setInterval(function() {
      this.count++; // this is global/undefined, not counter
      console.log(this.count);
    }, 1000);
  },
  
  // Using arrow function (correct)
  startArrow: function() {
    setInterval(() => {
      this.count++; // this is counter object
      console.log(this.count);
    }, 1000);
  },
  
  // Using bind (alternative solution)
  startBind: function() {
    setInterval(function() {
      this.count++;
      console.log(this.count);
    }.bind(this), 1000);
  }
};

counter.startArrow(); // 1, 2, 3, 4... (works correctly)
```

**Arrow Functions and Constructors:**

```javascript
// Arrow functions CANNOT be used as constructors
const Person = (name) => {
  this.name = name;
};

// const p = new Person('Alice'); // TypeError: Person is not a constructor
```

**Nested Arrow Functions:**

```javascript
const obj = {
  name: 'Outer',
  
  method: function() {
    console.log('Method this:', this.name); // 'Outer'
    
    const inner1 = () => {
      console.log('Arrow 1 this:', this.name); // 'Outer' (inherited)
      
      const inner2 = () => {
        console.log('Arrow 2 this:', this.name); // 'Outer' (inherited)
      };
      
      inner2();
    };
    
    inner1();
  }
};

obj.method();
// Method this: Outer
// Arrow 1 this: Outer
// Arrow 2 this: Outer
```

### Explicit Binding (`call`, `apply`, `bind`)

JavaScript provides methods to explicitly set the value of `this` in a function call.

**`call()` Method:**

```javascript
function greet(greeting, punctuation) {
  console.log(greeting + ', ' + this.name + punctuation);
}

const person1 = { name: 'Alice' };
const person2 = { name: 'Bob' };

// call(thisArg, arg1, arg2, ...)
greet.call(person1, 'Hello', '!'); // "Hello, Alice!"
greet.call(person2, 'Hi', '.'); // "Hi, Bob."
```

**`apply()` Method:**

```javascript
function introduce(greeting, age, city) {
  console.log(`${greeting}, I'm ${this.name}, ${age} years old from ${city}`);
}

const person = { name: 'Charlie' };

// apply(thisArg, [argsArray])
introduce.apply(person, ['Hello', 30, 'New York']);
// "Hello, I'm Charlie, 30 years old from New York"
```

**`call()` vs `apply()`:**

```javascript
function sum(a, b, c) {
  return a + b + c + this.base;
}

const obj = { base: 10 };

// call - arguments passed individually
console.log(sum.call(obj, 1, 2, 3)); // 16 (1+2+3+10)

// apply - arguments passed as array
console.log(sum.apply(obj, [1, 2, 3])); // 16 (1+2+3+10)

// Practical use of apply with Math.max
const numbers = [5, 2, 9, 1, 7];
console.log(Math.max.apply(null, numbers)); // 9
```

**`bind()` Method:**

```javascript
function greet(greeting) {
  console.log(greeting + ', ' + this.name);
}

const person = { name: 'Diana' };

// bind returns a NEW function with this permanently set
const greetDiana = greet.bind(person);

greetDiana('Hello'); // "Hello, Diana"
greetDiana('Hi');    // "Hi, Diana"

// Original function unchanged
greet('Hey'); // "Hey, undefined" (this is global)
```

**Partial Application with `bind()`:**

```javascript
function multiply(a, b) {
  return a * b;
}

// Pre-set first argument
const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);

console.log(double(5)); // 10 (2 * 5)
console.log(triple(5)); // 15 (3 * 5)
```

**Fixing Lost Context with `bind()`:**

```javascript
const person = {
  name: 'Emma',
  sayName: function() {
    console.log(this.name);
  }
};

// Problem: lost context
setTimeout(person.sayName, 1000); // undefined

// Solution 1: bind
setTimeout(person.sayName.bind(person), 1000); // 'Emma'

// Solution 2: arrow function
setTimeout(() => person.sayName(), 1000); // 'Emma'

// Solution 3: wrapper function
setTimeout(function() { person.sayName(); }, 1000); // 'Emma'
```

**Chaining Bind Calls:**

```javascript
function show() {
  console.log(this.value);
}

const obj1 = { value: 'First' };
const obj2 = { value: 'Second' };

const bound1 = show.bind(obj1);
const bound2 = bound1.bind(obj2); // Trying to rebind

bound1(); // 'First'
bound2(); // 'First' (still uses obj1! Cannot rebind)
```

**Explicit Binding with Arrow Functions:**

```javascript
const arrowFunc = () => {
  console.log(this.value);
};

const obj = { value: 'Test' };

// Arrow functions ignore call/apply/bind
arrowFunc.call(obj);  // undefined (uses lexical this)
arrowFunc.apply(obj); // undefined
const boundArrow = arrowFunc.bind(obj);
boundArrow(); // undefined

// Arrow functions inherit this from where they're defined
const container = {
  value: 'Container',
  getArrow: function() {
    return () => console.log(this.value);
  }
};

const myArrow = container.getArrow();
myArrow(); // 'Container' (inherited from getArrow's this)
myArrow.call({ value: 'Other' }); // Still 'Container' (cannot be changed)
```

### `this` in Event Handlers

In event handlers, `this` typically refers to the element that triggered the event.

**DOM Event Handlers:**

```javascript
// HTML: <button id="myButton">Click Me</button>

const button = document.getElementById('myButton');

// Regular function - this is the button element
button.addEventListener('click', function() {
  console.log(this); // <button id="myButton">
  console.log(this.textContent); // "Click Me"
  this.style.backgroundColor = 'blue';
});
```

**Arrow Functions in Event Handlers:**

```javascript
const button = document.getElementById('myButton');

// Arrow function - this is NOT the button
button.addEventListener('click', () => {
  console.log(this); // Window or whatever this was in outer scope
  // this.style.backgroundColor = 'blue'; // Won't work as expected!
});
```

**Using `this` in Object Methods as Event Handlers:**

```javascript
const app = {
  count: 0,
  buttonElement: document.getElementById('myButton'),
  
  init: function() {
    // Problem: this will be the button, not app
    this.buttonElement.addEventListener('click', this.handleClick);
    
    // Solution 1: bind
    // this.buttonElement.addEventListener('click', this.handleClick.bind(this));
    
    // Solution 2: arrow function
    // this.buttonElement.addEventListener('click', () => this.handleClick());
  },
  
  handleClick: function() {
    this.count++; // If not bound correctly, this.count is undefined
    console.log('Count:', this.count);
  }
};

// Proper implementation
const betterApp = {
  count: 0,
  buttonElement: document.getElementById('myButton'),
  
  init: function() {
    this.buttonElement.addEventListener('click', this.handleClick.bind(this));
  },
  
  handleClick: function(event) {
    this.count++;
    console.log('Count:', this.count);
    console.log('Clicked element:', event.currentTarget); // Access element via event
  }
};

betterApp.init();
```

**Inline Event Handlers:**

```html
<!-- HTML with inline handler -->
<button onclick="handleClick()">Click Me</button>

<script>
// this in inline handlers refers to the element
function handleClick() {
  console.log(this); // Window (function called in global context)
}

// To access element, use:
// <button onclick="handleClick.call(this)">Click Me</button>
// Now this inside handleClick will be the button
</script>
```

**Multiple Event Handlers:**

```javascript
const element = document.getElementById('myElement');

const handler = {
  name: 'Handler Object',
  
  onClick: function(event) {
    console.log('Clicked by:', this.name);
    console.log('Element:', event.currentTarget);
  },
  
  onHover: function(event) {
    console.log('Hovered by:', this.name);
  }
};

// Must bind to preserve this context
element.addEventListener('click', handler.onClick.bind(handler));
element.addEventListener('mouseenter', handler.onHover.bind(handler));
```

### `this` in Strict Mode

Strict mode changes how `this` behaves in certain contexts.

**Global Context in Strict Mode:**

```javascript
'use strict';

console.log(this); // undefined (in function context)

function showThis() {
  console.log(this);
}

showThis(); // undefined (not Window!)
```

**Non-Strict vs Strict Mode:**

```javascript
// Non-strict mode
function nonStrict() {
  console.log(this); // Window or global object
}

nonStrict();

// Strict mode
function strictMode() {
  'use strict';
  console.log(this); // undefined
}

strictMode();
```

**Method Calls (Same in Both Modes):**

```javascript
'use strict';

const obj = {
  method: function() {
    console.log(this);
  }
};

obj.method(); // obj (same as non-strict mode)
```

**Accidental Global Assignment Prevention:**

```javascript
'use strict';

function Person(name) {
  this.name = name; // TypeError if called without 'new'
}

// Person('Alice'); // TypeError: Cannot set property 'name' of undefined

const person = new Person('Alice'); // Works fine
console.log(person.name); // 'Alice'
```

**Strict Mode in Different Scopes:**

```javascript
// Non-strict outer scope
function outer() {
  console.log('Outer this:', this); // Window/global
  
  function inner() {
    'use strict';
    console.log('Inner this:', this); // undefined
  }
  
  inner();
}

outer();
```

### Common Pitfalls and Solutions

Understanding common `this` pitfalls helps avoid bugs and write better code.

**Pitfall 1: Losing Context in Callbacks**

```javascript
// Problem
const user = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task); // this is undefined!
    });
  }
};

// Solution 1: Arrow function
const user1 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach((task) => {
      console.log(this.name + ' needs to do: ' + task); // Works!
    });
  }
};

// Solution 2: Bind
const user2 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task);
    }.bind(this)); // Bind this to the callback
  }
};

// Solution 3: Store this in variable
const user3 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    const self = this; // Store reference
    this.tasks.forEach(function(task) {
      console.log(self.name + ' needs to do: ' + task); // Use stored reference
    });
  }
};

// Solution 4: forEach thisArg parameter
const user4 = {
  name: 'Alice',
  tasks: ['task1', 'task2'],
  
  showTasks: function() {
    this.tasks.forEach(function(task) {
      console.log(this.name + ' needs to do: ' + task);
    }, this); // Pass this as second argument
  }
};
```

**Pitfall 2: Method Assignment**

```javascript
// Problem
const person = {
  name: 'Bob',
  greet: function() {
    console.log('Hello, ' + this.name);
  }
};

const greet = person.greet;
greet(); // "Hello, undefined" - lost context!

// Solution 1: Call as method
person.greet(); // "Hello, Bob"

// Solution 2: Bind
const boundGreet = person.greet.bind(person);
boundGreet(); // "Hello, Bob"

// Solution 3: Wrapper function
const wrappedGreet = () => person.greet();
wrappedGreet(); // "Hello, Bob"
```

**Pitfall 3: Nested Functions**

```javascript
// Problem
const obj = {
  value: 42,
  
  outerMethod: function() {
    console.log('Outer:', this.value); // 42
    
    function innerFunction() {
      console.log('Inner:', this.value); // undefined - lost context!
    }
    
    innerFunction();
  }
};

obj.outerMethod();

// Solution: Arrow function for inner function
const obj2 = {
  value: 42,
  
  outerMethod: function() {
    console.log('Outer:', this.value); // 42
    
    const innerFunction = () => {
      console.log('Inner:', this.value); // 42 - inherited context!
    };
    
    innerFunction();
  }
};

obj2.outerMethod();
```

**Pitfall 4: setTimeout/setInterval**

```javascript
// Problem
const timer = {
  seconds: 0,
  
  start: function() {
    setInterval(function() {
      this.seconds++; // this is global/undefined!
      console.log(this.seconds);
    }, 1000);
  }
};

// Solution 1: Arrow function
const timer1 = {
  seconds: 0,
  
  start: function() {
    setInterval(() => {
      this.seconds++;
      console.log(this.seconds);
    }, 1000);
  }
};

// Solution 2: Bind
const timer2 = {
  seconds: 0,
  
  start: function() {
    setInterval(function() {
      this.seconds++;
      console.log(this.seconds);
    }.bind(this), 1000);
  }
};

// Solution 3: Store this
const timer3 = {
  seconds: 0,
  
  start: function() {
    const self = this;
    setInterval(function() {
      self.seconds++;
      console.log(self.seconds);
    }, 1000);
  }
};
```

**Pitfall 5: Class Methods as Callbacks**

```javascript
// Problem
class Button {
  constructor(label) {
    this.label = label;
  }
  
  click() {
    console.log('Button clicked:', this.label);
  }
}

const myButton = new Button('Submit');
const element = document.getElementById('btn');

// This won't work correctly
// element.addEventListener('click', myButton.click); // this.label is undefined

// Solution 1: Bind in constructor
class Button1 {
  constructor(label) {
    this.label = label;
    this.click = this.click.bind(this); // Bind in constructor
  }
  
  click() {
    console.log('Button clicked:', this.label);
  }
}

// Solution 2: Arrow function
class Button2 {
  constructor(label) {
    this.label = label;
  }
  
  // Class field with arrow function
  click = () => {
    console.log('Button clicked:', this.label);
  }
}

// Solution 3: Wrapper
const myButton3 = new Button('Submit');
element.addEventListener('click', () => myButton3.click());
```

**Pitfall 6: Destructuring Methods**

```javascript
// Problem
const user = {
  name: 'Charlie',
  getName: function() {
    return this.name;
  }
};

const { getName } = user;
console.log(getName()); // undefined - lost context!

// Solution 1: Don't destructure
console.log(user.getName()); // 'Charlie'

// Solution 2: Bind during destructuring
const { getName: boundGetName } = user;
const finalGetName = boundGetName.bind(user);
console.log(finalGetName()); // 'Charlie'

// Solution 3: Use arrow function wrapper
const user2 = {
  name: 'Charlie',
  getName: function() {
    return this.name;
  }
};

const getNameWrapper = () => user2.getName();
console.log(getNameWrapper()); // 'Charlie'
```

**Best Practices Summary:**

```javascript
// 1. Use arrow functions for callbacks when you need to preserve this
const obj1 = {
  method() {
    setTimeout(() => {
      // this refers to obj1
    }, 1000);
  }
};

// 2. Bind methods in constructor for event handlers
class Component {
  constructor() {
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    // this always refers to the component
  }
}

// 3. Store this in a variable when arrow functions aren't available
const obj2 = {
  method() {
    const self = this;
    someCallback(function() {
      // use self instead of this
    });
  }
};

// 4. Use call/apply/bind when you need explicit control
function greet() {
  console.log(this.name);
}
greet.call({ name: 'Alice' });

// 5. Remember: arrow functions inherit this, regular functions get their own
```

---


## 4.7 Objects Summary

| Concept | Key Points |
|---------|------------|
| **Object Literals** | `{}` syntax; shorthand properties/methods |
| **Property Access** | Dot notation vs bracket notation |
| **Property Descriptors** | `writable`, `enumerable`, `configurable` |
| **Object Methods** | `keys()`, `values()`, `entries()`, `assign()`, `freeze()` |
| **Destructuring** | Extract properties into variables |
| **Spread/Rest** | `...` for copying/merging objects |
| **`this` Keyword** | Context-dependent; binding rules matter |

### Best Practices

1. **Use shorthand syntax** for concise object literals
2. **Prefer `Object.keys/values/entries`** over `for...in`
3. **Use destructuring** for cleaner parameter handling
4. **Spread for shallow copies** — not deep cloning
5. **Understand `this` binding** — arrow functions inherit, regular functions don't
6. **Use `Object.freeze()`** for true immutability

---

**End of Chapter 4: Objects**

With object fundamentals mastered, you're ready to explore prototypes and inheritance.
