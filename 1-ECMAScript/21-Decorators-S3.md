# 21 Decorators S3

---

# Decorators (Stage 3)

## Table of Contents

- [21.1 Class Decorators](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#211-class-decorators)
- [21.2 Method Decorators](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#212-method-decorators)
- [21.3 Accessor Decorators](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#213-accessor-decorators)
- [21.4 Field Decorators](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#214-field-decorators)
- [21.5 Auto-accessor Decorators](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#215-auto-accessor-decorators)

---

**Note:** Decorators are currently a Stage 3 proposal. This document describes the proposed API which may change before final standardization. You'll need TypeScript or Babel to use decorators in current environments.

**TypeScript Configuration:**

```json
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "target": "ES2022"
  }
}
```

**Babel Configuration:**

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "version": "2023-05" }]
  ]
}
```

---


## 21.1 Class Decorators

Class decorators can modify or replace the entire class definition.

### Modifying Class Behavior

Class decorators receive the class constructor and can return a new constructor or modify the existing one.

**Basic Class Decorator:**

```javascript
function logged(value, context) {
  if (context.kind === 'class') {
    // Return a new class that extends the original
    return class extends value {
      constructor(...args) {
        console.log(`Creating instance of ${context.name}`);
        super(...args);
      }
    };
  }
}

@logged
class User {
  constructor(name) {
    this.name = name;
  }
}

const user = new User('Alice');
// Logs: "Creating instance of User"
```

**Adding Methods to Class:**

```javascript
function withToString(value, context) {
  if (context.kind === 'class') {
    return class extends value {
      toString() {
        return `${context.name} instance`;
      }
    };
  }
}

@withToString
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
}

const product = new Product('Laptop', 999);
console.log(product.toString()); // "Product instance"
```

**Adding Static Methods:**

```javascript
function withFactory(value, context) {
  if (context.kind === 'class') {
    // Add static factory method
    value.create = function(...args) {
      console.log('Creating via factory');
      return new value(...args);
    };
  }
  return value;
}

@withFactory
class Widget {
  constructor(id) {
    this.id = id;
  }
}

const widget = Widget.create(123);
console.log(widget.id); // 123
```

**Registry Pattern:**

```javascript
const registry = new Map();

function register(value, context) {
  if (context.kind === 'class') {
    registry.set(context.name, value);
    console.log(`Registered class: ${context.name}`);
  }
  return value;
}

@register
class Service {
  doWork() {
    return 'working';
  }
}

@register
class Controller {
  handleRequest() {
    return 'handled';
  }
}

// Access registered classes
console.log(registry.get('Service')); // Service class
console.log(registry.get('Controller')); // Controller class

// Factory pattern
function createInstance(className, ...args) {
  const Class = registry.get(className);
  return Class ? new Class(...args) : null;
}

const service = createInstance('Service');
console.log(service.doWork()); // "working"
```

**Validation Decorator:**

```javascript
function validateConstructor(value, context) {
  if (context.kind === 'class') {
    return class extends value {
      constructor(...args) {
        // Validate arguments
        if (args.length === 0) {
          throw new Error(`${context.name} requires arguments`);
        }
        super(...args);
      }
    };
  }
}

@validateConstructor
class Account {
  constructor(accountNumber) {
    this.accountNumber = accountNumber;
  }
}

const account = new Account('12345'); // OK
// const invalid = new Account(); // Error: Account requires arguments
```

**Singleton Pattern:**

```javascript
function singleton(value, context) {
  if (context.kind === 'class') {
    let instance;
    
    return class extends value {
      constructor(...args) {
        if (instance) {
          return instance;
        }
        super(...args);
        instance = this;
      }
    };
  }
}

@singleton
class Database {
  constructor(connectionString) {
    this.connectionString = connectionString;
  }
}

const db1 = new Database('mysql://localhost');
const db2 = new Database('postgres://localhost');

console.log(db1 === db2); // true (same instance)
console.log(db1.connectionString); // "mysql://localhost"
```

**Metadata Collection:**

```javascript
const metadata = new WeakMap();

