# Module 1: Architecture and Design Patterns

Design patterns provide proven solutions to common software design problems. This module covers essential patterns every JavaScript developer should know.

---

## 1.1 Design Patterns Overview

### What Are Design Patterns?

Design patterns are reusable solutions to commonly occurring problems in software design. They're templates, not code—describing how to solve problems in many different situations.

### Pattern Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| **Creational** | Object creation mechanisms | Singleton, Factory, Builder |
| **Structural** | Object composition | Adapter, Decorator, Proxy |
| **Behavioral** | Object communication | Observer, Strategy, Command |
| **Architectural** | Application structure | MVC, MVVM, Flux |

### When to Use Patterns

```javascript
// ✅ Use patterns when:
// - The problem matches a known pattern's intent
// - Code needs to be flexible for future changes
// - Team communication benefits from shared vocabulary

// ❌ Don't use patterns when:
// - A simple solution works fine (YAGNI)
// - You're forcing a pattern where it doesn't fit
// - Pattern adds complexity without benefit
```

---

## 1.2 Creational Patterns

### Singleton

Ensures a class has only one instance and provides global access to it.

```javascript
// ES Module Singleton (simplest approach)
// database.js
class Database {
  constructor() {
    this.connection = null;
  }
  
  connect(url) {
    if (!this.connection) {
      this.connection = { url, connected: true };
      console.log(`Connected to ${url}`);
    }
    return this.connection;
  }
  
  query(sql) {
    if (!this.connection) {
      throw new Error('Not connected');
    }
    return `Executing: ${sql}`;
  }
}

// Export single instance
export const database = new Database();
```

```javascript
// Class-based Singleton with getInstance
class Logger {
  static instance = null;
  
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }
    this.logs = [];
    Logger.instance = this;
  }
  
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  
  log(message) {
    this.logs.push({ message, timestamp: Date.now() });
    console.log(`[LOG] ${message}`);
  }
}

// Usage
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();
console.log(logger1 === logger2);  // true
```

### Factory

Creates objects without specifying the exact class.

```javascript
// Simple Factory
class UserFactory {
  static create(type, data) {
    switch (type) {
      case 'admin':
        return new AdminUser(data);
      case 'customer':
        return new CustomerUser(data);
      case 'guest':
        return new GuestUser(data);
      default:
        throw new Error(`Unknown user type: ${type}`);
    }
  }
}

class AdminUser {
  constructor({ name, email }) {
    this.name = name;
    this.email = email;
    this.role = 'admin';
    this.permissions = ['read', 'write', 'delete', 'admin'];
  }
}

class CustomerUser {
  constructor({ name, email }) {
    this.name = name;
    this.email = email;
    this.role = 'customer';
    this.permissions = ['read', 'write'];
  }
}

class GuestUser {
  constructor({ name }) {
    this.name = name || 'Guest';
    this.role = 'guest';
    this.permissions = ['read'];
  }
}

// Usage
const admin = UserFactory.create('admin', { name: 'Alice', email: 'alice@example.com' });
const guest = UserFactory.create('guest', {});
```

```javascript
// Abstract Factory (family of related objects)
class UIFactory {
  createButton() { throw new Error('Not implemented'); }
  createInput() { throw new Error('Not implemented'); }
  createModal() { throw new Error('Not implemented'); }
}

class MaterialUIFactory extends UIFactory {
  createButton(text) {
    return { type: 'MaterialButton', text, className: 'mdc-button' };
  }
  
  createInput(placeholder) {
    return { type: 'MaterialInput', placeholder, className: 'mdc-text-field' };
  }
  
  createModal(title) {
    return { type: 'MaterialModal', title, className: 'mdc-dialog' };
  }
}

class BootstrapUIFactory extends UIFactory {
  createButton(text) {
    return { type: 'BootstrapButton', text, className: 'btn btn-primary' };
  }
  
  createInput(placeholder) {
    return { type: 'BootstrapInput', placeholder, className: 'form-control' };
  }
  
  createModal(title) {
    return { type: 'BootstrapModal', title, className: 'modal' };
  }
}

// Usage - swap implementations without changing code
function createForm(factory) {
  return {
    nameInput: factory.createInput('Enter name'),
    emailInput: factory.createInput('Enter email'),
    submitButton: factory.createButton('Submit')
  };
}

const materialForm = createForm(new MaterialUIFactory());
const bootstrapForm = createForm(new BootstrapUIFactory());
```

### Builder

Constructs complex objects step by step.

```javascript
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.selectFields = ['*'];
    this.whereConditions = [];
    this.orderByFields = [];
    this.limitValue = null;
    this.offsetValue = null;
  }
  
  select(...fields) {
    this.selectFields = fields;
    return this;
  }
  
  where(condition) {
    this.whereConditions.push(condition);
    return this;
  }
  
  orderBy(field, direction = 'ASC') {
    this.orderByFields.push(`${field} ${direction}`);
    return this;
  }
  
  limit(value) {
    this.limitValue = value;
    return this;
  }
  
  offset(value) {
    this.offsetValue = value;
    return this;
  }
  
  build() {
    let query = `SELECT ${this.selectFields.join(', ')} FROM ${this.table}`;
    
    if (this.whereConditions.length > 0) {
      query += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    
    if (this.orderByFields.length > 0) {
      query += ` ORDER BY ${this.orderByFields.join(', ')}`;
    }
    
    if (this.limitValue !== null) {
      query += ` LIMIT ${this.limitValue}`;
    }
    
    if (this.offsetValue !== null) {
      query += ` OFFSET ${this.offsetValue}`;
    }
    
    return query;
  }
}

// Usage - fluent API
const query = new QueryBuilder('users')
  .select('id', 'name', 'email')
  .where('status = "active"')
  .where('age >= 18')
  .orderBy('created_at', 'DESC')
  .limit(10)
  .offset(20)
  .build();

// SELECT id, name, email FROM users WHERE status = "active" AND age >= 18 ORDER BY created_at DESC LIMIT 10 OFFSET 20
```

```javascript
// Builder with Director
class HttpRequestBuilder {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.request = {
      method: 'GET',
      url: '',
      headers: {},
      body: null,
      timeout: 30000
    };
    return this;
  }
  
  setMethod(method) {
    this.request.method = method;
    return this;
  }
  
  setUrl(url) {
    this.request.url = url;
    return this;
  }
  
  setHeader(key, value) {
    this.request.headers[key] = value;
    return this;
  }
  
  setBody(body) {
    this.request.body = body;
    return this;
  }
  
  setTimeout(timeout) {
    this.request.timeout = timeout;
    return this;
  }
  
  build() {
    const result = { ...this.request };
    this.reset();
    return result;
  }
}

// Director - common configurations
class RequestDirector {
  constructor(builder) {
    this.builder = builder;
  }
  
  buildJsonPost(url, data) {
    return this.builder
      .reset()
      .setMethod('POST')
      .setUrl(url)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Accept', 'application/json')
      .setBody(JSON.stringify(data))
      .build();
  }
  
  buildAuthenticatedGet(url, token) {
    return this.builder
      .reset()
      .setMethod('GET')
      .setUrl(url)
      .setHeader('Authorization', `Bearer ${token}`)
      .build();
  }
}

const builder = new HttpRequestBuilder();
const director = new RequestDirector(builder);
const postRequest = director.buildJsonPost('/api/users', { name: 'Alice' });
```

### Prototype

Creates objects by cloning an existing object.

```javascript
// Object.create for prototypal inheritance
const vehiclePrototype = {
  init(make, model) {
    this.make = make;
    this.model = model;
    return this;
  },
  
  getInfo() {
    return `${this.make} ${this.model}`;
  },
  
  clone() {
    return Object.create(this);
  }
};

const car = Object.create(vehiclePrototype).init('Toyota', 'Camry');
const clonedCar = car.clone();
clonedCar.model = 'Corolla';

console.log(car.getInfo());        // Toyota Camry
console.log(clonedCar.getInfo());  // Toyota Corolla
```

```javascript
// Deep clone with prototype pattern
class Component {
  constructor(name) {
    this.name = name;
    this.children = [];
    this.styles = {};
  }
  
  addChild(child) {
    this.children.push(child);
    return this;
  }
  
  setStyle(key, value) {
    this.styles[key] = value;
    return this;
  }
  
  clone() {
    const clone = new Component(this.name);
    clone.styles = { ...this.styles };
    clone.children = this.children.map(child => 
      child.clone ? child.clone() : { ...child }
    );
    return clone;
  }
}

const template = new Component('Card')
  .setStyle('padding', '16px')
  .setStyle('border', '1px solid #ccc')
  .addChild(new Component('Title'))
  .addChild(new Component('Body'));

const card1 = template.clone();
card1.name = 'UserCard';
card1.setStyle('background', '#f0f0f0');
```

---

## 1.3 Structural Patterns

### Adapter

Allows incompatible interfaces to work together.

```javascript
// Old API
class OldPaymentProcessor {
  processPayment(amount, cardNumber, expiry, cvv) {
    console.log(`Processing $${amount} with card ${cardNumber}`);
    return { success: true, transactionId: 'OLD-' + Date.now() };
  }
}

// New API interface expected by app
class PaymentAdapter {
  constructor(oldProcessor) {
    this.oldProcessor = oldProcessor;
  }
  
  pay(paymentDetails) {
    // Adapt new interface to old API
    const { amount, card } = paymentDetails;
    const result = this.oldProcessor.processPayment(
      amount,
      card.number,
      card.expiry,
      card.cvv
    );
    
    // Adapt response to new format
    return {
      status: result.success ? 'completed' : 'failed',
      id: result.transactionId,
      amount
    };
  }
}

// Usage
const oldProcessor = new OldPaymentProcessor();
const paymentService = new PaymentAdapter(oldProcessor);

const result = paymentService.pay({
  amount: 99.99,
  card: { number: '4111111111111111', expiry: '12/25', cvv: '123' }
});
```

```javascript
// Adapter for third-party APIs
class ThirdPartyLogger {
  writeLog(level, message, metadata) {
    console.log(`[${level}] ${message}`, metadata);
  }
}

// Our app expects this interface
class LoggerAdapter {
  constructor(thirdPartyLogger) {
    this.logger = thirdPartyLogger;
  }
  
  info(message, ...args) {
    this.logger.writeLog('INFO', message, args);
  }
  
  warn(message, ...args) {
    this.logger.writeLog('WARN', message, args);
  }
  
  error(message, ...args) {
    this.logger.writeLog('ERROR', message, args);
  }
  
  debug(message, ...args) {
    this.logger.writeLog('DEBUG', message, args);
  }
}

const logger = new LoggerAdapter(new ThirdPartyLogger());
logger.info('User logged in', { userId: 123 });
```

### Decorator

Adds behavior to objects dynamically without modifying their class.

