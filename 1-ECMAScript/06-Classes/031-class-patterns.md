## 6.4 Class Patterns

Advanced patterns and techniques for working with classes in JavaScript.

### Mixins

Mixins allow you to add functionality to classes without using inheritance. They're useful for sharing behavior between unrelated classes.

**Object-Based Mixin:**

```javascript
// Mixin as an object
const TimestampMixin = {
  setTimestamp() {
    this.createdAt = new Date();
  },
  
  updateTimestamp() {
    this.updatedAt = new Date();
  },
  
  getAge() {
    return new Date() - this.createdAt;
  }
};

// Apply mixin to a class
class User {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(User.prototype, TimestampMixin);

const user = new User('Alice');
user.setTimestamp();
console.log(user.createdAt); // Current date
```

**Function-Based Mixin (More Powerful):**

```javascript
// Mixin as a function that extends a base class
function withLogging(Base) {
  return class extends Base {
    log(message) {
      console.log(`[${this.constructor.name}] ${message}`);
    }
    
    logMethod(methodName, ...args) {
      console.log(`[${this.constructor.name}.${methodName}] Called with:`, args);
    }
  };
}

function withValidation(Base) {
  return class extends Base {
    validate(data, rules) {
      const errors = [];
      for (const [field, rule] of Object.entries(rules)) {
        if (rule.required && !data[field]) {
          errors.push(`${field} is required`);
        }
        if (rule.minLength && data[field].length < rule.minLength) {
          errors.push(`${field} must be at least ${rule.minLength} characters`);
        }
      }
      return errors;
    }
  };
}

function withSerialization(Base) {
  return class extends Base {
    toJSON() {
      return JSON.stringify(this);
    }
    
    static fromJSON(json) {
      const data = JSON.parse(json);
      return new this(data);
    }
  };
}

// Base class
class Entity {
  constructor(id) {
    this.id = id;
  }
}

// Apply multiple mixins
class User extends withSerialization(withValidation(withLogging(Entity))) {
  constructor(id, name, email) {
    super(id);
    this.logMethod('constructor', id, name, email);
    
    const errors = this.validate({ name, email }, {
      name: { required: true, minLength: 2 },
      email: { required: true }
    });
    
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    this.name = name;
    this.email = email;
  }
  
  save() {
    this.log('Saving user...');
    // Save logic
  }
}

const user = new User(1, 'Alice', 'alice@example.com');
user.save(); // Uses logging mixin
```

**Multiple Mixins Pattern:**

```javascript
// Define mixins
const Flyable = (Base) => class extends Base {
  fly() {
    console.log(`${this.name} is flying`);
  }
};

const Swimmable = (Base) => class extends Base {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

const Walkable = (Base) => class extends Base {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

// Base class
class Animal {
  constructor(name) {
    this.name = name;
  }
}

// Compose different combinations
class Duck extends Swimmable(Flyable(Walkable(Animal))) {
  quack() {
    console.log(`${this.name} says: Quack!`);
  }
}

class Fish extends Swimmable(Animal) {
  // Only swims
}

class Bird extends Flyable(Walkable(Animal)) {
  // Flies and walks
}

const duck = new Duck('Donald');
duck.walk(); // "Donald is walking"
duck.swim(); // "Donald is swimming"
duck.fly(); // "Donald is flying"
duck.quack(); // "Donald says: Quack!"

const fish = new Fish('Nemo');
fish.swim(); // "Nemo is swimming"
// fish.fly(); // Error - no fly method
```

**Practical Mixin Example:**

