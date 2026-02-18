# 5 Prototypes

JavaScript uses prototypal inheritance—objects inherit directly from other objects. Every object has an internal `[[Prototype]]` link forming a chain used for property lookup. Understanding prototypes is essential for mastering JavaScript's object model.

---

## 5.1 Prototype Chain

The prototype chain is JavaScript's fundamental mechanism for inheritance. Every object in JavaScript has an internal link to another object called its prototype. This creates a chain of objects that JavaScript traverses when looking for properties.

### `__proto__` vs `prototype`

Understanding the difference between `__proto__` and `prototype` is crucial for mastering JavaScript's inheritance model.

**`prototype` Property:**

The `prototype` property exists only on **constructor functions** (functions intended to be used with `new`). It defines the prototype that will be assigned to instances created by that constructor.

```javascript
// Constructor function
function Person(name) {
  this.name = name;
}

// The prototype property of the constructor
console.log(Person.prototype); // Person {}
console.log(typeof Person.prototype); // 'object'

// Adding methods to the prototype
Person.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

// Create an instance
const alice = new Person('Alice');

// alice doesn't have a 'prototype' property
console.log(alice.prototype); // undefined

// But alice can use the method from Person.prototype
alice.sayHello(); // "Hello, I am Alice"
```

**`__proto__` Property:**

The `__proto__` property (officially `[[Prototype]]`) exists on **all objects** and points to the object's prototype. It's the actual link in the prototype chain.

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log('Hi, I am ' + this.name);
};

const bob = new Person('Bob');

// bob's __proto__ points to Person.prototype
console.log(bob.__proto__ === Person.prototype); // true

// Person.prototype's __proto__ points to Object.prototype
console.log(Person.prototype.__proto__ === Object.prototype); // true

// Object.prototype's __proto__ is null (end of chain)
console.log(Object.prototype.__proto__); // null
```

**Visual Representation:**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
};

const dog = new Animal('Dog');

// The relationship:
// dog (instance)
//   .__proto__ → Animal.prototype (object with eat method)
//                  .__proto__ → Object.prototype (base object)
//                                 .__proto__ → null

console.log(dog.__proto__); // Animal.prototype
console.log(dog.__proto__.__proto__); // Object.prototype
console.log(dog.__proto__.__proto__.__proto__); // null
```

**Key Differences:**

```javascript
function MyConstructor() {}

// 1. prototype is a property of constructor functions
console.log(typeof MyConstructor.prototype); // 'object'
console.log(MyConstructor.prototype.constructor === MyConstructor); // true

// 2. __proto__ is a property of instances (all objects)
const instance = new MyConstructor();
console.log(instance.__proto__ === MyConstructor.prototype); // true

// 3. Constructors also have __proto__ (they're objects too!)
console.log(MyConstructor.__proto__ === Function.prototype); // true

// 4. Regular objects don't have a prototype property
const obj = {};
console.log(obj.prototype); // undefined
console.log(obj.__proto__); // Object.prototype
```

**Modern Alternative - `Object.getPrototypeOf()`:**

```javascript
// Instead of using __proto__ (which is legacy), use:
const person = { name: 'Alice' };

// Get prototype
console.log(Object.getPrototypeOf(person)); // Object.prototype
console.log(Object.getPrototypeOf(person) === person.__proto__); // true

// Set prototype
const parent = { greet() { console.log('Hello'); } };
const child = Object.create(parent);

console.log(Object.getPrototypeOf(child) === parent); // true
```

### Prototype Lookup

When you access a property on an object, JavaScript follows a specific lookup process through the prototype chain.

**The Lookup Process:**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = 'Human';
Person.prototype.greet = function() {
  return 'Hello, I am ' + this.name;
};

const alice = new Person('Alice');

// Step-by-step lookup process:

// 1. Access alice.name
console.log(alice.name); // 'Alice'
// Found on alice itself (own property) - search stops

// 2. Access alice.species
console.log(alice.species); // 'Human'
// Not found on alice → checks alice.__proto__ (Person.prototype) → found!

// 3. Access alice.toString
console.log(alice.toString()); // '[object Object]'
// Not found on alice → Not found on Person.prototype → 
// checks Person.prototype.__proto__ (Object.prototype) → found!

// 4. Access alice.nonExistent
console.log(alice.nonExistent); // undefined
// Not found on alice → Not found on Person.prototype → 
// Not found on Object.prototype → returns undefined
```

**Detailed Lookup Example:**

```javascript
function Animal(name) {
  this.name = name;
  this.energy = 100;
}

Animal.prototype.sleep = function() {
  console.log(this.name + ' is sleeping');
  this.energy = 100;
};

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
  this.energy += 10;
};

const cat = new Animal('Cat');

// Lookup for cat.name
// 1. Check cat object itself → FOUND (own property)
console.log('name' in cat); // true
console.log(cat.hasOwnProperty('name')); // true

// Lookup for cat.sleep
// 1. Check cat object itself → NOT FOUND
// 2. Check cat.__proto__ (Animal.prototype) → FOUND
console.log('sleep' in cat); // true
console.log(cat.hasOwnProperty('sleep')); // false

// Lookup for cat.toString
// 1. Check cat object itself → NOT FOUND
// 2. Check Animal.prototype → NOT FOUND
// 3. Check Object.prototype → FOUND
console.log('toString' in cat); // true
console.log(cat.hasOwnProperty('toString')); // false
```

**Performance Considerations:**

```javascript
function Deep() {}
Deep.prototype.level1 = function() {};

