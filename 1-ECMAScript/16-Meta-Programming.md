# 16 Meta Programming

---

# Meta-programming

## Table of Contents

- [16.1 Property Descriptors](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#161-property-descriptors)
- [16.2 Object Introspection](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#162-object-introspection)
- [16.3 Function Introspection](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#163-function-introspection)

---

## 16.1 Property Descriptors

Property descriptors define the characteristics of object properties. They control whether properties can be changed, deleted, or enumerated.

### Configuring Object Properties

Every property has a descriptor with specific attributes that control its behavior.

**Getting Property Descriptors:**

```javascript
const obj = {
  name: 'Alice',
  age: 30
};

// Get descriptor for a property
const descriptor = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(descriptor);
// {
//   value: 'Alice',
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

// Properties created normally have all attributes set to true
const ageDescriptor = Object.getOwnPropertyDescriptor(obj, 'age');
console.log(ageDescriptor);
// {
//   value: 30,
//   writable: true,
//   enumerable: true,
//   configurable: true
// }

// Non-existent properties return undefined
console.log(Object.getOwnPropertyDescriptor(obj, 'nonExistent')); // undefined
```

**Defining Properties with Descriptors:**

```javascript
const obj = {};

// Define property with specific attributes
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true
});

// Define read-only property
Object.defineProperty(obj, 'id', {
  value: 123,
  writable: false,     // Cannot be changed
  enumerable: true,
  configurable: false  // Cannot be deleted or reconfigured
});

console.log(obj.id); // 123
obj.id = 456; // Fails silently in non-strict mode
console.log(obj.id); // Still 123

try {
  'use strict';
  obj.id = 456; // TypeError in strict mode
} catch (e) {
  console.log('Cannot modify read-only property');
}
```

**Data Descriptors vs Accessor Descriptors:**

```javascript
const obj = {};

// Data descriptor (value-based)
Object.defineProperty(obj, 'dataProperty', {
  value: 42,
  writable: true,
  enumerable: true,
  configurable: true
});

// Accessor descriptor (getter/setter-based)
let internalValue = 0;
Object.defineProperty(obj, 'accessorProperty', {
  get() {
    console.log('Getting value');
    return internalValue;
  },
  set(value) {
    console.log('Setting value:', value);
    internalValue = value;
  },
  enumerable: true,
  configurable: true
});

console.log(obj.dataProperty); // 42
obj.accessorProperty = 100; // "Setting value: 100"
console.log(obj.accessorProperty); // "Getting value" then 100

// Cannot mix data and accessor attributes
try {
  Object.defineProperty(obj, 'invalid', {
    value: 42,
    get() { return 0; } // Error: cannot have both
  });
} catch (e) {
  console.log('Cannot mix value and getter');
}
```

**Defining Multiple Properties:**

```javascript
const obj = {};

Object.defineProperties(obj, {
  firstName: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  lastName: {
    value: 'Smith',
    writable: true,
    enumerable: true,
    configurable: true
  },
  fullName: {
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
    set(value) {
      const parts = value.split(' ');
      this.firstName = parts[0];
      this.lastName = parts[1];
    },
    enumerable: true,
    configurable: true
  },
  age: {
    value: 30,
    writable: true,
    enumerable: false, // Won't show in for...in
    configurable: true
  }
});

console.log(obj.fullName); // "Alice Smith"
obj.fullName = 'Bob Jones';
console.log(obj.firstName); // "Bob"
console.log(obj.lastName); // "Jones"

// Age is not enumerable
for (let key in obj) {
  console.log(key); // firstName, lastName, fullName (no age)
}
```

### Property Attributes Manipulation

Understanding and manipulating the four property attributes: `value`, `writable`, `enumerable`, and `configurable`.

**`writable` Attribute:**

```javascript
const obj = {};

// Create writable property
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true
});

obj.name = 'Bob'; // Works
console.log(obj.name); // "Bob"

// Create non-writable property
Object.defineProperty(obj, 'id', {
  value: 123,
  writable: false,
  enumerable: true,
  configurable: true
});

obj.id = 456; // Silently fails in non-strict mode
console.log(obj.id); // 123 (unchanged)

// In strict mode, throws TypeError
'use strict';
try {
  const strictObj = {};
  Object.defineProperty(strictObj, 'readonly', {
    value: 'fixed',
    writable: false
  });
  strictObj.readonly = 'changed'; // TypeError
} catch (e) {
  console.log('Cannot assign to read-only property');
}
```

**`enumerable` Attribute:**

```javascript
const obj = {
  public: 'visible',
  _private: 'hidden'
};

// Make _private non-enumerable
Object.defineProperty(obj, '_private', {
  enumerable: false
});

// for...in loop
console.log('for...in:');
for (let key in obj) {
  console.log(key); // Only 'public'
}

// Object.keys
console.log('Object.keys:', Object.keys(obj)); // ['public']

// JSON.stringify
console.log('JSON:', JSON.stringify(obj)); // {"public":"visible"}

// But still accessible
console.log(obj._private); // "hidden"

// Object.getOwnPropertyNames includes non-enumerable
console.log('All properties:', Object.getOwnPropertyNames(obj));
// ['public', '_private']
```

**`configurable` Attribute:**

```javascript
const obj = {};

// Create configurable property
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true
});

// Can change descriptor
Object.defineProperty(obj, 'name', {
  writable: false
});

// Can delete
delete obj.name;
console.log(obj.name); // undefined

// Create non-configurable property
Object.defineProperty(obj, 'id', {
  value: 123,
  writable: true,
  enumerable: true,
  configurable: false
});

// Cannot delete
delete obj.id;
console.log(obj.id); // 123 (still there)

// Cannot reconfigure
try {
  Object.defineProperty(obj, 'id', {
    enumerable: false // TypeError: cannot redefine property
  });
} catch (e) {
  console.log('Cannot reconfigure non-configurable property');
}

// Exception: Can change writable from true to false
Object.defineProperty(obj, 'id', {
  writable: false // This is allowed
});

// But cannot change back from false to true
try {
  Object.defineProperty(obj, 'id', {
    writable: true // TypeError
  });
} catch (e) {
  console.log('Cannot make non-configurable property writable again');
}
```

**Creating Immutable Properties:**

```javascript
function createConstant(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    writable: false,
    enumerable: true,
    configurable: false
  });
}

const config = {};
createConstant(config, 'API_KEY', 'secret123');
createConstant(config, 'MAX_RETRIES', 3);

console.log(config.API_KEY); // 'secret123'
config.API_KEY = 'changed'; // Fails silently
console.log(config.API_KEY); // Still 'secret123'
delete config.API_KEY; // Fails silently
console.log(config.API_KEY); // Still 'secret123'
```

**Creating Hidden Properties:**

```javascript
function addHiddenProperty(obj, name, value) {
  Object.defineProperty(obj, name, {
    value: value,
    writable: true,
    enumerable: false,
    configurable: true
  });
}

const user = { name: 'Alice' };
addHiddenProperty(user, '_id', 123);
addHiddenProperty(user, '_metadata', { created: new Date() });

console.log(user._id); // 123 (accessible)
console.log(Object.keys(user)); // ['name'] (hidden from enumeration)
console.log(JSON.stringify(user)); // {"name":"Alice"} (not in JSON)
```

**Computed Properties with Caching:**

```javascript
function createCachedProperty(obj, name, computeFn) {
  let cache;
  let computed = false;
  
  Object.defineProperty(obj, name, {
    get() {
      if (!computed) {
        console.log(`Computing ${name}...`);
        cache = computeFn.call(this);
        computed = true;
      }
      return cache;
    },
    enumerable: true,
    configurable: true
  });
}

const circle = { radius: 5 };

createCachedProperty(circle, 'area', function() {
  return Math.PI * this.radius ** 2;
});

createCachedProperty(circle, 'circumference', function() {
  return 2 * Math.PI * this.radius;
});

console.log(circle.area); // Computes and caches
console.log(circle.area); // Returns cached value
console.log(circle.circumference); // Computes and caches
```

**Validation with Setters:**

```javascript
const user = {};

Object.defineProperty(user, 'age', {
  get() {
    return this._age;
  },
  set(value) {
    if (typeof value !== 'number') {
      throw new TypeError('Age must be a number');
    }
    if (value < 0 || value > 150) {
      throw new RangeError('Age must be between 0 and 150');
    }
    this._age = value;
  },
  enumerable: true,
  configurable: true
});

Object.defineProperty(user, 'email', {
  get() {
    return this._email;
  },
  set(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value;
  },
  enumerable: true,
  configurable: true
});

user.age = 30; // Works
user.email = 'alice@example.com'; // Works

try {
  user.age = 'thirty'; // TypeError
} catch (e) {
  console.log(e.message);
}

try {
  user.email = 'invalid-email'; // Error
} catch (e) {
  console.log(e.message);
}
```

**Sealed and Frozen Objects:**

```javascript
// Object.seal - prevents adding/removing properties
const sealed = { name: 'Alice', age: 30 };
Object.seal(sealed);

sealed.name = 'Bob'; // Works (can modify)
sealed.newProp = 'value'; // Fails (cannot add)
delete sealed.age; // Fails (cannot delete)

console.log(Object.isSealed(sealed)); // true

// Under the hood, seal makes all properties non-configurable
const descriptor = Object.getOwnPropertyDescriptor(sealed, 'name');
console.log(descriptor.configurable); // false

// Object.freeze - makes object completely immutable
const frozen = { name: 'Charlie', age: 25 };
Object.freeze(frozen);

frozen.name = 'David'; // Fails (cannot modify)
frozen.newProp = 'value'; // Fails (cannot add)
delete frozen.age; // Fails (cannot delete)

console.log(Object.isFrozen(frozen)); // true

// Under the hood, freeze makes properties non-writable and non-configurable
const frozenDesc = Object.getOwnPropertyDescriptor(frozen, 'name');
console.log(frozenDesc.writable); // false
console.log(frozenDesc.configurable); // false
```

**Deep Freeze Implementation:**

```javascript
function deepFreeze(obj) {
  // Freeze the object itself
  Object.freeze(obj);
  
  // Recursively freeze all object properties
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = obj[prop];
    if (value && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  });
  
  return obj;
}

const data = {
  name: 'Alice',
  address: {
    city: 'New York',
    zip: '10001'
  },
  hobbies: ['reading', 'gaming']
};

deepFreeze(data);

data.name = 'Bob'; // Fails
data.address.city = 'Boston'; // Fails (nested object also frozen)
data.hobbies.push('cooking'); // Fails (array also frozen)

console.log(data);
// Original data unchanged
```

**Property Descriptor Utilities:**

```javascript
// Get all descriptors
function getAllDescriptors(obj) {
  const descriptors = {};
  for (const key of Object.getOwnPropertyNames(obj)) {
    descriptors[key] = Object.getOwnPropertyDescriptor(obj, key);
  }
  return descriptors;
}

const obj = {
  name: 'Alice',
  get age() { return 30; }
};

Object.defineProperty(obj, '_id', {
  value: 123,
  enumerable: false
});

console.log(getAllDescriptors(obj));
// {
//   name: { value: 'Alice', writable: true, ... },
//   age: { get: [Function], set: undefined, ... },
//   _id: { value: 123, writable: false, enumerable: false, ... }
// }

// Copy descriptors to another object
function copyWithDescriptors(source, target) {
  const descriptors = getAllDescriptors(source);
  Object.defineProperties(target, descriptors);
  return target;
}

const copy = copyWithDescriptors(obj, {});
console.log(copy.name); // 'Alice'
console.log(copy.age); // 30
console.log(Object.keys(copy)); // ['name'] (_id is hidden)
```

---

## 16.2 Object Introspection

Object introspection allows you to examine and analyze objects at runtime, discovering their properties, structure, and characteristics.

### `Object.getOwnPropertyNames()`

Returns an array of all property names (including non-enumerable ones) found directly on an object.

**Basic Usage:**

```javascript
const obj = {
  name: 'Alice',
  age: 30
};

// Add non-enumerable property
Object.defineProperty(obj, '_id', {
  value: 123,
  enumerable: false
});

// getOwnPropertyNames includes non-enumerable properties
console.log(Object.getOwnPropertyNames(obj));
// ['name', 'age', '_id']

// Compare with Object.keys (only enumerable)
console.log(Object.keys(obj));
// ['name', 'age']

// Compare with for...in (enumerable + inherited)
for (let key in obj) {
  console.log(key); // name, age
}
```

**Excluding Inherited Properties:**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  console.log(`${this.name} makes a sound`);
};

const dog = new Animal('Buddy');
dog.breed = 'Golden Retriever';

// Own properties only
console.log(Object.getOwnPropertyNames(dog));
// ['name', 'breed']

// Does not include prototype properties
// 'speak' is on the prototype, not own property

// To get all properties including inherited:
function getAllProperties(obj) {
  const props = new Set();
  
  let current = obj;
  while (current) {
    Object.getOwnPropertyNames(current).forEach(prop => props.add(prop));
    current = Object.getPrototypeOf(current);
  }
  
  return Array.from(props);
}

console.log(getAllProperties(dog));
// ['name', 'breed', 'speak', 'constructor', 'toString', ...]
```

**Finding Hidden Properties:**

```javascript
const obj = {
  public1: 'visible',
  public2: 'visible'
};

// Add hidden properties
Object.defineProperty(obj, 'secret1', {
  value: 'hidden',
  enumerable: false
});

Object.defineProperty(obj, 'secret2', {
  value: 'also hidden',
  enumerable: false
});

// Object.keys doesn't find them
console.log('Object.keys:', Object.keys(obj));
// ['public1', 'public2']

// But getOwnPropertyNames does
console.log('getOwnPropertyNames:', Object.getOwnPropertyNames(obj));
// ['public1', 'public2', 'secret1', 'secret2']

// Filter for hidden properties
function getHiddenProperties(obj) {
  return Object.getOwnPropertyNames(obj).filter(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    return !descriptor.enumerable;
  });
}

console.log('Hidden:', getHiddenProperties(obj));
// ['secret1', 'secret2']
```

**Analyzing Object Structure:**

```javascript
function analyzeObject(obj) {
  const properties = Object.getOwnPropertyNames(obj);
  
  const analysis = {
    total: properties.length,
    enumerable: 0,
    nonEnumerable: 0,
    writable: 0,
    nonWritable: 0,
    configurable: 0,
    nonConfigurable: 0,
    accessors: 0,
    dataProperties: 0
  };
  
  properties.forEach(prop => {
    const desc = Object.getOwnPropertyDescriptor(obj, prop);
    
    if (desc.enumerable) analysis.enumerable++;
    else analysis.nonEnumerable++;
    
    if (desc.hasOwnProperty('value')) {
      analysis.dataProperties++;
      if (desc.writable) analysis.writable++;
      else analysis.nonWritable++;
    } else {
      analysis.accessors++;
    }
    
    if (desc.configurable) analysis.configurable++;
    else analysis.nonConfigurable++;
  });
  
  return analysis;
}

const obj = {};
Object.defineProperties(obj, {
  name: { value: 'Alice', writable: true, enumerable: true },
  id: { value: 123, writable: false, enumerable: false },
  age: {
    get() { return 30; },
    enumerable: true
  }
});

console.log(analyzeObject(obj));
// {
//   total: 3,
//   enumerable: 2,
//   nonEnumerable: 1,
//   writable: 1,
//   nonWritable: 1,
//   configurable: 3,
//   nonConfigurable: 0,
//   accessors: 1,
//   dataProperties: 2
// }
```

### `Object.getOwnPropertySymbols()`

Returns an array of all symbol properties found directly on an object.

**Basic Symbol Properties:**

```javascript
const obj = {
  name: 'Alice',
  age: 30
};

// Add symbol properties
const idSymbol = Symbol('id');
const metaSymbol = Symbol('metadata');

obj[idSymbol] = 123;
obj[metaSymbol] = { created: new Date() };

// Regular property methods don't see symbols
console.log(Object.keys(obj)); // ['name', 'age']
console.log(Object.getOwnPropertyNames(obj)); // ['name', 'age']

// getOwnPropertySymbols finds only symbols
console.log(Object.getOwnPropertySymbols(obj));
// [Symbol(id), Symbol(metadata)]

// Access symbol properties
console.log(obj[idSymbol]); // 123
console.log(obj[metaSymbol]); // { created: ... }
```

**Getting All Properties (Strings + Symbols):**

```javascript
function getAllOwnProperties(obj) {
  return [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
}

const obj = {
  name: 'Alice',
  age: 30
};

const id = Symbol('id');
const metadata = Symbol.for('metadata');

obj[id] = 123;
obj[metadata] = { type: 'user' };

console.log(getAllOwnProperties(obj));
// ['name', 'age', Symbol(id), Symbol(metadata)]
```

**Well-Known Symbols:**

```javascript
class MyArray {
  constructor(...items) {
    this.items = items;
  }
  
  // Custom iterator
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }
  
  // Custom species
  static get [Symbol.species]() {
    return Array;
  }
  
  // Custom string representation
  get [Symbol.toStringTag]() {
    return 'MyArray';
  }
}

const arr = new MyArray(1, 2, 3);

// Check for well-known symbols
const symbols = Object.getOwnPropertySymbols(MyArray.prototype);
console.log(symbols);
// [Symbol(Symbol.iterator), Symbol(Symbol.toStringTag)]

// Use the iterator
for (const item of arr) {
  console.log(item); // 1, 2, 3
}

// Use toStringTag
console.log(Object.prototype.toString.call(arr)); // [object MyArray]
```

**Symbol Property Descriptors:**

```javascript
const obj = {};
const sym = Symbol('hidden');

Object.defineProperty(obj, sym, {
  value: 'secret',
  enumerable: false,
  writable: false,
  configurable: false
});

// Symbol properties have descriptors too
const descriptor = Object.getOwnPropertyDescriptor(obj, sym);
console.log(descriptor);
// { value: 'secret', writable: false, enumerable: false, configurable: false }

// But symbols are always hidden from JSON
console.log(JSON.stringify(obj)); // {}

// And from for...in
for (let key in obj) {
  console.log(key); // Nothing
}
```

**Private-like Properties with Symbols:**

```javascript
const _privateData = Symbol('privateData');

class User {
  constructor(name, password) {
    this.name = name;
    this[_privateData] = { password, loginAttempts: 0 };
  }
  
  login(password) {
    const data = this[_privateData];
    
    if (data.password === password) {
      data.loginAttempts = 0;
      return { success: true };
    }
    
    data.loginAttempts++;
    return {
      success: false,
      attemptsRemaining: 3 - data.loginAttempts
    };
  }
  
  getPublicData() {
    return { name: this.name };
  }
}

const user = new User('Alice', 'secret123');

// Name is public
console.log(user.name); // 'Alice'

// Password is hidden (but discoverable)
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(privateData)]
console.log(user[_privateData]); // { password: 'secret123', ... }