```javascript
// Event emitter mixin
const EventEmitter = (Base) => class extends Base {
  constructor(...args) {
    super(...args);
    this._events = {};
  }
  
  on(event, handler) {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(handler);
  }
  
  emit(event, data) {
    if (this._events[event]) {
      this._events[event].forEach(handler => handler(data));
    }
  }
  
  off(event, handler) {
    if (this._events[event]) {
      this._events[event] = this._events[event].filter(h => h !== handler);
    }
  }
};

// Observable state mixin
const Observable = (Base) => class extends Base {
  constructor(...args) {
    super(...args);
    this._state = {};
  }
  
  setState(newState) {
    const oldState = { ...this._state };
    this._state = { ...this._state, ...newState };
    this.emit('stateChange', { oldState, newState: this._state });
  }
  
  getState() {
    return { ...this._state };
  }
};

// Combine mixins
class Store extends Observable(EventEmitter(class {})) {
  constructor(initialState = {}) {
    super();
    this._state = initialState;
  }
  
  dispatch(action) {
    this.emit('action', action);
    // Handle action and update state
    this.setState({ lastAction: action.type });
  }
}

const store = new Store({ count: 0 });

store.on('stateChange', ({ oldState, newState }) => {
  console.log('State changed:', oldState, '->', newState);
});

store.on('action', (action) => {
  console.log('Action dispatched:', action);
});

store.dispatch({ type: 'INCREMENT' });
// Logs: "Action dispatched: { type: 'INCREMENT' }"
// Logs: "State changed: {...} -> {...}"
```

### Abstract Classes (Pattern)

JavaScript doesn't have built-in abstract classes, but we can implement the pattern.

**Basic Abstract Class:**

```javascript
class AbstractShape {
  constructor() {
    if (new.target === AbstractShape) {
      throw new Error('Cannot instantiate abstract class AbstractShape');
    }
  }
  
  // Abstract methods (must be implemented by subclasses)
  getArea() {
    throw new Error('Method getArea() must be implemented');
  }
  
  getPerimeter() {
    throw new Error('Method getPerimeter() must be implemented');
  }
  
  // Concrete method (can be used by all subclasses)
  describe() {
    return `This shape has an area of ${this.getArea()} and perimeter of ${this.getPerimeter()}`;
  }
}

class Circle extends AbstractShape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  getArea() {
    return Math.PI * this.radius ** 2;
  }
  
  getPerimeter() {
    return 2 * Math.PI * this.radius;
  }
}

class Rectangle extends AbstractShape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
  
  getPerimeter() {
    return 2 * (this.width + this.height);
  }
}

// const shape = new AbstractShape(); // Error: Cannot instantiate abstract class

const circle = new Circle(5);
console.log(circle.describe());
// "This shape has an area of 78.53... and perimeter of 31.41..."

const rect = new Rectangle(4, 6);
console.log(rect.describe());
// "This shape has an area of 24 and perimeter of 20"
```

**Advanced Abstract Class Pattern:**

```javascript
// Helper to define abstract methods
function abstractMethod(methodName) {
  return function() {
    throw new Error(`Abstract method ${methodName}() must be implemented`);
  };
}

class AbstractDatabase {
  constructor() {
    if (new.target === AbstractDatabase) {
      throw new Error('Cannot instantiate abstract class');
    }
    
    // Check if subclass implements required methods
    const requiredMethods = ['connect', 'disconnect', 'query', 'insert'];
    for (const method of requiredMethods) {
      if (this[method] === AbstractDatabase.prototype[method]) {
        throw new Error(`Subclass must implement ${method}()`);
      }
    }
  }
  
  // Abstract methods
  connect() { abstractMethod('connect')(); }
  disconnect() { abstractMethod('disconnect')(); }
  query(sql) { abstractMethod('query')(); }
  insert(table, data) { abstractMethod('insert')(); }
  
  // Concrete method
  async transaction(callback) {
    await this.connect();
    try {
      const result = await callback(this);
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    } finally {
      await this.disconnect();
    }
  }
  
  // Template method pattern
  async executeQuery(sql, params = []) {
    await this.connect();
    const result = await this.query(sql, params);
    await this.disconnect();
    return result;
  }
}

class MySQLDatabase extends AbstractDatabase {
  constructor(config) {
    super();
    this.config = config;
    this.connection = null;
  }
  
  async connect() {
    console.log('Connecting to MySQL...');
    this.connection = { connected: true };
  }
  
  async disconnect() {
    console.log('Disconnecting from MySQL...');
    this.connection = null;
  }
  
  async query(sql, params = []) {
    console.log('Executing query:', sql);
    return { rows: [] };
  }
  
  async insert(table, data) {
    const sql = `INSERT INTO ${table} ...`;
    return this.query(sql);
  }
  
  async commit() {
    console.log('Committing transaction...');
  }
  
  async rollback() {
    console.log('Rolling back transaction...');
  }
}

const db = new MySQLDatabase({ host: 'localhost' });
db.executeQuery('SELECT * FROM users');
```

