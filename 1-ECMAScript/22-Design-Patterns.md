# 22 Design Patterns

Design patterns are reusable solutions to common programming problems. This chapter covers creational, structural, behavioral, functional, and async patterns in JavaScript.

---

# Creational Patterns

## Table of Contents

- [Factory Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#factory-pattern)
- [Constructor Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#constructor-pattern)
- [Singleton Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#singleton-pattern)
- [Prototype Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#prototype-pattern)
- [Builder Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#builder-pattern)
- [Module Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#module-pattern)

---

## Creational Patterns

Creational patterns deal with object creation mechanisms, trying to create objects in a manner suitable to the situation.

---

## Factory Pattern

The Factory Pattern creates objects without specifying the exact class to create. It provides an interface for creating objects.

### Simple Factory

```javascript
// Product classes
class Car {
  constructor(options) {
    this.type = 'car';
    this.doors = options.doors || 4;
    this.state = options.state || 'new';
    this.color = options.color || 'white';
  }
}

class Truck {
  constructor(options) {
    this.type = 'truck';
    this.doors = options.doors || 2;
    this.state = options.state || 'used';
    this.color = options.color || 'black';
    this.wheelSize = options.wheelSize || 'large';
  }
}

class Motorcycle {
  constructor(options) {
    this.type = 'motorcycle';
    this.state = options.state || 'new';
    this.color = options.color || 'red';
    this.engineSize = options.engineSize || '500cc';
  }
}

// Factory
class VehicleFactory {
  createVehicle(type, options = {}) {
    switch (type) {
      case 'car':
        return new Car(options);
      case 'truck':
        return new Truck(options);
      case 'motorcycle':
        return new Motorcycle(options);
      default:
        throw new Error('Unknown vehicle type');
    }
  }
}

// Usage
const factory = new VehicleFactory();

const car = factory.createVehicle('car', {
  color: 'blue',
  doors: 4
});

const truck = factory.createVehicle('truck', {
  color: 'red',
  wheelSize: 'large'
});

const motorcycle = factory.createVehicle('motorcycle', {
  engineSize: '1000cc'
});

console.log(car); // Car { type: 'car', doors: 4, color: 'blue', ... }
```

### Factory Method Pattern

```javascript
// Abstract creator
class VehicleFactory {
  createVehicle(options) {
    throw new Error('createVehicle must be implemented');
  }
}

// Concrete creators
class CarFactory extends VehicleFactory {
  createVehicle(options) {
    return new Car(options);
  }
}

class TruckFactory extends VehicleFactory {
  createVehicle(options) {
    return new Truck(options);
  }
}

// Usage
const carFactory = new CarFactory();
const truckFactory = new TruckFactory();

const sedan = carFactory.createVehicle({ doors: 4, color: 'silver' });
const pickupTruck = truckFactory.createVehicle({ wheelSize: 'medium' });
```

### Abstract Factory Pattern

```javascript
// Abstract product families
class Button {
  render() {
    throw new Error('render must be implemented');
  }
}

class Checkbox {
  render() {
    throw new Error('render must be implemented');
  }
}

// Concrete products - Windows
class WindowsButton extends Button {
  render() {
    return '<button class="windows">Windows Button</button>';
  }
}

class WindowsCheckbox extends Checkbox {
  render() {
    return '<input type="checkbox" class="windows" />';
  }
}

// Concrete products - Mac
class MacButton extends Button {
  render() {
    return '<button class="mac">Mac Button</button>';
  }
}

class MacCheckbox extends Checkbox {
  render() {
    return '<input type="checkbox" class="mac" />';
  }
}

// Abstract factory
class GUIFactory {
  createButton() {
    throw new Error('createButton must be implemented');
  }
  
  createCheckbox() {
    throw new Error('createCheckbox must be implemented');
  }
}

// Concrete factories
class WindowsFactory extends GUIFactory {
  createButton() {
    return new WindowsButton();
  }
  
  createCheckbox() {
    return new WindowsCheckbox();
  }
}

class MacFactory extends GUIFactory {
  createButton() {
    return new MacButton();
  }
  
  createCheckbox() {
    return new MacCheckbox();
  }
}

// Usage
function createUI(factory) {
  const button = factory.createButton();
  const checkbox = factory.createCheckbox();
  
  return {
    button: button.render(),
    checkbox: checkbox.render()
  };
}

const windowsFactory = new WindowsFactory();
const macFactory = new MacFactory();

console.log(createUI(windowsFactory));
// { button: '<button class="windows">...</button>', ... }

console.log(createUI(macFactory));
// { button: '<button class="mac">...</button>', ... }
```

### Practical Factory Example

```javascript
// User factory with different types
class User {
  constructor(name, permissions) {
    this.name = name;
    this.permissions = permissions;
  }
  
  hasPermission(permission) {
    return this.permissions.includes(permission);
  }
}

class UserFactory {
  createUser(name, type) {
    switch (type) {
      case 'admin':
        return new User(name, ['read', 'write', 'delete', 'admin']);
      case 'editor':
        return new User(name, ['read', 'write']);
      case 'viewer':
        return new User(name, ['read']);
      default:
        return new User(name, []);
    }
  }
}

// Usage
const factory = new UserFactory();

const admin = factory.createUser('Alice', 'admin');
const editor = factory.createUser('Bob', 'editor');
const viewer = factory.createUser('Charlie', 'viewer');

console.log(admin.hasPermission('delete')); // true
console.log(editor.hasPermission('delete')); // false
console.log(viewer.hasPermission('write')); // false
```

---

## Constructor Pattern

The Constructor Pattern uses constructor functions or ES6 classes to create objects.

### Function Constructor

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
  
  this.sayName = function() {
    console.log(this.name);
  };
}

const person1 = new Person('Alice', 30, 'Engineer');
const person2 = new Person('Bob', 25, 'Designer');

person1.sayName(); // "Alice"
```

### Constructor with Prototype

```javascript
function Person(name, age, job) {
  this.name = name;
  this.age = age;
  this.job = job;
}

// Shared methods on prototype
Person.prototype.sayName = function() {
  console.log(this.name);
};

Person.prototype.getDetails = function() {
  return `${this.name}, ${this.age}, ${this.job}`;
};

const person = new Person('Alice', 30, 'Engineer');
person.sayName(); // "Alice"
console.log(person.getDetails()); // "Alice, 30, Engineer"
```

### ES6 Class Constructor

```javascript
class Person {
  constructor(name, age, job) {
    this.name = name;
    this.age = age;
    this.job = job;
  }
  
  sayName() {
    console.log(this.name);
  }
  
  getDetails() {
    return `${this.name}, ${this.age}, ${this.job}`;
  }
  
  static create(name, age, job) {
    return new Person(name, age, job);
  }
}

const person = new Person('Alice', 30, 'Engineer');
person.sayName();

// Using static factory method
const person2 = Person.create('Bob', 25, 'Designer');
```

### Constructor with Private Properties

```javascript
class BankAccount {
  #balance;
  #pin;
  
  constructor(accountNumber, initialBalance, pin) {
    this.accountNumber = accountNumber;
    this.#balance = initialBalance;
    this.#pin = pin;
  }
  
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
      return true;
    }
    return false;
  }
  
  withdraw(amount, pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    
    this.#balance -= amount;
    return true;
  }
  
  getBalance(pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    return this.#balance;
  }
}

const account = new BankAccount('123456', 1000, '1234');
account.deposit(500);
console.log(account.getBalance('1234')); // 1500
// console.log(account.#balance); // SyntaxError: Private field
```

### Constructor with Validation

```javascript
class User {
  constructor(name, email, age) {
    // Validation
    if (!name || typeof name !== 'string') {
      throw new TypeError('Name must be a non-empty string');
    }
    
    if (!email || !email.includes('@')) {
      throw new TypeError('Invalid email address');
    }
    
    if (age < 0 || age > 150) {
      throw new RangeError('Age must be between 0 and 150');
    }
    
    this.name = name;
    this.email = email;
    this.age = age;
    this.createdAt = new Date();
  }
  
  toJSON() {
    return {
      name: this.name,
      email: this.email,
      age: this.age,
      createdAt: this.createdAt.toISOString()
    };
  }
}

const user = new User('Alice', 'alice@example.com', 30);
// const invalid = new User('', 'bad-email', -5); // Throws errors
```

---

## Singleton Pattern

The Singleton Pattern ensures a class has only one instance and provides a global point of access to it.

### Basic Singleton

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    
    this.data = {};
    Singleton.instance = this;
  }
  
  setData(key, value) {
    this.data[key] = value;
  }
  
  getData(key) {
    return this.data[key];
  }
}

const instance1 = new Singleton();
const instance2 = new Singleton();

console.log(instance1 === instance2); // true

instance1.setData('name', 'Alice');
console.log(instance2.getData('name')); // "Alice"
```

### Singleton with Private Constructor

```javascript
class Database {
  static #instance;
  
  constructor() {
    if (Database.#instance) {
      throw new Error('Use Database.getInstance()');
    }
    
    this.connection = null;
    Database.#instance = this;
  }
  
  static getInstance() {
    if (!Database.#instance) {
      Database.#instance = new Database();
    }
    return Database.#instance;
  }
  
  connect(connectionString) {
    this.connection = {
      string: connectionString,
      status: 'connected'
    };
    console.log('Connected to database');
  }
  
  query(sql) {
    if (!this.connection) {
      throw new Error('Not connected to database');
    }
    console.log('Executing query:', sql);
    return { results: [] };
  }
}

// Usage
const db1 = Database.getInstance();
const db2 = Database.getInstance();

console.log(db1 === db2); // true

db1.connect('mysql://localhost:3306/mydb');
db2.query('SELECT * FROM users'); // Works because same instance

// const db3 = new Database(); // Error: Use Database.getInstance()
```

### Lazy Singleton

```javascript
class ConfigManager {
  static #instance;
  
  constructor() {
    this.config = {};
  }
  
  static getInstance() {
    if (!ConfigManager.#instance) {
      console.log('Creating ConfigManager instance');
      ConfigManager.#instance = new ConfigManager();
    }
    return ConfigManager.#instance;
  }
  
  set(key, value) {
    this.config[key] = value;
  }
  
  get(key) {
    return this.config[key];
  }
}

// Instance only created when first needed
const config1 = ConfigManager.getInstance(); // Logs: "Creating..."
const config2 = ConfigManager.getInstance(); // No log (reuses instance)

config1.set('apiUrl', 'https://api.example.com');
console.log(config2.get('apiUrl')); // "https://api.example.com"
```

### Singleton Module Pattern

```javascript
// Using closure for singleton
const Logger = (function() {
  let instance;
  
  function createInstance() {
    const logs = [];
    
    return {
      log(message) {
        logs.push({
          message,
          timestamp: new Date()
        });
        console.log(`[${new Date().toISOString()}] ${message}`);
      },
      
      getLogs() {
        return [...logs];
      },
      
      clearLogs() {
        logs.length = 0;
      }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// Usage
const logger1 = Logger.getInstance();
const logger2 = Logger.getInstance();

logger1.log('First message');
logger2.log('Second message');

console.log(logger1 === logger2); // true
console.log(logger1.getLogs().length); // 2
```

---

## Prototype Pattern

The Prototype Pattern creates objects based on a template of an existing object through cloning.

### Basic Prototype

```javascript
const carPrototype = {
  init(model, year) {
    this.model = model;
    this.year = year;
  },
  
  getInfo() {
    return `${this.year} ${this.model}`;
  }
};

// Create objects from prototype
const car1 = Object.create(carPrototype);
car1.init('Toyota Camry', 2024);

const car2 = Object.create(carPrototype);
car2.init('Honda Accord', 2023);

console.log(car1.getInfo()); // "2024 Toyota Camry"
console.log(car2.getInfo()); // "2023 Honda Accord"
```

### Prototype with Clone Method

```javascript
class Person {
  constructor(name, age, address) {
    this.name = name;
    this.age = age;
    this.address = address;
  }
  
  clone() {
    // Deep clone
    return new Person(
      this.name,
      this.age,
      { ...this.address }
    );
  }
  
  display() {
    console.log(`${this.name}, ${this.age}, ${this.address.city}`);
  }
}

const original = new Person('Alice', 30, {
  city: 'New York',
  zip: '10001'
});

const clone = original.clone();
clone.name = 'Bob';
clone.address.city = 'Boston';

original.display(); // "Alice, 30, New York"
clone.display(); // "Bob, 30, Boston"
```

### Prototype Registry

```javascript
class PrototypeRegistry {
  constructor() {
    this.prototypes = new Map();
  }
  
  registerPrototype(name, prototype) {
    this.prototypes.set(name, prototype);
  }
  
  getPrototype(name) {
    const prototype = this.prototypes.get(name);
    if (!prototype) {
      throw new Error(`Prototype ${name} not found`);
    }
    return prototype;
  }
  
  createInstance(name) {
    const prototype = this.getPrototype(name);
    return Object.create(prototype);
  }
}

// Shape prototypes
const circlePrototype = {
  type: 'circle',
  radius: 0,
  
  init(radius) {
    this.radius = radius;
  },
  
  getArea() {
    return Math.PI * this.radius ** 2;
  }
};

const rectanglePrototype = {
  type: 'rectangle',
  width: 0,
  height: 0,
  
  init(width, height) {
    this.width = width;
    this.height = height;
  },
  
  getArea() {
    return this.width * this.height;
  }
};

// Usage
const registry = new PrototypeRegistry();
registry.registerPrototype('circle', circlePrototype);
registry.registerPrototype('rectangle', rectanglePrototype);

const circle = registry.createInstance('circle');
circle.init(5);
console.log(circle.getArea()); // 78.54

const rect = registry.createInstance('rectangle');
rect.init(4, 6);
console.log(rect.getArea()); // 24
```

### Deep Clone Pattern

```javascript
class DeepCloneable {
  clone() {
    // Simple deep clone using JSON (has limitations)
    return JSON.parse(JSON.stringify(this));
  }
  
  // Better deep clone
  deepClone() {
    const cloned = Object.create(Object.getPrototypeOf(this));
    
    for (const key of Object.keys(this)) {
      const value = this[key];
      
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          cloned[key] = value.map(item => 
            item && typeof item === 'object' ? 
            this.deepCloneObject(item) : item
          );
        } else if (value instanceof Date) {
          cloned[key] = new Date(value);
        } else {
          cloned[key] = this.deepCloneObject(value);
        }
      } else {
        cloned[key] = value;
      }
    }
    
    return cloned;
  }
  
  deepCloneObject(obj) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (value && typeof value === 'object') {
          cloned[key] = this.deepCloneObject(value);
        } else {
          cloned[key] = value;
        }
      }
    }
    return cloned;
  }
}

class GameCharacter extends DeepCloneable {
  constructor(name, stats) {
    super();
    this.name = name;
    this.stats = stats;
    this.inventory = [];
  }
}

const warrior = new GameCharacter('Warrior', {
  health: 100,
  strength: 80,
  defense: 60
});
warrior.inventory = ['sword', 'shield'];

const clone = warrior.deepClone();
clone.name = 'Clone Warrior';
clone.stats.health = 150;
clone.inventory.push('potion');

console.log(warrior.stats.health); // 100 (unchanged)
console.log(clone.stats.health); // 150
console.log(warrior.inventory.length); // 2
console.log(clone.inventory.length); // 3
```

---

## Builder Pattern

The Builder Pattern constructs complex objects step by step. It separates construction from representation.

### Basic Builder

```javascript
class Car {
  constructor() {
    this.make = '';
    this.model = '';
    this.year = 0;
    this.color = '';
    this.features = [];
  }
}

class CarBuilder {
  constructor() {
    this.car = new Car();
  }
  
  setMake(make) {
    this.car.make = make;
    return this; // Enable chaining
  }
  
  setModel(model) {
    this.car.model = model;
    return this;
  }
  
  setYear(year) {
    this.car.year = year;
    return this;
  }
  
  setColor(color) {
    this.car.color = color;
    return this;
  }
  
  addFeature(feature) {
    this.car.features.push(feature);
    return this;
  }
  
  build() {
    return this.car;
  }
}

// Usage
const car = new CarBuilder()
  .setMake('Toyota')
  .setModel('Camry')
  .setYear(2024)
  .setColor('Blue')
  .addFeature('Sunroof')
  .addFeature('Leather Seats')
  .addFeature('Navigation')
  .build();

console.log(car);
```

### Director Pattern

```javascript
class Computer {
  constructor() {
    this.cpu = '';
    this.ram = 0;
    this.storage = 0;
    this.gpu = '';
  }
  
  display() {
    console.log(`CPU: ${this.cpu}, RAM: ${this.ram}GB, Storage: ${this.storage}GB, GPU: ${this.gpu}`);
  }
}

class ComputerBuilder {
  constructor() {
    this.computer = new Computer();
  }
  
  setCPU(cpu) {
    this.computer.cpu = cpu;
    return this;
  }
  
  setRAM(ram) {
    this.computer.ram = ram;
    return this;
  }
  
  setStorage(storage) {
    this.computer.storage = storage;
    return this;
  }
  
  setGPU(gpu) {
    this.computer.gpu = gpu;
    return this;
  }
  
  build() {
    return this.computer;
  }
}

// Director - defines standard configurations
class ComputerDirector {
  constructor(builder) {
    this.builder = builder;
  }
  
  buildGamingComputer() {
    return this.builder
      .setCPU('Intel i9')
      .setRAM(32)
      .setStorage(2000)
      .setGPU('NVIDIA RTX 4090')
      .build();
  }
  
  buildOfficeComputer() {
    return this.builder
      .setCPU('Intel i5')
      .setRAM(16)
      .setStorage(512)
      .setGPU('Integrated')
      .build();
  }
  
  buildBudgetComputer() {
    return this.builder
      .setCPU('Intel i3')
      .setRAM(8)
      .setStorage(256)
      .setGPU('Integrated')
      .build();
  }
}

// Usage
const director = new ComputerDirector(new ComputerBuilder());

const gamingPC = director.buildGamingComputer();
gamingPC.display();

const officePC = director.buildOfficeComputer();
officePC.display();

// Custom build
const customPC = new ComputerBuilder()
  .setCPU('AMD Ryzen 9')
  .setRAM(64)
  .setStorage(4000)
  .setGPU('NVIDIA RTX 4080')
  .build();
customPC.display();
```

### Fluent Builder with Validation

```javascript
class UserBuilder {
  constructor() {
    this.user = {
      name: '',
      email: '',
      age: 0,
      address: {},
      preferences: {}
    };
  }
  
  setName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid name');
    }
    this.user.name = name;
    return this;
  }
  
  setEmail(email) {
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email');
    }
    this.user.email = email;
    return this;
  }
  
  setAge(age) {
    if (age < 0 || age > 150) {
      throw new Error('Invalid age');
    }
    this.user.age = age;
    return this;
  }
  
  setAddress(street, city, zip) {
    this.user.address = { street, city, zip };
    return this;
  }
  
  setPreference(key, value) {
    this.user.preferences[key] = value;
    return this;
  }
  
  build() {
    // Final validation
    if (!this.user.name || !this.user.email) {
      throw new Error('Name and email are required');
    }
    return this.user;
  }
}

// Usage
const user = new UserBuilder()
  .setName('Alice')
  .setEmail('alice@example.com')
  .setAge(30)
  .setAddress('123 Main St', 'New York', '10001')
  .setPreference('theme', 'dark')
  .setPreference('language', 'en')
  .build();

console.log(user);
```

---

## Module Pattern

The Module Pattern encapsulates private and public members, providing a clean API.

### Basic Module Pattern

```javascript
const CounterModule = (function() {
  // Private variables
  let count = 0;
  
  // Private methods
  function logCount() {
    console.log(`Current count: ${count}`);
  }
  
  // Public API
  return {
    increment() {
      count++;
      logCount();
    },
    
    decrement() {
      count--;
      logCount();
    },
    
    getCount() {
      return count;
    },
    
    reset() {
      count = 0;
      logCount();
    }
  };
})();

// Usage
CounterModule.increment(); // "Current count: 1"
CounterModule.increment(); // "Current count: 2"
console.log(CounterModule.getCount()); // 2
CounterModule.reset(); // "Current count: 0"

// count is private
// console.log(CounterModule.count); // undefined
```

### Revealing Module Pattern

```javascript
const ShoppingCart = (function() {
  // Private data
  const items = [];
  
  // Private methods
  function calculateTotal() {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }
  
  function findItem(productId) {
    return items.find(item => item.productId === productId);
  }
  
  // Public methods
  function addItem(productId, name, price, quantity = 1) {
    const existingItem = findItem(productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ productId, name, price, quantity });
    }
  }
  
  function removeItem(productId) {
    const index = items.findIndex(item => item.productId === productId);
    if (index > -1) {
      items.splice(index, 1);
    }
  }
  
  function getItems() {
    return [...items]; // Return copy
  }
  
  function getTotal() {
    return calculateTotal();
  }
  
  function clear() {
    items.length = 0;
  }
  
  // Reveal public API
  return {
    addItem,
    removeItem,
    getItems,
    getTotal,
    clear
  };
})();

// Usage
ShoppingCart.addItem(1, 'Laptop', 999, 1);
ShoppingCart.addItem(2, 'Mouse', 25, 2);
ShoppingCart.addItem(1, 'Laptop', 999, 1); // Increases quantity

console.log(ShoppingCart.getItems());
console.log('Total:', ShoppingCart.getTotal()); // 1049
```

### Module with Dependencies

```javascript
const UserModule = (function(validator, storage) {
  const users = [];
  
  function createUser(name, email) {
    if (!validator.isValidEmail(email)) {
      throw new Error('Invalid email');
    }
    
    const user = {
      id: Date.now(),
      name,
      email,
      createdAt: new Date()
    };
    
    users.push(user);
    storage.save('users', users);
    
    return user;
  }
  
  function getUser(id) {
    return users.find(user => user.id === id);
  }
  
  function getAllUsers() {
    return [...users];
  }
  
  function deleteUser(id) {
    const index = users.findIndex(user => user.id === id);
    if (index > -1) {
      users.splice(index, 1);
      storage.save('users', users);
      return true;
    }
    return false;
  }
  
  // Initialize from storage
  (function init() {
    const savedUsers = storage.load('users');
    if (savedUsers) {
      users.push(...savedUsers);
    }
  })();
  
  return {
    createUser,
    getUser,
    getAllUsers,
    deleteUser
  };
})(
  // Validator dependency
  {
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
  },
  // Storage dependency
  {
    save(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    },
    load(key) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }
);
```

### ES6 Module Pattern

```javascript
// userService.js

// Private variables (module scope)
const users = new Map();
let nextId = 1;

// Private functions
function generateId() {
  return nextId++;
}

function validateUser(user) {
  if (!user.name || !user.email) {
    throw new Error('Name and email are required');
  }
}

// Public API
export function createUser(name, email) {
  const user = { id: generateId(), name, email };
  validateUser(user);
  users.set(user.id, user);
  return user;
}

export function getUser(id) {
  return users.get(id);
}

export function updateUser(id, updates) {
  const user = users.get(id);
  if (!user) {
    throw new Error('User not found');
  }
  
  Object.assign(user, updates);
  validateUser(user);
  return user;
}

export function deleteUser(id) {
  return users.delete(id);
}

export function getAllUsers() {
  return Array.from(users.values());
}

// Usage in another file:
// import * as UserService from './userService.js';
// const user = UserService.createUser('Alice', 'alice@example.com');
```

---

## Summary

This document covered Creational Design Patterns:

- **Factory Pattern**: Creating objects without specifying exact class (Simple Factory, Factory Method, Abstract Factory)
- **Constructor Pattern**: Using constructors to create objects (Function constructors, ES6 classes, private properties, validation)
- **Singleton Pattern**: Ensuring only one instance exists (Basic singleton, lazy initialization, module singleton)
- **Prototype Pattern**: Cloning objects from prototypes (Basic prototype, clone methods, deep cloning, prototype registry)
- **Builder Pattern**: Constructing complex objects step-by-step (Basic builder, director pattern, fluent interface with validation)
- **Module Pattern**: Encapsulating private and public members (Basic module, revealing module, dependencies, ES6 modules)

These patterns provide reusable solutions for object creation in JavaScript applications.

---

**Related Topics:**

- Structural Patterns
- Behavioral Patterns
- SOLID Principles
- Dependency Injection
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
# Design Patterns - Behavioral Patterns

## Table of Contents

- [Observer Pattern (Pub/Sub)](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#observer-pattern-pubsub)
- [Iterator Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#iterator-pattern)
- [Strategy Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#strategy-pattern)
- [Command Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#command-pattern)
- [Chain of Responsibility](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#chain-of-responsibility)
- [State Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#state-pattern)
- [Template Method Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#template-method-pattern)
- [Mediator Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#mediator-pattern)
- [Memento Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#memento-pattern)
- [Visitor Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#visitor-pattern)

---

## Behavioral Patterns

Behavioral patterns are concerned with algorithms and the assignment of responsibilities between objects. They describe patterns of communication between objects.

---

## Observer Pattern (Pub/Sub)

The Observer Pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified.

### Basic Observer

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  
  update(data) {
    console.log(`${this.name} received:`, data);
  }
}

// Usage
const subject = new Subject();

const observer1 = new Observer('Observer 1');
const observer2 = new Observer('Observer 2');
const observer3 = new Observer('Observer 3');

subject.subscribe(observer1);
subject.subscribe(observer2);
subject.subscribe(observer3);

subject.notify('Hello Observers!');
// Observer 1 received: Hello Observers!
// Observer 2 received: Hello Observers!
// Observer 3 received: Hello Observers!

subject.unsubscribe(observer2);
subject.notify('Second notification');
// Observer 1 received: Second notification
// Observer 3 received: Second notification
```

### Event Emitter Pattern

```javascript
class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return this;
  }
  
  once(event, listener) {
    const onceWrapper = (...args) => {
      listener.apply(this, args);
      this.off(event, onceWrapper);
    };
    return this.on(event, onceWrapper);
  }
  
  off(event, listenerToRemove) {
    if (!this.events[event]) return this;
    
    this.events[event] = this.events[event].filter(
      listener => listener !== listenerToRemove
    );
    return this;
  }
  
  emit(event, ...args) {
    if (!this.events[event]) return false;
    
    this.events[event].forEach(listener => {
      listener.apply(this, args);
    });
    return true;
  }
  
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }
  
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }
}

// Usage
const emitter = new EventEmitter();

emitter.on('data', (data) => {
  console.log('Data received:', data);
});

emitter.on('data', (data) => {
  console.log('Another listener:', data);
});

emitter.once('connect', () => {
  console.log('Connected! (only once)');
});

emitter.emit('data', { id: 1, name: 'Alice' });
// Data received: { id: 1, name: 'Alice' }
// Another listener: { id: 1, name: 'Alice' }

emitter.emit('connect'); // Connected! (only once)
emitter.emit('connect'); // (nothing - listener removed)

console.log('Listeners for "data":', emitter.listenerCount('data')); // 2
```

### Pub/Sub Pattern

```javascript
class PubSub {
  constructor() {
    this.subscribers = {};
    this.subId = 0;
  }
  
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = {};
    }
    
    const token = `sub_${this.subId++}`;
    this.subscribers[event][token] = callback;
    
    // Return unsubscribe function
    return () => this.unsubscribe(token);
  }
  
  unsubscribe(token) {
    for (const event in this.subscribers) {
      if (this.subscribers[event][token]) {
        delete this.subscribers[event][token];
        return true;
      }
    }
    return false;
  }
  
  publish(event, data) {
    if (!this.subscribers[event]) return;
    
    Object.values(this.subscribers[event]).forEach(callback => {
      callback(data);
    });
  }
}

// Usage
const pubsub = new PubSub();

// Subscribe
const unsubscribe1 = pubsub.subscribe('userLoggedIn', (user) => {
  console.log('User logged in:', user.name);
});

const unsubscribe2 = pubsub.subscribe('userLoggedIn', (user) => {
  console.log('Sending welcome email to:', user.email);
});

const unsubscribe3 = pubsub.subscribe('userLoggedOut', (user) => {
  console.log('User logged out:', user.name);
});

// Publish
pubsub.publish('userLoggedIn', { name: 'Alice', email: 'alice@example.com' });
// User logged in: Alice
// Sending welcome email to: alice@example.com

// Unsubscribe
unsubscribe1();

pubsub.publish('userLoggedIn', { name: 'Bob', email: 'bob@example.com' });
// Sending welcome email to: bob@example.com (first subscriber removed)

pubsub.publish('userLoggedOut', { name: 'Alice' });
// User logged out: Alice
```

### Real-World Example: Store

```javascript
class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }
  
  getState() {
    return { ...this.state };
  }
  
  setState(newState) {
    const prevState = this.state;
    this.state = { ...this.state, ...newState };
    this.notify({ prevState, state: this.state });
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  notify(update) {
    this.listeners.forEach(listener => listener(update));
  }
}

// Usage
const store = new Store({ count: 0, user: null });

const unsubscribe1 = store.subscribe(({ prevState, state }) => {
  console.log('Store updated:');
  console.log('  Previous:', prevState);
  console.log('  Current:', state);
});

const unsubscribe2 = store.subscribe(({ state }) => {
  if (state.count !== undefined) {
    console.log(`Count is now: ${state.count}`);
  }
});

store.setState({ count: 1 });
// Store updated:
//   Previous: { count: 0, user: null }
//   Current: { count: 1, user: null }
// Count is now: 1

store.setState({ user: { name: 'Alice' } });
// Store updated:
//   Previous: { count: 1, user: null }
//   Current: { count: 1, user: { name: 'Alice' } }

unsubscribe1();
store.setState({ count: 2 });
// Count is now: 2 (first subscriber removed)
```

---

## Iterator Pattern

The Iterator Pattern provides a way to access elements of a collection sequentially without exposing its underlying representation.

### Basic Iterator

```javascript
class ArrayIterator {
  constructor(array) {
    this.array = array;
    this.index = 0;
  }
  
  hasNext() {
    return this.index < this.array.length;
  }
  
  next() {
    if (!this.hasNext()) {
      throw new Error('No more elements');
    }
    return this.array[this.index++];
  }
  
  reset() {
    this.index = 0;
  }
}

// Usage
const iterator = new ArrayIterator([1, 2, 3, 4, 5]);

while (iterator.hasNext()) {
  console.log(iterator.next());
}
// 1, 2, 3, 4, 5

iterator.reset();
console.log(iterator.next()); // 1
```

### ES6 Iterator Protocol

```javascript
class Range {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
  
  [Symbol.iterator]() {
    let current = this.start;
    const end = this.end;
    const step = this.step;
    
    return {
      next() {
        if (current <= end) {
          const value = current;
          current += step;
          return { value, done: false };
        }
        return { done: true };
      }
    };
  }
}

// Usage
const range = new Range(1, 10, 2);

for (const num of range) {
  console.log(num); // 1, 3, 5, 7, 9
}

// Can be spread
console.log([...range]); // [1, 3, 5, 7, 9]

// Can use Array.from
console.log(Array.from(range)); // [1, 3, 5, 7, 9]
```

### Generator Iterator

```javascript
class Collection {
  constructor() {
    this.items = [];
  }
  
  add(item) {
    this.items.push(item);
  }
  
  // Forward iterator
  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }
  
  // Reverse iterator
  *reverse() {
    for (let i = this.items.length - 1; i >= 0; i--) {
      yield this.items[i];
    }
  }
  
  // Filter iterator
  *filter(predicate) {
    for (const item of this.items) {
      if (predicate(item)) {
        yield item;
      }
    }
  }
  
  // Map iterator
  *map(transformer) {
    for (const item of this.items) {
      yield transformer(item);
    }
  }
}

// Usage
const collection = new Collection();
collection.add(1);
collection.add(2);
collection.add(3);
collection.add(4);
collection.add(5);

// Forward iteration
console.log('Forward:', [...collection]); // [1, 2, 3, 4, 5]

// Reverse iteration
console.log('Reverse:', [...collection.reverse()]); // [5, 4, 3, 2, 1]

// Filter
console.log('Even:', [...collection.filter(x => x % 2 === 0)]); // [2, 4]

// Map
console.log('Squared:', [...collection.map(x => x * x)]); // [1, 4, 9, 16, 25]
```

### Tree Iterator

```javascript
class TreeNode {
  constructor(value) {
    this.value = value;
    this.children = [];
  }
  
  addChild(child) {
    this.children.push(child);
  }
  
  // Depth-first traversal
  *depthFirst() {
    yield this.value;
    for (const child of this.children) {
      yield* child.depthFirst();
    }
  }
  
  // Breadth-first traversal
  *breadthFirst() {
    const queue = [this];
    
    while (queue.length > 0) {
      const node = queue.shift();
      yield node.value;
      queue.push(...node.children);
    }
  }
}

// Usage
const root = new TreeNode(1);
const child1 = new TreeNode(2);
const child2 = new TreeNode(3);
const child3 = new TreeNode(4);
const child4 = new TreeNode(5);
const child5 = new TreeNode(6);

root.addChild(child1);
root.addChild(child2);
child1.addChild(child3);
child1.addChild(child4);
child2.addChild(child5);

/*
    1
   / \
  2   3
 / \   \
4   5   6
*/

console.log('Depth-first:', [...root.depthFirst()]);
// [1, 2, 4, 5, 3, 6]

console.log('Breadth-first:', [...root.breadthFirst()]);
// [1, 2, 3, 4, 5, 6]
```

---

## Strategy Pattern

The Strategy Pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable.

### Basic Strategy

```javascript
// Strategy interface
class PaymentStrategy {
  pay(amount) {
    throw new Error('pay method must be implemented');
  }
}

// Concrete strategies
class CreditCardStrategy extends PaymentStrategy {
  constructor(cardNumber, cvv) {
    super();
    this.cardNumber = cardNumber;
    this.cvv = cvv;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using Credit Card ${this.cardNumber}`);
    return { success: true, method: 'credit_card' };
  }
}

class PayPalStrategy extends PaymentStrategy {
  constructor(email) {
    super();
    this.email = email;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using PayPal account ${this.email}`);
    return { success: true, method: 'paypal' };
  }
}

class CryptoStrategy extends PaymentStrategy {
  constructor(walletAddress) {
    super();
    this.walletAddress = walletAddress;
  }
  
  pay(amount) {
    console.log(`Paid $${amount} using Crypto wallet ${this.walletAddress}`);
    return { success: true, method: 'crypto' };
  }
}

// Context
class ShoppingCart {
  constructor() {
    this.items = [];
    this.paymentStrategy = null;
  }
  
  addItem(item) {
    this.items.push(item);
  }
  
  setPaymentStrategy(strategy) {
    this.paymentStrategy = strategy;
  }
  
  getTotal() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }
  
  checkout() {
    if (!this.paymentStrategy) {
      throw new Error('Payment strategy not set');
    }
    
    const total = this.getTotal();
    return this.paymentStrategy.pay(total);
  }
}

// Usage
const cart = new ShoppingCart();
cart.addItem({ name: 'Book', price: 10 });
cart.addItem({ name: 'Pen', price: 2 });

// Pay with credit card
cart.setPaymentStrategy(new CreditCardStrategy('1234-5678-9012-3456', '123'));
cart.checkout(); // Paid $12 using Credit Card...

// Pay with PayPal
cart.setPaymentStrategy(new PayPalStrategy('user@example.com'));
cart.checkout(); // Paid $12 using PayPal...
```

### Validation Strategy

```javascript
class Validator {
  constructor() {
    this.strategies = [];
  }
  
  addStrategy(strategy) {
    this.strategies.push(strategy);
    return this;
  }
  
  validate(data) {
    const errors = [];
    
    for (const strategy of this.strategies) {
      const error = strategy.validate(data);
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Validation strategies
class RequiredStrategy {
  constructor(field) {
    this.field = field;
  }
  
  validate(data) {
    if (!data[this.field] || data[this.field].trim() === '') {
      return `${this.field} is required`;
    }
    return null;
  }
}

class EmailStrategy {
  constructor(field) {
    this.field = field;
  }
  
  validate(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data[this.field])) {
      return `${this.field} must be a valid email`;
    }
    return null;
  }
}

class MinLengthStrategy {
  constructor(field, minLength) {
    this.field = field;
    this.minLength = minLength;
  }
  
  validate(data) {
    if (data[this.field] && data[this.field].length < this.minLength) {
      return `${this.field} must be at least ${this.minLength} characters`;
    }
    return null;
  }
}

class RangeStrategy {
  constructor(field, min, max) {
    this.field = field;
    this.min = min;
    this.max = max;
  }
  
  validate(data) {
    const value = data[this.field];
    if (value < this.min || value > this.max) {
      return `${this.field} must be between ${this.min} and ${this.max}`;
    }
    return null;
  }
}

// Usage
const validator = new Validator();
validator
  .addStrategy(new RequiredStrategy('username'))
  .addStrategy(new MinLengthStrategy('username', 3))
  .addStrategy(new RequiredStrategy('email'))
  .addStrategy(new EmailStrategy('email'))
  .addStrategy(new RequiredStrategy('age'))
  .addStrategy(new RangeStrategy('age', 18, 100));

const result1 = validator.validate({
  username: 'ab',
  email: 'invalid-email',
  age: 15
});

console.log(result1);
// { isValid: false, errors: [...] }

const result2 = validator.validate({
  username: 'alice',
  email: 'alice@example.com',
  age: 25
});

console.log(result2);
// { isValid: true, errors: [] }
```

### Sorting Strategy

```javascript
class Sorter {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  sort(data) {
    return this.strategy.sort([...data]);
  }
}

// Sorting strategies
class BubbleSortStrategy {
  sort(data) {
    console.log('Using Bubble Sort');
    const arr = [...data];
    const n = arr.length;
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        }
      }
    }
    
    return arr;
  }
}

