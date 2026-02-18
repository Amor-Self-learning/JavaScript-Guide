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