**Interface-like Pattern:**

```javascript
// Define an "interface" using an abstract class
class Drawable {
  constructor() {
    if (new.target === Drawable) {
      throw new Error('Cannot instantiate interface');
    }
  }
  
  draw() {
    throw new Error('draw() must be implemented');
  }
  
  erase() {
    throw new Error('erase() must be implemented');
  }
}

class Resizable {
  constructor() {
    if (new.target === Resizable) {
      throw new Error('Cannot instantiate interface');
    }
  }
  
  resize(width, height) {
    throw new Error('resize() must be implemented');
  }
}

// Implement multiple "interfaces" using mixins
function implementsDrawable(Base) {
  return class extends Base {
    draw() {
      console.log('Drawing...');
    }
    
    erase() {
      console.log('Erasing...');
    }
  };
}

function implementsResizable(Base) {
  return class extends Base {
    resize(width, height) {
      this.width = width;
      this.height = height;
      console.log(`Resized to ${width}x${height}`);
    }
  };
}

class Shape {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
}

class Rectangle extends implementsResizable(implementsDrawable(Shape)) {
  getArea() {
    return this.width * this.height;
  }
}

const rect = new Rectangle(10, 20);
rect.draw(); // "Drawing..."
rect.resize(15, 25); // "Resized to 15x25"
```

### Getters and Setters in Classes

Getters and setters provide computed properties and property access control.

**Basic Getters and Setters:**

```javascript
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }
  
  get celsius() {
    return this._celsius;
  }
  
  set celsius(value) {
    this._celsius = value;
  }
  
  get fahrenheit() {
    return (this._celsius * 9/5) + 32;
  }
  
  set fahrenheit(value) {
    this._celsius = (value - 32) * 5/9;
  }
  
  get kelvin() {
    return this._celsius + 273.15;
  }
  
  set kelvin(value) {
    this._celsius = value - 273.15;
  }
}

const temp = new Temperature(0);
console.log(temp.celsius); // 0
console.log(temp.fahrenheit); // 32
console.log(temp.kelvin); // 273.15

temp.fahrenheit = 212;
console.log(temp.celsius); // 100

temp.kelvin = 373.15;
console.log(temp.celsius); // 100
```

**Computed Properties:**

```javascript
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  get area() {
    return this.width * this.height;
  }
  
  get perimeter() {
    return 2 * (this.width + this.height);
  }
  
  get diagonal() {
    return Math.sqrt(this.width ** 2 + this.height ** 2);
  }
  
  get aspectRatio() {
    return this.width / this.height;
  }
  
  get isSquare() {
    return this.width === this.height;
  }
}

const rect = new Rectangle(3, 4);
console.log(rect.area); // 12
console.log(rect.perimeter); // 14
console.log(rect.diagonal); // 5
console.log(rect.aspectRatio); // 0.75
console.log(rect.isSquare); // false

const square = new Rectangle(5, 5);
console.log(square.isSquare); // true
```

**Validation with Setters:**

```javascript
class User {
  constructor(name, age, email) {
    this.name = name;
    this.age = age;
    this.email = email;
  }
  
  get name() {
    return this._name;
  }
  
  set name(value) {
    if (typeof value !== 'string' || value.length < 2) {
      throw new Error('Name must be at least 2 characters');
    }
    this._name = value;
  }
  
  get age() {
    return this._age;
  }
  
  set age(value) {
    if (typeof value !== 'number' || value < 0 || value > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    this._age = value;
  }
  
  get email() {
    return this._email;
  }
  
  set email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value;
  }
  
  get isAdult() {
    return this._age >= 18;
  }
}

const user = new User('Alice', 30, 'alice@example.com');
console.log(user.isAdult); // true

// user.age = -5; // Error: Age must be between 0 and 150
// user.email = 'invalid'; // Error: Invalid email format
```

