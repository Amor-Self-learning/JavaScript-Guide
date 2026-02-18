# 6 Classes

ES6 classes provide syntactic sugar over prototypal inheritance. They offer cleaner syntax for constructor functions, inheritance, static methods, and private fields.

---

## 6.1 Class Basics

Classes in JavaScript, introduced in ES6 (ES2015), provide a cleaner, more intuitive syntax for creating objects and implementing inheritance. They are syntactic sugar over JavaScript's existing prototype-based inheritance.

### Class Declarations

**Basic Class:**

```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    console.log(`Hello, I'm ${this.name} and I'm ${this.age} years old.`);
  }
  
  haveBirthday() {
    this.age++;
    console.log(`Happy birthday! You're now ${this.age}.`);
  }
}

const alice = new Person('Alice', 30);
alice.greet(); // "Hello, I'm Alice and I'm 30 years old."
```

### Class Expressions

```javascript
const Rectangle = class {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  
  getArea() {
    return this.width * this.height;
  }
};

const rect = new Rectangle(10, 5);
console.log(rect.getArea()); // 50
```

### Constructor Method

```javascript
class BankAccount {
  constructor(accountNumber, initialBalance = 0) {
    if (typeof accountNumber !== 'string' || accountNumber.length !== 10) {
      throw new Error('Account number must be a 10-character string');
    }
    if (initialBalance < 0) {
      throw new Error('Initial balance must be non-negative');
    }
    
    this.accountNumber = accountNumber;
    this.balance = initialBalance;
    this.transactions = [];
    this.createdAt = new Date();
  }
  
  deposit(amount) {
    if (amount <= 0) throw new Error('Amount must be positive');
    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, date: new Date() });
  }
}
```

### Instance Methods

```javascript
class Calculator {
  constructor(initialValue = 0) {
    this.value = initialValue;
  }
  
  add(num) {
    this.value += num;
    return this; // Enable method chaining
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  getResult() {
    return this.value;
  }
}

const result = new Calculator(10).add(5).multiply(2).getResult(); // 30
```

### Class Hoisting (Not Hoisted)

```javascript
// ERROR - Cannot access before declaration
// const obj = new MyClass(); // ReferenceError

class MyClass {
  constructor() {
    this.value = 42;
  }
}

// Now it works
const obj = new MyClass();
```

---


## 6.2 Class Features

### Static Methods

```javascript
class MathUtils {
  static add(a, b) {
    return a + b;
  }
  
  static factorial(n) {
    if (n <= 1) return 1;
    return n * MathUtils.factorial(n - 1);
  }
}

console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
```

**Static Factory Methods:**

```javascript
class User {
  constructor(name, email, role) {
    this.name = name;
    this.email = email;
    this.role = role;
  }
  
  static createAdmin(name, email) {
    return new User(name, email, 'admin');
  }
  
  static createGuest() {
    return new User('Guest', 'guest@example.com', 'guest');
  }
  
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new User(data.name, data.email, data.role);
  }
}

const admin = User.createAdmin('Alice', 'alice@example.com');
const guest = User.createGuest();
```

### Static Properties

```javascript
class DatabaseConnection {
  static activeConnections = 0;
  static maxConnections = 10;
  static connections = [];
  
  constructor(database) {
    if (DatabaseConnection.activeConnections >= DatabaseConnection.maxConnections) {
      throw new Error('Maximum connections reached');
    }
    
    this.database = database;
    DatabaseConnection.activeConnections++;
    DatabaseConnection.connections.push(this);
  }
  
  disconnect() {
    DatabaseConnection.activeConnections--;
    const index = DatabaseConnection.connections.indexOf(this);
    if (index > -1) {
      DatabaseConnection.connections.splice(index, 1);
    }
  }
  
  static getStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections
    };
  }
}
```

### Instance Properties

```javascript
class Rectangle {
  width = 0;
  height = 0;
  color = 'black';
  
  constructor(width, height, color) {
    this.width = width;
    this.height = height;
    if (color) this.color = color;
  }
}
```

### Private Fields

```javascript
class BankAccount {
  #balance = 0;
  #pin;
  
  constructor(initialBalance, pin) {
    this.#balance = initialBalance;
    this.#pin = pin;
  }
  