class QuickSortStrategy {
  sort(data) {
    console.log('Using Quick Sort');
    return this.quickSort([...data]);
  }
  
  quickSort(arr) {
    if (arr.length <= 1) return arr;
    
    const pivot = arr[Math.floor(arr.length / 2)];
    const left = arr.filter(x => x < pivot);
    const middle = arr.filter(x => x === pivot);
    const right = arr.filter(x => x > pivot);
    
    return [...this.quickSort(left), ...middle, ...this.quickSort(right)];
  }
}

class NativeSortStrategy {
  sort(data) {
    console.log('Using Native Sort');
    return [...data].sort((a, b) => a - b);
  }
}

// Usage
const data = [64, 34, 25, 12, 22, 11, 90];
const sorter = new Sorter(new BubbleSortStrategy());

console.log(sorter.sort(data)); // Using Bubble Sort

sorter.setStrategy(new QuickSortStrategy());
console.log(sorter.sort(data)); // Using Quick Sort

sorter.setStrategy(new NativeSortStrategy());
console.log(sorter.sort(data)); // Using Native Sort
```

---

## Command Pattern

The Command Pattern encapsulates a request as an object, allowing you to parameterize clients with different requests, queue or log requests, and support undoable operations.

### Basic Command

```javascript
// Receiver
class Light {
  turnOn() {
    console.log('Light is ON');
  }
  