function collectMetadata(value, context) {
  if (context.kind === 'class') {
    // Store metadata about the class
    metadata.set(value, {
      name: context.name,
      createdAt: new Date(),
      version: '1.0.0'
    });
  }
  return value;
}

@collectMetadata
class Component {
  render() {
    return '<div>Component</div>';
  }
}

console.log(metadata.get(Component));
// { name: 'Component', createdAt: Date, version: '1.0.0' }
```

**Freezing/Sealing Classes:**

```javascript
function frozen(value, context) {
  if (context.kind === 'class') {
    return class extends value {
      constructor(...args) {
        super(...args);
        Object.freeze(this);
      }
    };
  }
}

@frozen
class ImmutablePoint {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const point = new ImmutablePoint(10, 20);
point.x = 100; // Silently fails (or throws in strict mode)
console.log(point.x); // 10 (unchanged)
```

---

## 21.2 Method Decorators

Method decorators can modify method behavior, add logging, validation, or completely replace methods.

### Modifying Methods

Method decorators receive the original method and can return a replacement function.

**Basic Method Decorator:**

```javascript
function log(value, context) {
  if (context.kind === 'method') {
    return function(...args) {
      console.log(`Calling ${context.name} with:`, args);
      const result = value.apply(this, args);
      console.log(`${context.name} returned:`, result);
      return result;
    };
  }
}

class Calculator {
  @log
  add(a, b) {
    return a + b;
  }
  
  @log
  multiply(a, b) {
    return a * b;
  }
}

const calc = new Calculator();
calc.add(5, 3);
// Logs: "Calling add with: [5, 3]"
// Logs: "add returned: 8"
```

**Timing/Performance Decorator:**

```javascript
function measure(value, context) {
  if (context.kind === 'method') {
    return function(...args) {
      const start = performance.now();
      const result = value.apply(this, args);
      const end = performance.now();
      
      console.log(`${context.name} took ${(end - start).toFixed(2)}ms`);
      return result;
    };
  }
}

class DataProcessor {
  @measure
  processLargeDataset(data) {
    // Simulate expensive operation
    return data.map(x => x * 2).reduce((a, b) => a + b, 0);
  }
}

const processor = new DataProcessor();
const data = Array.from({ length: 1000000 }, (_, i) => i);
processor.processLargeDataset(data);
// Logs: "processLargeDataset took 45.23ms"
```

**Memoization Decorator:**

```javascript
function memoize(value, context) {
  if (context.kind === 'method') {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        console.log(`Cache hit for ${context.name}`);
        return cache.get(key);
      }
      
      console.log(`Computing ${context.name}`);
      const result = value.apply(this, args);
      cache.set(key, result);
      return result;
    };
  }
}