// JSON doesn't include symbols
console.log(JSON.stringify(user)); // {"name":"Alice"}
```

### Enumerability and Iteration

Understanding how enumerability affects iteration and various object methods.

**Enumerable vs Non-Enumerable:**

```javascript
const obj = {};

// Enumerable property
Object.defineProperty(obj, 'name', {
  value: 'Alice',
  enumerable: true,
  writable: true,
  configurable: true
});

// Non-enumerable property
Object.defineProperty(obj, '_id', {
  value: 123,
  enumerable: false,
  writable: true,
  configurable: true
});

// for...in - only enumerable
for (let key in obj) {
  console.log(key); // 'name'
}

// Object.keys - only enumerable
console.log(Object.keys(obj)); // ['name']

// Object.values - only enumerable values
console.log(Object.values(obj)); // ['Alice']

// Object.entries - only enumerable key-value pairs
console.log(Object.entries(obj)); // [['name', 'Alice']]

// JSON.stringify - only enumerable
console.log(JSON.stringify(obj)); // {"name":"Alice"}

// But property is still accessible
console.log(obj._id); // 123

// Object.getOwnPropertyNames - all properties
console.log(Object.getOwnPropertyNames(obj)); // ['name', '_id']
```

**Iteration Methods Comparison:**

```javascript
function Parent(x) {
  this.x = x;
}
Parent.prototype.parentProp = 'inherited';