  turnOff() {
    console.log('Light is OFF');
  }
}

// Command interface
class Command {
  execute() {
    throw new Error('execute must be implemented');
  }
  
  undo() {
    throw new Error('undo must be implemented');
  }
}

// Concrete commands
class TurnOnCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOn();
  }
  
  undo() {
    this.light.turnOff();
  }
}

class TurnOffCommand extends Command {
  constructor(light) {
    super();
    this.light = light;
  }
  
  execute() {
    this.light.turnOff();
  }
  
  undo() {
    this.light.turnOn();
  }
}

// Invoker
class RemoteControl {
  constructor() {
    this.history = [];
  }
  
  execute(command) {
    command.execute();
    this.history.push(command);
  }
  
  undo() {
    const command = this.history.pop();
    if (command) {
      command.undo();
    }
  }
}

// Usage
const light = new Light();
const remote = new RemoteControl();

const turnOn = new TurnOnCommand(light);
const turnOff = new TurnOffCommand(light);

remote.execute(turnOn);  // Light is ON
remote.execute(turnOff); // Light is OFF
remote.undo();           // Light is ON
remote.undo();           // Light is OFF
```

### Text Editor with Undo/Redo

```javascript
class TextEditor {
  constructor() {
    this.content = '';
  }
  
  getContent() {
    return this.content;
  }
  
  setContent(content) {
    this.content = content;
  }
  
  insert(text, position) {
    this.content = 
      this.content.slice(0, position) + 
      text + 
      this.content.slice(position);
  }
  
  delete(start, length) {
    this.content = 
      this.content.slice(0, start) + 
      this.content.slice(start + length);
  }
}

// Commands
class InsertCommand {
  constructor(editor, text, position) {
    this.editor = editor;
    this.text = text;
    this.position = position;
  }
  
  execute() {
    this.editor.insert(this.text, this.position);
  }
  
  undo() {
    this.editor.delete(this.position, this.text.length);
  }
}

class DeleteCommand {
  constructor(editor, start, length) {
    this.editor = editor;
    this.start = start;
    this.length = length;
    this.deletedText = '';
  }
  
  execute() {
    this.deletedText = this.editor.getContent()
      .slice(this.start, this.start + this.length);
    this.editor.delete(this.start, this.length);
  }
  
  undo() {
    this.editor.insert(this.deletedText, this.start);
  }
}

// Command Manager with Undo/Redo
class CommandManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  execute(command) {
    // Remove any commands after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    command.execute();
    this.history.push(command);
    this.currentIndex++;
  }
  
  undo() {
    if (this.currentIndex >= 0) {
      this.history[this.currentIndex].undo();
      this.currentIndex--;
    }
  }
  
  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.history[this.currentIndex].execute();
    }
  }
  
  canUndo() {
    return this.currentIndex >= 0;
  }
  
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
}

// Usage
const editor = new TextEditor();
const manager = new CommandManager();

manager.execute(new InsertCommand(editor, 'Hello', 0));
console.log(editor.getContent()); // "Hello"

manager.execute(new InsertCommand(editor, ' World', 5));
console.log(editor.getContent()); // "Hello World"

manager.execute(new DeleteCommand(editor, 5, 6));
console.log(editor.getContent()); // "Hello"

manager.undo();
console.log(editor.getContent()); // "Hello World"

manager.undo();
console.log(editor.getContent()); // "Hello"

manager.redo();
console.log(editor.getContent()); // "Hello World"
```

### Macro Command

```javascript
class MacroCommand {
  constructor() {
    this.commands = [];
  }
  
  add(command) {
    this.commands.push(command);
    return this;
  }
  
  execute() {
    this.commands.forEach(command => command.execute());
  }
  
  undo() {
    // Undo in reverse order
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }
}

// Usage
const light1 = new Light();
const light2 = new Light();
const light3 = new Light();

const allLightsOn = new MacroCommand();
allLightsOn
  .add(new TurnOnCommand(light1))
  .add(new TurnOnCommand(light2))
  .add(new TurnOnCommand(light3));

const remote = new RemoteControl();
remote.execute(allLightsOn);
// Light is ON (x3)

remote.undo();
// Light is OFF (x3)
```

---

## Chain of Responsibility

The Chain of Responsibility Pattern passes a request along a chain of handlers. Each handler decides either to process the request or pass it to the next handler.

### Basic Chain

```javascript
class Handler {
  constructor() {
    this.nextHandler = null;
  }
  
  setNext(handler) {
    this.nextHandler = handler;
    return handler; // Enable chaining
  }
  
  handle(request) {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return null;
  }
}

// Concrete handlers
class AuthenticationHandler extends Handler {
  handle(request) {
    if (!request.authenticated) {
      console.log('Authentication failed');
      return { error: 'Not authenticated' };
    }
    console.log('Authentication passed');
    return super.handle(request);
  }
}

class AuthorizationHandler extends Handler {
  handle(request) {
    if (!request.authorized) {
      console.log('Authorization failed');
      return { error: 'Not authorized' };
    }
    console.log('Authorization passed');
    return super.handle(request);
  }
}

class ValidationHandler extends Handler {
  handle(request) {
    if (!request.data || !request.data.name) {
      console.log('Validation failed');
      return { error: 'Invalid data' };
    }
    console.log('Validation passed');
    return super.handle(request);
  }
}

class ProcessHandler extends Handler {
  handle(request) {
    console.log('Processing request:', request.data);
    return { success: true, data: request.data };
  }
}

// Usage
const auth = new AuthenticationHandler();
const authz = new AuthorizationHandler();
const validation = new ValidationHandler();
const process = new ProcessHandler();

auth.setNext(authz).setNext(validation).setNext(process);

// Test 1: Full request
const result1 = auth.handle({
  authenticated: true,
  authorized: true,
  data: { name: 'Alice' }
});
console.log('Result:', result1);
// Authentication passed
// Authorization passed
// Validation passed
// Processing request: { name: 'Alice' }
// Result: { success: true, data: { name: 'Alice' } }