  getBalance(pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
    }
    return this.#balance;
  }
  
  deposit(amount, pin) {
    if (pin !== this.#pin) {
      throw new Error('Invalid PIN');
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

const account = new BankAccount(1000, '1234');
console.log(account.getBalance('1234')); // 1000
// console.log(account.#balance); // SyntaxError
```

### Private Methods

```javascript
class PasswordManager {
  #passwords = new Map();
  #masterKey;
  
  constructor(masterPassword) {
    this.#masterKey = this.#deriveKey(masterPassword);
  }
  
  #deriveKey(password) {
    // Simplified key derivation
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      hash = ((hash << 5) - hash) + password.charCodeAt(i);
    }
    return Math.abs(hash).toString(16);
  }
  
  #encrypt(text) {
    // Simplified encryption
    return text.split('').reverse().join('') + '_encrypted';
  }
  
  #decrypt(encrypted) {
    return encrypted.replace('_encrypted', '').split('').reverse().join('');
  }
  
  addPassword(service, password) {
    const encrypted = this.#encrypt(password);
    this.#passwords.set(service, encrypted);
  }
  
  getPassword(service) {
    const encrypted = this.#passwords.get(service);
    if (!encrypted) throw new Error('Password not found');
    return this.#decrypt(encrypted);
  }
}
```

### Public Fields

```javascript
class Car {
  make = '';
  model = '';
  year = 0;
  features = [];
  
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
  }
  
  addFeature(feature) {
    this.features.push(feature);
  }
}
```

### Static Blocks

```javascript
class Config {
  static apiUrl;
  static environment;
  
  static {
    const env = 'production';
    
    if (env === 'production') {
      this.apiUrl = 'https://api.production.com';
      this.environment = 'production';
    } else {
      this.apiUrl = 'https://api.dev.com';
      this.environment = 'development';
    }
  }
}

console.log(Config.apiUrl);
```

---


## 6.3 Inheritance

Class inheritance in JavaScript allows one class to extend another, inheriting its properties and methods while adding or overriding functionality.

### `extends` Keyword

The `extends` keyword is used to create a class that is a child of another class.

**Basic Inheritance:**

```javascript
// Parent class
class Animal {
  constructor(name) {
    this.name = name;
    this.energy = 100;
  }
  
  eat() {
    console.log(`${this.name} is eating`);
    this.energy += 10;
  }
  
  sleep() {
    console.log(`${this.name} is sleeping`);
    this.energy = 100;
  }
  
  makeSound() {
    console.log(`${this.name} makes a sound`);
  }
}

// Child class
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  // Override parent method
  makeSound() {
    console.log(`${this.name} barks: Woof! Woof!`);
  }
  
  // Add new method
  fetch() {
    console.log(`${this.name} is fetching the ball`);
    this.energy -= 10;
  }
}

const dog = new Dog('Buddy', 'Golden Retriever');
dog.eat(); // "Buddy is eating" (inherited)
dog.makeSound(); // "Buddy barks: Woof! Woof!" (overridden)
dog.fetch(); // "Buddy is fetching the ball" (own method)

console.log(dog instanceof Dog); // true
console.log(dog instanceof Animal); // true
console.log(dog instanceof Object); // true
```

**Multiple Levels of Inheritance:**

```javascript
class LivingBeing {
  constructor(name) {
    this.name = name;
    this.isAlive = true;
  }
  
  breathe() {
    console.log(`${this.name} is breathing`);
  }
}

class Animal extends LivingBeing {
  constructor(name, species) {
    super(name);
    this.species = species;
  }
  
  move() {
    console.log(`${this.name} is moving`);
  }
}

class Mammal extends Animal {
  constructor(name, species, furColor) {
    super(name, species);
    this.furColor = furColor;
  }
  
  produceMilk() {
    console.log(`${this.name} is producing milk`);
  }
}

class Dog extends Mammal {
  constructor(name, breed, furColor) {
    super(name, 'Canine', furColor);
    this.breed = breed;
  }
  
  bark() {
    console.log(`${this.name} barks!`);
  }
}

const max = new Dog('Max', 'Labrador', 'Yellow');
max.breathe(); // From LivingBeing
max.move(); // From Animal
max.produceMilk(); // From Mammal
max.bark(); // From Dog

