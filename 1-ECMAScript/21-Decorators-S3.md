# 21 Decorators (Stage 3)

---

## Why Decorators Matter

Decorators are **metaprogramming** — code that writes code. They let you modify class behavior declaratively, without cluttering your business logic.

### The Problem Decorators Solve

```javascript
// ❌ WITHOUT DECORATORS: Cross-cutting concerns pollute business logic

class UserService {
  async getUser(id) {
    // Logging boilerplate
    console.log(`[${new Date().toISOString()}] getUser called with ${id}`);
    const start = Date.now();
    
    try {
      // Caching boilerplate
      const cached = cache.get(`user:${id}`);
      if (cached) return cached;
      
      // Actual business logic (buried in boilerplate!)
      const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      
      // More caching boilerplate
      cache.set(`user:${id}`, user, 300);
      
      // Timing boilerplate
      console.log(`getUser took ${Date.now() - start}ms`);
      
      return user;
    } catch (error) {
      // Error handling boilerplate
      console.error(`getUser failed:`, error);
      throw error;
    }
  }
}

// ✅ WITH DECORATORS: Clean separation of concerns

class UserService {
  @logged
  @timed
  @cached({ ttl: 300 })
  async getUser(id) {
    // Pure business logic!
    return await db.query('SELECT * FROM users WHERE id = ?', [id]);
  }
}

// Cross-cutting concerns are declarative, reusable, and testable
```

### When to Use Decorators

| Use Case | Example Decorators |
|----------|-------------------|
| **Logging** | `@logged`, `@timed`, `@trace` |
| **Validation** | `@validate`, `@sanitize`, `@required` |
| **Caching** | `@cached`, `@memoize` |
| **Access Control** | `@authenticated`, `@roles(['admin'])` |
| **Error Handling** | `@retry`, `@fallback`, `@timeout` |
| **Dependency Injection** | `@inject`, `@service`, `@singleton` |
| **Serialization** | `@jsonProperty`, `@expose`, `@exclude` |
| **ORM/Database** | `@entity`, `@column`, `@oneToMany` |

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

## 21.6 Dependency Injection with Decorators

Decorators are perfect for implementing Dependency Injection (DI) — a pattern where classes receive their dependencies from the outside rather than creating them internally.

### Simple DI Container

```javascript
// A basic DI container using decorators
const container = new Map();
const dependencies = new WeakMap();

// Register a class as injectable
function injectable(value, context) {
  if (context.kind === 'class') {
    container.set(context.name, value);
    return value;
  }
}

// Mark a field for injection
function inject(serviceName) {
  return function(value, context) {
    if (context.kind === 'field') {
      return function() {
        const Service = container.get(serviceName);
        if (!Service) throw new Error(`Service ${serviceName} not registered`);
        return new Service();
      };
    }
  };
}

// Usage
@injectable
class Logger {
  log(msg) {
    console.log(`[LOG] ${msg}`);
  }
}

@injectable
class Database {
  query(sql) {
    return `Query result for: ${sql}`;
  }
}

class UserService {
  @inject('Logger')
  logger;
  
  @inject('Database')
  db;
  
  getUser(id) {
    this.logger.log(`Getting user ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

const userService = new UserService();
console.log(userService.getUser(123));
```

### Singleton Pattern

```javascript
// Ensure only one instance exists
const instances = new Map();

function singleton(value, context) {
  if (context.kind === 'class') {
    return new Proxy(value, {
      construct(target, args) {
        if (!instances.has(target)) {
          instances.set(target, new target(...args));
        }
        return instances.get(target);
      }
    });
  }
}

@singleton
class ConfigService {
  constructor() {
    this.config = { env: 'production' };
    console.log('ConfigService created (only once!)');
  }
}

const config1 = new ConfigService();
const config2 = new ConfigService();
console.log(config1 === config2);  // true (same instance)
```

### Scoped Dependencies

```javascript
// Lifetime scopes: singleton, transient, scoped
const lifetimes = new Map();
const scopedInstances = new Map();
let currentScope = null;

function service(lifetime = 'transient') {
  return function(value, context) {
    if (context.kind === 'class') {
      lifetimes.set(context.name, { class: value, lifetime });
      
      return new Proxy(value, {
        construct(target, args) {
          const config = lifetimes.get(context.name);
          
          switch (config.lifetime) {
            case 'singleton':
              if (!instances.has(target)) {
                instances.set(target, new target(...args));
              }
              return instances.get(target);
              
            case 'scoped':
              if (!currentScope) throw new Error('No active scope');
              if (!scopedInstances.get(currentScope)?.has(target)) {
                const scopeMap = scopedInstances.get(currentScope) || new Map();
                scopeMap.set(target, new target(...args));
                scopedInstances.set(currentScope, scopeMap);
              }
              return scopedInstances.get(currentScope).get(target);
              
            case 'transient':
            default:
              return new target(...args);
          }
        }
      });
    }
  };
}