// Test 2: Not authenticated
const result2 = auth.handle({
  authenticated: false,
  authorized: true,
  data: { name: 'Bob' }
});
console.log('Result:', result2);
// Authentication failed
// Result: { error: 'Not authenticated' }
```

### Middleware Chain

```javascript
class MiddlewareChain {
  constructor() {
    this.middlewares = [];
  }
  
  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }
  
  async execute(context) {
    let index = 0;
    
    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        await middleware(context, next);
      }
    };
    
    await next();
  }
}

// Middleware functions
async function loggingMiddleware(context, next) {
  console.log(`[LOG] ${context.method} ${context.url}`);
  await next();
}

async function authMiddleware(context, next) {
  if (!context.headers.authorization) {
    context.status = 401;
    context.body = 'Unauthorized';
    return;
  }
  console.log('[AUTH] User authenticated');
  await next();
}

async function timingMiddleware(context, next) {
  const start = Date.now();
  await next();
  const duration = Date.now() - start;
  console.log(`[TIMING] Request took ${duration}ms`);
}

async function responseMiddleware(context, next) {
  await next();
  context.body = context.body || 'Success';
  console.log(`[RESPONSE] ${context.status || 200} - ${context.body}`);
}

// Usage
const chain = new MiddlewareChain();
chain
  .use(loggingMiddleware)
  .use(timingMiddleware)
  .use(authMiddleware)
  .use(responseMiddleware);

const context = {
  method: 'GET',
  url: '/api/users',
  headers: { authorization: 'Bearer token123' }
};

chain.execute(context);
// [LOG] GET /api/users
// [AUTH] User authenticated
// [RESPONSE] 200 - Success
// [TIMING] Request took 2ms
```

### Support Ticket System

```javascript
class SupportHandler {
  constructor(level, name) {
    this.level = level;
    this.name = name;
    this.nextHandler = null;
  }
  
  setNext(handler) {
    this.nextHandler = handler;
    return handler;
  }
  
  handle(ticket) {
    if (ticket.priority <= this.level) {
      console.log(`${this.name} handling ticket: ${ticket.description}`);
      return true;
    }
    
    if (this.nextHandler) {
      console.log(`${this.name} escalating to next level`);
      return this.nextHandler.handle(ticket);
    }
    
    console.log('No handler available for this priority');
    return false;
  }
}

// Usage
const juniorSupport = new SupportHandler(1, 'Junior Support');
const seniorSupport = new SupportHandler(2, 'Senior Support');
const manager = new SupportHandler(3, 'Manager');
const director = new SupportHandler(4, 'Director');

juniorSupport
  .setNext(seniorSupport)
  .setNext(manager)
  .setNext(director);

// Test tickets
juniorSupport.handle({ priority: 1, description: 'Password reset' });
// Junior Support handling ticket: Password reset

juniorSupport.handle({ priority: 2, description: 'Account locked' });
// Junior Support escalating to next level
// Senior Support handling ticket: Account locked

juniorSupport.handle({ priority: 4, description: 'System outage' });
// Junior Support escalating to next level
// Senior Support escalating to next level
// Manager escalating to next level
// Director handling ticket: System outage
```

---

## State Pattern

The State Pattern allows an object to alter its behavior when its internal state changes.

### Basic State

```javascript
// State interface
class State {
  handle(context) {
    throw new Error('handle must be implemented');
  }
}

// Concrete states
class RedState extends State {
  handle(context) {
    console.log('Red Light - STOP');
    context.setState(new GreenState());
  }
}

class YellowState extends State {
  handle(context) {
    console.log('Yellow Light - CAUTION');
    context.setState(new RedState());
  }
}

class GreenState extends State {
  handle(context) {
    console.log('Green Light - GO');
    context.setState(new YellowState());
  }
}

// Context
class TrafficLight {
  constructor() {
    this.state = new RedState();
  }
  
  setState(state) {
    this.state = state;
  }
  
  change() {
    this.state.handle(this);
  }
}

// Usage
const light = new TrafficLight();
light.change(); // Red Light - STOP
light.change(); // Green Light - GO
light.change(); // Yellow Light - CAUTION
light.change(); // Red Light - STOP
```

### Document State Machine

```javascript
class Document {
  constructor() {
    this.content = '';
    this.state = new DraftState();
  }
  
  setState(state) {
    this.state = state;
    console.log(`State changed to: ${state.constructor.name}`);
  }
  
  publish() {
    this.state.publish(this);
  }
  
  review() {
    this.state.review(this);
  }
  
  approve() {
    this.state.approve(this);
  }
  
  reject() {
    this.state.reject(this);
  }
}

class DocumentState {
  publish(document) {
    console.log('Cannot publish in this state');
  }
  
  review(document) {
    console.log('Cannot review in this state');
  }
  
  approve(document) {
    console.log('Cannot approve in this state');
  }
  
  reject(document) {
    console.log('Cannot reject in this state');
  }
}

class DraftState extends DocumentState {
  review(document) {
    console.log('Submitting for review...');
    document.setState(new ReviewState());
  }
}

class ReviewState extends DocumentState {
  approve(document) {
    console.log('Approving document...');
    document.setState(new ApprovedState());
  }
  
  reject(document) {
    console.log('Rejecting document...');
    document.setState(new DraftState());
  }
}

class ApprovedState extends DocumentState {
  publish(document) {
    console.log('Publishing document...');
    document.setState(new PublishedState());
  }
}

class PublishedState extends DocumentState {
  // Published is final state
}

// Usage
const doc = new Document();

doc.review();   // Submitting for review...
doc.approve();  // Approving document...
doc.publish();  // Publishing document...
doc.review();   // Cannot review in this state
```

### Vending Machine

```javascript
class VendingMachine {
  constructor(inventory) {
    this.inventory = inventory;
    this.currentItem = null;
    this.currentMoney = 0;
    this.state = new ReadyState();
  }
  
  setState(state) {
    this.state = state;
  }
  
  selectItem(item) {
    this.state.selectItem(this, item);
  }
  
  insertMoney(amount) {
    this.state.insertMoney(this, amount);
  }
  
  dispense() {
    this.state.dispense(this);
  }
  
  cancel() {
    this.state.cancel(this);
  }
}

class VendingMachineState {
  selectItem(machine, item) {
    console.log('Invalid operation in this state');
  }
  
  insertMoney(machine, amount) {
    console.log('Invalid operation in this state');
  }
  
  dispense(machine) {
    console.log('Invalid operation in this state');
  }
  
  cancel(machine) {
    console.log('Invalid operation in this state');
  }
}

class ReadyState extends VendingMachineState {
  selectItem(machine, item) {
    if (machine.inventory[item] > 0) {
      console.log(`Selected: ${item}`);
      machine.currentItem = item;
      machine.setState(new ItemSelectedState());
    } else {
      console.log(`${item} is out of stock`);
    }
  }
}

class ItemSelectedState extends VendingMachineState {
  insertMoney(machine, amount) {
    machine.currentMoney += amount;
    console.log(`Inserted $${amount}. Total: $${machine.currentMoney}`);
    
    const itemPrice = 2.50; // Simplified pricing
    
    if (machine.currentMoney >= itemPrice) {
      machine.setState(new DispensingState());
      machine.dispense();
    }
  }
  
  cancel(machine) {
    console.log(`Cancelled. Refunding $${machine.currentMoney}`);
    machine.currentMoney = 0;
    machine.currentItem = null;
    machine.setState(new ReadyState());
  }
}

class DispensingState extends VendingMachineState {
  dispense(machine) {
    console.log(`Dispensing ${machine.currentItem}`);
    machine.inventory[machine.currentItem]--;
    
    const itemPrice = 2.50;
    const change = machine.currentMoney - itemPrice;
    
    if (change > 0) {
      console.log(`Change: $${change.toFixed(2)}`);
    }
    
    machine.currentMoney = 0;
    machine.currentItem = null;
    machine.setState(new ReadyState());
  }
}

// Usage
const machine = new VendingMachine({
  'Coke': 5,
  'Pepsi': 3,
  'Water': 10
});

machine.selectItem('Coke');
machine.insertMoney(1.00);
machine.insertMoney(1.00);
machine.insertMoney(1.00);
// Selected: Coke
// Inserted $1. Total: $1
// Inserted $1. Total: $2
// Inserted $1. Total: $3
// Dispensing Coke
// Change: $0.50
```

---

## Template Method Pattern

The Template Method Pattern defines the skeleton of an algorithm, letting subclasses override specific steps without changing the algorithm's structure.

### Basic Template Method

```javascript
class DataProcessor {
  // Template method
  process() {
    this.loadData();
    this.validateData();
    this.processData();
    this.saveData();
  }
  
  loadData() {
    throw new Error('loadData must be implemented');
  }
  
  validateData() {
    console.log('Validating data...');
  }
  
  processData() {
    throw new Error('processData must be implemented');
  }
  
  saveData() {
    console.log('Saving data...');
  }
}

// Concrete implementations
class CSVProcessor extends DataProcessor {
  loadData() {
    console.log('Loading CSV file...');
    this.data = 'csv,data,here';
  }
  
  processData() {
    console.log('Processing CSV data...');
    this.result = this.data.split(',');
  }
}

class JSONProcessor extends DataProcessor {
  loadData() {
    console.log('Loading JSON file...');
    this.data = '{"name":"Alice"}';
  }
  
  processData() {
    console.log('Processing JSON data...');
    this.result = JSON.parse(this.data);
  }
}

// Usage
const csvProcessor = new CSVProcessor();
csvProcessor.process();
// Loading CSV file...
// Validating data...
// Processing CSV data...
// Saving data...

const jsonProcessor = new JSONProcessor();
jsonProcessor.process();
// Loading JSON file...
// Validating data...
// Processing JSON data...
// Saving data...
```

### Game Template

```javascript
class Game {
  // Template method
  play() {
    this.initialize();
    this.startPlay();
    this.endPlay();
  }
  
  initialize() {
    console.log('Game initialized');
  }
  
  startPlay() {
    throw new Error('startPlay must be implemented');
  }
  
  endPlay() {
    throw new Error('endPlay must be implemented');
  }
}

class Chess extends Game {
  startPlay() {
    console.log('Chess game started');
    console.log('Moving pieces...');
  }
  
  endPlay() {
    console.log('Chess game ended');
  }
}

class Football extends Game {
  initialize() {
    super.initialize();
    console.log('Setting up field...');
  }
  
  startPlay() {
    console.log('Football game started');
    console.log('Kicking ball...');
  }
  
  endPlay() {
    console.log('Football game ended');
  }
}

// Usage
const chess = new Chess();
chess.play();
// Game initialized
// Chess game started
// Moving pieces...
// Chess game ended

const football = new Football();
football.play();
// Game initialized
// Setting up field...
// Football game started
// Kicking ball...
// Football game ended
```

### Report Generator

```javascript
class ReportGenerator {
  generate() {
    this.fetchData();
    this.formatHeader();
    this.formatBody();
    this.formatFooter();
    return this.output;
  }
  
  fetchData() {
    console.log('Fetching data...');
    this.data = { title: 'Report', items: [1, 2, 3] };
  }
  
  formatHeader() {
    throw new Error('formatHeader must be implemented');
  }
  
  formatBody() {
    throw new Error('formatBody must be implemented');
  }
  
  formatFooter() {
    throw new Error('formatFooter must be implemented');
  }
}

class PDFReport extends ReportGenerator {
  constructor() {
    super();
    this.output = '';
  }
  
  formatHeader() {
    this.output += `PDF Header: ${this.data.title}\n`;
  }
  
  formatBody() {
    this.output += 'PDF Body:\n';
    this.data.items.forEach(item => {
      this.output += `  - Item ${item}\n`;
    });
  }
  
  formatFooter() {
    this.output += 'PDF Footer\n';
  }
}

class HTMLReport extends ReportGenerator {
  constructor() {
    super();
    this.output = '';
  }
  
  formatHeader() {
    this.output += `<h1>${this.data.title}</h1>\n`;
  }
  
  formatBody() {
    this.output += '<ul>\n';
    this.data.items.forEach(item => {
      this.output += `  <li>Item ${item}</li>\n`;
    });
    this.output += '</ul>\n';
  }
  
  formatFooter() {
    this.output += '<footer>End of Report</footer>\n';
  }
}

// Usage
const pdfReport = new PDFReport();
console.log(pdfReport.generate());

const htmlReport = new HTMLReport();
console.log(htmlReport.generate());
```

---

## Mediator Pattern

The Mediator Pattern defines an object that encapsulates how a set of objects interact, promoting loose coupling.

### Basic Mediator

```javascript
class Mediator {
  constructor() {
    this.colleagues = [];
  }
  
  register(colleague) {
    this.colleagues.push(colleague);
    colleague.setMediator(this);
  }
  
  send(message, sender) {
    this.colleagues.forEach(colleague => {
      if (colleague !== sender) {
        colleague.receive(message, sender);
      }
    });
  }
}

class Colleague {
  constructor(name) {
    this.name = name;
    this.mediator = null;
  }
  
  setMediator(mediator) {
    this.mediator = mediator;
  }
  
  send(message) {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.send(message, this);
  }
  
  receive(message, sender) {
    console.log(`${this.name} receives from ${sender.name}: ${message}`);
  }
}

// Usage
const mediator = new Mediator();

const colleague1 = new Colleague('Alice');
const colleague2 = new Colleague('Bob');
const colleague3 = new Colleague('Charlie');

mediator.register(colleague1);
mediator.register(colleague2);
mediator.register(colleague3);

colleague1.send('Hello everyone!');
// Alice sends: Hello everyone!
// Bob receives from Alice: Hello everyone!
// Charlie receives from Alice: Hello everyone!

colleague2.send('Hi Alice!');
// Bob sends: Hi Alice!
// Alice receives from Bob: Hi Alice!
// Charlie receives from Bob: Hi Alice!
```

### Chat Room Mediator

```javascript
class ChatRoom {
  constructor() {
    this.users = new Map();
  }
  
  register(user) {
    this.users.set(user.name, user);
    user.setChatRoom(this);
  }
  
  sendMessage(message, from, to) {
    if (to) {
      // Direct message
      const recipient = this.users.get(to);
      if (recipient) {
        recipient.receive(message, from);
      }
    } else {
      // Broadcast to all except sender
      this.users.forEach(user => {
        if (user.name !== from) {
          user.receive(message, from);
        }
      });
    }
  }
  
  showUsers() {
    console.log('Users in chat:', Array.from(this.users.keys()).join(', '));
  }
}

class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }
  
  setChatRoom(chatRoom) {
    this.chatRoom = chatRoom;
  }
  
  send(message, to = null) {
    console.log(`[${this.name}] Sending: ${message}`);
    this.chatRoom.sendMessage(message, this.name, to);
  }
  
  receive(message, from) {
    console.log(`[${this.name}] Received from ${from}: ${message}`);
  }
}

// Usage
const chatRoom = new ChatRoom();

const alice = new User('Alice');
const bob = new User('Bob');
const charlie = new User('Charlie');

chatRoom.register(alice);
chatRoom.register(bob);
chatRoom.register(charlie);

chatRoom.showUsers();

alice.send('Hello everyone!');
// [Alice] Sending: Hello everyone!
// [Bob] Received from Alice: Hello everyone!
// [Charlie] Received from Alice: Hello everyone!