class MathUtils {
  @memoize
  fibonacci(n) {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
  
  @memoize
  factorial(n) {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}

const math = new MathUtils();
console.log(math.fibonacci(10)); // Computes
console.log(math.fibonacci(10)); // Cache hit
```

**Validation Decorator:**

```javascript
function validate(schema) {
  return function(value, context) {
    if (context.kind === 'method') {
      return function(...args) {
        // Validate arguments
        for (let i = 0; i < schema.length; i++) {
          const validator = schema[i];
          if (!validator(args[i])) {
            throw new TypeError(
              `Argument ${i} of ${context.name} failed validation`
            );
          }
        }
        
        return value.apply(this, args);
      };
    }
  };
}

// Validators
const isString = (val) => typeof val === 'string';
const isNumber = (val) => typeof val === 'number';
const isPositive = (val) => typeof val === 'number' && val > 0;

class UserService {
  @validate([isString, isPositive])
  createUser(name, age) {
    return { name, age };
  }
  
  @validate([isNumber, isNumber])
  calculateTotal(price, quantity) {
    return price * quantity;
  }
}

const service = new UserService();
service.createUser('Alice', 30); // OK
// service.createUser('Bob', -5); // Error: Argument 1 failed validation
```

**Retry Decorator:**

```javascript
function retry(maxAttempts = 3, delay = 1000) {
  return function(value, context) {
    if (context.kind === 'method') {
      return async function(...args) {
        let lastError;
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            console.log(`Attempt ${attempt} of ${context.name}`);
            return await value.apply(this, args);
          } catch (error) {
            lastError = error;
            console.log(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        throw lastError;
      };
    }
  };
}

class ApiClient {
  @retry(3, 500)
  async fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}
```

**Deprecation Warning:**

```javascript
function deprecated(message) {
  return function(value, context) {
    if (context.kind === 'method') {
      return function(...args) {
        console.warn(
          `Warning: ${context.name} is deprecated. ${message}`
        );
        return value.apply(this, args);
      };
    }
  };
}

class LegacyApi {
  @deprecated('Use newMethod() instead')
  oldMethod() {
    return 'old result';
  }
  
  newMethod() {
    return 'new result';
  }
}

const api = new LegacyApi();
api.oldMethod();
// Warning: oldMethod is deprecated. Use newMethod() instead
```

**Debounce/Throttle Decorator:**

```javascript
function debounce(delay) {
  return function(value, context) {
    if (context.kind === 'method') {
      let timeoutId;
      
      return function(...args) {
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          value.apply(this, args);
        }, delay);
      };
    }
  };
}

function throttle(delay) {
  return function(value, context) {
    if (context.kind === 'method') {
      let lastCall = 0;
      
      return function(...args) {
        const now = Date.now();
        
        if (now - lastCall >= delay) {
          lastCall = now;
          return value.apply(this, args);
        }
      };
    }
  };
}

class SearchBox {
  @debounce(300)
  onSearchInput(query) {
    console.log('Searching for:', query);
    // Perform search
  }
  
  @throttle(1000)
  onScroll(position) {
    console.log('Scrolled to:', position);
    // Handle scroll
  }
}
```

---

## 21.3 Accessor Decorators

Accessor decorators can modify getters and setters, adding validation, logging, or computed properties.

### Modifying Getters/Setters

Accessor decorators work with getter and setter methods.

**Basic Accessor Decorator:**

```javascript
function logged(value, context) {
  if (context.kind === 'getter') {
    return function() {
      const result = value.call(this);
      console.log(`Getting ${context.name}:`, result);
      return result;
    };
  }
  
  if (context.kind === 'setter') {
    return function(val) {
      console.log(`Setting ${context.name}:`, val);
      return value.call(this, val);
    };
  }
}

class Person {
  #name = '';
  
  @logged
  get name() {
    return this.#name;
  }
  
  @logged
  set name(value) {
    this.#name = value;
  }
}

const person = new Person();
person.name = 'Alice'; // Logs: "Setting name: Alice"
console.log(person.name); // Logs: "Getting name: Alice"
```

**Validation in Setter:**

```javascript
function range(min, max) {
  return function(value, context) {
    if (context.kind === 'setter') {
      return function(val) {
        if (val < min || val > max) {
          throw new RangeError(
            `${context.name} must be between ${min} and ${max}`
          );
        }
        return value.call(this, val);
      };
    }
    return value;
  };
}

class Temperature {
  #celsius = 0;
  
  @range(-273.15, 1000)
  set celsius(value) {
    this.#celsius = value;
  }
  
  get celsius() {
    return this.#celsius;
  }
  
  get fahrenheit() {
    return (this.#celsius * 9/5) + 32;
  }
}

const temp = new Temperature();
temp.celsius = 25; // OK
// temp.celsius = -300; // Error: celsius must be between -273.15 and 1000
```

**Computed Property Caching:**

```javascript
function cached(value, context) {
  if (context.kind === 'getter') {
    const cacheKey = Symbol(`cached_${context.name}`);
    
    return function() {
      if (!this.hasOwnProperty(cacheKey)) {
        console.log(`Computing ${context.name}`);
        Object.defineProperty(this, cacheKey, {
          value: value.call(this),
          writable: false,
          enumerable: false
        });
      } else {
        console.log(`Using cached ${context.name}`);
      }
      return this[cacheKey];
    };
  }
}

class DataAnalyzer {
  constructor(data) {
    this.data = data;
  }
  