```javascript
// Function decorator
function withLogging(fn, label) {
  return function(...args) {
    console.log(`[${label}] Called with:`, args);
    const start = performance.now();
    const result = fn.apply(this, args);
    const duration = performance.now() - start;
    console.log(`[${label}] Returned:`, result, `(${duration.toFixed(2)}ms)`);
    return result;
  };
}

function withRetry(fn, maxRetries = 3) {
  return async function(...args) {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;
        console.log(`Retry ${i + 1}/${maxRetries} after error:`, error.message);
      }
    }
    throw lastError;
  };
}

// Usage
const fetchData = withRetry(withLogging(
  async (url) => {
    const response = await fetch(url);
    return response.json();
  },
  'fetchData'
));
```

```javascript
// Class decorator pattern
class Coffee {
  constructor() {
    this.description = 'Plain Coffee';
    this.cost = 2.00;
  }
  
  getDescription() {
    return this.description;
  }
  
  getCost() {
    return this.cost;
  }
}

// Decorator base
class CoffeeDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  getDescription() {
    return this.coffee.getDescription();
  }
  
  getCost() {
    return this.coffee.getCost();
  }
}

class MilkDecorator extends CoffeeDecorator {
  getDescription() {
    return `${this.coffee.getDescription()}, Milk`;
  }
  
  getCost() {
    return this.coffee.getCost() + 0.50;
  }
}

class CaramelDecorator extends CoffeeDecorator {
  getDescription() {
    return `${this.coffee.getDescription()}, Caramel`;
  }
  
  getCost() {
    return this.coffee.getCost() + 0.75;
  }
}

class WhippedCreamDecorator extends CoffeeDecorator {
  getDescription() {
    return `${this.coffee.getDescription()}, Whipped Cream`;
  }
  
  getCost() {
    return this.coffee.getCost() + 0.60;
  }
}

// Usage - compose decorators
let coffee = new Coffee();
coffee = new MilkDecorator(coffee);
coffee = new CaramelDecorator(coffee);
coffee = new WhippedCreamDecorator(coffee);

console.log(coffee.getDescription());  // Plain Coffee, Milk, Caramel, Whipped Cream
console.log(coffee.getCost());         // 3.85
```

### Facade

Provides a simplified interface to a complex system.

```javascript
// Complex subsystems
class VideoDecoder {
  decode(file) {
    console.log(`Decoding video: ${file}`);
    return { frames: 1000, codec: 'h264' };
  }
}

class AudioDecoder {
  decode(file) {
    console.log(`Decoding audio: ${file}`);
    return { samples: 44100, channels: 2 };
  }
}

class SubtitleParser {
  parse(file) {
    console.log(`Parsing subtitles: ${file}`);
    return { lines: 500, language: 'en' };
  }
}

class MediaRenderer {
  render(video, audio, subtitles) {
    console.log('Rendering media with all components');
    return { playing: true };
  }
}

// Facade - simple interface
class MediaPlayerFacade {
  constructor() {
    this.videoDecoder = new VideoDecoder();
    this.audioDecoder = new AudioDecoder();
    this.subtitleParser = new SubtitleParser();
    this.renderer = new MediaRenderer();
  }
  
  play(mediaFile) {
    const video = this.videoDecoder.decode(mediaFile);
    const audio = this.audioDecoder.decode(mediaFile);
    const subtitles = this.subtitleParser.parse(mediaFile.replace('.mp4', '.srt'));
    return this.renderer.render(video, audio, subtitles);
  }
  
  playWithoutSubtitles(mediaFile) {
    const video = this.videoDecoder.decode(mediaFile);
    const audio = this.audioDecoder.decode(mediaFile);
    return this.renderer.render(video, audio, null);
  }
}

// Usage - simple API
const player = new MediaPlayerFacade();
player.play('movie.mp4');
```

### Proxy

Controls access to another object.

```javascript
// Virtual Proxy (lazy loading)
class HeavyImage {
  constructor(url) {
    this.url = url;
    this.imageData = null;
    this.loadImage();
  }
  
  loadImage() {
    console.log(`Loading heavy image from ${this.url}...`);
    // Simulate heavy loading
    this.imageData = `[Image data for ${this.url}]`;
  }
  
  display() {
    return this.imageData;
  }
}

class ImageProxy {
  constructor(url) {
    this.url = url;
    this.realImage = null;
  }
  
  display() {
    // Load only when needed
    if (!this.realImage) {
      this.realImage = new HeavyImage(this.url);
    }
    return this.realImage.display();
  }
}

// Images aren't loaded until display() is called
const images = [
  new ImageProxy('image1.jpg'),
  new ImageProxy('image2.jpg'),
  new ImageProxy('image3.jpg')
];

// Only loads image1.jpg
images[0].display();
```

```javascript
// Protection Proxy (access control)
class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }
  
  withdraw(amount) {
    this.balance -= amount;
    return this.balance;
  }
  
  deposit(amount) {
    this.balance += amount;
    return this.balance;
  }
  
  getBalance() {
    return this.balance;
  }
}

class BankAccountProxy {
  constructor(account, user) {
    this.account = account;
    this.user = user;
  }
  
  withdraw(amount) {
    if (!this.user.authenticated) {
      throw new Error('User not authenticated');
    }
    if (amount > this.user.withdrawLimit) {
      throw new Error(`Withdrawal exceeds limit of ${this.user.withdrawLimit}`);
    }
    console.log(`[Audit] ${this.user.name} withdrew ${amount}`);
    return this.account.withdraw(amount);
  }
  
  deposit(amount) {
    if (!this.user.authenticated) {
      throw new Error('User not authenticated');
    }
    console.log(`[Audit] ${this.user.name} deposited ${amount}`);
    return this.account.deposit(amount);
  }
  
  getBalance() {
    if (!this.user.authenticated) {
      throw new Error('User not authenticated');
    }
    return this.account.getBalance();
  }
}

const account = new BankAccount(1000);
const user = { name: 'Alice', authenticated: true, withdrawLimit: 500 };
const proxy = new BankAccountProxy(account, user);

proxy.withdraw(200);  // OK
proxy.withdraw(600);  // Error: exceeds limit
```

```javascript
// JavaScript Proxy object (ES6)
const user = {
  name: 'Alice',
  email: 'alice@example.com',
  password: 'secret123'
};

const userProxy = new Proxy(user, {
  get(target, property) {
    // Hide sensitive data
    if (property === 'password') {
      return '********';
    }
    console.log(`Getting ${property}`);
    return target[property];
  },
  
  set(target, property, value) {
    // Validate
    if (property === 'email' && !value.includes('@')) {
      throw new Error('Invalid email');
    }
    console.log(`Setting ${property} to ${value}`);
    target[property] = value;
    return true;
  },
  
  has(target, property) {
    // Hide password from 'in' operator
    if (property === 'password') return false;
    return property in target;
  }
});

console.log(userProxy.password);  // ********
console.log('password' in userProxy);  // false
userProxy.email = 'invalid';  // Error: Invalid email
```

---

## 1.4 Behavioral Patterns

### Observer (Pub/Sub)

Defines a one-to-many dependency between objects.

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map();
  }
  
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }
  
  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        callback(...args);
      });
    }
  }
  
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }
}

// Usage
const store = new EventEmitter();

const unsubscribe = store.on('userLoggedIn', (user) => {
  console.log(`Welcome, ${user.name}!`);
});

store.on('userLoggedIn', (user) => {
  console.log(`Tracking login for user ${user.id}`);
});

store.emit('userLoggedIn', { id: 1, name: 'Alice' });

unsubscribe();  // Stop listening
store.emit('userLoggedIn', { id: 2, name: 'Bob' });  // Only tracking runs
```

```javascript
// Observable pattern (reactive)
class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }
  
  subscribe(observer) {
    // Normalize observer
    if (typeof observer === 'function') {
      observer = { next: observer };
    }
    
    return this._subscribe({
      next: observer.next || (() => {}),
      error: observer.error || ((e) => { throw e; }),
      complete: observer.complete || (() => {})
    });
  }
  
  static from(iterable) {
    return new Observable(observer => {
      try {
        for (const value of iterable) {
          observer.next(value);
        }
        observer.complete();
      } catch (e) {
        observer.error(e);
      }
      return () => {};  // cleanup
    });
  }
  
  map(fn) {
    return new Observable(observer => {
      return this.subscribe({
        next: value => observer.next(fn(value)),
        error: e => observer.error(e),
        complete: () => observer.complete()
      });
    });
  }
  
  filter(predicate) {
    return new Observable(observer => {
      return this.subscribe({
        next: value => predicate(value) && observer.next(value),
        error: e => observer.error(e),
        complete: () => observer.complete()
      });
    });
  }
}

// Usage
const numbers = Observable.from([1, 2, 3, 4, 5]);
numbers
  .filter(n => n % 2 === 0)
  .map(n => n * 10)
  .subscribe({
    next: v => console.log(v),      // 20, 40
    complete: () => console.log('Done')
  });
```

### Strategy

Defines a family of algorithms and makes them interchangeable.

```javascript
// Payment strategies
const paymentStrategies = {
  creditCard: {
    validate(details) {
      return details.cardNumber && details.cvv;
    },
    process(amount, details) {
      console.log(`Processing $${amount} via credit card ${details.cardNumber.slice(-4)}`);
      return { success: true, method: 'credit_card' };
    }
  },
  
  paypal: {
    validate(details) {
      return details.email;
    },
    process(amount, details) {
      console.log(`Processing $${amount} via PayPal (${details.email})`);
      return { success: true, method: 'paypal' };
    }
  },
  
  crypto: {
    validate(details) {
      return details.walletAddress;
    },
    process(amount, details) {
      console.log(`Processing $${amount} via crypto (${details.walletAddress})`);
      return { success: true, method: 'crypto' };
    }
  }
};

class PaymentProcessor {
  constructor() {
    this.strategy = null;
  }
  
  setStrategy(strategyName) {
    this.strategy = paymentStrategies[strategyName];
    if (!this.strategy) {
      throw new Error(`Unknown payment strategy: ${strategyName}`);
    }
  }
  
  processPayment(amount, details) {
    if (!this.strategy) {
      throw new Error('No payment strategy set');
    }
    if (!this.strategy.validate(details)) {
      throw new Error('Invalid payment details');
    }
    return this.strategy.process(amount, details);
  }
}

// Usage
const processor = new PaymentProcessor();
processor.setStrategy('paypal');
processor.processPayment(99.99, { email: 'user@example.com' });
```

```javascript
// Validation strategies
const validationStrategies = {
  required: (value) => value !== '' && value !== null && value !== undefined,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  minLength: (min) => (value) => value.length >= min,
  maxLength: (max) => (value) => value.length <= max,
  pattern: (regex) => (value) => regex.test(value),
  range: (min, max) => (value) => value >= min && value <= max
};

class FormValidator {
  constructor() {
    this.rules = new Map();
  }
  
  addRule(field, strategyName, ...args) {
    if (!this.rules.has(field)) {
      this.rules.set(field, []);
    }
    
    let strategy = validationStrategies[strategyName];
    if (typeof strategy === 'function' && args.length > 0) {
      strategy = strategy(...args);
    }
    
    this.rules.get(field).push({ name: strategyName, validate: strategy });
    return this;
  }
  