bob.send('Hi Alice!', 'Alice');
// [Bob] Sending: Hi Alice!
// [Alice] Received from Bob: Hi Alice!
```

### Air Traffic Control

```javascript
class ControlTower {
  constructor() {
    this.aircraft = new Map();
  }
  
  register(plane) {
    this.aircraft.set(plane.id, plane);
    plane.setControlTower(this);
    console.log(`${plane.id} registered with control tower`);
  }
  
  requestLanding(plane) {
    console.log(`${plane.id} requests landing`);
    
    // Check if runway is clear
    const isRunwayClear = ![...this.aircraft.values()]
      .some(p => p !== plane && p.status === 'landing');
    
    if (isRunwayClear) {
      plane.receivePermission('Landing approved');
      return true;
    } else {
      plane.receivePermission('Hold position, runway busy');
      return false;
    }
  }
  
  requestTakeoff(plane) {
    console.log(`${plane.id} requests takeoff`);
    plane.receivePermission('Takeoff approved');
  }
  
  reportPosition(plane, position) {
    console.log(`${plane.id} at position ${position}`);
  }
}

class Aircraft {
  constructor(id) {
    this.id = id;
    this.controlTower = null;
    this.status = 'airborne';
  }
  
  setControlTower(tower) {
    this.controlTower = tower;
  }
  
  requestLanding() {
    this.status = 'landing';
    this.controlTower.requestLanding(this);
  }
  
  requestTakeoff() {
    this.status = 'taking off';
    this.controlTower.requestTakeoff(this);
  }
  
  reportPosition(position) {
    this.controlTower.reportPosition(this, position);
  }
  
  receivePermission(message) {
    console.log(`${this.id} receives: ${message}`);
  }
}

// Usage
const tower = new ControlTower();

const flight1 = new Aircraft('Flight 001');
const flight2 = new Aircraft('Flight 002');

tower.register(flight1);
tower.register(flight2);

flight1.reportPosition('10 miles north');
flight1.requestLanding();

flight2.requestLanding(); // Should wait
```

---

## Memento Pattern

The Memento Pattern captures and externalizes an object's internal state without violating encapsulation, allowing the object to be restored to this state later.

### Basic Memento

```javascript
// Memento
class Memento {
  constructor(state) {
    this.state = state;
    this.timestamp = new Date();
  }
  
  getState() {
    return this.state;
  }
  
  getTimestamp() {
    return this.timestamp;
  }
}

// Originator
class TextEditor {
  constructor() {
    this.content = '';
  }
  
  type(text) {
    this.content += text;
  }
  
  getContent() {
    return this.content;
  }
  
  save() {
    return new Memento(this.content);
  }
  
  restore(memento) {
    this.content = memento.getState();
  }
}

// Caretaker
class History {
  constructor() {
    this.mementos = [];
  }
  
  push(memento) {
    this.mementos.push(memento);
  }
  
  pop() {
    return this.mementos.pop();
  }
  
  isEmpty() {
    return this.mementos.length === 0;
  }
}

// Usage
const editor = new TextEditor();
const history = new History();

editor.type('Hello');
history.push(editor.save());

editor.type(' World');
history.push(editor.save());

editor.type('!');
console.log('Current:', editor.getContent()); // "Hello World!"

// Undo
editor.restore(history.pop());
console.log('After undo:', editor.getContent()); // "Hello World"

// Undo again
editor.restore(history.pop());
console.log('After undo:', editor.getContent()); // "Hello"
```

### Game State Memento

```javascript
class GameState {
  constructor(level, score, health) {
    this.level = level;
    this.score = score;
    this.health = health;
  }
}

class Game {
  constructor() {
    this.level = 1;
    this.score = 0;
    this.health = 100;
  }
  
  play() {
    this.score += 100;
    console.log(`Playing... Score: ${this.score}`);
  }
  
  levelUp() {
    this.level++;
    this.health = 100;
    console.log(`Level up! Now at level ${this.level}`);
  }
  
  takeDamage(amount) {
    this.health -= amount;
    console.log(`Took damage! Health: ${this.health}`);
  }
  
  save() {
    console.log('Saving game...');
    return new GameState(this.level, this.score, this.health);
  }
  
  load(state) {
    console.log('Loading game...');
    this.level = state.level;
    this.score = state.score;
    this.health = state.health;
  }
  
  display() {
    console.log(`Level: ${this.level}, Score: ${this.score}, Health: ${this.health}`);
  }
}

class SaveManager {
  constructor() {
    this.saves = [];
  }
  
  save(state) {
    this.saves.push(state);
    console.log(`Saved state #${this.saves.length}`);
  }
  
  load(index) {
    if (index >= 0 && index < this.saves.length) {
      return this.saves[index];
    }
    return null;
  }
  
  list() {
    this.saves.forEach((state, index) => {
      console.log(`Save #${index + 1}: Level ${state.level}, Score ${state.score}`);
    });
  }
}

// Usage
const game = new Game();
const saveManager = new SaveManager();

game.play();
game.levelUp();
game.display(); // Level: 2, Score: 100, Health: 100

saveManager.save(game.save()); // Save point 1

game.play();
game.takeDamage(50);
game.display(); // Level: 2, Score: 200, Health: 50

saveManager.save(game.save()); // Save point 2

game.play();
game.takeDamage(60);
game.display(); // Level: 2, Score: 300, Health: -10 (dead)

// Load previous save
saveManager.list();
game.load(saveManager.load(0));
game.display(); // Level: 2, Score: 100, Health: 100
```

---

## Visitor Pattern

The Visitor Pattern lets you add further operations to objects without having to modify them, by separating the algorithm from the objects on which it operates.

### Basic Visitor

```javascript
// Element classes
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
  
  accept(visitor) {
    return visitor.visitEmployee(this);
  }
}

class Department {
  constructor(name) {
    this.name = name;
    this.employees = [];
  }
  
  addEmployee(employee) {
    this.employees.push(employee);
  }
  
  accept(visitor) {
    return visitor.visitDepartment(this);
  }
}

// Visitors
class SalaryReportVisitor {
  visitEmployee(employee) {
    return `${employee.name}: $${employee.salary}`;
  }
  
  visitDepartment(department) {
    let report = `Department: ${department.name}\n`;
    department.employees.forEach(emp => {
      report += `  ${emp.accept(this)}\n`;
    });
    return report;
  }
}

class BonusCalculatorVisitor {
  visitEmployee(employee) {
    return employee.salary * 0.1; // 10% bonus
  }
  
  visitDepartment(department) {
    let total = 0;
    department.employees.forEach(emp => {
      total += emp.accept(this);
    });
    return total;
  }
}

// Usage
const engineering = new Department('Engineering');
engineering.addEmployee(new Employee('Alice', 100000));
engineering.addEmployee(new Employee('Bob', 120000));

const salaryReport = new SalaryReportVisitor();
console.log(engineering.accept(salaryReport));
// Department: Engineering
//   Alice: $100000
//   Bob: $120000

const bonusCalc = new BonusCalculatorVisitor();
console.log('Total bonuses:', engineering.accept(bonusCalc));
// Total bonuses: 22000
```

### File System Visitor

```javascript
class File {
  constructor(name, size) {
    this.name = name;
    this.size = size;
  }
  
  accept(visitor) {
    visitor.visitFile(this);
  }
}

class Directory {
  constructor(name) {
    this.name = name;
    this.children = [];
  }
  
  add(child) {
    this.children.push(child);
  }
  
  accept(visitor) {
    visitor.visitDirectory(this);
    this.children.forEach(child => child.accept(visitor));
  }
}

class SizeCalculatorVisitor {
  constructor() {
    this.totalSize = 0;
  }
  
  visitFile(file) {
    this.totalSize += file.size;
  }
  
  visitDirectory(directory) {
    // Just traverse, size calculated from files
  }
  
  getTotal() {
    return this.totalSize;
  }
}

class DisplayVisitor {
  constructor() {
    this.indent = 0;
  }
  
  visitFile(file) {
    console.log(`${' '.repeat(this.indent)}📄 ${file.name} (${file.size}KB)`);
  }
  
  visitDirectory(directory) {
    console.log(`${' '.repeat(this.indent)}📁 ${directory.name}/`);
    this.indent += 2;
  }
}

// Usage
const root = new Directory('root');

const docs = new Directory('documents');
docs.add(new File('resume.pdf', 100));
docs.add(new File('letter.pdf', 50));

const photos = new Directory('photos');
photos.add(new File('vacation.jpg', 2000));

root.add(docs);
root.add(photos);
root.add(new File('readme.txt', 5));

const display = new DisplayVisitor();
root.accept(display);

const sizeCalc = new SizeCalculatorVisitor();
root.accept(sizeCalc);
console.log(`Total size: ${sizeCalc.getTotal()}KB`);
```

---

## Summary

This document covered Behavioral Design Patterns:

- **Observer Pattern**: One-to-many dependency (Event emitters, Pub/Sub, Store)
- **Iterator Pattern**: Sequential access to collections (Array iterator, ES6 iterators, generators, tree traversal)
- **Strategy Pattern**: Interchangeable algorithms (Payment strategies, validation, sorting)
- **Command Pattern**: Encapsulating requests (Basic commands, undo/redo, macro commands)
- **Chain of Responsibility**: Passing requests along a chain (Authentication chain, middleware, support tickets)
- **State Pattern**: Behavior changes with state (Traffic light, document workflow, vending machine)
- **Template Method**: Algorithm skeleton with customizable steps (Data processors, games, reports)
- **Mediator**: Centralized communication (Basic mediator, chat room, air traffic control)
- **Memento**: State capture and restore (Text editor, game saves)
- **Visitor**: Operations on object structures (Salary reports, file system traversal)

These patterns help manage complex behaviors and communication between objects.

---

**Related Topics:**

- Functional Patterns
- Async Patterns
- Event-Driven Architecture
- State Machines
# Functional Patterns

## Table of Contents

- [Function Composition](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#function-composition)
- [Higher-Order Functions](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#higher-order-functions)
- [Currying and Partial Application](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#currying-and-partial-application)
- [Memoization](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#memoization)
- [Pure Functions](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#pure-functions)
- [Immutability Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#immutability-patterns)

---

## Functional Patterns

Functional patterns focus on using functions as first-class citizens, emphasizing immutability, pure functions, and function composition.

---

## Function Composition

Function composition is the process of combining two or more functions to produce a new function.

### Basic Composition

```javascript
// Simple compose - right to left
const compose = (...fns) => x => 
  fns.reduceRight((acc, fn) => fn(acc), x);

// Pipe - left to right
const pipe = (...fns) => x => 
  fns.reduce((acc, fn) => fn(acc), x);

// Example functions
const add2 = x => x + 2;
const multiply3 = x => x * 3;
const subtract1 = x => x - 1;

// Compose: subtract1(multiply3(add2(5)))
const composedFn = compose(subtract1, multiply3, add2);
console.log(composedFn(5)); // (5 + 2) * 3 - 1 = 20

// Pipe: add2 -> multiply3 -> subtract1
const pipedFn = pipe(add2, multiply3, subtract1);
console.log(pipedFn(5)); // (5 + 2) * 3 - 1 = 20
```

### String Processing Pipeline

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Individual transformations
const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const removeSpaces = str => str.replace(/\s+/g, '-');
const addPrefix = prefix => str => `${prefix}${str}`;
const addSuffix = suffix => str => `${str}${suffix}`;

// Create slug generator
const createSlug = pipe(
  trim,
  toLowerCase,
  removeSpaces,
  addPrefix('post-'),
  addSuffix('-2024')
);

console.log(createSlug('  Hello World  '));
// "post-hello-world-2024"

// Reusable transformations
const sanitizeInput = pipe(
  trim,
  str => str.replace(/[<>]/g, '')
);

const normalizeEmail = pipe(
  trim,
  toLowerCase
);

console.log(sanitizeInput('  <script>alert("xss")</script>  '));
// "scriptalert("xss")/script"

console.log(normalizeEmail('  Alice@EXAMPLE.COM  '));
// "alice@example.com"
```

### Data Transformation Pipeline

```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Data transformations
const filterActive = users => users.filter(u => u.active);
const sortByAge = users => [...users].sort((a, b) => b.age - a.age);
const mapToNames = users => users.map(u => u.name);
const take = n => arr => arr.slice(0, n);

// Create pipeline
const getTopActiveUsers = pipe(
  filterActive,
  sortByAge,
  mapToNames,
  take(3)
);

const users = [
  { name: 'Alice', age: 30, active: true },
  { name: 'Bob', age: 25, active: false },
  { name: 'Charlie', age: 35, active: true },
  { name: 'David', age: 28, active: true },
  { name: 'Eve', age: 32, active: true }
];

console.log(getTopActiveUsers(users));
// ["Charlie", "Eve", "Alice"]
```

### Async Function Composition

```javascript
// Async pipe
const asyncPipe = (...fns) => x => 
  fns.reduce(async (acc, fn) => fn(await acc), Promise.resolve(x));

// Async functions
const fetchUser = async id => {
  console.log(`Fetching user ${id}`);
  return { id, name: 'Alice', posts: [1, 2, 3] };
};

const fetchPosts = async user => {
  console.log(`Fetching posts for ${user.name}`);
  const posts = await Promise.all(
    user.posts.map(id => ({ id, title: `Post ${id}`, likes: id * 10 }))
  );
  return { ...user, posts };
};

const addStats = async user => {
  const totalLikes = user.posts.reduce((sum, p) => sum + p.likes, 0);
  return { ...user, stats: { totalLikes } };
};

// Create async pipeline
const getUserWithStats = asyncPipe(
  fetchUser,
  fetchPosts,
  addStats
);

// Usage
getUserWithStats(1).then(result => {
  console.log(result);
});
```

### Point-Free Style

```javascript
// Point-free (no explicit arguments)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

// Not point-free
const doubleNumbers = numbers => numbers.map(n => n * 2);

// Point-free style
const double = x => x * 2;
const doubleAll = arr => arr.map(double);

// Even more point-free
const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);
const reduce = fn => init => arr => arr.reduce(fn, init);

const doubleNumbers2 = map(x => x * 2);
const evenNumbers = filter(x => x % 2 === 0);
const sum = reduce((a, b) => a + b)(0);

const processNumbers = pipe(
  evenNumbers,
  doubleNumbers2,
  sum
);

console.log(processNumbers([1, 2, 3, 4, 5, 6]));
// [2, 4, 6] -> [4, 8, 12] -> 24
```

---

## Higher-Order Functions

Higher-order functions are functions that take functions as arguments or return functions.

### Map, Filter, Reduce

```javascript
// Map - transform each element
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const squared = numbers.map(x => x ** 2);
console.log(squared); // [1, 4, 9, 16, 25]

// Filter - select elements
const evens = numbers.filter(x => x % 2 === 0);
console.log(evens); // [2, 4]

const greaterThan3 = numbers.filter(x => x > 3);
console.log(greaterThan3); // [4, 5]

// Reduce - combine elements
const sum = numbers.reduce((acc, x) => acc + x, 0);
console.log(sum); // 15

const product = numbers.reduce((acc, x) => acc * x, 1);
console.log(product); // 120

// Chain operations
const result = numbers
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .reduce((acc, x) => acc + x, 0);

console.log(result); // [2, 4] -> [4, 8] -> 12
```