  @cached
  get average() {
    // Expensive computation
    return this.data.reduce((a, b) => a + b, 0) / this.data.length;
  }
  
  @cached
  get standardDeviation() {
    const avg = this.average;
    const squareDiffs = this.data.map(x => Math.pow(x - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / this.data.length);
  }
}

const analyzer = new DataAnalyzer([1, 2, 3, 4, 5]);
console.log(analyzer.average); // Computes
console.log(analyzer.average); // Uses cached
console.log(analyzer.standardDeviation); // Computes (uses cached average)
```

**Read-only Property:**

```javascript
function readonly(value, context) {
  if (context.kind === 'setter') {
    return function(val) {
      throw new Error(`${context.name} is read-only`);
    };
  }
  return value;
}

class Configuration {
  #apiKey = 'secret-key';
  
  get apiKey() {
    return this.#apiKey;
  }
  
  @readonly
  set apiKey(value) {
    this.#apiKey = value;
  }
}

const config = new Configuration();
console.log(config.apiKey); // "secret-key"
// config.apiKey = 'new-key'; // Error: apiKey is read-only
```

**Type Coercion:**

```javascript
function coerce(type) {
  return function(value, context) {
    if (context.kind === 'setter') {
      return function(val) {
        let coerced;
        
        switch (type) {
          case 'string':
            coerced = String(val);
            break;
          case 'number':
            coerced = Number(val);
            break;
          case 'boolean':
            coerced = Boolean(val);
            break;
          default:
            coerced = val;
        }
        
        return value.call(this, coerced);
      };
    }
    return value;
  };
}

class FormData {
  #age;
  #active;
  
  @coerce('number')
  set age(value) {
    this.#age = value;
  }
  
  get age() {
    return this.#age;
  }
  
  @coerce('boolean')
  set active(value) {
    this.#active = value;
  }
  
  get active() {
    return this.#active;
  }
}

const form = new FormData();
form.age = '25'; // Coerced to number
form.active = 'yes'; // Coerced to boolean

console.log(typeof form.age); // "number"
console.log(typeof form.active); // "boolean"
console.log(form.active); // true
```

---

## 21.4 Field Decorators

Field decorators can modify class fields, adding initialization logic or validation.

### Modifying Class Fields

Field decorators receive an initialization function that can transform the field value.

**Basic Field Decorator:**

```javascript
function logged(value, context) {
  if (context.kind === 'field') {
    return function(initialValue) {
      console.log(`Initializing ${context.name} with:`, initialValue);
      return initialValue;
    };
  }
}

class User {
  @logged
  name = 'Anonymous';
  
  @logged
  age = 0;
}

const user = new User();
// Logs: "Initializing name with: Anonymous"
// Logs: "Initializing age with: 0"
```

**Default Values:**

```javascript
function withDefault(defaultValue) {
  return function(value, context) {
    if (context.kind === 'field') {
      return function(initialValue) {
        return initialValue ?? defaultValue;
      };
    }
  };
}

class Config {
  @withDefault('localhost')
  host;
  
  @withDefault(3000)
  port;
  
  @withDefault(true)
  debug;
}

const config = new Config();
console.log(config.host); // "localhost"
console.log(config.port); // 3000
console.log(config.debug); // true

const customConfig = new Config();
customConfig.host = 'example.com';
console.log(customConfig.host); // "example.com"
```

**Validation on Initialization:**

```javascript
function validate(validator, message) {
  return function(value, context) {
    if (context.kind === 'field') {
      return function(initialValue) {
        if (!validator(initialValue)) {
          throw new Error(
            `${context.name}: ${message || 'Validation failed'}`
          );
        }
        return initialValue;
      };
    }
  };
}

class Product {
  @validate(val => typeof val === 'string' && val.length > 0, 'Name is required')
  name = 'Unknown';
  