const obj = new Parent(10);
obj.y = 20;

Object.defineProperty(obj, 'z', {
  value: 30,
  enumerable: false
});

console.log('\n=== for...in (enumerable own + inherited) ===');
for (let key in obj) {
  console.log(key, obj[key]);
}
// x 10
// y 20
// parentProp inherited

console.log('\n=== Object.keys (enumerable own only) ===');
console.log(Object.keys(obj)); // ['x', 'y']

console.log('\n=== Object.getOwnPropertyNames (all own) ===');
console.log(Object.getOwnPropertyNames(obj)); // ['x', 'y', 'z']

console.log('\n=== hasOwnProperty filter ===');
for (let key in obj) {
  if (obj.hasOwnProperty(key)) {
    console.log(key, obj[key]);
  }
}
// x 10
// y 20
```

**Making Properties Enumerable/Non-Enumerable:**

```javascript
const obj = { name: 'Alice', age: 30, _password: 'secret' };

// Make _password non-enumerable
Object.defineProperty(obj, '_password', {
  enumerable: false
});

console.log('Before:', Object.keys(obj)); // ['name', 'age']

// Make it enumerable again
Object.defineProperty(obj, '_password', {
  enumerable: true
});

console.log('After:', Object.keys(obj)); // ['name', 'age', '_password']