console.log(max.isAlive); // true (from LivingBeing)
console.log(max.species); // 'Canine' (from Animal)
console.log(max.furColor); // 'Yellow' (from Mammal)
console.log(max.breed); // 'Labrador' (from Dog)
```

**Extending Built-in Classes:**

```javascript
// Extend Array
class MyArray extends Array {
  first() {
    return this[0];
  }
  
  last() {
    return this[this.length - 1];
  }
  
  random() {
    return this[Math.floor(Math.random() * this.length)];
  }
  
  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
  }
}

const arr = new MyArray(1, 2, 3, 4, 5);
console.log(arr.first()); // 1
console.log(arr.last()); // 5
arr.push(6);
console.log(arr.length); // 6
console.log(arr.map(x => x * 2)); // [2, 4, 6, 8, 10, 12]

// Extend Map
class DefaultMap extends Map {
  constructor(defaultValue, entries) {
    super(entries);
    this.defaultValue = defaultValue;
  }
  
  get(key) {
    if (!this.has(key)) {
      return this.defaultValue;
    }
    return super.get(key);
  }
}

const map = new DefaultMap('N/A');
map.set('name', 'Alice');
console.log(map.get('name')); // 'Alice'
console.log(map.get('age')); // 'N/A' (default value)
```

### `super` Keyword (Constructor and Methods)

The `super` keyword is used to access and call functions on an object's parent class.

**`super` in Constructor:**

```javascript
class Vehicle {
  constructor(make, model, year) {
    this.make = make;
    this.model = model;
    this.year = year;
    this.mileage = 0;
  }
  
  getInfo() {
    return `${this.year} ${this.make} ${this.model}`;
  }
}

class Car extends Vehicle {
  constructor(make, model, year, doors) {
    // Must call super() before accessing 'this'
    super(make, model, year); // Call parent constructor
    
    // Now can use 'this'
    this.doors = doors;
    this.type = 'Car';
  }
  
  getFullInfo() {
    return `${this.getInfo()} - ${this.doors} doors`;
  }
}

const car = new Car('Toyota', 'Camry', 2024, 4);
console.log(car.getFullInfo()); // "2024 Toyota Camry - 4 doors"
```

**Rules for `super()` in Constructor:**

```javascript
class Parent {
  constructor(value) {
    this.value = value;
  }
}

class ChildCorrect extends Parent {
  constructor(value, extra) {
    // CORRECT: super() before using 'this'
    super(value);
    this.extra = extra;
  }
}

class ChildWrong extends Parent {
  constructor(value, extra) {
    // WRONG: Using 'this' before super()
    // this.extra = extra; // ReferenceError!
    // super(value);
  }
}

// If no constructor defined, super() is called automatically
class ChildAuto extends Parent {
  setExtra(extra) {
    this.extra = extra;
  }
}

const child = new ChildAuto(10);
child.setExtra(20);
console.log(child.value, child.extra); // 10 20
```

**`super` in Methods:**

```javascript
class Employee {
  constructor(name, salary) {
    this.name = name;
    this.salary = salary;
  }
  
  getAnnualBonus() {
    return this.salary * 0.1; // 10% bonus
  }
  
  getDetails() {
    return `Employee: ${this.name}, Salary: $${this.salary}`;
  }
}

class Manager extends Employee {
  constructor(name, salary, department) {
    super(name, salary);
    this.department = department;
    this.teamSize = 0;
  }
  
  // Override with super call
  getAnnualBonus() {
    const baseBonus = super.getAnnualBonus(); // Call parent method
    const managerBonus = this.teamSize * 1000; // Additional bonus
    return baseBonus + managerBonus;
  }
  
  // Extend parent method
  getDetails() {
    const baseDetails = super.getDetails(); // Call parent method
    return `${baseDetails}, Department: ${this.department}, Team: ${this.teamSize}`;
  }
  
  setTeamSize(size) {
    this.teamSize = size;
  }
}

const manager = new Manager('Alice', 80000, 'Engineering');
manager.setTeamSize(5);

