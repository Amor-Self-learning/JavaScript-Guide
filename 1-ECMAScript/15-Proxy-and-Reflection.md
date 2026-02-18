# 15 Proxy and Reflection

---

# Proxy and Reflection


## 15.1 Proxy

Proxies allow you to create an object that wraps another object and intercepts fundamental operations on it. This provides powerful metaprogramming capabilities.

### Proxy Constructor

The Proxy constructor creates a proxy object that wraps a target object with a handler containing traps.

**Basic Syntax:**

```javascript
const proxy = new Proxy(target, handler);
```

**Simple Example:**

```javascript
const target = {
  name: 'Alice',
  age: 30
};

const handler = {
  get(target, property, receiver) {
    console.log(`Getting property: ${property}`);
    return target[property];
  },
  
  set(target, property, value, receiver) {
    console.log(`Setting property: ${property} = ${value}`);
    target[property] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);

console.log(proxy.name); // "Getting property: name" then "Alice"
proxy.age = 31; // "Setting property: age = 31"
console.log(proxy.age); // "Getting property: age" then 31
```

**No-Op Proxy (Transparent Wrapper):**

```javascript
// Empty handler - proxy behaves exactly like target
const target = { value: 42 };
const proxy = new Proxy(target, {});

console.log(proxy.value); // 42
proxy.value = 100;
console.log(proxy.value); // 100
console.log(target.value); // 100 (target is modified)
```

### Handler Traps: `get`, `set`, `has`

These are the most commonly used traps for intercepting property access.

**`get` Trap:**

```javascript
const handler = {
  get(target, property, receiver) {
    // target: the original object
    // property: the property name being accessed
    // receiver: the proxy or object that inherits from it
    
    console.log(`Accessing: ${property}`);
    
    if (property in target) {
      return target[property];
    }
    return `Property "${property}" not found`;
  }
};

const obj = { name: 'Alice', age: 30 };
const proxy = new Proxy(obj, handler);

console.log(proxy.name); // "Accessing: name" then "Alice"
console.log(proxy.missing); // "Accessing: missing" then 'Property "missing" not found'
```

**Advanced `get` - Default Values:**

```javascript
const withDefaults = (target, defaults) => {
  return new Proxy(target, {
    get(target, property) {
      return property in target ? target[property] : defaults[property];
    }
  });
};

const config = withDefaults(
  { host: 'localhost' },
  { host: '127.0.0.1', port: 3000, protocol: 'http' }
);

console.log(config.host); // 'localhost' (from target)
console.log(config.port); // 3000 (from defaults)
console.log(config.protocol); // 'http' (from defaults)
```

**`set` Trap:**

```javascript
const validator = {
  set(target, property, value, receiver) {
    console.log(`Setting ${property} to ${value}`);
    
    // Validation logic
    if (property === 'age') {
      if (typeof value !== 'number') {
        throw new TypeError('Age must be a number');
      }
      if (value < 0 || value > 150) {
        throw new RangeError('Age must be between 0 and 150');
      }
    }
    
    if (property === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
    }
    
    target[property] = value;
    return true; // Indicate success
  }
};

const user = new Proxy({}, validator);

user.name = 'Alice'; // Works
user.age = 30; // Works
user.email = 'alice@example.com'; // Works

try {
  user.age = 'thirty'; // TypeError: Age must be a number
} catch (e) {
  console.log(e.message);
}

try {
  user.email = 'invalid-email'; // Error: Invalid email format
} catch (e) {
  console.log(e.message);
}
```

**`set` Trap - Read-Only Properties:**

```javascript
const readOnly = (target, readOnlyProps) => {
  return new Proxy(target, {
    set(target, property, value) {
      if (readOnlyProps.includes(property)) {
        throw new Error(`Cannot modify read-only property: ${property}`);
      }
      target[property] = value;
      return true;
    }
  });
};

const obj = readOnly(
  { id: 1, name: 'Alice', role: 'user' },
  ['id']
);

obj.name = 'Bob'; // Works
obj.role = 'admin'; // Works

try {
  obj.id = 2; // Error: Cannot modify read-only property: id
} catch (e) {
  console.log(e.message);
}
```

**`has` Trap:**

```javascript
const handler = {
  has(target, property) {
    console.log(`Checking if property "${property}" exists`);
    
    // Hide private properties (starting with _)
    if (property.startsWith('_')) {
      return false;
    }
    
    return property in target;
  }
};

const obj = new Proxy(
  { name: 'Alice', _password: 'secret', age: 30 },
  handler
);

console.log('name' in obj); // true
console.log('age' in obj); // true
console.log('_password' in obj); // false (hidden)
console.log('missing' in obj); // false
```

**Combined `get`, `set`, `has` Example:**

```javascript
const createSecureObject = (target) => {
  return new Proxy(target, {
    get(target, property) {
      if (property.startsWith('_')) {
        throw new Error(`Cannot access private property: ${property}`);
      }
      return target[property];
    },
    
    set(target, property, value) {
      if (property.startsWith('_')) {
        throw new Error(`Cannot modify private property: ${property}`);
      }
      target[property] = value;
      return true;
    },
    
    has(target, property) {
      if (property.startsWith('_')) {
        return false;
      }
      return property in target;
    }
  });
};

const secure = createSecureObject({
  publicData: 'visible',
  _privateData: 'hidden'
});

console.log(secure.publicData); // 'visible'
console.log('publicData' in secure); // true
console.log('_privateData' in secure); // false

try {
  console.log(secure._privateData); // Error
} catch (e) {
  console.log(e.message); // "Cannot access private property: _privateData"
}
```

### Handler Traps: `deleteProperty`

The `deleteProperty` trap intercepts the `delete` operator.

**Basic `deleteProperty`:**