  validate(data) {
    const errors = {};
    
    for (const [field, rules] of this.rules) {
      for (const rule of rules) {
        if (!rule.validate(data[field])) {
          if (!errors[field]) errors[field] = [];
          errors[field].push(rule.name);
        }
      }
    }
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Usage
const validator = new FormValidator()
  .addRule('email', 'required')
  .addRule('email', 'email')
  .addRule('password', 'required')
  .addRule('password', 'minLength', 8)
  .addRule('age', 'range', 18, 100);

console.log(validator.validate({
  email: 'invalid',
  password: '123',
  age: 15
}));
// { valid: false, errors: { email: ['email'], password: ['minLength'], age: ['range'] } }
```

### Command

Encapsulates a request as an object.

```javascript
// Command pattern with undo/redo
class Command {
  execute() { throw new Error('Not implemented'); }
  undo() { throw new Error('Not implemented'); }
}

class AddTextCommand extends Command {
  constructor(document, text, position) {
    super();
    this.document = document;
    this.text = text;
    this.position = position;
  }
  
  execute() {
    this.document.insertText(this.text, this.position);
  }
  
  undo() {
    this.document.deleteText(this.position, this.text.length);
  }
}

class DeleteTextCommand extends Command {
  constructor(document, position, length) {
    super();
    this.document = document;
    this.position = position;
    this.length = length;
    this.deletedText = null;
  }
  
  execute() {
    this.deletedText = this.document.getText(this.position, this.length);
    this.document.deleteText(this.position, this.length);
  }
  
  undo() {
    this.document.insertText(this.deletedText, this.position);
  }
}

class CommandHistory {
  constructor() {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  execute(command) {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];  // Clear redo on new command
  }
  
  undo() {
    if (this.undoStack.length === 0) return;
    const command = this.undoStack.pop();
    command.undo();
    this.redoStack.push(command);
  }
  
  redo() {
    if (this.redoStack.length === 0) return;
    const command = this.redoStack.pop();
    command.execute();
    this.undoStack.push(command);
  }
  
  canUndo() {
    return this.undoStack.length > 0;
  }
  
  canRedo() {
    return this.redoStack.length > 0;
  }
}

// Document class
class TextDocument {
  constructor() {
    this.content = '';
  }
  
  insertText(text, position) {
    this.content = this.content.slice(0, position) + text + this.content.slice(position);
  }
  
  deleteText(position, length) {
    this.content = this.content.slice(0, position) + this.content.slice(position + length);
  }
  
  getText(position, length) {
    return this.content.slice(position, position + length);
  }
}

// Usage
const doc = new TextDocument();
const history = new CommandHistory();

history.execute(new AddTextCommand(doc, 'Hello ', 0));
history.execute(new AddTextCommand(doc, 'World', 6));
console.log(doc.content);  // "Hello World"

history.undo();
console.log(doc.content);  // "Hello "

history.redo();
console.log(doc.content);  // "Hello World"
```

### Mediator

Defines simplified communication between classes.

```javascript
class ChatRoom {
  constructor() {
    this.users = new Map();
  }
  
  register(user) {
    this.users.set(user.name, user);
    user.chatRoom = this;
  }
  
  send(message, from, to) {
    if (to) {
      // Private message
      const recipient = this.users.get(to);
      if (recipient) {
        recipient.receive(message, from);
      }
    } else {
      // Broadcast
      this.users.forEach((user, name) => {
        if (name !== from) {
          user.receive(message, from);
        }
      });
    }
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }
  
  send(message, to = null) {
    console.log(`${this.name} sends: ${message}`);
    this.chatRoom.send(message, this.name, to);
  }
  
  receive(message, from) {
    console.log(`${this.name} receives from ${from}: ${message}`);
  }
}

// Usage
const room = new ChatRoom();

const alice = new User('Alice');
const bob = new User('Bob');
const charlie = new User('Charlie');

room.register(alice);
room.register(bob);
room.register(charlie);

alice.send('Hello everyone!');  // Broadcast
bob.send('Hi Alice!', 'Alice'); // Private
```

---

## 1.5 Architectural Patterns

### MVC (Model-View-Controller)

```javascript
// Model - data and business logic
class TodoModel {
  constructor() {
    this.todos = [];
    this.observers = [];
  }
  
  subscribe(callback) {
    this.observers.push(callback);
  }
  
  notify() {
    this.observers.forEach(cb => cb(this.todos));
  }
  
  addTodo(text) {
    this.todos.push({ id: Date.now(), text, completed: false });
    this.notify();
  }
  
  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.notify();
    }
  }
  
  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.notify();
  }
}

// View - UI rendering
class TodoView {
  constructor(container) {
    this.container = container;
  }
  
  render(todos) {
    this.container.innerHTML = `
      <ul>
        ${todos.map(todo => `
          <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
            <input type="checkbox" ${todo.completed ? 'checked' : ''}>
            <span>${todo.text}</span>
            <button class="delete">×</button>
          </li>
        `).join('')}
      </ul>
      <input type="text" id="newTodo" placeholder="Add todo...">
      <button id="addTodo">Add</button>
    `;
  }
  
  bindAddTodo(handler) {
    this.container.querySelector('#addTodo').addEventListener('click', () => {
      const input = this.container.querySelector('#newTodo');
      if (input.value) {
        handler(input.value);
        input.value = '';
      }
    });
  }
  
  bindToggleTodo(handler) {
    this.container.addEventListener('change', (e) => {
      if (e.target.type === 'checkbox') {
        handler(parseInt(e.target.closest('li').dataset.id));
      }
    });
  }
  
  bindDeleteTodo(handler) {
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete')) {
        handler(parseInt(e.target.closest('li').dataset.id));
      }
    });
  }
}

// Controller - coordinates model and view
class TodoController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    // Subscribe view to model changes
    this.model.subscribe(todos => this.view.render(todos));
    
    // Bind view events to model methods
    this.view.bindAddTodo(text => this.model.addTodo(text));
    this.view.bindToggleTodo(id => this.model.toggleTodo(id));
    this.view.bindDeleteTodo(id => this.model.deleteTodo(id));
    
    // Initial render
    this.view.render(this.model.todos);
  }
}

// Usage
const model = new TodoModel();
const view = new TodoView(document.getElementById('app'));
const controller = new TodoController(model, view);
```

### Flux/Redux Pattern

```javascript
// Actions
const ActionTypes = {
  ADD_TODO: 'ADD_TODO',
  TOGGLE_TODO: 'TOGGLE_TODO',
  DELETE_TODO: 'DELETE_TODO'
};

function addTodo(text) {
  return { type: ActionTypes.ADD_TODO, payload: { text } };
}

function toggleTodo(id) {
  return { type: ActionTypes.TOGGLE_TODO, payload: { id } };
}

// Reducer
function todosReducer(state = [], action) {
  switch (action.type) {
    case ActionTypes.ADD_TODO:
      return [...state, {
        id: Date.now(),
        text: action.payload.text,
        completed: false
      }];
      
    case ActionTypes.TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
      
    case ActionTypes.DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload.id);
      
    default:
      return state;
  }
}