// Bulk change enumerability
function hidePrivateProps(obj) {
  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (prop.startsWith('_')) {
      Object.defineProperty(obj, prop, {
        enumerable: false
      });
    }
  });
}

const user = {
  name: 'Bob',
  _id: 123,
  _metadata: { created: new Date() }
};

hidePrivateProps(user);
console.log(Object.keys(user)); // ['name']
```

**Custom Iteration:**

```javascript
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  
  // Make iterable
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);

// Can use in for...of
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Can spread
console.log([...range]); // [1, 2, 3, 4, 5]

// Can use Array.from
console.log(Array.from(range)); // [1, 2, 3, 4, 5]
```

**Property Enumeration Utilities:**

```javascript
// Get only enumerable properties
function getEnumerableProps(obj) {
  return Object.keys(obj);
}

// Get only non-enumerable properties
function getNonEnumerableProps(obj) {
  return Object.getOwnPropertyNames(obj).filter(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    return !descriptor.enumerable;
  });
}

// Get all properties with their enumerability
function getAllPropsWithEnum(obj) {
  const allProps = [
    ...Object.getOwnPropertyNames(obj),
    ...Object.getOwnPropertySymbols(obj)
  ];
  
  return allProps.map(prop => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    return {
      property: prop,
      enumerable: descriptor.enumerable,
      type: typeof prop === 'symbol' ? 'symbol' : 'string'
    };
  });
}