```javascript
const handler = {
  deleteProperty(target, property) {
    console.log(`Deleting property: ${property}`);
    
    if (property.startsWith('_')) {
      throw new Error(`Cannot delete private property: ${property}`);
    }
    
    delete target[property];
    return true; // Indicate success
  }
};

const obj = new Proxy(
  { name: 'Alice', _id: 123, age: 30 },
  handler
);

delete obj.name; // "Deleting property: name" - works
console.log(obj.name); // undefined

try {
  delete obj._id; // Error: Cannot delete private property: _id
} catch (e) {
  console.log(e.message);
}
```

**Preventing Deletion of Specific Properties:**

```javascript
const preventDelete = (target, protectedProps) => {
  return new Proxy(target, {
    deleteProperty(target, property) {
      if (protectedProps.includes(property)) {
        console.log(`Property "${property}" is protected and cannot be deleted`);
        return false;
      }
      delete target[property];
      return true;
    }
  });
};

const config = preventDelete(
  { host: 'localhost', port: 3000, debug: true },
  ['host', 'port'] // Protected properties
);

delete config.debug; // Works
console.log(config.debug); // undefined

delete config.host; // "Property "host" is protected..."
console.log(config.host); // 'localhost' (still there)
```

**Logging Deletions:**

```javascript
const trackDeletions = (target) => {
  const deletedProps = [];
  
  return {
    proxy: new Proxy(target, {
      deleteProperty(target, property) {
        deletedProps.push({
          property,
          value: target[property],
          timestamp: new Date()
        });
        delete target[property];
        return true;
      }
    }),
    getDeleted() {
      return deletedProps;
    }
  };
};

const { proxy, getDeleted } = trackDeletions({
  a: 1,
  b: 2,
  c: 3
});

delete proxy.a;
delete proxy.b;

console.log(getDeleted());
// [
//   { property: 'a', value: 1, timestamp: ... },
//   { property: 'b', value: 2, timestamp: ... }
// ]
```

### Handler Traps: `ownKeys`, `getOwnPropertyDescriptor`

These traps intercept property enumeration operations.

**`ownKeys` Trap:**

```javascript
const handler = {
  ownKeys(target) {
    console.log('Getting own keys');
    
    // Filter out private properties
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
};

const obj = new Proxy(
  { name: 'Alice', _password: 'secret', age: 30, _internal: 'hidden' },
  handler
);

console.log(Object.keys(obj)); // ['name', 'age']
console.log(Object.getOwnPropertyNames(obj)); // ['name', 'age']

for (let key in obj) {
  console.log(key); // Only 'name' and 'age'
}
```

**`ownKeys` with Custom Ordering:**

```javascript
const sortedKeys = new Proxy(
  { zebra: 1, apple: 2, mango: 3, banana: 4 },
  {
    ownKeys(target) {
      return Object.keys(target).sort();
    }
  }
);

console.log(Object.keys(sortedKeys)); 
// ['apple', 'banana', 'mango', 'zebra']
```

**`getOwnPropertyDescriptor` Trap:**

```javascript
const handler = {
  getOwnPropertyDescriptor(target, property) {
    console.log(`Getting descriptor for: ${property}`);
    
    // Hide private properties
    if (property.startsWith('_')) {
      return undefined;
    }
    
    return Object.getOwnPropertyDescriptor(target, property);
  },
  
  ownKeys(target) {
    // Also filter in ownKeys for consistency
    return Object.keys(target).filter(key => !key.startsWith('_'));
  }
};

const obj = new Proxy(
  { name: 'Alice', _password: 'secret' },
  handler
);

console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
// { value: 'Alice', writable: true, enumerable: true, configurable: true }

console.log(Object.getOwnPropertyDescriptor(obj, '_password'));
// undefined (hidden)
```

**Making Properties Appear Read-Only:**

```javascript
const readOnlyView = (target) => {
  return new Proxy(target, {
    getOwnPropertyDescriptor(target, property) {
      const desc = Object.getOwnPropertyDescriptor(target, property);
      if (desc) {
        return {
          ...desc,
          writable: false,
          configurable: false
        };
      }
      return desc;
    }
  });
};

const obj = readOnlyView({ name: 'Alice', age: 30 });

const desc = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(desc.writable); // false
console.log(desc.configurable); // false
```

### Handler Traps: `defineProperty`

The `defineProperty` trap intercepts `Object.defineProperty()`.

**Basic `defineProperty`:**

```javascript
const handler = {
  defineProperty(target, property, descriptor) {
    console.log(`Defining property: ${property}`);
    console.log('Descriptor:', descriptor);
    
    // Allow only enumerable properties
    if (descriptor.enumerable === false) {
      throw new Error('All properties must be enumerable');
    }
    
    Object.defineProperty(target, property, descriptor);
    return true;
  }
};

const obj = new Proxy({}, handler);

Object.defineProperty(obj, 'name', {
  value: 'Alice',
  enumerable: true,
  writable: true,
  configurable: true
}); // Works

try {
  Object.defineProperty(obj, 'hidden', {
    value: 'secret',
    enumerable: false
  }); // Error: All properties must be enumerable
} catch (e) {
  console.log(e.message);
}
```

**Enforcing Property Naming Conventions:**

```javascript
const enforceNaming = new Proxy({}, {
  defineProperty(target, property, descriptor) {
    // Enforce camelCase naming
    if (!/^[a-z][a-zA-Z0-9]*$/.test(property)) {
      throw new Error(`Property "${property}" must be in camelCase`);
    }
    
    Object.defineProperty(target, property, descriptor);
    return true;
  }
});

Object.defineProperty(enforceNaming, 'userName', { value: 'Alice' }); // Works

try {
  Object.defineProperty(enforceNaming, 'user_name', { value: 'Bob' });
} catch (e) {
  console.log(e.message); // "Property "user_name" must be in camelCase"
}
```