// Store
function createStore(reducer, initialState = {}) {
  let state = initialState;
  const listeners = new Set();
  
  return {
    getState() {
      return state;
    },
    
    dispatch(action) {
      state = reducer(state, action);
      listeners.forEach(listener => listener());
      return action;
    },
    
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

// Usage
const store = createStore(todosReducer, []);

store.subscribe(() => {
  console.log('State changed:', store.getState());
});

store.dispatch(addTodo('Learn Redux'));
store.dispatch(addTodo('Build app'));
store.dispatch(toggleTodo(store.getState()[0].id));
```

---

## 1.6 State Management Patterns

### Immutable State

```javascript
// Immutable updates
const state = {
  user: { name: 'Alice', settings: { theme: 'dark' } },
  posts: [{ id: 1, title: 'Hello' }]
};

// ❌ Mutation
state.user.name = 'Bob';

// ✅ Immutable update
const newState = {
  ...state,
  user: {
    ...state.user,
    name: 'Bob'
  }
};

// Array operations
const withNewPost = {
  ...state,
  posts: [...state.posts, { id: 2, title: 'World' }]
};

const withoutPost = {
  ...state,
  posts: state.posts.filter(p => p.id !== 1)
};

const withUpdatedPost = {
  ...state,
  posts: state.posts.map(p =>
    p.id === 1 ? { ...p, title: 'Updated' } : p
  )
};
```

### State Machine

```javascript
const OrderStates = {
  IDLE: 'idle',
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

const orderMachine = {
  initial: OrderStates.IDLE,
  states: {
    [OrderStates.IDLE]: {
      on: { PLACE_ORDER: OrderStates.PENDING }
    },
    [OrderStates.PENDING]: {
      on: {
        PAY: OrderStates.PROCESSING,
        CANCEL: OrderStates.CANCELLED
      }
    },
    [OrderStates.PROCESSING]: {
      on: {
        SHIP: OrderStates.SHIPPED,
        CANCEL: OrderStates.CANCELLED
      }
    },
    [OrderStates.SHIPPED]: {
      on: { DELIVER: OrderStates.DELIVERED }
    },
    [OrderStates.DELIVERED]: {},
    [OrderStates.CANCELLED]: {}
  }
};

function createStateMachine(config) {
  let state = config.initial;
  
  return {
    getState() {
      return state;
    },
    
    transition(event) {
      const currentStateConfig = config.states[state];
      const nextState = currentStateConfig.on?.[event];
      
      if (nextState) {
        state = nextState;
        return true;
      }
      return false;
    },
    
    canTransition(event) {
      return !!config.states[state].on?.[event];
    }
  };
}

// Usage
const order = createStateMachine(orderMachine);

console.log(order.getState());  // idle
order.transition('PLACE_ORDER');
console.log(order.getState());  // pending
order.transition('PAY');
console.log(order.getState());  // processing
console.log(order.canTransition('DELIVER'));  // false
console.log(order.canTransition('SHIP'));     // true
```

---

## 1.7 Summary

| Pattern | Category | Use Case |
|---------|----------|----------|
| Singleton | Creational | Shared resources (logger, config) |
| Factory | Creational | Object creation with variants |
| Builder | Creational | Complex object construction |
| Adapter | Structural | Interface compatibility |
| Decorator | Structural | Add behavior dynamically |
| Facade | Structural | Simplify complex APIs |
| Proxy | Structural | Access control, lazy loading |
| Observer | Behavioral | Event systems, reactive updates |
| Strategy | Behavioral | Interchangeable algorithms |
| Command | Behavioral | Undo/redo, action queues |
| MVC/Flux | Architectural | Application structure |

### Best Practices

1. **Don't over-engineer** — use patterns when they solve real problems
2. **Favor composition** over inheritance
3. **Keep patterns simple** — JavaScript doesn't need verbose Java-style implementations
4. **Document pattern usage** for team understanding
5. **Test pattern implementations** thoroughly

---

**End of Module 1: Architecture and Design Patterns**

Next: Module 2 — Performance Optimization
# Module 2: Performance Optimization

JavaScript performance impacts user experience, SEO rankings, and business metrics. This module covers techniques for writing fast, efficient JavaScript.

---

## 2.1 JavaScript Engine Optimization

### How V8 Works

```
Source Code → Parser → AST → Ignition (Interpreter) → Bytecode
                                    ↓
                              TurboFan (JIT Compiler) → Optimized Machine Code
                                    ↓
                              Deoptimization (if assumptions fail)
```

### Hidden Classes (Shapes)

V8 optimizes property access using hidden classes. Objects with the same property order share hidden classes.

```javascript
// ✅ Good: Consistent object shapes
class Point {
  constructor(x, y) {
    this.x = x;  // Same order
    this.y = y;
  }
}

const p1 = new Point(1, 2);
const p2 = new Point(3, 4);  // Shares hidden class with p1

// ❌ Bad: Inconsistent shapes
function createPoint(x, y, hasZ) {
  const point = { x };
  point.y = y;
  if (hasZ) point.z = 0;  // Different shape
  return point;
}

// ❌ Bad: Adding properties dynamically
const obj = {};
obj.a = 1;
obj.b = 2;  // Shape transition
obj.c = 3;  // Another transition

// ✅ Good: Initialize all properties upfront
const obj2 = { a: 1, b: 2, c: 3 };
```

### Inline Caching

V8 caches property access locations. Polymorphic code (multiple shapes) breaks inline caching.

```javascript
// ❌ Megamorphic: Many different shapes
function getX(obj) {
  return obj.x;
}

getX({ x: 1 });
getX({ x: 2, y: 3 });
getX({ x: 3, y: 4, z: 5 });
getX({ a: 1, x: 2 });  // Different property order

// ✅ Monomorphic: Same shape
class Vector { constructor(x, y) { this.x = x; this.y = y; } }
function getVectorX(v) { return v.x; }

getVectorX(new Vector(1, 2));
getVectorX(new Vector(3, 4));  // Same shape, fast
```

### Optimization Killers

```javascript
// ❌ Avoid: try-catch in hot loops
function bad(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    try {
      sum += arr[i];  // try-catch prevents optimization
    } catch (e) {}
  }
  return sum;
}

// ✅ Better: try-catch outside
function good(arr) {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

// ❌ Avoid: arguments in optimized code
function useArguments() {
  return arguments[0] + arguments[1];  // Deoptimizes
}

// ✅ Better: rest parameters
function useRest(...args) {
  return args[0] + args[1];
}

// ❌ Avoid: eval, with
function bad() {
  eval('x = 1');  // Prevents optimization
  with (obj) {}   // Never use
}

// ❌ Avoid: Changing object type
let x = 1;
x = 'string';  // Type change deoptimizes

// ✅ Better: Consistent types
let count = 0;
count = count + 1;
```

### Double vs SMI

V8 has optimized paths for Small Integers (SMI).

```javascript
// ✅ SMI range: -2³¹ to 2³¹ - 1
const arr = new Array(1000).fill(0);  // SMI

// ❌ Becomes heap number (slower)
const arr2 = new Array(1000).fill(1.5);  // Doubles
arr[0] = 1.1;  // Converts entire array to doubles

// ✅ Use TypedArrays for numeric data
const floats = new Float64Array(1000);
const ints = new Int32Array(1000);
```

---

## 2.2 Memory Management

### Memory Lifecycle

```javascript
// 1. Allocation
const obj = { data: new Array(1000) };
const str = 'x'.repeat(10000);

// 2. Usage
console.log(obj.data.length);

// 3. Release (automatic via GC)
// obj becomes unreachable when no references exist
```

### Common Memory Leaks

```javascript
// ❌ Leak: Global variables
function leak() {
  leakedVar = 'I am global';  // Missing 'let/const'
}

// ❌ Leak: Forgotten timers
const data = loadHeavyData();
setInterval(() => {
  console.log(data);  // data never collected
}, 1000);

// ✅ Fix: Clear timers
const id = setInterval(() => {}, 1000);
// When done:
clearInterval(id);

// ❌ Leak: Event listeners not removed
element.addEventListener('click', handler);
// element removed from DOM, but handler keeps reference

// ✅ Fix: Remove listeners
element.removeEventListener('click', handler);
// Or use AbortController
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
controller.abort();  // Removes all listeners with this signal

// ❌ Leak: Closures holding references
function createHandler() {
  const hugeData = new Array(1000000);
  return function() {
    // hugeData is retained even if not used
    console.log('clicked');
  };
}

// ✅ Fix: Don't close over unneeded data
function createHandler() {
  return function() {
    console.log('clicked');
  };
}

// ❌ Leak: Detached DOM nodes
let detached;
document.getElementById('btn').addEventListener('click', () => {
  const div = document.createElement('div');
  detached = div;  // Reference keeps div in memory
  document.body.appendChild(div);
  document.body.removeChild(div);  // Removed but not collected
});
```

### WeakMap and WeakSet

```javascript
// Store metadata without preventing GC
const metadata = new WeakMap();

function processElement(element) {
  metadata.set(element, { 
    processed: true, 
    timestamp: Date.now() 
  });
}

// When element is removed from DOM and unreferenced,
// metadata entry is automatically collected

// Use case: Private data
const _private = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    _private.set(this, { password });  // Hidden from enumeration
  }
  
  checkPassword(input) {
    return _private.get(this).password === input;
  }
}
```

### Memory Profiling

```javascript
// Check memory usage (Node.js)
console.log(process.memoryUsage());
// { rss, heapTotal, heapUsed, external, arrayBuffers }

// Force garbage collection (Node.js with --expose-gc)
if (global.gc) global.gc();

// Performance memory (Chrome)
console.log(performance.memory);
// { jsHeapSizeLimit, totalJSHeapSize, usedJSHeapSize }
```

---

## 2.3 Rendering Performance

### Critical Rendering Path

```
HTML → DOM Tree
              ↘
                Render Tree → Layout → Paint → Composite
              ↗
CSS → CSSOM
```

### Reflow (Layout) vs Repaint

```javascript
// ❌ Forces reflow (expensive)
element.style.width = '100px';
const width = element.offsetWidth;  // Forces layout
element.style.height = '100px';     // Another reflow

// ✅ Batch reads and writes
const width = element.offsetWidth;   // Read
const height = element.offsetHeight; // Read
element.style.width = '100px';       // Write
element.style.height = '100px';      // Write (single reflow)

// Layout-triggering properties:
// offsetTop, offsetLeft, offsetWidth, offsetHeight
// scrollTop, scrollLeft, scrollWidth, scrollHeight
// clientTop, clientLeft, clientWidth, clientHeight
// getComputedStyle(), getBoundingClientRect()
```

### Compositor-Only Properties

```javascript
// ❌ Triggers layout + paint
element.style.left = '100px';
element.style.top = '50px';
element.style.width = '200px';

// ✅ Compositor only (GPU accelerated)
element.style.transform = 'translateX(100px) translateY(50px)';
element.style.opacity = 0.5;

// Properties handled by compositor:
// - transform
// - opacity
// - filter (in some cases)
```

### requestAnimationFrame

```javascript
// ❌ Don't animate with setTimeout
function badAnimate() {
  element.style.left = parseInt(element.style.left) + 1 + 'px';
  setTimeout(badAnimate, 16);
}

// ✅ Use requestAnimationFrame
function goodAnimate(timestamp) {
  element.style.transform = `translateX(${timestamp / 10}px)`;
  requestAnimationFrame(goodAnimate);
}
requestAnimationFrame(goodAnimate);

// With delta time for consistent speed
let lastTime = 0;
function animate(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;
  
  // Move 100px per second regardless of frame rate
  const distance = (delta / 1000) * 100;
  position += distance;
  element.style.transform = `translateX(${position}px)`;
  
  requestAnimationFrame(animate);
}
```

### Virtual Scrolling

```javascript
// Only render visible items
class VirtualList {
  constructor(container, items, itemHeight) {
    this.container = container;
    this.items = items;
    this.itemHeight = itemHeight;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2;
    
    this.scrollContainer = document.createElement('div');
    this.scrollContainer.style.height = `${items.length * itemHeight}px`;
    
    this.content = document.createElement('div');
    this.content.style.position = 'relative';
    
    this.scrollContainer.appendChild(this.content);
    container.appendChild(this.scrollContainer);
    
    container.addEventListener('scroll', () => this.render());
    this.render();
  }
  
  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);
    
    // Only create DOM for visible items
    this.content.innerHTML = '';
    this.content.style.transform = `translateY(${startIndex * this.itemHeight}px)`;
    
    for (let i = startIndex; i < endIndex; i++) {
      const item = document.createElement('div');
      item.style.height = `${this.itemHeight}px`;
      item.textContent = this.items[i];
      this.content.appendChild(item);
    }
  }
}

// Renders 10 items instead of 10,000
const list = new VirtualList(container, bigArray, 40);
```

---

## 2.4 Network Optimization

### Code Splitting

```javascript
// Static import (bundled together)
import { heavyFunction } from './heavy-module.js';

// Dynamic import (separate chunk, loaded on demand)
async function loadFeature() {
  const { heavyFunction } = await import('./heavy-module.js');
  heavyFunction();
}

// Route-based splitting (React example)
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));

// Webpack magic comments
const Analytics = await import(
  /* webpackChunkName: "analytics" */
  /* webpackPrefetch: true */
  './analytics.js'
);
```

### Lazy Loading

```javascript
// Images
<img loading="lazy" src="image.jpg" alt="...">

// Intersection Observer for custom lazy loading
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
}, { rootMargin: '100px' });

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

### Prefetching

```html
<!-- Preload critical resources -->
<link rel="preload" href="critical.js" as="script">
<link rel="preload" href="font.woff2" as="font" crossorigin>

<!-- Prefetch for likely navigation -->
<link rel="prefetch" href="/next-page.js">

<!-- DNS prefetch for external domains -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- Preconnect (DNS + TCP + TLS) -->
<link rel="preconnect" href="https://api.example.com">
```

### Caching Strategies

```javascript
// Service Worker caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache first, then network
      if (cached) return cached;
      
      return fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open('v1').then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      });
    })
  );
});

// Stale-while-revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.open('v1').then(cache => cache.put(event.request, response.clone()));
        return response;
      });
      
      return cached || fetchPromise;
    })
  );
});
```

---

## 2.5 Bundle Optimization

### Tree Shaking

```javascript
// ✅ Named exports enable tree shaking
// utils.js
export function used() { return 'used'; }
export function unused() { return 'unused'; }

// main.js
import { used } from './utils.js';
used();  // unused() is removed from bundle

// ❌ Default exports can prevent tree shaking
export default {
  used() {},
  unused() {}
};

// ❌ Side effects prevent tree shaking
// analytics.js
console.log('Loaded');  // Side effect
export function track() {}

// Mark as side-effect free in package.json
{
  "sideEffects": false
}
// Or specify files with side effects
{
  "sideEffects": ["*.css", "./src/polyfills.js"]
}
```

