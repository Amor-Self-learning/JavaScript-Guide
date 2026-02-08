# 6.1 Class Basics

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

