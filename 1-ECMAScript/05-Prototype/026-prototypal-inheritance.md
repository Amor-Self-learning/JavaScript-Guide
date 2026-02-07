# 5.2 Prototypal Inheritance

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