const obj = {
  public: 'visible'
};

Object.defineProperty(obj, 'hidden', {
  value: 'not visible',
  enumerable: false
});

const sym = Symbol('symbol');
obj[sym] = 'symbol value';

console.log(getAllPropsWithEnum(obj));
// [
//   { property: 'public', enumerable: true, type: 'string' },
//   { property: 'hidden', enumerable: false, type: 'string' },
//   { property: Symbol(symbol), enumerable: true, type: 'symbol' }
// ]
```

---

## 16.3 Function Introspection

Function introspection allows you to examine functions at runtime, accessing metadata and source code.

### Function `name` Property

The `name` property returns the name of the function.

**Named Functions:**

```javascript
function myFunction() {}
console.log(myFunction.name); // 'myFunction'

const anotherFunction = function() {};
console.log(anotherFunction.name); // 'anotherFunction'

const namedExpression = function explicitName() {};
console.log(namedExpression.name); // 'explicitName'

// Arrow functions
const arrowFunc = () => {};
console.log(arrowFunc.name); // 'arrowFunc'
```

**Methods and Classes:**

```javascript
class MyClass {
  method() {}
  
  static staticMethod() {}
  
  get accessor() { return 1; }
  set accessor(value) {}
}

console.log(MyClass.name); // 'MyClass'
console.log(MyClass.prototype.method.name); // 'method'
console.log(MyClass.staticMethod.name); // 'staticMethod'