**Tracking Property Definitions:**

```javascript
const trackDefinitions = (target) => {
  const definitions = [];
  
  return {
    proxy: new Proxy(target, {
      defineProperty(target, property, descriptor) {
        definitions.push({
          property,
          descriptor: { ...descriptor },
          timestamp: new Date()
        });
        
        Object.defineProperty(target, property, descriptor);
        return true;
      }
    }),
    getDefinitions() {
      return definitions;
    }
  };
};

const { proxy, getDefinitions } = trackDefinitions({});

Object.defineProperty(proxy, 'name', { value: 'Alice', writable: true });
Object.defineProperty(proxy, 'age', { value: 30, writable: false });

console.log(getDefinitions());
// [
//   { property: 'name', descriptor: { value: 'Alice', writable: true }, ... },
//   { property: 'age', descriptor: { value: 30, writable: false }, ... }
// ]
```

### Handler Traps: `preventExtensions`, `isExtensible`

These traps control whether new properties can be added to an object.

**`preventExtensions` Trap:**

```javascript
const handler = {
  preventExtensions(target) {
    console.log('Preventing extensions');
    
    // Add some final processing before preventing extensions
    target._sealed = true;
    target._sealedAt = new Date();
    
    Object.preventExtensions(target);
    return true;
  }
};

const obj = new Proxy({ name: 'Alice' }, handler);

Object.preventExtensions(obj); // "Preventing extensions"
console.log(obj._sealed); // true
console.log(obj._sealedAt); // Date object

try {
  obj.newProp = 'value'; // Fails silently in non-strict mode, throws in strict
} catch (e) {
  console.log('Cannot add property');
}
```

**`isExtensible` Trap:**

```javascript
const handler = {
  isExtensible(target) {
    console.log('Checking if extensible');
    return Object.isExtensible(target);
  },
  
  preventExtensions(target) {
    console.log('Making non-extensible');
    Object.preventExtensions(target);
    return true;
  }
};

const obj = new Proxy({ name: 'Alice' }, handler);

console.log(Object.isExtensible(obj)); // true
Object.preventExtensions(obj);
console.log(Object.isExtensible(obj)); // false
```

**Custom Extensibility Logic:**

```javascript
const limitedProperties = (target, maxProps) => {
  return new Proxy(target, {
    set(target, property, value) {
      const currentProps = Object.keys(target).length;
      
      if (!(property in target) && currentProps >= maxProps) {
        throw new Error(`Cannot add more than ${maxProps} properties`);
      }
      
      target[property] = value;
      return true;
    }
  });
};

const obj = limitedProperties({}, 3);

obj.a = 1;
obj.b = 2;
obj.c = 3;

try {
  obj.d = 4; // Error: Cannot add more than 3 properties
} catch (e) {
  console.log(e.message);
}

obj.a = 100; // Updating existing property works
```

### Handler Traps: `getPrototypeOf`, `setPrototypeOf`

These traps intercept prototype operations.

**`getPrototypeOf` Trap:**

```javascript
const proto = { inherited: 'value' };

const handler = {
  getPrototypeOf(target) {
    console.log('Getting prototype');
    return proto;
  }
};

const obj = new Proxy({}, handler);

console.log(Object.getPrototypeOf(obj)); // proto object
console.log(obj.inherited); // 'value' (from proto)
console.log(obj instanceof Object); // true
```

**`setPrototypeOf` Trap:**

```javascript
const handler = {
  setPrototypeOf(target, newProto) {
    console.log('Setting prototype');
    
    // Only allow setting prototype to specific objects
    const allowedProtos = [Object.prototype, null];
    
    if (!allowedProtos.includes(newProto)) {
      throw new Error('Cannot set prototype to arbitrary objects');
    }
    
    Object.setPrototypeOf(target, newProto);
    return true;
  }
};

const obj = new Proxy({}, handler);

Object.setPrototypeOf(obj, null); // Works
// Object.setPrototypeOf(obj, { custom: true }); // Error
```

**Immutable Prototype:**

```javascript
const fixedPrototype = (target) => {
  const originalProto = Object.getPrototypeOf(target);
  
  return new Proxy(target, {
    setPrototypeOf(target, newProto) {
      if (newProto !== originalProto) {
        throw new Error('Cannot change prototype');
      }
      return true;
    }
  });
};

const obj = fixedPrototype({ name: 'Alice' });

try {
  Object.setPrototypeOf(obj, null); // Error: Cannot change prototype
} catch (e) {
  console.log(e.message);
}
```

### Handler Traps: `apply`, `construct`

These traps are for function proxies.

**`apply` Trap:**

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

const handler = {
  apply(target, thisArg, argumentsList) {
    console.log(`Function called with args: ${argumentsList}`);
    
    // Modify arguments
    const upperCaseArgs = argumentsList.map(arg => 
      typeof arg === 'string' ? arg.toUpperCase() : arg
    );
    
    return target.apply(thisArg, upperCaseArgs);
  }
};

const proxyGreet = new Proxy(greet, handler);

console.log(proxyGreet('alice')); 
// "Function called with args: alice"
// "Hello, ALICE!"
```

**Function Call Validation:**

```javascript
const validateArgs = (fn, validators) => {
  return new Proxy(fn, {
    apply(target, thisArg, argumentsList) {
      if (argumentsList.length !== validators.length) {
        throw new Error(
          `Expected ${validators.length} arguments, got ${argumentsList.length}`
        );
      }
      
      for (let i = 0; i < validators.length; i++) {
        if (!validators[i](argumentsList[i])) {
          throw new TypeError(`Argument ${i} failed validation`);
        }
      }
      
      return target.apply(thisArg, argumentsList);
    }
  });
};