### Custom Higher-Order Functions

```javascript
// Create a function that runs a function n times
const times = n => fn => {
  for (let i = 0; i < n; i++) {
    fn(i);
  }
};

times(5)(i => console.log(`Iteration ${i}`));

// Create a function that retries on failure
const retry = (maxAttempts, delay = 1000) => fn => async (...args) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(...args);
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

// Usage
const unreliableAPI = async () => {
  if (Math.random() < 0.7) {
    throw new Error('API failed');
  }
  return 'Success!';
};

const reliableAPI = retry(3, 500)(unreliableAPI);

// Create a function that logs execution
const withLogging = fn => (...args) => {
  console.log(`Calling ${fn.name} with:`, args);
  const result = fn(...args);
  console.log(`${fn.name} returned:`, result);
  return result;
};

const add = (a, b) => a + b;
const loggedAdd = withLogging(add);

loggedAdd(5, 3);
// Calling add with: [5, 3]
// add returned: 8
```

### Function Decorators

```javascript
// Timing decorator
const timed = fn => (...args) => {
  const start = performance.now();
  const result = fn(...args);
  const duration = performance.now() - start;
  console.log(`${fn.name} took ${duration.toFixed(2)}ms`);
  return result;
};

// Caching decorator
const cached = fn => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    console.log('Computing...');
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Once decorator - only execute once
const once = fn => {
  let called = false;
  let result;
  
  return (...args) => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
};

// Usage
const fibonacci = n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const cachedFib = cached(fibonacci);
const timedFib = timed(cachedFib);

console.log(timedFib(10));
console.log(timedFib(10)); // Cache hit

const initialize = once(() => {
  console.log('Initializing...');
  return { initialized: true };
});

initialize(); // Logs: "Initializing..."
initialize(); // No log
initialize(); // No log
```

### Array Methods as HOFs

```javascript
// Every - all elements match predicate
const allPositive = [1, 2, 3, 4].every(x => x > 0);
console.log(allPositive); // true

// Some - at least one element matches
const hasEven = [1, 2, 3, 4].some(x => x % 2 === 0);
console.log(hasEven); // true

// Find - first element that matches
const firstEven = [1, 2, 3, 4].find(x => x % 2 === 0);
console.log(firstEven); // 2

// FindIndex - index of first match
const firstEvenIndex = [1, 2, 3, 4].findIndex(x => x % 2 === 0);
console.log(firstEvenIndex); // 1

// FlatMap - map and flatten
const nested = [1, 2, 3].flatMap(x => [x, x * 2]);
console.log(nested); // [1, 2, 2, 4, 3, 6]

// Sort with comparator
const numbers = [3, 1, 4, 1, 5, 9, 2, 6];
const sorted = [...numbers].sort((a, b) => a - b);
console.log(sorted); // [1, 1, 2, 3, 4, 5, 6, 9]
```

---

## Currying and Partial Application

Currying transforms a function with multiple arguments into a sequence of functions each taking a single argument.

### Basic Currying

```javascript
// Regular function
const add = (a, b, c) => a + b + c;

// Curried version
const curriedAdd = a => b => c => a + b + c;

console.log(add(1, 2, 3)); // 6
console.log(curriedAdd(1)(2)(3)); // 6

// Partial application
const add1 = curriedAdd(1);
const add1And2 = add1(2);

console.log(add1And2(3)); // 6
console.log(add1And2(10)); // 13
```

### Auto-Curry Function

```javascript
// Generic curry function
const curry = fn => {
  const arity = fn.length;
  
  return function curried(...args) {
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    
    return (...moreArgs) => curried.apply(this, [...args, ...moreArgs]);
  };
};

// Usage
const add = (a, b, c) => a + b + c;
const curriedAdd = curry(add);

console.log(curriedAdd(1)(2)(3)); // 6
console.log(curriedAdd(1, 2)(3)); // 6
console.log(curriedAdd(1)(2, 3)); // 6
console.log(curriedAdd(1, 2, 3)); // 6

// Practical example
const multiply = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply);

const double = curriedMultiply(2);
const doubleThenTriple = double(3);

console.log(doubleThenTriple(4)); // 24
```

### Partial Application

```javascript
// Partial application function
const partial = (fn, ...fixedArgs) => 
  (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);

// Example
const greet = (greeting, name) => `${greeting}, ${name}!`;

const sayHello = partial(greet, 'Hello');
const sayGoodbye = partial(greet, 'Goodbye');

console.log(sayHello('Alice')); // "Hello, Alice!"
console.log(sayGoodbye('Bob')); // "Goodbye, Bob!"

// More complex example
const fetch = (method, url, headers, body) => {
  console.log(`${method} ${url}`, headers, body);
  return { method, url, headers, body };
};

const get = partial(fetch, 'GET');
const post = partial(fetch, 'POST');

const getWithAuth = partial(get, undefined, { 'Authorization': 'Bearer token' });

getWithAuth('/api/users');
// GET /api/users { 'Authorization': 'Bearer token' } undefined
```

### Curried Utility Functions

```javascript
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Curried map
const map = curry((fn, arr) => arr.map(fn));

const double = x => x * 2;
const doubleAll = map(double);

console.log(doubleAll([1, 2, 3])); // [2, 4, 6]

// Curried filter
const filter = curry((predicate, arr) => arr.filter(predicate));

const isEven = x => x % 2 === 0;
const filterEvens = filter(isEven);

console.log(filterEvens([1, 2, 3, 4, 5])); // [2, 4]

// Curried reduce
const reduce = curry((fn, init, arr) => arr.reduce(fn, init));

const sum = reduce((a, b) => a + b, 0);

console.log(sum([1, 2, 3, 4, 5])); // 15

// Compose with curried functions
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const processNumbers = pipe(
  filterEvens,
  doubleAll,
  sum
);

console.log(processNumbers([1, 2, 3, 4, 5, 6]));
// [2, 4, 6] -> [4, 8, 12] -> 24
```

### Practical Currying Examples

```javascript
const curry = fn => {
  const arity = fn.length;
  return function curried(...args) {
    if (args.length >= arity) return fn(...args);
    return (...more) => curried(...args, ...more);
  };
};

// Validation
const validate = curry((rules, data) => {
  const errors = [];
  
  for (const [field, rule] of Object.entries(rules)) {
    if (!rule(data[field])) {
      errors.push(`${field} is invalid`);
    }
  }
  
  return { valid: errors.length === 0, errors };
});

const isRequired = val => val !== undefined && val !== '';
const isEmail = val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
const isMinLength = min => val => val && val.length >= min;

const userRules = {
  name: isRequired,
  email: isEmail,
  password: isMinLength(8)
};

const validateUser = validate(userRules);

console.log(validateUser({ name: 'Alice', email: 'alice@example.com', password: '12345678' }));
// { valid: true, errors: [] }

console.log(validateUser({ name: '', email: 'invalid', password: '123' }));
// { valid: false, errors: [...] }

// HTTP client
const request = curry((method, baseUrl, endpoint, options) => {
  const url = `${baseUrl}${endpoint}`;
  console.log(`${method} ${url}`, options);
  return { method, url, options };
});

const api = request('GET')('https://api.example.com');
const getUsers = api('/users');
const getUser = api('/users/:id');

getUsers({});
getUser({ params: { id: 1 } });
```

---

## Memoization

Memoization is an optimization technique that caches function results based on their inputs.

### Basic Memoization

```javascript
const memoize = fn => {
  const cache = new Map();
  
  return (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    console.log('Computing...');
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
};

// Expensive function
const fibonacci = n => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const memoizedFib = memoize(fibonacci);

console.log(memoizedFib(10)); // Computing...
console.log(memoizedFib(10)); // Cache hit
console.log(memoizedFib(15)); // Computing...
```

### Advanced Memoization

```javascript
const memoize = (fn, options = {}) => {
  const cache = new Map();
  const {
    maxSize = Infinity,
    maxAge = Infinity,
    keyGenerator = JSON.stringify
  } = options;
  
  return (...args) => {
    const key = keyGenerator(args);
    const cached = cache.get(key);
    
    // Check if cached and not expired
    if (cached && Date.now() - cached.timestamp < maxAge) {
      console.log('Cache hit');
      return cached.value;
    }
    
    // Compute result
    console.log('Computing...');
    const result = fn(...args);
    
    // Add to cache
    cache.set(key, {
      value: result,
      timestamp: Date.now()
    });
    
    // Enforce max size (LRU)
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    return result;
  };
};

// Usage with options
const expensiveCalculation = (a, b) => {
  let sum = 0;
  for (let i = 0; i < 1000000; i++) {
    sum += a + b;
  }
  return sum;
};

const memoized = memoize(expensiveCalculation, {
  maxSize: 100,
  maxAge: 5000 // 5 seconds
});

console.log(memoized(5, 3)); // Computing...
console.log(memoized(5, 3)); // Cache hit

setTimeout(() => {
  console.log(memoized(5, 3)); // Computing... (cache expired)
}, 6000);
```

### Recursive Memoization

```javascript
// Memoize recursive functions properly
const memoizeRecursive = fn => {
  const cache = new Map();
  
  const memoized = (...args) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(memoized, ...args);
    cache.set(key, result);
    return result;
  };
  
  return memoized;
};

// Fibonacci with memoization
const fibonacci = memoizeRecursive((fib, n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log(fibonacci(40)); // Fast!
console.log(fibonacci(45)); // Still fast!

// Factorial with memoization
const factorial = memoizeRecursive((fact, n) => {
  if (n <= 1) return 1;
  return n * fact(n - 1);
});

console.log(factorial(10)); // 3628800
console.log(factorial(20)); // 2432902008176640000
```

### Practical Memoization

```javascript
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

// API call memoization
const fetchUser = memoize(async id => {
  console.log(`Fetching user ${id} from API...`);
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { id, name: `User ${id}`, email: `user${id}@example.com` };
});

// Multiple calls only fetch once
Promise.all([
  fetchUser(1),
  fetchUser(1),
  fetchUser(1)
]).then(results => {
  console.log(results);
  // Only logs "Fetching user 1 from API..." once
});

// Expensive calculation memoization
const calculateDistance = memoize((x1, y1, x2, y2) => {
  console.log('Calculating distance...');
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
});

console.log(calculateDistance(0, 0, 3, 4)); // Calculating... 5
console.log(calculateDistance(0, 0, 3, 4)); // 5 (cached)
```

---

## Pure Functions

Pure functions always return the same output for the same inputs and have no side effects.

### Pure vs Impure Functions

```javascript
// IMPURE - depends on external state
let counter = 0;

const incrementImpure = () => {
  counter++; // Side effect: modifies external state
  return counter;
};

console.log(incrementImpure()); // 1
console.log(incrementImpure()); // 2 (different result with same input)

// PURE - no side effects
const incrementPure = count => count + 1;

console.log(incrementPure(0)); // 1
console.log(incrementPure(0)); // 1 (same result with same input)

// IMPURE - modifies input
const addItemImpure = (cart, item) => {
  cart.push(item); // Mutates input
  return cart;
};

// PURE - returns new array
const addItemPure = (cart, item) => [...cart, item];

const cart = [{ name: 'Book', price: 10 }];

const cart2 = addItemPure(cart, { name: 'Pen', price: 2 });
console.log(cart); // Original unchanged
console.log(cart2); // New cart with item
```

### Benefits of Pure Functions

```javascript
// Easy to test
const add = (a, b) => a + b;
const multiply = (a, b) => a * b;

// Tests are simple and reliable
console.assert(add(2, 3) === 5);
console.assert(multiply(2, 3) === 6);

// Easy to compose
const addThenMultiply = (a, b, c) => multiply(add(a, b), c);
console.log(addThenMultiply(2, 3, 4)); // (2 + 3) * 4 = 20

// Cacheable (memoization)
const memoize = fn => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) {
      cache.set(key, fn(...args));
    }
    return cache.get(key);
  };
};

const expensiveAdd = memoize(add);

// Parallelizable - no race conditions
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(x => x * 2); // Can be parallelized safely
```

### Making Functions Pure

```javascript
// IMPURE - reads from Date
const getCurrentYear = () => {
  return new Date().getFullYear();
};

// PURE - date passed as parameter
const getYear = date => date.getFullYear();

console.log(getYear(new Date())); // Pass dependency explicitly

// IMPURE - random number
const rollDiceImpure = () => {
  return Math.floor(Math.random() * 6) + 1;
};

// PURE - random number generator passed in
const rollDicePure = rng => {
  return Math.floor(rng() * 6) + 1;
};

console.log(rollDicePure(Math.random));

// IMPURE - DOM access
const getInputValueImpure = () => {
  return document.getElementById('myInput').value;
};

// PURE - element passed as parameter
const getInputValuePure = element => element.value;

// IMPURE - HTTP request
const fetchUserImpure = async id => {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
};

// PURE - HTTP client passed as dependency
const fetchUserPure = httpClient => async id => {
  const response = await httpClient.get(`/api/users/${id}`);
  return response.json();
};
```

### Pure Function Patterns

```javascript
// Array operations without mutation
const numbers = [1, 2, 3, 4, 5];

// IMPURE
const removeFirstImpure = arr => {
  arr.shift(); // Mutates array
  return arr;
};

// PURE
const removeFirstPure = arr => arr.slice(1);

console.log(removeFirstPure(numbers)); // [2, 3, 4, 5]
console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)

// Object operations without mutation
const user = { name: 'Alice', age: 30 };

// IMPURE
const updateAgeImpure = (user, age) => {
  user.age = age; // Mutates object
  return user;
};

// PURE
const updateAgePure = (user, age) => ({ ...user, age });

console.log(updateAgePure(user, 31)); // { name: 'Alice', age: 31 }
console.log(user); // { name: 'Alice', age: 30 } (unchanged)

// Nested object updates
const state = {
  user: {
    profile: {
      name: 'Alice',
      settings: {
        theme: 'light'
      }
    }
  }
};

// PURE nested update
const updateTheme = (state, theme) => ({
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.user.profile,
      settings: {
        ...state.user.profile.settings,
        theme
      }
    }
  }
});

const newState = updateTheme(state, 'dark');
console.log(newState.user.profile.settings.theme); // 'dark'
console.log(state.user.profile.settings.theme); // 'light' (unchanged)
```

---

## Immutability Patterns

Immutability means data cannot be changed after creation. Instead, new copies are created with modifications.

### Immutable Arrays

```javascript
const numbers = [1, 2, 3, 4, 5];

// Add element
const withSix = [...numbers, 6];
console.log(withSix); // [1, 2, 3, 4, 5, 6]

// Remove element
const withoutThree = numbers.filter(x => x !== 3);
console.log(withoutThree); // [1, 2, 4, 5]

// Update element
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// Update specific index
const updateAtIndex = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index + 1)
];

const updated = updateAtIndex(numbers, 2, 99);
console.log(updated); // [1, 2, 99, 4, 5]

// Insert at index
const insertAtIndex = (arr, index, value) => [
  ...arr.slice(0, index),
  value,
  ...arr.slice(index)
];

const inserted = insertAtIndex(numbers, 2, 99);
console.log(inserted); // [1, 2, 99, 3, 4, 5]

// Sort (immutable)
const sortedDesc = [...numbers].sort((a, b) => b - a);
console.log(sortedDesc); // [5, 4, 3, 2, 1]
console.log(numbers); // [1, 2, 3, 4, 5] (unchanged)
```