console.log(manager.getAnnualBonus()); // 8000 + 5000 = 13000
console.log(manager.getDetails());
// "Employee: Alice, Salary: $80000, Department: Engineering, Team: 5"
```

**Complex `super` Usage:**

```javascript
class Shape {
  constructor(color) {
    this.color = color;
  }
  
  describe() {
    return `A ${this.color} shape`;
  }
  
  getArea() {
    return 0; // Default implementation
  }
}

class Rectangle extends Shape {
  constructor(color, width, height) {
    super(color);
    this.width = width;
    this.height = height;
  }
  
  describe() {
    const baseDescription = super.describe();
    return `${baseDescription} - specifically a rectangle`;
  }
  
  getArea() {
    return this.width * this.height;
  }
}

class Square extends Rectangle {
  constructor(color, side) {
    super(color, side, side); // Call Rectangle constructor
  }
  
  describe() {
    const parentDescription = super.describe();
    return `${parentDescription}, which is also a square`;
  }
  
  // Can call grandparent method
  getGrandparentDescription() {
    // Can't directly call Shape.describe(), but can through prototype
    return Shape.prototype.describe.call(this);
  }
}

const square = new Square('red', 5);
console.log(square.describe());
// "A red shape - specifically a rectangle, which is also a square"
console.log(square.getArea()); // 25
console.log(square.getGrandparentDescription()); // "A red shape"
```

### Method Overriding

Method overriding allows a child class to provide a specific implementation of a method already defined in its parent class.

**Complete Override:**

```javascript
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  makeSound() {
    console.log(`${this.name} makes a generic sound`);
  }
  
  move() {
    console.log(`${this.name} moves`);
  }
}

class Dog extends Animal {
  makeSound() {
    console.log(`${this.name} barks: Woof!`);
  }
  
  move() {
    console.log(`${this.name} runs on four legs`);
  }
}

class Bird extends Animal {
  makeSound() {
    console.log(`${this.name} chirps: Tweet!`);
  }
  
  move() {
    console.log(`${this.name} flies in the sky`);
  }
}

const dog = new Dog('Buddy');
const bird = new Bird('Tweety');

dog.makeSound(); // "Buddy barks: Woof!"
dog.move(); // "Buddy runs on four legs"

bird.makeSound(); // "Tweety chirps: Tweet!"
bird.move(); // "Tweety flies in the sky"
```

**Partial Override (Extending Parent Functionality):**

```javascript
class BankAccount {
  constructor(accountNumber, balance = 0) {
    this.accountNumber = accountNumber;
    this.balance = balance;
    this.transactions = [];
  }
  
  deposit(amount) {
    this.balance += amount;
    this.transactions.push({ type: 'deposit', amount, date: new Date() });
    console.log(`Deposited $${amount}. New balance: $${this.balance}`);
  }
  
  withdraw(amount) {
    if (amount > this.balance) {
      console.log('Insufficient funds');
      return false;
    }
    this.balance -= amount;
    this.transactions.push({ type: 'withdrawal', amount, date: new Date() });
    console.log(`Withdrew $${amount}. New balance: $${this.balance}`);
    return true;
  }
  
  getTransactionHistory() {
    return this.transactions;
  }
}

class SavingsAccount extends BankAccount {
  constructor(accountNumber, balance, interestRate) {
    super(accountNumber, balance);
    this.interestRate = interestRate;
    this.withdrawalCount = 0;
    this.monthlyWithdrawalLimit = 6;
  }
  
  // Override with additional logic
  withdraw(amount) {
    if (this.withdrawalCount >= this.monthlyWithdrawalLimit) {
      console.log('Monthly withdrawal limit reached');
      return false;
    }
    
    // Call parent method
    const success = super.withdraw(amount);
    if (success) {
      this.withdrawalCount++;
      console.log(`Withdrawals remaining this month: ${this.monthlyWithdrawalLimit - this.withdrawalCount}`);
    }
    return success;
  }
  