### Bundle Analysis

```bash
# Webpack
npx webpack --analyze
npx webpack-bundle-analyzer stats.json

# Vite
npx vite-bundle-visualizer

# Rollup
npx rollup -c --plugin visualizer
```

### Minification Tips

```javascript
// Enable property mangling for smaller bundles
// terser.config.js
{
  mangle: {
    properties: {
      regex: /^_/  // Mangle _private properties
    }
  }
}

// Use shorter property names for internal APIs
const cache = {
  _items: [],    // Mangled to single char
  _timeout: null
};
```

### Compression

```javascript
// Enable Brotli/Gzip in server
// Express.js
const compression = require('compression');
app.use(compression({ level: 6 }));

// Build-time compression
// vite.config.js
import viteCompression from 'vite-plugin-compression';
export default {
  plugins: [
    viteCompression({ algorithm: 'brotliCompress' })
  ]
}
```

---

## 2.6 Algorithm Optimization

### Time Complexity

```javascript
// O(n²) - Quadratic (avoid for large n)
function findDuplicatesSlow(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) duplicates.push(arr[i]);
    }
  }
  return duplicates;
}

// O(n) - Linear (preferred)
function findDuplicatesFast(arr) {
  const seen = new Set();
  const duplicates = new Set();
  for (const item of arr) {
    if (seen.has(item)) duplicates.add(item);
    else seen.add(item);
  }
  return [...duplicates];
}

// Benchmark
const arr = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 1000));
console.time('slow'); findDuplicatesSlow(arr); console.timeEnd('slow');  // ~100ms
console.time('fast'); findDuplicatesFast(arr); console.timeEnd('fast');  // ~1ms
```

### Data Structure Selection

| Operation | Array | Object/Map | Set |
|-----------|-------|------------|-----|
| Access by index | O(1) | O(1) | — |
| Search | O(n) | O(1) | O(1) |
| Insert | O(n) | O(1) | O(1) |
| Delete | O(n) | O(1) | O(1) |

```javascript
// ❌ Array for frequent lookups
const users = [{ id: 1, name: 'Alice' }, ...];
function findUser(id) {
  return users.find(u => u.id === id);  // O(n)
}

// ✅ Map for frequent lookups
const usersMap = new Map(users.map(u => [u.id, u]));
function findUser(id) {
  return usersMap.get(id);  // O(1)
}

// ✅ Set for membership checks
const allowedIds = new Set([1, 2, 3, 4, 5]);
allowedIds.has(3);  // O(1)
```

### Memoization

```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Expensive calculation
const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

fibonacci(40);  // Fast with memoization
```

### Debounce and Throttle

```javascript
// Debounce: Wait until calls stop
function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Use: Search input, resize handlers
const search = debounce((query) => {
  fetchResults(query);
}, 300);

// Throttle: Execute at most once per interval
function throttle(fn, interval) {
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// Use: Scroll handlers, mouse move
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

---

## 2.7 Profiling Tools

### Performance API

```javascript
// Measure execution time
performance.mark('start');
expensiveOperation();
performance.mark('end');

performance.measure('operation', 'start', 'end');
const [measure] = performance.getEntriesByName('operation');
console.log(`Duration: ${measure.duration}ms`);

// Resource timing
const resources = performance.getEntriesByType('resource');
resources.forEach(r => {
  console.log(`${r.name}: ${r.duration}ms`);
});

// Navigation timing
const nav = performance.getEntriesByType('navigation')[0];
console.log('DOM Content Loaded:', nav.domContentLoadedEventEnd);
console.log('Load Complete:', nav.loadEventEnd);

// Long tasks
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log('Long task:', entry.duration, 'ms');
  });
});
observer.observe({ entryTypes: ['longtask'] });
```

### Chrome DevTools

```javascript
// Console timing
console.time('operation');
doSomething();
console.timeEnd('operation');

// Profile in code
console.profile('MyProfile');
heavyComputation();
console.profileEnd('MyProfile');

// CPU profiling steps:
// 1. DevTools → Performance tab
// 2. Click Record
// 3. Perform actions
// 4. Stop recording
// 5. Analyze flame chart

// Memory profiling:
// 1. DevTools → Memory tab
// 2. Take heap snapshot
// 3. Perform actions
// 4. Take another snapshot
// 5. Compare snapshots
```

### Lighthouse Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| FCP (First Contentful Paint) | < 1.8s | First content visible |
| LCP (Largest Contentful Paint) | < 2.5s | Largest element visible |
| FID (First Input Delay) | < 100ms | Response to first interaction |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| TTI (Time to Interactive) | < 3.8s | Fully interactive |

```javascript
// Monitor Core Web Vitals
import { getCLS, getFID, getLCP } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getLCP(console.log);
```

---

## 2.8 Summary

| Category | Key Techniques |
|----------|---------------|
| **V8 Optimization** | Consistent shapes, monomorphic code, avoid deopt triggers |
| **Memory** | Clear references, use WeakMap, avoid closures over large data |
| **Rendering** | Batch DOM reads/writes, use transform/opacity, rAF |
| **Network** | Code splitting, lazy loading, prefetching, caching |
| **Bundle** | Tree shaking, compression, analyze bundle size |
| **Algorithms** | Choose right data structure, memoize, debounce/throttle |
| **Profiling** | Performance API, DevTools, Lighthouse |

### Optimization Checklist

- [ ] Profile before optimizing (measure, don't guess)
- [ ] Optimize the critical path first
- [ ] Use production builds for benchmarks
- [ ] Test on real devices, not just dev machines
- [ ] Monitor Core Web Vitals in production
- [ ] Set performance budgets
- [ ] Automate performance testing in CI

---

**End of Module 2: Performance Optimization**

Next: Module 3 — Security Best Practices
# Module 3: Security Best Practices

Web security vulnerabilities can lead to data breaches, account takeovers, and reputational damage. This module covers essential security practices for JavaScript developers.

---

## 3.1 Common Vulnerabilities

### OWASP Top 10 (Web Applications)

| Rank | Vulnerability | JavaScript Relevance |
|------|---------------|---------------------|
| 1 | Broken Access Control | Authorization checks |
| 2 | Cryptographic Failures | Token handling, HTTPS |
| 3 | Injection | XSS, SQL injection |
| 4 | Insecure Design | Architecture flaws |
| 5 | Security Misconfiguration | CORS, headers |
| 6 | Vulnerable Components | npm dependencies |
| 7 | Authentication Failures | Session, JWT |
| 8 | Data Integrity Failures | Unsigned updates |
| 9 | Logging Failures | Missing audit trails |
| 10 | SSRF | Server-side requests |

### Attack Vectors in JavaScript

```javascript
// Client-side attacks:
// - XSS (Cross-Site Scripting)
// - Prototype pollution
// - Open redirects
// - Clickjacking
// - DOM clobbering

// Server-side attacks (Node.js):
// - SQL/NoSQL injection
// - Command injection
// - Path traversal
// - SSRF
// - ReDoS
```

---

## 3.2 XSS Prevention

### Types of XSS

```javascript
// 1. Reflected XSS - Malicious input reflected immediately
// URL: https://site.com/search?q=<script>alert('XSS')</script>
const query = new URLSearchParams(location.search).get('q');
document.body.innerHTML = `Results for: ${query}`;  // ❌ Vulnerable

// 2. Stored XSS - Malicious content stored in database
// Comment: <script>document.cookie</script>
comments.forEach(c => {
  div.innerHTML = c.text;  // ❌ Vulnerable
});

// 3. DOM-based XSS - Client-side manipulation
// URL: https://site.com/#<img onerror=alert(1) src=x>
const hash = location.hash.slice(1);
document.getElementById('content').innerHTML = hash;  // ❌ Vulnerable
```

### Prevention Techniques

```javascript
// ✅ Use textContent instead of innerHTML
element.textContent = userInput;  // Safe - treats as text

// ✅ Sanitize HTML if needed
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userInput);

// ✅ Escape HTML entities
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ✅ Use template literals safely
const template = document.createElement('template');
template.innerHTML = DOMPurify.sanitize(`<div>${userInput}</div>`);
document.body.appendChild(template.content.cloneNode(true));

// ✅ Safe DOM methods
const link = document.createElement('a');
link.href = url;
link.textContent = label;  // Not innerHTML

// ❌ Dangerous patterns to avoid
element.innerHTML = userInput;
element.outerHTML = userInput;
document.write(userInput);
eval(userInput);
new Function(userInput);
setTimeout(userInput, 0);  // String form
location.href = userInput;  // Open redirect
```

### URL Validation

```javascript
// ❌ Vulnerable to javascript: URLs
link.href = userProvidedUrl;

// ✅ Validate URL scheme
function isSafeUrl(url) {
  try {
    const parsed = new URL(url, location.origin);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

if (isSafeUrl(userUrl)) {
  link.href = userUrl;
}

// ❌ Open redirect vulnerability
location.href = params.get('redirect');

// ✅ Whitelist allowed redirects
const allowedRedirects = ['/dashboard', '/profile', '/settings'];
const redirect = params.get('redirect');
if (allowedRedirects.includes(redirect)) {
  location.href = redirect;
}
```

---

## 3.3 CSRF Protection

### What Is CSRF?

```html
<!-- Attacker's page -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">

<!-- Or hidden form -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker">
  <input type="hidden" name="amount" value="1000">
</form>
<script>document.forms[0].submit()</script>
```

### Prevention Techniques

```javascript
// ✅ CSRF Token
// Server generates token per session
const csrfToken = 'random-secure-token';

// Include in forms
<form>
  <input type="hidden" name="_csrf" value="${csrfToken}">
</form>

// Include in AJAX requests
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});

// Server validates token
app.post('/api/transfer', (req, res) => {
  if (req.headers['x-csrf-token'] !== req.session.csrfToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  // Process request
});

// ✅ SameSite Cookies
// Set-Cookie: session=abc; SameSite=Strict
// Set-Cookie: session=abc; SameSite=Lax (default in modern browsers)

// ✅ Check Origin/Referer headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['https://mysite.com'];
  
  if (req.method !== 'GET' && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Invalid origin' });
  }
  next();
});
```

---

## 3.4 Authentication Security

### Password Handling

```javascript
// ❌ Never store plain passwords
const user = { password: req.body.password };  // Never!

// ✅ Hash with bcrypt (Node.js)
const bcrypt = require('bcrypt');
const saltRounds = 12;

// Registration
const hashedPassword = await bcrypt.hash(password, saltRounds);
await db.users.insert({ email, password: hashedPassword });

// Login
const user = await db.users.findOne({ email });
const valid = await bcrypt.compare(inputPassword, user.password);

// ✅ Use argon2 for new projects
const argon2 = require('argon2');
const hash = await argon2.hash(password);
const valid = await argon2.verify(hash, password);
```

### JWT Security

```javascript
// ❌ Weak JWT practices
const token = jwt.sign(payload, 'secret123');  // Weak secret
const token = jwt.sign(payload, secret, { algorithm: 'none' });  // No algorithm