function Deeper() {}
Deeper.prototype = Object.create(Deep.prototype);
Deeper.prototype.level2 = function() {};

function Deepest() {}
Deepest.prototype = Object.create(Deeper.prototype);
Deepest.prototype.level3 = function() {};

const obj = new Deepest();

// Accessing level3 is fast (one lookup)
obj.level3(); // Found immediately on Deepest.prototype

// Accessing level1 is slower (three lookups)
obj.level1(); // Checks Deepest.prototype → Deeper.prototype → Deep.prototype → FOUND

// This is why flat hierarchies are generally better for performance
```

**Caching and Optimization:**

```javascript
// JavaScript engines optimize prototype lookups

function Counter() {
  this.count = 0;
}

Counter.prototype.increment = function() {
  this.count++;
};

const c1 = new Counter();

// First call: full prototype lookup
c1.increment(); // JS engine learns the path

// Subsequent calls: optimized (inline cache)
c1.increment(); // Much faster
c1.increment(); // Even faster

// Modern JS engines create "shapes" or "hidden classes" to optimize this
```

### `Object.prototype`

`Object.prototype` is the root of the prototype chain. All objects (except those created with `Object.create(null)`) eventually inherit from `Object.prototype`.

**Common Methods on `Object.prototype`:**

```javascript
// Every object has access to these methods via the prototype chain

const obj = { name: 'Alice' };

// toString() - converts object to string
console.log(obj.toString()); // '[object Object]'

// valueOf() - returns primitive value
console.log(obj.valueOf()); // { name: 'Alice' }

// hasOwnProperty() - checks if property is own (not inherited)
console.log(obj.hasOwnProperty('name')); // true
console.log(obj.hasOwnProperty('toString')); // false

// isPrototypeOf() - checks if object is in another's prototype chain
console.log(Object.prototype.isPrototypeOf(obj)); // true

// propertyIsEnumerable() - checks if property is enumerable
console.log(obj.propertyIsEnumerable('name')); // true

// __proto__ (getter/setter) - accesses prototype
console.log(obj.__proto__ === Object.prototype); // true
```

**Why `Object.prototype` is Important:**

```javascript
// 1. It provides base functionality for all objects
const empty = {};
console.log(empty.toString()); // Works because of Object.prototype.toString

// 2. It's the end of the chain
console.log(Object.prototype.__proto__); // null

// 3. You can extend it (but shouldn't!)
Object.prototype.customMethod = function() {
  return 'Available on all objects';
};

const anyObj = {};
console.log(anyObj.customMethod()); // 'Available on all objects'
// This affects EVERY object in your program - dangerous!

// 4. You can create objects without it
const noProto = Object.create(null);
console.log(noProto.toString); // undefined
console.log(noProto.__proto__); // undefined
// Useful for pure data storage (maps/dictionaries)
```

**Overriding Object.prototype Methods:**

```javascript
function Person(name) {
  this.name = name;
}

// Override toString for better output
Person.prototype.toString = function() {
  return 'Person: ' + this.name;
};

const bob = new Person('Bob');

console.log(bob.toString()); // 'Person: Bob'
console.log(Object.prototype.toString.call(bob)); // '[object Object]'

// The lookup finds Person.prototype.toString first
// If we want the original, we need to call it explicitly
```

**Checking the Prototype Chain:**

```javascript
function Animal(name) {
  this.name = name;
}

const dog = new Animal('Dog');

// Various ways to check prototypes
console.log(dog.__proto__ === Animal.prototype); // true
console.log(Object.getPrototypeOf(dog) === Animal.prototype); // true
console.log(Animal.prototype.isPrototypeOf(dog)); // true
console.log(dog instanceof Animal); // true

// Checking Object.prototype
console.log(Object.prototype.isPrototypeOf(dog)); // true
console.log(dog instanceof Object); // true
```

### Constructor Functions

Constructor functions are regular functions used with the `new` keyword to create objects with shared behavior.

**Basic Constructor Function:**

```javascript
function Person(name, age) {
  // 'this' refers to the new object being created
  this.name = name;
  this.age = age;
}

// Add methods to the prototype (shared by all instances)
Person.prototype.greet = function() {
  console.log('Hello, my name is ' + this.name);
};

Person.prototype.getAge = function() {
  return this.age;
};

// Create instances
const alice = new Person('Alice', 30);
const bob = new Person('Bob', 25);

alice.greet(); // "Hello, my name is Alice"
bob.greet(); // "Hello, my name is Bob"

// Methods are shared (same reference)
console.log(alice.greet === bob.greet); // true

// Properties are separate (different values)
console.log(alice.name === bob.name); // false
```

**Why Use Prototype for Methods:**

```javascript
// BAD: Methods in constructor (created for each instance)
function PersonBad(name) {
  this.name = name;
  this.greet = function() {
    console.log('Hello, ' + this.name);
  };
}

const p1 = new PersonBad('Alice');
const p2 = new PersonBad('Bob');

console.log(p1.greet === p2.greet); // false (separate functions!)
// Each instance has its own copy of greet - memory waste!

// GOOD: Methods on prototype (shared by all instances)
function PersonGood(name) {
  this.name = name;
}

PersonGood.prototype.greet = function() {
  console.log('Hello, ' + this.name);
};

const p3 = new PersonGood('Alice');
const p4 = new PersonGood('Bob');

console.log(p3.greet === p4.greet); // true (same function!)
// All instances share the same method - memory efficient!
```

**Constructor Property:**

```javascript
function Animal(name) {
  this.name = name;
}

const cat = new Animal('Cat');

// Every prototype has a constructor property
console.log(Animal.prototype.constructor === Animal); // true