const add = validateArgs(
  (a, b) => a + b,
  [
    (val) => typeof val === 'number',
    (val) => typeof val === 'number'
  ]
);

console.log(add(5, 3)); // 8

try {
  add('5', 3); // TypeError: Argument 0 failed validation
} catch (e) {
  console.log(e.message);
}
```

**Memoization with `apply`:**

```javascript
const memoize = (fn) => {
  const cache = new Map();
  
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        console.log('Returning cached result');
        return cache.get(key);
      }
      
      console.log('Computing result');
      const result = target.apply(thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
};

const expensiveOperation = memoize((n) => {
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += i;
  }
  return sum;
});

console.log(expensiveOperation(1000000)); // "Computing result" then result
console.log(expensiveOperation(1000000)); // "Returning cached result" then result
```

**`construct` Trap:**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

const handler = {
  construct(target, args, newTarget) {
    console.log(`Creating new instance with args: ${args}`);
    
    // Add timestamp to all instances
    const instance = new target(...args);
    instance.createdAt = new Date();
    
    return instance;
  }
};

const ProxyPerson = new Proxy(Person, handler);

const alice = new ProxyPerson('Alice', 30);
console.log(alice.name); // 'Alice'
console.log(alice.createdAt); // Date object
```

**Constructor Validation:**

```javascript
const validateConstructor = (Constructor, validators) => {
  return new Proxy(Constructor, {
    construct(target, args) {
      // Validate arguments
      for (let i = 0; i < validators.length; i++) {
        if (args[i] !== undefined && !validators[i](args[i])) {
          throw new TypeError(`Constructor argument ${i} failed validation`);
        }
      }
      
      return new target(...args);
    }
  });
};

function User(name, age, email) {
  this.name = name;
  this.age = age;
  this.email = email;
}

const ValidatedUser = validateConstructor(User, [
  (name) => typeof name === 'string' && name.length > 0,
  (age) => typeof age === 'number' && age >= 0 && age <= 150,
  (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
]);

const user = new ValidatedUser('Alice', 30, 'alice@example.com'); // Works

try {
  new ValidatedUser('Bob', -5, 'bob@example.com'); // Error
} catch (e) {
  console.log(e.message); // "Constructor argument 1 failed validation"
}
```

**Singleton Pattern with `construct`:**

```javascript
const singleton = (Constructor) => {
  let instance = null;
  
  return new Proxy(Constructor, {
    construct(target, args) {
      if (!instance) {
        instance = new target(...args);
      }
      return instance;
    }
  });
};

function Database(connection) {
  this.connection = connection;
}

const DatabaseSingleton = singleton(Database);

const db1 = new DatabaseSingleton('mysql://localhost');
const db2 = new DatabaseSingleton('postgres://localhost');

console.log(db1 === db2); // true (same instance)
console.log(db1.connection); // 'mysql://localhost'
console.log(db2.connection); // 'mysql://localhost' (same instance)
```

### Revocable Proxies

Revocable proxies can be disabled after creation, making the proxy unusable.

**Basic Revocable Proxy:**

```javascript
const target = { name: 'Alice', age: 30 };

const { proxy, revoke } = Proxy.revocable(target, {
  get(target, property) {
    console.log(`Getting: ${property}`);
    return target[property];
  }
});

console.log(proxy.name); // "Getting: name" then "Alice"
console.log(proxy.age); // "Getting: age" then 30

// Revoke the proxy
revoke();

try {
  console.log(proxy.name); // TypeError: Cannot perform 'get' on a proxy that has been revoked
} catch (e) {
  console.log(e.message);
}
```

**Temporary Access:**

```javascript
const createTemporaryAccess = (target, duration) => {
  const { proxy, revoke } = Proxy.revocable(target, {
    get(target, property) {
      return target[property];
    },
    set(target, property, value) {
      target[property] = value;
      return true;
    }
  });
  
  // Auto-revoke after duration
  setTimeout(() => {
    console.log('Access revoked');
    revoke();
  }, duration);
  
  return proxy;
};

const secret = { password: 'secret123', token: 'abc' };
const tempAccess = createTemporaryAccess(secret, 2000); // 2 seconds

console.log(tempAccess.password); // Works
tempAccess.newProp = 'value'; // Works

// After 2 seconds, proxy is revoked
setTimeout(() => {
  try {
    console.log(tempAccess.password); // Error
  } catch (e) {
    console.log('Cannot access - proxy revoked');
  }
}, 3000);
```

**Resource Cleanup:**

```javascript
const createManagedResource = (resource) => {
  let isActive = true;
  
  const { proxy, revoke } = Proxy.revocable(resource, {
    get(target, property) {
      if (!isActive) {
        throw new Error('Resource has been released');
      }
      return target[property];
    },
    
    set(target, property, value) {
      if (!isActive) {
        throw new Error('Resource has been released');
      }
      target[property] = value;
      return true;
    }
  });
  
  return {
    resource: proxy,
    release() {
      if (isActive) {
        console.log('Releasing resource...');
        // Cleanup code here
        resource.cleanup?.();
        isActive = false;
        revoke();
      }
    }
  };
};

const { resource, release } = createManagedResource({
  data: 'important',
  cleanup() {
    console.log('Cleanup performed');
  }
});

console.log(resource.data); // 'important'
release(); // Cleanup and revoke
// console.log(resource.data); // Error
```

### Use Cases (Validation, Logging, Virtualization)

**Validation:**