// ✅ Secure JWT practices
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;  // Strong, from environment

const token = jwt.sign(
  { userId: user.id, role: user.role },
  secret,
  {
    algorithm: 'HS256',  // Or RS256 for asymmetric
    expiresIn: '15m',    // Short expiry
    issuer: 'myapp.com',
    audience: 'myapp.com'
  }
);

// Verify with options
const decoded = jwt.verify(token, secret, {
  algorithms: ['HS256'],  // Whitelist algorithms
  issuer: 'myapp.com',
  audience: 'myapp.com'
});

// ✅ Use refresh tokens
// Access token: Short-lived (15m), in memory
// Refresh token: Long-lived (7d), httpOnly cookie

// ❌ Don't store tokens in localStorage (XSS vulnerable)
localStorage.setItem('token', token);

// ✅ Store in httpOnly cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000  // 15 minutes
});
```

### Session Security

```javascript
// Express session configuration
const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId',  // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,      // HTTPS only
    httpOnly: true,    // No JS access
    sameSite: 'strict',
    maxAge: 3600000    // 1 hour
  }
}));

// Regenerate session on login (prevent fixation)
req.session.regenerate((err) => {
  req.session.userId = user.id;
});

// Destroy session on logout
req.session.destroy((err) => {
  res.clearCookie('sessionId');
  res.redirect('/login');
});
```

---

## 3.5 Input Validation

### Server-Side Validation

```javascript
// ❌ Trust client input
app.post('/api/user', (req, res) => {
  db.users.insert(req.body);  // Never trust client data
});

// ✅ Validate and sanitize
const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(0).max(150),
  role: Joi.string().valid('user', 'admin').default('user')
});

app.post('/api/user', async (req, res) => {
  try {
    const validated = await userSchema.validateAsync(req.body);
    await db.users.insert(validated);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

### SQL Injection Prevention

```javascript
// ❌ String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;
// userId = "1; DROP TABLE users;"

// ✅ Parameterized queries
const [rows] = await db.query(
  'SELECT * FROM users WHERE id = ?',
  [userId]
);

// ✅ ORM/Query builders
const user = await User.findOne({ where: { id: userId } });

// ✅ PostgreSQL with pg
const { rows } = await client.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);
```

### NoSQL Injection Prevention

```javascript
// ❌ Vulnerable to operator injection
const user = await db.users.findOne({
  username: req.body.username,
  password: req.body.password
});
// password = { "$gt": "" } bypasses check

// ✅ Validate type
if (typeof req.body.password !== 'string') {
  return res.status(400).json({ error: 'Invalid input' });
}

// ✅ Use mongo-sanitize
const sanitize = require('mongo-sanitize');
const clean = sanitize(req.body);

// ✅ Schema validation
const Joi = require('joi');
const schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});
```

### Command Injection Prevention

```javascript
// ❌ Vulnerable
const { exec } = require('child_process');
exec(`convert ${userFile} output.png`);  // userFile = "; rm -rf /"

// ✅ Use execFile with arguments array
const { execFile } = require('child_process');
execFile('convert', [userFile, 'output.png']);

// ✅ Validate/sanitize filename
const path = require('path');
const safeName = path.basename(userFile).replace(/[^a-zA-Z0-9.-]/g, '');
execFile('convert', [safeName, 'output.png']);
```

### Path Traversal Prevention

```javascript
// ❌ Vulnerable
app.get('/files/:name', (req, res) => {
  res.sendFile(`/uploads/${req.params.name}`);
});
// name = "../../../etc/passwd"

// ✅ Validate path
const path = require('path');

app.get('/files/:name', (req, res) => {
  const safePath = path.join('/uploads', path.basename(req.params.name));
  
  // Ensure it's still within uploads
  if (!safePath.startsWith('/uploads/')) {
    return res.status(400).send('Invalid path');
  }
  
  res.sendFile(safePath);
});
```

---

## 3.6 Dependency Security

### npm Audit

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Fix breaking changes (major versions)
npm audit fix --force

# Generate report
npm audit --json > audit-report.json
```

### Package Lock

```javascript
// ✅ Always commit package-lock.json
// Ensures reproducible builds with exact versions

// ✅ Use npm ci in CI/CD (faster, strict)
npm ci

// ❌ Don't use: npm install in CI (can change lock file)
```

### Dependency Monitoring

```javascript
// Tools for continuous monitoring:
// - GitHub Dependabot
// - Snyk
// - npm audit (GitHub Actions)

// GitHub Actions workflow
name: Security
on: [push, pull_request]
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm audit --audit-level=high
```

### Safe Package Selection

```javascript
// Before adding a package, check:
// 1. Maintenance: Last update, open issues
// 2. Popularity: Downloads, stars (not definitive but indicative)
// 3. Security: Known vulnerabilities
// 4. Dependencies: How many sub-dependencies?
// 5. License: Compatible with your project?

// Use npm info
npm info package-name

// Check on Snyk
// https://snyk.io/advisor/npm-package/package-name
```

---

## 3.7 Content Security Policy

### CSP Headers

```javascript
// Express middleware
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'strict-dynamic'"],
    styleSrc: ["'self'", "'unsafe-inline'"],  // Needed for some frameworks
    imgSrc: ["'self'", "data:", "https:"],
    fontSrc: ["'self'"],
    connectSrc: ["'self'", "https://api.example.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    upgradeInsecureRequests: [],
    blockAllMixedContent: []
  }
}));

// HTML meta tag (limited, no report-uri)
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

### CSP Nonces

```javascript
// Generate nonce per request
const crypto = require('crypto');

app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`]
  }
}));

// Use in templates
<script nonce="${nonce}">
  // Inline script allowed
</script>
```

### Reporting

```javascript
// Report-only mode (doesn't block, just reports)
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report

// Collect reports
app.post('/csp-report', express.json({ type: 'application/csp-report' }), (req, res) => {
  console.log('CSP Violation:', req.body);
  res.sendStatus(204);
});
```

---

## 3.8 Secure Headers

```javascript
// Use helmet for all security headers
const helmet = require('helmet');
app.use(helmet());

// Individual headers:

// X-Content-Type-Options: Prevent MIME sniffing
app.use(helmet.noSniff());
// X-Content-Type-Options: nosniff

// X-Frame-Options: Prevent clickjacking
app.use(helmet.frameguard({ action: 'deny' }));
// X-Frame-Options: DENY

// X-XSS-Protection: Legacy XSS filter (deprecated, but doesn't hurt)
app.use(helmet.xssFilter());

// Referrer-Policy: Control referrer information
app.use(helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }));

// Permissions-Policy: Control browser features
app.use(helmet.permittedCrossDomainPolicies());

// HSTS: Force HTTPS
app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
// Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## 3.9 CORS Security

```javascript
// ❌ Too permissive
app.use(cors({ origin: '*' }));

// ❌ Reflecting Origin (vulnerable)
app.use(cors({ 
  origin: req.headers.origin,
  credentials: true 
}));

// ✅ Whitelist origins
const allowedOrigins = [
  'https://myapp.com',
  'https://admin.myapp.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## 3.10 Prototype Pollution

```javascript
// ❌ Vulnerable: Recursive merge
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// Attack:
const payload = JSON.parse('{"__proto__": {"admin": true}}');
merge({}, payload);
console.log({}.admin);  // true - all objects affected!

// ✅ Safe merge
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    // Block prototype pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = safeMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ✅ Use Object.create(null) for dictionaries
const dict = Object.create(null);  // No prototype chain

// ✅ Freeze prototype (defense in depth)
Object.freeze(Object.prototype);
```

---

## 3.11 Summary

| Category | Key Practices |
|----------|--------------|
| **XSS** | textContent, DOMPurify, escape HTML |
| **CSRF** | CSRF tokens, SameSite cookies |
| **Auth** | bcrypt/argon2, secure JWT, httpOnly cookies |
| **Input** | Validate all input, parameterized queries |
| **Dependencies** | npm audit, lock files, monitoring |
| **Headers** | CSP, HSTS, X-Frame-Options, helmet |
| **CORS** | Whitelist origins, no credentials with * |

### Security Checklist

- [ ] All user input validated and sanitized
- [ ] CSP headers configured
- [ ] HTTPS enforced (HSTS)
- [ ] Cookies: httpOnly, secure, sameSite
- [ ] CSRF protection on state-changing requests
- [ ] Passwords hashed with bcrypt/argon2
- [ ] JWTs: short expiry, httpOnly, secure
- [ ] SQL/NoSQL injection prevented
- [ ] npm audit clean, Dependabot enabled
- [ ] Security headers via helmet
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting on authentication endpoints

---

**End of Module 3: Security Best Practices**

Next: Module 4 — Deployment and DevOps
# Module 4: Deployment and DevOps

Modern JavaScript applications require robust deployment pipelines and operational practices. This module covers CI/CD, containerization, cloud deployment, and monitoring.

---

## 4.1 Deployment Strategies

### Blue-Green Deployment

```
                    ┌─────────────┐
                    │   Router    │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼──────┐          ┌───────▼─────┐
       │  Blue (v1)  │          │ Green (v2)  │
       │   Active    │          │   Standby   │
       └─────────────┘          └─────────────┘
```

```yaml
# Kubernetes blue-green
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # Switch to 'green' for deployment
  ports:
    - port: 80
```

```javascript
// Switch traffic
kubectl patch service myapp -p '{"spec":{"selector":{"version":"green"}}}'

// Rollback
kubectl patch service myapp -p '{"spec":{"selector":{"version":"blue"}}}'
```

### Canary Deployment

```javascript
// Gradual rollout: 5% → 25% → 50% → 100%
// nginx.conf
upstream backend {
  server v1.myapp.com weight=95;
  server v2.myapp.com weight=5;  # Canary
}

// Or Kubernetes Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10"
```

### Rolling Deployment

```yaml
# Kubernetes rolling update
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Max pods over desired count
      maxUnavailable: 1  # Max pods that can be down
```

### Feature Flags

```javascript
// LaunchDarkly / custom implementation
const flags = {
  newCheckout: { enabled: true, percentage: 25 },
  darkMode: { enabled: true, percentage: 100 },
  experimentalApi: { enabled: false }
};

function isFeatureEnabled(flag, userId) {
  const feature = flags[flag];
  if (!feature?.enabled) return false;
  if (feature.percentage === 100) return true;
  
  // Consistent hashing for user
  const hash = hashCode(userId + flag);
  return (hash % 100) < feature.percentage;
}