const descriptor = Object.getOwnPropertyDescriptor(
  MyClass.prototype,
  'accessor'
);
console.log(descriptor.get.name); // 'get accessor'
console.log(descriptor.set.name); // 'set accessor'
```

**Bound Functions:**

```javascript
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}

const person = { name: 'Alice' };
const boundGreet = greet.bind(person);

console.log(greet.name); // 'greet'
console.log(boundGreet.name); // 'bound greet'

const doubleBound = boundGreet.bind(person);
console.log(doubleBound.name); // 'bound bound greet'
```

**Special Cases:**

```javascript
// Anonymous functions assigned to properties
const obj = {
  method: function() {}
};
console.log(obj.method.name); // 'method'

// Computed property names
const propName = 'dynamicMethod';
const obj2 = {
  [propName]() {}
};
console.log(obj2[propName].name); // 'dynamicMethod'

// Symbols as property names
const sym = Symbol('mySymbol');
const obj3 = {
  [sym]() {}
};
console.log(obj3[sym].name); // '[mySymbol]'

// Constructor property
console.log(Object.name); // 'Object'
console.log(Array.name); // 'Array'
console.log(Function.name); // 'Function'
```

**Function.name Use Cases:**

```javascript
// Debugging helper
function createLogger(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with:`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned:`, result);
    return result;
  };
}

function add(a, b) {
  return a + b;
}

const loggedAdd = createLogger(add);
loggedAdd(5, 3);
// Calling add with: [5, 3]
// add returned: 8

// Function registry
class FunctionRegistry {
  constructor() {
    this.functions = new Map();
  }
  
  register(fn) {
    const name = fn.name || 'anonymous';
    this.functions.set(name, fn);
  }
  
  call(name, ...args) {
    const fn = this.functions.get(name);
    if (!fn) {
      throw new Error(`Function ${name} not registered`);
    }
    return fn(...args);
  }
  
  list() {
    return Array.from(this.functions.keys());
  }
}

const registry = new FunctionRegistry();

function multiply(a, b) { return a * b; }
function divide(a, b) { return a / b; }

registry.register(multiply);
registry.register(divide);

console.log(registry.list()); // ['multiply', 'divide']
console.log(registry.call('multiply', 6, 7)); // 42
```

### Function `length` Property

The `length` property indicates the number of parameters expected by the function.

**Basic Length:**

```javascript
function noParams() {}
function oneParam(a) {}
function twoParams(a, b) {}
function threeParams(a, b, c) {}

console.log(noParams.length); // 0
console.log(oneParam.length); // 1
console.log(twoParams.length); // 2
console.log(threeParams.length); // 3
```

**Default Parameters:**

```javascript
// Parameters with defaults are not counted
function withDefaults(a, b = 10, c = 20) {}
console.log(withDefaults.length); // 1 (only 'a')

function mixedDefaults(a, b, c = 30) {}
console.log(mixedDefaults.length); // 2 (a and b)

function allDefaults(a = 1, b = 2) {}
console.log(allDefaults.length); // 0
```

**Rest Parameters:**

```javascript
// Rest parameters are not counted
function withRest(a, b, ...rest) {}
console.log(withRest.length); // 2 (only a and b)

function onlyRest(...args) {}
console.log(onlyRest.length); // 0

function beforeDefault(a, b = 10, ...rest) {}
console.log(beforeDefault.length); // 1 (only a)
```

**Arrow Functions:**

```javascript
const arrow1 = () => {};
const arrow2 = (a) => {};
const arrow3 = (a, b, c) => {};
const arrowDefault = (a, b = 10) => {};
const arrowRest = (a, ...rest) => {};