// Instances inherit this through the prototype chain
console.log(cat.constructor === Animal); // true

// Can use it to create new instances
const dog = new cat.constructor('Dog');
console.log(dog.name); // 'Dog'
console.log(dog instanceof Animal); // true
```

**Constructor Patterns:**

```javascript
// 1. Basic constructor
function Car(make, model) {
  this.make = make;
  this.model = model;
}

Car.prototype.getInfo = function() {
  return this.make + ' ' + this.model;
};

// 2. Constructor with validation
function Person(name, age) {
  if (!(this instanceof Person)) {
    return new Person(name, age); // Allow calling without 'new'
  }
  
  if (typeof name !== 'string') {
    throw new TypeError('Name must be a string');
  }
  
  this.name = name;
  this.age = age;
}

// 3. Constructor with private variables (closure)
function BankAccount(initialBalance) {
  let balance = initialBalance; // Private variable
  
  this.deposit = function(amount) {
    balance += amount;
    return balance;
  };
  
  this.withdraw = function(amount) {
    if (amount > balance) {
      throw new Error('Insufficient funds');
    }
    balance -= amount;
    return balance;
  };
  
  this.getBalance = function() {
    return balance;
  };
}

const account = new BankAccount(1000);
console.log(account.getBalance()); // 1000
account.deposit(500); // 1500
console.log(account.balance); // undefined (private!)

// 4. Constructor with static methods
function MathUtils() {}

MathUtils.add = function(a, b) {
  return a + b;
};

MathUtils.multiply = function(a, b) {
  return a * b;
};

console.log(MathUtils.add(5, 3)); // 8
// Static methods belong to the constructor, not instances
```

### `new` Operator Mechanism

Understanding what happens when you use the `new` keyword is essential for mastering JavaScript's object creation.

**What `new` Does (Step by Step):**

```javascript
function Person(name, age) {
  // Before this line, 'new' does the following:
  // 1. Creates a new empty object
  // 2. Sets the object's [[Prototype]] to Person.prototype
  // 3. Binds 'this' to the new object
  
  this.name = name;
  this.age = age;
  
  // After this line, 'new' does:
  // 4. Returns 'this' (the new object) unless function returns an object
}

const alice = new Person('Alice', 30);
```

**Manual Implementation of `new`:**

```javascript
function myNew(constructor, ...args) {
  // Step 1: Create a new empty object
  const obj = {};
  
  // Step 2: Set the prototype
  Object.setPrototypeOf(obj, constructor.prototype);
  // Or: obj.__proto__ = constructor.prototype;
  
  // Step 3: Call constructor with the new object as 'this'
  const result = constructor.apply(obj, args);
  
  // Step 4: Return the object (or constructor's return value if it's an object)
  return (typeof result === 'object' && result !== null) ? result : obj;
}

// Test the implementation
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  console.log('Hello, I am ' + this.name);
};

const bob = myNew(Person, 'Bob', 25);
bob.greet(); // "Hello, I am Bob"
console.log(bob instanceof Person); // true
```

**Step-by-Step Visualization:**

```javascript
function Animal(name) {
  this.name = name;
  this.energy = 100;
}

Animal.prototype.eat = function() {
  this.energy += 10;
};

// When you write: const dog = new Animal('Dog');

// Step 1: Create empty object
// let dog = {};

// Step 2: Set prototype link
// dog.__proto__ = Animal.prototype;
// Now: dog → Animal.prototype → Object.prototype → null

// Step 3: Execute constructor with 'this' = dog
// Animal.call(dog, 'Dog');
// Now: dog = { name: 'Dog', energy: 100 }

// Step 4: Return the object
// return dog;

const dog = new Animal('Dog');
console.log(dog.name); // 'Dog'
console.log(dog.energy); // 100
dog.eat(); // Works because of prototype chain
console.log(dog.energy); // 110
```

**Return Value Behavior:**

```javascript
// 1. No return statement (implicit return of 'this')
function Person1(name) {
  this.name = name;
  // implicit: return this;
}

const p1 = new Person1('Alice');
console.log(p1); // Person1 { name: 'Alice' }

// 2. Return primitive value (ignored)
function Person2(name) {
  this.name = name;
  return 42; // Ignored!
}

const p2 = new Person2('Bob');
console.log(p2); // Person2 { name: 'Bob' }

// 3. Return object (overrides default behavior)
function Person3(name) {
  this.name = name;
  return { custom: 'object' }; // This is returned instead!
}

const p3 = new Person3('Charlie');
console.log(p3); // { custom: 'object' }
console.log(p3 instanceof Person3); // false

// 4. Return null (treated as primitive, ignored)
function Person4(name) {
  this.name = name;
  return null; // Ignored!
}

const p4 = new Person4('Diana');
console.log(p4); // Person4 { name: 'Diana' }
```

**Common Mistakes:**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  console.log('Hello, ' + this.name);
};

// Mistake 1: Forgetting 'new'
const wrong = Person('Alice'); // Returns undefined
console.log(wrong); // undefined
console.log(window.name); // 'Alice' (in non-strict mode - pollutes global!)

// Mistake 2: Using arrow function as constructor
const ArrowPerson = (name) => {
  this.name = name; // Error!
};

// const p = new ArrowPerson('Bob'); // TypeError: ArrowPerson is not a constructor

// Mistake 3: Returning wrong value
function BadConstructor() {
  this.value = 42;
  return 'string'; // Ignored, but confusing
}

const bad = new BadConstructor();
console.log(bad); // BadConstructor { value: 42 }
```