```javascript
const createValidator = (schema) => {
  return new Proxy({}, {
    set(target, property, value) {
      const validator = schema[property];
      
      if (!validator) {
        throw new Error(`Unknown property: ${property}`);
      }
      
      if (!validator.type || typeof value !== validator.type) {
        throw new TypeError(
          `${property} must be of type ${validator.type}`
        );
      }
      
      if (validator.required && (value === null || value === undefined)) {
        throw new Error(`${property} is required`);
      }
      
      if (validator.min !== undefined && value < validator.min) {
        throw new RangeError(
          `${property} must be at least ${validator.min}`
        );
      }
      
      if (validator.max !== undefined && value > validator.max) {
        throw new RangeError(
          `${property} must be at most ${validator.max}`
        );
      }
      
      if (validator.pattern && !validator.pattern.test(value)) {
        throw new Error(`${property} format is invalid`);
      }
      
      target[property] = value;
      return true;
    }
  });
};

const userSchema = {
  name: { type: 'string', required: true },
  age: { type: 'number', min: 0, max: 150 },
  email: { type: 'string', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
};

const user = createValidator(userSchema);

user.name = 'Alice'; // Works
user.age = 30; // Works
user.email = 'alice@example.com'; // Works

try {
  user.age = 200; // RangeError: age must be at most 150
} catch (e) {
  console.log(e.message);
}

try {
  user.email = 'invalid'; // Error: email format is invalid
} catch (e) {
  console.log(e.message);
}
```

**Logging:**

```javascript
const createLogger = (target, name = 'Object') => {
  return new Proxy(target, {
    get(target, property) {
      console.log(`[${name}] GET ${String(property)}: ${target[property]}`);
      return target[property];
    },
    
    set(target, property, value) {
      console.log(
        `[${name}] SET ${String(property)}: ${target[property]} -> ${value}`
      );
      target[property] = value;
      return true;
    },
    
    deleteProperty(target, property) {
      console.log(`[${name}] DELETE ${String(property)}: ${target[property]}`);
      delete target[property];
      return true;
    },
    
    apply(target, thisArg, args) {
      console.log(`[${name}] CALL with args: ${JSON.stringify(args)}`);
      const result = target.apply(thisArg, args);
      console.log(`[${name}] RETURN: ${result}`);
      return result;
    }
  });
};

const obj = createLogger({ name: 'Alice', age: 30 }, 'User');

obj.name; // "[User] GET name: Alice"
obj.age = 31; // "[User] SET age: 30 -> 31"
delete obj.age; // "[User] DELETE age: 31"

const add = createLogger((a, b) => a + b, 'AddFunction');
add(5, 3); // Logs call and return
```

**Virtualization (Lazy Loading):**

```javascript
const createVirtualArray = (length, generator) => {
  const cache = {};
  
  return new Proxy({}, {
    get(target, property) {
      if (property === 'length') {
        return length;
      }
      
      const index = Number(property);
      if (Number.isInteger(index) && index >= 0 && index < length) {
        if (!(index in cache)) {
          console.log(`Generating value for index ${index}`);
          cache[index] = generator(index);
        }
        return cache[index];
      }
      
      return target[property];
    }
  });
};

// Virtual array of squares
const squares = createVirtualArray(1000000, (i) => i * i);

console.log(squares[0]); // 0
console.log(squares[10]); // 100
console.log(squares[100]); // 10000
console.log(squares.length); // 1000000

// Only 3 values were actually computed!
```

**API Wrapper:**

```javascript
const createAPIWrapper = (baseURL) => {
  return new Proxy({}, {
    get(target, property) {
      return async (...args) => {
        const endpoint = `${baseURL}/${property}`;
        console.log(`Calling API: ${endpoint}`);
        
        // Simulate API call
        return {
          endpoint,
          method: property,
          args
        };
      };
    }
  });
};

const api = createAPIWrapper('https://api.example.com');

// API calls are created dynamically
api.getUsers().then(result => console.log(result));
api.createPost('title', 'content').then(result => console.log(result));
api.updateUser(123, { name: 'Alice' }).then(result => console.log(result));
```

### Observable Pattern with Proxy

**Basic Observable:**

```javascript
const createObservable = (target, onChange) => {
  return new Proxy(target, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      
      onChange({
        property,
        oldValue,
        newValue: value,
        target
      });
      
      return true;
    },
    
    deleteProperty(target, property) {
      const oldValue = target[property];
      delete target[property];
      
      onChange({
        property,
        oldValue,
        newValue: undefined,
        deleted: true,
        target
      });
      
      return true;
    }
  });
};

const state = createObservable(
  { count: 0, name: 'Alice' },
  (change) => {
    console.log(`Property "${change.property}" changed from`, 
                change.oldValue, 'to', change.newValue);
  }
);

state.count = 1; // Logs change
state.name = 'Bob'; // Logs change
delete state.count; // Logs deletion
```

**Observable with Multiple Listeners:**

```javascript
const createObservableWithListeners = (target) => {
  const listeners = [];
  
  const proxy = new Proxy(target, {
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      
      const change = { property, oldValue, newValue: value };
      listeners.forEach(listener => listener(change));
      
      return true;
    }
  });
  
  return {
    observable: proxy,
    subscribe(listener) {
      listeners.push(listener);
      
      // Return unsubscribe function
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }
  };
};

const { observable, subscribe } = createObservableWithListeners({
  count: 0
});

const unsubscribe1 = subscribe((change) => {
  console.log('Listener 1:', change);
});

const unsubscribe2 = subscribe((change) => {
  console.log('Listener 2:', change);
});

observable.count = 1; // Both listeners notified
observable.count = 2; // Both listeners notified

unsubscribe1(); // Remove first listener

observable.count = 3; // Only listener 2 notified
```

**Deep Observable:**