**Lazy Initialization:**

```javascript
class DataLoader {
  constructor(url) {
    this.url = url;
    this._data = null;
    this._loading = false;
  }
  
  get data() {
    if (!this._data && !this._loading) {
      this._loading = true;
      this._loadData();
    }
    return this._data;
  }
  
  async _loadData() {
    console.log('Loading data...');
    // Simulate async data loading
    this._data = await new Promise(resolve => {
      setTimeout(() => resolve({ loaded: true, url: this.url }), 1000);
    });
    this._loading = false;
  }
}

const loader = new DataLoader('https://api.example.com/data');
console.log(loader.data); // null (triggers loading)
// After 1 second: data is loaded
```

**Private Fields with Getters/Setters:**

```javascript
class BankAccount {
  #balance = 0;
  #accountNumber;
  #pin;
  
  constructor(accountNumber, initialBalance, pin) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
    this.#pin = pin;
  }
  
  get balance() {
    return this.#balance;
  }
  
  get accountNumber() {
    // Return masked account number
    return '****' + this.#accountNumber.slice(-4);
  }
  
  get formattedBalance() {
    return `$${this.#balance.toFixed(2)}`;
  }
  
  deposit(amount) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    this.#balance += amount;
  }
  
  withdraw(amount, pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    if (amount > this.#balance) {
      throw new Error('Insufficient funds');
    }
    this.#balance -= amount;
  }
}

const account = new BankAccount('1234567890', 1000, '1234');
console.log(account.balance); // 1000
console.log(account.accountNumber); // ****7890
console.log(account.formattedBalance); // $1000.00
```

### Factory Functions vs Classes

Comparing different approaches to object creation.

**Class Approach:**

```javascript
class Car {
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.mileage = 0;
  }
  
  drive(miles) {
    this.mileage += miles;
    console.log(`Drove ${miles} miles. Total: ${this.mileage}`);
  }
  
  getInfo() {
    return `${this.year} ${this.make} ${this.model}`;
  }
}

const car1 = new Car('Toyota', 'Camry', 2024);
car1.drive(100);
console.log(car1.getInfo());
console.log(car1 instanceof Car); // true
```

**Factory Function Approach:**

```javascript
function createCar(make, model, year) {
  // Private variable (truly private)
  let mileage = 0;
  
  return {
    make,
    model,
    year,
    
    drive(miles) {
      mileage += miles;
      console.log(`Drove ${miles} miles. Total: ${mileage}`);
    },
    
    getMileage() {
      return mileage;
    },
    
    getInfo() {
      return `${year} ${make} ${model}`;
    }
  };
}

const car2 = createCar('Honda', 'Accord', 2024);
car2.drive(100);
console.log(car2.getInfo());
console.log(car2 instanceof Object); // true, but not instanceof specific type
// car2.mileage // undefined - truly private
```

**Comparison:**

```javascript
// Classes:
// ✓ instanceof works
// ✓ Inheritance with extends
// ✓ More familiar for OOP developers
// ✓ Better performance (shared methods on prototype)
// ✗ Private fields require # syntax (newer feature)
// ✗ Must use 'new' keyword

// Factory Functions:
// ✓ True private variables (closures)
// ✓ Don't need 'new' keyword
// ✓ Flexible return values
// ✓ Easier to understand for beginners
// ✗ No instanceof checking
// ✗ Methods created for each instance (memory overhead)
// ✗ No built-in inheritance mechanism
```

**Hybrid Approach:**

```javascript
// Combine class with factory
class CarClass {
  #mileage = 0;
  
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }
  
  drive(miles) {
    this.#mileage += miles;
  }
  
  getMileage() {
    return this.#mileage;
  }
  
  static create(make, model, year) {
    return new CarClass(make, model, year);
  }
}

// Use factory method (no 'new' needed)
const car3 = CarClass.create('Tesla', 'Model 3', 2024);
```

**When to Use Each:**

```javascript
// Use Classes when:
// - Building large OOP applications
// - Need inheritance hierarchies
// - Want instanceof checks
// - Performance is critical (many instances)
// - Working in TypeScript or with type checking

