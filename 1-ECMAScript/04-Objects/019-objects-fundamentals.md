# 4. Objects and Object-Oriented Programming

## 4.1 Object Fundamentals

### Introduction

Objects are JavaScript's fundamental data structure. They're collections of key-value pairs (properties) and the foundation of JavaScript's object-oriented features.

Understanding object creation, property access, and the various syntaxes is essential for mastering JavaScript.

---

## 4.1.1 Object Literals

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

## 4.1.2 Object Creation Methods

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

## 4.1.3 Property Access

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

## 4.1.4 Computed Property Names

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

## 4.1.5 Property Shorthand

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

## 4.1.6 Method Shorthand

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

