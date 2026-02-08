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