  @validate(val => typeof val === 'number' && val > 0, 'Price must be positive')
  price = 0;
}

const product = new Product();
product.name = 'Laptop'; // OK
// product.price = -10; // Would throw during initialization if set in constructor
```

**Transformation Decorator:**

```javascript
function transform(transformer) {
  return function(value, context) {
    if (context.kind === 'field') {
      return function(initialValue) {
        return transformer(initialValue);
      };
    }
  };
}

class Article {
  @transform(val => val.toUpperCase())
  title = '';
  
  @transform(val => val.trim())
  content = '';
  
  @transform(val => new Date(val))
  publishedAt = Date.now();
}

const article = new Article();
article.title = 'hello world';
console.log(article.title); // "HELLO WORLD"

article.content = '  some content  ';
console.log(article.content); // "some content"
```

**Observable Field:**

```javascript
function observable(value, context) {
  if (context.kind === 'field') {
    const observers = new Set();
    const fieldName = context.name;
    
    // Add observer methods during class initialization
    context.addInitializer(function() {
      this[`observe_${fieldName}`] = function(callback) {
        observers.add(callback);
      };
      
      this[`unobserve_${fieldName}`] = function(callback) {
        observers.delete(callback);
      };
    });
    
    return function(initialValue) {
      let currentValue = initialValue;
      
      // Define getter and setter
      Object.defineProperty(this, fieldName, {
        get() {
          return currentValue;
        },
        set(newValue) {
          const oldValue = currentValue;
          currentValue = newValue;
          
          // Notify observers
          observers.forEach(callback => {
            callback(newValue, oldValue);
          });
        },
        enumerable: true,
        configurable: true
      });
      
      return currentValue;
    };
  }
}

class Model {
  @observable
  data = null;
}

const model = new Model();

model.observe_data((newVal, oldVal) => {
  console.log('Data changed:', oldVal, '->', newVal);
});

model.data = 'first';  // Logs: "Data changed: null -> first"
model.data = 'second'; // Logs: "Data changed: first -> second"
```

**Metadata Decoration:**

```javascript
const fieldMetadata = new WeakMap();

function metadata(meta) {
  return function(value, context) {
    if (context.kind === 'field') {
      context.addInitializer(function() {
        if (!fieldMetadata.has(this.constructor)) {
          fieldMetadata.set(this.constructor, {});
        }
        
        const classMetadata = fieldMetadata.get(this.constructor);
        classMetadata[context.name] = meta;
      });
    }
    return value;
  };
}

class UserModel {
  @metadata({ required: true, type: 'string', maxLength: 100 })
  username;
  
  @metadata({ required: true, type: 'email' })
  email;
  
  @metadata({ required: false, type: 'number', min: 0, max: 150 })
  age;
}

const user = new UserModel();
console.log(fieldMetadata.get(UserModel));
// {
//   username: { required: true, type: 'string', maxLength: 100 },
//   email: { required: true, type: 'email' },
//   age: { required: false, type: 'number', min: 0, max: 150 }
// }
```

---

## 21.5 Auto-accessor Decorators

Auto-accessors combine getter and setter into a single declaration using the `accessor` keyword.

### Combined Getter/Setter Decorators

Auto-accessors create a private backing field with public getter and setter.

**Basic Auto-accessor:**

```javascript
class Person {
  // Auto-accessor creates private field and public getter/setter
  accessor name = 'Anonymous';
  
  // Equivalent to:
  // #name = 'Anonymous';
  // get name() { return this.#name; }
  // set name(value) { this.#name = value; }
}

const person = new Person();
console.log(person.name); // "Anonymous"
person.name = 'Alice';
console.log(person.name); // "Alice"
```

**Decorating Auto-accessors:**

```javascript
function logged(value, context) {
  if (context.kind === 'accessor') {
    // value is { get, set }
    return {
      get() {
        const result = value.get.call(this);
        console.log(`Getting ${context.name}:`, result);
        return result;
      },
      set(val) {
        console.log(`Setting ${context.name}:`, val);
        value.set.call(this, val);
      }
    };
  }
}

class User {
  @logged
  accessor username = 'guest';
  