### Immutable Objects

```javascript
const user = {
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
};

// Update property
const olderUser = { ...user, age: 31 };
console.log(olderUser);

// Add property
const userWithPhone = { ...user, phone: '123-456-7890' };
console.log(userWithPhone);

// Remove property
const { email, ...userWithoutEmail } = user;
console.log(userWithoutEmail);

// Deep update
const state = {
  user: {
    profile: { name: 'Alice', age: 30 },
    settings: { theme: 'light' }
  }
};

// Helper for deep updates
const updateIn = (obj, path, value) => {
  const [head, ...rest] = path;
  
  if (rest.length === 0) {
    return { ...obj, [head]: value };
  }
  
  return {
    ...obj,
    [head]: updateIn(obj[head], rest, value)
  };
};

const newState = updateIn(state, ['user', 'profile', 'age'], 31);
console.log(newState.user.profile.age); // 31
console.log(state.user.profile.age); // 30 (unchanged)
```

### Immutable Data Structures

```javascript
// Immutable List
class ImmutableList {
  constructor(items = []) {
    this.items = Object.freeze([...items]);
  }
  
  push(item) {
    return new ImmutableList([...this.items, item]);
  }
  
  pop() {
    return new ImmutableList(this.items.slice(0, -1));
  }
  
  map(fn) {
    return new ImmutableList(this.items.map(fn));
  }
  
  filter(fn) {
    return new ImmutableList(this.items.filter(fn));
  }
  
  get(index) {
    return this.items[index];
  }
  
  toArray() {
    return [...this.items];
  }
}

const list = new ImmutableList([1, 2, 3]);
const list2 = list.push(4);
const list3 = list2.map(x => x * 2);

console.log(list.toArray()); // [1, 2, 3]
console.log(list2.toArray()); // [1, 2, 3, 4]
console.log(list3.toArray()); // [2, 4, 6, 8]

// Immutable Map
class ImmutableMap {
  constructor(obj = {}) {
    this.data = Object.freeze({ ...obj });
  }
  
  set(key, value) {
    return new ImmutableMap({ ...this.data, [key]: value });
  }
  
  delete(key) {
    const { [key]: _, ...rest } = this.data;
    return new ImmutableMap(rest);
  }
  
  get(key) {
    return this.data[key];
  }
  
  has(key) {
    return key in this.data;
  }
  
  toObject() {
    return { ...this.data };
  }
}

const map = new ImmutableMap({ a: 1, b: 2 });
const map2 = map.set('c', 3);
const map3 = map2.delete('b');

console.log(map.toObject()); // { a: 1, b: 2 }
console.log(map2.toObject()); // { a: 1, b: 2, c: 3 }
console.log(map3.toObject()); // { a: 1, c: 3 }
```

### Object.freeze and Const

```javascript
// const prevents reassignment
const arr = [1, 2, 3];
// arr = [4, 5, 6]; // Error
arr.push(4); // But can still mutate!
console.log(arr); // [1, 2, 3, 4]

// Object.freeze prevents mutation
const frozenArr = Object.freeze([1, 2, 3]);
frozenArr.push(4); // Silently fails (throws in strict mode)
console.log(frozenArr); // [1, 2, 3]

const obj = { name: 'Alice', age: 30 };
const frozenObj = Object.freeze(obj);
frozenObj.age = 31; // Silently fails
console.log(frozenObj.age); // 30

// Deep freeze
const deepFreeze = obj => {
  Object.freeze(obj);
  
  Object.values(obj).forEach(value => {
    if (typeof value === 'object' && value !== null) {
      deepFreeze(value);
    }
  });
  
  return obj;
};

const nested = {
  user: {
    profile: {
      name: 'Alice',
      settings: { theme: 'light' }
    }
  }
};

deepFreeze(nested);
nested.user.profile.settings.theme = 'dark'; // Fails
console.log(nested.user.profile.settings.theme); // 'light'
```

### Immutability Helpers

```javascript
// Update helpers
const immutable = {
  set: (obj, key, value) => ({ ...obj, [key]: value }),
  
  delete: (obj, key) => {
    const { [key]: _, ...rest } = obj;
    return rest;
  },
  
  update: (obj, key, fn) => ({
    ...obj,
    [key]: fn(obj[key])
  }),
  
  merge: (obj, updates) => ({ ...obj, ...updates }),
  
  // Array helpers
  push: (arr, item) => [...arr, item],
  
  pop: arr => arr.slice(0, -1),
  
  unshift: (arr, item) => [item, ...arr],
  
  shift: arr => arr.slice(1),
  
  splice: (arr, start, deleteCount, ...items) => [
    ...arr.slice(0, start),
    ...items,
    ...arr.slice(start + deleteCount)
  ],
  
  setIndex: (arr, index, value) => [
    ...arr.slice(0, index),
    value,
    ...arr.slice(index + 1)
  ]
};

// Usage
const user = { name: 'Alice', age: 30 };

const updated = immutable.set(user, 'age', 31);
const withEmail = immutable.merge(updated, { email: 'alice@example.com' });
const incremented = immutable.update(withEmail, 'age', age => age + 1);

console.log(incremented);
// { name: 'Alice', age: 32, email: 'alice@example.com' }

const numbers = [1, 2, 3, 4, 5];
const modified = immutable.splice(numbers, 2, 1, 99, 100);
console.log(modified); // [1, 2, 99, 100, 4, 5]
```

---

## Summary

This document covered Functional Programming Patterns:

- **Function Composition**: Combining functions (compose, pipe, async composition, point-free style)
- **Higher-Order Functions**: Functions that take or return functions (map/filter/reduce, decorators, custom HOFs)
- **Currying and Partial Application**: Transforming functions (auto-curry, partial application, practical examples)
- **Memoization**: Caching function results (basic memoization, advanced options, recursive memoization)
- **Pure Functions**: Functions without side effects (pure vs impure, making functions pure, benefits)
- **Immutability Patterns**: Unchangeable data (immutable arrays/objects, data structures, freeze, helpers)

These patterns promote predictable, testable, and maintainable code through functional programming principles.

---

**Related Topics:**

- Async Patterns
- Functional Libraries (Ramda, Lodash/FP)
- Category Theory
- Monads and Functors
# Async Patterns

## Table of Contents