**Safety Pattern:**

```javascript
function SafePerson(name) {
  // Check if called with 'new'
  if (!(this instanceof SafePerson)) {
    return new SafePerson(name); // Call it correctly
  }
  
  this.name = name;
}

// Works both ways
const alice = new SafePerson('Alice');
const bob = SafePerson('Bob'); // Automatically uses 'new'

console.log(alice instanceof SafePerson); // true
console.log(bob instanceof SafePerson); // true
```

### Understanding the Prototype Chain Visually

Visualizing the prototype chain helps understand JavaScript's inheritance model.

**Simple Chain:**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
};

const dog = new Animal('Dog');

/*
Visual representation:

dog (instance object)
  {
    name: 'Dog'
    __proto__: → Animal.prototype
  }
                ↓
        Animal.prototype (object)
          {
            eat: function() {...}
            constructor: Animal
            __proto__: → Object.prototype
          }
                        ↓
                Object.prototype (object)
                  {
                    toString: function() {...}
                    hasOwnProperty: function() {...}
                    ... other methods
                    __proto__: null
                  }
                                ↓
                              null (end of chain)

Chain: dog → Animal.prototype → Object.prototype → null
*/

// Verify the chain
console.log(dog.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

**Multi-Level Chain:**

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.breathe = function() {
  console.log(this.name + ' is breathing');
};

function Mammal(name, furColor) {
  Animal.call(this, name);
  this.furColor = furColor;
}

Mammal.prototype = Object.create(Animal.prototype);
Mammal.prototype.constructor = Mammal;

Mammal.prototype.produceMilk = function() {
  console.log(this.name + ' is producing milk');
};

function Dog(name, furColor, breed) {
  Mammal.call(this, name, furColor);
  this.breed = breed;
}

Dog.prototype = Object.create(Mammal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function() {
  console.log(this.name + ' is barking: Woof!');
};

const max = new Dog('Max', 'brown', 'Labrador');

/*
Visual representation:

max (instance)
  {
    name: 'Max'
    furColor: 'brown'
    breed: 'Labrador'
    __proto__: → Dog.prototype
  }
                ↓
        Dog.prototype
          {
            bark: function() {...}
            constructor: Dog
            __proto__: → Mammal.prototype
          }
                        ↓
                Mammal.prototype
                  {
                    produceMilk: function() {...}
                    constructor: Mammal
                    __proto__: → Animal.prototype
                  }
                                ↓
                        Animal.prototype
                          {
                            breathe: function() {...}
                            constructor: Animal
                            __proto__: → Object.prototype
                          }
                                        ↓
                                Object.prototype
                                  {
                                    toString: function() {...}
                                    ... other methods
                                    __proto__: null
                                  }
                                                ↓
                                              null

Chain: max → Dog.prototype → Mammal.prototype → Animal.prototype → Object.prototype → null
*/

// Verify the chain
console.log(max.__proto__ === Dog.prototype); // true
console.log(Dog.prototype.__proto__ === Mammal.prototype); // true
console.log(Mammal.prototype.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true

// All methods are accessible
max.bark(); // "Max is barking: Woof!"
max.produceMilk(); // "Max is producing milk"
max.breathe(); // "Max is breathing"
max.toString(); // "[object Object]"
```

**Property Lookup Visualization:**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = 'Human';
Person.prototype.greet = function() {
  return 'Hello';
};

const alice = new Person('Alice');

// When accessing: alice.name
/*
Lookup path:
1. Check alice object itself
   ✓ FOUND: { name: 'Alice' }
   STOP and return 'Alice'
*/

// When accessing: alice.species
/*
Lookup path:
1. Check alice object itself
   ✗ Not found
2. Follow __proto__ to Person.prototype
   ✓ FOUND: { species: 'Human' }
   STOP and return 'Human'
*/

// When accessing: alice.toString
/*
Lookup path:
1. Check alice object itself
   ✗ Not found
2. Follow __proto__ to Person.prototype
   ✗ Not found
3. Follow __proto__ to Object.prototype
   ✓ FOUND: { toString: function() {...} }
   STOP and return function
*/

// When accessing: alice.nonExistent
/*
Lookup path:
1. Check alice object itself
   ✗ Not found
2. Follow __proto__ to Person.prototype
   ✗ Not found
3. Follow __proto__ to Object.prototype
   ✗ Not found
4. Reach null (end of chain)
   STOP and return undefined
*/
```

---


## 5.2 Prototypal Inheritance

Prototypal inheritance is JavaScript's mechanism for creating object hierarchies where objects inherit properties and methods from other objects through the prototype chain.

### Setting Up Inheritance

There are multiple patterns for establishing inheritance relationships between constructor functions.

**Basic Inheritance Setup:**

```javascript
// Parent constructor
function Animal(name) {
  this.name = name;
  this.energy = 100;
}

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
  this.energy += 10;
};

Animal.prototype.sleep = function() {
  console.log(this.name + ' is sleeping');
  this.energy = 100;
};

// Child constructor
function Dog(name, breed) {
  // Call parent constructor to initialize parent properties
  Animal.call(this, name);
  this.breed = breed;
}

// Set up prototype chain
Dog.prototype = Object.create(Animal.prototype);

// Restore constructor reference
Dog.prototype.constructor = Dog;

// Add child-specific methods
Dog.prototype.bark = function() {
  console.log(this.name + ' says: Woof!');
};

// Create instance
const buddy = new Dog('Buddy', 'Golden Retriever');

buddy.eat(); // "Buddy is eating" (inherited)
buddy.bark(); // "Buddy says: Woof!" (own method)
console.log(buddy.breed); // 'Golden Retriever' (own property)
console.log(buddy.energy); // 110 (parent property)
```

**Why Each Step Matters:**

```javascript
function Parent(value) {
  this.value = value;
}

Parent.prototype.getValue = function() {
  return this.value;
};

function Child(value, extra) {
  // Step 1: Call parent constructor
  Parent.call(this, value);
  // Without this, child instances won't have parent properties
  this.extra = extra;
}

// WRONG: Direct assignment breaks prototype chain
// Child.prototype = Parent.prototype; // Don't do this!
// Problem: Changes to Child.prototype affect Parent.prototype

// WRONG: Using new without arguments
// Child.prototype = new Parent(); // Don't do this either!
// Problems:
// 1. Parent constructor runs with undefined arguments
// 2. Parent properties end up on prototype, not instances
// 3. Parent constructor might have side effects

// RIGHT: Use Object.create
Child.prototype = Object.create(Parent.prototype);
// This creates a new object that inherits from Parent.prototype
// without calling the Parent constructor

// Step 2: Restore constructor
Child.prototype.constructor = Child;
// Without this, Child instances report Parent as their constructor

// Demonstrate the problems with wrong approaches:

// Wrong approach 1: Direct assignment
function WrongChild1() {}
WrongChild1.prototype = Parent.prototype;
WrongChild1.prototype.wrongMethod = function() { return 'Wrong!'; };

// Now Parent.prototype is polluted!
const parent = new Parent(5);
console.log(parent.wrongMethod); // function! (Shouldn't be there)

// Wrong approach 2: Using new
function WrongChild2() {}
WrongChild2.prototype = new Parent(10);

const wrong2 = new WrongChild2();
console.log(wrong2.value); // 10 (from prototype, not instance!)
wrong2.value = 20;
console.log(wrong2.value); // 20 (own property shadows prototype)

// Correct approach
const correct = new Child(5, 'extra');
console.log(correct.value); // 5 (own property from constructor)
console.log(correct.extra); // 'extra'
console.log(correct.getValue()); // 5 (inherited method)
```

**Complete Inheritance Pattern:**

```javascript
// Parent class
function Vehicle(make, model) {
  this.make = make;
  this.model = model;
  this.speed = 0;
}

Vehicle.prototype.accelerate = function(amount) {
  this.speed += amount;
  console.log(this.make + ' ' + this.model + ' accelerating to ' + this.speed);
};

Vehicle.prototype.brake = function(amount) {
  this.speed = Math.max(0, this.speed - amount);
  console.log(this.make + ' ' + this.model + ' slowing to ' + this.speed);
};

// Child class
function Car(make, model, doors) {
  // 1. Call parent constructor
  Vehicle.call(this, make, model);
  
  // 2. Add child-specific properties
  this.doors = doors;
  this.fuelType = 'gasoline';
}

// 3. Set up prototype chain
Car.prototype = Object.create(Vehicle.prototype);

// 4. Restore constructor
Car.prototype.constructor = Car;

// 5. Add child-specific methods
Car.prototype.openTrunk = function() {
  console.log('Opening trunk of ' + this.make + ' ' + this.model);
};

// 6. Override parent methods if needed
Car.prototype.accelerate = function(amount) {
  // Call parent method
  Vehicle.prototype.accelerate.call(this, amount);
  // Add child-specific behavior
  console.log('Engine roaring!');
};

// Create instance
const myCar = new Car('Toyota', 'Camry', 4);

myCar.accelerate(20);
// "Toyota Camry accelerating to 20"
// "Engine roaring!"

myCar.openTrunk();
// "Opening trunk of Toyota Camry"

console.log(myCar instanceof Car); // true
console.log(myCar instanceof Vehicle); // true
console.log(myCar instanceof Object); // true
```

### `Object.create()` for Inheritance

`Object.create()` is the modern, preferred way to set up prototypal inheritance. It creates a new object with a specified prototype.

**Basic Usage:**

```javascript
// Create a parent object
const animal = {
  type: 'Animal',
  eat: function() {
    console.log(this.name + ' is eating');
  },
  sleep: function() {
    console.log(this.name + ' is sleeping');
  }
};

// Create a child object that inherits from animal
const dog = Object.create(animal);
dog.name = 'Buddy';
dog.breed = 'Golden Retriever';
dog.bark = function() {
  console.log('Woof!');
};

// dog inherits from animal
dog.eat(); // "Buddy is eating" (inherited)
dog.bark(); // "Woof!" (own method)

console.log(dog.type); // 'Animal' (inherited)
console.log(dog.name); // 'Buddy' (own property)

// Verify prototype chain
console.log(Object.getPrototypeOf(dog) === animal); // true
```

**Object.create() with Property Descriptors:**

```javascript
const person = {
  greet: function() {
    console.log('Hello, I am ' + this.name);
  }
};

// Create object with specific property descriptors
const employee = Object.create(person, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  employeeId: {
    value: 'E12345',
    writable: false,
    enumerable: true,
    configurable: false
  },
  salary: {
    value: 50000,
    writable: true,
    enumerable: false, // Won't show in for...in
    configurable: true
  }
});

employee.greet(); // "Hello, I am Alice"
console.log(employee.employeeId); // 'E12345'
// employee.employeeId = 'E99999'; // Won't work (not writable)

for (let key in employee) {
  console.log(key); // Only 'name' and 'employeeId' (salary not enumerable)
}
```

**Factory Pattern with Object.create():**

```javascript
// Factory function for creating animals
function createAnimal(name, species) {
  // Define the prototype
  const animalPrototype = {
    eat: function() {
      console.log(this.name + ' is eating');
      this.hunger -= 20;
    },
    sleep: function() {
      console.log(this.name + ' is sleeping');
      this.energy = 100;
    },
    getStatus: function() {
      return this.name + ' - Energy: ' + this.energy + ', Hunger: ' + this.hunger;
    }
  };
  
  // Create new object with the prototype
  const animal = Object.create(animalPrototype);
  
  // Add properties
  animal.name = name;
  animal.species = species;
  animal.energy = 100;
  animal.hunger = 50;
  
  return animal;
}

const lion = createAnimal('Leo', 'Lion');
const elephant = createAnimal('Dumbo', 'Elephant');

lion.eat(); // "Leo is eating"
console.log(lion.getStatus()); // "Leo - Energy: 100, Hunger: 30"

// They share the same prototype
console.log(Object.getPrototypeOf(lion) === Object.getPrototypeOf(elephant)); // true
```

**Inheritance Chain with Object.create():**

```javascript
// Level 1: Base object
const livingThing = {
  breathe: function() {
    console.log(this.name + ' is breathing');
  }
};

// Level 2: Animal inherits from LivingThing
const animal = Object.create(livingThing);
animal.eat = function() {
  console.log(this.name + ' is eating');
};

// Level 3: Mammal inherits from Animal
const mammal = Object.create(animal);
mammal.produceMilk = function() {
  console.log(this.name + ' is producing milk');
};

// Level 4: Dog inherits from Mammal
const dog = Object.create(mammal);
dog.name = 'Buddy';
dog.breed = 'Labrador';
dog.bark = function() {
  console.log('Woof!');
};

// All methods are accessible through the chain
dog.bark(); // "Woof!" (own)
dog.produceMilk(); // "Buddy is producing milk" (from mammal)
dog.eat(); // "Buddy is eating" (from animal)
dog.breathe(); // "Buddy is breathing" (from livingThing)

// Verify the chain
console.log(Object.getPrototypeOf(dog) === mammal); // true
console.log(Object.getPrototypeOf(mammal) === animal); // true
console.log(Object.getPrototypeOf(animal) === livingThing); // true
console.log(Object.getPrototypeOf(livingThing) === Object.prototype); // true
```

**Object.create(null) - Creating Dictionary Objects:**

```javascript
// Create object with no prototype (truly empty)
const dictionary = Object.create(null);

// No inherited properties or methods
console.log(dictionary.toString); // undefined
console.log(dictionary.hasOwnProperty); // undefined
console.log(dictionary.__proto__); // undefined

// Perfect for storing data without prototype pollution
dictionary['toString'] = 'my value'; // Safe! No conflict with Object.prototype.toString
dictionary['__proto__'] = 'another value'; // Also safe!

console.log(dictionary['toString']); // 'my value'
console.log(dictionary['__proto__']); // 'another value'

// Use case: Configuration objects
const config = Object.create(null);
config.apiUrl = 'https://api.example.com';
config.timeout = 5000;
config.retries = 3;

// No risk of accidentally accessing prototype methods
console.log('toString' in config); // false
console.log('hasOwnProperty' in config); // false

// Regular object for comparison
const normalObj = {};
console.log('toString' in normalObj); // true
console.log('hasOwnProperty' in normalObj); // true
```

### Constructor Stealing

Constructor stealing (also called constructor borrowing) is a technique where a child constructor calls the parent constructor to inherit properties.

**Basic Constructor Stealing:**

```javascript
function Parent(name, age) {
  this.name = name;
  this.age = age;
  this.friends = ['Alice', 'Bob'];
}

function Child(name, age, school) {
  // "Steal" Parent's properties by calling it with 'this'
  Parent.call(this, name, age);
  
  this.school = school;
}

const child1 = new Child('Charlie', 10, 'Elementary');
const child2 = new Child('Diana', 12, 'Middle School');

console.log(child1.name); // 'Charlie'
console.log(child1.friends); // ['Alice', 'Bob']

// Each child has its own copy of properties
child1.friends.push('Eve');
console.log(child1.friends); // ['Alice', 'Bob', 'Eve']
console.log(child2.friends); // ['Alice', 'Bob'] (unchanged!)

// Problem: No prototype chain, can't inherit methods
Parent.prototype.sayHello = function() {
  console.log('Hello from ' + this.name);
};

// child1.sayHello(); // Error: sayHello is not a function
```

**Why Constructor Stealing is Useful:**

```javascript
// Problem with pure prototypal inheritance
function Animal(name) {
  this.name = name;
  this.enemies = []; // Reference type
}

Animal.prototype.addEnemy = function(enemy) {
  this.enemies.push(enemy);
};

function Dog(name) {}
Dog.prototype = new Animal(); // Creates one instance with empty enemies array

const dog1 = new Dog('Buddy');
const dog2 = new Dog('Max');

dog1.addEnemy('Cat');

// Problem: enemies array is shared!
console.log(dog1.enemies); // ['Cat']
console.log(dog2.enemies); // ['Cat'] - Both share the same array!

// Solution: Constructor stealing
function BetterDog(name) {
  Animal.call(this, name); // Each instance gets its own properties
}

const dog3 = new BetterDog('Charlie');
const dog4 = new BetterDog('Duke');

dog3.enemies.push('Mailman');

console.log(dog3.enemies); // ['Mailman']
console.log(dog4.enemies); // [] - Separate arrays!
```

**Passing Arguments:**

```javascript
function Person(name, age, country) {
  this.name = name;
  this.age = age;
  this.country = country;
}

function Employee(name, age, country, department, salary) {
  // Steal Person properties
  Person.call(this, name, age, country);
  
  // Add Employee-specific properties
  this.department = department;
  this.salary = salary;
}

const emp = new Employee('Alice', 30, 'USA', 'Engineering', 80000);

console.log(emp.name); // 'Alice'
console.log(emp.department); // 'Engineering'
console.log(emp.salary); // 80000
```

### Combination Inheritance

Combination inheritance (also called pseudoclassical inheritance) combines constructor stealing with prototype chaining to get the benefits of both.

**Basic Combination Inheritance:**

```javascript
// Parent constructor
function Animal(name) {
  this.name = name;
  this.friends = []; // Instance property
}

// Parent methods on prototype
Animal.prototype.eat = function() {
  console.log(this.name + ' is eating');
};

Animal.prototype.addFriend = function(friend) {
  this.friends.push(friend);
};

// Child constructor
function Dog(name, breed) {
  // 1. Constructor stealing: inherit instance properties
  Animal.call(this, name);
  
  this.breed = breed;
}

// 2. Prototype chaining: inherit methods
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add child-specific methods
Dog.prototype.bark = function() {
  console.log(this.name + ' says: Woof!');
};

// Create instances
const dog1 = new Dog('Buddy', 'Golden Retriever');
const dog2 = new Dog('Max', 'Labrador');

// Each instance has own properties
dog1.addFriend('Charlie');
dog2.addFriend('Duke');

console.log(dog1.friends); // ['Charlie']
console.log(dog2.friends); // ['Duke'] (separate arrays!)

// Both inherit methods
dog1.eat(); // "Buddy is eating"
dog2.bark(); // "Max says: Woof!"
```

### Parasitic Inheritance

Parasitic inheritance is a pattern where you create an object, augment it with new properties/methods, and return it.

**Basic Parasitic Inheritance:**

```javascript
function createPerson(name, age) {
  // Start with a base object
  const person = {
    name: name,
    age: age
  };
  
  // Augment with methods
  person.sayHello = function() {
    console.log('Hello, I am ' + this.name);
  };
  
  person.getAge = function() {
    return this.age;
  };
  
  return person;
}

// Use the factory
const alice = createPerson('Alice', 30);
alice.sayHello(); // "Hello, I am Alice"

// Problem: Each instance gets new copies of methods (not shared)
const bob = createPerson('Bob', 25);
console.log(alice.sayHello === bob.sayHello); // false (different functions)
```

**Parasitic Combination Inheritance:**

This is the most efficient pattern, combining the benefits of combination inheritance while avoiding its main drawback (calling parent constructor twice).

```javascript
// Helper function for parasitic inheritance
function inheritPrototype(child, parent) {
  // Create object inheriting from parent prototype
  const prototype = Object.create(parent.prototype);
  
  // Restore constructor
  prototype.constructor = child;
  
  // Set as child's prototype
  child.prototype = prototype;
}

// Parent constructor
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.friends = [];
}

Person.prototype.sayHello = function() {
  console.log('Hello, I am ' + this.name);
};

// Child constructor
function Student(name, age, grade) {
  // Call parent constructor once (only place it's called)
  Person.call(this, name, age);
  
  this.grade = grade;
}

// Set up inheritance using helper
inheritPrototype(Student, Person);

// Add child methods
Student.prototype.study = function() {
  console.log(this.name + ' is studying');
};

const alice = new Student('Alice', 16, 11);
alice.sayHello(); // "Hello, I am Alice"
alice.study(); // "Alice is studying"

console.log(alice instanceof Student); // true
console.log(alice instanceof Person); // true
```

### Performance Implications

Understanding the performance characteristics of different inheritance patterns helps make informed decisions.

**Memory Usage:**

```javascript
// Approach 1: Methods in constructor (BAD for memory)
function PersonBad(name) {
  this.name = name;
  
  // Each instance gets its own copy of these functions
  this.sayHello = function() {
    console.log('Hello, ' + this.name);
  };
  
  this.sayGoodbye = function() {
    console.log('Goodbye, ' + this.name);
  };
}

// Approach 2: Methods on prototype (GOOD for memory)
function PersonGood(name) {
  this.name = name;
}

PersonGood.prototype.sayHello = function() {
  console.log('Hello, ' + this.name);
};

PersonGood.prototype.sayGoodbye = function() {
  console.log('Goodbye, ' + this.name);
};

// Memory comparison
const badPeople = [];
const goodPeople = [];

for (let i = 0; i < 1000; i++) {
  badPeople.push(new PersonBad('Person' + i));
  goodPeople.push(new PersonGood('Person' + i));
}

// badPeople: 1000 instances × 2 methods = 2000 function objects
// goodPeople: 1000 instances + 2 shared methods = 1002 function objects

// Check memory (methods are not shared in bad approach)
console.log(badPeople[0].sayHello === badPeople[1].sayHello); // false
console.log(goodPeople[0].sayHello === goodPeople[1].sayHello); // true
```

**Lookup Performance:**

```javascript
// Shallow prototype chain (FAST)
function FastClass() {
  this.value = 42;
}

FastClass.prototype.getValue = function() {
  return this.value;
};

const fast = new FastClass();

// Deep prototype chain (SLOWER)
function Level1() { this.value = 42; }
Level1.prototype.method1 = function() {};

function Level2() {}
Level2.prototype = Object.create(Level1.prototype);
Level2.prototype.method2 = function() {};

function Level3() {}
Level3.prototype = Object.create(Level2.prototype);
Level3.prototype.method3 = function() {};

function Level4() {}
Level4.prototype = Object.create(Level3.prototype);
Level4.prototype.method4 = function() {};

const deep = new Level4();

// Accessing method1 requires traversing the entire chain
// fast.getValue() → one lookup
// deep.method1() → four lookups (Level4 → Level3 → Level2 → Level1)
```

---

## 5.3 Property Inheritance

Property inheritance determines how properties are accessed and distinguished between an object's own properties and those inherited through the prototype chain.

### Own Properties vs Inherited Properties

JavaScript distinguishes between properties defined directly on an object (own properties) and properties inherited from the prototype chain.

**Understanding Own Properties:**

```javascript
function Person(name, age) {
  this.name = name; // Own property
  this.age = age;   // Own property
}

Person.prototype.species = 'Human'; // Inherited property

Person.prototype.greet = function() { // Inherited property (method)
  console.log('Hello, I am ' + this.name);
};

const alice = new Person('Alice', 30);

// Own properties (defined on instance)
console.log(alice.name); // 'Alice' (own)
console.log(alice.age);  // 30 (own)

// Inherited properties (from prototype)
console.log(alice.species); // 'Human' (inherited)
console.log(typeof alice.greet); // 'function' (inherited)

// Check where properties come from
console.log(alice.hasOwnProperty('name'));    // true
console.log(alice.hasOwnProperty('age'));     // true
console.log(alice.hasOwnProperty('species')); // false (inherited)
console.log(alice.hasOwnProperty('greet'));   // false (inherited)
```

### `hasOwnProperty()`

The `hasOwnProperty()` method determines whether an object has a property as its own (not inherited).

**Basic Usage:**

```javascript
const obj = {
  ownProp: 'I am own',
  anotherOwn: 42
};

console.log(obj.hasOwnProperty('ownProp'));      // true
console.log(obj.hasOwnProperty('anotherOwn'));   // true
console.log(obj.hasOwnProperty('toString'));     // false (inherited from Object.prototype)
console.log(obj.hasOwnProperty('nonExistent'));  // false
```

### `Object.hasOwn()`

`Object.hasOwn()` is a modern alternative to `hasOwnProperty()` introduced in ES2022, providing a more reliable way to check for own properties.

**Basic Usage:**

```javascript
const obj = {
  name: 'Alice',
  age: 30
};

// Modern way (ES2022+)
console.log(Object.hasOwn(obj, 'name')); // true
console.log(Object.hasOwn(obj, 'age'));  // true
console.log(Object.hasOwn(obj, 'toString')); // false

// Old way (still works)
console.log(obj.hasOwnProperty('name')); // true
```

### Property Enumeration and Inheritance

Different methods enumerate properties differently, especially regarding inherited properties.

**Enumeration Methods Comparison:**

```javascript
function Parent(x) {
  this.x = x;
}

Parent.prototype.parentMethod = function() {};

function Child(x, y) {
  Parent.call(this, x);
  this.y = y;
}

Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
Child.prototype.childMethod = function() {};

const obj = new Child(1, 2);
obj.z = 3;

// Non-enumerable property
Object.defineProperty(obj, 'hidden', {
  value: 'secret',
  enumerable: false
});

console.log('=== for...in (enumerable own + inherited) ===');
for (let key in obj) {
  console.log(key);
}
// Output: x, y, z, parentMethod, childMethod

console.log('\n=== Object.keys (enumerable own only) ===');
console.log(Object.keys(obj));
// Output: ['x', 'y', 'z']

console.log('\n=== Object.getOwnPropertyNames (all own, including non-enumerable) ===');
console.log(Object.getOwnPropertyNames(obj));
// Output: ['x', 'y', 'z', 'hidden']
```

### Shadowing Properties

Property shadowing occurs when an object has an own property with the same name as an inherited property, effectively hiding the inherited property.

**Basic Shadowing:**

```javascript
function Person() {}
Person.prototype.name = 'Default Name';

const alice = new Person();

// Access prototype property
console.log(alice.name); // 'Default Name'
console.log(alice.hasOwnProperty('name')); // false

// Create own property (shadows prototype)
alice.name = 'Alice';

console.log(alice.name); // 'Alice' (own property)
console.log(alice.hasOwnProperty('name')); // true

// Prototype property is unchanged
console.log(Person.prototype.name); // 'Default Name'

// Other instances still use prototype
const bob = new Person();
console.log(bob.name); // 'Default Name'

// Delete own property to reveal prototype property
delete alice.name;
console.log(alice.name); // 'Default Name' (back to prototype)
console.log(alice.hasOwnProperty('name')); // false
```

---


## 5.4 Prototypes Summary

| Concept | Key Points |
|---------|------------|
| **`[[Prototype]]`** | Internal link; accessed via `__proto__` or `Object.getPrototypeOf()` |
| **Prototype Chain** | Property lookup walks up the chain |
| **`Object.create()`** | Create object with specified prototype |
| **`Object.setPrototypeOf()`** | Change prototype (performance cost) |
| **Property Shadowing** | Own properties shadow inherited ones |
| **`hasOwnProperty()`** | Check if property is own (not inherited) |

### Best Practices

1. **Prefer `class` syntax** for cleaner inheritance
2. **Use `Object.create(null)`** for dictionary objects
3. **Avoid modifying built-in prototypes**
4. **Use `Object.hasOwn()`** (ES2022) over `hasOwnProperty()`

---

**End of Chapter 5: Prototypes**

With prototypes understood, classes become a natural next step.