  @logged
  accessor email = '';
}

const user = new User();
user.username = 'alice'; // Logs: "Setting username: alice"
console.log(user.username); // Logs: "Getting username: alice"
```

**Validation Auto-accessor:**

```javascript
function validated(validator) {
  return function(value, context) {
    if (context.kind === 'accessor') {
      return {
        get() {
          return value.get.call(this);
        },
        set(val) {
          if (!validator(val)) {
            throw new Error(
              `Invalid value for ${context.name}: ${val}`
            );
          }
          value.set.call(this, val);
        }
      };
    }
  };
}

const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isPositive = (val) => typeof val === 'number' && val > 0;

class Account {
  @validated(isEmail)
  accessor email = '';
  
  @validated(isPositive)
  accessor balance = 0;
}

const account = new Account();
account.email = 'alice@example.com'; // OK
// account.email = 'invalid'; // Error: Invalid value for email

account.balance = 100; // OK
// account.balance = -50; // Error: Invalid value for balance
```

**Reactive Auto-accessor:**

```javascript
function reactive(value, context) {
  if (context.kind === 'accessor') {
    const listeners = new Set();
    
    // Add subscription methods
    context.addInitializer(function() {
      this[`on${context.name}Change`] = function(callback) {
        listeners.add(callback);
        return () => listeners.delete(callback);
      };
    });
    
    return {
      get() {
        return value.get.call(this);
      },
      set(newVal) {
        const oldVal = value.get.call(this);
        value.set.call(this, newVal);
        
        // Notify listeners
        if (oldVal !== newVal) {
          listeners.forEach(callback => callback(newVal, oldVal));
        }
      }
    };
  }
}

class Store {
  @reactive
  accessor count = 0;
  
  @reactive
  accessor message = '';
}

const store = new Store();

// Subscribe to changes
const unsubscribe = store.oncountChange((newVal, oldVal) => {
  console.log(`Count changed: ${oldVal} -> ${newVal}`);
});

store.count = 5;  // Logs: "Count changed: 0 -> 5"
store.count = 10; // Logs: "Count changed: 5 -> 10"

unsubscribe(); // Stop listening
store.count = 15; // No log
```

**Computed Auto-accessor:**

```javascript
function computed(dependencies) {
  return function(value, context) {
    if (context.kind === 'accessor') {
      // Cache the computed value
      let cachedValue;
      let dirty = true;
      
      context.addInitializer(function() {
        // Watch dependencies
        dependencies.forEach(dep => {
          const original = Object.getOwnPropertyDescriptor(
            this.constructor.prototype, 
            dep
          );
          
          if (original && original.set) {
            const originalSet = original.set;
            Object.defineProperty(this, dep, {
              ...original,
              set(val) {
                dirty = true;
                originalSet.call(this, val);
              }
            });
          }
        });
      });
      
      return {
        get() {
          if (dirty) {
            cachedValue = value.get.call(this);
            dirty = false;
          }
          return cachedValue;
        },
        set() {
          throw new Error(`${context.name} is computed and cannot be set`);
        }
      };
    }
  };
}

class Rectangle {
  accessor width = 0;
  accessor height = 0;
  
  @computed(['width', 'height'])
  accessor area = function() {
    console.log('Computing area');
    return this.width * this.height;
  };
}

const rect = new Rectangle();
rect.width = 10;
rect.height = 5;

console.log(rect.area); // Computes: 50
console.log(rect.area); // Cached: 50

rect.width = 20;
console.log(rect.area); // Recomputes: 100
```

**Type Coercion Auto-accessor:**

```javascript
function coerceType(type) {
  return function(value, context) {
    if (context.kind === 'accessor') {
      return {
        get() {
          return value.get.call(this);
        },
        set(val) {
          let coerced;
          
          switch (type) {
            case 'string':
              coerced = String(val);
              break;
            case 'number':
              coerced = Number(val);
              if (isNaN(coerced)) {
                throw new TypeError(`Cannot coerce to number: ${val}`);
              }
              break;
            case 'boolean':
              coerced = Boolean(val);
              break;
            case 'date':
              coerced = new Date(val);
              if (isNaN(coerced.getTime())) {
                throw new TypeError(`Cannot coerce to date: ${val}`);
              }
              break;
            default:
              coerced = val;
          }
          
          value.set.call(this, coerced);
        }
      };
    }
  };
}

class FormModel {
  @coerceType('string')
  accessor name = '';
  