- [Promise Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#promise-patterns)
- [Async/Await Patterns](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#asyncawait-patterns)
- [Observable Pattern](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#observable-pattern)
- [Reactive Programming Concepts](https://claude.ai/chat/05dbd0b9-25d5-4da3-9c76-0a6472c2db52#reactive-programming-concepts)

---

## Async Patterns

Async patterns help manage asynchronous operations, handling callbacks, promises, and event-driven programming effectively.

---

## Promise Patterns

Promises represent the eventual completion or failure of an asynchronous operation.

### Basic Promise Patterns

```javascript
// Creating promises
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchUser = id => new Promise((resolve, reject) => {
  setTimeout(() => {
    if (id > 0) {
      resolve({ id, name: `User ${id}` });
    } else {
      reject(new Error('Invalid ID'));
    }
  }, 1000);
});

// Using promises
fetchUser(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error));

// Chaining promises
fetchUser(1)
  .then(user => {
    console.log('Fetched user:', user);
    return fetchUser(2);
  })
  .then(user2 => {
    console.log('Fetched user 2:', user2);
  })
  .catch(error => console.error('Error:', error));
```

### Promise.all - Parallel Execution

```javascript
// Execute multiple promises in parallel
const fetchMultipleUsers = async ids => {
  const promises = ids.map(id => fetchUser(id));
  return Promise.all(promises);
};

fetchMultipleUsers([1, 2, 3])
  .then(users => {
    console.log('All users:', users);
  })
  .catch(error => {
    console.error('One or more requests failed:', error);
  });

// Practical example: Fetch data from multiple APIs
const fetchDashboardData = async () => {
  try {
    const [users, posts, comments] = await Promise.all([
      fetch('/api/users').then(r => r.json()),
      fetch('/api/posts').then(r => r.json()),
      fetch('/api/comments').then(r => r.json())
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    throw error;
  }
};
```

### Promise.race - First to Complete

```javascript
// Return first promise to resolve/reject
const timeout = ms => new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Timeout')), ms)
);

const fetchWithTimeout = (url, ms) => {
  return Promise.race([
    fetch(url),
    timeout(ms)
  ]);
};

// Usage
fetchWithTimeout('/api/data', 5000)
  .then(response => response.json())
  .then(data => console.log('Data:', data))
  .catch(error => console.error('Request failed or timed out:', error));

// Practical: Multiple endpoints, use first response
const fetchFromMirrors = urls => {
  const promises = urls.map(url => 
    fetch(url).then(r => r.json())
  );
  
  return Promise.race(promises);
};

fetchFromMirrors([
  'https://api1.example.com/data',
  'https://api2.example.com/data',
  'https://api3.example.com/data'
]).then(data => console.log('Fastest response:', data));
```

### Promise.allSettled - All Results

```javascript
// Wait for all promises to settle (resolve or reject)
const fetchAllData = async ids => {
  const promises = ids.map(id => fetchUser(id));
  const results = await Promise.allSettled(promises);
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
  
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
  
  return { successful, failed };
};

fetchAllData([1, 2, -1, 3])
  .then(({ successful, failed }) => {
    console.log('Successful:', successful);
    console.log('Failed:', failed);
  });

// Practical: Batch operations with error handling
const batchUpdate = async items => {
  const promises = items.map(item => updateItem(item));
  const results = await Promise.allSettled(promises);
  
  return {
    succeeded: results.filter(r => r.status === 'fulfilled').length,
    failed: results.filter(r => r.status === 'rejected').length,
    results
  };
};
```

### Promise.any - First Successful

```javascript
// Return first promise to resolve (ignore rejections)
const fetchFromBackups = urls => {
  const promises = urls.map(url => 
    fetch(url).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
  );
  
  return Promise.any(promises);
};

fetchFromBackups([
  'https://primary.example.com/data',
  'https://backup1.example.com/data',
  'https://backup2.example.com/data'
])
  .then(data => console.log('Data from first successful:', data))
  .catch(error => console.error('All requests failed:', error));
```

### Sequential Promise Execution

```javascript
// Execute promises one after another
const sequential = async (tasks) => {
  const results = [];
  
  for (const task of tasks) {
    const result = await task();
    results.push(result);
  }
  
  return results;
};

// Usage
const tasks = [
  () => fetchUser(1),
  () => fetchUser(2),
  () => fetchUser(3)
];

sequential(tasks)
  .then(results => console.log('Sequential results:', results));

// Reduce pattern
const sequentialReduce = tasks => {
  return tasks.reduce(
    (promise, task) => promise.then(results => 
      task().then(result => [...results, result])
    ),
    Promise.resolve([])
  );
};

sequentialReduce(tasks)
  .then(results => console.log('Results:', results));
```

### Promise Retry Pattern

```javascript
const retry = (fn, maxAttempts, delay = 1000) => {
  return new Promise(async (resolve, reject) => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        resolve(result);
        return;
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxAttempts) {
          reject(error);
          return;
        }
        
        await new Promise(r => setTimeout(r, delay));
      }
    }
  });
};

// Usage
const unreliableAPI = () => {
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.7) {
      reject(new Error('API failed'));
    } else {
      resolve({ data: 'Success!' });
    }
  });
};

retry(unreliableAPI, 3, 500)
  .then(result => console.log('Success:', result))
  .catch(error => console.error('All attempts failed:', error));

// Exponential backoff
const retryWithBackoff = async (fn, maxAttempts) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s...
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
};
```

### Promise Queue

```javascript
class PromiseQueue {
  constructor(concurrency = 1) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }
  
  async run() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { task, resolve, reject } = this.queue.shift();
    
    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.run();
    }
  }
}

// Usage
const queue = new PromiseQueue(2); // Max 2 concurrent

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => new Promise(resolve => {
    console.log(`Task ${i} started`);
    setTimeout(() => {
      console.log(`Task ${i} completed`);
      resolve(i);
    }, 1000);
  })
);

Promise.all(tasks.map(task => queue.add(task)))
  .then(results => console.log('All tasks completed:', results));
```

### Promisify Pattern

```javascript
// Convert callback-based functions to promises
const promisify = fn => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn(...args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };
};

// Example: Node.js style callback
const readFile = (path, callback) => {
  setTimeout(() => {
    if (path) {
      callback(null, `Contents of ${path}`);
    } else {
      callback(new Error('Invalid path'));
    }
  }, 100);
};

const readFilePromise = promisify(readFile);

readFilePromise('file.txt')
  .then(contents => console.log(contents))
  .catch(error => console.error(error));

// Generic promisify for multiple arguments
const promisifyAll = obj => {
  const promisified = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'function') {
      promisified[key] = promisify(obj[key].bind(obj));
    }
  }
  
  return promisified;
};
```

---

## Async/Await Patterns

Async/await provides syntactic sugar for working with promises, making async code look synchronous.

### Basic Async/Await

```javascript
// Async function always returns a promise
async function fetchUser(id) {
  const response = await fetch(`/api/users/${id}`);
  const user = await response.json();
  return user;
}

// Error handling with try/catch
async function fetchUserSafe(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
}

// Usage
fetchUserSafe(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error));
```

### Parallel Async Operations

```javascript
// Sequential (slow)
async function fetchSequential() {
  const user = await fetchUser(1);      // Wait 1s
  const posts = await fetchPosts(1);    // Wait 1s
  const comments = await fetchComments(1); // Wait 1s
  // Total: 3s
  
  return { user, posts, comments };
}

// Parallel (fast)
async function fetchParallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),        // Start all
    fetchPosts(1),       // at the
    fetchComments(1)     // same time
  ]);
  // Total: 1s (assuming all take 1s)
  
  return { user, posts, comments };
}

// Conditional parallel
async function fetchUserData(userId) {
  // Fetch user first
  const user = await fetchUser(userId);
  
  // Then fetch posts and friends in parallel
  const [posts, friends] = await Promise.all([
    fetchPosts(userId),
    fetchFriends(userId)
  ]);
  
  return { user, posts, friends };
}
```

### Async Error Handling

```javascript
// Multiple try/catch blocks
async function fetchWithMultipleErrors() {
  let user;
  let posts;
  
  try {
    user = await fetchUser(1);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    user = null;
  }
  
  try {
    posts = await fetchPosts(1);
  } catch (error) {
    console.error('Failed to fetch posts:', error);
    posts = [];
  }
  
  return { user, posts };
}

// Error boundaries
async function withErrorBoundary(fn, fallback) {
  try {
    return await fn();
  } catch (error) {
    console.error('Error caught by boundary:', error);
    return fallback;
  }
}

// Usage
const user = await withErrorBoundary(
  () => fetchUser(1),
  { name: 'Guest', id: 0 }
);

// Finally clause
async function fetchWithCleanup() {
  const connection = await openConnection();
  
  try {
    const data = await fetchData(connection);
    return data;
  } catch (error) {
    console.error('Fetch failed:', error);
    throw error;
  } finally {
    await closeConnection(connection);
    console.log('Connection closed');
  }
}
```

### Async Iteration

```javascript
// For await...of
async function* asyncGenerator() {
  for (let i = 1; i <= 5; i++) {
    await delay(1000);
    yield i;
  }
}

async function processAsyncSequence() {
  for await (const value of asyncGenerator()) {
    console.log('Value:', value);
  }
}

// Async iteration over promises
async function* fetchUsers(ids) {
  for (const id of ids) {
    yield await fetchUser(id);
  }
}

async function displayUsers() {
  for await (const user of fetchUsers([1, 2, 3, 4, 5])) {
    console.log('User:', user.name);
  }
}

// Async map
async function asyncMap(array, asyncFn) {
  const results = [];
  
  for (const item of array) {
    results.push(await asyncFn(item));
  }
  
  return results;
}

// Usage
const userIds = [1, 2, 3, 4, 5];
const users = await asyncMap(userIds, fetchUser);

// Parallel async map
async function asyncMapParallel(array, asyncFn) {
  return Promise.all(array.map(asyncFn));
}

const usersParallel = await asyncMapParallel(userIds, fetchUser);
```

### Async Control Flow

```javascript
// Async while loop
async function pollUntilComplete(checkFn, interval = 1000) {
  while (true) {
    const result = await checkFn();
    
    if (result.complete) {
      return result.data;
    }
    
    await delay(interval);
  }
}

// Usage
const jobResult = await pollUntilComplete(
  async () => {
    const status = await checkJobStatus(jobId);
    return {
      complete: status === 'completed',
      data: status
    };
  },
  2000
);

// Async forEach
async function asyncForEach(array, callback) {
  for (let i = 0; i < array.length; i++) {
    await callback(array[i], i, array);
  }
}

// Usage
await asyncForEach([1, 2, 3], async (num) => {
  await delay(1000);
  console.log(num);
});

// Async reduce
async function asyncReduce(array, reducer, initialValue) {
  let accumulator = initialValue;
  
  for (const item of array) {
    accumulator = await reducer(accumulator, item);
  }
  
  return accumulator;
}

// Usage
const total = await asyncReduce(
  [1, 2, 3, 4, 5],
  async (sum, num) => {
    await delay(100);
    return sum + num;
  },
  0
);
```

### Async Memoization

```javascript
const asyncMemoize = fn => {
  const cache = new Map();
  const pending = new Map();
  
  return async (...args) => {
    const key = JSON.stringify(args);
    
    // Return cached result
    if (cache.has(key)) {
      console.log('Cache hit');
      return cache.get(key);
    }
    
    // Return pending promise if in progress
    if (pending.has(key)) {
      console.log('Waiting for pending request');
      return pending.get(key);
    }
    
    // Create new promise
    console.log('New request');
    const promise = fn(...args);
    pending.set(key, promise);
    
    try {
      const result = await promise;
      cache.set(key, result);
      return result;
    } finally {
      pending.delete(key);
    }
  };
};

// Usage
const fetchUserMemoized = asyncMemoize(fetchUser);

// Multiple calls with same ID
const results = await Promise.all([
  fetchUserMemoized(1),
  fetchUserMemoized(1),
  fetchUserMemoized(1)
]);
// Only one actual fetch, others wait or use cache
```

### Async Pipeline

```javascript
const asyncPipe = (...fns) => async x => {
  let result = x;
  
  for (const fn of fns) {
    result = await fn(result);
  }
  
  return result;
};

// Async transformations
const fetchUserData = async id => {
  await delay(100);
  return { id, name: `User ${id}` };
};

const enrichWithPosts = async user => {
  await delay(100);
  return {
    ...user,
    posts: [{ id: 1, title: 'Post 1' }]
  };
};

const calculateStats = async user => {
  await delay(100);
  return {
    ...user,
    stats: { postCount: user.posts.length }
  };
};

// Create pipeline
const getUserComplete = asyncPipe(
  fetchUserData,
  enrichWithPosts,
  calculateStats
);

// Usage
const completeUser = await getUserComplete(1);
console.log(completeUser);
```

---

## Observable Pattern

Observables represent a stream of asynchronous events.

### Basic Observable

```javascript
class Observable {
  constructor(subscribe) {
    this.subscribe = subscribe;
  }
  
  static create(subscribe) {
    return new Observable(subscribe);
  }
  
  map(fn) {
    return Observable.create(observer => {
      return this.subscribe({
        next: value => observer.next(fn(value)),
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  filter(predicate) {
    return Observable.create(observer => {
      return this.subscribe({
        next: value => {
          if (predicate(value)) {
            observer.next(value);
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}

// Create observable
const numbers$ = Observable.create(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.next(4);
  observer.next(5);
  observer.complete();
  
  // Return cleanup function
  return () => console.log('Cleanup');
});

// Subscribe
const subscription = numbers$
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .subscribe({
    next: value => console.log('Value:', value),
    error: err => console.error('Error:', err),
    complete: () => console.log('Complete')
  });
// Value: 4
// Value: 8
// Complete
```

### Event Observable

```javascript
class Observable {
  constructor(subscribe) {
    this.subscribe = subscribe;
  }
  
  static fromEvent(element, eventName) {
    return new Observable(observer => {
      const handler = event => observer.next(event);
      
      element.addEventListener(eventName, handler);
      
      // Return cleanup
      return () => {
        element.removeEventListener(eventName, handler);
      };
    });
  }
  
  static interval(ms) {
    return new Observable(observer => {
      let count = 0;
      const id = setInterval(() => {
        observer.next(count++);
      }, ms);
      
      return () => clearInterval(id);
    });
  }
  
  static of(...values) {
    return new Observable(observer => {
      values.forEach(value => observer.next(value));
      observer.complete();
    });
  }
}

// Usage
const clicks$ = Observable.fromEvent(button, 'click');

clicks$.subscribe({
  next: event => console.log('Clicked at:', event.clientX, event.clientY)
});

const timer$ = Observable.interval(1000);

const subscription = timer$.subscribe({
  next: count => console.log('Count:', count)
});

// Stop after 5 seconds
setTimeout(() => subscription(), 5000);
```

### Observable Operators

```javascript
class Observable {
  // ... previous code ...
  
  take(count) {
    return Observable.create(observer => {
      let taken = 0;
      
      return this.subscribe({
        next: value => {
          if (taken < count) {
            observer.next(value);
            taken++;
            
            if (taken === count) {
              observer.complete();
            }
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  debounce(ms) {
    return Observable.create(observer => {
      let timeoutId;
      
      return this.subscribe({
        next: value => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            observer.next(value);
          }, ms);
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  throttle(ms) {
    return Observable.create(observer => {
      let lastTime = 0;
      
      return this.subscribe({
        next: value => {
          const now = Date.now();
          
          if (now - lastTime >= ms) {
            observer.next(value);
            lastTime = now;
          }
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
  
  scan(reducer, seed) {
    return Observable.create(observer => {
      let accumulator = seed;
      
      return this.subscribe({
        next: value => {
          accumulator = reducer(accumulator, value);
          observer.next(accumulator);
        },
        error: err => observer.error(err),
        complete: () => observer.complete()
      });
    });
  }
}

// Usage
const clicks$ = Observable.fromEvent(button, 'click');

// Debounce clicks
clicks$
  .debounce(300)
  .subscribe({ next: () => console.log('Clicked') });

// Count clicks
clicks$
  .scan((count, _) => count + 1, 0)
  .subscribe({ next: count => console.log('Click count:', count) });

// Take first 5 clicks
clicks$
  .take(5)
  .subscribe({
    next: () => console.log('Click'),
    complete: () => console.log('Done after 5 clicks')
  });
```

### Subject (Hot Observable)

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
    
    return () => {
      const index = this.observers.indexOf(observer);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }
  
  next(value) {
    this.observers.forEach(observer => {
      if (observer.next) {
        observer.next(value);
      }
    });
  }
  
  error(err) {
    this.observers.forEach(observer => {
      if (observer.error) {
        observer.error(err);
      }
    });
  }
  
  complete() {
    this.observers.forEach(observer => {
      if (observer.complete) {
        observer.complete();
      }
    });
    this.observers = [];
  }
}

// Usage
const subject = new Subject();

// Multiple subscribers
subject.subscribe({
  next: value => console.log('Subscriber 1:', value)
});

subject.subscribe({
  next: value => console.log('Subscriber 2:', value)
});

// Emit values
subject.next(1); // Both subscribers receive
subject.next(2); // Both subscribers receive

// BehaviorSubject - remembers last value
class BehaviorSubject extends Subject {
  constructor(initialValue) {
    super();
    this.currentValue = initialValue;
  }
  
  subscribe(observer) {
    observer.next(this.currentValue);
    return super.subscribe(observer);
  }
  
  next(value) {
    this.currentValue = value;
    super.next(value);
  }
  
  getValue() {
    return this.currentValue;
  }
}

const behavior$ = new BehaviorSubject(0);

behavior$.subscribe({
  next: value => console.log('Sub 1:', value)
}); // Immediately logs: Sub 1: 0

behavior$.next(1); // Sub 1: 1

behavior$.subscribe({
  next: value => console.log('Sub 2:', value)
}); // Immediately logs: Sub 2: 1
```

---

## Reactive Programming Concepts

Reactive programming is about working with asynchronous data streams.

### Stream Composition

```javascript
// Combining multiple streams
class Observable {
  // ... previous code ...
  
  static merge(...observables) {
    return Observable.create(observer => {
      const subscriptions = observables.map(obs =>
        obs.subscribe({
          next: value => observer.next(value),
          error: err => observer.error(err)
        })
      );
      
      return () => subscriptions.forEach(unsub => unsub());
    });
  }
  
  static combineLatest(...observables) {
    return Observable.create(observer => {
      const values = new Array(observables.length);
      const hasValue = new Array(observables.length).fill(false);
      let completed = 0;
      
      const subscriptions = observables.map((obs, index) =>
        obs.subscribe({
          next: value => {
            values[index] = value;
            hasValue[index] = true;
            
            if (hasValue.every(Boolean)) {
              observer.next([...values]);
            }
          },
          complete: () => {
            completed++;
            if (completed === observables.length) {
              observer.complete();
            }
          }
        })
      );
      
      return () => subscriptions.forEach(unsub => unsub());
    });
  }
}

// Usage
const temp$ = Observable.interval(1000).map(() => 
  Math.round(Math.random() * 30 + 10)
);

const humidity$ = Observable.interval(1500).map(() => 
  Math.round(Math.random() * 50 + 30)
);

Observable.combineLatest(temp$, humidity$)
  .subscribe({
    next: ([temp, humidity]) => {
      console.log(`Temperature: ${temp}°C, Humidity: ${humidity}%`);
    }
  });
```

### Reactive State Management

```javascript
class Store {
  constructor(initialState) {
    this.state$ = new BehaviorSubject(initialState);
  }
  
  select(selector) {
    return this.state$.map(selector);
  }
  
  setState(updater) {
    const currentState = this.state$.getValue();
    const newState = typeof updater === 'function'
      ? updater(currentState)
      : { ...currentState, ...updater };
    
    this.state$.next(newState);
  }
  
  getState() {
    return this.state$.getValue();
  }
}

// Usage
const store = new Store({
  user: null,
  count: 0,
  items: []
});

// Subscribe to specific parts
store.select(state => state.count).subscribe({
  next: count => console.log('Count:', count)
});

store.select(state => state.user).subscribe({
  next: user => console.log('User:', user)
});

// Update state
store.setState({ count: 1 }); // Count: 1
store.setState(state => ({ count: state.count + 1 })); // Count: 2
store.setState({ user: { name: 'Alice' } }); // User: { name: 'Alice' }
```

### Reactive Forms

```javascript
class FormControl {
  constructor(initialValue = '') {
    this.value$ = new BehaviorSubject(initialValue);
    this.errors$ = new BehaviorSubject([]);
    this.validators = [];
  }
  
  setValue(value) {
    this.value$.next(value);
    this.validate();
  }
  
  addValidator(validator) {
    this.validators.push(validator);
    this.validate();
  }
  
  validate() {
    const value = this.value$.getValue();
    const errors = [];
    
    for (const validator of this.validators) {
      const error = validator(value);
      if (error) errors.push(error);
    }
    
    this.errors$.next(errors);
  }
  
  get isValid$() {
    return this.errors$.map(errors => errors.length === 0);
  }
}

// Usage
const emailControl = new FormControl('');

emailControl.addValidator(value => 
  !value ? 'Required' : null
);

emailControl.addValidator(value =>
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email' : null
);

// Subscribe to changes
emailControl.value$.subscribe({
  next: value => console.log('Email:', value)
});

emailControl.errors$.subscribe({
  next: errors => console.log('Errors:', errors)
});

emailControl.isValid$.subscribe({
  next: isValid => console.log('Valid:', isValid)
});

// User types
emailControl.setValue('test'); // Invalid email
emailControl.setValue('test@example.com'); // Valid
```

### Reactive Data Flow

```javascript
// Data flow with transformations
class DataFlow {
  constructor() {
    this.source$ = new Subject();
    
    // Transform stream
    this.processed$ = this.source$
      .filter(data => data.value > 0)
      .map(data => ({
        ...data,
        doubled: data.value * 2
      }))
      .debounce(300);
    
    // Side effects
    this.processed$.subscribe({
      next: data => this.saveToDatabase(data)
    });
    
    // Aggregations
    this.count$ = this.source$
      .scan((count, _) => count + 1, 0);
    
    this.sum$ = this.source$
      .filter(data => data.value > 0)
      .map(data => data.value)
      .scan((sum, value) => sum + value, 0);
  }
  
  emit(data) {
    this.source$.next(data);
  }
  
  saveToDatabase(data) {
    console.log('Saving to database:', data);
  }
}

// Usage
const flow = new DataFlow();

flow.count$.subscribe({
  next: count => console.log('Count:', count)
});

flow.sum$.subscribe({
  next: sum => console.log('Sum:', sum)
});

flow.emit({ value: 5 });
flow.emit({ value: -3 });
flow.emit({ value: 10 });
```

---

## Summary

This document covered Async Programming Patterns:

- **Promise Patterns**: Basic promises, Promise.all/race/allSettled/any, sequential execution, retry, queue, promisify
- **Async/Await Patterns**: Basic async/await, parallel operations, error handling, async iteration, control flow, memoization, pipelines
- **Observable Pattern**: Basic observables, event observables, operators (map, filter, debounce, throttle), subjects
- **Reactive Programming**: Stream composition, reactive state management, reactive forms, data flow

These patterns enable effective handling of asynchronous operations and event-driven programming.

---

**Related Topics:**

- RxJS Library
- Promise Libraries (Bluebird, Q)
- Async Generators
- WebSockets and Real-time Communication

## 22.6 Design Patterns Summary

| Category | Patterns |
|----------|----------|
| **Creational** | Factory, Singleton, Builder, Prototype |
| **Structural** | Adapter, Decorator, Facade, Proxy |
| **Behavioral** | Observer, Strategy, Command, State |
| **Functional** | Composition, Currying, Memoization |
| **Async** | Promise chains, Async Queue, Retry |

---

**End of Chapter 22: Design Patterns**