class GameCharacter {
  constructor(name, health) {
    this.name = name;
    this.health = health;
  }
  
  takeDamage(amount) {
    this.health -= amount;
  }
}

class Warrior extends GameCharacter {
  constructor(name, health, weapon) {
    super(name, health);
    this.weapon = weapon;
  }
  
  attack() {
    return this.weapon.damage;
  }
}

// Use Factory Functions when:
// - Need true private variables
// - Creating simple objects
// - Want to avoid 'new'
// - Need flexible object creation
// - Prefer functional programming style

function createCounter(initial = 0) {
  let count = initial; // Truly private
  
  return {
    increment() {
      count++;
    },
    decrement() {
      count--;
    },
    getValue() {
      return count;
    }
  };
}

const counter = createCounter(10);
counter.increment();
console.log(counter.getValue()); // 11
// count is not accessible from outside
```

### Composition Over Inheritance

Favoring composition over deep inheritance hierarchies for more flexible code.

**Problem with Deep Inheritance:**

```javascript
// Deep inheritance can be rigid
class Animal {
  eat() { console.log('eating'); }
}

class FlyingAnimal extends Animal {
  fly() { console.log('flying'); }
}

class SwimmingAnimal extends Animal {
  swim() { console.log('swimming'); }
}

// Problem: What about a duck that flies AND swims?
// Can't extend both FlyingAnimal and SwimmingAnimal

// Forced to choose or duplicate code:
class Duck extends FlyingAnimal {
  swim() { console.log('swimming'); } // Duplicate code
}
```

**Composition Solution:**

```javascript
// Create separate capabilities
const canEat = {
  eat() {
    console.log(`${this.name} is eating`);
  }
};

const canFly = {
  fly() {
    console.log(`${this.name} is flying`);
  }
};

const canSwim = {
  swim() {
    console.log(`${this.name} is swimming`);
  }
};

const canWalk = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

// Compose objects with needed capabilities
class Duck {
  constructor(name) {
    this.name = name;
    Object.assign(this, canEat, canFly, canSwim, canWalk);
  }
  
  quack() {
    console.log(`${this.name} says: Quack!`);
  }
}

class Fish {
  constructor(name) {
    this.name = name;
    Object.assign(this, canEat, canSwim);
  }
}

class Dog {
  constructor(name) {
    this.name = name;
    Object.assign(this, canEat, canWalk);
  }
  
  bark() {
    console.log(`${this.name} says: Woof!`);
  }
}

const duck = new Duck('Donald');
duck.eat();
duck.fly();
duck.swim();
duck.walk();
duck.quack();

const fish = new Fish('Nemo');
fish.eat();
fish.swim();
// fish.fly(); // undefined - doesn't have this capability

const dog = new Dog('Buddy');
dog.eat();
dog.walk();
// dog.swim(); // undefined - doesn't have this capability
```

**Advanced Composition with Factory:**

```javascript
// Capability composers
const withLogging = (obj) => ({
  ...obj,
  log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }
});

const withValidation = (obj) => ({
  ...obj,
  validate(data, rules) {
    for (const [field, rule] of Object.entries(rules)) {
      if (rule.required && !data[field]) {
        return { valid: false, error: `${field} is required` };
      }
    }
    return { valid: true };
  }
});

const withPersistence = (obj) => ({
  ...obj,
  save() {
    this.log?.('Saving to database...');
    console.log('Saved:', JSON.stringify(this));
  },
  load(data) {
    Object.assign(this, data);
    this.log?.('Loaded from database');
  }
});

// Compose features
function createUser(name, email) {
  const user = {
    name,
    email,
    createdAt: new Date()
  };
  
  return withPersistence(withValidation(withLogging(user)));
}

const user = createUser('Alice', 'alice@example.com');
user.log('User created');
const validation = user.validate(user, { name: { required: true } });
console.log(validation); // { valid: true }
user.save();
```

**Composition with Classes:**

```javascript
// Use composition inside classes
class Character {
  constructor(name, abilities = []) {
    this.name = name;
    this.abilities = abilities;
    
    // Compose abilities
    abilities.forEach(ability => {
      Object.assign(this, ability);
    });
  }
}