  @coerceType('number')
  accessor age = 0;
  
  @coerceType('boolean')
  accessor active = false;
  
  @coerceType('date')
  accessor birthDate = new Date();
}

const form = new FormModel();
form.name = 123; // Coerced to "123"
form.age = '25'; // Coerced to 25
form.active = 'yes'; // Coerced to true
form.birthDate = '2000-01-01'; // Coerced to Date

console.log(typeof form.name); // "string"
console.log(typeof form.age); // "number"
console.log(typeof form.active); // "boolean"
console.log(form.birthDate instanceof Date); // true
```

**Bound Auto-accessor:**

```javascript
function bound(value, context) {
  if (context.kind === 'accessor') {
    context.addInitializer(function() {
      // Bind getter and setter to instance
      const boundGet = value.get.bind(this);
      const boundSet = value.set.bind(this);
      
      Object.defineProperty(this, context.name, {
        get: boundGet,
        set: boundSet,
        enumerable: true,
        configurable: true
      });
    });
  }
  return value;
}

class Component {
  @bound
  accessor state = {};
  
  render() {
    const { state } = this; // Destructuring works
    console.log('Rendering with state:', state);
  }
}

const component = new Component();
component.state = { count: 0 };
component.render(); // Works correctly
```

---

## Combining Multiple Decorators

Decorators can be stacked, applying transformations in order.

**Multiple Decorators:**

```javascript
function uppercase(value, context) {
  if (context.kind === 'accessor') {
    return {
      get() {
        return value.get.call(this);
      },
      set(val) {
        value.set.call(this, String(val).toUpperCase());
      }
    };
  }
}

function trimmed(value, context) {
  if (context.kind === 'accessor') {
    return {
      get() {
        return value.get.call(this);
      },
      set(val) {
        value.set.call(this, String(val).trim());
      }
    };
  }
}

function logged(value, context) {
  if (context.kind === 'accessor') {
    return {
      get() {
        const result = value.get.call(this);
        console.log(`Get ${context.name}:`, result);
        return result;
      },
      set(val) {
        console.log(`Set ${context.name}:`, val);
        value.set.call(this, val);
      }
    };
  }
}

class TextInput {
  @logged
  @trimmed
  @uppercase
  accessor text = '';
}

const input = new TextInput();
input.text = '  hello  ';
// Logs: "Set text:   hello  "
// Applied: trimmed -> "hello"
// Applied: uppercase -> "HELLO"

console.log(input.text);
// Logs: "Get text: HELLO"
// Returns: "HELLO"
```

---

## Summary

This document covered Decorators (Stage 3) comprehensively:

- **Class Decorators**: Modifying entire classes, adding methods, registry patterns, singletons, metadata collection
- **Method Decorators**: Logging, timing, memoization, validation, retry logic, deprecation warnings, debouncing
- **Accessor Decorators**: Modifying getters/setters, validation, caching, read-only properties, type coercion
- **Field Decorators**: Initialization logic, default values, validation, transformation, observable fields, metadata
- **Auto-accessor Decorators**: Combined getter/setter decorators, reactive properties, computed properties, type coercion

Decorators provide a powerful way to add cross-cutting concerns and metaprogramming capabilities to JavaScript classes.

---

**Related Topics to Explore Next:**

- Metadata Reflection API
- Dependency Injection patterns
- Aspect-Oriented Programming (AOP)
- TypeScript decorators
- Framework-specific decorators (Angular, NestJS, etc.)
---

**End of Chapter 21**