console.log(arrow1.length); // 0
console.log(arrow2.length); // 1
console.log(arrow3.length); // 3
console.log(arrowDefault.length); // 1
console.log(arrowRest.length); // 1
```

**Using Length for Validation:**

```javascript
function validateArity(fn, expectedLength) {
  return function(...args) {
    if (args.length !== expectedLength) {
      throw new Error(
        `Expected ${expectedLength} arguments, got ${args.length}`
      );
    }
    return fn(...args);
  };
}

function add(a, b) {
  return a + b;
}

const strictAdd = validateArity(add, 2);

console.log(strictAdd(5, 3)); // 8

try {
  strictAdd(5); // Error: Expected 2 arguments, got 1
} catch (e) {
  console.log(e.message);
}
```

**Currying Based on Length:**

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);

console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1, 2, 3)); // 6
```

**Function Signature Analyzer:**

```javascript
function analyzeFunctionSignature(fn) {
  const params = fn.toString()
    .match(/\(([^)]*)\)/)[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p);
  
  return {
    name: fn.name || 'anonymous',
    paramCount: fn.length,
    totalParams: params.length,
    hasDefaults: params.length > fn.length,
    hasRest: params.some(p => p.startsWith('...')),
    parameters: params
  };
}

function example(a, b = 10, ...rest) {
  return a + b;
}

console.log(analyzeFunctionSignature(example));
// {
//   name: 'example',
//   paramCount: 1,
//   totalParams: 3,
//   hasDefaults: true,
//   hasRest: true,
//   parameters: ['a', 'b = 10', '...rest']
// }
```

### `toString()` Method

The `toString()` method returns a string representing the function's source code.

**Basic toString:**

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet.toString());
// "function greet(name) {
//   return `Hello, ${name}!`;
// }"

const add = (a, b) => a + b;
console.log(add.toString());
// "(a, b) => a + b"
```

**Built-in Functions:**

```javascript
// Built-in functions show native code
console.log(Math.max.toString());
// "function max() { [native code] }"

console.log(Array.prototype.map.toString());
// "function map() { [native code] }"

// Bound functions
function original() {}
const bound = original.bind(null);
console.log(bound.toString());
// "function () { [native code] }"
```

**Class Methods:**

```javascript
class MyClass {
  constructor(value) {
    this.value = value;
  }
  
  method() {
    return this.value * 2;
  }
  
  static staticMethod() {
    return 'static';
  }
}

console.log(MyClass.toString());
// "class MyClass {
//   constructor(value) { ... }
//   method() { ... }
//   static staticMethod() { ... }
// }"

console.log(MyClass.prototype.method.toString());
// "method() {
//   return this.value * 2;
// }"
```

### Accessing Function Source

Extracting and analyzing function source code.

**Extracting Function Body:**

```javascript
function extractFunctionBody(fn) {
  const source = fn.toString();
  
  // For arrow functions
  if (source.includes('=>')) {
    const arrowIndex = source.indexOf('=>');
    let body = source.slice(arrowIndex + 2).trim();
    
    // Remove braces if present
    if (body.startsWith('{') && body.endsWith('}')) {
      body = body.slice(1, -1).trim();
    }
    
    return body;
  }
  
  // For regular functions
  const match = source.match(/\{([\s\S]*)\}/);
  return match ? match[1].trim() : '';
}

function example() {
  const x = 10;
  return x * 2;
}

const arrow = () => {
  return 42;
};

const singleLine = () => 42;

console.log(extractFunctionBody(example));
// "const x = 10;
//  return x * 2;"

console.log(extractFunctionBody(arrow));
// "return 42;"

console.log(extractFunctionBody(singleLine));
// "42"
```

**Extracting Parameters:**

```javascript
function extractParameters(fn) {
  const source = fn.toString();
  
  // Match parameters in parentheses
  const match = source.match(/\(([^)]*)\)/);
  if (!match) return [];
  
  return match[1]
    .split(',')
    .map(param => param.trim())
    .filter(param => param);
}

function test(a, b, c = 10, ...rest) {}

console.log(extractParameters(test));
// ['a', 'b', 'c = 10', '...rest']

const arrow = (x, y) => x + y;
console.log(extractParameters(arrow));
// ['x', 'y']
```

**Function Metadata Extractor:**

```javascript
function extractMetadata(fn) {
  const source = fn.toString();
  const params = extractParameters(fn);
  
  // Check for async
  const isAsync = source.trim().startsWith('async');
  
  // Check for generator
  const isGenerator = source.includes('function*') || source.includes('*' + fn.name);
  
  // Check for arrow function
  const isArrow = source.includes('=>');
  
  // Extract comments (simple regex)
  const comments = [];
  const commentRegex = /\/\*[\s\S]*?\*\/|\/\/.*/g;
  let match;
  while ((match = commentRegex.exec(source)) !== null) {
    comments.push(match[0]);
  }
  
  return {
    name: fn.name || 'anonymous',
    type: isArrow ? 'arrow' : isGenerator ? 'generator' : isAsync ? 'async' : 'function',
    parameters: params,
    parameterCount: fn.length,
    isAsync,
    isGenerator,
    isArrow,
    source: source,
    body: extractFunctionBody(fn),
    comments
  };
}