// Usage
if (isFeatureEnabled('newCheckout', user.id)) {
  return <NewCheckout />;
} else {
  return <LegacyCheckout />;
}
```

---

## 4.2 CI/CD Pipelines

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
  
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build
          path: dist/
      
      - name: Deploy to production
        run: |
          # Deploy script
          aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CF_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"

.node-cache:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/

test:
  stage: test
  image: node:${NODE_VERSION}
  extends: .node-cache
  script:
    - npm ci
    - npm run lint
    - npm test

build:
  stage: build
  image: node:${NODE_VERSION}
  extends: .node-cache
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/

deploy_production:
  stage: deploy
  image: alpine:latest
  only:
    - main
  script:
    - apk add --no-cache aws-cli
    - aws s3 sync dist/ s3://${S3_BUCKET}
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
  agent { docker { image 'node:20' } }
  
  environment {
    CI = 'true'
  }
  
  stages {
    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }
    
    stage('Test') {
      steps {
        sh 'npm test'
      }
    }
    
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    
    stage('Deploy') {
      when { branch 'main' }
      steps {
        withCredentials([string(credentialsId: 'aws-key', variable: 'AWS_ACCESS_KEY_ID')]) {
          sh 'aws s3 sync dist/ s3://my-bucket'
        }
      }
    }
  }
  
  post {
    always {
      junit 'coverage/junit.xml'
    }
    failure {
      slackSend channel: '#deploys', message: "Build failed: ${env.BUILD_URL}"
    }
  }
}
```

---

## 4.3 Containerization

### Dockerfile Best Practices

```dockerfile
# Multi-stage build for Node.js
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Security: Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy only what's needed
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: user
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    secrets:
      - db_password
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

### Kubernetes Basics

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: myregistry/myapp:v1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
---
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt
spec:
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: myapp
                port:
                  number: 80
```

---

## 4.4 Cloud Platforms

### AWS Deployment

```javascript
// AWS CDK (Infrastructure as Code)
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export class FrontendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // S3 bucket for static files
    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED
      },
      defaultRootObject: 'index.html',
      errorResponses: [{
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: '/index.html'  // SPA routing
      }]
    });

    // Deploy files
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset('./dist')],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ['/*']
    });
  }
}
```

### Vercel / Netlify

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Serverless Functions

```javascript
// Vercel API route (pages/api/hello.js or app/api/hello/route.js)
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello from serverless!' });
}

// Next.js 13+ App Router
export async function GET(request) {
  return Response.json({ message: 'Hello' });
}

// Netlify Function (netlify/functions/hello.js)
exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Netlify!' })
  };
};

// AWS Lambda
export const handler = async (event) => {
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Hello from Lambda!' })
  };
};
```

---

## 4.5 Monitoring and Logging

### Error Tracking (Sentry)

```javascript
// Initialize Sentry
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.VERSION,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0
});

// Capture errors
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'checkout' },
    extra: { userId: user.id }
  });
}

// Set user context
Sentry.setUser({ id: user.id, email: user.email });

// Add breadcrumb
Sentry.addBreadcrumb({
  category: 'ui.click',
  message: 'User clicked checkout button',
  level: 'info'
});
```

### Structured Logging

```javascript
// Winston logger (Node.js)
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'myapp' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('User logged in', { userId: user.id, ip: req.ip });
logger.error('Payment failed', { orderId, error: err.message });

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
});
```

### Application Performance Monitoring (APM)

```javascript
// Datadog APM
const tracer = require('dd-trace').init({
  service: 'myapp',
  env: process.env.NODE_ENV,
  version: process.env.VERSION
});

// Custom spans
const span = tracer.startSpan('process.order');
span.setTag('order.id', orderId);
try {
  await processOrder(order);
  span.setTag('order.status', 'success');
} catch (error) {
  span.setTag('error', true);
  span.setTag('error.message', error.message);
  throw error;
} finally {
  span.finish();
}

// Custom metrics
const StatsD = require('hot-shots');
const dogstatsd = new StatsD();

dogstatsd.increment('orders.created');
dogstatsd.gauge('queue.size', queue.length);
dogstatsd.histogram('order.processing_time', duration);
```

### Health Checks

```javascript
// Express health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/ready', async (req, res) => {
  try {
    // Check dependencies
    await db.query('SELECT 1');
    await redis.ping();
    
    res.json({ 
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});

// Liveness vs Readiness
// Liveness: Is the app alive? (restart if failed)
// Readiness: Can the app handle traffic? (stop routing if failed)
```

---

## 4.6 Edge Computing

### Edge Functions

```javascript
// Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // A/B testing at the edge
    const variant = Math.random() < 0.5 ? 'a' : 'b';
    
    const response = await fetch(`https://origin.example.com${url.pathname}`, {
      headers: { 'X-Variant': variant }
    });
    
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Variant', variant);
    
    return newResponse;
  }
};

// Vercel Edge Functions
import { NextResponse } from 'next/server';

export const config = { runtime: 'edge' };

export default function handler(request) {
  const country = request.geo?.country || 'US';
  
  // Geo-based routing
  if (country === 'CN') {
    return NextResponse.redirect('https://cn.example.com');
  }
  
  return NextResponse.next();
}
```

### CDN Configuration

```javascript
// Cache-Control headers
// Immutable assets (hashed filenames)
app.use('/assets', express.static('dist/assets', {
  maxAge: '1y',
  immutable: true
}));

// HTML (always revalidate)
app.get('/*.html', (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile('index.html');
});

// API responses
app.get('/api/products', (req, res) => {
  res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=600');
  res.json(products);
});
```

---

## 4.7 Summary

| Topic | Key Tools & Practices |
|-------|----------------------|
| **Strategies** | Blue-green, canary, feature flags |
| **CI/CD** | GitHub Actions, GitLab CI, Jenkins |
| **Containers** | Multi-stage Docker, docker-compose, K8s |
| **Cloud** | AWS CDK, Vercel, Netlify, serverless |
| **Monitoring** | Sentry, Winston, Datadog, health checks |
| **Edge** | Cloudflare Workers, Vercel Edge |

### DevOps Checklist

- [ ] CI pipeline: lint → test → build → deploy
- [ ] Automated testing with coverage requirements
- [ ] Staging environment mirroring production
- [ ] Feature flags for risky deployments
- [ ] Health checks and readiness probes
- [ ] Structured logging with correlation IDs
- [ ] Error tracking (Sentry or equivalent)
- [ ] Performance monitoring and alerting
- [ ] Rollback strategy documented
- [ ] Infrastructure as Code (CDK/Terraform)

---

**End of Module 4: Deployment and DevOps**

Next: Module 5 — Career Development
# Module 5: Career Development

Technical excellence alone isn't enough for a successful career. This module covers learning strategies, interview preparation, leadership, and building professional reputation.

---

## 5.1 Learning Path

### JavaScript Developer Roadmap

```
Beginner (0-1 years)
├── JavaScript Fundamentals
│   ├── Variables, types, operators
│   ├── Functions, scope, closures
│   ├── Arrays, objects, iteration
│   ├── DOM manipulation
│   └── Async: callbacks, promises, async/await
├── Version Control
│   └── Git basics, GitHub
├── Package Management
│   └── npm, package.json
└── First Framework
    └── React/Vue/Angular basics

Intermediate (1-3 years)
├── Advanced JavaScript
│   ├── Prototypes, classes
│   ├── Event loop, microtasks
│   ├── Modules (ESM, CJS)
│   └── Error handling, debugging
├── TypeScript
├── Testing
│   ├── Unit testing (Jest/Vitest)
│   └── E2E testing (Playwright/Cypress)
├── Build Tools
│   └── Vite, Webpack, ESLint
├── Backend Basics
│   └── Node.js, Express, REST APIs
└── Databases
    └── SQL basics, MongoDB

Senior (3-5 years)
├── Architecture Patterns
│   ├── Design patterns
│   ├── State management
│   └── Microservices/monoliths
├── Performance
│   ├── V8 internals
│   ├── Bundle optimization
│   └── Profiling
├── Security
│   └── OWASP, secure coding
├── DevOps
│   ├── CI/CD
│   ├── Docker, Kubernetes
│   └── Cloud services
└── System Design
    └── Scalability, distributed systems

Staff/Principal (5+ years)
├── Technical Strategy
├── Cross-team Architecture
├── Mentoring & Team Building
├── Performance Reviews
└── Open Source Leadership
```

### Effective Learning Strategies

```javascript
// 1. Active recall over passive reading
// Don't just read tutorials - build projects

// 2. Spaced repetition
// Review concepts at increasing intervals

// 3. Teach to learn
// Write blog posts, give talks, mentor others

// 4. Project-based learning
// Build real things, solve real problems

// Example learning plan:
const weeklyPlan = {
  monday: 'Deep dive: 2 hours focused topic',
  tuesday: 'Practice: Coding challenges',
  wednesday: 'Project work: 2 hours',
  thursday: 'Read: Documentation, articles',
  friday: 'Review: Week's learnings, blog draft',
  weekend: 'Side project or open source'
};
```

### Staying Current

```javascript
// Essential resources:
const resources = {
  news: [
    'JavaScript Weekly (newsletter)',
    'Bytes.dev (newsletter)',
    'Dev.to, Hashnode, Medium (blogs)',
    'Twitter/X tech community'
  ],
  documentation: [
    'MDN Web Docs',
    'Node.js Docs',
    'Framework official docs'
  ],
  learning: [
    'Frontend Masters',
    'Egghead.io',
    'YouTube (Fireship, Theo, etc.)',
    'Official tutorials'
  ],
  standards: [
    'TC39 proposals (GitHub)',
    'WHATWG (Web standards)',
    'Node.js releases'
  ]
};

// Tips:
// - Allocate 30min/day for learning
// - Follow key people, not all hype
// - Focus depth over breadth
// - Learn the "why", not just "how"
```

---

## 5.2 Interview Preparation

### Interview Types

| Type | Focus | Preparation |
|------|-------|-------------|
| Phone Screen | Communication, basic knowledge | Practice explaining concepts |
| Coding | Problem solving, algorithms | LeetCode, HackerRank |
| System Design | Architecture, trade-offs | Educative, books |
| Behavioral | Culture fit, experience | STAR method, stories |
| Take-home | Real-world coding | Build clean, tested code |
| Pair Programming | Collaboration, thinking | Practice verbalizing |

### JavaScript Technical Questions

```javascript
// Closures
function counter() {
  let count = 0;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

// Event loop
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// Output: 1, 4, 3, 2

// this binding
const obj = {
  name: 'Object',
  greet: function() { return this.name; },
  arrowGreet: () => this.name  // 'this' is outer scope
};

// Prototypes
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

// Equality
console.log([] == false);   // true (coercion)
console.log([] === false);  // false (strict)
console.log(NaN === NaN);   // false

// Hoisting
console.log(x);  // undefined (var hoisted)
var x = 1;

console.log(y);  // ReferenceError (let TDZ)
let y = 2;
```

### Algorithm Patterns

```javascript
// Two Pointers
function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left++] !== s[right--]) return false;
  }
  return true;
}

// Sliding Window
function maxSubarraySum(arr, k) {
  let maxSum = 0, windowSum = 0;
  
  for (let i = 0; i < arr.length; i++) {
    windowSum += arr[i];
    if (i >= k - 1) {
      maxSum = Math.max(maxSum, windowSum);
      windowSum -= arr[i - k + 1];
    }
  }
  return maxSum;
}

// Hash Map for O(1) lookup
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}

