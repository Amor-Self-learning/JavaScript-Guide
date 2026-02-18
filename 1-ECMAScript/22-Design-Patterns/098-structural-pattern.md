# Structural Patterns

## Table of Contents

- [Decorator Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#decorator-pattern)
- [Facade Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#facade-pattern)
- [Flyweight Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#flyweight-pattern)
- [Adapter Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#adapter-pattern)
- [Proxy Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#proxy-pattern)
- [Composite Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#composite-pattern)
- [Bridge Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#bridge-pattern)

---

## Structural Patterns

Structural patterns deal with object composition, creating relationships between objects to form larger structures while keeping these structures flexible and efficient.

---

## Decorator Pattern

The Decorator Pattern dynamically adds new functionality to objects without modifying their structure.

### Basic Decorator

```javascript
// Base component
class Coffee {
  cost() {
    return 5;
  }
  
  description() {
    return 'Simple coffee';
  }
}

// Decorators
class MilkDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 2;
  }
  
  description() {
    return this.coffee.description() + ', milk';
  }
}

class SugarDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 1;
  }
  
  description() {
    return this.coffee.description() + ', sugar';
  }
}

class WhipDecorator {
  constructor(coffee) {
    this.coffee = coffee;
  }
  
  cost() {
    return this.coffee.cost() + 3;
  }
  
  description() {
    return this.coffee.description() + ', whipped cream';
  }
}

// Usage
let myCoffee = new Coffee();
console.log(myCoffee.description(), '-', myCoffee.cost()); // "Simple coffee - 5"

myCoffee = new MilkDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // "Simple coffee, milk - 7"

myCoffee = new SugarDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // "Simple coffee, milk, sugar - 8"

myCoffee = new WhipDecorator(myCoffee);
console.log(myCoffee.description(), '-', myCoffee.cost()); // "Simple coffee, milk, sugar, whipped cream - 11"
```

### Functional Decorator

```javascript
// Base function
function logMessage(message) {
  console.log(message);
}

// Decorators
function withTimestamp(fn) {
  return function(message) {
    const timestamp = new Date().toISOString();
    fn(`[${timestamp}] ${message}`);
  };
}

function withUpperCase(fn) {
  return function(message) {
    fn(message.toUpperCase());
  };
}

function withPrefix(prefix) {
  return function(fn) {
    return function(message) {
      fn(`${prefix}: ${message}`);
    };
  };
}

// Usage
let logger = logMessage;
logger('Hello'); // "Hello"

logger = withTimestamp(logger);
logger('Hello'); // "[2024-02-10T...] Hello"

logger = withUpperCase(logger);
logger('Hello'); // "[2024-02-10T...] HELLO"

logger = withPrefix('INFO')(logger);
logger('Hello'); // "INFO: [2024-02-10T...] HELLO"
```

### Class Method Decorator

```javascript
class User {
  constructor(name) {
    this.name = name;
  }
  
  save() {
    console.log(`Saving user: ${this.name}`);
  }
}

// Decorator function
function withLogging(target, key, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    console.log(`Calling ${key} with`, args);
    const result = original.apply(this, args);
    console.log(`${key} completed`);
    return result;
  };
  
  return descriptor;
}

function withValidation(target, key, descriptor) {
  const original = descriptor.value;
  
  descriptor.value = function(...args) {
    if (!this.name) {
      throw new Error('Name is required');
    }
    return original.apply(this, args);
  };
  
  return descriptor;
}

// Apply decorators manually (or use @decorator syntax with transpiler)
Object.defineProperty(
  User.prototype,
  'save',
  withValidation(User.prototype, 'save', 
    withLogging(User.prototype, 'save', 
      Object.getOwnPropertyDescriptor(User.prototype, 'save')
    )
  )
);

const user = new User('Alice');
user.save();
// "Calling save with []"
// "Saving user: Alice"
// "save completed"
```

### UI Component Decorator

```javascript
// Base component
class Component {
  render() {
    return '<div>Base Component</div>';
  }
}

// Decorators
class BorderDecorator {
  constructor(component, style = 'solid') {
    this.component = component;
    this.style = style;
  }
  
  render() {
    const content = this.component.render();
    return `<div style="border: 2px ${this.style} black">${content}</div>`;
  }
}

class ColorDecorator {
  constructor(component, color) {
    this.component = component;
    this.color = color;
  }
  
  render() {
    const content = this.component.render();
    return `<div style="background-color: ${this.color}">${content}</div>`;
  }
}

class ShadowDecorator {
  constructor(component) {
    this.component = component;
  }
  
  render() {
    const content = this.component.render();
    return `<div style="box-shadow: 2px 2px 5px gray">${content}</div>`;
  }
}

// Usage
let component = new Component();
console.log(component.render());
// "<div>Base Component</div>"

component = new BorderDecorator(component, 'dashed');
component = new ColorDecorator(component, 'lightblue');
component = new ShadowDecorator(component);

console.log(component.render());
// Nested divs with all styles applied
```

---

## Facade Pattern

The Facade Pattern provides a simplified interface to a complex subsystem.

### Basic Facade

```javascript
// Complex subsystem
class CPU {
  freeze() {
    console.log('CPU: Freezing...');
  }
  
  jump(position) {
    console.log(`CPU: Jumping to ${position}`);
  }
  
  execute() {
    console.log('CPU: Executing...');
  }
}

class Memory {
  load(position, data) {
    console.log(`Memory: Loading data at ${position}`);
  }
}

class HardDrive {
  read(sector, size) {
    console.log(`HardDrive: Reading ${size} bytes from sector ${sector}`);
    return 'boot data';
  }
}

// Facade
class ComputerFacade {
  constructor() {
    this.cpu = new CPU();
    this.memory = new Memory();
    this.hardDrive = new HardDrive();
  }
  
  start() {
    console.log('Starting computer...');
    this.cpu.freeze();
    const bootData = this.hardDrive.read(0, 1024);
    this.memory.load(0, bootData);
    this.cpu.jump(0);
    this.cpu.execute();
    console.log('Computer started!');
  }
}

// Usage - Simple interface to complex operation
const computer = new ComputerFacade();
computer.start();
```

### API Facade

```javascript
// Complex APIs
class UserAPI {
  async getUser(id) {
    console.log(`Fetching user ${id}`);
    return { id, name: 'Alice', email: 'alice@example.com' };
  }
}

class OrderAPI {
  async getOrders(userId) {
    console.log(`Fetching orders for user ${userId}`);
    return [
      { id: 1, total: 100 },
      { id: 2, total: 200 }
    ];
  }
}

class PaymentAPI {
  async getPaymentMethods(userId) {
    console.log(`Fetching payment methods for user ${userId}`);
    return [
      { type: 'credit_card', last4: '1234' },
      { type: 'paypal', email: 'alice@example.com' }
    ];
  }
}

// Facade
class UserProfileFacade {
  constructor() {
    this.userAPI = new UserAPI();
    this.orderAPI = new OrderAPI();
    this.paymentAPI = new PaymentAPI();
  }
  
  async getCompleteProfile(userId) {
    try {
      const [user, orders, paymentMethods] = await Promise.all([
        this.userAPI.getUser(userId),
        this.orderAPI.getOrders(userId),
        this.paymentAPI.getPaymentMethods(userId)
      ]);
      
      return {
        user,
        orders,
        paymentMethods,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0)
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
}

// Usage - Single call instead of multiple API calls
async function displayProfile() {
  const facade = new UserProfileFacade();
  const profile = await facade.getCompleteProfile(1);
  console.log('Profile:', profile);
}
```

### DOM Manipulation Facade

```javascript
// Facade for cross-browser DOM manipulation
class DOMFacade {
  constructor(selector) {
    this.element = document.querySelector(selector);
  }
  
  // Simplified event handling
  on(event, handler) {
    if (this.element.addEventListener) {
      this.element.addEventListener(event, handler, false);
    } else if (this.element.attachEvent) {
      // IE8 and below
      this.element.attachEvent(`on${event}`, handler);
    }
    return this;
  }
  
  // Simplified styling
  css(property, value) {
    if (typeof property === 'object') {
      for (const key in property) {
        this.element.style[key] = property[key];
      }
    } else {
      this.element.style[property] = value;
    }
    return this;
  }
  
  // Simplified class manipulation
  addClass(className) {
    if (this.element.classList) {
      this.element.classList.add(className);
    } else {
      this.element.className += ` ${className}`;
    }
    return this;
  }
  
  removeClass(className) {
    if (this.element.classList) {
      this.element.classList.remove(className);
    } else {
      this.element.className = this.element.className
        .replace(new RegExp(`\\b${className}\\b`, 'g'), '');
    }
    return this;
  }
  
  // Simplified content manipulation
  html(content) {
    if (content !== undefined) {
      this.element.innerHTML = content;
      return this;
    }
    return this.element.innerHTML;
  }
  
  // Simplified AJAX
  static ajax(options) {
    const xhr = new XMLHttpRequest();
    
    xhr.open(options.method || 'GET', options.url, true);
    
    if (options.headers) {
      for (const key in options.headers) {
        xhr.setRequestHeader(key, options.headers[key]);
      }
    }
    
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        options.success?.(JSON.parse(xhr.responseText));
      } else {
        options.error?.(xhr.statusText);
      }
    };
    
    xhr.onerror = function() {
      options.error?.(xhr.statusText);
    };
    
    xhr.send(options.data ? JSON.stringify(options.data) : null);
  }
}

// Usage
const element = new DOMFacade('#myElement');
element
  .css({ color: 'red', fontSize: '16px' })
  .addClass('active')
  .html('<p>Hello World</p>')
  .on('click', () => console.log('Clicked!'));

DOMFacade.ajax({
  url: '/api/data',
  method: 'GET',
  success: (data) => console.log('Data:', data),
  error: (error) => console.error('Error:', error)
});
```

---

## Flyweight Pattern

The Flyweight Pattern minimizes memory usage by sharing data among similar objects.

### Basic Flyweight

```javascript
// Flyweight class (shared state)
class TreeType {
  constructor(name, color, texture) {
    this.name = name;
    this.color = color;
    this.texture = texture;
  }
  
  draw(canvas, x, y) {
    console.log(`Drawing ${this.name} tree at (${x}, ${y})`);
    // Draw tree using shared type data
  }
}

// Flyweight Factory
class TreeFactory {
  constructor() {
    this.treeTypes = new Map();
  }
  
  getTreeType(name, color, texture) {
    const key = `${name}_${color}_${texture}`;
    
    if (!this.treeTypes.has(key)) {
      console.log(`Creating new tree type: ${key}`);
      this.treeTypes.set(key, new TreeType(name, color, texture));
    }
    
    return this.treeTypes.get(key);
  }
  
  getTreeTypeCount() {
    return this.treeTypes.size;
  }
}

// Context class (unique state)
class Tree {
  constructor(x, y, treeType) {
    this.x = x;
    this.y = y;
    this.treeType = treeType; // Shared flyweight
  }
  
  draw(canvas) {
    this.treeType.draw(canvas, this.x, this.y);
  }
}

// Forest class
class Forest {
  constructor() {
    this.trees = [];
    this.treeFactory = new TreeFactory();
  }
  
  plantTree(x, y, name, color, texture) {
    const type = this.treeFactory.getTreeType(name, color, texture);
    const tree = new Tree(x, y, type);
    this.trees.push(tree);
  }
  
  draw(canvas) {
    this.trees.forEach(tree => tree.draw(canvas));
  }
  
  getStats() {
    return {
      totalTrees: this.trees.length,
      treeTypes: this.treeFactory.getTreeTypeCount(),
      memoryPerTree: 'Only x,y coordinates',
      sharedMemory: 'name, color, texture shared via flyweight'
    };
  }
}

// Usage
const forest = new Forest();

// Plant 1000 trees
for (let i = 0; i < 1000; i++) {
  const x = Math.random() * 1000;
  const y = Math.random() * 1000;
  
  // Only 3 tree types, but 1000 tree instances
  const types = [
    ['Oak', 'green', 'oak_texture'],
    ['Pine', 'dark_green', 'pine_texture'],
    ['Birch', 'white', 'birch_texture']
  ];
  
  const [name, color, texture] = types[i % 3];
  forest.plantTree(x, y, name, color, texture);
}

console.log(forest.getStats());
// Only 3 TreeType objects created, shared by 1000 Tree instances
```

### Particle System Flyweight

```javascript
// Flyweight - Shared particle type
class ParticleType {
  constructor(color, sprite, size) {
    this.color = color;
    this.sprite = sprite;
    this.size = size;
  }
  
  render(context, x, y, velocity) {
    // Render particle using shared properties
    context.fillStyle = this.color;
    context.fillRect(x, y, this.size, this.size);
  }
}

// Flyweight Factory
class ParticleTypeFactory {
  constructor() {
    this.types = new Map();
  }
  
  getType(color, sprite, size) {
    const key = `${color}_${sprite}_${size}`;
    
    if (!this.types.has(key)) {
      this.types.set(key, new ParticleType(color, sprite, size));
    }
    
    return this.types.get(key);
  }
}

// Context - Unique particle state
class Particle {
  constructor(x, y, velocity, type) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    this.type = type; // Shared flyweight
  }
  
  update(deltaTime) {
    this.x += this.velocity.x * deltaTime;
    this.y += this.velocity.y * deltaTime;
  }
  
  render(context) {
    this.type.render(context, this.x, this.y, this.velocity);
  }
}

// Particle System
class ParticleSystem {
  constructor() {
    this.particles = [];
    this.typeFactory = new ParticleTypeFactory();
  }
  
  createParticle(x, y, velocityX, velocityY, color, sprite, size) {
    const type = this.typeFactory.getType(color, sprite, size);
    const particle = new Particle(
      x, y,
      { x: velocityX, y: velocityY },
      type
    );
    this.particles.push(particle);
  }
  
  update(deltaTime) {
    this.particles.forEach(particle => particle.update(deltaTime));
    
    // Remove off-screen particles
    this.particles = this.particles.filter(p => 
      p.x >= 0 && p.x <= 800 && p.y >= 0 && p.y <= 600
    );
  }
  
  render(context) {
    this.particles.forEach(particle => particle.render(context));
  }
}

// Usage
const particleSystem = new ParticleSystem();

// Create 10000 particles with only a few types
for (let i = 0; i < 10000; i++) {
  const colors = ['red', 'blue', 'green', 'yellow'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  particleSystem.createParticle(
    Math.random() * 800,
    Math.random() * 600,
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    color,
    'circle',
    5
  );
}

// Only 4 ParticleType objects created, shared by 10000 particles
```

### String Interning (Flyweight)

```javascript
class StringPool {
  constructor() {
    this.pool = new Map();
    this.stats = { total: 0, unique: 0 };
  }
  
  intern(str) {
    this.stats.total++;
    
    if (!this.pool.has(str)) {
      this.pool.set(str, str);
      this.stats.unique++;
    }
    
    return this.pool.get(str);
  }
  
  getStats() {
    const memorySaved = (this.stats.total - this.stats.unique) * 
                       50; // Assume avg 50 bytes per string
    
    return {
      totalStrings: this.stats.total,
      uniqueStrings: this.stats.unique,
      duplicates: this.stats.total - this.stats.unique,
      memorySavedBytes: memorySaved
    };
  }
}

// Usage
const stringPool = new StringPool();

// Create many objects with duplicate strings
const users = [];

for (let i = 0; i < 10000; i++) {
  users.push({
    id: i,
    country: stringPool.intern('USA'), // Shared
    language: stringPool.intern('English'), // Shared
    currency: stringPool.intern('USD'), // Shared
    timezone: stringPool.intern('EST') // Shared
  });
}

console.log(stringPool.getStats());
// Only 4 unique strings stored, used 40000 times
```

---

## Adapter Pattern

The Adapter Pattern allows incompatible interfaces to work together by converting one interface into another.

### Basic Adapter

```javascript
// Old interface
class OldCalculator {
  operation(num1, num2, operation) {
    switch (operation) {
      case 'add':
        return num1 + num2;
      case 'subtract':
        return num1 - num2;
      default:
        return 0;
    }
  }
}

// New interface
class NewCalculator {
  add(num1, num2) {
    return num1 + num2;
  }
  
  subtract(num1, num2) {
    return num1 - num2;
  }
}

// Adapter
class CalculatorAdapter {
  constructor() {
    this.calculator = new NewCalculator();
  }
  
  operation(num1, num2, operation) {
    switch (operation) {
      case 'add':
        return this.calculator.add(num1, num2);
      case 'subtract':
        return this.calculator.subtract(num1, num2);
      default:
        return 0;
    }
  }
}

// Usage - Can use new calculator with old interface
const calculator = new CalculatorAdapter();
console.log(calculator.operation(5, 3, 'add')); // 8
console.log(calculator.operation(5, 3, 'subtract')); // 2
```

### API Adapter

```javascript
// Old API format
class OldAPI {
  getData() {
    return {
      fullname: 'Alice Smith',
      emailaddress: 'alice@example.com',
      phonenumber: '123-456-7890'
    };
  }
}

// New API format expected by application
class NewAPIFormat {
  getUserData() {
    return {
      name: { first: 'Alice', last: 'Smith' },
      contact: {
        email: 'alice@example.com',
        phone: '123-456-7890'
      }
    };
  }
}

// Adapter
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }
  
  getUserData() {
    const oldData = this.oldAPI.getData();
    const [firstName, lastName] = oldData.fullname.split(' ');
    
    return {
      name: {
        first: firstName,
        last: lastName
      },
      contact: {
        email: oldData.emailaddress,
        phone: oldData.phonenumber
      }
    };
  }
}

// Usage
const oldAPI = new OldAPI();
const adapter = new APIAdapter(oldAPI);
const userData = adapter.getUserData();

console.log(userData);
// { name: { first: 'Alice', last: 'Smith' }, contact: { ... } }
```

### Payment Gateway Adapter

```javascript
// Different payment gateways with different interfaces

// Stripe
class Stripe {
  makePayment(amount, currency) {
    console.log(`Stripe: Processing ${amount} ${currency}`);
    return { success: true, transactionId: 'stripe_123' };
  }
}

// PayPal
class PayPal {
  processPayment(paymentInfo) {
    console.log(`PayPal: Processing ${paymentInfo.amount} ${paymentInfo.currency}`);
    return { status: 'success', id: 'paypal_456' };
  }
}

// Square
class Square {
  charge(chargeAmount, chargeCurrency) {
    console.log(`Square: Charging ${chargeAmount} ${chargeCurrency}`);
    return { charged: true, reference: 'square_789' };
  }
}

// Unified interface
class PaymentAdapter {
  constructor(gateway) {
    this.gateway = gateway;
  }
  
  pay(amount, currency) {
    if (this.gateway instanceof Stripe) {
      return this.adaptStripe(amount, currency);
    } else if (this.gateway instanceof PayPal) {
      return this.adaptPayPal(amount, currency);
    } else if (this.gateway instanceof Square) {
      return this.adaptSquare(amount, currency);
    }
    throw new Error('Unsupported payment gateway');
  }
  
  adaptStripe(amount, currency) {
    const result = this.gateway.makePayment(amount, currency);
    return {
      success: result.success,
      transactionId: result.transactionId
    };
  }
  
  adaptPayPal(amount, currency) {
    const result = this.gateway.processPayment({ amount, currency });
    return {
      success: result.status === 'success',
      transactionId: result.id
    };
  }
  
  adaptSquare(amount, currency) {
    const result = this.gateway.charge(amount, currency);
    return {
      success: result.charged,
      transactionId: result.reference
    };
  }
}

// Usage - Same interface for all gateways
function processPayment(gateway, amount, currency) {
  const adapter = new PaymentAdapter(gateway);
  const result = adapter.pay(amount, currency);
  console.log('Payment result:', result);
}

processPayment(new Stripe(), 100, 'USD');
processPayment(new PayPal(), 200, 'EUR');
processPayment(new Square(), 300, 'GBP');
```

### Data Format Adapter

```javascript
// XML to JSON adapter
class XMLParser {
  parse(xml) {
    // Simplified XML parsing
    return {
      type: 'xml',
      raw: xml,
      data: { name: 'Alice', age: 30 }
    };
  }
}

class JSONAdapter {
  constructor(xmlParser) {
    this.xmlParser = xmlParser;
  }
  
  parse(xml) {
    const xmlData = this.xmlParser.parse(xml);
    
    // Convert to standard JSON format
    return {
      type: 'json',
      data: xmlData.data
    };
  }
}

// Usage
const xmlParser = new XMLParser();
const adapter = new JSONAdapter(xmlParser);

const json = adapter.parse('<user><name>Alice</name><age>30</age></user>');
console.log(json);
// { type: 'json', data: { name: 'Alice', age: 30 } }
```

---

## Proxy Pattern

The Proxy Pattern provides a surrogate or placeholder for another object to control access to it.

### Virtual Proxy (Lazy Loading)

```javascript
// Real subject - Expensive to create
class HighResolutionImage {
  constructor(filename) {
    this.filename = filename;
    this.loadImage();
  }
  
  loadImage() {
    console.log(`Loading high-resolution image: ${this.filename}`);
    // Simulate expensive loading operation
    this.data = `[Image data for ${this.filename}]`;
  }
  
  display() {
    console.log(`Displaying ${this.filename}`);
  }
}

// Proxy - Delays loading until needed
class ImageProxy {
  constructor(filename) {
    this.filename = filename;
    this.image = null;
  }
  
  display() {
    if (!this.image) {
      console.log('Creating real image on first access');
      this.image = new HighResolutionImage(this.filename);
    }
    this.image.display();
  }
}

// Usage
const image1 = new ImageProxy('photo1.jpg');
const image2 = new ImageProxy('photo2.jpg');

console.log('Images created (not loaded yet)');

image1.display(); // Loads and displays
image1.display(); // Just displays (already loaded)
```

### Protection Proxy (Access Control)

```javascript
// Real subject
class BankAccount {
  constructor(balance) {
    this.balance = balance;
  }
  
  deposit(amount) {
    this.balance += amount;
    console.log(`Deposited ${amount}. New balance: ${this.balance}`);
  }
  
  withdraw(amount) {
    if (amount > this.balance) {
      console.log('Insufficient funds');
      return false;
    }
    this.balance -= amount;
    console.log(`Withdrew ${amount}. New balance: ${this.balance}`);
    return true;
  }
  
  getBalance() {
    return this.balance;
  }
}

// Proxy with access control
class SecureBankAccountProxy {
  constructor(balance, pin) {
    this.account = new BankAccount(balance);
    this.pin = pin;
  }
  
  authenticate(pin) {
    return pin === this.pin;
  }
  
  deposit(amount, pin) {
    if (!this.authenticate(pin)) {
      console.log('Authentication failed');
      return false;
    }
    this.account.deposit(amount);
    return true;
  }
  
  withdraw(amount, pin) {
    if (!this.authenticate(pin)) {
      console.log('Authentication failed');
      return false;
    }
    return this.account.withdraw(amount);
  }
  
  getBalance(pin) {
    if (!this.authenticate(pin)) {
      console.log('Authentication failed');
      return null;
    }
    return this.account.getBalance();
  }
}

// Usage
const account = new SecureBankAccountProxy(1000, '1234');

account.deposit(500, '1234'); // Success
account.withdraw(200, '1234'); // Success
console.log(account.getBalance('1234')); // 1300

account.withdraw(100, 'wrong'); // Authentication failed
```

### Caching Proxy

```javascript
// Real subject - Expensive API calls
class DataAPI {
  fetchData(id) {
    console.log(`Fetching data from API for id: ${id}`);
    // Simulate API call
    return {
      id,
      data: `Data for ${id}`,
      timestamp: Date.now()
    };
  }
}

// Caching proxy
class CachingAPIProxy {
  constructor() {
    this.api = new DataAPI();
    this.cache = new Map();
    this.cacheDuration = 5000; // 5 seconds
  }
  
  fetchData(id) {
    const cached = this.cache.get(id);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log(`Returning cached data for id: ${id}`);
      return cached.data;
    }
    
    console.log('Cache miss or expired');
    const data = this.api.fetchData(id);
    this.cache.set(id, { data, timestamp: Date.now() });
    
    return data;
  }
  
  clearCache() {
    this.cache.clear();
    console.log('Cache cleared');
  }
}

// Usage
const api = new CachingAPIProxy();

api.fetchData(1); // Fetches from API
api.fetchData(1); // Returns from cache
api.fetchData(2); // Fetches from API

setTimeout(() => {
  api.fetchData(1); // Cache expired, fetches again
}, 6000);
```

### Logging Proxy

```javascript
// Real subject
class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
  
  multiply(a, b) {
    return a * b;
  }
  
  divide(a, b) {
    if (b === 0) throw new Error('Division by zero');
    return a / b;
  }
}

// Logging proxy using Proxy object
function createLoggingProxy(target) {
  return new Proxy(target, {
    get(target, property) {
      if (typeof target[property] === 'function') {
        return function(...args) {
          console.log(`Calling ${property} with args:`, args);
          const start = performance.now();
          
          try {
            const result = target[property].apply(target, args);
            const duration = performance.now() - start;
            console.log(`${property} returned:`, result, `(${duration.toFixed(2)}ms)`);
            return result;
          } catch (error) {
            console.error(`${property} threw error:`, error.message);
            throw error;
          }
        };
      }
      return target[property];
    }
  });
}

// Usage
const calculator = new Calculator();
const loggingCalc = createLoggingProxy(calculator);

loggingCalc.add(5, 3);
// Calling add with args: [5, 3]
// add returned: 8 (0.05ms)

loggingCalc.divide(10, 2);
// Calling divide with args: [10, 2]
// divide returned: 5 (0.03ms)
```

---

## Composite Pattern

The Composite Pattern composes objects into tree structures to represent part-whole hierarchies.

### Basic Composite

```javascript
// Component interface
class FileSystemComponent {
  constructor(name) {
    this.name = name;
  }
  
  getSize() {
    throw new Error('getSize must be implemented');
  }
  
  display(indent = 0) {
    throw new Error('display must be implemented');
  }
}

// Leaf
class File extends FileSystemComponent {
  constructor(name, size) {
    super(name);
    this.size = size;
  }
  
  getSize() {
    return this.size;
  }
  
  display(indent = 0) {
    console.log(`${' '.repeat(indent)}📄 ${this.name} (${this.size}KB)`);
  }
}

// Composite
class Directory extends FileSystemComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }
  
  add(component) {
    this.children.push(component);
    return this;
  }
  
  remove(component) {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return this;
  }
  
  getSize() {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }
  
  display(indent = 0) {
    console.log(`${' '.repeat(indent)}📁 ${this.name}/`);
    this.children.forEach(child => child.display(indent + 2));
  }
}

// Usage
const root = new Directory('root');

const documents = new Directory('documents');
documents.add(new File('resume.pdf', 100));
documents.add(new File('cover-letter.pdf', 50));

const photos = new Directory('photos');
photos.add(new File('vacation.jpg', 2000));
photos.add(new File('family.jpg', 1500));

const videos = new Directory('videos');
videos.add(new File('tutorial.mp4', 50000));

root.add(documents);
root.add(photos);
root.add(videos);
root.add(new File('readme.txt', 5));

root.display();
console.log(`Total size: ${root.getSize()}KB`);
```

### UI Component Composite

```javascript
// Component
class UIComponent {
  constructor(name) {
    this.name = name;
  }
  
  render() {
    throw new Error('render must be implemented');
  }
  
  getHTML() {
    throw new Error('getHTML must be implemented');
  }
}

// Leaf components
class Button extends UIComponent {
  constructor(name, text) {
    super(name);
    this.text = text;
  }
  
  render() {
    return `<button>${this.text}</button>`;
  }
  
  getHTML() {
    return this.render();
  }
}

class Input extends UIComponent {
  constructor(name, type, placeholder) {
    super(name);
    this.type = type;
    this.placeholder = placeholder;
  }
  
  render() {
    return `<input type="${this.type}" placeholder="${this.placeholder}" />`;
  }
  
  getHTML() {
    return this.render();
  }
}

class Label extends UIComponent {
  constructor(name, text) {
    super(name);
    this.text = text;
  }
  
  render() {
    return `<label>${this.text}</label>`;
  }
  
  getHTML() {
    return this.render();
  }
}

// Composite
class Panel extends UIComponent {
  constructor(name) {
    super(name);
    this.children = [];
  }
  
  add(component) {
    this.children.push(component);
    return this;
  }
  
  remove(component) {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
    }
    return this;
  }
  
  render() {
    const childrenHTML = this.children
      .map(child => child.getHTML())
      .join('\n    ');
    
    return `<div class="panel">
    ${childrenHTML}
  </div>`;
  }
  
  getHTML() {
    return this.render();
  }
}

// Usage
const form = new Panel('loginForm');

const usernameGroup = new Panel('usernameGroup');
usernameGroup
  .add(new Label('usernameLabel', 'Username:'))
  .add(new Input('username', 'text', 'Enter username'));

const passwordGroup = new Panel('passwordGroup');
passwordGroup
  .add(new Label('passwordLabel', 'Password:'))
  .add(new Input('password', 'password', 'Enter password'));

form
  .add(usernameGroup)
  .add(passwordGroup)
  .add(new Button('submit', 'Login'));

console.log(form.getHTML());
```

### Organization Hierarchy

```javascript
// Component
class Employee {
  constructor(name, position) {
    this.name = name;
    this.position = position;
  }
  
  getDetails() {
    return `${this.name} (${this.position})`;
  }
  
  displayHierarchy(indent = 0) {
    console.log(`${' '.repeat(indent)}${this.getDetails()}`);
  }
}

// Composite
class Manager extends Employee {
  constructor(name, position) {
    super(name, position);
    this.subordinates = [];
  }
  
  addSubordinate(employee) {
    this.subordinates.push(employee);
    return this;
  }
  
  removeSubordinate(employee) {
    const index = this.subordinates.indexOf(employee);
    if (index > -1) {
      this.subordinates.splice(index, 1);
    }
    return this;
  }
  
  displayHierarchy(indent = 0) {
    console.log(`${' '.repeat(indent)}${this.getDetails()} [Manager]`);
    this.subordinates.forEach(subordinate => {
      subordinate.displayHierarchy(indent + 2);
    });
  }
  
  getTeamSize() {
    return this.subordinates.reduce(
      (sum, subordinate) => {
        const subSize = subordinate instanceof Manager 
          ? subordinate.getTeamSize() 
          : 1;
        return sum + subSize;
      },
      this.subordinates.length
    );
  }
}

// Usage
const ceo = new Manager('Alice', 'CEO');

const cto = new Manager('Bob', 'CTO');
cto.addSubordinate(new Employee('Charlie', 'Senior Developer'));
cto.addSubordinate(new Employee('David', 'Developer'));

const leadDev = new Manager('Eve', 'Lead Developer');
leadDev.addSubordinate(new Employee('Frank', 'Junior Developer'));
leadDev.addSubordinate(new Employee('Grace', 'Junior Developer'));
cto.addSubordinate(leadDev);

const cfo = new Manager('Henry', 'CFO');
cfo.addSubordinate(new Employee('Ivy', 'Accountant'));

ceo.addSubordinate(cto);
ceo.addSubordinate(cfo);

ceo.displayHierarchy();
console.log(`Total team size: ${ceo.getTeamSize()}`);
```

---

## Bridge Pattern

The Bridge Pattern separates abstraction from implementation, allowing them to vary independently.

### Basic Bridge

```javascript
// Implementor
class DrawingAPI {
  drawCircle(x, y, radius) {
    throw new Error('drawCircle must be implemented');
  }
}

// Concrete Implementors
class DrawingAPI1 extends DrawingAPI {
  drawCircle(x, y, radius) {
    console.log(`API1: Drawing circle at (${x}, ${y}) with radius ${radius}`);
  }
}

class DrawingAPI2 extends DrawingAPI {
  drawCircle(x, y, radius) {
    console.log(`API2: Circle[center=(${x}, ${y}), radius=${radius}]`);
  }
}

// Abstraction
class Shape {
  constructor(drawingAPI) {
    this.drawingAPI = drawingAPI;
  }
  
  draw() {
    throw new Error('draw must be implemented');
  }
  
  resize(factor) {
    throw new Error('resize must be implemented');
  }
}

// Refined Abstraction
class Circle extends Shape {
  constructor(x, y, radius, drawingAPI) {
    super(drawingAPI);
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
  
  draw() {
    this.drawingAPI.drawCircle(this.x, this.y, this.radius);
  }
  
  resize(factor) {
    this.radius *= factor;
  }
}

// Usage - Abstraction and implementation can vary independently
const circle1 = new Circle(5, 10, 15, new DrawingAPI1());
const circle2 = new Circle(20, 30, 25, new DrawingAPI2());

circle1.draw(); // Uses API1
circle2.draw(); // Uses API2

circle1.resize(2);
circle1.draw(); // Radius doubled, still uses API1
```

### Device Control Bridge

```javascript
// Implementation
class Device {
  isEnabled() {
    throw new Error('isEnabled must be implemented');
  }
  
  enable() {
    throw new Error('enable must be implemented');
  }
  
  disable() {
    throw new Error('disable must be implemented');
  }
  
  getVolume() {
    throw new Error('getVolume must be implemented');
  }
  
  setVolume(volume) {
    throw new Error('setVolume must be implemented');
  }
  
  getChannel() {
    throw new Error('getChannel must be implemented');
  }
  
  setChannel(channel) {
    throw new Error('setChannel must be implemented');
  }
}

// Concrete Implementations
class TV extends Device {
  constructor() {
    super();
    this.on = false;
    this.volume = 50;
    this.channel = 1;
  }
  
  isEnabled() {
    return this.on;
  }
  
  enable() {
    this.on = true;
    console.log('TV is now ON');
  }
  
  disable() {
    this.on = false;
    console.log('TV is now OFF');
  }
  
  getVolume() {
    return this.volume;
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    console.log(`TV volume: ${this.volume}`);
  }
  
  getChannel() {
    return this.channel;
  }
  
  setChannel(channel) {
    this.channel = channel;
    console.log(`TV channel: ${this.channel}`);
  }
}

class Radio extends Device {
  constructor() {
    super();
    this.on = false;
    this.volume = 30;
    this.channel = 1;
  }
  
  isEnabled() {
    return this.on;
  }
  
  enable() {
    this.on = true;
    console.log('Radio is now ON');
  }
  
  disable() {
    this.on = false;
    console.log('Radio is now OFF');
  }
  
  getVolume() {
    return this.volume;
  }
  
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(100, volume));
    console.log(`Radio volume: ${this.volume}`);
  }
  
  getChannel() {
    return this.channel;
  }
  
  setChannel(channel) {
    this.channel = channel;
    console.log(`Radio station: ${this.channel}`);
  }
}

// Abstraction
class RemoteControl {
  constructor(device) {
    this.device = device;
  }
  
  togglePower() {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }
  
  volumeUp() {
    this.device.setVolume(this.device.getVolume() + 10);
  }
  
  volumeDown() {
    this.device.setVolume(this.device.getVolume() - 10);
  }
  
  channelUp() {
    this.device.setChannel(this.device.getChannel() + 1);
  }
  
  channelDown() {
    this.device.setChannel(this.device.getChannel() - 1);
  }
}

// Refined Abstraction
class AdvancedRemoteControl extends RemoteControl {
  mute() {
    console.log('Muting device');
    this.device.setVolume(0);
  }
  
  setChannel(channel) {
    this.device.setChannel(channel);
  }
}

// Usage
const tv = new TV();
const radio = new Radio();

const tvRemote = new RemoteControl(tv);
const radioRemote = new AdvancedRemoteControl(radio);

tvRemote.togglePower(); // TV is now ON
tvRemote.volumeUp(); // TV volume: 60
tvRemote.channelUp(); // TV channel: 2

radioRemote.togglePower(); // Radio is now ON
radioRemote.setChannel(101); // Radio station: 101
radioRemote.mute(); // Radio volume: 0
```

---

## Summary

This document covered Structural Design Patterns:

- **Decorator Pattern**: Dynamically adding functionality (coffee decorators, functional decorators, UI components)
- **Facade Pattern**: Simplified interface to complex systems (computer boot, API facade, DOM manipulation)
- **Flyweight Pattern**: Sharing data to minimize memory (trees, particles, string interning)
- **Adapter Pattern**: Making incompatible interfaces work together (calculators, APIs, payment gateways, data formats)
- **Proxy Pattern**: Controlling access to objects (virtual proxy, protection proxy, caching proxy, logging proxy)
- **Composite Pattern**: Tree structures for part-whole hierarchies (file systems, UI components, organization hierarchy)
- **Bridge Pattern**: Separating abstraction from implementation (drawing APIs, device control)

These patterns help organize object relationships and create flexible, maintainable structures.

---

**Related Topics:**

- Behavioral Patterns
- Creational Patterns
- SOLID Principles
- Object Composition