// Create a scope for request handling
function createScope(fn) {
  const scope = Symbol('scope');
  currentScope = scope;
  try {
    return fn();
  } finally {
    scopedInstances.delete(scope);
    currentScope = null;
  }
}

// Usage
@service('singleton')
class AppConfig {}

@service('scoped')
class RequestContext {}

@service('transient')
class Logger {}
```

---

## 21.7 Real-World Decorator Patterns

### Validation Decorators

```javascript
// Field validation using metadata
const validations = new WeakMap();

function required(value, context) {
  if (context.kind === 'field') {
    const existing = validations.get(context) || [];
    existing.push({ type: 'required', field: context.name });
    validations.set(context, existing);
    
    return function(initialValue) {
      return initialValue;
    };
  }
}

function minLength(min) {
  return function(value, context) {
    if (context.kind === 'field') {
      return function(initialValue) {
        // Add validation to setter via addInitializer
        context.addInitializer(function() {
          const original = Object.getOwnPropertyDescriptor(this, context.name);
          Object.defineProperty(this, context.name, {
            set(val) {
              if (typeof val === 'string' && val.length < min) {
                throw new Error(`${context.name} must be at least ${min} characters`);
              }
              this[`_${context.name}`] = val;
            },
            get() {
              return this[`_${context.name}`];
            }
          });
        });
        return initialValue;
      };
    }
  };
}

function email(value, context) {
  if (context.kind === 'field') {
    return function(initialValue) {
      context.addInitializer(function() {
        Object.defineProperty(this, context.name, {
          set(val) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (val && !emailRegex.test(val)) {
              throw new Error(`${context.name} must be a valid email`);
            }
            this[`_${context.name}`] = val;
          },
          get() {
            return this[`_${context.name}`];
          }
        });
      });
      return initialValue;
    };
  }
}

// Usage
class User {
  @required
  @minLength(2)
  name = '';
  
  @required
  @email
  email = '';
}

const user = new User();
user.name = 'AB';      // OK
// user.name = 'A';    // Error: name must be at least 2 characters
user.email = 'test@example.com';  // OK
// user.email = 'invalid';  // Error: email must be a valid email
```

### API Route Decorators (Express-style)

```javascript
// Route metadata collection
const routes = [];

function controller(basePath) {
  return function(value, context) {
    if (context.kind === 'class') {
      context.addInitializer(function() {
        routes.filter(r => r.controller === context.name)
          .forEach(r => r.basePath = basePath);
      });
      return value;
    }
  };
}

function route(method, path) {
  return function(value, context) {
    if (context.kind === 'method') {
      routes.push({
        controller: context.name,
        method: method.toUpperCase(),
        path,
        handler: context.name
      });
      return value;
    }
  };
}

const get = (path) => route('GET', path);
const post = (path) => route('POST', path);
const put = (path) => route('PUT', path);
const del = (path) => route('DELETE', path);

// Middleware decorator
function middleware(...middlewares) {
  return function(value, context) {
    if (context.kind === 'method') {
      // Wrap method with middleware chain
      return async function(...args) {
        for (const mw of middlewares) {
          await mw(...args);
        }
        return value.apply(this, args);
      };
    }
  };
}

// Usage
const authenticate = async (req, res, next) => {
  if (!req.user) throw new Error('Unauthorized');
};

@controller('/api/users')
class UserController {
  @get('/')
  async list(req, res) {
    return { users: [] };
  }
  
  @get('/:id')
  async get(req, res) {
    return { user: { id: req.params.id } };
  }
  
  @post('/')
  @middleware(authenticate)
  async create(req, res) {
    return { created: true };
  }
  
  @del('/:id')
  @middleware(authenticate)
  async delete(req, res) {
    return { deleted: true };
  }
}

// Register routes with Express
function registerRoutes(app) {
  routes.forEach(route => {
    const fullPath = route.basePath + route.path;
    console.log(`Registering ${route.method} ${fullPath}`);
    // app[route.method.toLowerCase()](fullPath, route.handler);
  });
}
```

### ORM-Style Entity Decorators

```javascript
// Database entity metadata
const entityMetadata = new Map();

function entity(tableName) {
  return function(value, context) {
    if (context.kind === 'class') {
      entityMetadata.set(value, {
        tableName,
        columns: []
      });
      return value;
    }
  };
}