```javascript
const createDeepObservable = (target, onChange, path = []) => {
  return new Proxy(target, {
    get(target, property) {
      const value = target[property];
      
      // If value is an object, wrap it in a proxy too
      if (typeof value === 'object' && value !== null) {
        return createDeepObservable(value, onChange, [...path, property]);
      }
      
      return value;
    },
    
    set(target, property, value) {
      const oldValue = target[property];
      target[property] = value;
      
      onChange({
        path: [...path, property],
        property,
        oldValue,
        newValue: value
      });
      
      return true;
    }
  });
};

const state = createDeepObservable(
  {
    user: {
      name: 'Alice',
      address: {
        city: 'New York',
        zip: '10001'
      }
    }
  },
  (change) => {
    console.log(`Changed ${change.path.join('.')}: ${change.oldValue} -> ${change.newValue}`);
  }
);

state.user.name = 'Bob'; // "Changed user.name: Alice -> Bob"
state.user.address.city = 'Boston'; // "Changed user.address.city: New York -> Boston"
```

**Reactive UI with Observable:**

```javascript
const createReactiveState = (initialState) => {
  const listeners = new Map();
  
  const notify = (property, value) => {
    if (listeners.has(property)) {
      listeners.get(property).forEach(callback => callback(value));
    }
    
    // Notify wildcard listeners
    if (listeners.has('*')) {
      listeners.get('*').forEach(callback => 
        callback({ property, value })
      );
    }
  };
  
  const proxy = new Proxy(initialState, {
    set(target, property, value) {
      target[property] = value;
      notify(property, value);
      return true;
    }
  });
  
  return {
    state: proxy,
    
    watch(property, callback) {
      if (!listeners.has(property)) {
        listeners.set(property, []);
      }
      listeners.get(property).push(callback);
      
      // Return unwatch function
      return () => {
        const callbacks = listeners.get(property);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      };
    }
  };
};

const { state, watch } = createReactiveState({
  count: 0,
  name: 'Alice'
});

// Watch specific property
watch('count', (value) => {
  console.log(`Count updated to: ${value}`);
  // Update DOM: document.getElementById('count').textContent = value;
});

// Watch all changes
watch('*', (change) => {
  console.log(`State changed:`, change);
});

state.count = 1; // Triggers count watcher and wildcard watcher
state.count = 2;
state.name = 'Bob'; // Triggers only wildcard watcher
```

---

## 15.2 Reflect

The Reflect API provides methods for interceptable JavaScript operations. These methods correspond to Proxy handler traps and provide a more functional approach to object manipulation.

### `Reflect` Methods (Mirror Proxy Traps)

Every Proxy trap has a corresponding Reflect method.

**`Reflect.get()`:**

```javascript
const obj = {
  name: 'Alice',
  age: 30,
  get fullInfo() {
    return `${this.name}, ${this.age}`;
  }
};

// Traditional access
console.log(obj.name); // 'Alice'

// Using Reflect
console.log(Reflect.get(obj, 'name')); // 'Alice'
console.log(Reflect.get(obj, 'age')); // 30

// With receiver (sets 'this' for getters)
const anotherObj = { name: 'Bob', age: 25 };
console.log(Reflect.get(obj, 'fullInfo', anotherObj)); // "Bob, 25"
```

**`Reflect.set()`:**

```javascript
const obj = { name: 'Alice' };

// Traditional assignment
obj.name = 'Bob';

// Using Reflect
Reflect.set(obj, 'age', 30);
console.log(obj); // { name: 'Bob', age: 30 }

// Returns boolean indicating success
const success = Reflect.set(obj, 'email', 'alice@example.com');
console.log(success); // true

// With receiver (for setters)
const target = {
  _value: 0,
  set value(v) {
    this._value = v;
  }
};

const receiver = {};
Reflect.set(target, 'value', 42, receiver);
console.log(receiver._value); // 42 (set on receiver, not target)
```

**`Reflect.has()`:**

```javascript
const obj = { name: 'Alice', age: 30 };

// Traditional 'in' operator
console.log('name' in obj); // true

// Using Reflect
console.log(Reflect.has(obj, 'name')); // true
console.log(Reflect.has(obj, 'email')); // false

// Works with prototype chain
console.log(Reflect.has(obj, 'toString')); // true
```

**`Reflect.deleteProperty()`:**

```javascript
const obj = { name: 'Alice', age: 30 };

// Traditional delete
delete obj.name;

// Using Reflect
const success = Reflect.deleteProperty(obj, 'age');
console.log(success); // true
console.log(obj); // {}

// Returns false if property is non-configurable
Object.defineProperty(obj, 'id', {
  value: 123,
  configurable: false
});

const deleted = Reflect.deleteProperty(obj, 'id');
console.log(deleted); // false (couldn't delete)
console.log(obj.id); // 123 (still there)
```

**`Reflect.ownKeys()`:**

```javascript
const obj = {
  name: 'Alice',
  age: 30,
  [Symbol('id')]: 123
};

// Get all own property keys (including symbols)
const keys = Reflect.ownKeys(obj);
console.log(keys); // ['name', 'age', Symbol(id)]

// Compare with Object.keys (doesn't include symbols)
console.log(Object.keys(obj)); // ['name', 'age']

// Compare with Object.getOwnPropertySymbols
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(id)]
```

**`Reflect.getOwnPropertyDescriptor()`:**

```javascript
const obj = { name: 'Alice' };

Object.defineProperty(obj, 'age', {
  value: 30,
  writable: false,
  enumerable: false
});

// Get descriptor
const desc = Reflect.getOwnPropertyDescriptor(obj, 'age');
console.log(desc);
// { value: 30, writable: false, enumerable: false, configurable: false }

// Returns undefined if property doesn't exist
console.log(Reflect.getOwnPropertyDescriptor(obj, 'missing')); // undefined
```

**`Reflect.defineProperty()`:**

```javascript
const obj = {};

// Define property with descriptor
const success = Reflect.defineProperty(obj, 'name', {
  value: 'Alice',
  writable: true,
  enumerable: true,
  configurable: true
});

console.log(success); // true
console.log(obj.name); // 'Alice'

// Returns false on failure (doesn't throw)
Object.preventExtensions(obj);
const added = Reflect.defineProperty(obj, 'age', { value: 30 });
console.log(added); // false
```