// BFS for shortest path
function shortestPath(graph, start, end) {
  const queue = [[start, 0]];
  const visited = new Set([start]);
  
  while (queue.length > 0) {
    const [node, distance] = queue.shift();
    if (node === end) return distance;
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([neighbor, distance + 1]);
      }
    }
  }
  return -1;
}

// Dynamic Programming
function fibonacci(n, memo = {}) {
  if (n <= 1) return n;
  if (memo[n]) return memo[n];
  memo[n] = fibonacci(n - 1, memo) + fibonacci(n - 2, memo);
  return memo[n];
}
```

### System Design Framework

```
1. Clarify Requirements (5 min)
   - Functional: What features?
   - Non-functional: Scale, latency, consistency?
   - Constraints: Budget, timeline?

2. High-Level Design (10 min)
   - Draw main components
   - Data flow between them
   - APIs/interfaces

3. Deep Dive (15 min)
   - Database schema
   - Caching strategy
   - Scaling approach

4. Trade-offs & Edge Cases (5 min)
   - What could fail?
   - Alternative approaches?
   - Future improvements?
```

```
Example: Design Twitter

Components:
┌────────────┐     ┌─────────────┐     ┌──────────┐
│   Client   │────▶│   API GW    │────▶│  Tweet   │
└────────────┘     └─────────────┘     │  Service │
                          │            └──────────┘
                          │                  │
                          ▼                  ▼
                   ┌─────────────┐    ┌──────────┐
                   │   Timeline  │    │   Tweet  │
                   │   Service   │    │    DB    │
                   └─────────────┘    └──────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │    Cache    │
                   │   (Redis)   │
                   └─────────────┘

Key decisions:
- Fan-out on write (precompute timelines) vs fan-out on read
- Sharding tweets by user_id
- Caching hot users' timelines
- CDN for media
```

### Behavioral Interview (STAR Method)

```
S - Situation: Set the context
T - Task: What was your responsibility?
A - Action: What did you do?
R - Result: What was the outcome?

Example:
"Tell me about a time you dealt with a difficult technical problem."

S: "Our payment service was experiencing intermittent failures
    affecting 2% of transactions."

T: "As the senior engineer, I needed to identify the root cause
    and implement a fix within our SLA."

A: "I added structured logging to trace the request path,
    set up alerts for the specific error pattern, and discovered
    a race condition in our database connection pooling.
    I implemented connection retry logic with exponential backoff
    and added circuit breaker pattern."

R: "Failures dropped from 2% to 0.01%, and we implemented
    the pattern across other services. I documented the approach
    and presented it to the team."
```

---

## 5.3 Code Quality

### Code Review Best Practices

```javascript
// As a reviewer:
// 1. Focus on design, not style (let linters handle style)
// 2. Ask questions, don't demand
// 3. Explain the "why"
// 4. Praise good code
// 5. Review promptly

// Good review comment:
// "Could we extract this into a separate function? It would make
//  testing easier and the main function more readable."

// Bad review comment:
// "This is wrong. Fix it."

// As an author:
// 1. Keep PRs small (<400 lines)
// 2. Write descriptive PR descriptions
// 3. Self-review before requesting
// 4. Respond to all comments
// 5. Don't take feedback personally
```

### Documentation

```javascript
/**
 * Processes a payment transaction.
 * 
 * @param {Object} payment - Payment details
 * @param {string} payment.customerId - The customer's unique ID
 * @param {number} payment.amount - Amount in cents
 * @param {string} payment.currency - ISO 4217 currency code
 * @param {Object} [options] - Optional configuration
 * @param {boolean} [options.sendReceipt=true] - Whether to email receipt
 * @returns {Promise<PaymentResult>} The processed payment result
 * @throws {PaymentError} When payment fails
 * 
 * @example
 * const result = await processPayment({
 *   customerId: 'cus_123',
 *   amount: 5000,
 *   currency: 'USD'
 * });
 */
async function processPayment(payment, options = {}) {
  // Implementation
}
```

```markdown
# Project README Structure

## Overview
One-paragraph description of what this does and why.

## Quick Start
```bash
npm install
npm run dev
```

## Features
- Feature 1
- Feature 2

## Configuration
Environment variables and options.

## API Reference
Endpoint documentation.

## Contributing
How to contribute, code style, PR process.

## License
MIT or whatever applies.
```

### Testing Culture

```javascript
// Test pyramid:
// Many unit tests (fast, isolated)
// Some integration tests (verify connections)
// Few E2E tests (slow, expensive)

// Write tests BEFORE fixing bugs (TDD for bugs)
// 1. Write a failing test that reproduces the bug
// 2. Fix the bug
// 3. Test passes and prevents regression

// Test coverage goals:
// - 80% coverage is a reasonable target
// - 100% coverage doesn't mean bug-free
// - Cover edge cases, not just happy paths

// Example: Testing a reducer
describe('todosReducer', () => {
  it('adds a todo', () => {
    const state = [];
    const action = { type: 'ADD_TODO', payload: 'Learn testing' };
    const result = todosReducer(state, action);
    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Learn testing');
  });
  
  it('handles empty state', () => {
    const result = todosReducer(undefined, { type: 'UNKNOWN' });
    expect(result).toEqual([]);
  });
});
```

---

## 5.4 Technical Leadership

### Mentoring

```javascript
// Effective mentoring:
const mentoringPrinciples = {
  listen: 'Understand their goals and challenges',
  guide: 'Ask questions, don\'t give answers immediately',
  challenge: 'Push them slightly beyond comfort zone',
  support: 'Be available, celebrate wins',
  feedback: 'Specific, actionable, timely'
};

// 1-on-1 meeting structure:
// - Their topics first (15 min)
// - Technical discussion (10 min)
// - Career/growth (5 min)

// Code review as teaching:
// "Have you considered using X pattern here? 
//  It handles the edge case where..."
// vs
// "Use X pattern."
```

### Technical Decision Making

```markdown
# RFC: Adopt TypeScript

## Summary
Propose migrating JavaScript codebase to TypeScript.

## Motivation
- Reduce runtime errors (caught 40% of bugs in similar projects)
- Improve developer experience (autocomplete, refactoring)
- Better documentation through types

## Detailed Design
- Phase 1: Enable TypeScript, allow implicit any
- Phase 2: Convert new code with strict mode
- Phase 3: Migrate existing modules incrementally

## Alternatives Considered
1. JSDoc annotations only
   - Pro: No build step
   - Con: Less enforcement
2. Flow
   - Pro: Gradual adoption
   - Con: Smaller ecosystem

## Migration Strategy
- One module per sprint
- Team pairing sessions
- CI checks for new code

## Risks
- Learning curve (mitigate with training)
- Build complexity (keep simple config)
```

### Architecture Decisions

```
ADR-001: Use Event-Driven Architecture

Status: Accepted
Date: 2024-01-15
Decision Makers: @alice, @bob, @charlie

Context:
Our monolith is becoming difficult to scale. Team autonomy
is limited by shared database dependencies.

Decision:
Adopt event-driven architecture using Kafka for inter-service
communication. Services own their data and publish events
for other services to consume.

Consequences:
+ Services can scale independently
+ Teams can work autonomously
+ Better fault isolation
- Added complexity (message ordering, idempotency)
- Eventual consistency requires careful design
- Operational overhead for Kafka
```

---

## 5.5 Open Source Contribution

### Getting Started

```bash
# 1. Find projects
# - GitHub Explore: https://github.com/explore
# - Good First Issues: https://goodfirstissues.com
# - Projects you already use

# 2. Start small
# - Fix typos in docs
# - Add tests
# - Fix labeled "good first issue"

# 3. Understand the project
git clone https://github.com/owner/repo
cat CONTRIBUTING.md
cat README.md
npm install
npm test

# 4. Make your change
git checkout -b fix-typo
# ... make changes
npm test
git commit -m "Fix typo in README"
git push origin fix-typo

# 5. Open PR with good description
```

### PR Etiquette

```markdown
# PR Title: Fix memory leak in WebSocket connection

## Summary
WebSocket connections weren't being cleaned up on component 
unmount, causing memory leaks in long-running sessions.

## Changes
- Added cleanup function to useEffect
- Clear pending timeouts on unmount
- Added test for cleanup behavior

## Related Issues
Fixes #123

## Testing
- [x] Unit tests pass
- [x] Manual testing in dev environment
- [x] Tested in Safari, Chrome, Firefox

## Screenshots (if UI change)
Before: [image]
After: [image]
```

### Building Reputation

```javascript
const reputationBuilding = {
  // Consistency > intensity
  contribute: 'Small regular contributions > rare big ones',
  
  // Be helpful
  answerQuestions: 'Stack Overflow, Discord, GitHub Discussions',
  
  // Share knowledge
  write: 'Blog posts, tutorials',
  speak: 'Meetups, conferences',
  
  // Create
  sideProjects: 'Tools others find useful',
  libraries: 'Solve problems you know well',
  
  // Network
  community: 'Engage genuinely, not transactionally'
};
```

### Creating Your Own Projects

```json
// Essential files for open source project:
{
  "files": [
    "README.md",         // Clear description, install, usage
    "LICENSE",           // MIT recommended for maximum adoption
    "CONTRIBUTING.md",   // How to contribute
    "CODE_OF_CONDUCT.md",// Expected behavior
    ".github/ISSUE_TEMPLATE/",
    ".github/PULL_REQUEST_TEMPLATE.md"
  ],
  "setup": [
    "CI/CD pipeline",
    "Automated tests",
    "Automated releases (semantic-release)",
    "Documentation site"
  ]
}
```

---

## 5.6 Summary

| Area | Key Actions |
|------|-------------|
| **Learning** | Active practice, spaced repetition, teach others |
| **Interviews** | LeetCode, system design, STAR stories |
| **Code Quality** | Thoughtful reviews, documentation, testing |
| **Leadership** | Mentor, document decisions, communicate trade-offs |
| **Open Source** | Start small, be consistent, build reputation |

### Career Checklist

- [ ] Clear learning roadmap with milestones
- [ ] Regular practice (coding challenges, projects)
- [ ] Active GitHub profile (contributions visible)
- [ ] Professional presence (LinkedIn, personal site)
- [ ] Portfolio of projects demonstrating skills
- [ ] Network in developer communities
- [ ] Mentor/be mentored
- [ ] Share knowledge (blog, talks, teaching)
- [ ] Stay current with industry trends
- [ ] Build soft skills (communication, collaboration)

---

**End of Module 5: Career Development**

This completes Section VI: Advanced Topics and Best Practices.

---

# Congratulations!

You've completed the JavaScript Mastery Guide. You now have deep knowledge of:

- **ECMAScript**: The language specification and all its features
- **Browser APIs**: DOM, events, storage, multimedia, and more
- **Node.js**: Server-side JavaScript and its ecosystem
- **Build Tools**: Modern development environment
- **Browser Extensions**: Chrome and Firefox extension development
- **Advanced Topics**: Architecture, performance, security, deployment, and career growth

Keep learning, keep building, and keep sharing knowledge with others.

**Happy coding!**