async function* exampleGenerator(a, b = 10) {
  // This is a comment
  yield a;
  yield b;
}

console.log(extractMetadata(exampleGenerator));
// {
//   name: 'exampleGenerator',
//   type: 'generator',
//   parameters: ['a', 'b = 10'],
//   parameterCount: 1,
//   isAsync: true,
//   isGenerator: true,
//   isArrow: false,
//   source: '...',
//   body: '...',
//   comments: ['// This is a comment']
// }
```

**Dynamic Function Analysis:**

```javascript
class FunctionAnalyzer {
  static analyze(fn) {
    const source = fn.toString();
    
    return {
      identity: {
        name: fn.name || 'anonymous',
        length: fn.length
      },
      characteristics: {
        isAsync: source.includes('async'),
        isGenerator: source.includes('function*'),
        isArrow: source.includes('=>'),
        isBound: source.includes('[native code]') && fn.name.startsWith('bound'),
        isNative: source.includes('[native code]')
      },
      parameters: this.extractParams(source),
      dependencies: this.findDependencies(source),
      complexity: this.calculateComplexity(source)
    };
  }
  
  static extractParams(source) {
    const match = source.match(/\(([^)]*)\)/);
    if (!match) return [];
    
    return match[1]
      .split(',')
      .map(p => {
        p = p.trim();
        return {
          name: p.split('=')[0].replace('...', '').trim(),
          hasDefault: p.includes('='),
          isRest: p.startsWith('...')
        };
      })
      .filter(p => p.name);
  }
  
  static findDependencies(source) {
    // Find variable references (simplified)
    const matches = source.match(/\b[a-zA-Z_$][a-zA-Z0-9_$]*\b/g) || [];
    const keywords = new Set([
      'function', 'return', 'if', 'else', 'for', 'while',
      'const', 'let', 'var', 'class', 'this', 'new'
    ]);
    
    return [...new Set(matches)].filter(name => !keywords.has(name));
  }
  
  static calculateComplexity(source) {
    const complexityIndicators = [
      /if\s*\(/g,
      /else/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /case\s+/g,
      /catch\s*\(/g,
      /\?\s*.*\s*:/g // Ternary
    ];
    
    let complexity = 1; // Base complexity
    
    complexityIndicators.forEach(regex => {
      const matches = source.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }
}

function complexFunction(a, b = 10) {
  if (a > 0) {
    for (let i = 0; i < b; i++) {
      if (i % 2 === 0) {
        console.log(i);
      }
    }
  } else {
    return a * b;
  }
}

console.log(FunctionAnalyzer.analyze(complexFunction));
// {
//   identity: { name: 'complexFunction', length: 1 },
//   characteristics: {
//     isAsync: false,
//     isGenerator: false,
//     isArrow: false,
//     isBound: false,
//     isNative: false
//   },
//   parameters: [
//     { name: 'a', hasDefault: false, isRest: false },
//     { name: 'b', hasDefault: true, isRest: false }
//   ],
//   dependencies: [...],
//   complexity: 4
// }
```

**Practical Use Case - Function Memoization:**

```javascript
function memoize(fn) {
  // Use function source as part of cache key
  const fnSource = fn.toString();
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args) + fnSource;
    
    if (cache.has(key)) {
      console.log(`Cache hit for ${fn.name}`);
      return cache.get(key);
    }
    
    console.log(`Computing ${fn.name}...`);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const memoFib = memoize(fibonacci);

console.log(memoFib(10)); // Computes
console.log(memoFib(10)); // Cache hit
```

---

## Summary

This document covered Meta-programming comprehensively:

- **Property Descriptors**: Configuring object properties with `value`, `writable`, `enumerable`, and `configurable` attributes, defining properties with `Object.defineProperty`, creating immutable and hidden properties, sealed and frozen objects
- **Object Introspection**: Using `Object.getOwnPropertyNames()` and `Object.getOwnPropertySymbols()` to discover properties, understanding enumerability and its effect on iteration and object methods
- **Function Introspection**: Examining function metadata through the `name` property, understanding parameter counts with the `length` property, accessing source code with `toString()`, and building function analyzers

Meta-programming enables powerful runtime reflection and manipulation of objects and functions, allowing for advanced patterns like validation, serialization, and dynamic behavior.

---

**Related Topics to Explore Next:**

- Proxies and advanced meta-programming
- Symbol and well-known symbols
- WeakMap and WeakSet for metadata storage
- Decorators (stage 3 proposal)
- Runtime type checking and validation
---

**End of Chapter 16**