const combatAbility = {
  attack(target) {
    console.log(`${this.name} attacks ${target}`);
  },
  
  defend() {
    console.log(`${this.name} is defending`);
  }
};

const magicAbility = {
  castSpell(spell) {
    console.log(`${this.name} casts ${spell}`);
  },
  
  meditate() {
    console.log(`${this.name} is meditating`);
  }
};

const stealthAbility = {
  sneak() {
    console.log(`${this.name} sneaks quietly`);
  },
  
  hide() {
    console.log(`${this.name} hides in shadows`);
  }
};

// Create different character types by composing abilities
const warrior = new Character('Conan', [combatAbility]);
warrior.attack('enemy'); // Works
// warrior.castSpell('fireball'); // undefined

const mage = new Character('Gandalf', [combatAbility, magicAbility]);
mage.attack('orc'); // Works
mage.castSpell('lightning'); // Works

const rogue = new Character('Shadow', [combatAbility, stealthAbility]);
rogue.attack('guard'); // Works
rogue.sneak(); // Works

const battlemage = new Character('Merlin', [combatAbility, magicAbility, stealthAbility]);
// Has all abilities!
```

**Real-World Example:**

```javascript
// E-commerce system using composition

// Capabilities
const hasPrice = {
  setPrice(price) {
    this.price = price;
  },
  
  getPrice() {
    return this.price;
  },
  
  applyDiscount(percentage) {
    this.price *= (1 - percentage / 100);
  }
};

const hasInventory = {
  setStock(quantity) {
    this.stock = quantity;
  },
  
  inStock() {
    return this.stock > 0;
  },
  
  decreaseStock(quantity = 1) {
    if (this.stock >= quantity) {
      this.stock -= quantity;
      return true;
    }
    return false;
  }
};

const hasShipping = {
  setShippingWeight(weight) {
    this.shippingWeight = weight;
  },
  
  calculateShipping() {
    return this.shippingWeight * 0.5; // $0.50 per kg
  }
};

const isDigital = {
  download() {
    return `Downloading ${this.name}...`;
  }
};

// Create products by composing features
function createPhysicalProduct(name, price, stock, weight) {
  const product = { name };
  Object.assign(product, hasPrice, hasInventory, hasShipping);
  product.setPrice(price);
  product.setStock(stock);
  product.setShippingWeight(weight);
  return product;
}

function createDigitalProduct(name, price) {
  const product = { name };
  Object.assign(product, hasPrice, isDigital);
  product.setPrice(price);
  return product;
}

const book = createPhysicalProduct('JavaScript Book', 39.99, 100, 0.5);
console.log(book.getPrice()); // 39.99
console.log(book.calculateShipping()); // 0.25
book.decreaseStock();
console.log(book.stock); // 99

const ebook = createDigitalProduct('JavaScript eBook', 19.99);
console.log(ebook.getPrice()); // 19.99
console.log(ebook.download()); // "Downloading JavaScript eBook..."
// ebook.calculateShipping(); // undefined - digital products don't ship
```

---

## Summary

This document covered ES6 Classes comprehensively:

- **Class Basics**: Declarations, expressions, constructors, instance methods, and hoisting behavior
- **Class Features**: Static methods/properties, instance properties, private fields/methods, public fields, and static blocks
- **Inheritance**: The `extends` and `super` keywords, method overriding, static method inheritance, and complex inheritance chains
- **Class Patterns**: Mixins (object and function-based), abstract class patterns, getters/setters, factory functions vs classes comparison, and composition over inheritance

Classes provide a clean, familiar syntax for object-oriented programming in JavaScript while maintaining compatibility with the language's prototypal nature.

---

**Related Topics to Explore Next:**

- Design patterns with classes (Singleton, Factory, Observer, etc.)
- TypeScript and type-safe classes
- Decorators and metadata reflection
- Class performance optimization techniques
- Functional programming vs OOP in JavaScript