  // Extend transaction history with interest
  getTransactionHistory() {
    const baseHistory = super.getTransactionHistory();
    const interestTransactions = baseHistory.filter(t => t.type === 'interest');
    return {
      all: baseHistory,
      interest: interestTransactions,
      totalInterestEarned: interestTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  }
  
  // New method specific to savings
  applyInterest() {
    const interest = this.balance * (this.interestRate / 100);
    this.balance += interest;
    this.transactions.push({ type: 'interest', amount: interest, date: new Date() });
    console.log(`Interest applied: $${interest.toFixed(2)}`);
  }
  
  resetMonthlyLimit() {
    this.withdrawalCount = 0;
  }
}

const savings = new SavingsAccount('SAV123', 1000, 2.5);
savings.deposit(500); // Uses parent implementation
savings.withdraw(100); // Uses overridden implementation
savings.applyInterest(); // New method
```

**Override Patterns:**

```javascript
class Product {
  constructor(name, price) {
    this.name = name;
    this.price = price;
  }
  
  getPrice() {
    return this.price;
  }
  
  getDetails() {
    return `${this.name}: $${this.price}`;
  }
  
  getTaxAmount() {
    return this.price * 0.1; // 10% tax
  }
}

class DiscountedProduct extends Product {
  constructor(name, price, discount) {
    super(name, price);
    this.discount = discount;
  }
  
  // Complete override - doesn't use super
  getPrice() {
    return this.price * (1 - this.discount / 100);
  }
  
  // Partial override - extends parent
  getDetails() {
    const parentDetails = super.getDetails();
    return `${parentDetails} (${this.discount}% off - Final: $${this.getPrice().toFixed(2)})`;
  }
  
  // Override to use the discounted price for tax
  getTaxAmount() {
    return this.getPrice() * 0.1;
  }
}

class PremiumProduct extends DiscountedProduct {
  constructor(name, price, discount, warranty) {
    super(name, price, discount);
    this.warranty = warranty;
  }
  
  // Override to add warranty info
  getDetails() {
    const parentDetails = super.getDetails();
    return `${parentDetails} + ${this.warranty}-year warranty`;
  }
}

const regular = new Product('Laptop', 1000);
console.log(regular.getDetails()); // "Laptop: $1000"

const discounted = new DiscountedProduct('Laptop', 1000, 20);
console.log(discounted.getDetails()); 
// "Laptop: $1000 (20% off - Final: $800.00)"

const premium = new PremiumProduct('Laptop', 1000, 20, 3);
console.log(premium.getDetails());
// "Laptop: $1000 (20% off - Final: $800.00) + 3-year warranty"
```

### `super` in Static Methods

The `super` keyword can be used in static methods to call static methods of the parent class.

**Basic Static `super`:**

```javascript
class Animal {
  static kingdom = 'Animalia';
  
  static getKingdom() {
    return this.kingdom;
  }
  
  static describe() {
    return 'This is an animal';
  }
  
  static classify() {
    return `Kingdom: ${this.getKingdom()}`;
  }
}

class Mammal extends Animal {
  static class = 'Mammalia';
  
  static describe() {
    const parentDescription = super.describe();
    return `${parentDescription}, specifically a mammal`;
  }
  
  static classify() {
    const parentClassification = super.classify();
    return `${parentClassification}, Class: ${this.class}`;
  }
  
  static getFullTaxonomy() {
    return {
      kingdom: super.getKingdom(),
      class: this.class,
      description: this.describe()
    };
  }
}

console.log(Mammal.describe());
// "This is an animal, specifically a mammal"

console.log(Mammal.classify());
// "Kingdom: Animalia, Class: Mammalia"

console.log(Mammal.getFullTaxonomy());
// { kingdom: 'Animalia', class: 'Mammalia', description: '...' }
```

**Static Methods with Inheritance Chain:**

```javascript
class Counter {
  static count = 0;
  
  static increment() {
    this.count++;
    return this.count;
  }
  
  static getCount() {
    return this.count;
  }
  
  static reset() {
    this.count = 0;
  }
  
  static display() {
    console.log(`Count: ${this.count}`);
  }
}

class DoubleCounter extends Counter {
  static increment() {
    super.increment();
    super.increment();
    return this.count;
  }
  
  static display() {
    console.log(`Double Counter: ${this.count}`);
  }
}

class TripleCounter extends DoubleCounter {
  static increment() {
    super.increment(); // Calls DoubleCounter.increment (which increments twice)
    super.increment(); // Calls again
    super.increment(); // Calls again
    return this.count;
  }
  