**`Reflect.preventExtensions()` and `Reflect.isExtensible()`:**

```javascript
const obj = { name: 'Alice' };

// Check if extensible
console.log(Reflect.isExtensible(obj)); // true

// Prevent extensions
const prevented = Reflect.preventExtensions(obj);
console.log(prevented); // true

// Check again
console.log(Reflect.isExtensible(obj)); // false

// Cannot add new properties
try {
  obj.age = 30; // Fails silently or throws in strict mode
} catch (e) {
  console.log('Cannot add property');
}
```

**`Reflect.getPrototypeOf()` and `Reflect.setPrototypeOf()`:**

```javascript
const proto = { inherited: 'value' };
const obj = Object.create(proto);

// Get prototype
console.log(Reflect.getPrototypeOf(obj) === proto); // true

// Set prototype
const newProto = { newInherited: 'newValue' };
const success = Reflect.setPrototypeOf(obj, newProto);
console.log(success); // true
console.log(obj.newInherited); // 'newValue'
```

**`Reflect.apply()`:**

```javascript
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// Traditional call/apply
console.log(greet.call(person, 'Hello', '!')); // "Hello, Alice!"
console.log(greet.apply(person, ['Hello', '!'])); // "Hello, Alice!"

// Using Reflect.apply
console.log(Reflect.apply(greet, person, ['Hello', '!'])); // "Hello, Alice!"

// Works with any callable
console.log(Reflect.apply(Math.max, null, [1, 5, 3, 9, 2])); // 9
```

**`Reflect.construct()`:**

```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// Traditional construction
const alice = new Person('Alice', 30);

// Using Reflect.construct
const bob = Reflect.construct(Person, ['Bob', 25]);
console.log(bob instanceof Person); // true
console.log(bob.name); // 'Bob'

// With custom prototype (third argument)
function Employee() {}
const charlie = Reflect.construct(Person, ['Charlie', 35], Employee);
console.log(charlie instanceof Employee); // true
console.log(charlie.name); // 'Charlie'
```

### Why Use Reflect Over Object Methods

Reflect provides several advantages over traditional Object methods and operators.

**1. Consistent Return Values:**

```javascript
// Object.defineProperty throws on failure
try {
  const obj = {};
  Object.preventExtensions(obj);
  Object.defineProperty(obj, 'name', { value: 'Alice' }); // Throws
} catch (e) {
  console.log('Object.defineProperty threw an error');
}

// Reflect.defineProperty returns boolean
const obj2 = {};
Object.preventExtensions(obj2);
const success = Reflect.defineProperty(obj2, 'name', { value: 'Alice' });
console.log(success); // false (no exception)
```

**2. Function Application:**

```javascript
// Traditional: function.apply(thisArg, args)
// Can be confusing when function is not a direct reference
function greet() {
  return `Hello, ${this.name}`;
}

const methods = { greet };
const obj = { name: 'Alice' };

// Awkward
console.log(methods.greet.apply(obj)); // "Hello, Alice"

// Clearer with Reflect
console.log(Reflect.apply(methods.greet, obj, [])); // "Hello, Alice"
```

**3. Reliable Operators as Functions:**

```javascript
// The 'in' operator can be shadowed
const obj = {
  name: 'Alice',
  in: 'shadowed' // Shadows 'in' operator in some contexts
};

// Using Reflect avoids confusion
console.log(Reflect.has(obj, 'name')); // true
console.log(Reflect.has(obj, 'in')); // true

// Same with delete
const obj2 = {
  value: 42,
  delete: 'shadowed'
};

Reflect.deleteProperty(obj2, 'value'); // Clear and unambiguous
```

**4. Better Error Handling:**

```javascript
// Trying to prevent extensions on non-object
try {
  Object.preventExtensions(42); // Returns 42 in ES6+ (confusing)
} catch (e) {
  console.log('Error');
}

// Reflect throws TypeError for non-objects (more predictable)
try {
  Reflect.preventExtensions(42); // TypeError
} catch (e) {
  console.log('Reflect properly throws for non-objects');
}
```

**5. Functional Programming Style:**

```javascript
// Object methods are imperative
const obj = { name: 'Alice' };
obj.age = 30;
delete obj.name;

// Reflect methods are more functional
const obj2 = { name: 'Alice' };
const operations = [
  () => Reflect.set(obj2, 'age', 30),
  () => Reflect.deleteProperty(obj2, 'name')
];

operations.forEach(op => {
  const success = op();
  console.log('Operation success:', success);
});
```

**6. Metaprogramming Clarity:**

```javascript
// When building abstractions, Reflect is clearer
function createFlexibleObject(target, config) {
  const handler = {
    get(target, property) {
      if (config.log) {
        console.log(`Getting ${property}`);
      }
      // Using Reflect makes it clear we're delegating to default behavior
      return Reflect.get(target, property);
    },
    
    set(target, property, value) {
      if (config.validate) {
        // Validation logic
      }
      // Explicit delegation
      return Reflect.set(target, property, value);
    }
  };
  
  return new Proxy(target, handler);
}
```

### Reflect as Receiver in Proxy

Using Reflect in Proxy handlers provides correct default behavior and proper receiver handling.

**Basic Pattern:**

```javascript
const handler = {
  get(target, property, receiver) {
    console.log(`Getting ${property}`);
    // Delegate to default behavior with correct receiver
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log(`Setting ${property} = ${value}`);
    // Delegate to default behavior with correct receiver
    return Reflect.set(target, property, value, receiver);
  }
};

const obj = new Proxy({ name: 'Alice' }, handler);
console.log(obj.name); // Logs and returns 'Alice'
obj.age = 30; // Logs and sets
```