function column(options = {}) {
  return function(value, context) {
    if (context.kind === 'field') {
      context.addInitializer(function() {
        const meta = entityMetadata.get(this.constructor);
        if (meta) {
          meta.columns.push({
            name: options.name || context.name,
            property: context.name,
            type: options.type || 'string',
            nullable: options.nullable ?? true,
            primary: options.primary ?? false
          });
        }
      });
      return function(initialValue) {
        return initialValue;
      };
    }
  };
}

function primaryKey(value, context) {
  return column({ primary: true, type: 'integer', nullable: false })(value, context);
}

// Usage
@entity('users')
class User {
  @primaryKey
  id = 0;
  
  @column({ type: 'string', nullable: false })
  name = '';
  
  @column({ type: 'string', name: 'email_address' })
  email = '';
  
  @column({ type: 'timestamp' })
  createdAt = new Date();
}

// Generate SQL from metadata
function generateCreateTable(EntityClass) {
  const meta = entityMetadata.get(EntityClass);
  const instance = new EntityClass();  // Trigger initializers
  
  const columnDefs = meta.columns.map(col => {
    let def = `${col.name} ${col.type.toUpperCase()}`;
    if (col.primary) def += ' PRIMARY KEY';
    if (!col.nullable) def += ' NOT NULL';
    return def;
  });
  
  return `CREATE TABLE ${meta.tableName} (\n  ${columnDefs.join(',\n  ')}\n);`;
}

console.log(generateCreateTable(User));
// CREATE TABLE users (
//   id INTEGER PRIMARY KEY NOT NULL,
//   name STRING NOT NULL,
//   email_address STRING,
//   createdAt TIMESTAMP
// );
```

---

## 21.8 Common Pitfalls

### Pitfall 1: Decorator Order Matters

```javascript
// Decorators apply BOTTOM to TOP (closest to target first)
@first   // Executed LAST
@second  // Executed SECOND
@third   // Executed FIRST (closest to class)
class MyClass {}

// This matters for method decorators!
@logged     // Logs the cached result, not the original call
@cached     // Caches the result
async getData() { ... }

// vs

@cached     // Caches the logged result (probably not what you want)
@logged     // Logs every call
async getData() { ... }
```

### Pitfall 2: this Binding in Decorators

```javascript
// ❌ WRONG: Arrow functions lose class binding
function logged(value, context) {
  if (context.kind === 'method') {
    return (...args) => {  // Arrow function!
      console.log(`Calling ${context.name}`);
      return value(...args);  // 'this' is wrong!
    };
  }
}

// ✅ CORRECT: Use regular function
function logged(value, context) {
  if (context.kind === 'method') {
    return function(...args) {  // Regular function
      console.log(`Calling ${context.name}`);
      return value.call(this, ...args);  // Preserve 'this'
    };
  }
}
```

### Pitfall 3: Async Method Decoration

```javascript
// ❌ WRONG: Not handling async
function timed(value, context) {
  if (context.kind === 'method') {
    return function(...args) {
      const start = Date.now();
      const result = value.call(this, ...args);  // Returns promise!
      console.log(`Took ${Date.now() - start}ms`);  // Logs immediately
      return result;
    };
  }
}

// ✅ CORRECT: Handle both sync and async
function timed(value, context) {
  if (context.kind === 'method') {
    return function(...args) {
      const start = Date.now();
      const result = value.call(this, ...args);
      
      if (result instanceof Promise) {
        return result.finally(() => {
          console.log(`Took ${Date.now() - start}ms`);
        });
      }
      
      console.log(`Took ${Date.now() - start}ms`);
      return result;
    };
  }
}
```

---

## Summary

| Decorator Type | Target | Returns |
|---------------|--------|---------|
| **Class** | Class constructor | Modified/new class |
| **Method** | Method function | Modified function |
| **Field** | Field initializer | Modified initializer |
| **Accessor** | Getter/setter | New getter/setter object |
| **Auto-accessor** | Auto accessor | Modified get/set/init |

### Context Object Properties

| Property | Description |
|----------|-------------|
| `kind` | `'class'`, `'method'`, `'field'`, `'accessor'`, `'getter'`, `'setter'` |
| `name` | Name of decorated element |
| `static` | `true` if static member |
| `private` | `true` if private member |
| `access` | Object with `get()` and `set()` for fields |
| `addInitializer()` | Register callback to run during construction |

### Best Practices

1. **Keep decorators focused** — one concern per decorator
2. **Make decorators composable** — design for stacking
3. **Handle async properly** — check for Promise returns
4. **Preserve `this` binding** — use regular functions, not arrows
5. **Document decorator order** — when order matters, make it clear
6. **Provide good error messages** — decorators run at definition time

---

**End of Chapter 21**