  static display() {
    super.display();
    console.log(`(Triple increment mode)`);
  }
}

console.log(DoubleCounter.increment()); // 2
console.log(DoubleCounter.increment()); // 4
DoubleCounter.display(); // "Double Counter: 4"

DoubleCounter.reset();
console.log(TripleCounter.increment()); // 6 (increments 6 times total)
TripleCounter.display();
// "Double Counter: 6"
// "(Triple increment mode)"
```

**Static Factory Methods with `super`:**

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.role = 'user';
    this.createdAt = new Date();
  }
  
  static fromJSON(json) {
    const data = JSON.parse(json);
    return new this(data.name, data.email);
  }
  
  static createGuest() {
    return new this('Guest', 'guest@example.com');
  }
  
  static createBatch(users) {
    return users.map(user => new this(user.name, user.email));
  }
}

class Admin extends User {
  constructor(name, email, permissions) {
    super(name, email);
    this.role = 'admin';
    this.permissions = permissions || ['read', 'write', 'delete'];
  }
  
  static fromJSON(json) {
    const user = super.fromJSON(json);
    const data = JSON.parse(json);
    return new this(user.name, user.email, data.permissions);
  }
  
  static createSuperAdmin() {
    const guest = super.createGuest();
    return new this(guest.name, guest.email, ['all']);
  }
  
  static createBatch(admins) {
    return admins.map(admin => 
      new this(admin.name, admin.email, admin.permissions)
    );
  }
}

const admin = Admin.fromJSON('{"name":"Alice","email":"alice@example.com","permissions":["read","write"]}');
console.log(admin.role); // 'admin'
console.log(admin.permissions); // ['read', 'write']

const superAdmin = Admin.createSuperAdmin();
console.log(superAdmin.permissions); // ['all']

const admins = Admin.createBatch([
  { name: 'Bob', email: 'bob@example.com', permissions: ['read'] },
  { name: 'Charlie', email: 'charlie@example.com', permissions: ['read', 'write'] }
]);
console.log(admins.length); // 2
```

### Inheritance Chains

Complex inheritance hierarchies where classes extend other classes in a chain.

**Multi-Level Inheritance:**

```javascript
class Vehicle {
  constructor(make, model) {
    this.make = make;
    this.model = model;
    this.speed = 0;
  }
  
  accelerate(amount) {
    this.speed += amount;
    console.log(`Accelerating to ${this.speed} mph`);
  }
  
  brake(amount) {
    this.speed = Math.max(0, this.speed - amount);
    console.log(`Braking to ${this.speed} mph`);
  }
}

class MotorVehicle extends Vehicle {
  constructor(make, model, engineType) {
    super(make, model);
    this.engineType = engineType;
    this.fuelLevel = 100;
  }
  
  accelerate(amount) {
    if (this.fuelLevel > 0) {
      super.accelerate(amount);
      this.fuelLevel -= amount * 0.1;
    } else {
      console.log('Out of fuel!');
    }
  }
  
  refuel() {
    this.fuelLevel = 100;
    console.log('Tank refilled');
  }
}

class Car extends MotorVehicle {
  constructor(make, model, engineType, doors) {
    super(make, model, engineType);
    this.doors = doors;
  }
  
  openTrunk() {
    console.log('Trunk opened');
  }
}

class ElectricCar extends Car {
  constructor(make, model, doors, batteryCapacity) {
    super(make, model, 'Electric', doors);
    this.batteryCapacity = batteryCapacity;
    this.batteryLevel = 100;
  }
  
  accelerate(amount) {
    if (this.batteryLevel > 0) {
      this.speed += amount;
      this.batteryLevel -= amount * 0.05;
      console.log(`Silently accelerating to ${this.speed} mph (Battery: ${this.batteryLevel.toFixed(1)}%)`);
    } else {
      console.log('Battery depleted!');
    }
  }
  
  charge() {
    this.batteryLevel = 100;
    console.log('Battery fully charged');
  }
  
  // Override refuel (electric cars don't use fuel)
  refuel() {
    console.log('This is an electric car. Use charge() instead.');
  }
}

const tesla = new ElectricCar('Tesla', 'Model 3', 4, 75);
tesla.accelerate(20);
tesla.brake(10);
tesla.openTrunk();
tesla.charge();

// Verify inheritance chain
console.log(tesla instanceof ElectricCar); // true
console.log(tesla instanceof Car); // true
console.log(tesla instanceof MotorVehicle); // true
console.log(tesla instanceof Vehicle); // true
```

**Traversing the Inheritance Chain:**

```javascript
class A {
  methodA() { return 'A'; }
  commonMethod() { return 'A version'; }
}

class B extends A {
  methodB() { return 'B'; }
  commonMethod() { return 'B version'; }
}

class C extends B {
  methodC() { return 'C'; }
  commonMethod() { return 'C version'; }
}

class D extends C {
  methodD() { return 'D'; }
  // Doesn't override commonMethod
}

const d = new D();

// All methods are accessible
console.log(d.methodA()); // 'A'
console.log(d.methodB()); // 'B'
console.log(d.methodC()); // 'C'
console.log(d.methodD()); // 'D'
console.log(d.commonMethod()); // 'C version' (from C, not overridden in D)

// Get prototype chain
function getPrototypeChain(obj) {
  const chain = [];
  let current = obj;
  
  while (current) {
    chain.push(current.constructor.name);
    current = Object.getPrototypeOf(current);
    if (current === Object.prototype) break;
  }
  
  return chain;
}

console.log(getPrototypeChain(d)); // ['D', 'C', 'B', 'A']

// Check if method exists in chain
function hasMethodInChain(obj, methodName) {
  let current = obj;
  while (current) {
    if (current.hasOwnProperty(methodName)) {
      return {
        found: true,
        owner: current.constructor.name
      };
    }
    current = Object.getPrototypeOf(current);
    if (current === Object.prototype) break;
  }
  return { found: false };
}

console.log(hasMethodInChain(d, 'methodA')); // { found: true, owner: 'A' }
```

**Complex Real-World Example:**

```javascript
// Database ORM-like inheritance chain
class Model {
  constructor(data = {}) {
    this.data = data;
    this.errors = [];
  }
  
  validate() {
    this.errors = [];
    return this.errors.length === 0;
  }
  
  save() {
    if (this.validate()) {
      console.log('Saving to database...');
      return true;
    }
    console.log('Validation failed:', this.errors);
    return false;
  }
}

class TimestampedModel extends Model {
  constructor(data = {}) {
    super(data);
    this.data.createdAt = this.data.createdAt || new Date();
    this.data.updatedAt = new Date();
  }
  
  save() {
    this.data.updatedAt = new Date();
    return super.save();
  }
}

class SoftDeletableModel extends TimestampedModel {
  constructor(data = {}) {
    super(data);
    this.data.deletedAt = this.data.deletedAt || null;
  }
  
  delete() {
    this.data.deletedAt = new Date();
    return this.save();
  }
  
  restore() {
    this.data.deletedAt = null;
    return this.save();
  }
  
  save() {
    // Only save if not deleted
    if (this.data.deletedAt) {
      console.log('Cannot save deleted record');
      return false;
    }
    return super.save();
  }
}

class User extends SoftDeletableModel {
  constructor(data = {}) {
    super(data);
    if (!this.data.role) {
      this.data.role = 'user';
    }
  }
  
  validate() {
    super.validate();
    
    if (!this.data.email) {
      this.errors.push('Email is required');
    }
    if (!this.data.name) {
      this.errors.push('Name is required');
    }
    
    return this.errors.length === 0;
  }
  
  isAdmin() {
    return this.data.role === 'admin';
  }
}

// Usage
const user = new User({ name: 'Alice', email: 'alice@example.com' });
user.save(); // Validates, adds timestamps, saves
user.delete(); // Soft deletes
user.restore(); // Restores

// Inheritance chain: User → SoftDeletableModel → TimestampedModel → Model
```

---


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

## 6.5 Classes Summary

| Feature | Syntax |
|---------|--------|
| Class declaration | `class Name {}` |
| Constructor | `constructor() {}` |
| Instance method | `method() {}` |
| Static method | `static method() {}` |
| Getter/Setter | `get prop()` / `set prop(v)` |
| Private field | `#field` |
| Inheritance | `class Child extends Parent` |
| Super call | `super()` / `super.method()` |

---

**End of Chapter 6: Classes**