**Why Receiver Matters:**

```javascript
const target = {
  _value: 0,
  get value() {
    return this._value;
  },
  set value(v) {
    this._value = v;
  }
};

const handler = {
  get(target, property, receiver) {
    console.log('Proxy get:', property);
    // CORRECT: Pass receiver so 'this' in getter is the proxy
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log('Proxy set:', property, value);
    // CORRECT: Pass receiver so 'this' in setter is the proxy
    return Reflect.set(target, property, value, receiver);
  }
};

const proxy = new Proxy(target, handler);

// Without receiver, getters/setters would use wrong 'this'
proxy.value = 42; // Correctly sets proxy._value
console.log(proxy.value); // Correctly gets from proxy._value
console.log(proxy._value); // 42
```

**Inheritance Example:**

```javascript
const parent = {
  _value: 0,
  get value() {
    console.log('Parent getter, this:', this);
    return this._value;
  }
};

const handler = {
  get(target, property, receiver) {
    console.log(`Intercepted: ${property}`);
    // Passing receiver ensures 'this' in getter is the child
    return Reflect.get(target, property, receiver);
  }
};

const child = Object.create(new Proxy(parent, handler));
child._value = 42;

// When accessing through child, 'this' should be child
console.log(child.value);
// Without receiver, 'this' would be parent
// With receiver, 'this' is correctly child, returns 42
```

**Complete Example with All Traps:**

```javascript
const createLoggingProxy = (target, name = 'Proxy') => {
  return new Proxy(target, {
    get(target, property, receiver) {
      console.log(`[${name}] GET ${String(property)}`);
      return Reflect.get(target, property, receiver);
    },
    
    set(target, property, value, receiver) {
      console.log(`[${name}] SET ${String(property)} = ${value}`);
      return Reflect.set(target, property, value, receiver);
    },
    
    has(target, property) {
      console.log(`[${name}] HAS ${String(property)}`);
      return Reflect.has(target, property);
    },
    
    deleteProperty(target, property) {
      console.log(`[${name}] DELETE ${String(property)}`);
      return Reflect.deleteProperty(target, property);
    },
    
    ownKeys(target) {
      console.log(`[${name}] OWN_KEYS`);
      return Reflect.ownKeys(target);
    },
    
    getOwnPropertyDescriptor(target, property) {
      console.log(`[${name}] GET_DESCRIPTOR ${String(property)}`);
      return Reflect.getOwnPropertyDescriptor(target, property);
    },
    
    defineProperty(target, property, descriptor) {
      console.log(`[${name}] DEFINE ${String(property)}`);
      return Reflect.defineProperty(target, property, descriptor);
    },
    
    preventExtensions(target) {
      console.log(`[${name}] PREVENT_EXTENSIONS`);
      return Reflect.preventExtensions(target);
    },
    
    isExtensible(target) {
      console.log(`[${name}] IS_EXTENSIBLE`);
      return Reflect.isExtensible(target);
    },
    
    getPrototypeOf(target) {
      console.log(`[${name}] GET_PROTOTYPE`);
      return Reflect.getPrototypeOf(target);
    },
    
    setPrototypeOf(target, proto) {
      console.log(`[${name}] SET_PROTOTYPE`);
      return Reflect.setPrototypeOf(target, proto);
    },
    
    apply(target, thisArg, argumentsList) {
      console.log(`[${name}] APPLY`);
      return Reflect.apply(target, thisArg, argumentsList);
    },
    
    construct(target, argumentsList, newTarget) {
      console.log(`[${name}] CONSTRUCT`);
      return Reflect.construct(target, argumentsList, newTarget);
    }
  });
};

// Test with object
const obj = createLoggingProxy({ name: 'Alice' }, 'Object');
obj.name; // Logs GET
obj.age = 30; // Logs SET
'name' in obj; // Logs HAS
Object.keys(obj); // Logs OWN_KEYS

// Test with function
const fn = createLoggingProxy((a, b) => a + b, 'Function');
fn(5, 3); // Logs APPLY

// Test with constructor
const Ctor = createLoggingProxy(function(name) { this.name = name; }, 'Constructor');
new Ctor('Bob'); // Logs CONSTRUCT
```

**Maintaining Invariants:**

```javascript
// Proxies must respect object invariants
const handler = {
  get(target, property, receiver) {
    // If target property is non-writable, non-configurable
    // we MUST return the same value
    const desc = Object.getOwnPropertyDescriptor(target, property);
    
    if (desc && !desc.writable && !desc.configurable) {
      // Must return actual value, not a modified one
      return Reflect.get(target, property, receiver);
    }
    
    // Can modify other properties
    return Reflect.get(target, property, receiver);
  }
};

const obj = {};
Object.defineProperty(obj, 'constant', {
  value: 42,
  writable: false,
  configurable: false
});

const proxy = new Proxy(obj, handler);
console.log(proxy.constant); // Must be 42
```

---

## Summary

This document covered Proxy and Reflection comprehensively:

- **Proxy**: Constructor, all 13 handler traps (`get`, `set`, `has`, `deleteProperty`, `ownKeys`, `getOwnPropertyDescriptor`, `defineProperty`, `preventExtensions`, `isExtensible`, `getPrototypeOf`, `setPrototypeOf`, `apply`, `construct`), revocable proxies, and practical use cases
- **Reflect**: All methods mirroring proxy traps, advantages over Object methods, and proper usage as receiver in proxy handlers

Proxies and Reflect provide powerful metaprogramming capabilities for creating flexible, dynamic objects with custom behavior.

---

**Related Topics to Explore Next:**

- WeakMap and WeakSet for memory-efficient proxies
- Symbol for custom object behaviors
- Decorators (stage 3 proposal)
- Advanced metaprogramming patterns
- Performance considerations with proxies
---

**End of Chapter 15**
