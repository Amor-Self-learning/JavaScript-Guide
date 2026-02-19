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
