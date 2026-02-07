# 5.1 Prototype Chain

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

